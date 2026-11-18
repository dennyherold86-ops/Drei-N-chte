/* ==========================================================
   DREI NÄCHTE
   Master Script v2
   Block 1/8
========================================================== */

// ==========================================================
// DOM
// ==========================================================

const intro = document.getElementById("intro");
const playerPage = document.getElementById("playerPage");
const ending = document.getElementById("ending");

const audio = document.getElementById("audio");

const playButton = document.getElementById("playButton");
const playIcon = document.getElementById("playIcon");

const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const volume = document.getElementById("volume");

const cover = document.getElementById("cover");
const background = document.querySelector(".background");
const playerCard = document.querySelector(".player-card");
const coverWrapper = document.querySelector(".cover-wrapper");

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

const progressRing = document.getElementById("ringProgress");

const particles = document.getElementById("particles");
const lights = document.getElementById("floatingLights");
const hearts = document.getElementById("floatingHearts");

// ==========================================================
// Variablen
// ==========================================================

let endingShown = false;

let finale1 = false;
let finale2 = false;
let finale3 = false;
let finale4 = false;

const RADIUS = 176;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

progressRing.style.strokeDasharray = CIRCUMFERENCE;
progressRing.style.strokeDashoffset = CIRCUMFERENCE;

// ==========================================================
// Audio API
// ==========================================================

const audioContext = new AudioContext();

const source =
    audioContext.createMediaElementSource(audio);

const analyser =
    audioContext.createAnalyser();

source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 256;

const frequencyData =
    new Uint8Array(analyser.frequencyBinCount);

// ==========================================================
// Intro
// ==========================================================

window.addEventListener("load", () => {

    setTimeout(() => {

        intro.classList.add("fade-out");

        setTimeout(() => {

            intro.style.display = "none";

            playerPage.classList.remove("hidden");
            playerPage.classList.add("fade-in");

        }, 2000);

    }, 5000);

});

// ==========================================================
// Hilfsfunktionen
// ==========================================================

function formatTime(seconds) {

    if (isNaN(seconds)) return "0:00";

    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    return `${m}:${String(s).padStart(2, "0")}`;

}

function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );

}

/* ==========================================================
   PLAYER
========================================================== */

function updateDuration() {

    if (Number.isFinite(audio.duration)) {
        duration.textContent = formatTime(audio.duration);
    }

}

audio.addEventListener("loadedmetadata", updateDuration);
audio.addEventListener("durationchange", updateDuration);
audio.addEventListener("canplay", updateDuration);


playButton.addEventListener("click", togglePlayback);


function togglePlayback() {

    if (audio.paused) {

        if (audio.ended || audio.currentTime === 0) {

            resetEnding();

        }

        playSong();

    } else {

        pauseSong();

    }

}


function playSong() {

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    audio.play();

}


function pauseSong() {

    audio.pause();

}


/* ==========================================================
   PLAYER STATUS
========================================================== */

audio.addEventListener("play", () => {

    playIcon.textContent = "❚❚";

    cover.classList.add("cover-rotate");

    playerCard.classList.add("player-playing");

    coverWrapper.classList.add("cover-glow");

    background.classList.add("background-playing");
    background.classList.add("background-breathe");

    document.title = "▶ Drei Nächte ❤️";

});


audio.addEventListener("pause", () => {

    playIcon.textContent = "▶";

    cover.classList.remove("cover-rotate");

    playerCard.classList.remove("player-playing");

    coverWrapper.classList.remove("cover-glow");

    background.classList.remove("background-playing");
    background.classList.remove("background-breathe");

    document.title = "Drei Nächte ❤️";

});


/* ==========================================================
   PROGRESS
========================================================== */

audio.addEventListener("timeupdate", updateProgress);


function updateProgress() {

    if (!audio.duration) return;

    const percent =
        audio.currentTime / audio.duration;

    progress.value = percent * 100;

    currentTime.textContent =
        formatTime(audio.currentTime);

    progressRing.style.strokeDashoffset =
        CIRCUMFERENCE -
        (percent * CIRCUMFERENCE);

    runFinale();

}


progress.addEventListener("input", () => {

    if (!audio.duration) return;

    audio.currentTime =
        (progress.value / 100) * audio.duration;

});


/* ==========================================================
   VOLUME
========================================================== */

volume.addEventListener("input", () => {

    audio.volume = clamp(

        Number(volume.value),

        0,

        1

    );

});


/* ==========================================================
   KEYBOARD
========================================================== */

document.addEventListener("keydown", e => {

    if (e.code === "Space") {

        e.preventDefault();

        togglePlayback();

    }

});

/* ==========================================================
   AUDIO VISUALIZER
========================================================== */

function resizeCanvas() {

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


function updateAudioEffects() {

    analyser.getByteFrequencyData(frequencyData);

    let sum = 0;

    for (let i = 0; i < frequencyData.length; i++) {

        sum += frequencyData[i];

    }

    const level = sum / frequencyData.length;

    /* Cover leicht pulsieren */

    const coverScale =
        1 + (level * 0.00045);

    cover.style.transform =
        `scale(${coverScale})`;

    /* Player Glow */

    playerCard.style.boxShadow =

        `0 18px ${45 + level * 0.6}px rgba(255,255,255,.08),
         0 0 ${20 + level * 0.35}px rgba(255,255,255,.10)`;

    /* Cover Glow */

    coverWrapper.style.boxShadow =

        `0 0 ${30 + level * 0.5}px rgba(255,255,255,.20)`;

}


/* ==========================================================
   CIRCULAR VISUALIZER
========================================================== */

function drawVisualizer() {

    requestAnimationFrame(drawVisualizer);

    analyser.getByteFrequencyData(frequencyData);

    updateAudioEffects();

    ctx.clearRect(

        0,
        0,
        canvas.width,
        canvas.height

    );

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const baseRadius = 175;

    const bars = 128;

    for (let i = 0; i < bars; i++) {

        const value =
            frequencyData[
                Math.floor(
                    i * frequencyData.length / bars
                )
            ];

        const strength =
            value / 255;

        const angle =
            (Math.PI * 2 / bars) * i;

        const length =
            14 + strength * 46;

        const x1 =
            cx + Math.cos(angle) * baseRadius;

        const y1 =
            cy + Math.sin(angle) * baseRadius;

        const x2 =
            cx + Math.cos(angle) * (baseRadius + length);

        const y2 =
            cy + Math.sin(angle) * (baseRadius + length);

        ctx.beginPath();

        ctx.moveTo(x1, y1);

        ctx.lineTo(x2, y2);

        ctx.lineWidth =
            2 + strength * 1.2;

        ctx.strokeStyle =

            `rgba(255,255,255,${
                0.08 + strength * 0.9
            })`;

        ctx.stroke();

    }

}

drawVisualizer();

/* ==========================================================
   PARALLAX BACKGROUND
========================================================== */

let targetX = 0;
let targetY = 0;

let currentX = 0;
let currentY = 0;

document.addEventListener("mousemove", e => {

    targetX =
        (e.clientX / window.innerWidth - 0.5) * 16;

    targetY =
        (e.clientY / window.innerHeight - 0.5) * 16;

});

function animateParallax() {

    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    background.style.setProperty(
        "--moveX",
        currentX + "px"
    );

    background.style.setProperty(
        "--moveY",
        currentY + "px"
    );

    requestAnimationFrame(animateParallax);

}

if (window.matchMedia("(pointer:fine)").matches) {

    animateParallax();

}

/* ==========================================================
   FLOATING LIGHTS
========================================================== */

function createLight() {

    const light = document.createElement("div");

    light.className = "light";

    const size = 40 + Math.random() * 120;

    light.style.width = size + "px";
    light.style.height = size + "px";

    light.style.left =
        Math.random() * 100 + "vw";

    light.style.animationDuration =
        (18 + Math.random() * 16) + "s";

    light.dataset.baseOpacity =
        0.04 + Math.random() * 0.05;

    light.style.opacity =
        light.dataset.baseOpacity;

    lights.appendChild(light);

    light.addEventListener("animationend", () => {

        light.remove();

    });

}

setInterval(createLight, 2200);

/* ==========================================================
   FLOATING HEARTS
========================================================== */

function createHeart() {

    if (audio.paused) return;

    const heart = document.createElement("div");

    heart.className = "floating-heart";

    heart.textContent = "❤️";

    heart.style.left =
        Math.random() * 100 + "vw";

    heart.style.fontSize =
        (16 + Math.random() * 18) + "px";

    heart.style.animationDuration =
        (12 + Math.random() * 10) + "s";

    hearts.appendChild(heart);

    heart.addEventListener("animationend", () => {

        heart.remove();

    });

}

function heartLoop() {

    createHeart();

    const delay =
        18000 + Math.random() * 20000;

    setTimeout(heartLoop, delay);

}

heartLoop();

/* ==========================================================
   AMBIENT PARTICLES
========================================================== */

function createParticle() {

    const p = document.createElement("div");

    p.style.position = "absolute";
    p.style.width = "2px";
    p.style.height = "2px";
    p.style.borderRadius = "50%";
    p.style.background = "rgba(255,255,255,.25)";

    p.style.left =
        Math.random() * 100 + "vw";

    p.style.top =
        Math.random() * 100 + "vh";

    p.animate(

        [

            {
                transform: "translateY(0px)",
                opacity: 0
            },

            {
                opacity: .4,
                offset: .2
            },

            {
                transform: "translateY(-120px)",
                opacity: 0
            }

        ],

        {

            duration:
                9000 + Math.random() * 6000,

            easing: "linear"

        }

    );

    particles.appendChild(p);

    setTimeout(() => p.remove(), 15000);

}

setInterval(createParticle, 700);

/* ==========================================================
   CINEMATIC FINALE
========================================================== */

function runFinale() {

    if (!audio.duration) return;

    const remaining =
        audio.duration - audio.currentTime;

    if (remaining <= 12 && !finale1) {

        finale1 = true;

        document.body.classList.add("finale-1");

    }

    if (remaining <= 8 && !finale2) {

        finale2 = true;

        document.body.classList.add("finale-2");

    }

    if (remaining <= 5 && !finale3) {

        finale3 = true;

        document.body.classList.add("finale-3");

    }

    if (remaining <= 2 && !finale4) {

        finale4 = true;

        document.body.classList.add("finale-4");

    }

}


/* ==========================================================
   SONG ENDE
========================================================== */

audio.addEventListener("ended", () => {

    playIcon.textContent = "▶";

    document.title = "❤️ Drei Nächte";

    cover.classList.remove("cover-rotate");

    playerCard.classList.remove("player-playing");

    coverWrapper.classList.remove("cover-glow");

    background.classList.remove("background-playing");
    background.classList.remove("background-breathe");

    playerCard.classList.add("final-fade");

    canvas.classList.add("fade");

    document
        .getElementById("progressRing")
        .classList.add("fade");

    document.body.classList.add("song-finished");

    setTimeout(showEnding, 1500);

});


/* ==========================================================
   ABSCHLUSS
========================================================== */

function showEnding() {

    ending.classList.remove("hidden");

    // Browser zum Neuzeichnen zwingen
    void ending.offsetWidth;

    setTimeout(() => {

        ending.classList.add("show");

        showFinalText();

    }, 80);

}


/* ==========================================================
   TEXTE EINBLENDEN
========================================================== */

function showFinalText() {

    const ids = [

        "line1",
        "line2",
        "line3",
        "line4",
        "line5"

    ];

    ids.forEach((id, index) => {

        setTimeout(() => {

            const element =
                document.getElementById(id);

            if (!element) return;

            element.classList.add("show-line");

        }, index * 2200);

    });

}

/* ==========================================================
   RESET
========================================================== */

function resetPlayer() {

    endingShown = false;

    finale1 = false;
    finale2 = false;
    finale3 = false;
    finale4 = false;

    audio.currentTime = 0;

    progress.value = 0;

    currentTime.textContent = "0:00";

    progressRing.style.strokeDashoffset =
        CIRCUMFERENCE;

    playIcon.textContent = "▶";

    document.title = "❤️ Drei Nächte";

    playerCard.classList.remove(
        "player-playing",
        "final-fade"
    );

    cover.classList.remove("cover-rotate");

    cover.style.transform = "";

    coverWrapper.classList.remove("cover-glow");
    coverWrapper.style.boxShadow = "";

    background.classList.remove(
        "background-playing",
        "background-breathe"
    );

    background.style.filter = "";
    background.style.removeProperty("--moveX");
    background.style.removeProperty("--moveY");

    canvas.classList.remove("fade");

    document
        .getElementById("progressRing")
        .classList.remove("fade");

    document.body.classList.remove(

        "song-finished",

        "finale-1",
        "finale-2",
        "finale-3",
        "finale-4"

    );

}


/* ==========================================================
   ENDING RESET
========================================================== */

function resetEnding() {

    ending.classList.remove("show");
    ending.classList.add("hidden");

    document
        .querySelectorAll("#ending .show-line")
        .forEach(element => {

            element.classList.remove("show-line");

        });

}


/* ==========================================================
   AUTOMATISCHER RESET
========================================================== */

audio.addEventListener("ended", () => {

    setTimeout(() => {

        resetEnding();

        resetPlayer();

    }, 15000);

});


/* ==========================================================
   TAB SICHTBARKEIT
========================================================== */

document.addEventListener("visibilitychange", () => {

    if (document.hidden) return;

    resizeCanvas();

});


/* ==========================================================
   FENSTERGRÖSSE
========================================================== */

window.addEventListener("resize", () => {

    resizeCanvas();

});

/* ==========================================================
   PERFORMANCE
========================================================== */

let animationRunning = true;

document.addEventListener("visibilitychange", () => {

    animationRunning = !document.hidden;

});


/* ==========================================================
   ANIMATION LOOP
========================================================== */

function animationLoop() {

    if (animationRunning) {

        updateAudioEffects();

    }

    requestAnimationFrame(animationLoop);

}

animationLoop();


/* ==========================================================
   PLAYER STATE
========================================================== */

function isPlaying() {

    return (
        !audio.paused &&
        !audio.ended &&
        audio.currentTime > 0
    );

}


/* ==========================================================
   PROGRESS RING RESET
========================================================== */

function resetProgressRing() {

    progress.value = 0;

    progressRing.style.strokeDashoffset =
        CIRCUMFERENCE;

}


/* ==========================================================
   AUDIO FEHLER
========================================================== */

audio.addEventListener("error", () => {

    console.error("Audio konnte nicht geladen werden.");

    playButton.disabled = true;

    playIcon.textContent = "⚠";

});


/* ==========================================================
   INITIALE LAUTSTÄRKE
========================================================== */

audio.volume = clamp(

    Number(volume.value),

    0,

    1

);


/* ==========================================================
   PLAYER ENDE
========================================================== */

audio.addEventListener("pause", () => {

    if (audio.ended) return;

    cover.style.transform = "";

});


/* ==========================================================
   KLEINE OPTIMIERUNG
========================================================== */

setInterval(() => {

    document
        .querySelectorAll(".light")
        .forEach(light => {

            if (!document.body.contains(light)) return;

        });

}, 10000);

/* ==========================================================
   INITIALISIERUNG
========================================================== */

function initializePlayer() {

    // Canvas vorbereiten
    resizeCanvas();

    // Progress Ring initialisieren
    progressRing.style.strokeDasharray = CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = CIRCUMFERENCE;

    // Anfangswerte
    progress.value = 0;
    currentTime.textContent = "0:00";

    audio.volume = clamp(Number(volume.value), 0, 1);

    // Titel setzen
    document.title = "❤️ Drei Nächte";

}


/* ==========================================================
   START
========================================================== */

initializePlayer();

drawVisualizer();


/* ==========================================================
   DEBUG (optional)
========================================================== */

// console.log("Drei Nächte initialisiert");


/* ==========================================================
   ENDE
========================================================== */