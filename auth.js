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

    // --- API Configuration ---
    const API_BASE_URL = 'http://localhost:3000/api';

    // --- Initial State ---
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

    async function handleAdminLogin() {
        const username = adminUsernameInput.value.trim();
        const password = adminPasswordInput.value.trim();

        if (!username || !password) {
            showMessage(adminMessageDiv, 'Please enter both username and password.');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/admin/login`, { username, password });
            if (response.data.success) {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                displayAdminPanel();
            }
        } catch (error) {
            showMessage(adminMessageDiv, 'Invalid admin credentials.');
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

    async function renderUserList() {
        try {
            const response = await axios.get(`${API_BASE_URL}/users`);
            const users = response.data;
            userList.innerHTML = '';

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

            // Attach event listeners to the new buttons
            document.querySelectorAll('.approve-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const userId = e.target.dataset.id;
                    const isApproved = e.target.dataset.approved === 'true';
                    try {
                        await axios.put(`${API_BASE_URL}/users/${userId}/approve`, { approved: !isApproved });
                        renderUserList(); // Re-render the list to show the change
                    } catch (error) {
                        alert('Failed to update user status.');
                    }
                });
            });

            document.querySelectorAll('.remove-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const userId = e.target.dataset.id;
                    if (confirm('Are you sure you want to remove this user?')) {
                        try {
                            await axios.delete(`${API_BASE_URL}/users/${userId}`);
                            renderUserList();
                        } catch (error) {
                            alert('Failed to remove user.');
                        }
                    }
                });
            });

        } catch (error) {
            userList.innerHTML = '<li>Error loading users. Is the server running?</li>';
        }
    }

    async function handleCreateUser() {
        const usernameInput = document.getElementById('newUsername');
        const passwordInput = document.getElementById('newPassword');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            alert('Please provide a username and password.');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/users`, { username, password });
            alert(`User "${username}" created successfully.`);
            usernameInput.value = '';
            passwordInput.value = '';
            renderUserList();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert('This username is already taken.');
            } else {
                alert('Failed to create user.');
            }
        }
    }

    function showMessage(element, msg) {
        element.textContent = msg;
        setTimeout(() => {
            element.textContent = '';
        }, 3000);
    }
});
