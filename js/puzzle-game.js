/* ============================================
   STAGE 3: PUZZLE GAME
   ============================================ */

// Puzzle State
let puzzleState = [];      // Array of tile positions (0-15, where 15 is empty)
let emptyPos = 15;         // Current position of empty space
let moveCount = 0;
let puzzleSolved = false;
let puzzleStarted = false;

const GRID_SIZE = 4;
const TILE_SIZE = 80;      // px
const TOTAL_TILES = 16;

// ============ START STAGE 3 ============
function startStage3() {
    puzzleSolved = false;
    puzzleStarted = false;
    moveCount = 0;
    document.getElementById('move-count').textContent = '0';

    // Setup hint button
    setupHintButton();

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

// ============ INITIALIZE PUZZLE ============
function initPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';

    // Initialize solved state: [0, 1, 2, ..., 14, 15]
    puzzleState = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    emptyPos = 15;

    // Shuffle the puzzle
    shufflePuzzle();

    // Create tiles
    renderPuzzle();
}

// ============ RENDER PUZZLE ============
function renderPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';

    for (let pos = 0; pos < TOTAL_TILES; pos++) {
        const tileValue = puzzleState[pos];
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        tile.dataset.pos = pos;
        tile.dataset.value = tileValue;

        if (tileValue === 15) {
            // Empty tile
            tile.classList.add('empty');
        } else {
            // Set background position based on original tile position
            const origRow = Math.floor(tileValue / GRID_SIZE);
            const origCol = tileValue % GRID_SIZE;
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
    const numMoves = 150;

    for (let i = 0; i < numMoves; i++) {
        const neighbors = getValidMoves(emptyPos);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Swap empty with random neighbor
        puzzleState[emptyPos] = puzzleState[randomNeighbor];
        puzzleState[randomNeighbor] = 15;
        emptyPos = randomNeighbor;
    }
}

// ============ GET VALID MOVES ============
function getValidMoves(emptyPosition) {
    const moves = [];
    const row = Math.floor(emptyPosition / GRID_SIZE);
    const col = emptyPosition % GRID_SIZE;

    // Up
    if (row > 0) moves.push(emptyPosition - GRID_SIZE);
    // Down
    if (row < GRID_SIZE - 1) moves.push(emptyPosition + GRID_SIZE);
    // Left
    if (col > 0) moves.push(emptyPosition - 1);
    // Right
    if (col < GRID_SIZE - 1) moves.push(emptyPosition + 1);

    return moves;
}

// ============ HANDLE TILE CLICK ============
function handleTileClick(clickedPos) {
    if (puzzleSolved || !puzzleStarted) return;

    // Check if clicked tile is adjacent to empty
    const validMoves = getValidMoves(emptyPos);

    if (validMoves.includes(clickedPos)) {
        // Swap tiles
        puzzleState[emptyPos] = puzzleState[clickedPos];
        puzzleState[clickedPos] = 15;
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

    const row = Math.floor(pos / GRID_SIZE);
    const col = pos % GRID_SIZE;

    const sparkle = document.createElement('div');
    sparkle.className = 'puzzle-sparkle';
    sparkle.style.left = `${col * (TILE_SIZE + 4) + TILE_SIZE / 2}px`;
    sparkle.style.top = `${row * (TILE_SIZE + 4) + TILE_SIZE / 2}px`;

    grid.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1000);
}

// ============ CHECK WIN ============
function checkWin() {
    for (let i = 0; i < TOTAL_TILES; i++) {
        if (puzzleState[i] !== i) return false;
    }
    return true;
}

// ============ COMPLETE PUZZLE ============
function completePuzzle() {
    puzzleSolved = true;
    puzzleStarted = false;

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

    // Reset UI
    document.getElementById('move-count').textContent = '0';
    document.getElementById('puzzle-grid').innerHTML = '';
    document.getElementById('puzzle-intro').classList.remove('show');
    document.getElementById('puzzle-container').classList.remove('show');
    document.getElementById('puzzle-complete').classList.remove('show');
    document.getElementById('hint-overlay').classList.remove('show');

    // Remove any lingering sparkles
    document.querySelectorAll('#puzzle-stage .puzzle-sparkle').forEach(s => s.remove());
}
