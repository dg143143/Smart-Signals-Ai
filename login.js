document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('loginMessage');

    // Redirect if already logged in
    if (sessionStorage.getItem('isUserLoggedIn')) {
        window.location.href = 'index.html';
    }

    loginBtn.addEventListener('click', handleUserLogin);
    passwordInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleUserLogin();
        }
    });

    function handleUserLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage('Please enter both username and password.');
            return;
        }

        const user = findUserByUsername(username);

        if (!user || user.password !== password) {
            showMessage('Invalid username or password.');
            return;
        }

        if (!user.approved) {
            showMessage('Your account is pending approval. Please contact an admin.');
            return;
        }

        // Login successful
        sessionStorage.setItem('isUserLoggedIn', 'true');
        sessionStorage.setItem('loggedInUsername', user.username);
        window.location.href = 'index.html';
    }

    function showMessage(msg) {
        messageDiv.textContent = msg;
    }
});
