import { useEffect, useState } from "react";
import api from "../../api/axios";

const VERDICT_STYLES = {
  FRAUD: { border: "border-red-500", bg: "bg-red-950", text: "text-red-400", icon: "🚨" },
  SUSPICIOUS: { border: "border-yellow-500", bg: "bg-yellow-950", text: "text-yellow-400", icon: "⚠️" },
  SAFE: { border: "border-green-500", bg: "bg-green-950", text: "text-green-400", icon: "✅" },
};

const SAMPLE_MESSAGES = [
  "Your SBI account will be blocked. Update KYC at http://sbi-kyc.xyz now!",
  "Congratulations! You won ₹50,000 lottery. Pay ₹500 processing fee to claim.",
  "Hi, this is your bank. Please share your OTP to verify your account.",
  "Hey, are we still meeting for lunch tomorrow at 1pm?",
];

export default function FraudDetection() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/fraud-detection/history");
        setHistory(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleScan = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/fraud-detection/scan", { message });
      setResult(res.data.data);
      const histRes = await api.get("/fraud-detection/history");
      setHistory(histRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const style = result ? VERDICT_STYLES[result.verdict] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 bg-orange-900 border border-orange-500 rounded flex items-center justify-center text-lg">🔍</div>
        <div>
          <h1 className="text-white font-mono font-bold text-base md:text-xl">Fraud Detection Scanner</h1>
          <p className="text-gray-400 font-mono text-xs hidden sm:block">Paste any suspicious message to check if it's a scam</p>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-3xl mx-auto">
        {/* Scanner */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-6">
          <h2 className="text-white font-mono font-bold text-base md:text-lg mb-4">🔍 Scan a Message</h2>

          <label className="text-gray-400 font-mono text-xs mb-2 block">PASTE YOUR MESSAGE:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type or paste any suspicious message here..."
            rows={4}
            className="w-full bg-gray-800 border border-gray-600 text-white font-mono text-sm px-3 md:px-4 py-3 rounded focus:outline-none focus:border-cyan-400 transition-colors resize-none mb-4"
          />

          {/* Sample messages */}
          <div className="mb-4">
            <p className="text-gray-500 font-mono text-xs mb-2">Try a sample:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_MESSAGES.map((s, i) => (
                <button key={i} onClick={() => setMessage(s)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white font-mono text-xs px-3 py-1 rounded border border-gray-700 transition-colors">
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleScan} disabled={loading || !message.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-mono font-bold py-3 rounded transition-colors"
            style={{ boxShadow: (!loading && message.trim()) ? "2px 2px 0px #0891b2" : "none" }}>
            {loading ? "🔍 Scanning..." : "🔍 Check Fraud"}
          </button>
        </div>

        {/* Result */}
        {result && style && (
          <div className={`border-2 ${style.border} ${style.bg} rounded p-4 md:p-6`}>
            {/* Verdict header — stacks on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl">{style.icon}</span>
                <div>
                  <div className={`font-mono font-bold text-xl md:text-2xl ${style.text}`}>{result.verdict}</div>
                  <div className="text-gray-400 font-mono text-xs">Risk Level: {result.riskLevel}</div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                <div className={`font-mono font-bold text-2xl md:text-3xl ${style.text}`}>{result.confidence}%</div>
                <div className="text-gray-400 font-mono text-xs">Confidence</div>
              </div>
            </div>

            {result.fraudType && (
              <div className="bg-gray-900 rounded px-3 py-1 inline-block mb-3">
                <span className="text-yellow-400 font-mono text-xs md:text-sm">Type: {result.fraudType}</span>
              </div>
            )}

            <p className="text-gray-200 font-mono text-xs md:text-sm mb-4 leading-relaxed">{result.explanation}</p>

            {result.redFlags?.length > 0 && (
              <div className="mb-4">
                <p className="text-red-400 font-mono text-xs font-bold mb-2">🚩 RED FLAGS:</p>
                <ul className="space-y-1">
                  {result.redFlags.map((flag, i) => (
                    <li key={i} className="text-gray-300 font-mono text-xs flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">•</span> {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-700 rounded p-3">
              <p className="text-cyan-400 font-mono text-xs font-bold mb-1">💡 WHAT TO DO:</p>
              <p className="text-gray-300 font-mono text-xs">{result.advice}</p>
            </div>
          </div>
        )}

        {/* Scan History */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5">
          <h2 className="text-white font-mono font-bold text-base md:text-lg mb-4">📋 Recent Scans</h2>
          {historyLoading ? (
            <div className="text-gray-500 font-mono text-sm animate-pulse">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-gray-500 font-mono text-sm">No scans yet — scan your first message above!</div>
          ) : (
            <div className="space-y-2">
              {history.map((scan) => {
                const s = VERDICT_STYLES[scan.verdict];
                return (
                  <div key={scan._id} className={`border ${s.border} rounded p-3 flex items-center justify-between gap-2`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 font-mono text-xs truncate">{scan.message}</p>
                      <p className="text-gray-600 font-mono text-xs">{new Date(scan.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold ${s.text}`}>{scan.verdict}</span>
                      <span className="text-gray-500 font-mono text-xs">{scan.confidence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}