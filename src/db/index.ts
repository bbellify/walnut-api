import sqlite3, { type Database } from 'sqlite3';

const db: Database = new sqlite3.Database('src/db/db.db');

const userQuery = `
  CREATE TABLE IF NOT EXISTS user (
    first TEXT NOT NULL,
    last TEXT NOT NULL
  )
`;

const settingsQuery = `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    value TEXT NOT NULL
  )
`;

db.serialize(() => {
  db.run(userQuery, (err) => {
    if (err) {
      console.log('Error creating User table:', err.message);
    } else {
      console.log('Successfully created User table');
    }
  });

  db.run(settingsQuery, (err) => {
    if (err) {
      console.log('Error creating Settings table:', err.message);
    } else {
      console.log('Successfully created Settings table');
    }
  });
});
