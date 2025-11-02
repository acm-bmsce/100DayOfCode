-- outdated schema
DROP TABLE IF EXISTS Leaderboard;
DROP TABLE IF EXISTS Problems;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE Problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_name TEXT NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 10,
    link TEXT,
    day INTEGER NOT NULL,
    isPublic INTEGER NOT NULL DEFAULT 0,
    solution_link TEXT,               -- Added
    isSolutionPublic INTEGER NOT NULL DEFAULT 0 -- Added
);

CREATE TABLE Leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (username) REFERENCES Users (username)
);