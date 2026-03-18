import { useEffect, useState } from "react";
import api from "../../api/axios";

const INVESTMENT_TIPS = [
  "Diversify your portfolio across different sectors to reduce risk. Try investing in both equity and debt instruments!",
  "Start SIPs early — even ₹500/month compounded over 20 years becomes a significant corpus.",
  "Never invest money you can't afford to lose. Keep 6 months expenses as emergency fund first.",
  "Blue-chip stocks like TCS and Infosys are safer for beginners than small-cap stocks.",
];

const FALLBACK_STOCKS = [
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3425 },
  { symbol: "INFY", name: "Infosys", price: 1650 },
  { symbol: "RIL", name: "Reliance Industries", price: 2890 },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1680 },
  { symbol: "ITC", name: "ITC Limited", price: 445 },
];

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyQty, setBuyQty] = useState({});
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");
  const [stocks, setStocks] = useState([]);

  const tip = INVESTMENT_TIPS[Math.floor(Math.random() * INVESTMENT_TIPS.length)];

  const fetchPortfolio = async () => {
    try {
      const res = await api.get("/portfolio");
      const data = res.data?.data;
      setPortfolio(data);
      const apiStocks = data?.availableStocks || [];
      if (apiStocks.length > 0) {
        setStocks(apiStocks.map((s) => {
          const initialPrice = s.currentPrice ?? s.price ?? 0;
          return { symbol: s.symbol, name: s.name, price: Number(initialPrice) || 0, prevPrice: Number(initialPrice) || 0 };
        }));
      } else if (!stocks.length) {
        setStocks(FALLBACK_STOCKS.map((s) => ({ ...s, prevPrice: s.price })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  useEffect(() => {
    if (!stocks.length) return;
    const interval = setInterval(() => {
      setStocks((prev) => prev.map((stock) => {
        const changePercent = Math.random() * 0.04 - 0.02;
        const newPrice = Math.max(0, Number((stock.price * (1 + changePercent)).toFixed(2)));
        return { ...stock, prevPrice: stock.price, price: newPrice };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [stocks.length]);

  const handleBuy = async (symbol) => {
    const qty = parseInt(buyQty[symbol] || 1);
    // Validation
    if (!qty || qty < 1) {
      setActionError("Quantity must be at least 1");
      setActionMsg("");
      setTimeout(() => setActionError(""), 3000);
      return;
    }
    if (qty > 1000) {
      setActionError("Cannot buy more than 1000 shares at once");
      setActionMsg("");
      setTimeout(() => setActionError(""), 3000);
      return;
    }
    try {
      await api.post("/portfolio/buy", { symbol, quantity: qty });
      setActionMsg(`✅ Bought ${qty} share(s) of ${symbol}!`);
      setActionError("");
      setBuyQty((prev) => ({ ...prev, [symbol]: "" }));
      fetchPortfolio();
    } catch (err) {
      setActionError(err.response?.data?.message || "Buy failed");
      setActionMsg("");
    }
    setTimeout(() => { setActionMsg(""); setActionError(""); }, 3000);
  };

  const handleSell = async (symbol) => {
    try {
      await api.post("/portfolio/sell", { symbol, quantity: 1 });
      setActionMsg(`✅ Sold 1 share of ${symbol}!`);
      setActionError("");
      fetchPortfolio();
    } catch (err) {
      setActionError(err.response?.data?.message || "Sell failed");
      setActionMsg("");
    }
    setTimeout(() => { setActionMsg(""); setActionError(""); }, 3000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="text-cyan-400 font-mono text-xl animate-pulse">Loading portfolio...</span>
    </div>
  );

  let totalInvested = 0;
  let totalCurrentValue = 0;

  const holdingsWithLive = (portfolio?.holdings || []).map((h) => {
    const livePrice = stocks.find((s) => s.symbol === h.symbol)?.price ?? h.currentPrice ?? h.avgBuyPrice;
    const investmentValue = (h.avgBuyPrice || 0) * (h.quantity || 0);
    const currentValue = (livePrice || 0) * (h.quantity || 0);
    const pnl = currentValue - investmentValue;
    const pnlPct = h.avgBuyPrice && h.avgBuyPrice !== 0 ? ((livePrice - h.avgBuyPrice) / h.avgBuyPrice) * 100 : 0;
    const isProfit = pnl >= 0;
    totalInvested += investmentValue;
    totalCurrentValue += currentValue;
    return { ...h, livePrice, investmentValue, currentValue, pnl, pnlPct, isProfit };
  });

  const totalProfit = totalCurrentValue - totalInvested;
  const xpPercent = portfolio
    ? Math.min(100, Math.round((portfolio.investorXp / (portfolio.investorLevel > 0 ? portfolio.investorLevel * 250 : 250)) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 bg-cyan-900 border border-cyan-500 rounded flex items-center justify-center text-cyan-400 font-mono font-bold">📈</div>
          <div className="min-w-0">
            <h1 className="text-white font-mono font-bold text-base md:text-xl truncate">Virtual Portfolio</h1>
            <p className="text-gray-400 font-mono text-xs hidden sm:block">Learn investing without real risk!</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-yellow-400 font-mono font-bold text-lg md:text-2xl">⊙ ₹{portfolio?.virtualBalance?.toLocaleString()}</div>
          <div className="text-gray-400 font-mono text-xs">Virtual Balance</div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Investor Level */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="flex justify-between text-gray-400 font-mono text-xs md:text-sm mb-2">
            <span>Level {portfolio?.investorLevel} Investor</span>
            <span>{portfolio?.investorXp}/{portfolio?.investorLevel * 250}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%`, boxShadow: "0 0 8px #22c55e" }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5 flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-2">
            <div className="text-gray-500 font-mono text-xs sm:mb-1">Portfolio Value</div>
            <div className="text-cyan-400 font-mono font-bold text-xl md:text-2xl">₹{Math.round(totalCurrentValue || 0).toLocaleString()}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5 flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-2">
            <div className="text-gray-500 font-mono text-xs sm:mb-1">Total Invested</div>
            <div className="text-purple-400 font-mono font-bold text-xl md:text-2xl">₹{Math.round(totalInvested || 0).toLocaleString()}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5 flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-2">
            <div className="text-gray-500 font-mono text-xs sm:mb-1">Profit/Loss</div>
            <div className={`font-mono font-bold text-xl md:text-2xl ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalProfit >= 0 ? "↑" : "↓"} ₹{Math.abs(Math.round(totalProfit || 0)).toLocaleString()}
            </div>
          </div>
        </div>

        {actionMsg && <div className="bg-green-950 border border-green-500 text-green-400 font-mono text-sm p-3 rounded">{actionMsg}</div>}
        {actionError && <div className="bg-red-950 border border-red-500 text-red-400 font-mono text-sm p-3 rounded">⚠ {actionError}</div>}

        {/* Investment Tip */}
        <div className="border-2 border-green-600 bg-green-950 rounded p-4">
          <p className="text-green-400 font-mono text-sm font-bold mb-1">⚡ Investment Tip!</p>
          <p className="text-green-300 font-mono text-xs md:text-sm">{tip}</p>
        </div>

        {/* Holdings */}
        {holdingsWithLive.length > 0 && (
          <div>
            <h2 className="text-white font-mono font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-cyan-400">⊙</span> Your Holdings
            </h2>
            <div className="space-y-2">
              {holdingsWithLive.map((h) => {
                const pctDisplay = Number.isFinite(h.pnlPct) ? Math.abs(h.pnlPct).toFixed(2) : "0.00";
                const profitColor = h.isProfit ? "text-green-400" : "text-red-400";
                const profitSign = h.isProfit ? "+" : "-";
                const absPnl = Math.abs(Math.round(h.pnl || 0));
                return (
                  <div key={h.symbol}
                    className={`rounded p-3 md:p-4 border transition-colors duration-150 ${h.isProfit ? "bg-green-900/20 border-green-600" : "bg-red-900/20 border-red-600"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-white font-mono font-bold text-sm md:text-base">{h.name}</div>
                        <div className="text-gray-500 font-mono text-xs">{h.symbol}</div>
                      </div>
                      <button onClick={() => handleSell(h.symbol)}
                        className="bg-red-700 hover:bg-red-600 text-white font-mono text-xs px-3 py-1.5 rounded transition-colors shrink-0 ml-2">
                        Sell 1
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                      <div>
                        <div className="text-gray-500 font-mono text-xs mb-0.5">Live Price</div>
                        <div className="text-white font-mono">₹{h.livePrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className={`font-mono text-xs ${h.isProfit ? "text-green-400" : "text-red-400"}`}>{h.isProfit ? "↑" : "↓"} {pctDisplay}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-mono text-xs mb-0.5">Qty / Avg</div>
                        <div className="text-gray-300 font-mono">x{h.quantity}</div>
                        <div className="text-gray-500 font-mono text-xs">₹{h.avgBuyPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500 font-mono text-xs mb-0.5">P&L</div>
                        <div className="text-white font-mono">₹{Math.round(h.currentValue || 0).toLocaleString()}</div>
                        <div className={`font-mono text-xs ${profitColor}`}>{profitSign}₹{absPnl}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Stocks */}
        <div>
          <h2 className="text-white font-mono font-bold text-lg mb-3 flex items-center gap-2">
            <span className="text-yellow-400">$</span> Available Stocks
          </h2>
          <div className="space-y-2">
            {stocks.map((stock) => {
              const prev = stock.prevPrice ?? stock.price;
              const isUp = stock.price > prev;
              const isDown = stock.price < prev;
              const arrow = isUp ? "↑" : isDown ? "↓" : "→";
              const colorClass = isUp ? "text-green-400" : isDown ? "text-red-400" : "text-gray-300";
              const qtyVal = buyQty[stock.symbol] || "";
              const qtyNum = parseInt(qtyVal);
              const qtyError = qtyVal && (isNaN(qtyNum) || qtyNum < 1 || qtyNum > 1000);
              return (
                <div key={stock.symbol}
                  className={`bg-gray-900 border border-gray-800 rounded p-3 md:p-4 transition-all duration-500 ${isUp ? "bg-green-900/30" : isDown ? "bg-red-900/30" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-mono font-bold text-sm truncate">{stock.name}</div>
                      <div className="text-gray-500 font-mono text-xs">{stock.symbol}</div>
                    </div>
                    <div className={`font-mono text-sm transition-colors duration-500 ${colorClass} shrink-0`}>
                      {arrow} ₹{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-2">
                        <input type="number" min="1" max="1000"
                          value={qtyVal}
                          onChange={(e) => setBuyQty((prev) => ({ ...prev, [stock.symbol]: e.target.value }))}
                          placeholder="Qty"
                          className={`w-14 bg-gray-800 border text-white font-mono text-sm px-2 py-1.5 rounded text-center focus:outline-none ${qtyError ? "border-red-500" : "border-gray-600 focus:border-cyan-400"}`} />
                        <button onClick={() => handleBuy(stock.symbol)}
                          disabled={qtyError}
                          className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-mono text-sm px-3 py-1.5 rounded transition-colors">
                          Buy
                        </button>
                      </div>
                      {qtyError && <p className="text-red-400 font-mono text-xs">1–1000 only</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}