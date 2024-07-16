import sqlite3, { type Database } from 'sqlite3';
import { open } from 'sqlite';

const initDB = async () => {
  const db = await open({
    filename: 'src/db/db.db',
    driver: sqlite3.Database
  });

  await db.exec(userQuery);
  await db.exec(settingsQuery);

  console.log('User and Settings tables successfully initialized');
  await db.close();
};
export const db: Database = new sqlite3.Database('src/db/db.db');

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

export default initDB;
