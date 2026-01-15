/* ============================================
   STAGE 3: PUZZLE GAME
   ============================================ */

// Puzzle State
let puzzleState = [];      // Array of tile positions (0-15, where 15 is empty)
let emptyPos = 15;         // Current position of empty space
let moveCount = 0;
let puzzleSolved = false;
let puzzleStarted = false;

let currentGridSize = 4;   // Can be reduced by asking Michalis for help
const TILE_SIZE = 80;      // px

// Humorous help messages from Michalis
const helpMessages = [
    {
        size: 3,
        message: "Too hard? Okay okay, I'll make it smaller for you... 💕",
        emoji: "🙄"
    },
    {
        size: 2,
        message: "Still struggling?! It's literally 9 pieces!<br>Fine... here's an easier one.",
        emoji: "😅"
    },
    {
        size: 1,
        message: "A 2x2 puzzle... really?<br>You know what, just take it.",
        emoji: "🤦"
    },
    {
        size: 0,
        message: "There. No puzzle. Zero pieces.<br>You win. Are you happy now?",
        emoji: "😂"
    }
];

// ============ START STAGE 3 ============
function startStage3() {
    puzzleSolved = false;
    puzzleStarted = false;
    moveCount = 0;
    currentGridSize = 4;  // Reset to 4x4
    document.getElementById('move-count').textContent = '0';

    // Setup buttons
    setupHintButton();
    setupHelpButton();

    // Show intro first
    const intro = document.getElementById('puzzle-intro');
    intro.classList.add('show');

    // After intro animation, show puzzle
    setTimeout(() => {
        intro.classList.remove('show');
        setTimeout(() => {
            initPuzzle();
            document.getElementById('puzzle-container').classList.add('show');
            puzzleStarted = true;
            playChime();
        }, 500);
    }, 4000);
}

// ============ HINT BUTTON ============
function setupHintButton() {
    const hintBtn = document.getElementById('hint-btn');
    const hintOverlay = document.getElementById('hint-overlay');

    // Show hint on mousedown/touchstart, hide on mouseup/touchend
    hintBtn.addEventListener('mousedown', showHint);
    hintBtn.addEventListener('touchstart', showHint);
    hintBtn.addEventListener('mouseup', hideHint);
    hintBtn.addEventListener('touchend', hideHint);
    hintBtn.addEventListener('mouseleave', hideHint);

    // Also hide hint when clicking the overlay
    hintOverlay.addEventListener('click', hideHint);
}

function showHint(e) {
    e.preventDefault();
    document.getElementById('hint-overlay').classList.add('show');
    if (typeof playPop === 'function') playPop();
}

function hideHint() {
    document.getElementById('hint-overlay').classList.remove('show');
}

// ============ HELP BUTTON (ASK MICHALIS) ============
function setupHelpButton() {
    const helpBtn = document.getElementById('help-btn');
    helpBtn.addEventListener('click', askMichalisForHelp);
}

function askMichalisForHelp() {
    if (!puzzleStarted || puzzleSolved) return;

    // Find the appropriate message for current grid size
    const helpIndex = 4 - currentGridSize; // 4->0, 3->1, 2->2, 1->3
    if (helpIndex >= helpMessages.length) return; // No more help available

    const helpData = helpMessages[helpIndex];

    // Show help message overlay
    const overlay = document.getElementById('help-message-overlay');
    const bubble = document.getElementById('help-message-bubble');

    bubble.innerHTML = `
        <span class="michalis-name">Michalis says:</span>
        ${helpData.message}
        <span class="help-emoji">${helpData.emoji}</span>
    `;

    overlay.classList.add('show');
    if (typeof playPop === 'function') playPop();

    // After showing message, reduce grid
    setTimeout(() => {
        overlay.classList.remove('show');

        setTimeout(() => {
            reduceGrid(helpData.size);
        }, 300);
    }, 2500);
}

function reduceGrid(newSize) {
    currentGridSize = newSize;

    if (newSize === 0) {
        // No puzzle at all - instant win!
        handleZeroPuzzle();
        return;
    }

    if (newSize === 1) {
        // 1x1 puzzle - show single tile then auto-win
        handleOnePuzzle();
        return;
    }

    // Re-initialize puzzle with new size
    initPuzzle();

    // Play a sound
    if (typeof playChime === 'function') playChime();
}

function handleOnePuzzle() {
    const grid = document.getElementById('puzzle-grid');
    const totalTiles = 1;

    // Update grid CSS
    grid.style.gridTemplateColumns = `repeat(1, ${TILE_SIZE}px)`;
    grid.style.gridTemplateRows = `repeat(1, ${TILE_SIZE}px)`;
    grid.innerHTML = '';

    // Create single tile (already solved!)
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile correct';
    tile.style.backgroundPosition = '0px 0px';
    tile.style.backgroundSize = `${TILE_SIZE}px ${TILE_SIZE}px`;
    grid.appendChild(tile);

    if (typeof playChime === 'function') playChime();

    // Brief pause then complete
    setTimeout(() => {
        completePuzzle();
    }, 1500);
}

function handleZeroPuzzle() {
    const grid = document.getElementById('puzzle-grid');

    // Clear the grid entirely
    grid.style.gridTemplateColumns = 'none';
    grid.style.gridTemplateRows = 'none';
    grid.innerHTML = '<div class="zero-puzzle-message">🎉 You did it! (Sort of)</div>';
    grid.style.display = 'flex';
    grid.style.alignItems = 'center';
    grid.style.justifyContent = 'center';
    grid.style.minHeight = '200px';
    grid.style.color = '#f472b6';
    grid.style.fontSize = '1.2rem';
    grid.style.textAlign = 'center';

    if (typeof playCelebration === 'function') playCelebration();

    // Complete after brief pause
    setTimeout(() => {
        completePuzzle();
    }, 2000);
}

// ============ INITIALIZE PUZZLE ============
function initPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';

    const totalTiles = currentGridSize * currentGridSize;

    // Update grid CSS for current size
    grid.style.gridTemplateColumns = `repeat(${currentGridSize}, ${TILE_SIZE}px)`;
    grid.style.gridTemplateRows = `repeat(${currentGridSize}, ${TILE_SIZE}px)`;
    grid.style.display = 'grid'; // Reset in case of zero puzzle

    // Initialize solved state: [0, 1, 2, ..., n-1]
    puzzleState = Array.from({ length: totalTiles }, (_, i) => i);
    emptyPos = totalTiles - 1;

    // Shuffle the puzzle
    shufflePuzzle();

    // Create tiles
    renderPuzzle();
}

// ============ RENDER PUZZLE ============
function renderPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';

    const totalTiles = currentGridSize * currentGridSize;
    const emptyTileValue = totalTiles - 1;
    const bgSize = currentGridSize * TILE_SIZE;

    for (let pos = 0; pos < totalTiles; pos++) {
        const tileValue = puzzleState[pos];
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        tile.dataset.pos = pos;
        tile.dataset.value = tileValue;

        // Set background size for current grid
        tile.style.backgroundSize = `${bgSize}px ${bgSize}px`;

        if (tileValue === emptyTileValue) {
            // Empty tile
            tile.classList.add('empty');
        } else {
            // Set background position based on original tile position
            const origRow = Math.floor(tileValue / currentGridSize);
            const origCol = tileValue % currentGridSize;
            tile.style.backgroundPosition = `-${origCol * TILE_SIZE}px -${origRow * TILE_SIZE}px`;

            // Check if tile is in correct position
            if (tileValue === pos) {
                tile.classList.add('correct');
            }

            tile.addEventListener('click', () => handleTileClick(pos));
        }

        grid.appendChild(tile);
    }
}

// ============ SHUFFLE PUZZLE ============
function shufflePuzzle() {
    // Shuffle by making random valid moves
    // This guarantees the puzzle is solvable
    const numMoves = currentGridSize * currentGridSize * 10; // Scale with grid size
    const emptyTileValue = currentGridSize * currentGridSize - 1;

    for (let i = 0; i < numMoves; i++) {
        const neighbors = getValidMoves(emptyPos);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Swap empty with random neighbor
        puzzleState[emptyPos] = puzzleState[randomNeighbor];
        puzzleState[randomNeighbor] = emptyTileValue;
        emptyPos = randomNeighbor;
    }
}

// ============ GET VALID MOVES ============
function getValidMoves(emptyPosition) {
    const moves = [];
    const row = Math.floor(emptyPosition / currentGridSize);
    const col = emptyPosition % currentGridSize;

    // Up
    if (row > 0) moves.push(emptyPosition - currentGridSize);
    // Down
    if (row < currentGridSize - 1) moves.push(emptyPosition + currentGridSize);
    // Left
    if (col > 0) moves.push(emptyPosition - 1);
    // Right
    if (col < currentGridSize - 1) moves.push(emptyPosition + 1);

    return moves;
}

// ============ HANDLE TILE CLICK ============
function handleTileClick(clickedPos) {
    if (puzzleSolved || !puzzleStarted) return;

    const emptyTileValue = currentGridSize * currentGridSize - 1;

    // Check if clicked tile is adjacent to empty
    const validMoves = getValidMoves(emptyPos);

    if (validMoves.includes(clickedPos)) {
        // Swap tiles
        puzzleState[emptyPos] = puzzleState[clickedPos];
        puzzleState[clickedPos] = emptyTileValue;
        emptyPos = clickedPos;

        // Update move count
        moveCount++;
        document.getElementById('move-count').textContent = moveCount;

        // Play sound
        if (typeof playPop === 'function') playPop();

        // Re-render
        renderPuzzle();

        // Create sparkle at click position
        createSparkle(clickedPos);

        // Check win
        if (checkWin()) {
            completePuzzle();
        }
    }
}

// ============ CREATE SPARKLE EFFECT ============
function createSparkle(pos) {
    const grid = document.getElementById('puzzle-grid');
    const gridRect = grid.getBoundingClientRect();

    const row = Math.floor(pos / currentGridSize);
    const col = pos % currentGridSize;

    const sparkle = document.createElement('div');
    sparkle.className = 'puzzle-sparkle';
    sparkle.style.left = `${col * (TILE_SIZE + 4) + TILE_SIZE / 2}px`;
    sparkle.style.top = `${row * (TILE_SIZE + 4) + TILE_SIZE / 2}px`;

    grid.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1000);
}

// ============ CHECK WIN ============
function checkWin() {
    const totalTiles = currentGridSize * currentGridSize;
    for (let i = 0; i < totalTiles; i++) {
        if (puzzleState[i] !== i) return false;
    }
    return true;
}

// ============ REVEAL MISSING PIECE ============
function revealMissingPiece() {
    const grid = document.getElementById('puzzle-grid');
    const emptyTile = grid.querySelector('.puzzle-tile.empty');

    if (emptyTile) {
        const bgSize = currentGridSize * TILE_SIZE;
        const emptyTileValue = currentGridSize * currentGridSize - 1;

        // Calculate background position for the missing piece (bottom-right corner)
        const origRow = Math.floor(emptyTileValue / currentGridSize);
        const origCol = emptyTileValue % currentGridSize;

        // Remove empty class and show the final piece
        emptyTile.classList.remove('empty');
        emptyTile.classList.add('correct', 'revealed');
        emptyTile.style.backgroundPosition = `-${origCol * TILE_SIZE}px -${origRow * TILE_SIZE}px`;
        emptyTile.style.backgroundSize = `${bgSize}px ${bgSize}px`;
    }
}

// ============ COMPLETE PUZZLE ============
function completePuzzle() {
    puzzleSolved = true;
    puzzleStarted = false;

    // Reveal the missing piece to show complete image
    revealMissingPiece();

    // Play celebration sound
    if (typeof playCelebration === 'function') playCelebration();

    // Create multiple sparkles
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'puzzle-sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            document.getElementById('puzzle-stage').appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }, i * 100);
    }

    // Show completion overlay after a moment
    setTimeout(() => {
        document.getElementById('puzzle-container').classList.remove('show');
        document.getElementById('puzzle-complete').classList.add('show');

        // Transition to final screen
        setTimeout(() => {
            endStage3();
        }, 4000);
    }, 1000);
}

// ============ END STAGE 3 ============
function endStage3() {
    document.getElementById('puzzle-complete').classList.remove('show');
    document.getElementById('puzzle-stage').classList.remove('active');
    document.getElementById('final-screen').classList.add('active');

    // Trigger final screen effects
    if (typeof createFloatingHearts === 'function') createFloatingHearts();
    if (typeof playCelebration === 'function') playCelebration();
    setTimeout(() => {
        if (typeof startLullaby === 'function') startLullaby();
    }, 2000);
}

// ============ RESET STAGE 3 ============
function resetStage3() {
    puzzleState = [];
    emptyPos = 15;
    moveCount = 0;
    puzzleSolved = false;
    puzzleStarted = false;
    currentGridSize = 4; // Reset to default

    // Reset UI
    document.getElementById('move-count').textContent = '0';

    // Reset grid styles
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(4, ${TILE_SIZE}px)`;
    grid.style.gridTemplateRows = `repeat(4, ${TILE_SIZE}px)`;
    grid.style.minHeight = '';
    grid.style.alignItems = '';
    grid.style.justifyContent = '';
    grid.style.color = '';
    grid.style.fontSize = '';
    grid.style.textAlign = '';

    document.getElementById('puzzle-intro').classList.remove('show');
    document.getElementById('puzzle-container').classList.remove('show');
    document.getElementById('puzzle-complete').classList.remove('show');
    document.getElementById('hint-overlay').classList.remove('show');
    document.getElementById('help-message-overlay').classList.remove('show');

    // Remove any lingering sparkles
    document.querySelectorAll('#puzzle-stage .puzzle-sparkle').forEach(s => s.remove());
}
