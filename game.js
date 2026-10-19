let players = [];
let currentPlayerIndex = 0;
let usedPlayers = [];
let currentHintLevel = 0;
let round = 1;
let score = 0;

// Load players from CSV
async function loadPlayers() {
    try {
        const response = await fetch('players.csv');
        const text = await response.text();

        // Parse CSV
        const lines = text.trim().split('\n');
        const header = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            players.push({
                name: values[0].trim(),
                hint1: values[1].trim(),
                hint2: values[2].trim(),
                hint3: values[3].trim(),
                hint4: values[4].trim()
            });
        }

        startNewRound();
    } catch (error) {
        console.error('Error loading players:', error);
        document.getElementById('hint').textContent = 'Error loading game data. Make sure you are running a local server.';
    }
}

function startNewRound() {
    if (round > 5) {
        endGame();
        return;
    }

    // Pick a random player that hasn't been used
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * players.length);
    } while (usedPlayers.includes(randomIndex) && usedPlayers.length < players.length);

    currentPlayerIndex = randomIndex;
    usedPlayers.push(randomIndex);
    currentHintLevel = 0;

    updateDisplay();
    clearInputs();
}

function updateDisplay() {
    const player = players[currentPlayerIndex];
    const hints = ['hint1', 'hint2', 'hint3', 'hint4'];

    let hintText = '';
    for (let i = 0; i <= currentHintLevel && i < 4; i++) {
        hintText += player[hints[i]];
        if (i < currentHintLevel && i < 3) {
            hintText += '<br><br>';
        }
    }

    document.getElementById('hint').innerHTML = hintText;
    document.getElementById('currentRound').textContent = round;
    document.getElementById('score').textContent = score;
}

function clearInputs() {
    document.getElementById('guessInput').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('guessInput').focus();
}

function makeGuess() {
    const guess = document.getElementById('guessInput').value.trim().toLowerCase();
    const correctName = players[currentPlayerIndex].name.toLowerCase();
    const lastNameOnly = correctName.split(' ').pop(); // Get last name only

    if (!guess) {
        document.getElementById('feedback').textContent = 'Please enter a name!';
        return;
    }

    if (guess === correctName || guess === lastNameOnly) {
        // Correct guess!
        const points = Math.max(0, 4 - currentHintLevel);
        score += points;

        document.getElementById('feedback').innerHTML = `<span class="feedback-right">✓ Correct! +${points} points</span>`;
        document.getElementById('guessButton').disabled = true;
        document.getElementById('guessInput').disabled = true;

        setTimeout(() => {
            round++;
            document.getElementById('guessButton').disabled = false;
            document.getElementById('guessInput').disabled = false;
            startNewRound();
        }, 2000);
    } else {
        // Wrong guess
        if (currentHintLevel < 3) {
            currentHintLevel++;
            updateDisplay();
            document.getElementById('feedback').innerHTML = '<span class="feedback-wrong">✗ Wrong! Next hint unlocked.</span>';
        } else {
            // Out of hints
            document.getElementById('feedback').innerHTML = `<span class="feedback-wrong">✗ Out of hints. It was ${players[currentPlayerIndex].name}.</span>`;
            document.getElementById('guessButton').disabled = true;
            document.getElementById('guessInput').disabled = true;

            setTimeout(() => {
                round++;
                document.getElementById('guessButton').disabled = false;
                document.getElementById('guessInput').disabled = false;
                startNewRound();
            }, 2000);
        }
        clearInputs();
    }
}

function endGame() {
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('finalScore').textContent = `Your score: ${score} / 20`;
}

function playAgain() {
    players = [];
    usedPlayers = [];
    round = 1;
    score = 0;
    currentHintLevel = 0;

    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('gameOverScreen').style.display = 'none';

    loadPlayers();
}

// Event listeners
document.getElementById('guessButton').addEventListener('click', makeGuess);
document.getElementById('guessInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') makeGuess();
});
document.getElementById('playAgainButton').addEventListener('click', playAgain);

// Start the game
loadPlayers();
