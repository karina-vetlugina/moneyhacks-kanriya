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
  // Game intro
  // --------------------------------------------------
  game_intro: {
    id: "game_intro",
    text: "",
    background: "/assets/slides/intro.png",
    choices: [
      { label: "Start", nextSlideId: "birthday_cake_lit" },
    ],
  },

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
    background: "/assets/slides/phone-basic.png",
    nextSlideId: "paycheck_received",
    choices: [],
  },

  paycheck_received: {
    id: "paycheck_received",
    text: "Paycheck received: $500.",
    background: "/assets/slides/phone-basic.png",
    nextSlideId: "fun_fact_notification",
    choices: [],
    onEnter: function (gameState) {
      addIncome(500);
    },
  },

  fun_fact_notification: {
    id: "fun_fact_notification",
    text: "You open your banking app.",
    background: "/assets/slides/phone-basic.png",
    nextSlideId: "savings_decision",
    choices: [],
    onEnter: function (gameState) {
      showFunFactNotification("Pay yourself first", "paying_yourself_first");
    },
  },

  savings_decision: {
    id: "savings_decision",
    text: "You check your balance.\n\nHow much of this paycheck are you saving?",
    background: "/assets/slides/phone-basic.png",
    choices: [
      { label: "Save 30% ($150)", locked: true },
      { label: "Save 50% ($250)", locked: true },
      { label: "Save 70% ($350)", nextSlideId: "after_saving_decision", effect: { type: "transferToSavings", amount: 350 } },
    ],
  },

  after_saving_decision: {
    id: "after_saving_decision",
    text: "You've saved $350. Your car goal is getting closer!",
    background: "/assets/slides/phone-basic.png",
    nextSlideId: "savings_milestone",
    choices: [],
  },

  // --------------------------------------------------
  // Stage 3 — TFSA education
  // --------------------------------------------------
  savings_milestone: {
    id: "savings_milestone",
    text: "You glance at your savings.\n\nYou're almost at $6,000.\n\nDo you want to open a Tax-Free Savings Account (TFSA)?",
    background: "/assets/slides/phone-basic.png",
    nextSlideId: "tfsa_tip_notification",
    choices: [],
  },

  tfsa_tip_notification: {
    id: "tfsa_tip_notification",
    text: "You start reading about long-term investing.",
    background: "/assets/slides/phone-basic.png",
    nextSlideId: "investment_options",
    choices: [],
    onEnter: function (gameState) {
      showFunFactNotification("Time in the market matters", "time_in_the_market");
    },
  },

  investment_options: {
    id: "investment_options",
    text: "If you open a TFSA, you'll need to choose how your money is invested.\n\nHere are your main options:\n\nIndividual Stocks\nAn individual investment in a single company, it can be quite risky as it is entirely dependent on the financial performance of the single company.\n\nETFs\nAn Exchange Traded Fund is a basket of many individual stocks, managed by an organization. This is less risky as the variety of stocks helps balance out any major falls.",
    background: "/assets/slides/phone-basic.png",
    nextSlideId: "time_jump_month2",
    choices: [],
  },

  // --------------------------------------------------
  // Stage 4 — Month 2 paycheck and car costs
  // --------------------------------------------------
  time_jump_month2: {
    id: "time_jump_month2",
    text: "One month later…",
    background: "black",
    nextSlideId: "paycheck_month2",
    choices: [],
  },

  paycheck_month2: {
    id: "paycheck_month2",
    text: "Your phone buzzes.\n\nPaycheck received: $500.",
    background: "/assets/slides/phone-basic.png",
    nextSlideId: "savings_decision_month2",
    choices: [],
    onEnter: function (gameState) {
      addIncome(500);
    },
  },

  savings_decision_month2: {
    id: "savings_decision_month2",
    text: "You review your balance.\n\nHow much of this paycheck are you saving?",
    background: "/assets/slides/phone-basic.png",
    choices: [
      { label: "Save 30% ($150)", locked: true },
      { label: "Save 50% ($250)", locked: true },
      { label: "Save 70% ($350)", nextSlideId: "car_budget_explanation", effect: { type: "transferToSavings", amount: 350 } },
    ],
  },

  car_budget_explanation: {
    id: "car_budget_explanation",
    text: "You start looking at cars more seriously.\n\nYour estimate for a car is around $10,000.\n\nTo stay financially safe, you decide to save $15,000 before buying - keeping some savings aside.",
    background: "/assets/slides/phone-basic.png",
    nextSlideId: "later_evening",
    choices: [],
    onEnter: function (gameState) {
      showFunFactNotification("Cars cost more than the sticker price", "car_costs");
    },
  },

  // --------------------------------------------------
  // Stage 5 — Credit cards and credit score activation
  // --------------------------------------------------
  later_evening: {
    id: "later_evening",
    text: "Later this evening…",
    background: "black",
    nextSlideId: "parents_advice",
    choices: [],
  },

  parents_advice: {
    id: "parents_advice",
    text: "Your parents sat you down.\n\nThey tell you it's time to start building credit.\n\nThey suggest getting a credit card.",
    background: "/assets/slides/parents.png",
    choices: [
      { label: "Apply for a credit card", subtitle: "Go to the bank", nextSlideId: "bank_visit" },
      { label: "Ignore it for now", nextSlideId: "check-bank" },
    ],
  },

  bank_visit: {
    id: "bank_visit",
    text: "You walk into your bank.\n\nYou ask about applying for your first credit card.",
    background: "/assets/slides/bank.png",
    nextSlideId: "credit_approval",
    choices: [],
  },

  credit_approval: {
    id: "credit_approval",
    text: "A representative reviews your application.\n\nAfter a moment, she looks up and smiles.\n\nYou're approved.",
    background: "/assets/slides/bank_desk.png",
    nextSlideId: "credit_score_activated",
    choices: [],
  },

  credit_score_activated: {
    id: "credit_score_activated",
    text: "This is the beginning of your credit history.\n\nYour credit score has officially started.",
    background: "/assets/slides/bank_desk.png",
    nextSlideId: "credit_education_popup",
    choices: [],
    onEnter: function (gameState) {
      gameState.creditVisible = true;
      updateMetricsBar();
    },
  },

  credit_education_popup: {
    id: "credit_education_popup",
    text: "",
    background: "/assets/slides/bank_desk.png",
    nextSlideId: "time_jump_months",
    choices: [],
  },

  // --------------------------------------------------
  // Stage 6 — Time jump, graduation, summer job
  // --------------------------------------------------
  time_jump_months: {
    id: "time_jump_months",
    text: "A few months later…",
    background: "black",
    nextSlideId: "graduation_milestone",
    choices: [],
    onEnter: function (gameState) {
      gameState.totalSaved = 9395;
      gameState.accountBalance = 556;
    },
  },

  graduation_milestone: {
    id: "graduation_milestone",
    text: "Graduation day arrives.\n\nYou've now saved almost $10,000.\n\nWith university coming up, you decide to work a summer job to earn more money.",
    background: "/assets/slides/graduation.png",
    nextSlideId: "summer_job_secured",
    choices: [],
  },

  summer_job_secured: {
    id: "summer_job_secured",
    text: "You get the summer job.\n\nYou're working more hours now.\n\nYour bi-weekly paycheck increases to $1,500.",
    background: "/assets/slides/summer_job.png",
    nextSlideId: "summer_paycheck_received",
    choices: [],
    onEnter: function (gameState) {
      gameState.currentPaycheckAmount = 1500;
    },
  },

  summer_paycheck_received: {
    id: "summer_paycheck_received",
    text: "Your phone buzzes.\n\nPaycheck received: $1,250.",
    background: "/assets/slides/pay_statement.png",
    nextSlideId: "tip_taxes",
    choices: [],
    onEnter: function (gameState) {
      addIncome(1250);
    },
  },

  // --------------------------------------------------
  // Stage 7 — Car purchase path
  // --------------------------------------------------
  tip_taxes: {
    id: "tip_taxes",
    text: "You notice your take-home was less than the gross amount.",
    background: "/assets/slides/pay_statement.png",
    nextSlideId: "time_jump_more",
    choices: [],
    onEnter: function (gameState) {
      showFunFactNotification("Paychecks aren't gross pay", "paychecks_gross_pay");
    },
  },

  time_jump_more: {
    id: "time_jump_more",
    text: "A few more months pass…",
    background: "black",
    nextSlideId: "metrics_update_car",
    choices: [],
  },

  metrics_update_car: {
    id: "metrics_update_car",
    text: "You check your finances.",
    background: "black",
    nextSlideId: "car_purchase_decision",
    choices: [],
    onEnter: function (gameState) {
      gameState.accountBalance = 1050;
      gameState.totalSaved = 15151;
    },
  },

  car_purchase_decision: {
    id: "car_purchase_decision",
    text: "It's time to buy your first car.\n\nAt the dealership, you're presented with two options that fit your budget:",
    background: "/assets/slides/car_dealership.png",
    choices: [
      { label: "Brand-new car ($8,000 down, $300/mo)", subtitle: "Lower upfront cost, long-term payments", nextSlideId: "tip_payment_plans", effect: { type: "spendFromSavings", amount: 8000 } },
      { label: "Second-hand car ($10,000 upfront)", subtitle: "Higher upfront cost, no monthly payments", nextSlideId: "tip_payment_plans", effect: { type: "spendFromSavings", amount: 10000 } },
    ],
  },

  tip_payment_plans: {
    id: "tip_payment_plans",
    text: "You consider the costs over time.",
    background: "/assets/slides/car_dealership.png",
    nextSlideId: "end_demo_gate",
    choices: [],
    onEnter: function (gameState) {
      showFunFactNotification("Payment plans add up", "payment_plans_add_up");
    },
  },

  end_demo_gate: {
    id: "end_demo_gate",
    text: "This is just the beginning.\n\nKeep playing to unlock more about investing, RRSPs, mortgages, and insurance.",
    background: "black",
    choices: [
      { label: "Keep playing", nextSlideId: "to_be_continued" },
    ],
  },

  to_be_continued: {
    id: "to_be_continued",
    text: "To be continued…",
    background: "black",
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
