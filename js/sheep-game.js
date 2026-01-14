// ============ STAGE 1: SHEEP COUNTING GAME ============

// State
let sheepCaught = 0;           // Total sheep caught
let gameStarted = false;
let sheepIdCounter = 0;        // Unique ID for each sheep
let activeSheep = new Map();   // Track active sheep on screen
const TOTAL_SHEEP_NEEDED = 8;  // Sheep needed to win

// Animation patterns with their properties
const PATTERNS = [
    { name: 'sheepJumpLeft', duration: [2.5, 3.5], easing: 'ease-in-out', flip: 1 },
    { name: 'sheepJumpRight', duration: [2.5, 3.5], easing: 'ease-in-out', flip: -1 },
    { name: 'sheepBounce', duration: [3, 4], easing: 'ease-in-out', flip: 1 },
    { name: 'sheepDash', duration: [1.5, 2.2], easing: 'ease-out', flip: 1 },
    { name: 'sheepZigzag', duration: [3, 4], easing: 'linear', flip: 1 },
    { name: 'sheepFloat', duration: [3.5, 4.5], easing: 'ease-in-out', flip: 1 },
];

let lastPatternIndex = -1; // Track last used pattern to avoid repeats

// ============ GAME FLOW ============

function startGame() {
    initAudio();
    playChime();
    startAmbientSounds();
    document.getElementById('title-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    gameStarted = true;

    // Spawn first sheep
    setTimeout(spawnSheep, 500);
}

function spawnSheep() {
    if (!gameStarted || sheepCaught >= TOTAL_SHEEP_NEEDED) return;

    const sheepArea = document.getElementById('sheep-area');
    const sheepId = sheepIdCounter++;

    // Pick a random pattern (avoid repeating the same one)
    let patternIndex;
    do {
        patternIndex = Math.floor(Math.random() * PATTERNS.length);
    } while (patternIndex === lastPatternIndex && PATTERNS.length > 1);
    lastPatternIndex = patternIndex;

    const pattern = PATTERNS[patternIndex];

    // Randomize within the pattern's ranges
    const duration = pattern.duration[0] + Math.random() * (pattern.duration[1] - pattern.duration[0]);
    const startY = 22 + Math.random() * 10;    // 22-32%
    const peakY = 55 + Math.random() * 20;     // 55-75%
    const endY = 22 + Math.random() * 10;      // 22-32%
    const size = 0.85 + Math.random() * 0.3;   // 0.85-1.15 scale

    // Create sheep element
    const sheepContainer = document.createElement('div');
    sheepContainer.className = 'sheep-container';
    sheepContainer.dataset.sheepId = sheepId;

    // Set CSS custom properties
    sheepContainer.style.setProperty('--animation-name', pattern.name);
    sheepContainer.style.setProperty('--duration', duration + 's');
    sheepContainer.style.setProperty('--easing', pattern.easing);
    sheepContainer.style.setProperty('--start-y', startY + '%');
    sheepContainer.style.setProperty('--peak-y', peakY + '%');
    sheepContainer.style.setProperty('--end-y', endY + '%');
    sheepContainer.style.setProperty('--size', size);
    sheepContainer.style.setProperty('--flip', pattern.flip);

    // Sheep SVG
    sheepContainer.innerHTML = getSheepSVG();

    // Click handler
    sheepContainer.addEventListener('click', () => catchSheep(sheepContainer, sheepId));

    // Track this sheep
    activeSheep.set(sheepId, sheepContainer);

    // Add to DOM
    sheepArea.appendChild(sheepContainer);
    playBoing();

    // Handle animation end (sheep escaped)
    sheepContainer.addEventListener('animationend', () => {
        if (!sheepContainer.classList.contains('caught')) {
            sheepContainer.classList.add('escaped');
            activeSheep.delete(sheepId);
            setTimeout(() => {
                sheepContainer.remove();
                // Spawn next sheep after a short delay
                if (gameStarted && sheepCaught < TOTAL_SHEEP_NEEDED) {
                    setTimeout(spawnSheep, 400);
                }
            }, 100);
        }
    });
}

function getSheepSVG() {
    return `
        <div class="sheep">
            <svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
                <g class="wool-body">
                    <ellipse cx="85" cy="45" rx="18" ry="16" fill="#f5f5f5"/>
                    <ellipse cx="75" cy="35" rx="15" ry="13" fill="#fafafa"/>
                    <ellipse cx="90" cy="38" rx="12" ry="11" fill="#f0f0f0"/>
                    <ellipse cx="65" cy="48" rx="25" ry="20" fill="#ffffff"/>
                    <ellipse cx="55" cy="38" rx="18" ry="15" fill="#fafafa"/>
                    <ellipse cx="75" cy="42" rx="16" ry="14" fill="#f8f8f8"/>
                    <ellipse cx="60" cy="55" rx="20" ry="14" fill="#f5f5f5"/>
                    <ellipse cx="50" cy="32" rx="14" ry="12" fill="#ffffff"/>
                    <ellipse cx="68" cy="30" rx="12" ry="10" fill="#fafafa"/>
                    <ellipse cx="80" cy="32" rx="10" ry="9" fill="#f8f8f8"/>
                    <ellipse cx="42" cy="45" rx="15" ry="14" fill="#ffffff"/>
                    <ellipse cx="38" cy="38" rx="10" ry="9" fill="#fafafa"/>
                </g>
                <ellipse cx="100" cy="48" rx="10" ry="9" fill="#f0f0f0"/>
                <ellipse cx="105" cy="45" rx="7" ry="6" fill="#fafafa"/>
                <g class="legs">
                    <path d="M78 62 L80 80 L76 80 L74 62" fill="#3d3d3d"/>
                    <ellipse cx="78" cy="80" rx="3" ry="2" fill="#2d2d2d"/>
                    <path d="M68 63 L70 80 L66 80 L64 63" fill="#3d3d3d"/>
                    <ellipse cx="68" cy="80" rx="3" ry="2" fill="#2d2d2d"/>
                    <path d="M52 60 L54 80 L50 80 L48 60" fill="#3d3d3d"/>
                    <ellipse cx="52" cy="80" rx="3" ry="2" fill="#2d2d2d"/>
                    <path d="M42 58 L44 78 L40 78 L38 58" fill="#3d3d3d"/>
                    <ellipse cx="42" cy="78" rx="3" ry="2" fill="#2d2d2d"/>
                </g>
                <g class="head">
                    <ellipse cx="18" cy="28" rx="8" ry="5" fill="#4a4a4a" transform="rotate(-30 18 28)"/>
                    <ellipse cx="38" cy="22" rx="8" ry="5" fill="#4a4a4a" transform="rotate(30 38 22)"/>
                    <ellipse cx="18" cy="28" rx="5" ry="3" fill="#ffb6c1" transform="rotate(-30 18 28)"/>
                    <ellipse cx="38" cy="22" rx="5" ry="3" fill="#ffb6c1" transform="rotate(30 38 22)"/>
                    <ellipse cx="28" cy="38" rx="18" ry="16" fill="#3d3d3d"/>
                    <ellipse cx="28" cy="25" rx="12" ry="8" fill="#ffffff"/>
                    <ellipse cx="22" cy="28" rx="8" ry="6" fill="#fafafa"/>
                    <ellipse cx="34" cy="28" rx="8" ry="6" fill="#fafafa"/>
                    <path d="M20 38 Q23 42 26 38" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path d="M30 38 Q33 42 36 38" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <ellipse cx="17" cy="44" rx="5" ry="3" fill="#ffb6c1" opacity="0.6"/>
                    <ellipse cx="39" cy="44" rx="5" ry="3" fill="#ffb6c1" opacity="0.6"/>
                    <ellipse cx="28" cy="48" rx="3" ry="2" fill="#2d2d2d"/>
                    <path d="M25 52 Q28 55 31 52" stroke="#2d2d2d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </g>
            </svg>
        </div>
    `;
}

function catchSheep(sheepElement, sheepId) {
    // Prevent double-catching
    if (sheepElement.classList.contains('caught') || sheepCaught >= TOTAL_SHEEP_NEEDED) return;

    // Get position BEFORE stopping animation
    const rect = sheepElement.getBoundingClientRect();

    // Fix the sheep's position where it was caught
    sheepElement.style.left = rect.left + 'px';
    sheepElement.style.top = rect.top + 'px';
    sheepElement.style.bottom = 'auto';
    sheepElement.style.right = 'auto';
    sheepElement.style.position = 'fixed';
    sheepElement.style.animation = 'sheepPoof 0.4s ease forwards';

    sheepElement.classList.add('caught');
    activeSheep.delete(sheepId);

    // Play sounds
    playBaa();
    setTimeout(playSparkle, 100);

    // Hearts burst at caught position
    createHeartsBurst(rect.left + rect.width/2, rect.top + rect.height/2);

    // Update count
    sheepCaught++;
    document.getElementById('sheep-count').textContent = sheepCaught;

    // Remove sheep after poof animation
    setTimeout(() => {
        sheepElement.remove();

        // Show message
        if (sheepCaught <= messages.length) {
            showMessage(messages[sheepCaught - 1]);
        }
    }, 400);
}

function createHeartsBurst(x, y) {
    const hearts = ['💕', '💗', '💖', '✨', '💜', '🤍'];
    const container = document.getElementById('game-screen');

    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('div');
        heart.className = 'burst-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'fixed';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';

        const angle = (i / 10) * Math.PI * 2;
        const distance = 60 + Math.random() * 60;
        heart.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        heart.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

        container.appendChild(heart);
        setTimeout(() => heart.remove(), 1000);
    }
}

function showMessage(text) {
    const card = document.getElementById('message-card');
    const messageText = document.getElementById('message-text');
    messageText.textContent = text;
    card.classList.add('show');
    playWhoosh();
}

function nextSheep() {
    playPop();
    const card = document.getElementById('message-card');
    card.classList.remove('show');

    // Check if game is complete
    if (sheepCaught >= TOTAL_SHEEP_NEEDED) {
        setTimeout(showFinalScreen, 300);
    } else {
        // Spawn next sheep
        setTimeout(spawnSheep, 300);
    }
}

function showFinalScreen() {
    // Clear any remaining sheep
    document.getElementById('sheep-area').innerHTML = '';
    activeSheep.clear();

    // Transition to Stage 2 instead of final screen
    document.getElementById('game-screen').classList.remove('active');
    startStage2();
}
