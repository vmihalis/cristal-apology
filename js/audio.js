// ============ AUDIO SYSTEM ============
// Centralized audio management for all game sounds

let audioCtx = null;
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
let lullabyInterval = null;
let ambientPlaying = false;
let windNode = null;
let windGain = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundIcon();
    if (soundEnabled) {
        initAudio();
        playPop();
        // Restart ambient sounds if game is in progress
        if (typeof gameStarted !== 'undefined' && gameStarted) {
            startAmbientSounds();
        }
    } else {
        stopLullaby();
        stopAmbientSounds();
    }
}

function updateSoundIcon() {
    const icon = document.getElementById('sound-icon');
    const btn = document.getElementById('sound-toggle');
    if (soundEnabled) {
        icon.textContent = '🔊';
        btn.classList.remove('off');
    } else {
        icon.textContent = '🔇';
        btn.classList.add('off');
    }
}

// ============ COMMON SOUNDS ============

// Soft chime - bell/xylophone
function playChime() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.8);
    });
}

// Bouncy boing sound
function playBoing() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
}

// Cute sheep baa
function playBaa() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Main bleat tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.1);
    osc.frequency.linearRampToValueAtTime(200, now + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
}

// Magical sparkle
function playSparkle() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    const notes = [880, 1108.73, 1318.51, 1567.98, 2093];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.3);
    });
}

// Soft whoosh
function playWhoosh() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    noise.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);
    filter.Q.setValueAtTime(1, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
}

// Quick pop
function playPop() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
}

// Celebration chord
function playCelebration() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Warm major chord (C E G C)
    const freqs = [261.63, 329.63, 392.00, 523.25];
    freqs.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
        gain.gain.setValueAtTime(0.12, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 2);
    });
}

// ============ LULLABY ============

// Gentle lullaby loop
function startLullaby() {
    if (!soundEnabled || !audioCtx) return;

    // Pentatonic melody notes (C D E G A)
    const melody = [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66];
    let noteIndex = 0;

    function playNote() {
        if (!soundEnabled || !audioCtx) {
            stopLullaby();
            return;
        }
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(melody[noteIndex], now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.1);
        gain.gain.setValueAtTime(0.06, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.8);

        noteIndex = (noteIndex + 1) % melody.length;
    }

    playNote();
    lullabyInterval = setInterval(playNote, 800);
}

function stopLullaby() {
    if (lullabyInterval) {
        clearInterval(lullabyInterval);
        lullabyInterval = null;
    }
}

// ============ AMBIENT SOUNDS ============
// Cozy night atmosphere with soft breeze

function startAmbientSounds() {
    if (!soundEnabled || !audioCtx || ambientPlaying) return;
    ambientPlaying = true;

    // Start soft wind/breeze
    startWind();
}

function stopAmbientSounds() {
    ambientPlaying = false;

    // Stop wind
    if (windGain) {
        const now = audioCtx ? audioCtx.currentTime : 0;
        windGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        setTimeout(() => {
            if (windNode) {
                windNode.stop();
                windNode = null;
            }
            windGain = null;
        }, 600);
    }
}

function startWind() {
    if (!soundEnabled || !audioCtx) return;

    // Create gentle wind using filtered noise
    const bufferSize = audioCtx.sampleRate * 4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Create smooth noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    windNode = audioCtx.createBufferSource();
    windNode.buffer = buffer;
    windNode.loop = true;

    // Multiple filters for soft, dreamy wind
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(400, audioCtx.currentTime);
    lowpass.Q.setValueAtTime(1, audioCtx.currentTime);

    const highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(100, audioCtx.currentTime);

    windGain = audioCtx.createGain();
    windGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    windGain.gain.exponentialRampToValueAtTime(0.025, audioCtx.currentTime + 2);

    // Gentle volume modulation for breathing wind effect
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.15, audioCtx.currentTime); // Very slow modulation
    lfoGain.gain.setValueAtTime(0.008, audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(windGain.gain);

    windNode.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(windGain);
    windGain.connect(audioCtx.destination);

    windNode.start();
    lfo.start();
}

// ============ STAGE 2 SOUNDS ============

function playAlarm() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Jarring wake-up beeps
    for (let i = 0; i < 3; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now + i * 0.15);
        gain.gain.setValueAtTime(0.1, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.1);
    }
}

function playPhoneDie() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Sad descending tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
}

function playSearchTap() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
}

function playFoundCharger() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Happy ascending ding
    [400, 500, 600, 800].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
    });
}

function playCharging() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(700, now + 0.1);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
}

function playCatch(isBonus = false) {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Pleasant catch sound
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';

    if (isBonus) {
        // Higher, more rewarding sound for bonus orbs
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1000, now + 0.05);
        osc.frequency.setValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
    } else {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
}

function playSurgeHit() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Harsh buzzing sound for surge hit
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(100, now + 0.1);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
}

function playRinging() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Phone ring tone
    for (let i = 0; i < 2; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now + i * 0.3);
        osc.frequency.setValueAtTime(480, now + i * 0.3 + 0.15);
        gain.gain.setValueAtTime(0.1, now + i * 0.3);
        gain.gain.setValueAtTime(0.1, now + i * 0.3 + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.3);
        osc.stop(now + i * 0.3 + 0.3);
    }
}

function playNoAnswer() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Sad disconnection tone
    [400, 350, 300].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now + i * 0.2);
        gain.gain.linearRampToValueAtTime(0.1, now + i * 0.2 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.2);
    });
}

function playSadChord() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Minor chord (sad)
    const freqs = [220, 261.63, 329.63];
    freqs.forEach((freq) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gain.gain.setValueAtTime(0.08, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 3);
    });
}
