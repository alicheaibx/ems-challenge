import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../ems.db');
const db = new Database(dbPath);

// Check if the database connection is successful
db.prepare('SELECT 1').get();
console.log('Connected to the SQLite database.');

export default db;