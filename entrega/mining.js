document.getElementById('startMiningBtn').addEventListener('click', function() {
    startMiningAnimation();
    startRealMining(); 
    sessionStorage.setItem('miningStarted', 'true'); 
    document.getElementById('startMiningBtn').style.display = 'none'; 
    document.getElementById('terminalOutput').classList.remove('hidden'); 
});



function startMiningAnimation() {
    const btn = document.getElementById('startMiningBtn');
    btn.style.display = 'none'; 

    const terminalOutput = document.getElementById('terminalOutput');
    terminalOutput.classList.remove('hidden'); 

    function addMiningEntry() {
        const min = 0.0000001;
        const max = 0.05;
        const minedValue = (Math.random() * (max - min) + min).toFixed(16);
        const hash = generateHash(64); 
        const newLine = document.createElement('div');
        newLine.textContent = `Mined bloco ${hash} / ${minedValue} BTC`;
        terminalOutput.appendChild(newLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight; 
    }

    setInterval(addMiningEntry, 400);
}

window.addEventListener('load', function() {
    if (sessionStorage.getItem('miningStarted') === 'true') {
        document.getElementById('startMiningBtn').style.display = 'none'; 
        document.getElementById('terminalOutput').classList.remove('hidden'); 
        continueMining(); 
    }
});


function continueMining() {
    const terminalOutput = document.getElementById('terminalOutput');
    setInterval(addMiningEntry, 400); 

    function addMiningEntry() {
        const min = 0.0000001;
        const max = 0.05;
        const minedValue = (Math.random() * (max - min) + min).toFixed(16);
        const hash = generateHash(64);
        const newLine = document.createElement('div');
        newLine.textContent = `Mined bloco ${hash} / ${minedValue} BTC`;
        terminalOutput.appendChild(newLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
}

function generateHash(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


function startRealMining() {
    const userId = getUserId();
    if (!userId) return; 

    fetch(`https://mineradoraapi-fda524168c07.herokuapp.com/start_mining?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error starting mining:', data.error);
            } else {
                console.log('Mining started:', data.message);
            }
        })
        .catch(error => {
            console.error('Failed to start mining:', error);
        });
}


function getUserId() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('User ID is undefined. Please log in.');
        alert("Please log in to continue.");
        window.location.href = 'index.html';  
        return null;
    }
    return userId;
}



document.getElementById('profileBtn').addEventListener('click', function() {
    const userId = getUserId();
    if (!userId) return; 

    fetch(`https://mineradoraapi-fda524168c07.herokuapp.com/user_info?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            localStorage.setItem('userInfo', JSON.stringify(data)); 
            window.location.href = 'profile.html'; 
        })
        .catch(error => {
            console.error('Erro ao obter informações do usuário: ', error);
            alert('Falha ao obter informações do usuário.');
        });
});



document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('miningStarted'); 
    localStorage.clear(); 
    window.location.href = 'index.html'; 
});





if (window.Worker) {
    const miningWorker = new Worker('miningWorker.js');

    document.getElementById('startMiningBtn').addEventListener('click', function() {
        const userId = localStorage.getItem('userId');
        miningWorker.postMessage({ userId: userId }); 
        document.getElementById('startMiningBtn').style.display = 'none'; 
        document.getElementById('terminalOutput').classList.remove('hidden');
    });

    miningWorker.onmessage = function(event) {
        const terminalOutput = document.getElementById('terminalOutput');
        const newLine = document.createElement('div');
        newLine.textContent = event.data;
        terminalOutput.appendChild(newLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
}
