/**
 * game.js - State-driven POV interactive simulator
 *
 * Handles:
 *   - Centralized gameState
 *   - Slide rendering with onEnter hooks
 *   - Financial logic (addIncome, spendMoney, transferToSavings)
 *   - Top metrics bar (balance, car goal, credit)
 *   - Credit score simulation and modal
 */

/* --------------------------------------------------
   Centralized game state
   -------------------------------------------------- */
const gameState = {
  currentSlideId: "intro",
  scenePhase: 0, // 0 = dialogue, 1 = fact, 2 = choices
  accountBalance: 2000,
  totalSaved: 0,
  totalSpent: 0,
  carGoalAmount: 15000,
  hasSeenCarBrowsingScene: false,
  creditScore: 680,
  creditVisible: false,
};

/* --------------------------------------------------
   DOM references (cached for performance)
   -------------------------------------------------- */
const DOM = {
  backgroundContainer: null,
  dialogueText: null,
  dialogueArea: null,
  choicesContainer: null,
  nextPhaseBtn: null,
  // Fact overlay
  factOverlay: null,
  factContent: null,
  factExitBtn: null,
  // Metrics bar
  balanceDisplay: null,
  carGoalProgressBar: null,
  carGoalLabel: null,
  creditSection: null,
  creditDisplay: null,
  // Credit modal
  creditModal: null,
  creditModalScore: null,
  creditModalRating: null,
  creditModalBullets: null,
  creditModalClose: null,
};

/**
 * Initialize DOM references and start the game
 */
function init() {
  DOM.backgroundContainer = document.getElementById("background-container");
  DOM.dialogueText = document.getElementById("dialogue-text");
  DOM.dialogueArea = document.getElementById("dialogue-area");
  DOM.choicesContainer = document.getElementById("choices-container");
  DOM.nextPhaseBtn = document.getElementById("next-phase-btn");

  DOM.factOverlay = document.getElementById("fact-overlay");
  DOM.factContent = document.getElementById("fact-content");
  DOM.factExitBtn = document.getElementById("fact-exit-btn");

  DOM.balanceDisplay = document.getElementById("balance-display");
  DOM.carGoalProgressBar = document.getElementById("car-goal-progress-bar");
  DOM.carGoalLabel = document.getElementById("car-goal-label");
  DOM.creditSection = document.getElementById("credit-section");
  DOM.creditDisplay = document.getElementById("credit-display");

  DOM.creditModal = document.getElementById("credit-modal");
  DOM.creditModalScore = document.getElementById("credit-modal-score");
  DOM.creditModalRating = document.getElementById("credit-modal-rating");
  DOM.creditModalBullets = document.getElementById("credit-modal-bullets");
  DOM.creditModalClose = document.getElementById("credit-modal-close");

  if (!SLIDES) {
    console.error("SLIDES data not loaded. Ensure data/slides.js is loaded first.");
    if (DOM.dialogueText) DOM.dialogueText.textContent = "Error: Slide data not found.";
    return;
  }

  updateMetricsBar();
  renderSlide(gameState.currentSlideId);

  if (DOM.creditSection) {
    DOM.creditSection.addEventListener("click", openCreditModal);
  }
  if (DOM.creditModalClose) {
    DOM.creditModalClose.addEventListener("click", closeCreditModal);
  }
  if (DOM.creditModal) {
    DOM.creditModal.addEventListener("click", (e) => {
      if (e.target === DOM.creditModal) closeCreditModal();
    });
  }
  if (DOM.nextPhaseBtn) {
    DOM.nextPhaseBtn.addEventListener("click", nextPhase);
  }
  if (DOM.factExitBtn) {
    DOM.factExitBtn.addEventListener("click", nextPhase);
  }
}

/* --------------------------------------------------
   Financial logic (all state changes go through these)
   -------------------------------------------------- */

/**
 * Add income to account. Updates balance and UI.
 * @param {number} amount
 */
function addIncome(amount) {
  if (typeof amount !== "number" || amount < 0) return;
  gameState.accountBalance += amount;
  recalculateCreditScore();
  updateMetricsBar();
}

/**
 * Spend money. Decreases balance (clamped at 0), increases totalSpent. Updates UI.
 * @param {number} amount
 */
function spendMoney(amount) {
  if (typeof amount !== "number" || amount < 0) return;
  const actual = Math.min(amount, gameState.accountBalance);
  gameState.accountBalance = Math.max(0, gameState.accountBalance - amount);
  gameState.totalSpent += amount;
  recalculateCreditScore();
  updateMetricsBar();
}

/**
 * Move money from balance into savings (car goal) if enough funds exist.
 * @param {number} amount
 */
function transferToSavings(amount) {
  if (typeof amount !== "number" || amount < 0) return;
  const actual = Math.min(amount, gameState.accountBalance);
  if (actual <= 0) return;
  gameState.accountBalance -= actual;
  gameState.totalSaved += actual;
  recalculateCreditScore();
  updateMetricsBar();
}

/**
 * Recalculate credit score from state. Clamp 300–850.
 */
function recalculateCreditScore() {
  let score = 680;

  if (gameState.totalSpent > gameState.totalSaved) score -= 20;
  if (gameState.accountBalance > 3000) score += 15;
  const progress = gameState.carGoalAmount > 0
    ? gameState.totalSaved / gameState.carGoalAmount
    : 0;
  if (progress > 0.5) score += 25;

  gameState.creditScore = Math.max(300, Math.min(850, score));
}

/**
 * Get credit rating label from score
 * @param {number} score
 * @returns {string}
 */
function getCreditRating(score) {
  if (score >= 800) return "Excellent";
  if (score >= 740) return "Very Good";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  return "Poor";
}

/**
 * Build 2–3 bullet explanations for credit modal based on current state
 * @returns {string[]}
 */
function getCreditExplanations() {
  const bullets = [];
  if (gameState.totalSpent > gameState.totalSaved) {
    bullets.push("Spending has exceeded savings, which can hurt your score.");
  }
  if (gameState.accountBalance > 3000) {
    bullets.push("Keeping a healthy buffer in your account helps your score.");
  }
  const progress = gameState.carGoalAmount > 0
    ? (gameState.totalSaved / gameState.carGoalAmount) * 100
    : 0;
  if (progress > 50) {
    bullets.push("Strong progress toward your savings goal improves your score.");
  }
  if (bullets.length === 0) {
    bullets.push("Keep saving and managing spending to maintain or improve your score.");
  }
  return bullets.slice(0, 3);
}

/* --------------------------------------------------
   Metrics bar (live updates)
   -------------------------------------------------- */
function updateMetricsBar() {
  if (DOM.balanceDisplay) {
    DOM.balanceDisplay.textContent = `$${gameState.accountBalance.toLocaleString()}`;
  }

  const progress = gameState.carGoalAmount > 0
    ? Math.min(1, gameState.totalSaved / gameState.carGoalAmount)
    : 0;
  const percent = Math.round(progress * 100);
  if (DOM.carGoalProgressBar) {
    DOM.carGoalProgressBar.style.width = `${percent}%`;
    DOM.carGoalProgressBar.setAttribute("aria-valuenow", percent);
  }
  if (DOM.carGoalLabel) {
    DOM.carGoalLabel.textContent = `$${gameState.totalSaved.toLocaleString()} / $15,000`;
  }

  if (DOM.creditSection) {
    DOM.creditSection.classList.toggle("metrics-hidden", !gameState.creditVisible);
    DOM.creditSection.setAttribute("aria-hidden", String(!gameState.creditVisible));
  }
  if (DOM.creditDisplay) {
    DOM.creditDisplay.textContent = gameState.creditScore;
  }
}

/* --------------------------------------------------
   Credit modal
   -------------------------------------------------- */
function openCreditModal() {
  if (!gameState.creditVisible || !DOM.creditModal) return;
  if (DOM.creditModalScore) DOM.creditModalScore.textContent = gameState.creditScore;
  if (DOM.creditModalRating) DOM.creditModalRating.textContent = getCreditRating(gameState.creditScore);
  if (DOM.creditModalBullets) {
    DOM.creditModalBullets.innerHTML = getCreditExplanations()
      .map((text) => `<li>${text}</li>`)
      .join("");
  }
  DOM.creditModal.classList.add("modal-open");
  DOM.creditModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCreditModal() {
  if (DOM.creditModal) {
    DOM.creditModal.classList.remove("modal-open");
    DOM.creditModal.setAttribute("aria-hidden", "true");
  }
  document.body.style.overflow = "";
}

/* --------------------------------------------------
   Slide rendering — 3-phase scene flow
   -------------------------------------------------- */

/**
 * Advance to next phase safely. Phase 0 → 1 (if factText) or 2; Phase 1 → 2.
 */
function nextPhase() {
  const slide = SLIDES[gameState.currentSlideId];
  if (!slide) return;

  if (gameState.scenePhase === 0) {
    if (slide.factText && slide.factText.trim()) {
      gameState.scenePhase = 1;
      renderFactPhase();
    } else {
      gameState.scenePhase = 2;
      renderChoicesPhase();
    }
    return;
  }
  if (gameState.scenePhase === 1) {
    gameState.scenePhase = 2;
    renderChoicesPhase();
  }
}

/**
 * Phase 0 — Dialogue: show slide.text, Next button; hide fact overlay and choices.
 */
function renderDialoguePhase() {
  if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.remove("phase-hidden");
  if (DOM.choicesContainer) DOM.choicesContainer.classList.add("phase-hidden");
  if (DOM.factOverlay) DOM.factOverlay.classList.remove("fact-visible");
  if (DOM.dialogueArea) DOM.dialogueArea.classList.remove("overlay-dimmed");
}

/**
 * Phase 1 — Fact overlay: show fact card with slide.factText, Next and Exit; dialogue dimmed.
 */
function renderFactPhase() {
  const slide = SLIDES[gameState.currentSlideId];
  if (!slide || !DOM.factOverlay) return;

  if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
  if (DOM.choicesContainer) DOM.choicesContainer.classList.add("phase-hidden");
  if (DOM.factContent) DOM.factContent.textContent = slide.factText || "";
  DOM.factOverlay.classList.add("fact-visible");
  if (DOM.dialogueArea) DOM.dialogueArea.classList.add("overlay-dimmed");
}

/**
 * Phase 2 — Choices: hide fact overlay and Next; show choice buttons.
 */
function renderChoicesPhase() {
  const slide = SLIDES[gameState.currentSlideId];
  if (!slide) return;

  if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
  if (DOM.factOverlay) DOM.factOverlay.classList.remove("fact-visible");
  if (DOM.dialogueArea) DOM.dialogueArea.classList.remove("overlay-dimmed");
  if (DOM.choicesContainer) DOM.choicesContainer.classList.remove("phase-hidden");
  renderChoices(slide.choices || []);
}

/**
 * Render a slide by ID. Resets scenePhase to 0, runs onEnter, then renders phase 0 (dialogue).
 * @param {string} slideId - ID of the slide in SLIDES
 */
function renderSlide(slideId) {
  const slide = SLIDES[slideId];

  if (!slide) {
    console.error(`Slide not found: ${slideId}`);
    if (DOM.dialogueText) DOM.dialogueText.textContent = `Error: Slide "${slideId}" not found.`;
    renderChoices([]);
    return;
  }

  gameState.currentSlideId = slideId;
  gameState.scenePhase = 0;

  if (typeof slide.onEnter === "function") {
    slide.onEnter(gameState);
    updateMetricsBar();
  }

  // Update background
  if (DOM.backgroundContainer) {
    const bg = slide.background || "";
    const isImagePath = bg && (bg.endsWith(".png") || bg.endsWith(".jpg") || bg.endsWith(".webp"));

    DOM.backgroundContainer.style.background = "#2a2a2a";
    DOM.backgroundContainer.setAttribute("data-background", bg);

    let img = DOM.backgroundContainer.querySelector(".slide-bg-img");
    if (isImagePath) {
      if (!img) {
        img = document.createElement("img");
        img.className = "slide-bg-img";
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        DOM.backgroundContainer.appendChild(img);
      }
      img.src = bg.startsWith("/") ? bg : "/" + bg.replace(/^\//, "");
      img.style.display = "";
    } else if (img) {
      img.style.display = "none";
    }
  }

  if (DOM.dialogueText) {
    DOM.dialogueText.textContent = slide.text;
  }

  renderDialoguePhase();
}

/**
 * Render choice buttons. Applies choice.effect via financial functions when present.
 * @param {Array<{label: string, nextSlideId: string, effect?: {type: string, amount: number}}>} choices
 */
function renderChoices(choices) {
  if (!DOM.choicesContainer) return;

  DOM.choicesContainer.innerHTML = "";

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.label;
    btn.dataset.nextSlideId = choice.nextSlideId;

    btn.addEventListener("click", () => {
      handleChoiceClick(choice);
    });

    DOM.choicesContainer.appendChild(btn);
  });
}

/**
 * Handle choice: apply effect (via financial functions only), then navigate.
 * @param {{label: string, nextSlideId: string, effect?: {type: string, amount: number}}} choice
 */
function handleChoiceClick(choice) {
  const effect = choice.effect;
  if (effect && typeof effect.amount === "number" && effect.amount >= 0) {
    switch (effect.type) {
      case "addIncome":
        addIncome(effect.amount);
        break;
      case "spendMoney":
        spendMoney(effect.amount);
        break;
      case "transferToSavings":
        transferToSavings(effect.amount);
        break;
      default:
        break;
    }
  }

  gameState.currentSlideId = choice.nextSlideId;
  renderSlide(choice.nextSlideId);
}

/* --------------------------------------------------
   Start game when DOM is ready
   -------------------------------------------------- */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
