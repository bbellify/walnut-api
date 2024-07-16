import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const connectDB = async () => {
  return await open({
    filename: 'src/db/db.db',
    driver: sqlite3.Database
  });
};

export default connectDB;
