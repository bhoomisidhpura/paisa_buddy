import { useEffect, useState } from "react";
import api from "../../api/axios";

const CATEGORY_COLORS = {
  Spending: "text-red-400", Investing: "text-green-400", Saving: "text-cyan-400",
  Debt: "text-orange-400", Insurance: "text-blue-400", Tax: "text-purple-400",
};

export default function SwipeDecisions() {
  const [card, setCard] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [swiping, setSwiping] = useState(false);
  const [finished, setFinished] = useState(false);
  const [animate, setAnimate] = useState("");

  const fetchNext = async () => {
    try {
      const res = await api.get("/swipe/next");
      if (res.data.data.finished) {
        setFinished(true);
        setCard(null);
      } else {
        setCard(res.data.data.card); // ← fixed: was res.data.data
        setFinished(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/swipe/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchNext(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSwipe = async (choice) => {
    if (!card || swiping) return;
    setSwiping(true);
    setAnimate(choice === "approve" ? "translate-x-20 opacity-0" : "-translate-x-20 opacity-0");

    try {
      const res = await api.post(`/swipe/${card._id}`, { choice });
      setResult(res.data.data);
      await fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setSwiping(false);
    }
  };

  const handleNext = async () => {
    setResult(null);
    setAnimate("");
    await fetchNext();
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="text-cyan-400 font-mono text-xl animate-pulse">Loading game...</span>
    </div>
  );

  const xpPercent = stats ? Math.min(100, Math.round(((stats.xp % 300) / 300) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Player Stats */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-cyan-400 font-mono font-bold text-sm tracking-widest">PLAYER STATS</span>
          <span className="text-yellow-400 font-mono font-bold">⚡ LVL {stats?.level || 1}</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div>
            <span className="text-yellow-400 font-mono font-bold text-xl">{stats?.xp || 0}</span>
            <span className="text-gray-500 font-mono text-xs ml-2">PAISA COINS</span>
          </div>
          {stats?.currentStreak > 0 && (
            <div className="text-orange-400 font-mono text-sm">🔥 {stats.currentStreak} streak</div>
          )}
        </div>
        <div className="flex items-center justify-between text-gray-500 font-mono text-xs mb-1">
          <span>EXPERIENCE</span>
          <span>{stats?.xp || 0}/300</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-cyan-500 rounded-full transition-all"
            style={{ width: `${xpPercent}%` }} />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-900 border border-blue-500 rounded flex items-center justify-center text-lg">📋</div>
        <div>
          <h1 className="text-white font-mono font-bold text-xl">Financial Literacy Game</h1>
          <p className="text-gray-400 font-mono text-xs">Swipe and learn smart money choices!</p>
        </div>
        {stats && (
          <div className="ml-auto text-right">
            <div className="text-green-400 font-mono text-sm">{stats.totalCorrect}/{stats.totalSwiped} correct</div>
            <div className="text-gray-500 font-mono text-xs">{stats.accuracy}% accuracy</div>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col items-center">
        {finished ? (
          <div className="bg-gray-900 border border-gray-800 rounded p-10 text-center max-w-md mt-10">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-white font-mono font-bold text-2xl mb-2">All Done!</h2>
            <p className="text-gray-400 font-mono text-sm mb-4">You've completed all swipe decisions!</p>
            <div className="text-cyan-400 font-mono text-lg">{stats?.accuracy}% accuracy</div>
            <div className="text-yellow-400 font-mono text-sm">Best streak: {stats?.bestStreak}</div>
          </div>
        ) : !card ? (
          <div className="text-gray-400 font-mono animate-pulse mt-20">Loading card...</div>
        ) : result ? (
          /* Result card */
          <div className={`max-w-md w-full bg-gray-900 border-2 rounded p-6 mt-8 ${result.isCorrect ? "border-green-500" : "border-red-500"}`}>
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">{result.isCorrect ? "✅" : "❌"}</div>
              <div className={`font-mono font-bold text-2xl ${result.isCorrect ? "text-green-400" : "text-red-400"}`}>
                {result.isCorrect ? "Correct!" : "Wrong!"}
              </div>
              {result.isCorrect && result.xpEarned > 0 && (
                <div className="text-yellow-400 font-mono text-sm mt-1">+{result.xpEarned} XP!</div>
              )}
              {result.streakBonus > 0 && (
                <div className="text-orange-400 font-mono text-xs">🔥 Streak bonus!</div>
              )}
            </div>

            <div className="bg-gray-800 rounded p-4 mb-4">
              <p className="text-gray-400 font-mono text-xs font-bold mb-1">CORRECT ANSWER: {result.correctChoice?.toUpperCase()}</p>
              <p className="text-gray-300 font-mono text-sm">{result.explanation}</p>
            </div>

            {result.tip && (
              <div className="bg-cyan-950 border border-cyan-700 rounded p-3 mb-4">
                <p className="text-cyan-400 font-mono text-xs font-bold mb-1">💡 TIP:</p>
                <p className="text-gray-300 font-mono text-xs">{result.tip}</p>
              </div>
            )}

            <button onClick={handleNext}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold py-3 rounded transition-colors">
              Next Card →
            </button>
          </div>
        ) : (
          /* Swipe card */
          <div className={`max-w-md w-full mt-8 transition-all duration-300 ${animate}`}>
            <div className="bg-gray-900 border-2 border-cyan-700 rounded p-8 text-center"
              style={{ boxShadow: "0 0 20px rgba(6,182,212,0.2)" }}>
              <div className="text-5xl mb-4">{card.icon}</div>
              <div className={`font-mono text-xs font-bold mb-2 ${CATEGORY_COLORS[card.category] || "text-gray-400"}`}>
                {card.category} · {card.difficulty}
              </div>
              <h2 className="text-white font-mono font-bold text-xl mb-4">{card.title}</h2>
              <p className="text-gray-300 font-mono text-sm leading-relaxed mb-8">{card.scenario}</p>

              <div className="flex items-center justify-center gap-8">
                {/* Reject */}
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => handleSwipe("reject")} disabled={swiping}
                    className="w-16 h-16 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
                    style={{ boxShadow: "0 4px 0 #991b1b" }}>
                    ✕
                  </button>
                  <span className="text-red-400 font-mono text-xs">REJECT</span>
                </div>

                {/* Approve */}
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => handleSwipe("approve")} disabled={swiping}
                    className="w-16 h-16 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
                    style={{ boxShadow: "0 4px 0 #0e7490" }}>
                    ♥
                  </button>
                  <span className="text-cyan-400 font-mono text-xs">APPROVE</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}