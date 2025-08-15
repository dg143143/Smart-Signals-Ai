document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const userList = document.getElementById('userList');
    const createUserBtn = document.getElementById('createUserBtn');

    // Check if admin is already logged in (simple session management)
    if (sessionStorage.getItem('isAdminLoggedIn')) {
        showAdminPanel();
    }

    // --- Event Listeners ---
    adminLoginBtn.addEventListener('click', handleAdminLogin);
    adminLogoutBtn.addEventListener('click', handleAdminLogout);
    createUserBtn.addEventListener('click', handleCreateUser);

    // --- Functions ---
    function handleAdminLogin() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (checkAdminCredentials(username, password)) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            showAdminPanel();
        } else {
            alert('Invalid admin credentials.');
        }
    }

    function handleAdminLogout() {
        sessionStorage.removeItem('isAdminLoggedIn');
        hideAdminPanel();
    }


    function showAdminPanel() {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
        renderUserList();
    }

    function hideAdminPanel() {
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
    }

    function renderUserList() {
        const users = getAllUsers();
        userList.innerHTML = ''; // Clear current list

        if (users.length === 0) {
            userList.innerHTML = '<li>No users found.</li>';
            return;
        }

        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.className = `user-item ${user.approved ? '' : 'pending'}`;
            userItem.innerHTML = `
                <div class="user-details">
                    <strong>ID:</strong> ${user.id} |
                    <strong>User:</strong> ${user.username} |
                    <strong>Status:</strong> ${user.approved ? '<span style="color: var(--button-bg);">Approved</span>' : '<span style="color: #f0ad4e;">Pending</span>'}
                </div>
                <div class="user-actions">
                    <button class="btn-secondary approve-btn" data-id="${user.id}" data-approved="${user.approved}">
                        ${user.approved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button class="btn-danger remove-btn" data-id="${user.id}">Remove</button>
                </div>
            `;
            userList.appendChild(userItem);
        });

        // Add event listeners for the new buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = parseInt(e.target.dataset.id);
                const isApproved = e.target.dataset.approved === 'true';
                approveUser(userId, !isApproved);
                renderUserList(); // Re-render the list to show changes
            });
        });

        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = parseInt(e.target.dataset.id);
                if (confirm(`Are you sure you want to remove user with ID ${userId}?`)) {
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
            alert('Please provide both username and password.');
            return;
        }

        if (findUserByUsername(username)) {
            alert('Username already exists.');
            return;
        }

        addUser(username, password);
        alert(`User "${username}" created successfully. They need to be approved to log in.`);

        // Clear input fields
        usernameInput.value = '';
        passwordInput.value = '';

        renderUserList(); // Refresh the list
    }
});
