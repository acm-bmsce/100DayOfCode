/*
-- This file adds test data.
-- Run this with: npx wrangler d1 execute d100 --file=mock-data.sql
*/

/* --- 1. Add Test Users --- */
/* !!! IMPORTANT: Replace 'leet_user_1' with a REAL LeETCODE USERNAME for testing !!! */
INSERT INTO Users (username, name) VALUES ('leet_user_1', 'Alex'); /* <-- CHANGE THIS */
INSERT INTO Users (username, name) VALUES ('dsa_guru', 'Brenda'); /* <-- CHANGE THIS */
INSERT INTO Users (username, name) VALUES ('coder_z', 'Chris'); /* (This user can be fake for testing "no solves") */

/* --- 2. Add Corresponding Leaderboard Entries --- */
/* This creates the starting score (0) for each user */
INSERT INTO Leaderboard (username, points, streak) VALUES ('leet_user_1', 0, 0);
INSERT INTO Leaderboard (username, points, streak) VALUES ('dsa_guru', 0, 0);
INSERT INTO Leaderboard (username, points, streak) VALUES ('coder_z', 0, 0);

/* --- 3. Add Test Problems --- */
/* !!! IMPORTANT: The 'question_name' MUST MATCH the 'title' from the LeetCode API JSON exactly. */
INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES ('Two Sum', 10, 'https://leetcode.com/problems/two-sum/', 1, 0);
INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES ('Add Two Numbers', 15, 'https://leetcode.com/problems/add-two-numbers/', 1, 0);
INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES ('Median of Two Sorted Arrays', 20, 'https://leetcode.com/problems/median-of-two-sorted-arrays/', 2, 0);
INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES ('Longest Substring Without Repeating Characters', 15, 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 2, 0);