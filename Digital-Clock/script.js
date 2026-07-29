/**
 * CHRONOS - Advanced Digital Clock Dashboard Engine
 * Vanilla ES6+ Web Application
 */

// --- Global App State & Constants ---
const CHRONOS_STATE = {
    // Clock preferences
    use24Hour: false,
    showMs: false,
    activeTimezone: 'local',
    
    // Audio settings
    soundEnabled: true,
    audioInitialized: false,
    
    // Theme options
    themeMode: 'dark', // 'dark', 'light', 'auto', 'custom'
    primaryColor: '#00ffff',
    glowColor: '#0088ff',
    clockScale: 1.0,
    glowStrength: 15,
    particleDensity: 50,
    customBgImage: null,

    // Tools data
    alarms: [],
    stopwatch: {
        startTime: 0,
        elapsedTime: 0,
        running: false,
        timerId: null,
        laps: []
    },
    countdown: {
        totalSeconds: 900, // 15 mins default
        remainingSeconds: 900,
        running: false,
        intervalId: null,
        mode: 'timer', // 'timer', 'pomodoro'
        pomoState: 'focus', // 'focus', 'short', 'long'
        pomoFocusCount: 0,
        pomoTotalFocusMinutes: 0
    },
    weather: {
        city: 'New Delhi',
        apiKey: '',
        lat: null,
        lon: null
    }
};

// Built-in offline Quotes Database
const QUOTES_DB = [
    { text: "Time is a created thing. To say 'I don't have time' is to say 'I don't want to'.", author: "Lao Tzu" },
    { text: "Lost time is never found again.", author: "Benjamin Franklin" },
    { text: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy" },
    { text: "Time has a wonderful way of showing us what really matters.", author: "Margaret Peters" },
    { text: "Time is more value than money. You can get more money, but you cannot get more time.", author: "Jim Rohn" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Time spent in self-reflection is never wasted - it is the seed of growth.", author: "A. D. Posey" },
    { text: "It is the time you have wasted for your rose that makes your rose so important.", author: "Antoine de Saint-Exupéry" },
    { text: "Better three hours too soon than a minute too late.", author: "William Shakespeare" },
    { text: "Time moves in one direction, memory in another.", author: "William Gibson" }
];

// Audio Context references for Synth Engine
let audioCtx = null;
let currentAlarmInterval = null;

// --- Initialize Application on DOM Load ---
document.addEventListener("DOMContentLoaded", () => {
    // Hide Loader
    const loader = document.getElementById("page-loader");
    setTimeout(() => {
        loader.classList.add("fade-out");
    }, 50);

    // Initialize Modules
    loadSettingsFromStorage();
    initCanvasParticles();
    initSoundEngineControls();
    initClockEngine();
    initWorldClockList();
    initStopwatch();
    initCountdownTimer();
    initAlarmClock();
    initCalendar();
    initCustomizer();
    initTelemetryStats();
    initBonusUtilities();
    initKeyboardShortcuts();
});

// ==========================================================================
// 1. DYNAMIC CANVAS BACKGROUND ENGINE
// ==========================================================================
let particles = [];
let animFrameId = null;

function initCanvasParticles() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        generateParticles();
    }

    class Particle {
        constructor() {
            this.reset(true);
        }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = -(Math.random() * 0.6 + 0.1);
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            const speedModifier = parseFloat(document.getElementById("slider-particles").value) / 50;
            this.x += this.speedX * speedModifier;
            this.y += this.speedY * speedModifier;

            if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset();
            }
        }
        draw() {
            ctx.fillStyle = `rgba(${hexToRgb(CHRONOS_STATE.primaryColor)}, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Dynamic large floating light circles
    class FloatingLight {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 150 + 100;
            this.vx = Math.random() * 0.2 - 0.1;
            this.vy = Math.random() * 0.2 - 0.1;
            this.color = Math.random() > 0.5 ? CHRONOS_STATE.primaryColor : CHRONOS_STATE.glowColor;
        }
        update() {
            const speedModifier = parseFloat(document.getElementById("slider-particles").value) / 50;
            this.x += this.vx * speedModifier;
            this.y += this.vy * speedModifier;

            if (this.x - this.radius > canvas.width) this.x = -this.radius;
            if (this.x + this.radius < 0) this.x = canvas.width + this.radius;
            if (this.y - this.radius > canvas.height) this.y = -this.radius;
            if (this.y + this.radius < 0) this.y = canvas.height + this.radius;
        }
        draw() {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, `rgba(${hexToRgb(this.color)}, 0.06)`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let floatingLights = [];
    function generateParticles() {
        particles = [];
        floatingLights = [];
        const count = CHRONOS_STATE.particleDensity;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
        // Generate 3 major light glows
        for (let i = 0; i < 3; i++) {
            floatingLights.push(new FloatingLight());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw floaters only in dark theme to preserve readability in light mode
        if (CHRONOS_STATE.themeMode !== 'light') {
            floatingLights.forEach(light => {
                light.update();
                light.draw();
            });
        }
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();
}

function updateParticleDensity() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const currentDensity = parseInt(document.getElementById("slider-particles").value);
    CHRONOS_STATE.particleDensity = currentDensity;
    
    // Regenerate particles matching slider
    particles = [];
    for (let i = 0; i < currentDensity; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 0.4 - 0.2,
            speedY: -(Math.random() * 0.6 + 0.1),
            opacity: Math.random() * 0.5 + 0.1,
            reset: function() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 10;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = -(Math.random() * 0.6 + 0.1);
                this.opacity = Math.random() * 0.5 + 0.1;
            },
            update: function() {
                const speedModifier = parseFloat(document.getElementById("slider-particles").value) / 50;
                this.x += this.speedX * speedModifier;
                this.y += this.speedY * speedModifier;
                if (this.y < -10) this.reset();
            },
            draw: function() {
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = `rgba(${hexToRgb(CHRONOS_STATE.primaryColor)}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}

// Helper: Hex color string to RGB object
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 255, 255';
}

// ==========================================================================
// 2. SYNTHESIZER SOUND ENGINE (Web Audio API)
// ==========================================================================
function initSoundEngineControls() {
    const banner = document.getElementById("audio-consent-banner");
    const toggleBtn = document.getElementById("sound-toggle-btn");

    function initCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            CHRONOS_STATE.audioInitialized = true;
            if (banner) banner.classList.add("hidden");
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Consent listeners
    document.addEventListener("click", initCtx, { once: true });
    if (banner) {
        banner.addEventListener("click", (e) => {
            e.stopPropagation();
            initCtx();
        });
    }

    toggleBtn.addEventListener("click", () => {
        initCtx();
        CHRONOS_STATE.soundEnabled = !CHRONOS_STATE.soundEnabled;
        saveSettingsToStorage();
        updateSoundButtonUI();
        playClickSynth();
    });

    updateSoundButtonUI();
}

function updateSoundButtonUI() {
    const toggleBtn = document.getElementById("sound-toggle-btn");
    const icon = document.getElementById("sound-icon");
    if (!toggleBtn || !icon) return;

    if (CHRONOS_STATE.soundEnabled) {
        toggleBtn.classList.remove("muted");
        icon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>`;
    } else {
        toggleBtn.classList.add("muted");
        icon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/>`;
    }
}

// Play high fidelity ticking sound
function playTickSynth() {
    if (!CHRONOS_STATE.soundEnabled || !CHRONOS_STATE.audioInitialized) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime); // High pitch tick

        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
        console.warn("Synth error: ", e);
    }
}

// Play click sound
function playClickSynth() {
    if (!CHRONOS_STATE.soundEnabled || !CHRONOS_STATE.audioInitialized) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
        console.warn(e);
    }
}

// Start recurring Synth Alarm melody
function startAlarmSynth() {
    if (!CHRONOS_STATE.audioInitialized) return;
    if (currentAlarmInterval) clearInterval(currentAlarmInterval);
    
    let step = 0;
    currentAlarmInterval = setInterval(() => {
        if (!CHRONOS_STATE.soundEnabled) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.type = "square";
            // Alternate pitches for siren effect
            const pitch = (step % 2 === 0) ? 880 : 660;
            osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.28);
            step++;
        } catch (e) {
            console.warn(e);
        }
    }, 400);
}

function stopAlarmSynth() {
    if (currentAlarmInterval) {
        clearInterval(currentAlarmInterval);
        currentAlarmInterval = null;
    }
}

// ==========================================================================
// 3. CORE DIGITAL & ANALOG CLOCK ENGINE
// ==========================================================================
function initClockEngine() {
    // 12H vs 24H button switching
    const btn12h = document.getElementById("format-12h");
    const btn24h = document.getElementById("format-24h");
    const btnMs = document.getElementById("toggle-ms");

    btn12h.addEventListener("click", () => {
        CHRONOS_STATE.use24Hour = false;
        btn12h.classList.add("active");
        btn24h.classList.remove("active");
        playClickSynth();
        saveSettingsToStorage();
    });

    btn24h.addEventListener("click", () => {
        CHRONOS_STATE.use24Hour = true;
        btn24h.classList.add("active");
        btn12h.classList.remove("active");
        playClickSynth();
        saveSettingsToStorage();
    });

    btnMs.addEventListener("click", () => {
        CHRONOS_STATE.showMs = !CHRONOS_STATE.showMs;
        btnMs.classList.toggle("active", CHRONOS_STATE.showMs);
        document.getElementById("clock-ms").classList.toggle("hidden", !CHRONOS_STATE.showMs);
        playClickSynth();
        saveSettingsToStorage();
    });

    // Timezone selector shifting
    const tzSelector = document.getElementById("timezone-selector");
    tzSelector.addEventListener("change", () => {
        CHRONOS_STATE.activeTimezone = tzSelector.value;
        document.getElementById("meta-timezone").innerText = tzSelector.options[tzSelector.selectedIndex].text.split("(")[0].trim();
        playClickSynth();
        saveSettingsToStorage();
    });

    // Speak Button
    document.getElementById("speak-now-btn").addEventListener("click", () => {
        speakTime();
        playClickSynth();
    });

    // Start Clock Loops
    runClockTick();
}

function getZonedDateObject() {
    const d = new Date();
    if (CHRONOS_STATE.activeTimezone === 'local') return d;
    
    // Shift Date object to targeted Timezone offset
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: CHRONOS_STATE.activeTimezone,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            fractionalSecondDigits: 3,
            hour12: false
        });
        
        const parts = formatter.formatToParts(d);
        const map = {};
        parts.forEach(p => map[p.type] = p.value);
        
        // Reconstruct Date object for timezone
        const nd = new Date(
            parseInt(map.year),
            parseInt(map.month) - 1,
            parseInt(map.day),
            parseInt(map.hour),
            parseInt(map.minute),
            parseInt(map.second),
            d.getMilliseconds() // approximate millisecond value from local system
        );
        return nd;
    } catch(err) {
        console.error("Timezone parsing error, falling back to local: ", err);
        return d;
    }
}

let lastSecond = -1;

function runClockTick() {
    function tick() {
        const d = getZonedDateObject();
        
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const seconds = d.getSeconds();
        const ms = d.getMilliseconds();

        // Tick Sound (exactly on the boundary of each second)
        if (seconds !== lastSecond) {
            playTickSynth();
            lastSecond = seconds;
            
            // Hourly announcement triggers if voice enabled
            if (minutes === 0 && seconds === 0 && CHRONOS_STATE.voiceEnabled) {
                speakTime();
            }

            // Sync other low-freq UI updates here
            updateLowFreqTimeLabels(d);
            checkAlarms(hours, minutes, d.getDay());
        }

        // Digital Clock Numbers Formatting
        let displayHours = hours;
        let period = "";

        if (!CHRONOS_STATE.use24Hour) {
            period = displayHours >= 12 ? "PM" : "AM";
            displayHours = displayHours % 12;
            displayHours = displayHours ? displayHours : 12; // 0 should be 12
        }

        const hrsStr = displayHours.toString().padStart(2, '0');
        const minsStr = minutes.toString().padStart(2, '0');
        const secsStr = seconds.toString().padStart(2, '0');
        const msStr = "." + ms.toString().padStart(3, '0');

        // Update DOM
        document.getElementById("clock-hours").innerText = hrsStr;
        document.getElementById("clock-minutes").innerText = minsStr;
        document.getElementById("clock-seconds").innerText = secsStr;
        document.getElementById("clock-ms").innerText = msStr;
        document.getElementById("clock-period").innerText = CHRONOS_STATE.use24Hour ? "" : period;

        // Analog Clock Hands Rotation
        const hourHand = document.getElementById("analog-hour-hand");
        const minHand = document.getElementById("analog-minute-hand");
        const secHand = document.getElementById("analog-second-hand");
        
        if (hourHand && minHand && secHand) {
            const hDeg = ((hours % 12) * 30) + (minutes * 0.5);
            const mDeg = (minutes * 6) + (seconds * 0.1);
            const sDeg = (seconds * 6) + (ms * 0.006); // Sweep transition
            
            hourHand.setAttribute("transform", `rotate(${hDeg} 100 100)`);
            minHand.setAttribute("transform", `rotate(${mDeg} 100 100)`);
            secHand.setAttribute("transform", `rotate(${sDeg} 100 100)`);
        }

        // Run next frame
        requestAnimationFrame(tick);
    }
    
    requestAnimationFrame(tick);
}

// Handle non-millisecond labels, greetings, progress rings
function updateLowFreqTimeLabels(dateObj) {
    const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const dayName = daysArr[dateObj.getDay()];
    const dateNum = dateObj.getDate();
    const monthName = monthsArr[dateObj.getMonth()];
    const yearNum = dateObj.getFullYear();
    const hours = dateObj.getHours();

    // Greeting Calculation
    let greeting = "Good Morning,";
    let icon = "☀️";
    if (hours >= 12 && hours < 17) {
        greeting = "Good Afternoon,";
        icon = "🌤️";
    } else if (hours >= 17 && hours < 21) {
        greeting = "Good Evening,";
        icon = "🌙";
    } else if (hours >= 21 || hours < 5) {
        greeting = "Good Night,";
        icon = "🌌";
    }
    
    document.getElementById("greeting-text").innerText = greeting;
    document.getElementById("greeting-icon").innerText = icon;

    // Sub-header Date
    const fullDateText = `${dayName}, ${dateNum} ${monthName} ${yearNum}`;
    document.getElementById("header-date-str").innerText = fullDateText;
    
    // Main Display Date Subline
    document.getElementById("clock-weekday").innerText = dayName;
    document.getElementById("clock-day-num").innerText = dateNum;
    document.getElementById("clock-month").innerText = monthName;
    document.getElementById("clock-year").innerText = yearNum;

    // Day Progress Bar
    const totalSecsInDay = 24 * 60 * 60;
    const currentSecs = (hours * 3600) + (dateObj.getMinutes() * 60) + dateObj.getSeconds();
    const progressPercent = ((currentSecs / totalSecsInDay) * 100).toFixed(1);
    document.getElementById("day-progress-bar").style.width = `${progressPercent}%`;
    document.getElementById("day-progress-percentage").innerText = `${progressPercent}%`;

    // Metadata computations
    // Day of Year
    const start = new Date(dateObj.getFullYear(), 0, 0);
    const diff = dateObj - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const doy = Math.floor(diff / oneDay);
    document.getElementById("meta-doy").innerText = doy;

    // Calendar Week of Year
    const weekNumber = Math.ceil(doy / 7);
    document.getElementById("meta-week").innerText = weekNumber;

    // Weekend vs Weekday
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    document.getElementById("meta-status").innerText = isWeekend ? "WEEKEND" : "WEEKDAY";
    document.getElementById("meta-status").className = isWeekend ? "meta-val text-accent color-red" : "meta-val text-accent";
}

// Speak current time using Speech Synthesis API
function speakTime() {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Cancel active queues
    
    const d = getZonedDateObject();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    
    let minsText = minutes === 0 ? "o'clock" : minutes.toString();
    if (minutes > 0 && minutes < 10) minsText = "o " + minutes;
    
    const speechString = `The time is currently ${hours} ${minsText} ${period}`;
    const utterance = new SpeechSynthesisUtterance(speechString);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}

// ==========================================================================
// 4. WORLD CLOCK MODULE
// ==========================================================================
const WORLD_PRESETS = [
    { city: "New York", zone: "America/New_York", offsetLbl: "EST/EDT" },
    { city: "London", zone: "Europe/London", offsetLbl: "GMT/BST" },
    { city: "Tokyo", zone: "Asia/Tokyo", offsetLbl: "JST" },
    { city: "Sydney", zone: "Australia/Sydney", offsetLbl: "AEST/AEDT" }
];

function initWorldClockList() {
    const listContainer = document.getElementById("world-clocks-container");
    if (!listContainer) return;

    function renderWorldClocks() {
        listContainer.innerHTML = "";
        
        WORLD_PRESETS.forEach(preset => {
            const d = new Date();
            
            // Format time string for target timezone
            let timeStr = "--:--:--";
            let dateStr = "---";
            try {
                const timeFormatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: preset.zone,
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: !CHRONOS_STATE.use24Hour
                });
                const dateFormatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: preset.zone,
                    day: 'numeric', month: 'short'
                });
                timeStr = timeFormatter.format(d);
                dateStr = dateFormatter.format(d);
            } catch (err) {
                console.warn(err);
            }

            const item = document.createElement("div");
            item.className = "world-clock-item";
            item.innerHTML = `
                <div>
                    <div class="wc-location">${preset.city}</div>
                    <div class="wc-offset">${preset.offsetLbl}</div>
                </div>
                <div class="wc-right">
                    <div class="wc-time">${timeStr}</div>
                    <div class="wc-date">${dateStr}</div>
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    renderWorldClocks();
    // Update every second
    setInterval(renderWorldClocks, 1000);
}

// ==========================================================================
// 5. STOPWATCH WIDGET MODULE
// ==========================================================================
function initStopwatch() {
    const digits = document.getElementById("stopwatch-digits");
    const msDigits = document.getElementById("stopwatch-ms");
    const startBtn = document.getElementById("stopwatch-start-btn");
    const lapBtn = document.getElementById("stopwatch-lap-btn");
    const resetBtn = document.getElementById("stopwatch-reset-btn");
    const lapsBody = document.getElementById("laps-list-body");

    startBtn.addEventListener("click", () => {
        playClickSynth();
        if (CHRONOS_STATE.stopwatch.running) {
            // Pause
            CHRONOS_STATE.stopwatch.running = false;
            CHRONOS_STATE.stopwatch.elapsedTime += performance.now() - CHRONOS_STATE.stopwatch.startTime;
            cancelAnimationFrame(CHRONOS_STATE.stopwatch.timerId);
            startBtn.innerText = "Resume";
            lapBtn.disabled = true;
        } else {
            // Start
            CHRONOS_STATE.stopwatch.running = true;
            CHRONOS_STATE.stopwatch.startTime = performance.now();
            updateStopwatchLoop();
            startBtn.innerText = "Pause";
            lapBtn.disabled = false;
        }
    });

    lapBtn.addEventListener("click", () => {
        playClickSynth();
        if (!CHRONOS_STATE.stopwatch.running) return;

        const currentTotal = CHRONOS_STATE.stopwatch.elapsedTime + (performance.now() - CHRONOS_STATE.stopwatch.startTime);
        
        let previousTotal = 0;
        if (CHRONOS_STATE.stopwatch.laps.length > 0) {
            previousTotal = CHRONOS_STATE.stopwatch.laps[0].totalTime;
        }
        
        const lapSplit = currentTotal - previousTotal;
        const lapIndex = CHRONOS_STATE.stopwatch.laps.length + 1;

        const newLap = {
            id: lapIndex,
            splitTime: lapSplit,
            totalTime: currentTotal
        };

        // Insert at start of array (newest lap on top)
        CHRONOS_STATE.stopwatch.laps.unshift(newLap);
        renderLapsTable();
    });

    resetBtn.addEventListener("click", () => {
        playClickSynth();
        CHRONOS_STATE.stopwatch.running = false;
        CHRONOS_STATE.stopwatch.elapsedTime = 0;
        CHRONOS_STATE.stopwatch.laps = [];
        cancelAnimationFrame(CHRONOS_STATE.stopwatch.timerId);
        
        digits.innerHTML = `00:00:00<span class="timer-ms" id="stopwatch-ms">.00</span>`;
        startBtn.innerText = "Start";
        lapBtn.disabled = true;
        
        lapsBody.innerHTML = `<tr class="placeholder-row"><td colspan="3">No laps recorded</td></tr>`;
    });

    function formatTimeComponents(diff) {
        const hr = Math.floor(diff / 3600000);
        const min = Math.floor((diff % 3600000) / 60000);
        const sec = Math.floor((diff % 60000) / 1000);
        const ms = Math.floor((diff % 1000) / 10); // 2 digit ms

        return {
            hr: hr.toString().padStart(2, '0'),
            min: min.toString().padStart(2, '0'),
            sec: sec.toString().padStart(2, '0'),
            ms: ms.toString().padStart(2, '0')
        };
    }

    function updateStopwatchLoop() {
        if (!CHRONOS_STATE.stopwatch.running) return;

        const now = performance.now();
        const diff = CHRONOS_STATE.stopwatch.elapsedTime + (now - CHRONOS_STATE.stopwatch.startTime);
        const t = formatTimeComponents(diff);

        digits.innerHTML = `${t.hr}:${t.min}:${t.sec}<span class="timer-ms" id="stopwatch-ms">.${t.ms}</span>`;

        CHRONOS_STATE.stopwatch.timerId = requestAnimationFrame(updateStopwatchLoop);
    }

    function renderLapsTable() {
        if (CHRONOS_STATE.stopwatch.laps.length === 0) {
            lapsBody.innerHTML = `<tr class="placeholder-row"><td colspan="3">No laps recorded</td></tr>`;
            return;
        }

        lapsBody.innerHTML = "";
        CHRONOS_STATE.stopwatch.laps.forEach(lap => {
            const splitT = formatTimeComponents(lap.splitTime);
            const totalT = formatTimeComponents(lap.totalTime);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>Lap ${lap.id}</td>
                <td class="font-mono">${splitT.hr}:${splitT.min}:${splitT.sec}.${splitT.ms}</td>
                <td class="font-mono">${totalT.hr}:${totalT.min}:${totalT.sec}.${totalT.ms}</td>
            `;
            lapsBody.appendChild(tr);
        });
    }
}

// ==========================================================================
// 6. COUNTDOWN TIMER & POMODORO MODULE
// ==========================================================================
function initCountdownTimer() {
    const tabCountdown = document.getElementById("mode-countdown");
    const tabPomo = document.getElementById("mode-pomodoro");
    const inputsWrap = document.getElementById("timer-inputs");
    const presetsWrap = document.getElementById("pomodoro-presets");
    const statsWrap = document.getElementById("pomo-stats-container");
    const startBtn = document.getElementById("timer-start-btn");
    const pauseBtn = document.getElementById("timer-pause-btn");
    const resetBtn = document.getElementById("timer-reset-btn");
    const digits = document.getElementById("countdown-digits");
    const ringIndicator = document.getElementById("countdown-progress-ring");

    // Form inputs
    const inputHr = document.getElementById("timer-hr");
    const inputMin = document.getElementById("timer-min");
    const inputSec = document.getElementById("timer-sec");

    // Tab actions
    tabCountdown.addEventListener("click", () => {
        playClickSynth();
        CHRONOS_STATE.countdown.mode = 'timer';
        tabCountdown.classList.add("active");
        tabPomo.classList.remove("active");
        inputsWrap.classList.remove("hidden");
        presetsWrap.classList.add("hidden");
        statsWrap.classList.add("hidden");
        resetTimerState();
    });

    tabPomo.addEventListener("click", () => {
        playClickSynth();
        CHRONOS_STATE.countdown.mode = 'pomodoro';
        tabPomo.classList.add("active");
        tabCountdown.classList.remove("active");
        inputsWrap.classList.add("hidden");
        presetsWrap.classList.remove("hidden");
        statsWrap.classList.remove("hidden");
        // Load default focus setting (25 mins)
        setPomoTarget(25, 'focus');
    });

    // Pomodoro Presets buttons click listeners
    const presetButtons = presetsWrap.querySelectorAll("[data-pomo]");
    presetButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            playClickSynth();
            presetButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const minutes = parseInt(btn.dataset.pomo);
            const type = btn.dataset.type;
            setPomoTarget(minutes, type);
        });
    });

    // Action control buttons
    startBtn.addEventListener("click", () => {
        playClickSynth();
        if (CHRONOS_STATE.countdown.running) return;

        if (CHRONOS_STATE.countdown.mode === 'timer') {
            // Read values from spinner inputs if setting up new custom timer
            const hr = parseInt(inputHr.value) || 0;
            const min = parseInt(inputMin.value) || 0;
            const sec = parseInt(inputSec.value) || 0;
            const total = (hr * 3600) + (min * 60) + sec;
            
            if (total <= 0) {
                alert("Please enter a countdown duration greater than 0.");
                return;
            }
            // Update total only if changed or starting afresh
            if (CHRONOS_STATE.countdown.remainingSeconds === CHRONOS_STATE.countdown.totalSeconds || CHRONOS_STATE.countdown.remainingSeconds <= 0) {
                CHRONOS_STATE.countdown.totalSeconds = total;
                CHRONOS_STATE.countdown.remainingSeconds = total;
            }
            inputsWrap.classList.add("hidden");
        }

        CHRONOS_STATE.countdown.running = true;
        startBtn.classList.add("hidden");
        pauseBtn.classList.remove("hidden");

        CHRONOS_STATE.countdown.intervalId = setInterval(countdownTick, 1000);
    });

    pauseBtn.addEventListener("click", () => {
        playClickSynth();
        pauseCountdown();
    });

    resetBtn.addEventListener("click", () => {
        playClickSynth();
        resetTimerState();
    });

    function pauseCountdown() {
        CHRONOS_STATE.countdown.running = false;
        clearInterval(CHRONOS_STATE.countdown.intervalId);
        pauseBtn.classList.add("hidden");
        startBtn.classList.remove("hidden");
    }

    function resetTimerState() {
        CHRONOS_STATE.countdown.running = false;
        clearInterval(CHRONOS_STATE.countdown.intervalId);
        
        startBtn.classList.remove("hidden");
        pauseBtn.classList.add("hidden");

        if (CHRONOS_STATE.countdown.mode === 'timer') {
            inputsWrap.classList.remove("hidden");
            // restore inputs values
            const hr = parseInt(inputHr.value) || 0;
            const min = parseInt(inputMin.value) || 0;
            const sec = parseInt(inputSec.value) || 0;
            const total = (hr * 3600) + (min * 60) + sec;
            CHRONOS_STATE.countdown.totalSeconds = total > 0 ? total : 900;
        } else {
            // Find active preset
            const activePreset = presetsWrap.querySelector(".active");
            const minutes = activePreset ? parseInt(activePreset.dataset.pomo) : 25;
            CHRONOS_STATE.countdown.totalSeconds = minutes * 60;
        }

        CHRONOS_STATE.countdown.remainingSeconds = CHRONOS_STATE.countdown.totalSeconds;
        updateTimerDisplay();
    }

    function setPomoTarget(minutes, type) {
        pauseCountdown();
        CHRONOS_STATE.countdown.pomoState = type;
        CHRONOS_STATE.countdown.totalSeconds = minutes * 60;
        CHRONOS_STATE.countdown.remainingSeconds = minutes * 60;
        updateTimerDisplay();
    }

    function countdownTick() {
        if (!CHRONOS_STATE.countdown.running) return;

        CHRONOS_STATE.countdown.remainingSeconds--;
        updateTimerDisplay();

        if (CHRONOS_STATE.countdown.remainingSeconds <= 0) {
            // Finish Triggered!
            pauseCountdown();
            playCompletionAlarm();
            
            if (CHRONOS_STATE.countdown.mode === 'pomodoro') {
                handlePomodoroCycleCompletion();
            } else {
                resetTimerState();
            }
        }
    }

    function updateTimerDisplay() {
        const current = CHRONOS_STATE.countdown.remainingSeconds;
        const hr = Math.floor(current / 3600);
        const min = Math.floor((current % 3600) / 60);
        const sec = current % 60;

        const hrStr = hr.toString().padStart(2, '0');
        const minStr = min.toString().padStart(2, '0');
        const secStr = sec.toString().padStart(2, '0');

        digits.innerText = `${hrStr}:${minStr}:${secStr}`;

        // Circular progress ring logic (dasharray: 440)
        const total = CHRONOS_STATE.countdown.totalSeconds;
        const ratio = total > 0 ? (current / total) : 0;
        const dashoffset = 440 * (1 - ratio);
        ringIndicator.style.strokeDashoffset = dashoffset;
    }

    function handlePomodoroCycleCompletion() {
        if (CHRONOS_STATE.countdown.pomoState === 'focus') {
            CHRONOS_STATE.countdown.pomoFocusCount++;
            CHRONOS_STATE.countdown.pomoTotalFocusMinutes += Math.floor(CHRONOS_STATE.countdown.totalSeconds / 60);
            
            document.getElementById("pomo-focus-count").innerText = CHRONOS_STATE.countdown.pomoFocusCount;
            document.getElementById("pomo-total-time").innerText = `${CHRONOS_STATE.countdown.pomoTotalFocusMinutes}m`;
            
            alert("Great work! Focus session finished. Time for a break.");
            
            // Switch automatically to short break preset
            const shortBreakBtn = presetsWrap.querySelector("[data-type='short']");
            if (shortBreakBtn) shortBreakBtn.click();
        } else {
            alert("Break finished! Let's get back to work.");
            // Switch back to focus preset
            const focusBtn = presetsWrap.querySelector("[data-type='focus']");
            if (focusBtn) focusBtn.click();
        }
    }

    function playCompletionAlarm() {
        startAlarmSynth();
        
        // Visual Alert Notification
        const alertBanner = document.createElement("div");
        alertBanner.className = "audio-banner animate-pulse";
        alertBanner.innerHTML = `<span>⏳ Countdown Finished! Click here to stop sound.</span>`;
        document.body.appendChild(alertBanner);
        
        alertBanner.addEventListener("click", () => {
            stopAlarmSynth();
            alertBanner.remove();
        });
        
        // Auto remove banner after 20 seconds
        setTimeout(() => {
            stopAlarmSynth();
            alertBanner.remove();
        }, 20000);
    }

    updateTimerDisplay();
}

// ==========================================================================
// 7. ALARM CLOCK WIDGET MODULE
// ==========================================================================
function initAlarmClock() {
    const addBtn = document.getElementById("add-alarm-btn");
    const drawer = document.getElementById("alarm-drawer");
    const cancelBtn = document.getElementById("cancel-alarm-drawer");
    const saveBtn = document.getElementById("save-alarm-drawer");
    const alarmsContainer = document.getElementById("alarms-list-container");

    addBtn.addEventListener("click", () => {
        playClickSynth();
        drawer.classList.toggle("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        playClickSynth();
        drawer.classList.add("hidden");
    });

    saveBtn.addEventListener("click", () => {
        playClickSynth();
        const timeVal = document.getElementById("alarm-time").value;
        const labelVal = document.getElementById("alarm-label").value || "Alarm";
        
        if (!timeVal) {
            alert("Please choose a valid time for the alarm.");
            return;
        }

        // Days repeat checklist mapping
        const dayCheckboxes = drawer.querySelectorAll(".repeat-days-row input:checked");
        const repeatDays = Array.from(dayCheckboxes).map(cb => parseInt(cb.value));

        const newAlarm = {
            id: Date.now(),
            time: timeVal,
            label: labelVal,
            repeat: repeatDays,
            active: true,
            snoozedTime: null // Stores temp override time for snoozing
        };

        CHRONOS_STATE.alarms.push(newAlarm);
        saveSettingsToStorage();
        renderAlarms();

        // Reset drawer fields
        document.getElementById("alarm-label").value = "";
        drawer.querySelectorAll(".repeat-days-row input").forEach(cb => cb.checked = false);
        drawer.classList.add("hidden");
    });

    // Ringing Modal action handlers
    const modalDismiss = document.getElementById("alarm-dismiss-btn");
    const modalSnooze = document.getElementById("alarm-snooze-btn");
    
    modalDismiss.addEventListener("click", () => {
        stopActiveRinging();
    });

    modalSnooze.addEventListener("click", () => {
        snoozeActiveAlarm();
    });

    renderAlarms();
}

function renderAlarms() {
    const container = document.getElementById("alarms-list-container");
    if (!container) return;

    if (CHRONOS_STATE.alarms.length === 0) {
        container.innerHTML = `<p class="header-subtitle" style="text-align:center; padding:15px;">No alarms set</p>`;
        return;
    }

    container.innerHTML = "";
    CHRONOS_STATE.alarms.forEach(alarm => {
        // Format time display
        const parts = alarm.time.split(":");
        let hr = parseInt(parts[0]);
        const min = parts[1];
        let p = "";
        if (!CHRONOS_STATE.use24Hour) {
            p = hr >= 12 ? " PM" : " AM";
            hr = hr % 12;
            hr = hr ? hr : 12;
        }
        const timeDisplay = `${hr.toString().padStart(2, '0')}:${min}${p}`;

        // Repeat label display
        const daysShort = ["S", "M", "T", "W", "T", "F", "S"];
        let repeatLabel = "Once";
        if (alarm.repeat.length === 7) {
            repeatLabel = "Every day";
        } else if (alarm.repeat.length > 0) {
            repeatLabel = alarm.repeat.map(d => daysShort[d]).join(" ");
        }

        const div = document.createElement("div");
        div.className = "alarm-item";
        div.innerHTML = `
            <div class="alarm-info">
                <span class="alarm-time-lbl">${timeDisplay}</span>
                <span class="alarm-sub-lbl">${alarm.label} • ${repeatLabel}</span>
            </div>
            <div class="alarm-actions">
                <label class="switch-control" title="Enable/Disable Alarm">
                    <input type="checkbox" ${alarm.active ? 'checked' : ''} data-alarm-toggle-id="${alarm.id}">
                    <span class="switch-slider"></span>
                </label>
                <button class="btn-delete-alarm" data-alarm-delete-id="${alarm.id}" title="Delete Alarm">&times;</button>
            </div>
        `;
        container.appendChild(div);
    });

    // Add listeners dynamically
    container.querySelectorAll("[data-alarm-toggle-id]").forEach(cb => {
        cb.addEventListener("change", (e) => {
            playClickSynth();
            const id = parseInt(e.target.dataset.alarmToggleId);
            const alarm = CHRONOS_STATE.alarms.find(a => a.id === id);
            if (alarm) {
                alarm.active = e.target.checked;
                alarm.snoozedTime = null; // Clear active snooze overrides
                saveSettingsToStorage();
            }
        });
    });

    container.querySelectorAll("[data-alarm-delete-id]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            playClickSynth();
            const id = parseInt(e.target.dataset.alarmDeleteId);
            CHRONOS_STATE.alarms = CHRONOS_STATE.alarms.filter(a => a.id !== id);
            saveSettingsToStorage();
            renderAlarms();
        });
    });
}

// Alarm ringing triggers check
let activeRingingAlarm = null;

function checkAlarms(hours, minutes, currentDayOfWeek) {
    if (activeRingingAlarm) return; // Prevent double alerts

    const curTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    CHRONOS_STATE.alarms.forEach(alarm => {
        // Reset lastRungTime when current time shifts away from trigger minutes
        if (curTimeStr !== alarm.time && curTimeStr !== alarm.snoozedTime) {
            alarm.lastRungTime = null;
        }

        if (!alarm.active) return;

        // Check if there is an active snooze override for now or standard repeat trigger
        const isStandardTime = (alarm.time === curTimeStr && alarm.snoozedTime === null);
        const isSnoozeTime = (alarm.snoozedTime === curTimeStr);

        if (isStandardTime || isSnoozeTime) {
            // Check day filter (for standard trigger, day repeat must match, snooze doesn't need to recheck day)
            const dayMatches = alarm.repeat.length === 0 || alarm.repeat.includes(currentDayOfWeek);
            
            if (isSnoozeTime || (isStandardTime && dayMatches)) {
                if (alarm.lastRungTime !== curTimeStr) {
                    alarm.lastRungTime = curTimeStr;
                    triggerAlarmRinging(alarm);
                }
            }
        }
    });
}

function triggerAlarmRinging(alarm) {
    activeRingingAlarm = alarm;
    startAlarmSynth();
    
    // Display Alarm ring modal
    const modal = document.getElementById("alarm-ring-modal");
    document.getElementById("alarm-modal-label").innerText = alarm.label;
    
    const parts = alarm.time.split(":");
    let hr = parseInt(parts[0]);
    const min = parts[1];
    let p = "";
    if (!CHRONOS_STATE.use24Hour) {
        p = hr >= 12 ? " PM" : " AM";
        hr = hr % 12;
        hr = hr ? hr : 12;
    }
    document.getElementById("alarm-modal-time").innerText = `${hr.toString().padStart(2, '0')}:${min}${p}`;
    
    modal.classList.add("active");
}

function stopActiveRinging() {
    if (!activeRingingAlarm) return;
    
    stopAlarmSynth();
    document.getElementById("alarm-ring-modal").classList.remove("active");
    
    // If once alarm (no repeating days), disable it after dismiss
    if (activeRingingAlarm.repeat.length === 0) {
        activeRingingAlarm.active = false;
    }
    activeRingingAlarm.snoozedTime = null;
    activeRingingAlarm = null;
    
    saveSettingsToStorage();
    renderAlarms();
    playClickSynth();
}

function snoozeActiveAlarm() {
    if (!activeRingingAlarm) return;

    stopAlarmSynth();
    document.getElementById("alarm-ring-modal").classList.remove("active");

    // Add 5 minutes to current time for snooze trigger
    const now = new Date();
    const snoozeDate = new Date(now.getTime() + (5 * 60 * 1000));
    const hr = snoozeDate.getHours().toString().padStart(2, '0');
    const min = snoozeDate.getMinutes().toString().padStart(2, '0');

    activeRingingAlarm.snoozedTime = `${hr}:${min}`;
    activeRingingAlarm = null;

    saveSettingsToStorage();
    renderAlarms();
    playClickSynth();
    alert("Alarm snoozed for 5 minutes.");
}

// ==========================================================================
// 8. DYNAMIC MONTHLY CALENDAR MODULE
// ==========================================================================
let currentCalendarDate = new Date();

function initCalendar() {
    const prevBtn = document.getElementById("cal-prev");
    const nextBtn = document.getElementById("cal-next");

    prevBtn.addEventListener("click", () => {
        playClickSynth();
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendarGrid();
    });

    nextBtn.addEventListener("click", () => {
        playClickSynth();
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendarGrid();
    });

    renderCalendarGrid();
}

function renderCalendarGrid() {
    const headerTitle = document.getElementById("cal-month-year");
    const gridContainer = document.getElementById("calendar-days-container");
    if (!headerTitle || !gridContainer) return;

    const month = currentCalendarDate.getMonth();
    const year = currentCalendarDate.getFullYear();

    const monthsLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    headerTitle.innerText = `${monthsLabels[month]} ${year}`;

    gridContainer.innerHTML = "";

    // Day offset details
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Fill blank cells
    for (let i = 0; i < firstDayIndex; i++) {
        const blank = document.createElement("div");
        blank.className = "cal-day-cell empty-cell";
        gridContainer.appendChild(blank);
    }

    const today = new Date();

    // Fill days numbers
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.className = "cal-day-cell";
        cell.innerText = day;

        // Day of week index
        const dateObj = new Date(year, month, day);
        const dayOfWeek = dateObj.getDay();

        // Highlight Today
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add("today-cell");
        }

        // Highlight weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            cell.classList.add("weekend-cell");
        }

        cell.addEventListener("click", () => {
            playClickSynth();
            gridContainer.querySelectorAll(".cal-day-cell").forEach(c => c.classList.remove("selected-cell"));
            cell.classList.add("selected-cell");
        });

        gridContainer.appendChild(cell);
    }
}

// ==========================================================================
// 9. ATMOSPHERE MODULE (Weather & Quotes)
// ==========================================================================
function initWeatherAndQuote() {
    // Config panel elements
    const configBtn = document.getElementById("weather-config-btn");
    const configPane = document.getElementById("weather-config-pane");
    const saveBtn = document.getElementById("weather-save");
    const cancelBtn = document.getElementById("weather-cancel");
    const cityInput = document.getElementById("weather-city");
    const apiKeyInput = document.getElementById("weather-apikey");
    const detectBtn = document.getElementById("weather-detect-btn");

    configBtn.addEventListener("click", () => {
        playClickSynth();
        configPane.classList.toggle("hidden");
        cityInput.value = CHRONOS_STATE.weather.city;
        apiKeyInput.value = CHRONOS_STATE.weather.apiKey;
    });

    cancelBtn.addEventListener("click", () => {
        playClickSynth();
        configPane.classList.add("hidden");
    });

    saveBtn.addEventListener("click", () => {
        playClickSynth();
        CHRONOS_STATE.weather.city = cityInput.value || "New Delhi";
        CHRONOS_STATE.weather.apiKey = apiKeyInput.value;
        // Clear manual coordinate overrides if a custom text city is set
        CHRONOS_STATE.weather.lat = null;
        CHRONOS_STATE.weather.lon = null;
        saveSettingsToStorage();
        configPane.classList.add("hidden");
        fetchWeatherData();
    });

    // Auto detect location click listener (Geolocation API)
    detectBtn.addEventListener("click", () => {
        playClickSynth();
        if (navigator.geolocation) {
            detectBtn.innerText = "📍 Requesting...";
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    detectBtn.innerText = "📍 Detected";
                    CHRONOS_STATE.weather.lat = position.coords.latitude;
                    CHRONOS_STATE.weather.lon = position.coords.longitude;
                    saveSettingsToStorage();
                    fetchWeatherData(); // Reload immediately using coordinates
                    setTimeout(() => { detectBtn.innerText = "📍 Auto-Detect Location"; }, 2000);
                },
                (error) => {
                    detectBtn.innerText = "📍 Access Denied";
                    alert("Geolocation failed: " + error.message + ". Utilizing manual fallback.");
                    setTimeout(() => { detectBtn.innerText = "📍 Auto-Detect Location"; }, 2000);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });

    // Load Quote of Day
    loadQuoteOfTheDay();

    // Load initial weather
    fetchWeatherData();
}

function loadQuoteOfTheDay() {
    // Select seed index based on day of year
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start;
    const doy = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const quoteIndex = doy % QUOTES_DB.length;
    const selectedQuote = QUOTES_DB[quoteIndex];
    
    document.getElementById("quote-text-val").innerText = `"${selectedQuote.text}"`;
    document.getElementById("quote-author-val").innerText = `— ${selectedQuote.author}`;
}

// Reverse geocoding helper (OpenStreetMap Nominatim)
async function reverseGeocode(lat, lon) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: {
                'User-Agent': 'DigClockDashboard/1.0'
            }
        });
        if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            const locationName = addr.city || addr.town || addr.village || addr.suburb || "My Location";
            const countryCode = addr.country_code ? addr.country_code.toUpperCase() : "";
            return `${locationName}${countryCode ? ', ' + countryCode : ''}`;
        }
    } catch(err) {
        console.warn("Geocoding failed: ", err);
    }
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
}

function getWeatherEmoji(weatherMain) {
    if (weatherMain.includes("clear")) return "☀️";
    if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) return "🌧️";
    if (weatherMain.includes("cloud")) return "☁️";
    if (weatherMain.includes("thunderstorm")) return "⛈️";
    if (weatherMain.includes("snow")) return "❄️";
    if (weatherMain.includes("mist") || weatherMain.includes("fog")) return "🌫️";
    return "⛅";
}

async function fetchWeatherData() {
    const tempText = document.getElementById("weather-temp-val");
    const descText = document.getElementById("weather-desc-val");
    const windText = document.getElementById("weather-wind-val");
    const humidityText = document.getElementById("weather-humidity-val");
    const cityText = document.getElementById("weather-city-val");
    const iconRep = document.getElementById("weather-icon-rep");

    // Case 1: Coordinate-based (detected) weather using Open-Meteo or OpenWeatherMap
    if (CHRONOS_STATE.weather.lat !== null && CHRONOS_STATE.weather.lon !== null) {
        const lat = CHRONOS_STATE.weather.lat;
        const lon = CHRONOS_STATE.weather.lon;

        // If OpenWeather Key is available, use coordinates there
        if (CHRONOS_STATE.weather.apiKey) {
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CHRONOS_STATE.weather.apiKey}&units=metric`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    tempText.innerText = `${Math.round(data.main.temp)}°C`;
                    descText.innerText = data.weather[0].description.replace(/\b\w/g, c => c.toUpperCase());
                    windText.innerText = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
                    humidityText.innerText = `${data.main.humidity}%`;
                    cityText.innerText = `${data.name}, ${data.sys.country}`;
                    iconRep.innerText = getWeatherEmoji(data.weather[0].main.toLowerCase());
                    return;
                }
            } catch (err) {
                console.warn("OpenWeather coordinates query failed, falling back to Open-Meteo", err);
            }
        }

        // Keyless free Open-Meteo API query
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Open-Meteo query failed");
            const data = await res.json();
            
            const cur = data.current;
            tempText.innerText = `${Math.round(cur.temperature_2m)}°C`;
            windText.innerText = `${cur.wind_speed_10m.toFixed(1)} km/h`;
            humidityText.innerText = `${cur.relative_humidity_2m}%`;

            // Translate WMO weather code to text/emoji
            const wCode = cur.weather_code;
            let wDesc = "Overcast";
            let wEmoji = "⛅";
            if (wCode === 0) { wDesc = "Clear Sky"; wEmoji = "☀️"; }
            else if (wCode === 1 || wCode === 2) { wDesc = "Partly Cloudy"; wEmoji = "⛅"; }
            else if (wCode === 3) { wDesc = "Cloudy"; wEmoji = "☁️"; }
            else if ([45, 48].includes(wCode)) { wDesc = "Foggy"; wEmoji = "🌫️"; }
            else if ([51, 53, 55, 80, 81, 82].includes(wCode)) { wDesc = "Showers"; wEmoji = "🌧️"; }
            else if ([61, 63, 65, 66, 67].includes(wCode)) { wDesc = "Rainy"; wEmoji = "🌧️"; }
            else if ([71, 73, 75, 77, 85, 86].includes(wCode)) { wDesc = "Snowy"; wEmoji = "❄️"; }
            else if ([95, 96, 99].includes(wCode)) { wDesc = "Thunderstorms"; wEmoji = "⛈️"; }

            descText.innerText = wDesc;
            iconRep.innerText = wEmoji;

            // Fetch place name asynchronously
            const placeName = await reverseGeocode(lat, lon);
            cityText.innerText = placeName;
            return;
        } catch(err) {
            console.warn("Coordinate weather fetch failed: ", err);
        }
    }

    // Case 2: City-based (manual text input) weather
    if (!CHRONOS_STATE.weather.apiKey) {
        // Fallback: Mock dynamic simulation
        const mockCity = CHRONOS_STATE.weather.city;
        cityText.innerText = `${mockCity}, Sim`;
        tempText.innerText = "26°C";
        descText.innerText = "Dynamic Simulation";
        windText.innerText = "14 km/h";
        humidityText.innerText = "60%";
        iconRep.innerText = "🌤️";
        return;
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(CHRONOS_STATE.weather.city)}&appid=${CHRONOS_STATE.weather.apiKey}&units=metric`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather request failed");
        
        const data = await res.json();
        
        // Map details
        tempText.innerText = `${Math.round(data.main.temp)}°C`;
        descText.innerText = data.weather[0].description.replace(/\b\w/g, c => c.toUpperCase());
        windText.innerText = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
        humidityText.innerText = `${data.main.humidity}%`;
        cityText.innerText = `${data.name}, ${data.sys.country}`;
        iconRep.innerText = getWeatherEmoji(data.weather[0].main.toLowerCase());
    } catch(err) {
        console.warn("Weather API error, utilizing simulated fallback mode: ", err);
        cityText.innerText = `${CHRONOS_STATE.weather.city}, Sim`;
        descText.innerText = "Simulated Fallback";
    }
}

// ==========================================================================
// 10. CUSTOMIZER & CUSTOM DESIGN LOGIC
// ==========================================================================
function initCustomizer() {
    const modeButtons = document.querySelectorAll("[data-theme-mode]");
    const primaryColorPicker = document.getElementById("picker-primary-color");
    const glowColorPicker = document.getElementById("picker-glow-color");
    
    // Sliders
    const sliderFontSize = document.getElementById("slider-font-size");
    const sliderGlow = document.getElementById("slider-glow");
    const sliderParticles = document.getElementById("slider-particles");
    const bgUpload = document.getElementById("bg-upload-input");
    const bgClear = document.getElementById("bg-clear-btn");

    // Prepopulate controls from loaded state
    modeButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.themeMode === CHRONOS_STATE.themeMode);
        
        btn.addEventListener("click", () => {
            playClickSynth();
            modeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            setThemeMode(btn.dataset.themeMode);
        });
    });

    primaryColorPicker.value = CHRONOS_STATE.primaryColor;
    document.getElementById("hex-primary").innerText = CHRONOS_STATE.primaryColor;
    
    glowColorPicker.value = CHRONOS_STATE.glowColor;
    document.getElementById("hex-glow").innerText = CHRONOS_STATE.glowColor;

    sliderFontSize.value = CHRONOS_STATE.clockScale;
    document.getElementById("val-font-size").innerText = `${CHRONOS_STATE.clockScale}x`;

    sliderGlow.value = CHRONOS_STATE.glowStrength;
    document.getElementById("val-glow").innerText = getGlowStrengthLabel(CHRONOS_STATE.glowStrength);

    sliderParticles.value = CHRONOS_STATE.particleDensity;
    document.getElementById("val-particles").innerText = CHRONOS_STATE.particleDensity > 0 ? "Active" : "Disabled";

    // Custom background uploader
    bgUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            CHRONOS_STATE.customBgImage = evt.target.result;
            saveSettingsToStorage();
            applyCustomBgImage();
            playClickSynth();
        };
        reader.readAsDataURL(file);
    });

    bgClear.addEventListener("click", () => {
        playClickSynth();
        CHRONOS_STATE.customBgImage = null;
        saveSettingsToStorage();
        applyCustomBgImage();
    });

    // Customizers event listeners
    primaryColorPicker.addEventListener("input", (e) => {
        CHRONOS_STATE.primaryColor = e.target.value;
        document.getElementById("hex-primary").innerText = e.target.value;
        applyCustomStyles();
    });
    primaryColorPicker.addEventListener("change", () => {
        saveSettingsToStorage();
    });

    glowColorPicker.addEventListener("input", (e) => {
        CHRONOS_STATE.glowColor = e.target.value;
        document.getElementById("hex-glow").innerText = e.target.value;
        applyCustomStyles();
    });
    glowColorPicker.addEventListener("change", () => {
        saveSettingsToStorage();
    });

    sliderFontSize.addEventListener("input", (e) => {
        CHRONOS_STATE.clockScale = parseFloat(e.target.value);
        document.getElementById("val-font-size").innerText = `${CHRONOS_STATE.clockScale}x`;
        applyCustomStyles();
    });
    sliderFontSize.addEventListener("change", () => {
        saveSettingsToStorage();
    });

    sliderGlow.addEventListener("input", (e) => {
        CHRONOS_STATE.glowStrength = parseInt(e.target.value);
        document.getElementById("val-glow").innerText = getGlowStrengthLabel(CHRONOS_STATE.glowStrength);
        applyCustomStyles();
    });
    sliderGlow.addEventListener("change", () => {
        saveSettingsToStorage();
    });

    sliderParticles.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        document.getElementById("val-particles").innerText = val > 0 ? "Active" : "Disabled";
        updateParticleDensity();
    });
    sliderParticles.addEventListener("change", () => {
        saveSettingsToStorage();
    });

    // Set initial layouts
    setThemeMode(CHRONOS_STATE.themeMode, false);
    applyCustomStyles();
    applyCustomBgImage();
}

function getGlowStrengthLabel(val) {
    if (val === 0) return "None";
    if (val <= 10) return "Soft";
    if (val <= 20) return "Medium";
    return "Ultra";
}

function setThemeMode(mode, save = true) {
    CHRONOS_STATE.themeMode = mode;
    if (save) saveSettingsToStorage();

    const root = document.body;
    root.classList.remove("dark-theme", "light-theme");
    
    // Manage color controller visibility
    const customColorsBox = document.getElementById("custom-color-controls");

    if (mode === 'dark') {
        root.className = "dark-theme";
        root.setAttribute("data-theme", "dark");
        customColorsBox.classList.add("hidden");
    } else if (mode === 'light') {
        root.className = "light-theme";
        root.setAttribute("data-theme", "light");
        customColorsBox.classList.add("hidden");
    } else if (mode === 'auto') {
        // Shift according to system preferences
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.className = isSystemDark ? "dark-theme" : "light-theme";
        root.setAttribute("data-theme", isSystemDark ? "dark" : "light");
        customColorsBox.classList.add("hidden");
    } else if (mode === 'custom') {
        root.className = "custom-theme";
        root.setAttribute("data-theme", "custom");
        customColorsBox.classList.remove("hidden");
    }

    applyCustomStyles();
}

function applyCustomStyles() {
    const root = document.documentElement;
    
    if (CHRONOS_STATE.themeMode === 'custom') {
        root.style.setProperty('--accent-color', CHRONOS_STATE.primaryColor);
        root.style.setProperty('--accent-glow', `rgba(${hexToRgb(CHRONOS_STATE.glowColor)}, 0.35)`);
        root.style.setProperty('--btn-primary-bg', CHRONOS_STATE.primaryColor);
        root.style.setProperty('--pill-active-border', CHRONOS_STATE.primaryColor);
        root.style.setProperty('--pill-active-bg', `rgba(${hexToRgb(CHRONOS_STATE.primaryColor)}, 0.15)`);
    } else {
        // Reset properties
        root.style.removeProperty('--accent-color');
        root.style.removeProperty('--accent-glow');
        root.style.removeProperty('--btn-primary-bg');
        root.style.removeProperty('--pill-active-border');
        root.style.removeProperty('--pill-active-bg');
    }

    // Apply scaling
    const mainClockDigits = document.getElementById("main-time-display");
    if (mainClockDigits) {
        mainClockDigits.style.transform = `scale(${CHRONOS_STATE.clockScale})`;
        mainClockDigits.style.transformOrigin = "left center";
    }

    // Apply glow
    root.style.setProperty('--glow-strength-px', `${CHRONOS_STATE.glowStrength}px`);
    // Inject shadows in style tag if needed for glow slider
    let glowStyleTag = document.getElementById("custom-glow-styles");
    if (!glowStyleTag) {
        glowStyleTag = document.createElement("style");
        glowStyleTag.id = "custom-glow-styles";
        document.head.appendChild(glowStyleTag);
    }
    glowStyleTag.innerHTML = `
        .main-time-display {
            text-shadow: 0 0 var(--glow-strength-px) var(--accent-glow);
        }
        .progress-ring-indicator {
            filter: drop-shadow(0 0 calc(var(--glow-strength-px) / 3) var(--accent-color));
        }
    `;
}

function applyCustomBgImage() {
    let customLayer = document.querySelector(".custom-bg-layer");
    const resetBgBtn = document.getElementById("bg-clear-btn");
    
    if (CHRONOS_STATE.customBgImage) {
        if (!customLayer) {
            customLayer = document.createElement("div");
            customLayer.className = "custom-bg-layer";
            document.body.appendChild(customLayer);
        }
        customLayer.style.backgroundImage = `url(${CHRONOS_STATE.customBgImage})`;
        resetBgBtn.classList.remove("hidden");
    } else {
        if (customLayer) customLayer.remove();
        resetBgBtn.classList.add("hidden");
    }
}

// ==========================================================================
// 11. TELEMETRY STATS & ASTROMETRICS
// ==========================================================================
function initTelemetryStats() {
    const cpuBar = document.getElementById("cpu-load-bar");
    const cpuVal = document.getElementById("cpu-load-val");

    // Virtual CPU Load Simulator
    setInterval(() => {
        let baseVal = 10;
        // bump CPU if canvas particles are active
        const density = parseInt(document.getElementById("slider-particles").value);
        baseVal += density * 0.15;
        
        // bump CPU if stopwatch running
        if (CHRONOS_STATE.stopwatch.running) baseVal += 8;

        const noise = Math.random() * 5 - 2.5;
        const totalCpu = Math.max(2, Math.min(99, baseVal + noise)).toFixed(1);

        cpuBar.style.width = `${totalCpu}%`;
        cpuVal.innerText = `${totalCpu}%`;
    }, 1200);

    // Astro estimations (Sunset, Sunrise & Moon phases)
    const astroSun = document.getElementById("astrometrics-sun");
    const astroMoon = document.getElementById("astrometrics-moon");

    // Hardcode generic sunrise/sunset approximations that adjust slightly with seasons
    const d = new Date();
    const month = d.getMonth();
    
    // Summer vs Winter mock offsets
    const summerMonths = [4, 5, 6, 7]; // May, Jun, Jul, Aug
    const isSummer = summerMonths.includes(month);
    
    const sr = isSummer ? "05:14 AM" : "06:45 AM";
    const ss = isSummer ? "07:18 PM" : "05:32 PM";
    astroSun.innerText = `SR: ${sr} | SS: ${ss}`;

    // Moon phase approximation using simple Synodic cycle estimation
    // 29.53 days cycle
    const baseDate = new Date(2000, 0, 6); // Known New Moon
    const diffMs = d - baseDate;
    const synodicMs = 29.530588853 * 24 * 60 * 60 * 1000;
    const phaseRatio = (diffMs % synodicMs) / synodicMs;
    
    let phaseName = "";
    let illumination = 0;

    if (phaseRatio < 0.03 || phaseRatio > 0.97) {
        phaseName = "New Moon";
        illumination = 0;
    } else if (phaseRatio < 0.22) {
        phaseName = "Waxing Crescent";
        illumination = Math.round(phaseRatio * 100 * 2);
    } else if (phaseRatio < 0.28) {
        phaseName = "First Quarter";
        illumination = 50;
    } else if (phaseRatio < 0.47) {
        phaseName = "Waxing Gibbous";
        illumination = Math.round(50 + (phaseRatio - 0.25) * 100 * 2);
    } else if (phaseRatio < 0.53) {
        phaseName = "Full Moon";
        illumination = 100;
    } else if (phaseRatio < 0.72) {
        phaseName = "Waning Gibbous";
        illumination = Math.round(100 - (phaseRatio - 0.5) * 100 * 2);
    } else if (phaseRatio < 0.78) {
        phaseName = "Third Quarter";
        illumination = 50;
    } else {
        phaseName = "Waning Crescent";
        illumination = Math.round(50 - (phaseRatio - 0.75) * 100 * 2);
    }

    astroMoon.innerText = `${phaseName} (${illumination}% illuminated)`;
}

// ==========================================================================
// 12. SPECIAL UTILITIES (Screenshot, Fullscreen, QR Code)
// ==========================================================================
function initBonusUtilities() {
    // Fullscreen Toggler
    const fsBtn = document.getElementById("fullscreen-btn");
    fsBtn.addEventListener("click", () => {
        playClickSynth();
        toggleFullscreen();
    });

    // Voice announcement trigger toggle
    const voiceBtn = document.getElementById("voice-toggle-btn");
    voiceBtn.addEventListener("click", () => {
        CHRONOS_STATE.voiceEnabled = !CHRONOS_STATE.voiceEnabled;
        voiceBtn.classList.toggle("active", CHRONOS_STATE.voiceEnabled);
        playClickSynth();
        saveSettingsToStorage();
    });

    // Share QR Code modal
    const qrBtn = document.getElementById("share-qr-btn");
    const qrModal = document.getElementById("qr-modal");
    const closeQr = document.getElementById("close-qr-modal");

    qrBtn.addEventListener("click", () => {
        playClickSynth();
        
        // Inject QR image inside modal
        const qrContainer = document.getElementById("qr-code-container");
        const currentUrl = window.location.href;
        
        // API generating simple visual QR
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}" alt="Chronos Web App QR Code">`;
        
        qrModal.classList.add("active");
    });

    closeQr.addEventListener("click", () => {
        playClickSynth();
        qrModal.classList.remove("remove");
        qrModal.classList.remove("active");
    });

    // Capture screenshot download
    const screenshotBtn = document.getElementById("capture-screenshot-btn");
    screenshotBtn.addEventListener("click", () => {
        playClickSynth();
        exportClockScreenshot();
    });

    // Network status listener
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);
    updateNetworkStatus();

    // Battery API connection
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            updateBatteryStatus(battery);
            
            // Listeners
            battery.addEventListener("levelchange", () => updateBatteryStatus(battery));
            battery.addEventListener("chargingchange", () => updateBatteryStatus(battery));
        });
    } else {
        // Battery status fallback
        document.getElementById("battery-status").classList.add("hidden");
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(err);
        });
    } else {
        document.exitFullscreen();
    }
}

function updateNetworkStatus() {
    const netBadge = document.getElementById("net-status");
    const waves = netBadge.querySelectorAll(".net-wave");
    const label = netBadge.querySelector(".status-label");

    if (navigator.onLine) {
        netBadge.classList.remove("offline");
        label.innerText = "Online";
        waves.forEach(w => w.style.display = "block");
    } else {
        netBadge.classList.add("offline");
        label.innerText = "Offline";
        waves.forEach(w => w.style.display = "none");
    }
}

function updateBatteryStatus(battery) {
    const pctLabel = document.getElementById("battery-percentage");
    const levelBar = document.getElementById("battery-level-bar");
    
    const percentage = Math.round(battery.level * 100);
    pctLabel.innerText = `${percentage}%`;

    if (levelBar) {
        // Adjust width parameter
        const widthVal = Math.round(battery.level * 12);
        levelBar.setAttribute("width", widthVal);
        
        // Add color overrides based on level
        if (battery.charging) {
            levelBar.style.fill = "#4caf50"; // Charging Green
        } else if (percentage <= 20) {
            levelBar.style.fill = "#ef4444"; // Warning Red
        } else {
            levelBar.style.fill = "currentColor"; // Normal Theme Accent
        }
    }
}

// Canvas-based Clock Screenshot Generator
function exportClockScreenshot() {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 350;
    const ctx = canvas.getContext("2d");

    // 1. Draw Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 350);
    if (CHRONOS_STATE.themeMode === 'light') {
        grad.addColorStop(0, '#e2e8f0');
        grad.addColorStop(1, '#f1f5f9');
    } else {
        grad.addColorStop(0, '#090816');
        grad.addColorStop(1, '#0d1224');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 350);

    // 2. Draw border frame
    ctx.strokeStyle = CHRONOS_STATE.primaryColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 330);

    // 3. Render brand title
    ctx.fillStyle = CHRONOS_STATE.themeMode === 'light' ? '#0f172a' : '#ffffff';
    ctx.font = "800 18px Outfit, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("Dig-clock", 40, 50);

    // 4. Render Timezone details
    ctx.fillStyle = '#94a3b8';
    ctx.font = "600 12px Outfit, sans-serif";
    const zoneName = document.getElementById("meta-timezone").innerText;
    ctx.fillText(`ZONE: ${zoneName}`, 40, 70);

    // 5. Render Main Digital Time digits
    const d = getZonedDateObject();
    let hr = d.getHours();
    const min = d.getMinutes().toString().padStart(2, '0');
    const sec = d.getSeconds().toString().padStart(2, '0');
    let period = "";

    if (!CHRONOS_STATE.use24Hour) {
        period = hr >= 12 ? "PM" : "AM";
        hr = hr % 12;
        hr = hr ? hr : 12;
    }
    const hrStr = hr.toString().padStart(2, '0');
    const displayTime = `${hrStr}:${min}:${sec} ${period}`;

    // Neon glow effect setup
    ctx.shadowColor = CHRONOS_STATE.glowColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = CHRONOS_STATE.primaryColor;
    ctx.font = "700 68px JetBrains Mono, monospace";
    ctx.fillText(displayTime, 40, 180);

    // Reset shadow parameters
    ctx.shadowBlur = 0;

    // 6. Draw Date Subline
    const day = document.getElementById("clock-day-num").innerText;
    const weekday = document.getElementById("clock-weekday").innerText;
    const month = document.getElementById("clock-month").innerText;
    const year = document.getElementById("clock-year").innerText;
    
    ctx.fillStyle = CHRONOS_STATE.themeMode === 'light' ? '#334155' : '#e2e8f0';
    ctx.font = "500 24px Outfit, sans-serif";
    ctx.fillText(`${weekday}, ${day} ${month} ${year}`, 40, 240);

    // 7. Add Quote on Bottom
    const quoteTxt = document.getElementById("quote-text-val").innerText;
    const quoteAuthor = document.getElementById("quote-author-val").innerText;
    
    ctx.fillStyle = '#64748b';
    ctx.font = "italic 11px Outfit, sans-serif";
    ctx.fillText(`${quoteTxt} ${quoteAuthor}`, 40, 300);

    // 8. Download PNG
    const link = document.createElement("a");
    link.download = `Dig-clock-Time-Export-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// ==========================================================================
// 13. ACCESSIBILITY KEYBOARD & SHORTCUTS GUIDE
// ==========================================================================
function initKeyboardShortcuts() {
    const shortcutsBtn = document.getElementById("shortcuts-btn");
    const shortcutsModal = document.getElementById("shortcuts-modal");
    const closeShortcuts = document.getElementById("close-shortcuts-modal");

    shortcutsBtn.addEventListener("click", () => {
        playClickSynth();
        shortcutsModal.classList.add("active");
    });

    closeShortcuts.addEventListener("click", () => {
        playClickSynth();
        shortcutsModal.classList.remove("active");
    });

    // Close active modal on overlay click
    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                playClickSynth();
                modal.classList.remove("active");
                stopActiveRinging();
            }
        });
    });

    // Main shortcuts listener
    document.addEventListener("keydown", (e) => {
        const key = e.key.toUpperCase();
        
        // Escape dismisses modals
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-overlay").forEach(modal => {
                if (modal.classList.contains("active")) {
                    modal.classList.remove("active");
                    playClickSynth();
                }
            });
            if (activeRingingAlarm) stopActiveRinging();
            return;
        }

        // Avoid triggering shortcuts while typing inside input fields
        if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT") {
            return;
        }

        switch(key) {
            case 'S': // Stopwatch trigger
                e.preventDefault();
                document.getElementById("stopwatch-start-btn").click();
                break;
            case 'L': // Stopwatch Lap
                e.preventDefault();
                const lapBtn = document.getElementById("stopwatch-lap-btn");
                if (!lapBtn.disabled) lapBtn.click();
                break;
            case 'R': // Stopwatch reset
                e.preventDefault();
                document.getElementById("stopwatch-reset-btn").click();
                break;
            case 'T': // Format shift
                e.preventDefault();
                if (CHRONOS_STATE.use24Hour) {
                    document.getElementById("format-12h").click();
                } else {
                    document.getElementById("format-24h").click();
                }
                break;
            case 'M': // Toggle milliseconds
                e.preventDefault();
                document.getElementById("toggle-ms").click();
                break;
            case 'F': // Toggle Fullscreen
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'V': // Speech Announcement
                e.preventDefault();
                speakTime();
                break;
        }
    });
}

// ==========================================================================
// 14. LOCAL STORAGE ENGINE
// ==========================================================================
function saveSettingsToStorage() {
    try {
        const settings = {
            use24Hour: CHRONOS_STATE.use24Hour,
            showMs: CHRONOS_STATE.showMs,
            activeTimezone: CHRONOS_STATE.activeTimezone,
            soundEnabled: CHRONOS_STATE.soundEnabled,
            voiceEnabled: CHRONOS_STATE.voiceEnabled,
            themeMode: CHRONOS_STATE.themeMode,
            primaryColor: CHRONOS_STATE.primaryColor,
            glowColor: CHRONOS_STATE.glowColor,
            clockScale: CHRONOS_STATE.clockScale,
            glowStrength: CHRONOS_STATE.glowStrength,
            customBgImage: CHRONOS_STATE.customBgImage,
            alarms: CHRONOS_STATE.alarms.map(a => ({
                id: a.id,
                time: a.time,
                label: a.label,
                repeat: a.repeat,
                active: a.active,
                snoozedTime: null // Clear snoozes on storage save
            })),
            weatherCity: CHRONOS_STATE.weather.city,
            weatherApiKey: CHRONOS_STATE.weather.apiKey,
            weatherLat: CHRONOS_STATE.weather.lat,
            weatherLon: CHRONOS_STATE.weather.lon
        };
        localStorage.setItem("CHRONOS_USER_SETTINGS", JSON.stringify(settings));
    } catch(err) {
        console.error("Local Storage Save Error: ", err);
    }
}

function loadSettingsFromStorage() {
    try {
        const data = localStorage.getItem("CHRONOS_USER_SETTINGS");
        if (!data) return;

        const settings = JSON.parse(data);

        CHRONOS_STATE.use24Hour = settings.use24Hour ?? false;
        CHRONOS_STATE.showMs = settings.showMs ?? false;
        CHRONOS_STATE.activeTimezone = settings.activeTimezone ?? 'local';
        CHRONOS_STATE.soundEnabled = settings.soundEnabled ?? true;
        CHRONOS_STATE.voiceEnabled = settings.voiceEnabled ?? false;
        CHRONOS_STATE.themeMode = settings.themeMode ?? 'dark';
        CHRONOS_STATE.primaryColor = settings.primaryColor ?? '#00ffff';
        CHRONOS_STATE.glowColor = settings.glowColor ?? '#0088ff';
        CHRONOS_STATE.clockScale = settings.clockScale ?? 1.0;
        CHRONOS_STATE.glowStrength = settings.glowStrength ?? 15;
        CHRONOS_STATE.customBgImage = settings.customBgImage ?? null;
        CHRONOS_STATE.alarms = settings.alarms ?? [];
        CHRONOS_STATE.weather.city = settings.weatherCity ?? "New Delhi";
        CHRONOS_STATE.weather.apiKey = settings.weatherApiKey ?? "";
        CHRONOS_STATE.weather.lat = settings.weatherLat ?? null;
        CHRONOS_STATE.weather.lon = settings.weatherLon ?? null;

        // Apply visual button toggles matches
        const btnMs = document.getElementById("toggle-ms");
        if (btnMs) btnMs.classList.toggle("active", CHRONOS_STATE.showMs);
        const clockMs = document.getElementById("clock-ms");
        if (clockMs) clockMs.classList.toggle("hidden", !CHRONOS_STATE.showMs);

        const btn12h = document.getElementById("format-12h");
        const btn24h = document.getElementById("format-24h");
        if (btn12h && btn24h) {
            btn12h.classList.toggle("active", !CHRONOS_STATE.use24Hour);
            btn24h.classList.toggle("active", CHRONOS_STATE.use24Hour);
        }

        const tzSelector = document.getElementById("timezone-selector");
        if (tzSelector) {
            tzSelector.value = CHRONOS_STATE.activeTimezone;
            document.getElementById("meta-timezone").innerText = tzSelector.options[tzSelector.selectedIndex].text.split("(")[0].trim();
        }

        const voiceBtn = document.getElementById("voice-toggle-btn");
        if (voiceBtn) voiceBtn.classList.toggle("active", CHRONOS_STATE.voiceEnabled);

    } catch (err) {
        console.error("Local Storage Read Error: ", err);
    }
}
