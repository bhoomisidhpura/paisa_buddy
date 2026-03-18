// Run once: node src/modules/agreements/seedAgreements.js
import { Agreement } from "./agreements.model.js";
import "../../config/env.js";
import { connectDB } from "../../config/db.js";

const agreements = [
  {
    order: 1, icon: "🏠", riskLevel: "Medium", category: "Housing", xpReward: 100,
    title: "Rental Agreement",
    description: "Understanding lease terms, deposits, and tenant rights",
    keyTerms: ["Security deposit (usually 1-3 months rent)", "Lock-in period restrictions", "Maintenance responsibilities"],
    redFlags: ["No registration of agreement", "Vague maintenance clauses", "No notice period defined", "Deposit refund conditions not specified"],
    studyContent: `# Rental Agreement Guide

## What is a Rental Agreement?
A rental agreement is a legal contract between a landlord and tenant defining the terms of occupancy.

## Key Sections to Understand

### 1. Rent and Deposit
- Monthly rent amount and due date
- Security deposit (typically 1-3 months rent, up to 10 months in some cities)
- Deposit refund conditions — must be specified clearly
- Annual rent escalation clause (typically 5-10%)

### 2. Lock-in Period
- Period during which neither party can terminate without penalty
- Usually 6-12 months for residential properties
- Early exit penalty — typically 1-2 months rent

### 3. Maintenance
- Who pays for minor repairs (tenant) vs major repairs (landlord)?
- Society maintenance charges — who pays?
- Utility connections responsibility

### 4. Notice Period
- Standard is 1-2 months notice before vacating
- Must be given in writing

## Registration
Rental agreements over 11 months MUST be registered at the Sub-Registrar office. Unregistered agreements are not legally enforceable in court.

## Tenant Rights
- Right to peaceful possession
- Right to basic amenities
- Protection against arbitrary eviction`,
    quiz: [
      { question: "What is the typical security deposit range for rental agreements in India?", options: ["1 week rent", "1-3 months rent", "6 months rent", "1 year rent"], correctIndex: 1, explanation: "Security deposit in India is typically 1-3 months rent, though in cities like Bengaluru it can go up to 10 months." },
      { question: "Rental agreements over how many months must be registered?", options: ["6 months", "11 months", "12 months", "24 months"], correctIndex: 1, explanation: "Agreements exceeding 11 months must be registered at the Sub-Registrar office to be legally enforceable." },
      { question: "What is a lock-in period?", options: ["Time to pay deposit", "Period where neither party can exit without penalty", "Time to inspect property", "Registration waiting period"], correctIndex: 1, explanation: "Lock-in period is the minimum stay commitment — early exit usually means forfeiting 1-2 months rent as penalty." },
    ],
  },
  {
    order: 2, icon: "💼", riskLevel: "High", category: "Employment", xpReward: 150,
    title: "Employment Contract",
    description: "Salary structure, benefits, and termination clauses",
    keyTerms: ["CTC breakdown (basic, HRA, allowances)", "Notice period and buyout options", "Non-compete and confidentiality clauses"],
    redFlags: ["Variable pay > 30% of CTC", "Non-compete clause over 1 year", "No termination protection", "Intellectual property clause too broad"],
    studyContent: `# Employment Contract Guide

## Understanding Your CTC

CTC (Cost to Company) ≠ In-hand salary. Typical breakdown:
- Basic Salary: 40-50% of CTC (affects PF, gratuity)
- HRA: 40-50% of basic (tax exempt if renting)
- Special Allowance: Variable
- PF Contribution: 12% of basic (employer contribution)
- Gratuity: 4.81% of basic

**Example:** ₹12 LPA CTC → In-hand might be ₹75,000-85,000/month

## Key Clauses

### Notice Period
- Standard: 30-90 days
- Buyout option: Pay notice period salary to exit early
- Always negotiate — shorter notice = more flexibility

### Non-Compete Clause
- Restricts joining competitors after leaving
- Usually 6-12 months
- Enforceability in India is limited but read carefully
- Geographic and role scope matters

### Confidentiality/NDA
- Protects company's trade secrets
- Usually permanent — this is standard and acceptable
- Ensure personal projects are excluded

### Variable Pay
- Performance bonuses, ESOPs, commissions
- Ask for historical payout percentages
- Don't rely on variable pay for fixed expenses

## What to Negotiate
1. Notice period (shorter is better for you)
2. Non-compete scope and duration
3. Variable pay structure and measurement criteria
4. Work-from-home policy`,
    quiz: [
      { question: "If your CTC is ₹12 LPA, what should you expect as approximate monthly in-hand?", options: ["₹1,00,000", "₹75,000-85,000", "₹50,000", "₹1,20,000"], correctIndex: 1, explanation: "After PF, tax, and other deductions, ₹12 LPA typically translates to ₹75,000-85,000 in-hand per month." },
      { question: "What percentage of basic salary does the employer contribute to PF?", options: ["6%", "8%", "12%", "15%"], correctIndex: 2, explanation: "Both employee and employer contribute 12% of basic salary to Provident Fund." },
      { question: "What is a non-compete clause?", options: ["Clause about not competing in sports", "Restriction on joining competitors after leaving", "Clause about performance competition", "Salary negotiation restriction"], correctIndex: 1, explanation: "Non-compete clauses restrict you from joining competitor companies for a specified period after leaving." },
    ],
  },
  {
    order: 3, icon: "🏦", riskLevel: "High", category: "Finance", xpReward: 150,
    title: "Loan Agreement",
    description: "Interest rates, EMI structure, and penalties",
    keyTerms: ["Interest rate (fixed vs floating)", "Processing fees and charges", "Prepayment penalties"],
    redFlags: ["High prepayment penalty", "Hidden processing fees", "Unclear foreclosure charges", "No rate reset clause in floating loans"],
    studyContent: `# Loan Agreement Guide

## Types of Interest Rates

### Fixed Rate
- Rate stays constant throughout tenure
- Predictable EMI — easier to budget
- Usually 0.5-1% higher than floating rate
- Good for: short-term loans, when rates are expected to rise

### Floating Rate
- Linked to RBI repo rate (EBLR/MCLR)
- EMI changes with rate revisions
- Currently beneficial (rates declining trend)
- Good for: long-term loans like home loans

## Key Charges to Check

| Charge | Typical Range |
|--------|--------------|
| Processing Fee | 0.5-2% of loan amount |
| Prepayment Penalty | 0-4% (0% for floating) |
| Late Payment Fee | 2-3% per month |
| Foreclosure Charges | 0-4% |

## EMI Calculation
EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]
- P = Principal
- r = Monthly interest rate
- n = Number of months

**Example:** ₹10L loan, 9% annual, 5 years
- Monthly rate = 0.75%
- EMI = ₹20,758
- Total payment = ₹12.45L (₹2.45L interest)

## RBI Rules (Know Your Rights)
- No prepayment penalty on floating rate loans
- Lender must provide loan account statement
- 15-day free look period on insurance bundled with loans`,
    quiz: [
      { question: "Can lenders charge prepayment penalty on floating rate loans?", options: ["Yes, up to 4%", "Yes, up to 2%", "No, RBI prohibits it", "Only on home loans"], correctIndex: 2, explanation: "RBI has prohibited banks and NBFCs from charging prepayment penalties on floating rate loans to individual borrowers." },
      { question: "What does EBLR stand for in loan agreements?", options: ["Effective Base Lending Rate", "External Benchmark Lending Rate", "Expected Base Loan Rate", "Equated Base Loan Rate"], correctIndex: 1, explanation: "EBLR (External Benchmark Lending Rate) is the rate linked to RBI's repo rate, making loan rates more transparent and responsive." },
      { question: "If your loan EMI is ₹20,000 for 5 years on ₹10 lakh, how much total interest do you pay?", options: ["₹0", "₹1.2 lakhs", "₹2 lakhs", "₹5 lakhs"], correctIndex: 2, explanation: "Total payment = ₹20,000 × 60 = ₹12 lakhs. Interest = ₹12L - ₹10L principal = ₹2 lakhs." },
    ],
  },
  {
    order: 4, icon: "📈", riskLevel: "Medium", category: "Investment", xpReward: 100,
    title: "Investment Agreement",
    description: "Mutual funds, insurance, and investment terms",
    keyTerms: ["Lock-in periods and exit loads", "Expense ratios and fees", "Risk disclosure statements"],
    redFlags: ["High exit load", "Expense ratio > 1.5%", "No risk disclosure", "Lock-in not clearly stated"],
    studyContent: `# Investment Agreement Guide

## Mutual Fund Terms

### NAV (Net Asset Value)
- Price per unit of a mutual fund
- Calculated daily after market hours
- Buy/sell at NAV — not negotiable

### Expense Ratio
- Annual fee charged by fund house
- Deducted from NAV daily
- Index funds: ~0.1-0.2%
- Active funds: 0.5-2%
- Over 20 years, 1% extra expense ratio = 20% less corpus!

### Exit Load
- Fee for redeeming before specified period
- Typical: 1% if redeemed within 1 year
- ELSS: 3-year lock-in, no exit load after

### SIP Terms
- Minimum amount (usually ₹500-1000)
- SIP date flexibility
- Pause/stop options

## Insurance Investment Products

### ULIP (Unit Linked Insurance Plan)
- Combines insurance + investment
- High charges in early years (5-7%)
- 5-year lock-in
- Generally not recommended vs separate term + mutual fund

### Endowment Plans
- Low returns (4-6%)
- Long lock-in periods (10-20 years)
- Surrender value much lower than premiums paid
- Generally not recommended for investment

## What to Always Check
1. Expense ratio (lower = better)
2. Exit load and lock-in period
3. Fund manager track record
4. Benchmark comparison`,
    quiz: [
      { question: "What is a good expense ratio for an index fund?", options: ["2-3%", "1-1.5%", "0.1-0.2%", "5%"], correctIndex: 2, explanation: "Index funds should have very low expense ratios of 0.1-0.2% since they passively track an index with minimal management." },
      { question: "What is exit load?", options: ["Entry fee to invest", "Fee for early redemption", "Fund manager salary", "Tax on gains"], correctIndex: 1, explanation: "Exit load is a fee charged when you redeem mutual fund units before a specified period (usually 1 year)." },
      { question: "Why are ULIPs generally not recommended?", options: ["They are illegal", "High charges reduce returns significantly", "They don't provide insurance", "Only for rich people"], correctIndex: 1, explanation: "ULIPs have high charges in early years (5-7%), making them less efficient than buying term insurance + mutual funds separately." },
    ],
  },
];

const seed = async () => {
  await connectDB();
  await Agreement.deleteMany({});
  await Agreement.insertMany(agreements);
  console.log(`✅ Seeded ${agreements.length} agreements!`);
  process.exit(0);
};

seed().catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); });