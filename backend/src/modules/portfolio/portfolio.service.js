import { Portfolio } from "./portfolio.model.js";
import { rewardUser } from "../gamification/gamification.service.js";

const INVESTOR_XP_PER_LEVEL = 250;

// --- Master stock list with base prices ---
const BASE_STOCKS = [
  { symbol: "TCS",      name: "Tata Consultancy Services", basePrice: 3425  },
  { symbol: "INFY",     name: "Infosys",                   basePrice: 1650  },
  { symbol: "RIL",      name: "Reliance Industries",       basePrice: 2890  },
  { symbol: "HDFCBANK", name: "HDFC Bank",                 basePrice: 1680  },
  { symbol: "ITC",      name: "ITC Limited",               basePrice: 445   },
  { symbol: "WIPRO",    name: "Wipro",                     basePrice: 520   },
  { symbol: "SBIN",     name: "State Bank of India",       basePrice: 780   },
  { symbol: "BAJFINANCE",name: "Bajaj Finance",            basePrice: 6800  },
  { symbol: "MARUTI",   name: "Maruti Suzuki",             basePrice: 10500 },
  { symbol: "TATAMOTORS",name: "Tata Motors",              basePrice: 920   },
  { symbol: "ADANIENT", name: "Adani Enterprises",         basePrice: 2450  },
  { symbol: "HCLTECH",  name: "HCL Technologies",          basePrice: 1380  },
];

// --- Add random fluctuation ±3% to simulate live prices ---
const getFluctuatedPrice = (basePrice) => {
  const fluctuation = (Math.random() - 0.5) * 0.06; // ±3%
  const price = basePrice * (1 + fluctuation);
  return Math.round(price * 100) / 100;
};

// --- Get all available stocks with current mock prices ---
export const getAvailableStocks = () => {
  return BASE_STOCKS.map((stock) => {
    const currentPrice = getFluctuatedPrice(stock.basePrice);
    const change = currentPrice - stock.basePrice;
    const changePercent = ((change / stock.basePrice) * 100).toFixed(2);
    return {
      symbol: stock.symbol,
      name: stock.name,
      currentPrice,
      change: Math.round(change * 100) / 100,
      changePercent: parseFloat(changePercent),
    };
  });
};

// --- Get or create portfolio ---
export const getOrCreatePortfolio = async (userId) => {
  let portfolio = await Portfolio.findOne({ user: userId });
  if (!portfolio) {
    portfolio = await Portfolio.create({ user: userId });
  }
  return portfolio;
};

// --- Get portfolio with live P&L ---
export const getPortfolioData = async (userId) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const stockPrices = getAvailableStocks();
  const priceMap = {};
  stockPrices.forEach((s) => (priceMap[s.symbol] = s));

  let portfolioValue = 0;
  let totalInvested = 0;

  const holdings = portfolio.holdings
    .filter((h) => h.quantity > 0)
    .map((h) => {
      const stock = priceMap[h.symbol];
      const currentPrice = stock ? stock.currentPrice : h.avgBuyPrice;
      const currentValue = currentPrice * h.quantity;
      const invested = h.avgBuyPrice * h.quantity;
      const profit = currentValue - invested;
      const profitPercent = ((profit / invested) * 100).toFixed(2);

      portfolioValue += currentValue;
      totalInvested += invested;

      return {
        symbol: h.symbol,
        name: h.name,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice,
        currentValue: Math.round(currentValue),
        profit: Math.round(profit),
        profitPercent: parseFloat(profitPercent),
        changePercent: stock ? stock.changePercent : 0,
      };
    });

  const totalProfit = portfolioValue - totalInvested;

  return {
    virtualBalance: portfolio.virtualBalance,
    portfolioValue: Math.round(portfolioValue),
    totalInvested: Math.round(totalInvested),
    totalProfit: Math.round(totalProfit),
    profitPercent:
      totalInvested > 0
        ? parseFloat(((totalProfit / totalInvested) * 100).toFixed(2))
        : 0,
    investorLevel: portfolio.investorLevel,
    investorXp: portfolio.investorXp,
    xpToNextLevel:
      portfolio.investorLevel * INVESTOR_XP_PER_LEVEL - portfolio.investorXp,
    holdings,
    availableStocks: stockPrices,
  };
};

// --- Buy stock ---
export const buyStock = async (userId, symbol, quantity) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const stocks = getAvailableStocks();
  const stock = stocks.find((s) => s.symbol === symbol);

  if (!stock) throw new Error("Stock not found");
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");

  const totalCost = stock.currentPrice * quantity;
  if (portfolio.virtualBalance < totalCost) {
    throw new Error(
      `Insufficient balance. Need ₹${totalCost.toFixed(0)}, have ₹${portfolio.virtualBalance.toFixed(0)}`
    );
  }

  // Deduct balance
  portfolio.virtualBalance -= totalCost;

  // Update or add holding
  const existingHolding = portfolio.holdings.find((h) => h.symbol === symbol);
  if (existingHolding) {
    // Recalculate average buy price
    const totalQty = existingHolding.quantity + quantity;
    const totalValue =
      existingHolding.avgBuyPrice * existingHolding.quantity +
      stock.currentPrice * quantity;
    existingHolding.avgBuyPrice = Math.round((totalValue / totalQty) * 100) / 100;
    existingHolding.quantity = totalQty;
  } else {
    portfolio.holdings.push({
      symbol: stock.symbol,
      name: stock.name,
      quantity,
      avgBuyPrice: stock.currentPrice,
    });
  }

  // Update investor XP
  portfolio.investorXp += 50;
  const newInvestorLevel = Math.floor(portfolio.investorXp / INVESTOR_XP_PER_LEVEL) + 1;
  portfolio.investorLevel = newInvestorLevel;

  await portfolio.save();

  // Reward gamification
  await rewardUser(userId, "TRADE_EXECUTED", "tradesExecuted");

  return {
    message: `Bought ${quantity} shares of ${symbol} at ₹${stock.currentPrice}`,
    totalCost: Math.round(totalCost),
    newBalance: Math.round(portfolio.virtualBalance),
    investorLevel: portfolio.investorLevel,
  };
};

// --- Sell stock ---
export const sellStock = async (userId, symbol, quantity) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const stocks = getAvailableStocks();
  const stock = stocks.find((s) => s.symbol === symbol);

  if (!stock) throw new Error("Stock not found");
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");

  const holding = portfolio.holdings.find((h) => h.symbol === symbol);
  if (!holding || holding.quantity < quantity) {
    throw new Error(
      `Insufficient shares. You own ${holding ? holding.quantity : 0} shares of ${symbol}`
    );
  }

  const saleValue = stock.currentPrice * quantity;
  const profit = (stock.currentPrice - holding.avgBuyPrice) * quantity;

  // Update balance and holding
  portfolio.virtualBalance += saleValue;
  holding.quantity -= quantity;

  // Update investor XP
  portfolio.investorXp += 30;
  const newInvestorLevel = Math.floor(portfolio.investorXp / INVESTOR_XP_PER_LEVEL) + 1;
  portfolio.investorLevel = newInvestorLevel;

  await portfolio.save();

  // Reward gamification
  await rewardUser(userId, "TRADE_EXECUTED", "tradesExecuted");

  return {
    message: `Sold ${quantity} shares of ${symbol} at ₹${stock.currentPrice}`,
    saleValue: Math.round(saleValue),
    profit: Math.round(profit),
    newBalance: Math.round(portfolio.virtualBalance),
  };
};