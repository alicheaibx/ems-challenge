import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to a usable directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the SQLite database file
const dbPath = path.resolve(__dirname, 'ems.db');

// Delete the existing database file if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Create a new SQLite database
const db = new Database(dbPath);

// Read the SQL schema from init.sql
const schemaPath = path.resolve(__dirname, 'init.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Execute the SQL schema to create tables
db.exec(schema);

console.log('Database initialized successfully!');
