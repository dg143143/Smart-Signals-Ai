const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.json');

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
// Serve frontend files from the root directory
app.use(express.static(path.join(__dirname, '/')));

// --- Database Helper Functions ---
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error);
        // If the file doesn't exist or is corrupt, return a default structure
        return { admin: { username: "DG143", password: "DG143" }, users: [] };
    }
};

const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to database:", error);
    }
};

// --- API Routes ---

// Placeholder for the root API endpoint
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the SmartSignal Pro API' });
});

// Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    if (username === db.admin.username && password === db.admin.password) {
        // In a real app, you'd return a secure token (e.g., JWT)
        res.json({ success: true, message: 'Admin login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
});

// --- User Management API Endpoints ---
// NOTE: In a real app, these routes should be protected by admin authentication middleware.

// Get all users
app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json(db.users);
});

// Create a new user
app.post('/api/users', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const db = readDB();

    // Check if username already exists
    if (db.users.find(u => u.username === username)) {
        return res.status(409).json({ message: 'Username already exists.' });
    }

    const newUser = {
        id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
        username,
        password, // In a real app, hash this password!
        approved: false
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json(newUser);
});

// Approve/Revoke a user
app.put('/api/users/:id/approve', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { approved } = req.body; // Expecting { "approved": true/false }

    if (typeof approved !== 'boolean') {
        return res.status(400).json({ message: 'Approved status must be a boolean.' });
    }

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    db.users[userIndex].approved = approved;
    writeDB(db);

    res.json(db.users[userIndex]);
});

// Remove a user
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const db = readDB();

    const initialLength = db.users.length;
    db.users = db.users.filter(u => u.id !== userId);

    if (db.users.length === initialLength) {
        return res.status(404).json({ message: 'User not found.' });
    }

    writeDB(db);
    res.status(204).send(); // No Content

    
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Initialize database if it doesn't exist
    if (!fs.existsSync(DB_PATH)) {
        writeDB({
            admin: { username: "DG143", password: "DG143" },
            users: []
        });
        console.log('Database initialized.');
    }
});
