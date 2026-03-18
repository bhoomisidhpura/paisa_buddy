import { useEffect, useState } from "react";
import api from "../../api/axios";

const RISK_COLORS = {
  Low: "bg-green-900 text-green-400 border border-green-700",
  Medium: "bg-yellow-900 text-yellow-400 border border-yellow-700",
  High: "bg-red-900 text-red-400 border border-red-700",
};

const SCORE_RANGES = [
  { range: "800-900", label: "Excellent", color: "text-green-400", dot: "bg-green-400" },
  { range: "750-799", label: "Very Good", color: "text-cyan-400", dot: "bg-cyan-400" },
  { range: "700-749", label: "Good", color: "text-yellow-400", dot: "bg-yellow-400" },
  { range: "650-699", label: "Fair", color: "text-orange-400", dot: "bg-orange-400" },
  { range: "300-649", label: "Poor", color: "text-red-400", dot: "bg-red-400" },
];

export default function Loans() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoreInput, setScoreInput] = useState("");
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [emiForm, setEmiForm] = useState({ loanType: "home", principal: "", interestRate: "", tenureMonths: "" });
  const [emiResult, setEmiResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/loans");
      setDashboard(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const flash = (m, isError = false) => {
    if (isError) setError(m); else setMsg(m);
    setTimeout(() => { setMsg(""); setError(""); }, 3000);
  };

  const handleSetScore = async () => {
    const score = parseInt(scoreInput);
    if (!scoreInput || isNaN(score)) {
      flash("Please enter a credit score", true);
      return;
    }
    if (score < 300 || score > 900) {
      flash("CIBIL score must be between 300 and 900", true);
      return;
    }
    try {
      await api.put("/loans/credit-score", { score });
      flash("✅ Credit score updated!");
      setShowScoreForm(false);
      fetchDashboard();
    } catch (err) {
      flash(err.response?.data?.message || "Failed", true);
    }
  };

  const handleEMI = async () => {
    const principal = parseFloat(emiForm.principal);
    const rate = parseFloat(emiForm.interestRate);
    const tenure = parseInt(emiForm.tenureMonths);
    if (!principal || principal < 1000) {
      flash("Principal must be at least ₹1,000", true);
      return;
    }
    if (!rate || rate <= 0 || rate > 50) {
      flash("Interest rate must be between 0.1% and 50%", true);
      return;
    }
    if (!tenure || tenure < 1 || tenure > 360) {
      flash("Tenure must be between 1 and 360 months", true);
      return;
    }
    try {
      const res = await api.post("/loans/emi-calculator", { ...emiForm, principal, interestRate: rate, tenureMonths: tenure, save: true });
      setEmiResult(res.data.data);
    } catch (err) {
      flash("Calculation failed", true);
    }
  };

  // Score input validation
  const scoreNum = parseInt(scoreInput);
  const scoreError = scoreInput && (isNaN(scoreNum) || scoreNum < 300 || scoreNum > 900);

  // EMI field validation helpers
  const emiErrors = {
    principal: emiForm.principal && parseFloat(emiForm.principal) < 1000 ? "Min ₹1,000" : "",
    interestRate: emiForm.interestRate && (parseFloat(emiForm.interestRate) <= 0 || parseFloat(emiForm.interestRate) > 50) ? "0.1%–50%" : "",
    tenureMonths: emiForm.tenureMonths && (parseInt(emiForm.tenureMonths) < 1 || parseInt(emiForm.tenureMonths) > 360) ? "1–360 months" : "",
  };
  const emiValid = emiForm.principal && emiForm.interestRate && emiForm.tenureMonths && !Object.values(emiErrors).some(Boolean);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="text-cyan-400 font-mono text-xl animate-pulse">Loading loans dashboard...</span>
    </div>
  );

  const rating = dashboard?.rating;
  const xpPercent = dashboard ? Math.min(100, Math.round(((dashboard.xp % 300) / 300) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 bg-yellow-900 border border-yellow-500 rounded flex items-center justify-center text-lg">$</div>
        <div>
          <h1 className="text-white font-mono font-bold text-base md:text-xl">Loans & Credit Mastery</h1>
          <p className="text-gray-400 font-mono text-xs hidden sm:block">Smart borrowing for financial success</p>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="flex justify-between text-gray-400 font-mono text-xs md:text-sm mb-2">
            <span>Level {dashboard?.level} Credit Expert</span>
            <span>{dashboard?.xp}/{dashboard?.level * 300}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%`, boxShadow: "0 0 8px #22c55e" }} />
          </div>
        </div>

        {msg && <div className="bg-green-950 border border-green-500 text-green-400 font-mono text-sm p-3 rounded">{msg}</div>}
        {error && <div className="bg-red-950 border border-red-500 text-red-400 font-mono text-sm p-3 rounded">⚠ {error}</div>}

        {/* Credit Health */}
        <div className="bg-gray-900 border-2 border-cyan-700 rounded p-4 md:p-6">
          <h2 className="text-white font-mono font-bold text-base md:text-lg mb-4 flex items-center gap-2">
            <span className="text-cyan-400">~</span> Your Credit Health Dashboard
          </h2>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <p className="text-gray-400 font-mono text-xs mb-2">Credit Score</p>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex-1">
                  <input type="number"
                    value={showScoreForm ? scoreInput : (dashboard?.creditScore || "")}
                    onChange={e => setScoreInput(e.target.value)}
                    onClick={() => setShowScoreForm(true)}
                    placeholder="Enter score (300-900)"
                    min="300" max="900"
                    className={`w-full bg-gray-800 border text-white font-mono text-base md:text-lg px-3 md:px-4 py-2 rounded focus:outline-none transition-colors ${
                      scoreError ? "border-red-500 focus:border-red-400" : "border-gray-600 focus:border-cyan-400"
                    }`} />
                  {scoreError && (
                    <p className="text-red-400 font-mono text-xs mt-1">⚠ Score must be between 300 and 900</p>
                  )}
                </div>
                {showScoreForm && (
                  <button onClick={handleSetScore} disabled={!!scoreError}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-mono font-bold px-4 py-2 rounded transition-colors shrink-0">
                    Save
                  </button>
                )}
              </div>
              {rating && (
                <>
                  <p className="text-gray-400 font-mono text-xs mb-2 mt-3">Benefits at Your Score:</p>
                  <ul className="space-y-1">
                    {rating.benefits?.map((b, i) => (
                      <li key={i} className="text-gray-300 font-mono text-xs flex items-center gap-2">
                        <span className="text-cyan-400">•</span> {b}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="md:text-right md:ml-6">
              {dashboard?.creditScore > 0 && (
                <>
                  <div className={`font-mono font-bold text-4xl md:text-5xl mb-1 ${
                    rating?.color === "green" ? "text-green-400" :
                    rating?.color === "blue" ? "text-cyan-400" :
                    rating?.color === "yellow" ? "text-yellow-400" :
                    rating?.color === "orange" ? "text-orange-400" : "text-red-400"
                  }`}>{dashboard.creditScore}</div>
                  <div className={`inline-block font-mono text-sm px-3 py-1 rounded border ${RISK_COLORS[rating?.color === "green" || rating?.color === "blue" ? "Low" : rating?.color === "yellow" ? "Medium" : "High"]}`}>
                    {rating?.rating}
                  </div>
                </>
              )}
              <div className="mt-4">
                <p className="text-gray-500 font-mono text-xs mb-2">Score Ranges:</p>
                {SCORE_RANGES.map(({ range, label, color, dot }) => (
                  <div key={range} className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    <span className={`font-mono text-xs ${color}`}>{range} – {label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loan Types */}
        <div>
          <h2 className="text-white font-mono font-bold text-lg md:text-xl mb-4 flex items-center gap-2">
            <span className="text-yellow-400">$</span> Loan Types & Smart Choices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboard?.loanTypes?.map((loan) => (
              <div key={loan.id} className="bg-gray-900 border border-gray-800 rounded p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl shrink-0">{loan.icon}</span>
                    <div className="min-w-0">
                      <h3 className="text-white font-mono font-bold text-sm">{loan.name}</h3>
                      <p className="text-gray-400 font-mono text-xs truncate">{loan.description}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded shrink-0 ml-2 ${RISK_COLORS[loan.riskLevel]}`}>{loan.riskLevel}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-mono text-xs mb-2">
                  <span>Interest<br /><span className="text-white">{loan.interestRateMin}-{loan.interestRateMax}%</span></span>
                  {loan.maxTenureYears && <span>Tenure<br /><span className="text-white">{loan.maxTenureYears} yrs</span></span>}
                </div>
                {loan.warning && (
                  <div className="bg-red-950 border border-red-700 rounded px-3 py-2 text-red-400 font-mono text-xs flex items-center gap-1 mb-2">
                    <span>△</span> {loan.warning}
                  </div>
                )}
                {loan.tips && (
                  <ul className="space-y-1">
                    {loan.tips.slice(0, 2).map((tip, i) => (
                      <li key={i} className="text-gray-500 font-mono text-xs flex items-start gap-1">
                        <span className="text-green-400 mt-0.5 shrink-0">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* EMI Calculator */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-6">
          <h2 className="text-white font-mono font-bold text-lg md:text-xl mb-4 flex items-center gap-2">
            <span className="text-cyan-400">⊙</span> EMI Calculator
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-gray-400 font-mono text-xs mb-1 block">Loan Type</label>
              <select value={emiForm.loanType} onChange={e => setEmiForm(p => ({ ...p, loanType: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 text-white font-mono text-sm px-3 py-2 rounded focus:outline-none focus:border-cyan-400">
                {dashboard?.loanTypes?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 font-mono text-xs mb-1 block">Principal (₹)</label>
              <input type="number" value={emiForm.principal} onChange={e => setEmiForm(p => ({ ...p, principal: e.target.value }))}
                placeholder="1000000" min="1000"
                className={`w-full bg-gray-800 border text-white font-mono text-sm px-3 py-2 rounded focus:outline-none transition-colors ${emiErrors.principal ? "border-red-500" : "border-gray-600 focus:border-cyan-400"}`} />
              {emiErrors.principal && <p className="text-red-400 font-mono text-xs mt-1">⚠ {emiErrors.principal}</p>}
            </div>
            <div>
              <label className="text-gray-400 font-mono text-xs mb-1 block">Interest Rate (%)</label>
              <input type="number" value={emiForm.interestRate} onChange={e => setEmiForm(p => ({ ...p, interestRate: e.target.value }))}
                placeholder="8.5" step="0.1" min="0.1" max="50"
                className={`w-full bg-gray-800 border text-white font-mono text-sm px-3 py-2 rounded focus:outline-none transition-colors ${emiErrors.interestRate ? "border-red-500" : "border-gray-600 focus:border-cyan-400"}`} />
              {emiErrors.interestRate && <p className="text-red-400 font-mono text-xs mt-1">⚠ {emiErrors.interestRate}</p>}
            </div>
            <div>
              <label className="text-gray-400 font-mono text-xs mb-1 block">Tenure (months)</label>
              <input type="number" value={emiForm.tenureMonths} onChange={e => setEmiForm(p => ({ ...p, tenureMonths: e.target.value }))}
                placeholder="240" min="1" max="360"
                className={`w-full bg-gray-800 border text-white font-mono text-sm px-3 py-2 rounded focus:outline-none transition-colors ${emiErrors.tenureMonths ? "border-red-500" : "border-gray-600 focus:border-cyan-400"}`} />
              {emiErrors.tenureMonths && <p className="text-red-400 font-mono text-xs mt-1">⚠ {emiErrors.tenureMonths}</p>}
            </div>
          </div>

          <button onClick={handleEMI} disabled={!emiValid}
            className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-mono font-bold px-6 py-3 rounded transition-colors mb-4">
            Calculate EMI
          </button>

          {emiResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 bg-gray-800 rounded p-4">
              {[
                { label: "Monthly EMI", value: `₹${emiResult.emi?.toLocaleString()}`, color: "text-cyan-400" },
                { label: "Total Payment", value: `₹${emiResult.totalPayment?.toLocaleString()}`, color: "text-yellow-400" },
                { label: "Total Interest", value: `₹${emiResult.totalInterest?.toLocaleString()}`, color: "text-red-400" },
                { label: "Interest %", value: `${emiResult.interestPercent}%`, color: "text-purple-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className={`font-mono font-bold text-lg md:text-xl ${color}`}>{value}</div>
                  <div className="text-gray-500 font-mono text-xs">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}