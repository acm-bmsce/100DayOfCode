import { Hono, Context } from 'hono' // <-- 1. Context is imported
import { cors } from 'hono/cors'
import { fetchUserSubmissions } from './api'

// Define the Hono app with types for Cloudflare environment
type Env = {
  Bindings: {
    DB: D1Database
    ADMIN_PASSWORD: string
    // Secrets for the GitHub trigger
    GITHUB_TOKEN: string
    GITHUB_REPO_OWNER: string
    GITHUB_REPO_NAME: string
  }
}
const app = new Hono<Env>()

// Add CORS middleware to allow requests from your frontend
app.use('/*', cors({
  origin: '*', // For production, restrict this to your Pages URL
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'] // Allow Auth header
}))

// Admin Auth middleware
function requireAdmin(c: Context) { // <-- 2. Used Context directly
  const auth = c.req.header('Authorization') || '';
  if (auth !== `Bearer ${c.env.ADMIN_PASSWORD}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return null;
}

// --- Helper Types ---
type Problem = {
  id: number
  question_name: string
  points: number
  link: string
  day: number
  isPublic: number
}

// --- USER ROUTES ---

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


// --- CRON JOB & STATE ROUTES (NEW) ---

// NEW: For the cron job to find which day to work on
// Needs to be authenticated so only our script can see it.
app.get('/api/admin/get-processing-day', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;

  const stmt = c.env.DB.prepare(
    "SELECT value FROM Settings WHERE key = 'processing_day'"
  );
  const result = await stmt.first<{ value: string }>();
  
  if (result) {
    return c.json({ day: result.value }); // Will be '0', '5', etc.
  } else {
    // Failsafe in case table is empty or key not found
    return c.json({ day: '0' }); 
  }
});

// NEW: For the script to report when a job is finished
app.post('/api/admin/complete-job', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;

  const stmt = c.env.DB.prepare(
    "UPDATE Settings SET value = '0' WHERE key = 'processing_day'"
  );
  await stmt.run();
  
  return c.json({ success: true, message: 'Job state set to STOPPED' });
});


// --- ADMIN ROUTES ---

// 4. Admin Login (No auth check here)
app.post('/api/login/admin', async (c) => {
  const { password } = await c.req.json()
  if (password === c.env.ADMIN_PASSWORD) {
    return c.json({ success: true, isAdmin: true })
  } else {
    return c.json({ error: 'Invalid password' }, 401)
  }
})

// MODIFIED: This route now ALSO sets the state in the DB
app.post('/api/admin/trigger-workflow', async (c) => {
  // 1. Check admin auth
  const authError = requireAdmin(c);
  if (authError) return authError;

  // 2. Get day from frontend
  const { day } = await c.req.json<{ day: string }>();
  if (!day) {
    return c.json({ error: 'Day is required' }, 400);
  }

  // 3. SET THE STATE IN THE DATABASE
  try {
    const stmt = c.env.DB.prepare(
      "UPDATE Settings SET value = ? WHERE key = 'processing_day'"
    );
    await stmt.bind(day.toString()).run();
  } catch (err: any) {
    console.error('Failed to set job state:', err.message);
    return c.json({ error: 'Failed to set job state' }, 500);
  }
  
  // 4. Get secrets for GitHub
  const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = c.env;
  if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
    return c.json({ error: 'GitHub trigger is not configured on server' }, 500);
  }

  // 5. Call GitHub API to dispatch workflow
  const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/actions/workflows/hourly-update.yml/dispatches`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Cloudflare-Worker' // GitHub API requires this
      },
      body: JSON.stringify({
        ref: 'main', // <-- IMPORTANT: Change this if your main branch isn't 'main'
        inputs: {
          day: day.toString() 
        }
      })
    });

    if (res.status === 204) {
      return c.json({ success: true, message: `Workflow triggered for day ${day}` });
    } else {
      const errorData = await res.text();
      console.error('GitHub API error:', errorData);
      return c.json({ error: `Failed to trigger workflow. Status: ${res.status}` }, 500);
    }
  } catch (err: any) {
    console.error('Fetch error triggering workflow:', err.message);
    return c.json({ error: err.message }, 500);
  }
});

// 5. Get All Users
app.get('/api/admin/users', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;

  const stmt = c.env.DB.prepare('SELECT username FROM Users')
  const { results } = await stmt.all()
  return c.json(results)
})

// 6. Publish a Day's Problems
app.post('/api/admin/publish-day', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;

  const { day } = await c.req.json()
  if (!day) return c.json({ error: 'Day required' }, 400)

  const stmt = c.env.DB.prepare('UPDATE Problems SET isPublic = 1 WHERE day = ?')
  await stmt.bind(day).run()
  return c.json({ success: true, message: `Day ${day} published` })
})

// 7. Update a single user's score (called by the script)
app.post('/api/admin/update-user-score', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;
  
  const { username, day } = await c.req.json()
  if (!username || !day) return c.json({ error: 'Username and day required' }, 400)

  try {
    // 1. Get problems for the day
    const problemsStmt = c.env.DB.prepare('SELECT question_name, points FROM Problems WHERE day = ? AND isPublic = 1')
    const { results: dayProblems } = await problemsStmt.bind(day).all<Problem>()
    
    if (!dayProblems || dayProblems.length === 0) {
      return c.json({ error: `No problems found for day ${day}` }, 404)
    }

    // 2. Get user's solved list (from REAL API)
    const solvedProblemsSet = await fetchUserSubmissions(username)

    // 3. Calculate score for the day
    let points_earned_for_day = 0
    let problems_solved_for_day = 0
    
    for (const problem of dayProblems) {
      if (solvedProblemsSet.has(problem.question_name)) {
        points_earned_for_day += problem.points
        problems_solved_for_day += 1
      }
    }

    // 4. Get user's current score
    const currentScoreStmt = c.env.DB.prepare('SELECT points, streak FROM Leaderboard WHERE username = ?')
    const currentScore = await currentScoreStmt.bind(username).first<{ points: number, streak: number }>()

    if (!currentScore) {
      return c.json({ error: `No leaderboard entry for ${username}` }, 404)
    }

    // 5. Apply logic
    const solved_at_least_one = problems_solved_for_day > 0
    const new_points = currentScore.points + points_earned_for_day
    const new_streak = solved_at_least_one ? currentScore.streak + 1 : 0

    // 6. Update database
    const updateStmt = c.env.DB.prepare(
      'UPDATE Leaderboard SET points = ?, streak = ?, last_updated_for_day = ? WHERE username = ?'
    );
    await updateStmt.bind(new_points, new_streak, day, username).run();

    return c.json({ 
      success: true, 
      username,
      points_added: points_earned_for_day,
      new_streak
    })

  } catch (err: any) {
    console.error(`Failed to update ${username}: ${err.message}`)
    return c.json({ error: err.message }, 500)
  }
})

// 8. Get All Problems
app.get('/api/admin/all-problems', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;
  
  const stmt = c.env.DB.prepare('SELECT id, question_name, day, isPublic, solution_link, isSolutionPublic FROM Problems ORDER BY day, id');
  const { results } = await stmt.all();
  return c.json(results);
});

// 9. Add a new problem
app.post('/api/admin/add-problem', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;

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

// 10. Add a solution link
app.post('/api/admin/add-solution', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;

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

// 11. Get users that need processing (called by script)
app.get('/api/admin/users-to-process/:day', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;

  const day = c.req.param('day');
  if (!day) return c.json({ error: 'Day parameter is required' }, 400);

  try {
    const stmt = c.env.DB.prepare(
      'SELECT username FROM Leaderboard WHERE last_updated_for_day != ?'
    );
    const { results } = await stmt.bind(day).all<{ username: string }>();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 12. Publish solutions for a day
app.post('/api/admin/publish-solution', async (c) => {
  const authError = requireAdmin(c);
  if (authError) return authError;

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