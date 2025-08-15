document.addEventListener('DOMContentLoaded', () => {
    // --- Overall Page Elements ---
    const authWrapper = document.getElementById('auth-wrapper');
    const adminPanel = document.getElementById('adminPanel');

    // --- View Toggling ---
    const userLoginSection = document.getElementById('userLoginSection');
    const adminLoginSection = document.getElementById('adminLoginSection');
    const showAdminLoginBtn = document.getElementById('showAdminLogin');
    const showUserLoginBtn = document.getElementById('showUserLogin');

    // --- User Login Elements ---
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const userMessageDiv = document.getElementById('userLoginMessage');

    // --- Admin Login Elements ---
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminMessageDiv = document.getElementById('adminLoginMessage');

    // --- Admin Panel Elements ---
    const userList = document.getElementById('userList');
    const createUserBtn = document.getElementById('createUserBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    // --- Initial State Check ---
    // If admin is logged in, show panel immediately. Otherwise, check for user.
    if (sessionStorage.getItem('isAdminLoggedIn')) {
        displayAdminPanel();
    } else if (sessionStorage.getItem('isUserLoggedIn')) {
        window.location.href = 'index.html';
    }

    // --- Event Listeners ---
    showAdminLoginBtn.addEventListener('click', () => toggleLoginView(true));
    showUserLoginBtn.addEventListener('click', () => toggleLoginView(false));

    loginBtn.addEventListener('click', handleUserLogin);
    adminLoginBtn.addEventListener('click', handleAdminLogin);

    createUserBtn.addEventListener('click', handleCreateUser);
    adminLogoutBtn.addEventListener('click', handleAdminLogout);

    // --- View-Switching Logic ---
    function toggleLoginView(showAdmin) {
        userLoginSection.style.display = showAdmin ? 'none' : 'block';
        adminLoginSection.style.display = showAdmin ? 'block' : 'none';
    }

    // --- User Login Logic ---
    function handleUserLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        if (!username || !password) {
            showMessage(userMessageDiv, 'Please enter both username and password.');
            return;
        }
        const user = findUserByUsername(username);
        if (!user || user.password !== password) {
            showMessage(userMessageDiv, 'Invalid username or password.');
            return;
        }
        if (!user.approved) {
            showMessage(userMessageDiv, 'Your account is pending approval. Please contact an admin.');
            return;
        }
        sessionStorage.setItem('isUserLoggedIn', 'true');
        sessionStorage.setItem('loggedInUsername', user.username);
        window.location.href = 'index.html';
    }

    // --- Admin Login & Panel Logic ---
    function handleAdminLogin() {
        const username = adminUsernameInput.value;
        const password = adminPasswordInput.value;
        if (checkAdminCredentials(username, password)) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            displayAdminPanel();
        } else {
            showMessage(adminMessageDiv, 'Invalid admin credentials.');
        }
    }

    function displayAdminPanel() {
        authWrapper.style.display = 'none';
        adminPanel.style.display = 'block';
        renderUserList();
    }

    function handleAdminLogout() {
        sessionStorage.removeItem('isAdminLoggedIn');
        authWrapper.style.display = 'block';
        adminPanel.style.display = 'none';
        adminUsernameInput.value = '';
        adminPasswordInput.value = '';
    }

    function renderUserList() {
        const users = getAllUsers();
        userList.innerHTML = '';
        if (users.length === 0) {
            userList.innerHTML = '<li>No users found.</li>';
            return;
        }
        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.className = `user-item ${user.approved ? '' : 'pending'}`;
            userItem.innerHTML = `
                <div class="user-details">
                    <strong>ID:</strong> ${user.id} | <strong>User:</strong> ${user.username} |
                    <strong>Status:</strong> ${user.approved ? '<span style="color: var(--button-bg);">Approved</span>' : '<span style="color: #f0ad4e;">Pending</span>'}
                </div>
                <div class="user-actions">
                    <button class="btn-secondary approve-btn" data-id="${user.id}" data-approved="${user.approved}">
                        ${user.approved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button class="btn-danger remove-btn" data-id="${user.id}">Remove</button>
                </div>`;
            userList.appendChild(userItem);
        });

        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', e => {
                approveUser(parseInt(e.target.dataset.id), e.target.dataset.approved !== 'true');
                renderUserList();
            });
        });
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', e => {
                if (confirm(`Are you sure you want to remove user with ID ${e.target.dataset.id}?`)) {
                    removeUser(parseInt(e.target.dataset.id));
                    renderUserList();
                }
            });
        });
    }

    function handleCreateUser() {
        const usernameInput = document.getElementById('newUsername');
        const passwordInput = document.getElementById('newPassword');
        const username = usernameInput.value.trim();
        if (!username || !passwordInput.value) {
            alert('Please provide both username and password.');
            return;
        }
        if (findUserByUsername(username)) {
            alert('Username already exists.');
            return;
        }
        addUser(username, passwordInput.value);
        alert(`User "${username}" created successfully. They need to be approved to log in.`);
        usernameInput.value = '';
        passwordInput.value = '';
        renderUserList();
    }

    function showMessage(element, msg) {
        element.textContent = msg;
    }
});
