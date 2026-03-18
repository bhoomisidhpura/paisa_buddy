// Run once: node src/modules/swipe/seedCards.js
import { SwipeCard } from "./swipe.model.js";
import "../../config/env.js";
import { connectDB } from "../../config/db.js";

const cards = [
  {
    order: 1, icon: "📱", category: "Spending", difficulty: "Easy", xpReward: 30,
    title: "Buy iPhone on EMI?",
    scenario: "Latest iPhone costs ₹80,000. EMI 0% for 2 years. Your income is ₹40,000/month.",
    correctChoice: "reject",
    explanation: "A phone worth 2x your monthly salary is a lifestyle trap. Even at 0% EMI, ₹3,333/month goes to a depreciating asset. Opt for a mid-range phone and invest the difference.",
    tip: "A good rule: never spend more than 10% of annual income on a phone.",
  },
  {
    order: 2, icon: "🏠", category: "Investing", difficulty: "Medium", xpReward: 40,
    title: "Invest in PPF?",
    scenario: "You have ₹1.5 lakh savings. A friend suggests putting it all in PPF at 7.1% tax-free for 15 years.",
    correctChoice: "approve",
    explanation: "PPF is one of India's safest investments with EEE tax status (exempt at all stages). 7.1% tax-free is effectively ~10% pre-tax for someone in the 30% bracket. For long-term goals, it's excellent.",
    tip: "PPF works best as the debt/safe portion of your portfolio alongside equity investments.",
  },
  {
    order: 3, icon: "💳", category: "Debt", difficulty: "Easy", xpReward: 30,
    title: "Pay only credit card minimum?",
    scenario: "Your credit card bill is ₹20,000. You can pay only ₹500 minimum due this month to save cash.",
    correctChoice: "reject",
    explanation: "Paying only the minimum triggers 36-42% annual interest on the remaining ₹19,500. That ₹500 saving now could cost ₹7,000+ in interest over a year. Always pay full dues.",
    tip: "Credit cards are tools, not loans. If you can't pay full dues, you're spending beyond your means.",
  },
  {
    order: 4, icon: "🚗", category: "Spending", difficulty: "Medium", xpReward: 40,
    title: "Buy a car on loan?",
    scenario: "You're offered a ₹8 lakh car loan at 9% for 5 years. EMI would be ₹16,600/month. You earn ₹60,000/month.",
    correctChoice: "reject",
    explanation: "Car EMI at 27.6% of income is too high. Add insurance, fuel, and maintenance and you're at 40%+ for a depreciating asset. Consider a used car or public transport + cab subscription.",
    tip: "Keep all vehicle costs (EMI + insurance + fuel) under 15% of monthly income.",
  },
  {
    order: 5, icon: "🛡️", category: "Insurance", difficulty: "Easy", xpReward: 30,
    title: "Buy term life insurance at 25?",
    scenario: "An agent offers you ₹1 crore term life insurance for ₹8,000/year. You're 25, healthy, no dependents yet.",
    correctChoice: "approve",
    explanation: "Buying term insurance young locks in low premiums for life. ₹8,000/year for ₹1 crore cover is excellent value. As you get older or get dependents, premiums rise significantly.",
    tip: "Buy term insurance early, even before marriage. Premiums only increase with age.",
  },
  {
    order: 6, icon: "📈", category: "Investing", difficulty: "Medium", xpReward: 40,
    title: "Start a ₹5,000 SIP today?",
    scenario: "You have ₹5,000 extra per month after expenses. A friend says 'wait for the market to fall before investing.'",
    correctChoice: "approve",
    explanation: "Time in market beats timing the market. ₹5,000/month for 20 years at 12% = ₹49.9 lakhs. Waiting 2 years = only ₹38.6 lakhs. You lose ₹11 lakhs by waiting for the 'right time'.",
    tip: "SIP eliminates the need to time the market through rupee cost averaging.",
  },
  {
    order: 7, icon: "🎰", category: "Investing", difficulty: "Easy", xpReward: 30,
    title: "Invest in a 'guaranteed 30% return' scheme?",
    scenario: "Your neighbor invested ₹2 lakhs in a scheme promising 30% annual returns, guaranteed. He's asking you to join.",
    correctChoice: "reject",
    explanation: "No legitimate investment guarantees 30% returns. This is almost certainly a Ponzi scheme. Even Nifty 50 averages ~12% annually. Schemes promising more are designed to steal your money.",
    tip: "If returns sound too good to be true, it's fraud. SEBI-registered investments never guarantee returns.",
  },
  {
    order: 8, icon: "🏥", category: "Insurance", difficulty: "Easy", xpReward: 30,
    title: "Skip health insurance to save money?",
    scenario: "You're 24 and healthy. Health insurance costs ₹8,000/year. You think you won't need it at your age.",
    correctChoice: "reject",
    explanation: "A single hospitalization can cost ₹2-5 lakhs today. Without insurance, one health emergency can wipe out years of savings. At 24, premiums are lowest — the best time to buy.",
    tip: "Health insurance is not optional. Medical inflation runs at 14% annually in India.",
  },
  {
    order: 9, icon: "🎓", category: "Investing", difficulty: "Hard", xpReward: 50,
    title: "Take education loan for MBA abroad?",
    scenario: "Top US MBA costs ₹80 lakhs. Education loan at 11% for 10 years = EMI of ₹1.1 lakh/month. Starting salary post-MBA: ₹3-4 lakhs/month.",
    correctChoice: "approve",
    explanation: "An investment in education that gives 3-4x return on EMI is financially sound. The ROI here is strong — salary covers EMI with room to spare. The key is choosing a reputable institution with strong placement.",
    tip: "Evaluate education loans by ROI: if starting salary > 3x EMI, it's usually worth it.",
  },
  {
    order: 10, icon: "🏦", category: "Saving", difficulty: "Easy", xpReward: 30,
    title: "Keep emergency fund in savings account?",
    scenario: "You've saved ₹1 lakh as emergency fund. Your bank offers a liquid mutual fund at 7% vs savings account at 3.5%.",
    correctChoice: "approve",
    explanation: "Liquid mutual funds offer better returns (6-7%) than savings accounts and allow withdrawal within 1 business day. Perfect for emergency funds — better returns without sacrificing liquidity.",
    tip: "Emergency fund should be in liquid, accessible instruments — liquid funds > savings accounts.",
  },
];

const seed = async () => {
  await connectDB();
  await SwipeCard.deleteMany({});
  await SwipeCard.insertMany(cards);
  console.log(`✅ Seeded ${cards.length} swipe decision cards!`);
  process.exit(0);
};

seed().catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); });