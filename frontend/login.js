
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';


(function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'index.html';
        return;
    }
})();

const loginForm = document.querySelector('#login-form');

if (loginForm) {
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const errorMessageDiv = document.querySelector('#error-message');
    const submitButton = loginForm.querySelector('button');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageDiv.textContent = '';
        emailInput.classList.remove('input-error');
        passwordInput.classList.remove('input-error');

        submitButton.disabled = true;
        submitButton.textContent = 'Wird angemeldet...';

        try {
            const email = emailInput.value;
            const password = passwordInput.value;

           
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login fehlgeschlagen');
            }

            localStorage.setItem('token', data.token);
            window.location.href = 'index.html';

        } catch (error) {
            errorMessageDiv.textContent = error.message;
            if (passwordInput) passwordInput.value = '';
            if (emailInput) emailInput.classList.add('input-error');
            if (passwordInput) passwordInput.classList.add('input-error');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Anmelden';
            }
        }
    });
}