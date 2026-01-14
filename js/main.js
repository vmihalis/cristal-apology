// ============ MAIN APPLICATION ============
// Core initialization and common utilities

// ============ CONFIGURATION ============
const messages = [
    "Hour 1 alone... I'm so sorry my phone betrayed us 😢",
    "Hour 2... I tried calling you back, I promise I did 📱",
    "Hour 3... My heart was still on that call with you 💕",
    "Hour 4... Even in my sleep, I was reaching for you",
    "Hour 5... The night felt so empty without your breathing",
    "Hour 6... I dreamed we were still talking 💭",
    "Hour 7... Waking up without you online broke my heart",
    "Hour 8... Every minute apart made me miss you more 💗"
];

// ============ INITIALIZATION ============
function init() {
    createStars();
    startShootingStars();
    updateSoundIcon();
}

function createStars() {
    const container = document.getElementById('stars');
    const starCount = 80;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 70 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        star.style.setProperty('--delay', (Math.random() * 5) + 's');
        container.appendChild(star);
    }
}

// ============ SHOOTING STARS ============
function startShootingStars() {
    // Spawn a shooting star every 3-8 seconds
    function scheduleNext() {
        const delay = 3000 + Math.random() * 5000;
        setTimeout(() => {
            createShootingStar();
            scheduleNext();
        }, delay);
    }
    // Start with one after a short delay
    setTimeout(createShootingStar, 2000);
    scheduleNext();
}

function createShootingStar() {
    const container = document.getElementById('stars');
    const star = document.createElement('div');
    star.className = 'shooting-star';

    // Random starting position (upper-left portion of sky)
    star.style.left = (5 + Math.random() * 50) + '%';
    star.style.top = (5 + Math.random() * 25) + '%';

    // Random properties for variety
    const duration = 0.6 + Math.random() * 0.5;
    const distance = 300 + Math.random() * 300;
    const tailLength = 80 + Math.random() * 80;
    const angle = 25 + Math.random() * 30; // 25 to 55 degrees (diagonal down-right)

    star.style.setProperty('--duration', duration + 's');
    star.style.setProperty('--distance', distance + 'px');
    star.style.setProperty('--tail-length', tailLength + 'px');
    star.style.setProperty('--angle', angle + 'deg');

    container.appendChild(star);

    // Remove after animation completes
    setTimeout(() => star.remove(), duration * 1000 + 100);
}

// ============ FLOATING HEARTS ============
function createFloatingHearts() {
    const container = document.getElementById('floating-hearts');
    const hearts = ['💕', '💗', '💖', '💜', '🤍'];

    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 8 + 's';
        heart.style.fontSize = (15 + Math.random() * 15) + 'px';
        container.appendChild(heart);
    }
}

// ============ REPLAY FUNCTION ============
function replay() {
    // Stop sounds
    stopLullaby();
    stopAmbientSounds();
    playPop();

    // Clear sheep
    document.getElementById('sheep-area').innerHTML = '';
    activeSheep.clear();

    // Reset Stage 1 state
    sheepCaught = 0;
    gameStarted = false;
    sheepIdCounter = 0;
    lastPatternIndex = -1;
    document.getElementById('sheep-count').textContent = '0';
    document.getElementById('floating-hearts').innerHTML = '';

    // Hide message card if visible
    document.getElementById('message-card').classList.remove('show');

    // Reset Stage 2
    resetStage2();

    // Reset Stage 3 (Puzzle)
    resetStage3();

    // Switch screens (hide all, show title)
    document.getElementById('final-screen').classList.remove('active');
    document.getElementById('puzzle-stage').classList.remove('active');
    document.getElementById('phone-stage').classList.remove('active');
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('title-screen').classList.add('active');
}

// Initialize on load
window.onload = init;
