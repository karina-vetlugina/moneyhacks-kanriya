/**
 * slides.js - Slide data for POV interactive app
 *
 * Each slide supports: text, factText (optional), choices.
 * Slides may include:
 *   - onEnter(gameState) — run when the slide is shown (e.g. unlock Credit)
 *   - choices[].effect — { type: "addIncome"|"spendMoney"|"transferToSavings", amount }
 */

const SLIDES = {
  intro: {
    id: "intro",
    text: "You wake up on a Monday morning. Your phone buzzes with a notification from your bank. What do you do?",
    factText: "Tip: Checking your bank regularly helps you avoid overdrafts and spot unexpected charges.",
    background: "/assets/slides/bank.png",
    choices: [
      { label: "Check the notification immediately", nextSlideId: "check-bank" },
      { label: "Ignore it and go back to sleep", nextSlideId: "ignore-bank" },
    ],
  },

  "check-bank": {
    id: "check-bank",
    text: "You open the app and see your balance. It's lower than expected. A few subscriptions have renewed. Do you review them now?",
    factText: "Recurring subscriptions can add up. Review them every few months to cancel what you don't use.",
    background: "placeholder-check",
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
    },
    choices: [
      { label: "Set a savings goal and go back", nextSlideId: "intro", effect: { type: "transferToSavings", amount: 200 } },
      { label: "Just browsing for now", nextSlideId: "check-bank" },
    ],
  },
};
