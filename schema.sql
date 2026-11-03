-- Cloudflare D1 Schema for Student Invoice & Receipt Printer
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_code TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    default_course TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    student_id INTEGER NOT NULL,
    student_name TEXT NOT NULL,
    student_phone TEXT,
    course TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Cash',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(payment_date DESC);

-- Seed a couple of sample students so the picker works out of the box
INSERT OR IGNORE INTO students (id, student_code, name, phone, default_course) VALUES
(1, 'STD-1001', 'Tanvir Ahmed', '01711-223344', 'HSC Physics & Math Batch A'),
(2, 'STD-1002', 'Nusrat Jahan', '01819-556677', 'IELTS Crash Course'),
(3, 'STD-1003', 'Farhan Sadiq', '01912-889900', 'Full-Stack Web Development');
