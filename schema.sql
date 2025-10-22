/*
-- This file defines your database structure.
-- It creates the three tables needed for your project.
*/

/* --- 1. Users Table --- */
/* Stores the fixed list of participants. */
DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

/* --- 2. Problems Table --- */
/* Stores all 100+ problems for the challenge. */
DROP TABLE IF EXISTS Problems;
CREATE TABLE Problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_name TEXT NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 10,
    link TEXT,
    day INTEGER NOT NULL,
    isPublic INTEGER NOT NULL DEFAULT 0 /* 0 = false, 1 = true */
);

/* --- 3. Leaderboard Table --- */
/* Stores the scores, which will be updated daily. */
DROP TABLE IF EXISTS Leaderboard;
CREATE TABLE Leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (username) REFERENCES Users (username)
);

