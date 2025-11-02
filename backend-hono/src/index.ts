import { Hono } from 'hono'
import { cors } from 'hono/cors'
// REMOVED: import { fetchUserSubmissions } from './api' (No longer used)

// Define the Hono app with types for Cloudflare environment
type Env = {
  Bindings: {
    DB: D1Database
    ADMIN_PASSWORD: string
  }
}
const app = new Hono<Env>()

// Add CORS middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// --- Helper Types & Constants ---
type Problem = {
  id: number
  question_name: string
  points: number
  link: string
  day: number
  isPublic: number
}
type CommitScoreBody = {
    username: string;
    day_processed: number;
    new_points: number;
    new_streak: number;
};

// --- USER ROUTES (Unchanged) ---

// 1. User Login
app.post('/api/login/user', async (c) => {
  const { username } = await c.req.json()
  if (!username) return c.json({ error: 'Username required' }, 400)

  const stmt = c.env.DB.prepare('SELECT * FROM Users WHERE username = ?')
  const user = await stmt.bind(username).first()

  if (user) {
    return c.json({ success: true, username: user.username, name: user.name })
  } else {
    return c.json({ error: 'User not found' }, 404)
  }
})

// 2. Get Public Problems
app.get('/api/problems', async (c) => {
  const stmt = c.env.DB.prepare('SELECT * FROM Problems WHERE isPublic = 1 ORDER BY day')
  const { results } = await stmt.all()
  return c.json(results)
})

// 3. Get Leaderboard
app.get('/api/leaderboard', async (c) => {
  const stmt = c.env.DB.prepare('SELECT username, points, streak FROM Leaderboard ORDER BY streak DESC, points DESC')
  const { results } = await stmt.all()
  return c.json(results)
})

// 4. Get Current Active Day (Highest Published Day)
app.get('/api/daily/current-day', async (c) => {
  try {
    const stmt = c.env.DB.prepare('SELECT MAX(day) as currentDay FROM Problems WHERE isPublic = 1');
    const result = await stmt.first<{ currentDay: number }>();

    if (!result) {
        return c.json({ currentDay: 0 });
    }
    
    const currentDay = result.currentDay || 0;
    
    return c.json({ currentDay: currentDay });
    
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// --- NEW/MODIFIED AUTOMATION ROUTES ---

// 5. Get Problems for Two Days (Used by Automation Script for Scoring)
app.get('/api/admin/problems-for-days/:day1/:day2', async (c) => {
    const day1 = c.req.param('day1');
    const day2 = c.req.param('day2');
    
    if (!day1 || !day2) return c.json({ error: 'Two days required' }, 400);

    // This handles both (N-1, N-2) and (N-1, N-1) cases
    const daysList = [...new Set([day1, day2])].join(',');
    
    // Fetch problem names and points for the two specific days
    const problemsStmt = c.env.DB.prepare(`SELECT question_name, points, day FROM Problems WHERE day IN (${daysList}) AND isPublic = 1`)
    const { results: dayProblems } = await problemsStmt.all<Problem>()
    
    if (!dayProblems || dayProblems.length === 0) {
      return c.json({ error: `No problems found for days ${day1} and ${day2}` }, 404);
    }
    
    return c.json(dayProblems);
});


// 6. Get Next Single User to Process (Rate-Limiter Helper)
app.get('/api/admin/next-user-to-process/:day', async (c) => {
  const day = c.req.param('day'); // This is N-1 (the day we are committing to)
  if (!day) return c.json({ error: 'Day parameter is required' }, 400);

  try {
    const dayInt = parseInt(day);
    
    // 1. Get the total remaining count (for logging)
    const totalRemainingStmt = c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM Leaderboard WHERE last_updated_for_day < ?'
    );
    const countResult = await totalRemainingStmt.bind(dayInt).first<{ count: number }>();
    const total_count = countResult ? countResult.count : 0; 
    
    if (total_count === 0) {
        return c.json({ username: null, total_remaining: 0 });
    }
    
    // 2. Find the single user whose score is behind the target commit day (N-1)
    const stmt = c.env.DB.prepare(
      'SELECT username FROM Leaderboard WHERE last_updated_for_day < ? LIMIT 1'
    );
    const user = await stmt.bind(dayInt).first<{ username: string }>();

    if (!user) { 
        return c.json({ username: null, total_remaining: 0 });
    }
    
    return c.json({ username: user.username, total_remaining: total_count });
    
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});


// 7. Commit Final Score (The Fast DB Update)
app.post('/api/admin/commit-score', async (c) => {
    // NOTE: In production, this route MUST be secured.
    const { username, day_processed, new_points, new_streak, total_remaining } = await c.req.json<CommitScoreBody & { total_remaining: number }>();

    if (!username || !day_processed || new_points === undefined || new_streak === undefined) {
        return c.json({ error: 'Missing required data for score commitment.' }, 400);
    }

    let runStatus = 'SUCCESS';
    let errorMessage = null;

    try {
        // --- CRITICAL FIX APPLIED HERE ---
        // This query now ADDs points and increments/resets the streak correctly.
        const updateStmt = c.env.DB.prepare(
            `UPDATE Leaderboard 
             SET 
                points = points + ?, 
                streak = CASE WHEN ? = 0 THEN 0 ELSE streak + 1 END, 
                last_updated_for_day = ? 
             WHERE username = ?`
        );
        // Note the bind order: new_streak is bound to the CASE statement
        await updateStmt.bind(new_points, new_streak, day_processed, username).run();
        // --- END FIX ---

        // Log the run
        const logStmt = c.env.DB.prepare(
            `INSERT INTO AutomationRuns (start_time, end_time, day_processed, users_processed, total_remaining, status, error_message)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        await logStmt.bind(
            Date.now(), Date.now(), day_processed, 1, total_remaining, runStatus, errorMessage
        ).run();

        return c.json({ success: true, message: `Score committed for ${username}` });

    } catch (e: any) {
        runStatus = 'FAILED';
        errorMessage = `DB Commit Failed: ${e.message}`;

        // Log the failure
        c.env.DB.prepare(
            `INSERT INTO AutomationRuns (start_time, end_time, day_processed, users_processed, total_remaining, status, error_message)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            Date.now(), Date.now(), day_processed, 0, total_remaining, runStatus, errorMessage
        ).run().catch((logErr: any) => console.error("Secondary Log Fail:", logErr.message));

        return c.json({ error: errorMessage }, 500);
    }
});

// --- ADMIN PANEL ROUTES (MERGED FROM ORIGINAL) ---

// 8. Admin Login
app.post('/api/login/admin', async (c) => {
  const { password } = await c.req.json()
  if (password === c.env.ADMIN_PASSWORD) {
    return c.json({ success: true, isAdmin: true })
  } else {
    return c.json({ error: 'Invalid password' }, 401)
  }
})

// 9. Get ALL problems (for the Admin panel)
app.get('/api/admin/all-problems', async (c) => {
  try {
    // TODO: Add proper admin auth check
    const stmt = c.env.DB.prepare('SELECT id, question_name, day, isPublic, solution_link, isSolutionPublic FROM Problems ORDER BY day, id');
    const { results } = await stmt.all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 10. Add New Problem
app.post('/api/admin/add-problem', async (c) => {
  // TODO: Add proper admin auth check
  const { question_name, points, link, day } = await c.req.json();

  if (!question_name || !points || !link || !day) {
    return c.json({ error: 'All fields are required' }, 400);
  }

  try {
    const stmt = c.env.DB.prepare(
      'INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES (?, ?, ?, ?, 0)'
    );
    await stmt.bind(question_name, points, link, day).run();
    
    return c.json({ success: true, message: `Added problem: ${question_name}` });
  
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A problem with this name already exists' }, 409);
    }
    return c.json({ error: e.message }, 500);
  }
});

// 11. Add/Update Solution Link
app.post('/api/admin/add-solution', async (c) => {
  // TODO: Add proper admin auth check
  const { problem_id, solution_link } = await c.req.json();

  if (!problem_id || !solution_link) {
    return c.json({ error: 'Problem ID and solution link are required' }, 400);
  }

  try {
    const stmt = c.env.DB.prepare(
      'UPDATE Problems SET solution_link = ? WHERE id = ?'
    );
    await stmt.bind(solution_link, problem_id).run();

    return c.json({ success: true, message: 'Solution link updated' });

  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 12. Publish a Day's Problems
app.post('/api/admin/publish-day', async (c) => {
  // TODO: Add proper admin auth check
  const { day } = await c.req.json()
  if (!day) return c.json({ error: 'Day required' }, 400)

  const stmt = c.env.DB.prepare('UPDATE Problems SET isPublic = 1 WHERE day = ?')
  await stmt.bind(day).run()
  return c.json({ success: true, message: `Day ${day} published` })
})

// 13. Publish a Day's Solutions
app.post('/api/admin/publish-solution', async (c) => {
  // TODO: Add proper admin auth check
  const { day } = await c.req.json();
  if (!day) {
    return c.json({ error: 'Day required' }, 400);
  }

  try {
    const stmt = c.env.DB.prepare(
      'UPDATE Problems SET isSolutionPublic = 1 WHERE day = ?'
    );
    await stmt.bind(day).run();
    
    return c.json({ success: true, message: `Solutions for day ${day} published` });
  
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default app