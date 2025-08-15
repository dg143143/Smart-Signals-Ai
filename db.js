// --- Simple Database using localStorage ---

function initializeDB() {
    let db = localStorage.getItem('smartSignalDB');
    let shouldReinitialize = false;

    if (db) {
        try {
            db = JSON.parse(db);
            // Check for a critical part of the DB, like the admin object or users array
            if (!db.admin || !db.admin.username || !db.users) {
                console.log("DB corruption detected (missing keys). Re-initializing.");
                shouldReinitialize = true;
            }
        } catch (e) {
            // If parsing fails, the data is corrupt
            console.log("DB corruption detected (JSON parse failed). Re-initializing.");
            shouldReinitialize = true;
        }
    } else {
        // If no DB exists at all
        shouldReinitialize = true;
    }

    if (!shouldReinitialize) {
        return; // DB is valid, do nothing.
    }

    // Default admin credentials
    const adminUser = {
        username: 'DG143',
        password: 'adminpassword' // In a real app, this should be hashed
    };

    // Default user list
    const users = [
        { id: 1, username: 'user1', password: 'password1', approved: true },
        { id: 2, username: 'user2', password: 'password2', approved: false },
        { id: 3, username: 'user3', password: 'password3', approved: true },
    ];

    const newDb = {
        admin: adminUser,
        users: users,
        nextUserId: 4
    };

    localStorage.setItem('smartSignalDB', JSON.stringify(newDb));
    console.log("SmartSignalDB has been successfully initialized/repaired.");
}

function getDB() {
    return JSON.parse(localStorage.getItem('smartSignalDB'));
}

function saveDB(db) {
    localStorage.setItem('smartSignalDB', JSON.stringify(db));
}

// --- Admin Functions ---
function checkAdminCredentials(username, password) {
    const db = getDB();
    return db.admin.username === username && db.admin.password === password;
}

// --- User Management Functions ---
function getAllUsers() {
    const db = getDB();
    return db.users;
}

function addUser(username, password) {
    const db = getDB();
    const newUser = {
        id: db.nextUserId,
        username: username,
        password: password, // Again, hash in real-world scenarios
        approved: false // New users are not approved by default
    };
    db.users.push(newUser);
    db.nextUserId++;
    saveDB(db);
    return newUser;
}

function approveUser(userId, shouldApprove) {
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.approved = shouldApprove;
        saveDB(db);
    }
}

function removeUser(userId) {
    const db = getDB();
    db.users = db.users.filter(u => u.id !== userId);
    saveDB(db);
}

function findUserByUsername(username) {
    const db = getDB();
    return db.users.find(u => u.username === username);
}


// Initialize the database on script load
initializeDB();
