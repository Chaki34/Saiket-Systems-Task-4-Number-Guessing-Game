// Constants & States
const MAX_ATTEMPTS = 10;
let secretNumber = 0;
let attemptsUsed = 0;
let currentGuessStr = "";
let isGameOver = false;
let minBoundary = 1;
let maxBoundary = 100;

// DOM Elements
const displayNum = document.getElementById("displayNum");
const feedbackBanner = document.getElementById("feedbackBanner");
const feedbackText = document.getElementById("feedbackText");
const attemptsLeftEl = document.getElementById("attemptsLeft");
const attemptsUsedEl = document.getElementById("attemptsUsed");
const floorLabel = document.getElementById("floorLabel");
const ceilLabel = document.getElementById("ceilLabel");
const rangeBar = document.getElementById("rangeBar");
const numberBoard = document.getElementById("numberBoard");
const boardContainer = document.getElementById("boardContainer");
const toggleBoardBtn = document.getElementById("toggleBoardBtn");
const btnSubmitGuess = document.getElementById("btnSubmitGuess");
const btnPlayAgain = document.getElementById("btnPlayAgain");
const quickRestart = document.getElementById("quickRestart");

// 1. Initialize 1-100 Number Board
function buildNumberBoard() {
    numberBoard.innerHTML = "";
    for (let i = 1; i <= 100; i++) {
        const chip = document.createElement("div");
        chip.className = "num-chip";
        chip.textContent = i;
        chip.dataset.val = i;
        chip.addEventListener("click", () => {
            if (isGameOver) return;
            currentGuessStr = String(i);
            updateDisplay();
            processGuess();
        });
        numberBoard.appendChild(chip);
    }
}

// 2. Start/Restart Game
function initGame() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attemptsUsed = 0;
    currentGuessStr = "";
    isGameOver = false;
    minBoundary = 1;
    maxBoundary = 100;

    attemptsLeftEl.textContent = MAX_ATTEMPTS;
    attemptsUsedEl.textContent = 0;
    floorLabel.textContent = 1;
    ceilLabel.textContent = 100;

    rangeBar.style.width = "100%";
    rangeBar.style.marginLeft = "0%";

    displayNum.textContent = "--";
    displayNum.style.borderColor = "#334155";
    displayNum.style.color = "#38bdf8";

    setFeedback("default", '<i class="bi bi-lightbulb-fill fs-5"></i> Tap a number or use keypad to begin!');
    btnSubmitGuess.disabled = false;
    btnPlayAgain.style.display = "none";

    stopConfetti();
    buildNumberBoard();
}

// 3. UI Helpers
function updateDisplay() {
    displayNum.textContent = currentGuessStr === "" ? "--" : currentGuessStr;
}

function setFeedback(stateClass, htmlContent) {
    feedbackBanner.className = `feedback-banner ${stateClass}`;
    feedbackBanner.innerHTML = htmlContent;
}

function updateRangeIndicator() {
    floorLabel.textContent = minBoundary;
    ceilLabel.textContent = maxBoundary;

    const widthPercent = ((maxBoundary - minBoundary) / 99) * 100;
    const offsetPercent = ((minBoundary - 1) / 99) * 100;

    rangeBar.style.width = `${Math.max(widthPercent, 4)}%`;
    rangeBar.style.marginLeft = `${offsetPercent}%`;

    // Diminate out-of-range chips on the board
    document.querySelectorAll(".num-chip").forEach(chip => {
        const val = parseInt(chip.dataset.val, 10);
        if (val < minBoundary || val > maxBoundary) {
            chip.classList.add("eliminated");
        }
    });
}

// 4. Processing Guesses
function processGuess() {
    if (isGameOver) return;

    const guess = parseInt(currentGuessStr, 10);
    if (isNaN(guess) || guess < 1 || guess > 100) {
        setFeedback("too-high", '<i class="bi bi-exclamation-circle-fill fs-5"></i> Pick a valid number between 1 & 100!');
        return;
    }

    attemptsUsed++;
    const attemptsRemaining = MAX_ATTEMPTS - attemptsUsed;
    attemptsUsedEl.textContent = attemptsUsed;
    attemptsLeftEl.textContent = Math.max(0, attemptsRemaining);

    const targetChip = document.querySelector(`.num-chip[data-val='${guess}']`);

    if (guess === secretNumber) {
        // VICTORY
        isGameOver = true;
        if (targetChip) targetChip.classList.add("winner");
        setFeedback("won", `<i class="bi bi-trophy-fill fs-4 text-warning"></i> INCREDIBLE! You guessed ${secretNumber} in ${attemptsUsed} tries!`);
        displayNum.style.borderColor = "#10b981";
        displayNum.style.color = "#10b981";
        endGame(true);
    } else if (guess < secretNumber) {
        // TOO LOW
        if (guess >= minBoundary) minBoundary = guess + 1;
        if (targetChip) targetChip.classList.add("low-indicator");
        setFeedback("too-low", `<i class="bi bi-arrow-up-circle-fill fs-5"></i> Too Low! Higher than ${guess}.`);
    } else {
        // TOO HIGH
        if (guess <= maxBoundary) maxBoundary = guess - 1;
        if (targetChip) targetChip.classList.add("high-indicator");
        setFeedback("too-high", `<i class="bi bi-arrow-down-circle-fill fs-5"></i> Too High! Lower than ${guess}.`);
    }

    updateRangeIndicator();

    if (!isGameOver && attemptsRemaining <= 0) {
        // GAME OVER (Loss)
        isGameOver = true;
        setFeedback("lost", `<i class="bi bi-x-circle-fill fs-5"></i> Out of attempts! Secret number was ${secretNumber}.`);
        displayNum.textContent = secretNumber;
        displayNum.style.borderColor = "#ef4444";
        displayNum.style.color = "#ef4444";
        endGame(false);
    }

    currentGuessStr = "";
}

function endGame(won) {
    btnSubmitGuess.disabled = true;
    btnPlayAgain.style.display = "block";
    if (won) {
        startConfetti();
    }
}

// 5. Keypad Event Listeners
document.querySelectorAll(".key-btn[data-key]").forEach(btn => {
    btn.addEventListener("click", () => {
        if (isGameOver) return;
        const digit = btn.dataset.key;
        if (currentGuessStr.length >= 3) return; // prevent > 100
        currentGuessStr += digit;
        if (parseInt(currentGuessStr, 10) > 100) currentGuessStr = "100";
        updateDisplay();
    });
});

document.querySelector("[data-action='clear']").addEventListener("click", () => {
    currentGuessStr = "";
    updateDisplay();
});

document.querySelector("[data-action='backspace']").addEventListener("click", () => {
    currentGuessStr = currentGuessStr.slice(0, -1);
    updateDisplay();
});

btnSubmitGuess.addEventListener("click", processGuess);
btnPlayAgain.addEventListener("click", initGame);
quickRestart.addEventListener("click", initGame);

// Toggle 1-100 board visibility
toggleBoardBtn.addEventListener("click", () => {
    if (boardContainer.style.display === "none") {
        boardContainer.style.display = "block";
        toggleBoardBtn.textContent = "Hide Grid";
    } else {
        boardContainer.style.display = "none";
        toggleBoardBtn.textContent = "Show Grid";
    }
});

// Keyboard Support
window.addEventListener("keydown", (e) => {
    if (isGameOver) {
        if (e.key === "Enter") initGame();
        return;
    }
    if (e.key >= "0" && e.key <= "9") {
        if (currentGuessStr.length < 3) {
            currentGuessStr += e.key;
            if (parseInt(currentGuessStr, 10) > 100) currentGuessStr = "100";
            updateDisplay();
        }
    } else if (e.key === "Backspace") {
        currentGuessStr = currentGuessStr.slice(0, -1);
        updateDisplay();
    } else if (e.key === "Enter") {
        processGuess();
    }
});

/* ==========================================================================
   Lightweight, Self-Contained Canvas Confetti Celebration
   ========================================================================== */
const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");
let confettiParticles = [];
let confettiAnimId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Confetti {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.color = ["#6366f1", "#a855f7", "#ec4899", "#38bdf8", "#facc15", "#4ade80"][Math.floor(Math.random() * 6)];
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 + 3;
        this.rotation = Math.random() * 360;
        this.rotSpeed = Math.random() * 6 - 3;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotSpeed;
        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach(p => {
        p.update();
        p.draw();
    });
    confettiAnimId = requestAnimationFrame(animateConfetti);
}

function startConfetti() {
    stopConfetti();
    confettiParticles = Array.from({ length: 120 }, () => new Confetti());
    animateConfetti();
}

function stopConfetti() {
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    confettiParticles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Kick off game on load
initGame();