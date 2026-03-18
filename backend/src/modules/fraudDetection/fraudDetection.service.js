import { FraudScan } from "./fraudDetection.model.js";
import { rewardUser } from "../gamification/gamification.service.js";

const FRAUD_PATTERNS = [
  { type: "OTP Theft", patterns: [/share.*otp/i, /otp.*share/i, /enter.*otp/i, /verify.*otp/i], redFlag: "Asking for OTP — no legitimate entity ever asks for OTP" },
  { type: "KYC Fraud", patterns: [/kyc.*update/i, /update.*kyc/i, /account.*suspend/i, /kyc.*link/i], redFlag: "KYC update via link — banks never ask for KYC through SMS links" },
  { type: "UPI Scam", patterns: [/upi.*urgent/i, /send.*upi.*emergency/i, /qr.*code.*receive/i], redFlag: "Urgent UPI request — always verify before sending money" },
  { type: "Fake Lottery", patterns: [/won.*lottery/i, /prize.*claim/i, /processing.*fee.*prize/i], redFlag: "Lottery prize claim — you cannot win a lottery you never entered" },
  { type: "Phishing", patterns: [/click.*link/i, /account.*blocked.*link/i, /login.*immediately/i], redFlag: "Suspicious link — verify through official website only" },
  { type: "Fake Job Offer", patterns: [/registration.*fee.*job/i, /like.*videos.*earn/i, /work.*home.*earn.*fee/i], redFlag: "Job requiring registration fee — legitimate employers never charge fees" },
  { type: "Investment Scam", patterns: [/guaranteed.*return/i, /double.*money/i, /risk.*free.*invest/i], redFlag: "Guaranteed returns — no legitimate investment can guarantee returns" },
  { type: "Impersonation", patterns: [/rbi.*transfer/i, /digital.*arrest/i, /police.*arrest.*pay/i], redFlag: "Government demanding money — RBI/Police never contact individuals for transfers" },
  { type: "Fake Customer Care", patterns: [/customer.*care.*pin/i, /support.*share.*password/i], redFlag: "Customer care asking for PIN — legitimate support never asks for credentials" },
];

const SUSPICIOUS_KEYWORDS = ["urgent", "immediately", "expire", "blocked", "suspended", "arrest", "guaranteed", "winner", "congratulations", "processing fee", "click here", "verify now"];

const analyzeMessage = (message) => {
  const redFlags = [];
  let fraudType = null;
  let matchCount = 0;

  for (const rule of FRAUD_PATTERNS) {
    for (const pattern of rule.patterns) {
      if (pattern.test(message)) {
        redFlags.push(rule.redFlag);
        fraudType = rule.type;
        matchCount += 2;
        break;
      }
    }
  }

  const lowerMsg = message.toLowerCase();
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter((kw) => lowerMsg.includes(kw));
  if (foundKeywords.length > 0) {
    redFlags.push(`Pressure language detected: "${foundKeywords.slice(0, 3).join('", "')}"`);
    matchCount += foundKeywords.length;
  }

  let verdict, riskLevel, confidence, explanation, advice;

  if (matchCount >= 4 || (fraudType && foundKeywords.length >= 2)) {
    verdict = "FRAUD"; riskLevel = "HIGH"; confidence = Math.min(95, 70 + matchCount * 3);
    explanation = `Strong indicators of a ${fraudType || "financial"} scam. Multiple red flags and pressure tactics detected.`;
    advice = "Block sender immediately and report to cybercrime.gov.in or call 1930.";
  } else if (matchCount >= 2 || foundKeywords.length >= 2) {
    verdict = "SUSPICIOUS"; riskLevel = "MEDIUM"; confidence = Math.min(80, 50 + matchCount * 5);
    explanation = "Message contains suspicious elements commonly found in scam messages. Exercise caution.";
    advice = "Do not share personal details or make payments. Verify through official channels first.";
  } else {
    verdict = "SAFE"; riskLevel = "LOW"; confidence = 85;
    explanation = "No obvious fraud indicators detected. Appears to be normal communication.";
    advice = "Message appears safe, but never share OTPs or PINs with anyone.";
  }

  return { verdict, riskLevel, confidence, fraudType: fraudType || null, redFlags: [...new Set(redFlags)], explanation, advice };
};

export const scanMessage = async (userId, message) => {
  if (!message || message.trim().length < 10) throw new Error("Message too short to analyze");
  const analysis = analyzeMessage(message);
  const scan = await FraudScan.create({ user: userId, message, ...analysis });
  if (analysis.verdict !== "SAFE") await rewardUser(userId, "FRAUD_DETECTED", "fraudDetected");
  return { scanId: scan._id, ...analysis };
};

export const getScanHistory = async (userId) => {
  return await FraudScan.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
};