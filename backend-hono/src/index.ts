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
    const updateStmt = c.env.DB.prepare('UPDATE Leaderboard SET points = ?, streak = ? WHERE username = ?')
    await updateStmt.bind(new_points, new_streak, username).run()

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

export default app