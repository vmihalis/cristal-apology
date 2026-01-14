// ============ STAGE 2: PHONE CHARGING MINI-GAME ============

// Stage 2 State
let stage2Phase = 'idle'; // idle, calldying, wakeup, search, charging, calling, complete
let callAttempts = 0;
const MAX_CALL_ATTEMPTS = 3;
let searchedItems = new Set();
let callTimerInterval = null;

// Search feedback messages for wrong items
const searchFeedback = {
    lamp: "Not under the lamp...",
    book: "Nope, just a book...",
    slippers: "Just my slippers...",
    plant: "Behind the plant? No...",
    clothes: "Not in my clothes...",
    charger: "Found it!"
};

// Sad messages during charging
const chargingMessages = [
    "Cristal turns over in bed, reaching for her phone...",
    "She wonders why it got so quiet...",
    "The silence feels wrong without your voice...",
    "She pulls the blanket closer, feeling alone...",
    "Her phone shows 'Call Ended'...",
    "She waits, hoping you'll call back..."
];

// No answer messages
const noAnswerMessages = [
    "No answer... she must be in deep sleep 😢",
    "Still no answer... please pick up...",
    "She didn't hear it... I'm so sorry, Cristal..."
];

// ============ START STAGE 2 ============
function startStage2() {
    document.getElementById('phone-stage').classList.add('active');
    stage2Phase = 'calldying';
    stopAmbientSounds();

    // Start with call dying intro
    runCallDyingIntro();
}

// ============ CALL DYING INTRO PHASE ============
// Shows you were on call when phone died
function runCallDyingIntro() {
    const callDyingScreen = document.getElementById('call-dying-screen');
    const lowBatteryWarning = document.getElementById('low-battery-warning');
    const phoneDyingOverlay = document.getElementById('phone-dying-overlay');
    const callDisconnectedMsg = document.getElementById('call-disconnected-msg');
    const callTimer = document.getElementById('call-timer');
    const phoneScreenSmall = document.getElementById('phone-screen');

    // Show the floating phone screen
    callDyingScreen.classList.add('show');

    // Small phone on nightstand shows it's on a call (green glow)
    phoneScreenSmall.classList.add('on-call');
    phoneScreenSmall.querySelector('.phone-battery-icon').textContent = '📞';

    // Start with a running call timer (simulate being on call for ~2h47m)
    let hours = 2;
    let minutes = 47;
    let seconds = 13;

    callTimerInterval = setInterval(() => {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
        callTimer.textContent =
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
    }, 1000);

    // After 2 seconds, show low battery warning
    setTimeout(() => {
        lowBatteryWarning.classList.add('show');
        playAlarm(); // Warning beep
    }, 2000);

    // After 4 seconds, phone dies
    setTimeout(() => {
        clearInterval(callTimerInterval);
        playPhoneDie();
        phoneDyingOverlay.classList.add('show');

        // Small phone also dies
        phoneScreenSmall.classList.remove('on-call');
        phoneScreenSmall.classList.add('dead');
        phoneScreenSmall.querySelector('.phone-battery-icon').textContent = '💀';
    }, 4000);

    // After 5.5 seconds, show disconnected message
    setTimeout(() => {
        callDisconnectedMsg.classList.add('show');
    }, 5500);

    // After 7.5 seconds, hide floating phone and transition to search
    setTimeout(() => {
        callDyingScreen.classList.remove('show');
        stage2Phase = 'wakeup';
        runWakeUpPhase();
    }, 7500);
}

// ============ WAKE UP PHASE ============
// Phone already died in intro phase
function runWakeUpPhase() {
    // Brief pause then show wake up alert
    setTimeout(() => {
        document.getElementById('wake-up-alert').classList.add('show');
        playAlarm();

        // Stop sleeper's zzz animation
        const sleeper = document.getElementById('sleeper');
        sleeper.querySelectorAll('.sleeper-zzz').forEach(z => z.style.animation = 'none');

        // Transition to search phase
        setTimeout(() => {
            document.getElementById('wake-up-alert').classList.remove('show');
            runSearchPhase();
        }, 2000);
    }, 500);
}

// ============ SEARCH PHASE ============
// Search for charger
function runSearchPhase() {
    stage2Phase = 'search';
    document.getElementById('search-prompt').classList.add('show');

    // Set up click handlers for searchable items
    document.querySelectorAll('.searchable').forEach(item => {
        item.addEventListener('click', handleSearchClick);
    });
}

function handleSearchClick(e) {
    if (stage2Phase !== 'search') return;

    const item = e.currentTarget;
    const itemType = item.dataset.item;

    if (searchedItems.has(itemType)) return;
    searchedItems.add(itemType);

    playSearchTap();

    // Show feedback
    const feedback = document.getElementById('search-feedback');
    feedback.textContent = searchFeedback[itemType];
    feedback.classList.add('show');

    setTimeout(() => {
        feedback.classList.remove('show');
    }, 1500);

    if (itemType === 'charger') {
        // Found it!
        item.classList.add('searched', 'found');
        playFoundCharger();
        document.getElementById('search-prompt').classList.remove('show');

        setTimeout(() => {
            runChargingPhase();
        }, 1500);
    } else {
        item.classList.add('searched');
    }
}

// ============ CHARGING MINI-GAME ============
// Catch the falling energy orbs

let chargingGameState = {
    active: false,
    battery: 0,
    targetBattery: 35,
    phoneX: 50, // percentage
    isDragging: false,
    orbSpawnInterval: null,
    gameLoopInterval: null,
    orbs: [],
    messageIndex: 0
};

function runChargingPhase() {
    stage2Phase = 'charging';

    // Reset game state
    chargingGameState = {
        active: true,
        battery: 0,
        targetBattery: 35,
        phoneX: 50,
        isDragging: false,
        orbSpawnInterval: null,
        gameLoopInterval: null,
        orbs: [],
        messageIndex: 0
    };

    // Show charging screen
    document.getElementById('charging-screen').classList.add('show');

    // Initialize UI
    updateBatteryDisplay();

    // Set up phone dragging
    setupPhoneDragging();

    // Start spawning orbs
    chargingGameState.orbSpawnInterval = setInterval(spawnOrb, 800);

    // Start game loop for collision detection
    chargingGameState.gameLoopInterval = setInterval(gameLoop, 50);

    // Show messages periodically
    showChargingMessages();
}

function setupPhoneDragging() {
    const phone = document.getElementById('catcher-phone');
    const gameArea = document.getElementById('charging-game-area');

    // Mouse events
    phone.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch events
    phone.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);

    function startDrag(e) {
        if (!chargingGameState.active) return;
        e.preventDefault();
        chargingGameState.isDragging = true;
        phone.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (!chargingGameState.isDragging || !chargingGameState.active) return;
        e.preventDefault();

        const gameRect = gameArea.getBoundingClientRect();
        let clientX;

        if (e.touches) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }

        // Calculate percentage position
        let newX = ((clientX - gameRect.left) / gameRect.width) * 100;

        // Clamp between 10% and 90%
        newX = Math.max(10, Math.min(90, newX));

        chargingGameState.phoneX = newX;
        phone.style.left = newX + '%';
    }

    function endDrag() {
        chargingGameState.isDragging = false;
        const phone = document.getElementById('catcher-phone');
        if (phone) phone.style.cursor = 'grab';
    }
}

function spawnOrb() {
    if (!chargingGameState.active) return;

    const container = document.getElementById('orbs-container');
    const orb = document.createElement('div');
    orb.className = 'energy-orb';

    // Random horizontal position (10% to 90%)
    const xPos = 10 + Math.random() * 80;

    // Determine orb type with weighted probability
    const rand = Math.random();
    let orbType, orbValue, duration;

    if (rand < 0.50) {
        // 50% chance - green (standard)
        orbType = 'green';
        orbValue = 3;
        duration = 4.0;
    } else if (rand < 0.75) {
        // 25% chance - blue (bonus)
        orbType = 'blue';
        orbValue = 5;
        duration = 3.5;
    } else if (rand < 0.88) {
        // 13% chance - gold (super bonus)
        orbType = 'gold';
        orbValue = 8;
        duration = 3.0;
    } else {
        // 12% chance - surge (danger)
        orbType = 'surge';
        orbValue = -5;
        duration = 3.2;
    }

    orb.classList.add(orbType);
    orb.style.left = xPos + '%';
    orb.style.animationDuration = duration + 's';

    // Store orb data
    const orbData = {
        element: orb,
        x: xPos,
        type: orbType,
        value: orbValue,
        createdAt: Date.now(),
        duration: duration * 1000
    };

    chargingGameState.orbs.push(orbData);
    container.appendChild(orb);

    // Remove orb after animation completes
    setTimeout(() => {
        removeOrb(orbData);
    }, duration * 1000);
}

function removeOrb(orbData) {
    const index = chargingGameState.orbs.indexOf(orbData);
    if (index > -1) {
        chargingGameState.orbs.splice(index, 1);
    }
    if (orbData.element && orbData.element.parentNode) {
        orbData.element.parentNode.removeChild(orbData.element);
    }
}

function gameLoop() {
    if (!chargingGameState.active) return;

    const phone = document.getElementById('catcher-phone');
    const gameArea = document.getElementById('charging-game-area');
    if (!phone || !gameArea) return;

    const phoneRect = phone.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    // Check collision with each orb
    const orbsToRemove = [];

    chargingGameState.orbs.forEach(orbData => {
        if (!orbData.element) return;

        const orbRect = orbData.element.getBoundingClientRect();

        // Check if orb overlaps with phone
        if (isColliding(phoneRect, orbRect)) {
            orbsToRemove.push(orbData);

            // Apply effect
            applyOrbEffect(orbData, orbRect);
        }
    });

    // Remove caught orbs
    orbsToRemove.forEach(orb => removeOrb(orb));
}

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom);
}

function applyOrbEffect(orbData, orbRect) {
    const phone = document.getElementById('catcher-phone');

    // Update battery
    chargingGameState.battery += orbData.value;
    chargingGameState.battery = Math.max(0, Math.min(100, chargingGameState.battery));

    updateBatteryDisplay();

    // Visual feedback
    createCatchEffect(orbRect, orbData.type);
    createScorePopup(orbRect, orbData.value);

    // Phone visual feedback and sound
    if (orbData.type === 'surge') {
        phone.classList.add('hit-surge');
        playSurgeHit();
        setTimeout(() => phone.classList.remove('hit-surge'), 300);
    } else {
        phone.classList.add('catching');
        const isBonus = orbData.type === 'gold' || orbData.type === 'blue';
        playCatch(isBonus);
        setTimeout(() => phone.classList.remove('catching'), 200);
    }

    // Check win condition
    if (chargingGameState.battery >= chargingGameState.targetBattery) {
        endChargingGame();
    }
}

function createCatchEffect(orbRect, type) {
    const effect = document.createElement('div');
    effect.className = 'catch-effect ' + type;
    effect.style.left = orbRect.left + orbRect.width / 2 - 30 + 'px';
    effect.style.top = orbRect.top + orbRect.height / 2 - 30 + 'px';

    document.getElementById('charging-game-area').appendChild(effect);

    setTimeout(() => {
        if (effect.parentNode) effect.parentNode.removeChild(effect);
    }, 400);
}

function createScorePopup(orbRect, value) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';

    if (value > 0) {
        popup.textContent = '+' + value + '%';
        if (value >= 8) {
            popup.classList.add('super');
        } else if (value >= 5) {
            popup.classList.add('bonus');
        } else {
            popup.classList.add('positive');
        }
    } else {
        popup.textContent = value + '%';
        popup.classList.add('negative');
    }

    popup.style.left = orbRect.left + orbRect.width / 2 + 'px';
    popup.style.top = orbRect.top + 'px';

    document.getElementById('charging-game-area').appendChild(popup);

    setTimeout(() => {
        if (popup.parentNode) popup.parentNode.removeChild(popup);
    }, 800);
}

function updateBatteryDisplay() {
    const fill = document.getElementById('hud-battery-fill');
    const percent = document.getElementById('battery-percent');

    if (!fill || !percent) return;

    const battery = chargingGameState.battery;
    fill.style.width = (battery / chargingGameState.targetBattery * 100) + '%';
    percent.textContent = battery;

    // Update color based on level
    fill.classList.remove('medium', 'good');
    if (battery >= 25) {
        fill.classList.add('good');
    } else if (battery >= 15) {
        fill.classList.add('medium');
    }
}

function showChargingMessages() {
    if (!chargingGameState.active) return;

    const message = document.getElementById('charging-message');

    if (chargingGameState.messageIndex < chargingMessages.length) {
        message.textContent = chargingMessages[chargingGameState.messageIndex];
        message.classList.add('show');
        chargingGameState.messageIndex++;

        setTimeout(() => {
            message.classList.remove('show');

            // Show next message after delay
            setTimeout(() => {
                showChargingMessages();
            }, 3000);
        }, 2500);
    }
}

function endChargingGame() {
    chargingGameState.active = false;

    // Stop spawning and game loop
    if (chargingGameState.orbSpawnInterval) {
        clearInterval(chargingGameState.orbSpawnInterval);
    }
    if (chargingGameState.gameLoopInterval) {
        clearInterval(chargingGameState.gameLoopInterval);
    }

    // Clear remaining orbs
    const container = document.getElementById('orbs-container');
    if (container) container.innerHTML = '';
    chargingGameState.orbs = [];

    // Show completion message
    playSparkle();
    document.getElementById('charging-complete').classList.add('show');

    // Transition to calling phase
    setTimeout(() => {
        document.getElementById('charging-complete').classList.remove('show');
        document.getElementById('charging-message').classList.remove('show');
        document.getElementById('charging-screen').classList.remove('show');
        runCallingPhase();
    }, 2500);
}

function cleanupChargingGame() {
    chargingGameState.active = false;

    if (chargingGameState.orbSpawnInterval) {
        clearInterval(chargingGameState.orbSpawnInterval);
    }
    if (chargingGameState.gameLoopInterval) {
        clearInterval(chargingGameState.gameLoopInterval);
    }

    const container = document.getElementById('orbs-container');
    if (container) container.innerHTML = '';

    chargingGameState.orbs = [];
}

// ============ CALLING PHASE ============
// Calling with no answer
function runCallingPhase() {
    stage2Phase = 'calling';
    callAttempts = 0;

    document.getElementById('calling-screen').classList.add('show');
    startCallAttempt();
}

function startCallAttempt() {
    const callStatus = document.getElementById('call-status');
    const noAnswerMsg = document.getElementById('no-answer-msg');
    const retryBtn = document.getElementById('retry-call-btn');
    const endBtn = document.getElementById('end-call-btn');

    callStatus.textContent = 'Calling...';
    callStatus.classList.add('ringing');
    noAnswerMsg.classList.remove('show');
    retryBtn.style.display = 'none';
    endBtn.style.display = 'flex';

    // Play ringing sounds
    let ringCount = 0;
    const ringInterval = setInterval(() => {
        playRinging();
        ringCount++;

        if (ringCount >= 4) {
            clearInterval(ringInterval);
            // No answer
            callStatus.classList.remove('ringing');
            callStatus.textContent = 'No answer';
            playNoAnswer();

            callAttempts++;

            setTimeout(() => {
                noAnswerMsg.textContent = noAnswerMessages[Math.min(callAttempts - 1, noAnswerMessages.length - 1)];
                noAnswerMsg.classList.add('show');

                if (callAttempts < MAX_CALL_ATTEMPTS) {
                    retryBtn.style.display = 'flex';
                    endBtn.style.display = 'none';
                } else {
                    // Final attempt failed
                    setTimeout(() => {
                        endStage2();
                    }, 2500);
                }
            }, 500);
        }
    }, 1200);
}

function retryCall() {
    playPop();
    startCallAttempt();
}

function endCallAttempt() {
    playPop();
    endStage2();
}

function endStage2() {
    stage2Phase = 'complete';

    // Show morning light
    document.getElementById('morning-light').classList.add('rising');

    // Hide calling screen
    document.getElementById('calling-screen').classList.remove('show');

    // Show transition message
    const transition = document.getElementById('stage-transition');
    const transitionText = document.getElementById('stage-transition-text');
    transitionText.innerHTML = "She slept alone that night...<br>cold and sad...<br>waiting for a call that never came...";
    transition.classList.add('show');

    playSadChord();

    // Transition to final screen
    setTimeout(() => {
        transition.classList.remove('show');
        document.getElementById('phone-stage').classList.remove('active');
        document.getElementById('final-screen').classList.add('active');
        createFloatingHearts();
        playCelebration();
        setTimeout(startLullaby, 2000);
    }, 5000);
}

// ============ RESET STAGE 2 ============
function resetStage2() {
    stage2Phase = 'idle';
    callAttempts = 0;
    searchedItems.clear();

    // Clear any running timer
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }

    // Reset call dying intro screen
    document.getElementById('call-dying-screen').classList.remove('show');
    document.getElementById('low-battery-warning').classList.remove('show');
    document.getElementById('phone-dying-overlay').classList.remove('show');
    document.getElementById('call-disconnected-msg').classList.remove('show');
    document.getElementById('call-timer').textContent = '02:47:13';

    // Reset phone on nightstand
    const phoneScreen = document.getElementById('phone-screen');
    phoneScreen.classList.remove('dying', 'dead', 'on-call');
    phoneScreen.querySelector('.phone-battery-icon').textContent = '🔋';

    // Reset sleeper
    const sleeper = document.getElementById('sleeper');
    sleeper.querySelectorAll('.sleeper-zzz').forEach(z => z.style.animation = '');

    // Reset UI elements
    document.getElementById('wake-up-alert').classList.remove('show');
    document.getElementById('search-prompt').classList.remove('show');
    document.getElementById('search-feedback').classList.remove('show');
    document.getElementById('charging-screen').classList.remove('show');
    document.getElementById('calling-screen').classList.remove('show');
    document.getElementById('stage-transition').classList.remove('show');
    document.getElementById('morning-light').classList.remove('rising');

    // Reset searchable items
    document.querySelectorAll('.searchable').forEach(item => {
        item.classList.remove('searched', 'found');
    });

    // Reset charging mini-game
    cleanupChargingGame();
    document.getElementById('battery-percent').textContent = '0';
    document.getElementById('hud-battery-fill').style.width = '0%';
    document.getElementById('hud-battery-fill').classList.remove('medium', 'good');
    document.getElementById('charging-message').classList.remove('show');
    document.getElementById('charging-complete').classList.remove('show');

    // Reset phone catcher position
    const catcherPhone = document.getElementById('catcher-phone');
    if (catcherPhone) {
        catcherPhone.style.left = '50%';
        catcherPhone.classList.remove('catching', 'hit-surge');
    }

    // Reset call screen
    document.getElementById('call-status').textContent = 'Calling...';
    document.getElementById('call-status').classList.remove('ringing');
    document.getElementById('no-answer-msg').classList.remove('show');
    document.getElementById('retry-call-btn').style.display = 'none';
    document.getElementById('end-call-btn').style.display = 'flex';
}
