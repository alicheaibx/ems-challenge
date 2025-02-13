import express, { Request, Response } from 'express';
import Database from 'better-sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to a usable directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardcoded database path
const dbPath = path.resolve(__dirname, 'ems.db');

// Create a new SQLite database connection
const db = new Database(dbPath);

const app = express();
const port = 3000; // Hardcoded port

app.use(bodyParser.json());
app.use(cors());

// Helper function to handle database errors
const handleDatabaseError = (res: Response, error: any) => {
  console.error('Database error:', error);
  res.status(500).json({ message: 'Database operation failed', error: error.message });
};

// Create employees table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT NOT NULL,
    date_of_birth DATE,
    job_title TEXT,
    department TEXT,
    salary REAL NOT NULL CHECK (salary >= 1500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    photo_file_path TEXT, -- Employee photo file path
    document_file_paths TEXT -- Comma-separated list of document file paths
  );
`);

// Create timesheets table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );
`);

// Add a new employee
app.post('/employees', (req: Request, res: Response) => {
  const { full_name, phone_number, salary, email, date_of_birth, job_title, department, photo_file_path, document_file_paths } = req.body;

  // Validate required fields
  if (!full_name || !phone_number || !salary) {
    return res.status(400).json({ message: 'full_name, phone_number, and salary are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO employees (full_name, phone_number, salary, email, date_of_birth, job_title, department, photo_file_path, document_file_paths)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    const result = stmt.run(full_name, phone_number, salary, email, date_of_birth, job_title, department, photo_file_path, document_file_paths);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Employee added successfully' });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Update an employee
app.put('/employees/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { full_name, phone_number, salary, email, date_of_birth, job_title, department, photo_file_path, document_file_paths } = req.body;

  // Validate required fields
  if (!full_name || !phone_number || !salary) {
    return res.status(400).json({ message: 'full_name, phone_number, and salary are required' });
  }

  const stmt = db.prepare(`
    UPDATE employees
    SET full_name = ?, phone_number = ?, salary = ?, email = ?, date_of_birth = ?, job_title = ?, department = ?, photo_file_path = ?, document_file_paths = ?
    WHERE id = ?
  `);

  try {
    const result = stmt.run(full_name, phone_number, salary, email, date_of_birth, job_title, department, photo_file_path, document_file_paths, id);
    if (result.changes > 0) {
      res.json({ message: 'Employee updated successfully' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Get all employees
app.get('/employees', (req: Request, res: Response) => {
  const stmt = db.prepare('SELECT * FROM employees');
  try {
    const employees = stmt.all();
    res.json(employees);
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Get a single employee by ID
app.get('/employees/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const stmt = db.prepare('SELECT * FROM employees WHERE id = ?');
  try {
    const employee = stmt.get(id);
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Delete an employee
app.delete('/employees/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
  try {
    const result = stmt.run(id);
    if (result.changes > 0) {
      // Also delete associated timesheets
      db.prepare('DELETE FROM timesheets WHERE employee_id = ?').run(id);
      res.json({ message: 'Employee and associated timesheets deleted successfully' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// CRUD for Timesheets

// Create a new timesheet entry
app.post('/timesheets', (req: Request, res: Response) => {
  const { employee_id, start_time, end_time } = req.body;

  if (!employee_id || !start_time || !end_time) {
    return res.status(400).json({ message: 'employee_id, start_time, and end_time are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO timesheets (employee_id, start_time, end_time)
    VALUES (?, ?, ?)
  `);
  try {
    const result = stmt.run(employee_id, start_time, end_time);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Get all timesheet entries with employee names
app.get('/timesheets', (req: Request, res: Response) => {
  const stmt = db.prepare(`
    SELECT timesheets.*, employees.full_name 
    FROM timesheets 
    JOIN employees ON timesheets.employee_id = employees.id
  `);
  try {
    const timesheets = stmt.all();
    res.json(timesheets);
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Get a single timesheet entry by ID
app.get('/timesheets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const stmt = db.prepare('SELECT * FROM timesheets WHERE id = ?');
  try {
    const timesheet = stmt.get(id);
    if (timesheet) {
      res.json(timesheet);
    } else {
      res.status(404).json({ message: 'Timesheet entry not found' });
    }
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Get all timesheet entries for a specific employee with employee name
app.get('/employees/:employee_id/timesheets', (req: Request, res: Response) => {
  const { employee_id } = req.params;
  const stmt = db.prepare(`
    SELECT timesheets.*, employees.full_name 
    FROM timesheets 
    JOIN employees ON timesheets.employee_id = employees.id
    WHERE timesheets.employee_id = ?
  `);
  try {
    const timesheets = stmt.all(employee_id);
    res.json(timesheets);
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Update a timesheet entry
app.put('/timesheets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { employee_id, start_time, end_time } = req.body;

  if (!employee_id || !start_time || !end_time) {
    return res.status(400).json({ message: 'employee_id, start_time, and end_time are required' });
  }

  const stmt = db.prepare(`
    UPDATE timesheets
    SET employee_id = ?, start_time = ?, end_time = ?
    WHERE id = ?
  `);
  try {
    const result = stmt.run(employee_id, start_time, end_time, id);
    if (result.changes > 0) {
      res.json({ message: 'Timesheet entry updated successfully' });
    } else {
      res.status(404).json({ message: 'Timesheet entry not found' });
    }
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Delete a timesheet entry
app.delete('/timesheets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM timesheets WHERE id = ?');
  try {
    const result = stmt.run(id);
    if (result.changes > 0) {
      res.json({ message: 'Timesheet entry deleted successfully' });
    } else {
      res.status(404).json({ message: 'Timesheet entry not found' });
    }
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});