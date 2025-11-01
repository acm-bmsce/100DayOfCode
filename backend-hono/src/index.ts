import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { fetchUserSubmissions } from './api' // <-- Importing the REAL API function

// Define the Hono app with types for Cloudflare environment
type Env = {
  Bindings: {
    DB: D1Database
    ADMIN_PASSWORD: string
  }
}
const app = new Hono<Env>()

// Add CORS middleware to allow requests from your frontend
app.use('/*', cors({
  origin: '*', // Allow all origins. For production, restrict this to your Pages URL
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'] // Allow Auth header if needed
}))

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

// --- ADMIN ROUTES ---

// 4. Admin Login
app.post('/api/login/admin', async (c) => {
  const { password } = await c.req.json()
  if (password === c.env.ADMIN_PASSWORD) {
    return c.json({ success: true, isAdmin: true })
  } else {
    return c.json({ error: 'Invalid password' }, 401)
  }
})

// 5. Get All Users (for manual trigger)
app.get('/api/admin/users', async (c) => {
  // In a real app, you'd protect this route
  const stmt = c.env.DB.prepare('SELECT username FROM Users')
  const { results } = await stmt.all()
  return c.json(results)
})

// 6. Publish a Day's Problems
app.post('/api/admin/publish-day', async (c) => {
  const { day } = await c.req.json()
  if (!day) return c.json({ error: 'Day required' }, 400)

  const stmt = c.env.DB.prepare('UPDATE Problems SET isPublic = 1 WHERE day = ?')
  await stmt.bind(day).run()
  return c.json({ success: true, message: `Day ${day} published` })
})

// 7. THE MANUAL TRIGGER (Worker-side)
// This processes ONE user. The frontend loop calls this 1200 times.
app.post('/api/admin/update-user-score', async (c) => {
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

app.get('/api/admin/all-problems', async (c) => {
  // TODO: Add proper admin authentication check here in a real app
  const stmt = c.env.DB.prepare('SELECT id, question_name, day, isPublic, solution_link, isSolutionPublic FROM Problems ORDER BY day, id');
  const { results } = await stmt.all();
  return c.json(results);
});

app.get('/api/admin/all-users-details', async (c) => {
  // 1. Secure the endpoint

  try {
    // 2. Query for ALL user data
    const stmt = c.env.DB.prepare('SELECT id, username, name FROM Users');
    const { results } = await stmt.all();
    
    // 3. Return the data
    return c.json(results);

  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/admin/add-problem', async (c) => {
  // In a real app, you'd add admin auth here
  const { question_name, points, link, day } = await c.req.json();

  // Basic validation
  if (!question_name || !points || !link || !day) {
    return c.json({ error: 'All fields are required' }, 400);
  }

  try {
    const stmt = c.env.DB.prepare(
      'INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES (?, ?, ?, ?, 0)'
    );
    // New problems are always created as 'isPublic = 0' (Hidden)
    await stmt.bind(question_name, points, link, day).run();
    
    return c.json({ success: true, message: `Added problem: ${question_name}` });
  
  } catch (e: any) {
    // Handle the case where the problem name is not unique
    if (e.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A problem with this name already exists' }, 409); // 409 Conflict
    }
    // Handle other errors
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/admin/add-solution', async (c) => {
  // TODO: Add admin auth
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

app.get('/api/admin/users-to-process/:day', async (c) => {
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

app.post('/api/admin/publish-solution', async (c) => {
  // TODO: Add admin auth
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