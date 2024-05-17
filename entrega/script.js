document.getElementById('loginBtn').addEventListener('click', function() {
    showLoginForm();
});

document.getElementById('registerBtn').addEventListener('click', function() {
    showRegisterForm();
});

function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.querySelector('.center-box').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.querySelector('.center-box').classList.add('hidden');
}

function showMainButtons() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.querySelector('.center-box').classList.remove('hidden');
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    authenticate(username, password, 'login');
}

function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    authenticate(username, password, 'register');
}

function authenticate(username, password, action) {
    fetch('https://mineradoraapi-fda524168c07.herokuapp.com/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password,
            action: action
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.message);
            localStorage.setItem('userId', data.user_id);
            console.log("Logged userId:", data.user_id);
            window.location.href = 'mining.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Authentication service failure.');
    });
}




