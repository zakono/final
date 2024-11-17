document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (response.ok) {
            if (result.redirect === '/verify') {
                localStorage.setItem('username', username);
                window.location.href = result.redirect;
            } else {
                localStorage.setItem('jwtToken', `Bearer ${result.token}`);
                localStorage.setItem('role', result.role);
                window.location.href = result.redirect;
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
});
