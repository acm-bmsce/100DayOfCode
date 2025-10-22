/*
-- This file contains the REAL API logic to fetch LeetCode data.
*/

const LEETCODE_API_URL = "https://alfa-leetcode-api.onrender.com";

// Define the expected shape of a single submission from the JSON
interface Submission {
  title: string;
  statusDisplay: string;
}

// Define the expected shape of the API response
interface ApiResponse {
  submission: Submission[];
}

export async function fetchUserSubmissions(username: string): Promise<Set<string>> {
  /*
  -- IMPORTANT: Using limit=1000, not 7, to get a large history.
  -- This is critical for the logic to work.
  */
  const url = `${LEETCODE_API_URL}/${username}/acSubmission?limit=1000`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API returned ${response.status} for user ${username}`);
    }

    const data = await response.json<ApiResponse>();

    if (!data.submission) {
      // User exists but has no submissions
      return new Set<string>();
    }

    // Filter for "Accepted" submissions and map to their titles
    const acceptedTitles = data.submission
      .filter(sub => sub.statusDisplay === "Accepted")
      .map(sub => sub.title);

    // Return a Set for efficient O(1) lookups
    return new Set(acceptedTitles);

  } catch (error) {
    console.error(`Failed to fetch submissions for ${username}:`, error);
    // Return an empty set on failure so the update loop can continue
    return new Set<string>();
  }
}