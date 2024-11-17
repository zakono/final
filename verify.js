document.getElementById('verifyForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = localStorage.getItem('username');
    const code = document.getElementById('code').value;

    try {
        const response = await fetch('/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, code })
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('jwtToken', `Bearer ${result.token}`);
            localStorage.setItem('role', result.role);
            window.location.href = result.redirect;
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Verification failed:', error);
    }
});
