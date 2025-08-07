document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminErrorMessage = document.getElementById('adminErrorMessage');

    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value.trim();

        try {
            const response = await fetch('http://localhost:3000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userEmail', data.user.email);
                window.location.href = 'dashboard.html';
            } else {
                showError(data.error || 'Invalid admin credentials');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            showError('An error occurred during login');
        }
    });

    function showError(message) {
        adminErrorMessage.textContent = message;
        adminErrorMessage.classList.remove('hidden');
    }
});