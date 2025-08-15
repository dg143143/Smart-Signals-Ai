document.addEventListener('DOMContentLoaded', () => {
    // --- Page Elements ---
    const authWrapper = document.getElementById('auth-wrapper');
    const adminPanel = document.getElementById('adminPanel');
    const adminLoginSection = document.getElementById('adminLoginSection');

    // --- Admin Login ---
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminMessageDiv = document.getElementById('adminLoginMessage');

    // --- Admin Panel ---
    const userList = document.getElementById('userList');
    const createUserBtn = document.getElementById('createUserBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    // --- Initial State ---
    // Check if admin is already logged in from a previous session
    if (sessionStorage.getItem('isAdminLoggedIn')) {
        displayAdminPanel();
    }

    // --- Event Listeners ---
    adminLoginBtn.addEventListener('click', handleAdminLogin);
    adminPasswordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleAdminLogin();
    });

    createUserBtn.addEventListener('click', handleCreateUser);
    adminLogoutBtn.addEventListener('click', handleAdminLogout);

    // --- Main Functions ---

    function handleAdminLogin() {
        const username = adminUsernameInput.value.trim();
        const password = adminPasswordInput.value.trim();

        if (!username || !password) {
            showMessage(adminMessageDiv, 'Please enter both username and password.');
            return;
        }

        if (checkAdminCredentials(username, password)) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            displayAdminPanel();
        } else {
            showMessage(adminMessageDiv, 'Invalid admin credentials.');
            // Clear password field on failed attempt
            adminPasswordInput.value = '';
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
        userList.innerHTML = ''; // Clear the list

        if (users.length === 0) {
            userList.innerHTML = '<li>No users have been created yet.</li>';
            return;
        }

        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.className = `user-item ${user.approved ? '' : 'pending'}`;
            userItem.innerHTML = `
                <div class="user-details">
                    <strong>User:</strong> ${user.username} |
                    <strong>Status:</strong> ${user.approved ? '<span style="color: var(--button-bg);">Approved</span>' : '<span style="color: #f0ad4e;">Pending Approval</span>'}
                </div>
                <div class="user-actions">
                    <button class="btn-secondary approve-btn" data-id="${user.id}" data-approved="${user.approved}">
                        ${user.approved ? 'Revoke' : 'Approve'}
                    </button>
                    <button class="btn-danger remove-btn" data-id="${user.id}">Remove</button>
                </div>`;
            userList.appendChild(userItem);
        });

        // Attach event listeners to the newly created buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', e => {
                const userId = parseInt(e.target.dataset.id);
                const isApproved = e.target.dataset.approved === 'true';
                approveUser(userId, !isApproved); // Toggle approval
                renderUserList(); // Re-render the list to show the change
            });
        });

        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', e => {
                const userId = parseInt(e.target.dataset.id);
                if (confirm(`Are you sure you want to remove this user? This action cannot be undone.`)) {
                    removeUser(userId);
                    renderUserList(); // Re-render
                }
            });
        });
    }

    function handleCreateUser() {
        const usernameInput = document.getElementById('newUsername');
        const passwordInput = document.getElementById('newPassword');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            alert('Please provide a username and password for the new user.');
            return;
        }
        if (findUserByUsername(username)) {
            alert('This username is already taken. Please choose another.');
            return;
        }

        addUser(username, password);
        alert(`User "${username}" created successfully. You now need to approve them to grant access.`);

        // Clear the input fields
        usernameInput.value = '';
        passwordInput.value = '';

        renderUserList(); // Refresh the user list
    }

    function showMessage(element, msg) {
        element.textContent = msg;
        // Clear message after 3 seconds
        setTimeout(() => {
            element.textContent = '';
        }, 3000);
    }
});
