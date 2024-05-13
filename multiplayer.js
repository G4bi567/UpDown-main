function toggleMultiplayerLobby() {
    var lobbyDiv = document.getElementById('multiplayerLobby');
    lobbyDiv.style.display = lobbyDiv.style.display === "none" ? "block" : "none";
}

function showMultiplayerOptions() {
    document.getElementById('multiplayerOptions').style.display = 'block';
    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('newLobbyCreated').style.display = 'none';
}

function showJoinLobby() {
    document.getElementById('multiplayerLobby').style.display = 'block';
    document.getElementById('multiplayerOptions').style.display = 'none';
    document.getElementById('newLobbyCreated').style.display = 'none';
}
function showWaitingScreen() {
    document.getElementById('waitingScreen').style.display = 'flex';
}

function hideWaitingScreen() {
    document.getElementById('waitingScreen').style.display = 'none';
}
var socket;  // Declare socket globally
let newLobbyId;
let playerRole; // Global variable to store the player's role
function createNewLobby() {
    showWaitingScreen();
    socket = io('https://3000-g4bi567-updownmain-ax5bnjc60y5.ws-eu111.gitpod.io', { transports: ['websocket'], withCredentials: true });
    socket.on('connect', () => {
        let newLobbyId = Math.random().toString(36).substr(2, 7);
        socket.emit('createLobby', { lobbyId: newLobbyId, nickname: playerNickname });

        socket.on('lobbyCreated', (data) => {
            console.log('Lobby successfully created with ID:', data.lobbyId);
            playerRole = data.role;
            
            // Now wait for the lobby to be updated with two players
            socket.on('lobbyUpdate', (updateData) => {
                if (Object.keys(updateData.users).length === MAX_PLAYERS_PER_LOBBY) {
                    hideWaitingScreen();
                    initializeGame();
                }
            });
        });
    });

    handleConnectionErrors();
}

function joinLobby() {
    showWaitingScreen();
    const lobbyId = document.getElementById('lobbyId').value.trim();
    const nicknameInput = document.getElementById('nickname');
    const playerNickname = nicknameInput.value.trim();

    if (!lobbyId || !playerNickname) {
        alert('Please enter a nickname and lobby ID.');
        return;
    }

    socket = io('https://3000-g4bi567-updownmain-ax5bnjc60y5.ws-eu111.gitpod.io', { transports: ['websocket'], withCredentials: true });
    socket.on('connect', () => {
        socket.emit('joinLobby', { lobbyId, nickname: playerNickname });

        socket.on('joinedLobby', (data) => {
            console.log('Joined lobby with ID:', data.lobbyId);
            playerRole = data.role;
            
            // Wait for lobby update indicating two players
            socket.on('lobbyUpdate', (updateData) => {
                if (Object.keys(updateData.users).length === MAX_PLAYERS_PER_LOBBY) {
                    hideWaitingScreen();
                    initializeGame();
                }
            });
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
    socket.on('disconnect', (reason) => {
        hideWaitingScreen(); // If the server disconnects, hide the waiting screen
        if (reason === 'io server disconnect') {
            alert('You have been disconnected from the server.');
        } else {
            alert('Connection lost: ' + reason); // Provide more detailed feedback if needed
        }
        resetGame(); // Reset the game state
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


