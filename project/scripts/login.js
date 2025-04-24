let userDatabase = JSON.parse(localStorage.getItem('userDatabase')) || {};

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginHeader = document.getElementById('loginHeader');
const signupHeader = document.getElementById('signupHeader');
const toggleFormLink = document.getElementById('toggleFormLink');
const toggleText = document.getElementById('toggleText');

function showStatus(message, isError = false) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = isError ? 
        'status-message bg-red-100 text-red-800' : 
        'status-message bg-green-100 text-green-800';
    statusElement.classList.remove('hidden');

    setTimeout(() => {
        statusElement.classList.add('hidden');
    }, 3000);
}

function toggleForms() {
    const isLoginVisible = !loginForm.classList.contains('hidden-form');

    if (isLoginVisible) {
        loginForm.classList.add('hidden-form');
        loginHeader.classList.add('hidden');
        signupForm.classList.remove('hidden-form');
        signupHeader.classList.remove('hidden');
        toggleText.innerHTML = `Already have an account? 
            <a href="#" id="toggleFormLink" class="text-primary font-semibold hover:text-accent dark:text-accent">Login</a>`;
    } else {
        signupForm.classList.add('hidden-form');
        signupHeader.classList.add('hidden');
        loginForm.classList.remove('hidden-form');
        loginHeader.classList.remove('hidden');
        toggleText.innerHTML = `Don't have an account? 
            <a href="#" id="toggleFormLink" class="text-primary font-semibold hover:text-accent dark:text-accent">Sign up</a>`;
    }

    document.getElementById('toggleFormLink').addEventListener('click', function(e) {
        e.preventDefault();
        toggleForms();
    });
}

signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'false');

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!email || !password || !confirmPassword) {
        showStatus('Bitte alle Felder ausfüllen', true);
        return;
    }

    if (password !== confirmPassword) {
        showStatus('Passwörter stimmen nicht überein', true);
        return;
    }

    if (userDatabase[email]) {
        showStatus('Diese Email ist bereits registriert', true);
        return;
    }

    userDatabase[email] = { password: password };
    localStorage.setItem('userDatabase', JSON.stringify(userDatabase));

    showStatus('Account erfolgreich erstellt!');

    setTimeout(() => {
        toggleForms();
        document.getElementById('email').value = email;
        document.getElementById('password').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }, 1500);
});

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!userDatabase[email]) {
        showStatus('Email nicht gefunden', true);
        return;
    }

    if (userDatabase[email].password !== password) {
        showStatus('Falsches Passwort', true);
        return;
    }

    showStatus('Anmeldung erfolgreich!');

    localStorage.setItem('currentUser', JSON.stringify({ email: email }));

    localStorage.setItem('isLoggedIn', 'true');

    

    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
});

document.getElementById('toggleFormLink').addEventListener('click', function(e) {
    e.preventDefault();
    toggleForms();
});

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('currentUser')) {
        window.location.href = '../index.html';
    }
});
