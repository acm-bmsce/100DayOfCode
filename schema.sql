-- schema.sql (Final Version for Local Testing)

DROP TABLE IF EXISTS AutomationRuns;
DROP TABLE IF EXISTS Leaderboard;
DROP TABLE IF EXISTS Problems;
DROP TABLE IF EXISTS Users;

----------------------------------------------------
-- 1. USERS Table
----------------------------------------------------
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

----------------------------------------------------
-- 2. PROBLEMS Table
----------------------------------------------------
CREATE TABLE Problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_name TEXT NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 10,
    link TEXT,
    day INTEGER NOT NULL,
    isPublic INTEGER NOT NULL DEFAULT 0,
    solution_link TEXT,              
    isSolutionPublic INTEGER NOT NULL DEFAULT 0
);

----------------------------------------------------
-- 3. LEADERBOARD Table (Includes last_updated_for_day)
----------------------------------------------------
CREATE TABLE Leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    last_updated_for_day INTEGER NOT NULL DEFAULT 0, -- CRITICAL for Automation
    FOREIGN KEY (username) REFERENCES Users (username) ON UPDATE CASCADE
);

----------------------------------------------------
-- 4. AUTOMATION RUNS Table (For Logging)
----------------------------------------------------
CREATE TABLE AutomationRuns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time INTEGER NOT NULL,          
    end_time INTEGER,                     
    day_processed INTEGER NOT NULL,       
    users_processed INTEGER NOT NULL,     
    total_remaining INTEGER NOT NULL,     
    status TEXT NOT NULL,                 
    error_message TEXT                    
);