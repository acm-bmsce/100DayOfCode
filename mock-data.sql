/*
-- This file adds test data using specific usernames.
-- Clears tables in the correct order before inserting.
*/

/* --- 0. Clear Existing Data (Order Matters!) --- */
DELETE FROM Leaderboard;  -- <-- DELETE THIS FIRST
DELETE FROM Users;        -- <-- THEN DELETE THIS
DELETE FROM Problems;

/* --- 1. Add Test Users --- */
INSERT INTO Users (username, name) VALUES ('aprameyaarao', 'Aprameya');
INSERT INTO Users (username, name) VALUES ('Hrithik875', 'Hrithik');
INSERT INTO Users (username, name) VALUES ('coder_z', 'Chris');

/* --- 2. Add Corresponding Leaderboard Entries --- */
INSERT INTO Leaderboard (username, points, streak) VALUES ('aprameyaarao', 0, 0);
INSERT INTO Leaderboard (username, points, streak) VALUES ('Hrithik875', 0, 0);
INSERT INTO Leaderboard (username, points, streak) VALUES ('coder_z', 0, 0);

/* --- 3. Add Test Problems --- */
INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES ('Two Sum', 10, 'https://leetcode.com/problems/two-sum/', 1, 0);
INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES ('Add Two Numbers', 15, 'https://leetcode.com/problems/add-two-numbers/', 1, 0);
INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES ('Median of Two Sorted Arrays', 20, 'https://leetcode.com/problems/median-of-two-sorted-arrays/', 2, 0);
INSERT INTO Problems (question_name, points, link, day, isPublic) VALUES ('Longest Substring Without Repeating Characters', 15, 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 2, 0);