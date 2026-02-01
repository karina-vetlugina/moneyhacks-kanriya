/**
 * slides.js - Slide data for POV interactive app
 *
 * Each slide supports: text, choices, nextSlideId (for dialogue-only slides).
 * Slides may include:
 *   - onEnter(gameState) — run when the slide is shown
 *   - choices[].effect — { type: "addIncome"|"spendMoney"|"transferToSavings", amount }
 *   - choices[].locked — if true, choice is disabled and not clickable
 */

const SLIDES = {
  // --------------------------------------------------
  // Opening sequence
  // --------------------------------------------------
  birthday_cake_lit: {
    id: "birthday_cake_lit",
    text: "It's your birthday.\n\nYou're finally 18.",
    background: "/assets/slides/cake_lit.png",
    nextSlideId: "eyes_closed",
    choices: [],
  },

  eyes_closed: {
    id: "eyes_closed",
    text: "You close your eyes.\n\nWhat's your birthday wish?",
    background: "black",
    nextSlideId: "birthday_wish_choices",
    choices: [],
  },

  birthday_wish_choices: {
    id: "birthday_wish_choices",
    text: "You only get one wish.\n\nWhat do you choose?",
    background: "black",
    choices: [
      { label: "A laptop", subtitle: "easy", locked: true },
      { label: "A car", subtitle: "moderate", nextSlideId: "goal_unlocked" },
      { label: "An apartment", subtitle: "hard", locked: true },
    ],
  },

  goal_unlocked: {
    id: "goal_unlocked",
    text: "",
    background: "black",
    nextSlideId: "cake_out",
    choices: [],
    onEnter: function (gameState) {
      gameState.carGoalUnlocked = true;
      gameState.carGoalActive = true;
      showGoalUnlockedPopup("Goal unlocked", "Buy your first car before starting university", "cake_out");
    },
  },

  cake_out: {
    id: "cake_out",
    text: "The candles are out.\n\nFrom now on, every decision matters.\n\nYou'll start saving money for your first car.",
    background: "/assets/slides/cake_out.png",
    nextSlideId: "time_transition",
    choices: [],
  },

  time_transition: {
    id: "time_transition",
    text: "The next day…",
    background: "black",
    nextSlideId: "phone_unlock",
    choices: [],
  },

  phone_unlock: {
    id: "phone_unlock",
    text: "You unlock your phone.",
    background: "/assets/slides/phone_paycheck.png",
    nextSlideId: "paycheck_received",
    choices: [],
  },

  paycheck_received: {
    id: "paycheck_received",
    text: "Paycheck received: $500.",
    background: "/assets/slides/phone_paycheck.png",
    nextSlideId: "fun_fact_notification",
    choices: [],
    onEnter: function (gameState) {
      addIncome(500);
    },
  },

  fun_fact_notification: {
    id: "fun_fact_notification",
    text: "You open your banking app.",
    background: "/assets/slides/phone_paycheck.png",
    nextSlideId: "savings_decision",
    choices: [],
    onEnter: function (gameState) {
      showFunFactNotification("Pay yourself first", "paying_yourself_first");
    },
  },

  savings_decision: {
    id: "savings_decision",
    text: "You check your balance.\n\nHow much of this paycheck are you saving?",
    background: "/assets/slides/phone_paycheck.png",
    choices: [
      { label: "Save 30% ($150)", locked: true },
      { label: "Save 50% ($250)", locked: true },
      { label: "Save 70% ($350)", nextSlideId: "after_saving_decision", effect: { type: "transferToSavings", amount: 350 } },
    ],
  },

  after_saving_decision: {
    id: "after_saving_decision",
    text: "You've saved $350. Your car goal is getting closer!",
    background: "/assets/slides/phone_paycheck.png",
    nextSlideId: "check-bank",
    choices: [],
  },

  // --------------------------------------------------
  // Original game flow (from check-bank onward)
  // --------------------------------------------------
  intro: {
    id: "intro",
    text: "You wake up on a Monday morning. Your phone buzzes with a notification from your bank. What do you do?",
    background: "/assets/slides/bank.png",
    choices: [
      { label: "Check the notification immediately", nextSlideId: "check-bank" },
      { label: "Ignore it and go back to sleep", nextSlideId: "ignore-bank" },
    ],
  },

  "check-bank": {
    id: "check-bank",
    text: "You open the app and see your balance. It's lower than expected. A few subscriptions have renewed. Do you review them now?",
    background: "/assets/slides/graduation.png",
    choices: [
      { label: "Review subscriptions now", nextSlideId: "review-subs" },
      { label: "Browse car listings instead", nextSlideId: "car_browsing_scene" },
      { label: "Deal with it later", nextSlideId: "intro" },
    ],
  },

  "ignore-bank": {
    id: "ignore-bank",
    text: "You roll over and close your eyes. Later that week, you're surprised by an overdraft fee. Maybe you should have checked after all.",
    background: "placeholder-ignore",
    choices: [
      { label: "Start over and check the notification", nextSlideId: "intro" },
      { label: "Accept your fate and move on", nextSlideId: "check-bank" },
    ],
  },

  "review-subs": {
    id: "review-subs",
    text: "You scroll through your subscriptions. Gym, streaming, cloud storage... They add up. Time to make some decisions.",
    background: "placeholder-review",
    onEnter: function (gameState) {
      // Complete Episode 1 when reaching this slide
      if (typeof completeEpisode === "function") {
        completeEpisode(1);
      }
    },
    choices: [
      { label: "Cancel at least one subscription", nextSlideId: "intro", effect: { type: "addIncome", amount: 120 } },
      { label: "Keep them all for now", nextSlideId: "car_browsing_scene" },
    ],
  },

  // Unlocks Credit in the metrics bar via onEnter
  car_browsing_scene: {
    id: "car_browsing_scene",
    text: "You open a car marketplace. That used sedan looks within reach if you keep saving. Your credit will matter when you're ready to finance.",
    background: "placeholder-review",
    onEnter: function (gameState) {
      gameState.hasSeenCarBrowsingScene = true;
      gameState.creditVisible = true;
      // Complete Episode 2 when reaching this slide
      if (typeof completeEpisode === "function") {
        completeEpisode(2);
      }
    },
    choices: [
      { label: "Set a savings goal and go back", nextSlideId: "intro", effect: { type: "transferToSavings", amount: 200 } },
      { label: "Just browsing for now", nextSlideId: "check-bank" },
    ],
  },
};
