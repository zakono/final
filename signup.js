
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value, // Здесь мы получаем значение из select
            twoFA: document.getElementById('twoFactorEnabled').checked
        };

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                window.location.href = '/login';
            } else {
                alert(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Error during registration. Please try again.');
        }
    });
});
