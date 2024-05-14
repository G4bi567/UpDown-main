let MAX_PLAYERS_PER_LOBBY =2
function toggleMultiplayerLobby() {
    var lobbyDiv = document.getElementById('multiplayerLobby');
    lobbyDiv.style.display = lobbyDiv.style.display === "none" ? "block" : "none";
}



function showWaitingScreen() {
    document.getElementById('waitingScreen').style.display = 'flex';
}

function hideWaitingScreen() {
    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('waitingScreen').style.display = 'none';
}
var socket;  // Declare socket globally
let newLobbyId;
let playerRole; // Global variable to store the player's role
function createNewLobby() {
    socket = io('https://3000-g4bi567-updownmain-maytjpkb4o9.ws-eu111.gitpod.io', { transports: ['websocket'], withCredentials: true });
    socket.on('connect', () => {
        let newLobbyId = Math.random().toString(36).substr(2, 7);
        socket.emit('createLobby', { lobbyId: newLobbyId, nickname: playerNickname });

        socket.on('lobbyCreated', (data) => {
            console.log('Lobby successfully created with ID:', data.lobbyId);
            playerRole = data.role;
            document.getElementById('newLobbyId').textContent = newLobbyId;
            document.getElementById('newLobbyCreated').style.display = 'block';
            // Now wait for the lobby to be updated with two players
            socket.on('lobbyUpdate', (updateData) => {
                if (Object.keys(updateData.users).length === MAX_PLAYERS_PER_LOBBY) {
                    hideWaitingScreen();
                    lobbyReady = true
                    initializeGame();
                    setupSocketListeners();
                }
            });
        });
    });

    handleConnectionErrors();
}

function joinLobby() {
    const lobbyId = document.getElementById('lobbyId').value.trim();
    const nicknameInput = document.getElementById('nickname');
    const playerNickname = nicknameInput.value.trim();

    if (!lobbyId || !playerNickname) {
        alert('Please enter a nickname and lobby ID.');
        return;
    }

    socket = io('https://3000-g4bi567-updownmain-maytjpkb4o9.ws-eu111.gitpod.io', { transports: ['websocket'], withCredentials: true });
    socket.on('connect', () => {
        socket.emit('joinLobby', { lobbyId, nickname: playerNickname });

        socket.on('joinedLobby', (data) => {
            console.log('Joined lobby with ID:', data.lobbyId);
            playerRole = data.role;
            hideWaitingScreen();
            lobbyReady = true
            initializeGame();
            setupSocketListeners();

        });
    });

    handleConnectionErrors();
}

function handleConnectionErrors() {
    socket.on('connect_error', (error) => {
        hideWaitingScreen(); // Hide the waiting screen as we can't proceed without a connection
        alert('Failed to connect to the multiplayer server: ' + error.message); // Inform the user
        resetGame(); // Optionally reset the game state to allow retrying
    });
    
    socket.on('connect_timeout', () => {
        hideWaitingScreen(); // Same handling for timeout
        alert('Connection to the multiplayer server timed out.');
        resetGame(); // Reset the game state
    });

    // You might also want to handle disconnection events
    socket.on('playerDisconnected', (data) => {
        document.getElementById('newLobbyCreated').style.display = 'none';
        resetGame()
        alert(data.message); // Notify the player about the disconnection
        // Additional client-side logic to handle the game state
    });
    
}

socket.on('playerDisconnected', (data) => {
    alert(data.message); // Alert the user that their opponent has left
    showMainMenu(); // Show the main menu
    resetGame(); // Reset game to initial state
});

function copyLobbyId() {
    const lobbyId = document.getElementById('newLobbyId').textContent;
    navigator.clipboard.writeText(lobbyId).then(() => {
        alert('Lobby ID copied to clipboard!');
    }, () => {
        alert('Failed to copy Lobby ID');
    });
}


