import { Gamification } from "./gamification.model.js";

// --- XP required to reach each level ---
// Level N requires N * 500 XP total (e.g. Level 2 = 1000 XP, Level 7 = 3500 XP)
const XP_PER_LEVEL = 500;

// --- XP & Coin rewards for each action ---
export const REWARDS = {
  LESSON_COMPLETED:    { xp: 100, coins: 50  },
  QUIZ_COMPLETED:      { xp: 75,  coins: 30  },
  TRANSACTION_LOGGED:  { xp: 20,  coins: 10  },
  BUDGET_CREATED:      { xp: 50,  coins: 25  },
  TRADE_EXECUTED:      { xp: 60,  coins: 30  },
  FRAUD_DETECTED:      { xp: 80,  coins: 40  },
  DAILY_STREAK:        { xp: 30,  coins: 15  },
};

// --- All available badges ---
const BADGES = [
  { id: "first_transaction", name: "First Investment",   description: "Logged your first transaction",       icon: "💰" },
  { id: "budget_master",     name: "Budget Master",      description: "Created 5 successful budgets",        icon: "📊" },
  { id: "fraud_detective",   name: "Fraud Detective",    description: "Completed fraud awareness course",    icon: "🔍" },
  { id: "property_pro",      name: "Property Pro",       description: "Mastered real estate basics",         icon: "🏠" },
  { id: "streak_7",          name: "Week Warrior",       description: "Maintained a 7-day streak",           icon: "🔥" },
  { id: "streak_30",         name: "Month Master",       description: "Maintained a 30-day streak",          icon: "⚡" },
  { id: "trader",            name: "First Trader",       description: "Executed your first virtual trade",   icon: "📈" },
  { id: "lesson_1",          name: "Scholar",            description: "Completed your first lesson",         icon: "🎓" },
  { id: "lesson_10",         name: "Knowledge Seeker",   description: "Completed 10 lessons",                icon: "📚" },
  { id: "quiz_5",            name: "Quiz Champion",      description: "Completed 5 quizzes",                 icon: "🏆" },
  { id: "level_5",           name: "Rising Star",        description: "Reached Level 5",                     icon: "⭐" },
  { id: "level_10",          name: "Financial Hero",     description: "Reached Level 10",                    icon: "🦸" },
];

// --- Check and unlock any new badges ---
const checkBadges = (profile) => {
  const earned = profile.badges.map((b) => b.id);
  const newBadges = [];

  const check = (condition, badge) => {
    if (condition && !earned.includes(badge.id)) {
      newBadges.push({ ...badge, earnedAt: new Date() });
    }
  };

  const s = profile.stats;
  check(s.transactionsLogged >= 1,  BADGES.find(b => b.id === "first_transaction"));
  check(s.budgetsCreated >= 5,       BADGES.find(b => b.id === "budget_master"));
  check(s.fraudDetected >= 1,        BADGES.find(b => b.id === "fraud_detective"));
  check(s.tradesExecuted >= 1,       BADGES.find(b => b.id === "trader"));
  check(s.lessonsCompleted >= 1,     BADGES.find(b => b.id === "lesson_1"));
  check(s.lessonsCompleted >= 10,    BADGES.find(b => b.id === "lesson_10"));
  check(s.quizzesCompleted >= 5,     BADGES.find(b => b.id === "quiz_5"));
  check(profile.streak >= 7,         BADGES.find(b => b.id === "streak_7"));
  check(profile.streak >= 30,        BADGES.find(b => b.id === "streak_30"));
  check(profile.level >= 5,          BADGES.find(b => b.id === "level_5"));
  check(profile.level >= 10,         BADGES.find(b => b.id === "level_10"));

  return newBadges;
};

// --- Core: get or create a user's gamification profile ---
export const getOrCreateProfile = async (userId) => {
  let profile = await Gamification.findOne({ user: userId });
  if (!profile) {
    profile = await Gamification.create({ user: userId });
  }
  return profile;
};

// --- Core: award XP + coins, level up, check badges, update streak ---
export const rewardUser = async (userId, action, statKey = null) => {
  const reward = REWARDS[action];
  if (!reward) throw new Error(`Unknown reward action: ${action}`);

  const profile = await getOrCreateProfile(userId);

  // Add XP & coins
  profile.xp += reward.xp;
  profile.coins += reward.coins;

  // Update relevant stat
  if (statKey && profile.stats[statKey] !== undefined) {
    profile.stats[statKey] += 1;
  }

  // Level up check
  const newLevel = Math.floor(profile.xp / XP_PER_LEVEL) + 1;
  const didLevelUp = newLevel > profile.level;
  profile.level = newLevel;

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = profile.lastActiveDate
    ? new Date(profile.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      profile.streak += 1; // consecutive day
    } else if (diffDays > 1) {
      profile.streak = 1;  // streak broken
    }
    // diffDays === 0 means same day, no change
  } else {
    profile.streak = 1; // first activity
  }
  profile.lastActiveDate = today;

  // Check for new badges
  const newBadges = checkBadges(profile);
  profile.badges.push(...newBadges);

  await profile.save();

  return {
    xpGained: reward.xp,
    coinsGained: reward.coins,
    totalXp: profile.xp,
    totalCoins: profile.coins,
    level: profile.level,
    didLevelUp,
    streak: profile.streak,
    newBadges,
    xpToNextLevel: (profile.level * XP_PER_LEVEL) - profile.xp,
  };
};

// --- Get full profile for dashboard ---
export const getProfile = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  return {
    xp: profile.xp,
    level: profile.level,
    coins: profile.coins,
    badges: profile.badges,
    streak: profile.streak,
    stats: profile.stats,
    xpToNextLevel: (profile.level * XP_PER_LEVEL) - profile.xp,
    xpForCurrentLevel: (profile.level - 1) * XP_PER_LEVEL,
    xpForNextLevel: profile.level * XP_PER_LEVEL,
  };
};