// Run once: node src/modules/scheme-hunt/seedSchemes.js
import { Scheme } from "./scheme.model.js";
import "../../config/env.js";
import { connectDB } from "../../config/db.js";

const schemes = [
  {
    order: 1, coinsReward: 150, xpReward: 50,
    name: "Pradhan Mantri Mudra Yojana", shortName: "Pradhan", icon: "💼",
    category: "Business", description: "Provides loans up to ₹10 lakhs to non-corporate, non-farm small/micro enterprises.",
    benefits: ["Loans up to ₹10 lakhs with low interest rates", "No collateral required for Shishu and Kishore category", "3 categories: Shishu (₹50K), Kishore (₹5L), Tarun (₹10L)"],
    eligibility: ["Small business owners", "Micro enterprises", "No collateral required", "Indian citizen aged 18+"],
    howToApply: "Apply through any bank or NBFC registered with Mudra. Visit mudra.org.in or nearest bank branch.",
    officialLink: "https://mudra.org.in",
    quiz: { question: "Maximum loan amount under Mudra Yojana is?", options: ["₹5 lakhs", "₹10 lakhs", "₹20 lakhs", "₹50 lakhs"], correctIndex: 1, explanation: "Pradhan Mantri Mudra Yojana provides loans up to ₹10 lakhs under the Tarun category." },
  },
  {
    order: 2, coinsReward: 200, xpReward: 60,
    name: "PM Jan Dhan Yojana", shortName: "Jan Dhan", icon: "🏦",
    category: "Insurance", description: "Financial inclusion program ensuring access to financial services for all Indians.",
    benefits: ["Zero balance savings account", "RuPay debit card with ₹2 lakh accident insurance", "₹30,000 life cover", "Overdraft facility up to ₹10,000 after 6 months"],
    eligibility: ["Any Indian citizen", "No minimum balance required", "Age 10 and above"],
    howToApply: "Visit any bank branch with Aadhaar and one passport-size photo. Takes 15 minutes.",
    officialLink: "https://pmjdy.gov.in",
    quiz: { question: "What is the accident insurance cover under PM Jan Dhan Yojana?", options: ["₹50,000", "₹1 lakh", "₹2 lakhs", "₹5 lakhs"], correctIndex: 2, explanation: "The RuPay card issued under PMJDY comes with ₹2 lakh accidental insurance cover." },
  },
  {
    order: 3, coinsReward: 250, xpReward: 70,
    name: "PM Suraksha Bima Yojana", shortName: "Suraksha", icon: "🛡️",
    category: "Insurance", description: "Accidental death and disability insurance scheme at just ₹20/year premium.",
    benefits: ["₹2 lakh cover for accidental death", "₹1 lakh for partial disability", "Premium only ₹20 per year", "Auto-debit from bank account"],
    eligibility: ["Age 18-70 years", "Must have a bank account with Aadhaar", "Annual premium ₹20"],
    howToApply: "Enroll through your bank's net banking, mobile app, or visit branch. Auto-renews yearly.",
    officialLink: "https://jansuraksha.gov.in",
    quiz: { question: "What is the annual premium for PM Suraksha Bima Yojana?", options: ["₹12", "₹20", "₹100", "₹330"], correctIndex: 1, explanation: "PMSBY has an annual premium of just ₹20 for ₹2 lakh accidental death cover." },
  },
  {
    order: 4, coinsReward: 100, xpReward: 40,
    name: "PM Jeevan Jyoti Bima Yojana", shortName: "Jeevan", icon: "❤️",
    category: "Insurance", description: "Life insurance scheme offering ₹2 lakh cover at ₹436/year.",
    benefits: ["₹2 lakh life insurance cover", "Premium ₹436 per year", "Death from any cause covered", "Simple enrollment through bank"],
    eligibility: ["Age 18-50 years", "Must have a savings bank account", "Annual premium ₹436"],
    howToApply: "Enroll via your bank branch, net banking, or mobile banking app before May 31 each year.",
    officialLink: "https://jansuraksha.gov.in",
    quiz: { question: "What is the annual premium for PM Jeevan Jyoti Bima Yojana?", options: ["₹20", "₹100", "₹330", "₹436"], correctIndex: 3, explanation: "PMJJBY charges ₹436/year for ₹2 lakh life insurance cover." },
  },
  {
    order: 5, coinsReward: 300, xpReward: 80,
    name: "Atal Pension Yojana", shortName: "APY", icon: "👴",
    category: "Pension", description: "Government-backed pension scheme guaranteeing monthly pension of ₹1000-₹5000.",
    benefits: ["Guaranteed monthly pension of ₹1000-₹5000 after age 60", "Government co-contributes 50% for eligible subscribers", "Tax benefit under Section 80CCD"],
    eligibility: ["Age 18-40 years", "Must have a savings bank account", "Not a taxpayer for government co-contribution"],
    howToApply: "Apply at your bank branch or via net banking. Contribution auto-debited monthly.",
    officialLink: "https://npscra.nsdl.co.in",
    quiz: { question: "What is the maximum monthly pension under Atal Pension Yojana?", options: ["₹1,000", "₹3,000", "₹5,000", "₹10,000"], correctIndex: 2, explanation: "APY provides guaranteed monthly pension ranging from ₹1,000 to ₹5,000." },
  },
  {
    order: 6, coinsReward: 350, xpReward: 90,
    name: "PM Kaushal Vikas Yojana", shortName: "Kaushal", icon: "🎓",
    category: "Education", description: "Free skill training and certification for Indian youth to improve employability.",
    benefits: ["Free short-term skill training (3 months)", "Government-recognized certification", "Stipend during training", "Placement assistance after training"],
    eligibility: ["Age 15-45 years", "Indian citizen", "School dropout or college pass-out"],
    howToApply: "Register at pmkvyofficial.org or visit nearest PMKVY training center.",
    officialLink: "https://pmkvyofficial.org",
    quiz: { question: "Who is the target beneficiary of PM Kaushal Vikas Yojana?", options: ["Only farmers", "Indian youth seeking skill training", "Senior citizens", "Government employees"], correctIndex: 1, explanation: "PMKVY targets Indian youth to provide free skill training and improve employability." },
  },
];

const seed = async () => {
  await connectDB();
  await Scheme.deleteMany({});
  await Scheme.insertMany(schemes);
  console.log(`✅ Seeded ${schemes.length} government schemes!`);
  process.exit(0);
};

seed().catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); });