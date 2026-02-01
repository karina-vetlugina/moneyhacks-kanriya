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
  currentSlideId: "game_intro",
  scenePhase: 0, // 0 = dialogue, 1 = fact, 2 = choices
  accountBalance: 5550,
  totalSaved: 0,
  totalSpent: 0,
  carGoalAmount: 15000,
  carGoalUnlocked: false,
  carGoalActive: false,
  hasSeenCarBrowsingScene: false,
  creditScore: 680,
  creditVisible: false,
  completedEpisodes: [], // Track completed episode numbers
  unlockedFacts: [], // Facts unlocked during gameplay (shown in info panel)
  currentPaycheckAmount: 500,
};

const OPENING_SLIDE_IDS = ["game_intro", "birthday_cake_lit", "eyes_closed", "birthday_wish_choices", "goal_unlocked", "cake_out", "time_transition"];

/* Dialogue typing animation */
const TYPING_MS_PER_CHAR = 35;
let typingIntervalId = null;
let currentDialogueFullText = "";

/* --------------------------------------------------
   Achievements system - facts as unlockable rewards
   -------------------------------------------------- */
const ACHIEVEMENTS = [
  {
    id: "paying_yourself_first",
    title: "Tip: Pay yourself first",
    description: "Paying yourself first makes saving easier. Teens with minimal expenses may be able to save 50-70% of their income.",
    unlocked: false,
    episodeUnlock: 0,
  },
  {
    id: "time_in_the_market",
    title: "Tip: Time in the market matters",
    description: "Investing is a time game. Starting earlier allows compound growth to work in your favor and can significantly increase long-term savings. Keep in mind that taking money out of a TFSA is not typically recommended, so you should keep some in a savings account for any planned purchases.",
    unlocked: false,
    episodeUnlock: 0,
  },
  {
    id: "car_costs",
    title: "Tip: Cars cost more than the sticker price",
    description: "Cars come with ongoing costs beyond the purchase price. Insurance, fuel, maintenance, and repairs add up over time and should be planned for.",
    unlocked: false,
    episodeUnlock: 0,
  },
  {
    id: "building_credit",
    title: "Tip: Building credit",
    description: "Credit cards help build your credit history when used responsibly. Paying your balance on time improves your credit score over time.",
    unlocked: false,
    episodeUnlock: 0,
  },
  {
    id: "paychecks_gross_pay",
    title: "Tip: Paychecks aren't gross pay",
    description: "In Ontario, about 10–20% of a typical part-time paycheck may be deducted for taxes and government contributions.",
    unlocked: false,
    episodeUnlock: 0,
  },
  {
    id: "payment_plans_add_up",
    title: "Tip: Payment plans add up",
    description: "Payment plans lower the upfront cost, but interest often means you pay more than the original price over time.",
    unlocked: false,
    episodeUnlock: 0,
  },
];

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
  factTitle: null,
  factContent: null,
  factNextBtn: null,
  factExitBtn: null,
  // Metrics bar
  metricsBar: null,
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
  // Achievements system
  infoIcon: null,
  achievementsPanel: null,
  achievementsList: null,
  achievementsPanelClose: null,
  notificationContainer: null,
  // Goal unlocked popup (one-time overlay)
  goalPopup: null,
  goalPopupTitle: null,
  goalPopupText: null,
  goalPopupBtn: null,
  // Credit education popup
  creditEducationPopup: null,
  creditEducationText: null,
  creditEducationExit: null,
  // Investment options popup (not stored in tips)
  investmentOptionsPopup: null,
  investmentOptionsText: null,
  investmentOptionsExit: null,
  // Wallet view
  walletIcon: null,
  walletView: null,
  walletBackBtn: null,
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
  DOM.factTitle = document.getElementById("fact-title");
  DOM.factContent = document.getElementById("fact-content");
  DOM.factNextBtn = document.getElementById("fact-next-btn");
  DOM.factExitBtn = document.getElementById("fact-exit-btn");

  DOM.metricsBar = document.getElementById("metrics-bar");
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

  DOM.infoIcon = document.getElementById("info-icon");
  DOM.achievementsPanel = document.getElementById("achievements-panel");
  DOM.achievementsList = document.getElementById("achievements-list");
  DOM.achievementsPanelClose = document.getElementById("achievements-panel-close");
  DOM.notificationContainer = document.getElementById("notification-container");

  DOM.goalPopup = document.getElementById("goal-unlocked-popup");
  DOM.goalPopupTitle = document.getElementById("goal-popup-title");
  DOM.goalPopupText = document.getElementById("goal-popup-text");
  DOM.goalPopupBtn = document.getElementById("goal-popup-btn");
  DOM.creditEducationPopup = document.getElementById("credit-education-popup");
  DOM.creditEducationText = document.getElementById("credit-education-text");
  DOM.creditEducationExit = document.getElementById("credit-education-exit");
  DOM.investmentOptionsPopup = document.getElementById("investment-options-popup");
  DOM.investmentOptionsText = document.getElementById("investment-options-text");
  DOM.investmentOptionsExit = document.getElementById("investment-options-exit");
  DOM.walletIcon = document.getElementById("wallet-icon");
  DOM.walletView = document.getElementById("wallet-view");
  DOM.walletBackBtn = document.getElementById("wallet-back-btn");

  if (!SLIDES) {
    console.error("SLIDES data not loaded. Ensure data/slides.js is loaded first.");
    if (DOM.dialogueText) {
      if (typingIntervalId) clearInterval(typingIntervalId);
      typingIntervalId = null;
      DOM.dialogueText.textContent = "Error: Slide data not found.";
    }
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
  if (DOM.factNextBtn) {
    DOM.factNextBtn.addEventListener("click", nextPhase);
  }
  if (DOM.factExitBtn) {
    DOM.factExitBtn.addEventListener("click", nextPhase);
  }
  if (DOM.infoIcon) {
    DOM.infoIcon.addEventListener("click", openAchievementsPanel);
  }
  if (DOM.walletIcon) {
    DOM.walletIcon.addEventListener("click", openWalletView);
  }
  if (DOM.walletBackBtn) {
    DOM.walletBackBtn.addEventListener("click", closeWalletView);
  }
  if (DOM.achievementsPanelClose) {
    DOM.achievementsPanelClose.addEventListener("click", closeAchievementsPanel);
  }
  if (DOM.achievementsPanel) {
    DOM.achievementsPanel.addEventListener("click", (e) => {
      if (e.target === DOM.achievementsPanel) closeAchievementsPanel();
    });
  }
  if (DOM.creditEducationExit) {
    DOM.creditEducationExit.addEventListener("click", closeCreditEducationPopup);
  }
  if (DOM.investmentOptionsExit) {
    DOM.investmentOptionsExit.addEventListener("click", closeInvestmentOptionsPopup);
  }
  if (DOM.goalPopupBtn) {
    DOM.goalPopupBtn.addEventListener("click", closeGoalPopup);
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
  flashBalanceChange("add");
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
  if (actual > 0) flashBalanceChange("deduct");
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
  flashBalanceChange("deduct");
}

/**
 * Spend from savings (e.g. car purchase). Decreases totalSaved, updates car goal UI.
 * @param {number} amount
 */
function spendFromSavings(amount) {
  if (typeof amount !== "number" || amount < 0) return;
  const actual = Math.min(amount, gameState.totalSaved);
  if (actual <= 0) return;
  gameState.totalSaved = Math.max(0, gameState.totalSaved - amount);
  recalculateCreditScore();
  updateMetricsBar();
  if (DOM.carGoalLabel) {
    DOM.carGoalLabel.classList.remove("balance-flash-add", "balance-flash-deduct");
    DOM.carGoalLabel.offsetHeight;
    DOM.carGoalLabel.classList.add("balance-flash-deduct");
    setTimeout(() => DOM.carGoalLabel.classList.remove("balance-flash-deduct"), 2000);
  }
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
   Wallet view (read-only, non-destructive)
   -------------------------------------------------- */
function openWalletView() {
  if (!DOM.walletView) return;
  // Show different bank account image based on credit card activation
  const walletBg = DOM.walletView.querySelector(".wallet-view-bg");
  if (walletBg) {
    const imgPath = gameState.creditVisible
      ? "/assets/slides/bank-account-new-cropped.png"
      : "/assets/slides/bank-account-old-cropped.png";
    walletBg.style.backgroundImage = `url("${imgPath}")`;
  }
  DOM.walletView.classList.add("wallet-view-open");
  DOM.walletView.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeWalletView() {
  if (!DOM.walletView) return;
  DOM.walletView.classList.remove("wallet-view-open");
  DOM.walletView.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* --------------------------------------------------
   Metrics bar (live updates)
   -------------------------------------------------- */

/** Flash balance green (added) or red (deducted) for 2 seconds */
function flashBalanceChange(direction) {
  if (!DOM.balanceDisplay) return;
  DOM.balanceDisplay.classList.remove("balance-flash-add", "balance-flash-deduct");
  DOM.balanceDisplay.offsetHeight; /* force reflow */
  DOM.balanceDisplay.classList.add(direction === "add" ? "balance-flash-add" : "balance-flash-deduct");
  setTimeout(() => {
    DOM.balanceDisplay.classList.remove("balance-flash-add", "balance-flash-deduct");
  }, 2000);
}

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
   Achievements system - unlock and notification logic
   -------------------------------------------------- */

/**
 * Unlock a fact/achievement by ID (adds to info panel, persists).
 * @param {string} achievementId
 */
function unlockFactById(achievementId) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return;
  if (achievement.unlocked) return;

  achievement.unlocked = true;
  if (!gameState.unlockedFacts.includes(achievementId)) {
    gameState.unlockedFacts.push(achievementId);
  }
}

/**
 * Show fun fact notification at top (title only), unlock full description in info panel.
 * Same visual style as achievement notifications.
 * @param {string} title - displayed in notification banner
 * @param {string} achievementId - achievement to unlock (full description in info panel)
 */
function showFunFactNotification(title, achievementId) {
  unlockFactById(achievementId);
  if (!DOM.notificationContainer) return;

  const notification = document.createElement("div");
  notification.className = "achievement-notification";
  notification.textContent = `Tip: ${title}`;

  DOM.notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("notification-visible");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("notification-visible");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Complete an episode and unlock all associated achievements.
 * @param {number} episodeNumber - Episode to complete
 */
function completeEpisode(episodeNumber) {
  if (gameState.completedEpisodes.includes(episodeNumber)) {
    console.log(`Episode ${episodeNumber} already completed`);
    return;
  }

  gameState.completedEpisodes.push(episodeNumber);
  console.log(`Episode ${episodeNumber} completed`);

  const newlyUnlocked = [];
  ACHIEVEMENTS.forEach((achievement) => {
    if (achievement.episodeUnlock === episodeNumber && !achievement.unlocked) {
      achievement.unlocked = true;
      newlyUnlocked.push(achievement);
    }
  });

  newlyUnlocked.forEach((achievement, index) => {
    setTimeout(() => {
      showAchievementNotification(achievement);
    }, index * 500);
  });
}

/**
 * Show a non-blocking notification for a newly unlocked achievement.
 * Auto-dismisses after 3 seconds.
 * @param {object} achievement
 */
function showAchievementNotification(achievement) {
  if (!DOM.notificationContainer) return;

  const notification = document.createElement("div");
  notification.className = "achievement-notification";
  notification.textContent = `Tip: ${achievement.title}`;

  DOM.notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("notification-visible");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("notification-visible");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Open achievements panel showing all unlocked and locked achievements.
 */
function openAchievementsPanel() {
  if (!DOM.achievementsPanel || !DOM.achievementsList) return;

  DOM.achievementsList.innerHTML = "";

  ACHIEVEMENTS.forEach((achievement) => {
    const item = document.createElement("div");
    item.className = achievement.unlocked
      ? "achievement-item achievement-unlocked"
      : "achievement-item achievement-locked";

    const title = document.createElement("h3");
    title.className = "achievement-title";
    title.textContent = achievement.title;

    const description = document.createElement("p");
    description.className = "achievement-description";
    description.textContent = achievement.unlocked
      ? achievement.description
      : "Locked";

    item.appendChild(title);
    item.appendChild(description);
    DOM.achievementsList.appendChild(item);
  });

  DOM.achievementsPanel.classList.add("modal-open");
  DOM.achievementsPanel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

/**
 * Close achievements panel.
 */
function closeAchievementsPanel() {
  if (DOM.achievementsPanel) {
    DOM.achievementsPanel.classList.remove("modal-open");
    DOM.achievementsPanel.setAttribute("aria-hidden", "true");
  }
  document.body.style.overflow = "";
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

/** Pending goal popup close action */
let _goalPopupNextSlideId = null;

/**
 * Show goal unlocked popup (one-time overlay, not saved to tips/history).
 * @param {string} title
 * @param {string} text
 * @param {string} nextSlideId - where to go when OK/Continue is clicked
 */
function showGoalUnlockedPopup(title, text, nextSlideId) {
  if (!DOM.goalPopup || !DOM.goalPopupTitle || !DOM.goalPopupText) return;

  _goalPopupNextSlideId = nextSlideId;
  DOM.goalPopupTitle.textContent = title;
  DOM.goalPopupText.textContent = text;

  DOM.goalPopup.classList.add("goal-popup-visible");
  DOM.goalPopup.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (DOM.dialogueArea) DOM.dialogueArea.classList.add("phase-hidden");
  if (DOM.choicesContainer) DOM.choicesContainer.classList.add("phase-hidden");
  if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
}

function closeGoalPopup() {
  if (!DOM.goalPopup) return;

  DOM.goalPopup.classList.remove("goal-popup-visible");
  DOM.goalPopup.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (DOM.dialogueArea) DOM.dialogueArea.classList.remove("phase-hidden");

  if (_goalPopupNextSlideId) {
    renderSlide(_goalPopupNextSlideId);
    _goalPopupNextSlideId = null;
  }
}

/** Pending credit education popup close action */
let _creditEducationNextSlideId = null;

/**
 * Show credit education popup (modal overlay). Unlocks tip in info panel.
 * @param {string} nextSlideId - where to go when Exit is clicked
 */
function showCreditEducationPopup(nextSlideId) {
  if (!DOM.creditEducationPopup || !DOM.creditEducationText) return;

  unlockFactById("building_credit");
  _creditEducationNextSlideId = nextSlideId;

  DOM.creditEducationText.textContent = "Using credit and paying it on time helps build your credit score.";
  DOM.creditEducationPopup.classList.add("credit-education-visible");
  DOM.creditEducationPopup.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (DOM.dialogueArea) DOM.dialogueArea.classList.add("phase-hidden");
  if (DOM.choicesContainer) DOM.choicesContainer.classList.add("phase-hidden");
  if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
}

function closeCreditEducationPopup() {
  if (!DOM.creditEducationPopup) return;

  DOM.creditEducationPopup.classList.remove("credit-education-visible");
  DOM.creditEducationPopup.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (DOM.dialogueArea) DOM.dialogueArea.classList.remove("phase-hidden");

  if (_creditEducationNextSlideId) {
    renderSlide(_creditEducationNextSlideId);
    _creditEducationNextSlideId = null;
  }
}

/** Pending investment options popup close action */
let _investmentOptionsNextSlideId = null;

/**
 * Show investment options popup (modal overlay). Does NOT store in tips.
 * @param {string} text - popup content
 * @param {string} nextSlideId - where to go when Exit is clicked
 */
function showInvestmentOptionsPopup(text, nextSlideId) {
  if (!DOM.investmentOptionsPopup || !DOM.investmentOptionsText) return;

  _investmentOptionsNextSlideId = nextSlideId;
  DOM.investmentOptionsText.textContent = text;

  DOM.investmentOptionsPopup.classList.add("credit-education-visible");
  DOM.investmentOptionsPopup.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (DOM.dialogueArea) DOM.dialogueArea.classList.add("phase-hidden");
  if (DOM.choicesContainer) DOM.choicesContainer.classList.add("phase-hidden");
  if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
}

function closeInvestmentOptionsPopup() {
  if (!DOM.investmentOptionsPopup) return;

  DOM.investmentOptionsPopup.classList.remove("credit-education-visible");
  DOM.investmentOptionsPopup.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (DOM.dialogueArea) DOM.dialogueArea.classList.remove("phase-hidden");

  if (_investmentOptionsNextSlideId) {
    renderSlide(_investmentOptionsNextSlideId);
    _investmentOptionsNextSlideId = null;
  }
}

/**
 * Type dialogue character by character. Click Next to skip to full text.
 * Used only for main dialogue box, not for tips or popups.
 * @param {string} fullText - Full dialogue string to type out
 */
function typeDialogue(fullText) {
  if (!DOM.dialogueText) return;
  if (typingIntervalId) {
    clearInterval(typingIntervalId);
    typingIntervalId = null;
  }
  currentDialogueFullText = fullText;
  DOM.dialogueText.textContent = "";
  if (fullText === "") return;
  let index = 0;
  typingIntervalId = setInterval(() => {
    index += 1;
    if (index >= fullText.length) {
      clearInterval(typingIntervalId);
      typingIntervalId = null;
      DOM.dialogueText.textContent = fullText;
      return;
    }
    DOM.dialogueText.textContent = fullText.slice(0, index);
  }, TYPING_MS_PER_CHAR);
}

/**
 * Advance to next phase safely. Phase 0 → 1 (if factText), 2 (choices), or nextSlideId.
 * First click during typing skips to full dialogue; second click advances.
 */
function nextPhase() {
  if (typingIntervalId) {
    clearInterval(typingIntervalId);
    typingIntervalId = null;
    if (DOM.dialogueText) DOM.dialogueText.textContent = currentDialogueFullText;
    return;
  }
  const slide = SLIDES[gameState.currentSlideId];
  if (!slide) return;

  if (gameState.scenePhase === 0) {
    if (slide.factText && slide.factText.trim()) {
      gameState.scenePhase = 1;
      renderFactPhase();
    } else if (slide.nextSlideId && (!slide.choices || slide.choices.length === 0)) {
      renderSlide(slide.nextSlideId);
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
  if (DOM.dialogueArea) DOM.dialogueArea.classList.remove("phase-hidden");
  if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.remove("phase-hidden");
  if (DOM.choicesContainer) DOM.choicesContainer.classList.add("phase-hidden");
  if (DOM.factOverlay) DOM.factOverlay.classList.remove("fact-visible");
  if (DOM.dialogueArea) DOM.dialogueArea.classList.remove("overlay-dimmed");
}

/**
 * Phase 1 — Fact overlay: show fact card with title, text, Next and Exit; dialogue dimmed.
 */
function renderFactPhase() {
  const slide = SLIDES[gameState.currentSlideId];
  if (!slide || !DOM.factOverlay) return;

  if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
  if (DOM.choicesContainer) DOM.choicesContainer.classList.add("phase-hidden");
  if (DOM.factTitle) {
    DOM.factTitle.textContent = slide.factTitle || "";
    DOM.factTitle.style.display = slide.factTitle ? "" : "none";
  }
  if (DOM.factContent) DOM.factContent.textContent = slide.factText || "";
  if (DOM.factNextBtn) DOM.factNextBtn.style.display = slide.factTitle ? "" : "none";
  DOM.factOverlay.classList.add("fact-visible");
  if (DOM.dialogueArea) DOM.dialogueArea.classList.add("overlay-dimmed");
}

/**
 * Phase 2 — Choices: hide fact overlay and Next; show choice buttons.
 */
function renderChoicesPhase() {
  const slide = SLIDES[gameState.currentSlideId];
  if (!slide) return;

  if (DOM.choicesContainer) DOM.choicesContainer.classList.remove("intro-start");
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
    if (DOM.dialogueText) {
      if (typingIntervalId) clearInterval(typingIntervalId);
      typingIntervalId = null;
      DOM.dialogueText.textContent = `Error: Slide "${slideId}" not found.`;
    }
    renderChoices([]);
    return;
  }

  gameState.currentSlideId = slideId;
  gameState.scenePhase = 0;

  if (typeof slide.onEnter === "function") {
    slide.onEnter(gameState);
    updateMetricsBar();
  }

  // Update background (solid black or image)
  if (DOM.backgroundContainer) {
    const bg = slide.background || "";
    const isBlack = bg === "black";
    const isImagePath = !isBlack && bg && (bg.endsWith(".png") || bg.endsWith(".jpg") || bg.endsWith(".webp"));

    DOM.backgroundContainer.style.background = isBlack ? "#000" : "#2a2a2a";
    DOM.backgroundContainer.setAttribute("data-background", bg);
    DOM.backgroundContainer.classList.toggle("bg-black", isBlack);

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
    typeDialogue(slide.text || "");
  }

  if (slide.id === "goal_unlocked") {
    if (DOM.dialogueArea) DOM.dialogueArea.classList.add("phase-hidden");
    if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
  } else if (slide.id === "credit_education_popup") {
    if (DOM.dialogueArea) DOM.dialogueArea.classList.add("phase-hidden");
    if (DOM.choicesContainer) DOM.choicesContainer.classList.add("phase-hidden");
    if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
    showCreditEducationPopup(slide.nextSlideId || "check-bank");
  } else if (slide.id === "investment_options") {
    if (DOM.dialogueArea) DOM.dialogueArea.classList.add("phase-hidden");
    if (DOM.choicesContainer) DOM.choicesContainer.classList.add("phase-hidden");
    if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
    showInvestmentOptionsPopup(slide.text, slide.nextSlideId || "time_jump_month2");
  } else if (slide.id === "game_intro") {
    if (DOM.dialogueArea) DOM.dialogueArea.classList.add("phase-hidden");
    if (DOM.nextPhaseBtn) DOM.nextPhaseBtn.classList.add("phase-hidden");
    if (DOM.choicesContainer) {
      DOM.choicesContainer.classList.remove("phase-hidden");
      DOM.choicesContainer.classList.add("intro-start");
    }
    renderChoices(slide.choices || []);
  } else {
    if (DOM.choicesContainer) DOM.choicesContainer.classList.remove("intro-start");
    renderDialoguePhase();
  }

  updateMetricsBarVisibility();
}

function updateMetricsBarVisibility() {
  const isOpening = OPENING_SLIDE_IDS.includes(gameState.currentSlideId);
  if (DOM.metricsBar) DOM.metricsBar.classList.toggle("intro-hidden", isOpening);
  if (DOM.infoIcon) DOM.infoIcon.classList.toggle("intro-hidden", isOpening);
  if (DOM.walletIcon) DOM.walletIcon.classList.toggle("intro-hidden", isOpening);
}

/**
 * Render choice buttons. Supports locked choices.
 * @param {Array<{label: string, nextSlideId?: string, locked?: boolean, difficulty?: string, effect?: object}>} choices
 */
function renderChoices(choices) {
  if (!DOM.choicesContainer) return;

  DOM.choicesContainer.innerHTML = "";

  choices.forEach((choice) => {
    const wrapper = document.createElement("div");
    wrapper.className = "choice-wrapper";

    const btn = document.createElement("button");
    btn.className = choice.locked ? "choice-btn choice-btn--locked" : "choice-btn";
    btn.type = "button";
    btn.disabled = !!choice.locked;

    const labelSpan = document.createElement("span");
    labelSpan.className = "choice-label";
    labelSpan.textContent = choice.label;
    btn.appendChild(labelSpan);

    if (choice.subtitle) {
      const subSpan = document.createElement("span");
      subSpan.className = "choice-subtitle";
      subSpan.textContent = choice.subtitle;
      btn.appendChild(subSpan);
    }

    if (!choice.locked && choice.nextSlideId) {
      btn.addEventListener("click", () => handleChoiceClick(choice));
    }

    wrapper.appendChild(btn);
    DOM.choicesContainer.appendChild(wrapper);
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
      case "spendFromSavings":
        spendFromSavings(effect.amount);
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
