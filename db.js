// --- Simple Database using localStorage ---

function initializeDB() {
    // For this application, we always reset the database on load to ensure a clean state
    // and prevent issues with cached or old localStorage data.

    // Admin credentials as requested
    const adminUser = {
        username: 'DG143',
        password: 'DG143' // In a real app, this should be hashed
    };

    // Start with an empty user list
    const users = [];

    const db = {
        admin: adminUser,
        users: users,
        nextUserId: 1
    };

    localStorage.setItem('smartSignalDB_v2', JSON.stringify(db));
}

function getDB() {
    return JSON.parse(localStorage.getItem('smartSignalDB_v2'));
}

function saveDB(db) {
    localStorage.setItem('smartSignalDB_v2', JSON.stringify(db));
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
