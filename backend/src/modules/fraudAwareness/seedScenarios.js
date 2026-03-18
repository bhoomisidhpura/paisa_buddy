// Run once: node src/modules/fraud-awareness/seedScenarios.js
import mongoose from "mongoose";
import { FraudScenario } from "./fraudAwareness.model.js";
import "../../config/env.js";
import { connectDB } from "../../config/db.js";

const scenarios = [
  {
    order: 1,
    title: "Urgent UPI Request",
    fraudType: "UPI Scam",
    difficulty: "Easy",
    xpReward: 50,
    description: "You receive a message: 'Hi! I'm your cousin Rahul. My phone is broken and I need ₹5000 urgently for medical emergency. Please send via UPI to 9876543210@paytm'",
    options: [
      "Send money immediately to help family",
      "Call Rahul on his known number to verify",
      "Ask for more details via the same chat",
    ],
    correctIndex: 1,
    explanation: "Always verify urgent money requests by calling the person on their known number. Scammers impersonate family members to create urgency. Never send money based on a message alone.",
  },
  {
    order: 2,
    title: "KYC Update Warning",
    fraudType: "KYC Fraud",
    difficulty: "Easy",
    xpReward: 50,
    description: "You get an SMS: 'Your SBI account will be suspended in 24 hours. Update your KYC immediately by clicking: http://sbi-kyc-update.xyz/verify and entering your account details.'",
    options: [
      "Click the link and update KYC immediately",
      "Ignore it — SBI never sends such messages",
      "Visit your nearest SBI branch or official website sbi.co.in",
    ],
    correctIndex: 2,
    explanation: "Banks NEVER ask for KYC via SMS links. The URL 'sbi-kyc-update.xyz' is not the official SBI domain. Always use the official website or visit your branch for KYC updates.",
  },
  {
    order: 3,
    title: "Lottery Winner",
    fraudType: "Fake Lottery",
    difficulty: "Easy",
    xpReward: 50,
    description: "'Congratulations! You have won ₹25,00,000 in the KBC Lottery 2024! To claim your prize, pay a processing fee of ₹2,500 via UPI to lottery@kbc.in and provide your Aadhaar number.'",
    options: [
      "Pay the processing fee to claim the prize",
      "Share Aadhaar but don't pay yet",
      "This is a scam — delete and block",
    ],
    correctIndex: 2,
    explanation: "You cannot win a lottery you never entered. Legitimate prizes never require upfront fees. Asking for Aadhaar + processing fee is a classic advance fee fraud. Delete and block immediately.",
  },
  {
    order: 4,
    title: "OTP Request",
    fraudType: "OTP Theft",
    difficulty: "Easy",
    xpReward: 50,
    description: "A person calls claiming to be from HDFC Bank: 'Sir, we are upgrading your account security. Please share the OTP you just received on your mobile to complete the verification.'",
    options: [
      "Share the OTP — it's my bank calling",
      "Never share OTP with anyone, including bank employees",
      "Ask them to call back later",
    ],
    correctIndex: 1,
    explanation: "NO legitimate bank, UPI app, or government body will EVER ask for your OTP. OTPs are one-time passwords meant only for you. Sharing an OTP gives full access to your account.",
  },
  {
    order: 5,
    title: "Investment Scheme",
    fraudType: "Investment Scam",
    difficulty: "Medium",
    xpReward: 75,
    description: "A WhatsApp message: 'Join our exclusive trading group! Our AI algorithm guarantees 40% monthly returns. Minimum investment ₹10,000. 500+ members already earning. Limited slots — invest today!'",
    options: [
      "Invest ₹10,000 to test it out",
      "Ask for SEBI registration details before investing",
      "This is a Ponzi scheme — guaranteed returns don't exist",
    ],
    correctIndex: 2,
    explanation: "No legitimate investment guarantees returns — especially not 40% monthly (that's 480% annually!). SEBI-registered advisors cannot guarantee returns. This is a Ponzi or pump-and-dump scheme.",
  },
  {
    order: 6,
    title: "Fake Customer Care",
    fraudType: "Fake Customer Care",
    difficulty: "Medium",
    xpReward: 75,
    description: "You search 'Paytm customer care number' on Google. You find 9876512345 in a top result. You call and they ask for your UPI PIN to 'verify your account and resolve your issue'.",
    options: [
      "Share the UPI PIN — they need it to help",
      "Hang up immediately — never share UPI PIN",
      "Share only the last 4 digits",
    ],
    correctIndex: 1,
    explanation: "UPI PIN is like your ATM PIN — never share it with anyone. Fake customer care numbers rank high in Google results. Always get support numbers from the official app itself, not Google search.",
  },
  {
    order: 7,
    title: "Job Offer Scam",
    fraudType: "Fake Job Offer",
    difficulty: "Medium",
    xpReward: 75,
    description: "'Work from home opportunity! Earn ₹50,000/month by liking YouTube videos. Registration fee ₹500. After payment, you'll get access to tasks. 2,000+ people already earning!' — received on Telegram.",
    options: [
      "Pay ₹500 to register and start earning",
      "Ask for more information and testimonials",
      "This is a task-based scam — legitimate jobs don't require fees",
    ],
    correctIndex: 2,
    explanation: "Legitimate employers NEVER charge registration fees. 'Like videos for money' is a well-known task scam where you pay fees, do initial tasks, then are asked for more money before being cut off.",
  },
  {
    order: 8,
    title: "QR Code Payment",
    fraudType: "UPI Scam",
    difficulty: "Medium",
    xpReward: 75,
    description: "You're selling your old laptop on OLX. A buyer says 'I'll pay online, just scan this QR code to receive the payment.' They send a QR code on WhatsApp.",
    options: [
      "Scan the QR code to receive payment",
      "QR codes are for SENDING money, not receiving — this is a scam",
      "Scan it but don't enter your PIN",
    ],
    correctIndex: 1,
    explanation: "In UPI, you NEVER scan a QR code to receive money — you only scan to PAY. Scammers send QR codes to trick sellers into paying them. To receive money, just share your UPI ID.",
  },
  {
    order: 9,
    title: "RBI Digital Rupee Scam",
    fraudType: "Impersonation",
    difficulty: "Hard",
    xpReward: 100,
    description: "'This is RBI Digital Currency Department. Your account has been flagged for suspicious transactions under PMLA. To avoid arrest, immediately transfer ₹50,000 to our secure escrow account. Case number: RBI/2024/8821.'",
    options: [
      "Transfer the money to avoid legal trouble",
      "Call RBI's official number to verify",
      "RBI never contacts individuals directly for transfers — this is a threat scam",
    ],
    correctIndex: 2,
    explanation: "RBI never contacts individuals to demand money transfers. Using legal threats (arrest, PMLA) to create panic is a signature 'digital arrest' scam. RBI's only contact with public is through banks. Report to cybercrime.gov.in.",
  },
  {
    order: 10,
    title: "Loan App Fraud",
    fraudType: "Loan Fraud",
    difficulty: "Hard",
    xpReward: 100,
    description: "An app offers instant ₹20,000 personal loan with no documents. After installing, it asks for access to contacts, gallery, and SMS. After getting the loan, they demand repayment at 200% interest or threaten to send morphed photos to your contacts.",
    options: [
      "Repay the loan with interest to protect reputation",
      "Contact cybercrime police and RBI — this is an illegal predatory lending app",
      "Uninstall the app and hope they forget",
    ],
    correctIndex: 1,
    explanation: "These are illegal loan shark apps. Accessing contacts and gallery is blackmail preparation. RBI mandates all lending apps be registered. Report to cybercrime.gov.in (1930) and RBI Sachet portal immediately. You have legal protection.",
  },
];

const seed = async () => {
  await connectDB();
  await FraudScenario.deleteMany({});
  await FraudScenario.insertMany(scenarios);
  console.log(`✅ Seeded ${scenarios.length} fraud awareness scenarios!`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});