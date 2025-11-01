const [,, DAY_ARG, MAX_ARG] = process.argv;
const API_URL = process.env.API_URL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
let DAY = DAY_ARG; // This will be set by the manual trigger
const MAX_PER_RUN = parseInt(MAX_ARG || process.env.MAX_PER_RUN || '120', 10);

// safety checks
if (!API_URL || !ADMIN_PASSWORD) {
  console.error('Missing API_URL or ADMIN_PASSWORD environment variables');
  process.exit(2);
}

const DELAY_MS = 2000;
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_PASSWORD}`
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// NEW: Function to get the day the cron job should be working on
async function getProcessingDay() {
  console.log('Day not provided (cron run), fetching job state from DB...');
  const url = `${API_URL}/api/admin/get-processing-day`;
  const res = await fetch(url, { headers }); // Use auth headers
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to fetch processing day: ${res.status} ${body}`);
  }
  const data = await res.json();
  if (!data.day) throw new Error('API did not return a valid day');
  console.log(`Current job state is: '${data.day}'`);
  return data.day.toString();
}

// NEW: Function to tell the backend the job is finished
async function completeJob() {
  console.log('Telling backend to set job state to STOPPED (0)');
  const url = `${API_URL}/api/admin/complete-job`;
  const res = await fetch(url, { method: 'POST', headers });
  if (!res.ok) {
    console.warn('Failed to set job state to complete. Will retry next hour.');
  }
}

async function getUsersToProcess(day) {
  const url = `${API_URL}/api/admin/users-to-process/${day}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GET users-to-process failed: ${res.status} ${body}`);
  }
  return res.json();
}

async function updateUser(username, day) {
  const url = `${API_URL}/api/admin/update-user-score`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ username, day: parseInt(day, 10) })
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

(async () => {
  try {
    // NEW: Logic to find the day
    if (!DAY) {
      // This is a cron run, check the DB
      DAY = await getProcessingDay();
    } else {
      // This is a manual trigger run
      console.log(`Running for day specified by trigger: ${DAY}`);
    }

    // NEW: Check if job is set to STOPPED
    if (DAY === '0') {
      console.log('Job state is 0 (STOPPED). Exiting.');
      return;
    }

    console.log(`Runner start: DAY=${DAY} MAX_PER_RUN=${MAX_PER_RUN} DELAY_MS=${DELAY_MS}`);
    const users = await getUsersToProcess(DAY);
    if (!Array.isArray(users) || users.length === 0) {
      console.log('No users left to process for this day.');
      await completeJob(); // <-- Tell backend the job is done
      return;
    }
    console.log(`Total candidates: ${users.length}. Will process up to ${MAX_PER_RUN}.`);

    const toProcess = users.slice(0, MAX_PER_RUN);
    let processed = 0, success = 0, fail = 0;

    for (const entry of toProcess) {
      const username = typeof entry === 'string' ? entry : (entry.username || entry.user || null);
      if (!username) {
        console.warn('Skipping invalid entry', entry);
        continue;
      }

      console.log(`Processing (${processed + 1}/${toProcess.length}): ${username}`);
      const res = await updateUser(username, DAY);

      if (res.ok) {
        success++;
        console.log(`[SUCCESS] ${username} ->`, res.data);
      } else {
        fail++;
        console.warn(`[FAIL] ${username} status=${res.status} data=`, res.data);
        if (res.status === 429) {
          console.error('Received 429 rate limit. Stopping run early. Remaining users will be processed in next hourly run.');
          process.exit(10); 
        }
      }

      processed++;
      if (processed < toProcess.length) await sleep(DELAY_MS);
    }

    console.log(`Run finished. processed=${processed}, success=${success}, fail=${fail}`);
    
    // Check if we just processed the *last* batch
    if (users.length <= MAX_PER_RUN) {
      console.log('Processed the final batch of users.');
      await completeJob(); // <-- Tell backend the job is done
    }

  } catch (err) {
    console.error('Runner fatal error:', err.message || err);
    process.exit(1);
  }
})();