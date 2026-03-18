import { useEffect, useState } from "react";
import api from "../../api/axios";

const DIFFICULTY_COLORS = {
  Easy: "bg-green-900 text-green-400 border border-green-700",
  Medium: "bg-yellow-900 text-yellow-400 border border-yellow-700",
  Hard: "bg-red-900 text-red-400 border border-red-700",
};

export default function FraudAwareness() {
  const [profile, setProfile] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      const [profileRes, scenariosRes, leaderboardRes] = await Promise.all([
        api.get("/fraud-awareness/profile"),
        api.get("/fraud-awareness/scenarios"),
        api.get("/fraud-awareness/leaderboard"),
      ]);
      setProfile(profileRes.data.data);
      setScenarios(scenariosRes.data.data);
      setLeaderboard(leaderboardRes.data.data);
      const unanswered = scenariosRes.data.data.find(s => !s.userProgress?.answered);
      if (unanswered) setCurrentScenario(unanswered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    setSubmitting(true);
    const start = Date.now();
    try {
      const res = await api.post(`/fraud-awareness/scenarios/${currentScenario._id}/answer`, {
        selectedIndex: selectedOption,
        timeTaken: Math.round((Date.now() - start) / 1000),
      });
      setResult(res.data.data);
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const nextScenario = () => {
    const unanswered = scenarios.find(s => !s.userProgress?.answered && s._id !== currentScenario?._id);
    setCurrentScenario(unanswered || null);
    setSelectedOption(null);
    setResult(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="text-cyan-400 font-mono text-xl animate-pulse">Loading fraud academy...</span>
    </div>
  );

  const xpPercent = profile ? Math.min(100, Math.round(((profile.score % 500) / 500) * 100)) : 0;
  const answeredCount = scenarios.filter(s => s.userProgress?.answered).length;
  const correctCount = scenarios.filter(s => s.userProgress?.answeredCorrectly).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 bg-red-900 border border-red-500 rounded flex items-center justify-center text-lg">🛡</div>
          <div className="min-w-0">
            <h1 className="text-white font-mono font-bold text-base md:text-xl truncate">Fraud Defense Academy</h1>
            <p className="text-gray-400 font-mono text-xs hidden sm:block">Learn to spot and avoid financial scams</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-yellow-400 font-mono font-bold text-lg md:text-2xl">⊙ {profile?.score || 0}</div>
          <div className="text-gray-400 font-mono text-xs">Detection Score</div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Score", value: profile?.score || 0, color: "text-cyan-400" },
            { label: "Streak", value: `⚡${profile?.streak || 0}`, color: "text-green-400" },
            { label: "Level", value: profile?.level || 1, color: "text-purple-400" },
            { label: "Rank", value: `#${profile?.rank || "?"}`, color: "text-yellow-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5 text-center">
              <div className={`font-mono font-bold text-2xl md:text-3xl ${color} mb-1`}>{value}</div>
              <div className="text-gray-500 font-mono text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* XP Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="flex justify-between text-gray-400 font-mono text-xs md:text-sm mb-2">
            <span>Level {profile?.level || 1} Fraud Detective</span>
            <span>{profile?.score % 500 || 0} / 500 XP</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%`, boxShadow: "0 0 8px #22c55e" }} />
          </div>
        </div>

        {/* Current Scenario */}
        {currentScenario ? (
          <div className="border-2 border-red-700 bg-gray-900 rounded p-4 md:p-6">
            {/* Scenario header — stacks on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-white font-mono font-bold text-base md:text-lg flex items-center gap-2">
                <span className="text-red-400 shrink-0">△</span>
                <span className="truncate">{currentScenario.title}</span>
              </h2>
              <div className="flex gap-2 shrink-0">
                <span className="font-mono text-xs px-2 py-1 rounded bg-blue-900 text-blue-400 border border-blue-700">
                  {currentScenario.fraudType}
                </span>
                <span className={`font-mono text-xs px-2 py-1 rounded ${DIFFICULTY_COLORS[currentScenario.difficulty]}`}>
                  {currentScenario.difficulty}
                </span>
              </div>
            </div>

            <p className="text-gray-300 font-mono text-xs md:text-sm mb-4 leading-relaxed bg-gray-800 p-3 md:p-4 rounded border border-gray-700">
              {currentScenario.description}
            </p>

            {!result ? (
              <>
                <p className="text-white font-mono text-sm font-bold mb-3">What should you do?</p>
                <div className="space-y-2 mb-4">
                  {currentScenario.options?.map((opt, idx) => (
                    <button key={idx} onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left font-mono text-xs md:text-sm px-3 md:px-4 py-3 rounded border transition-all ${
                        selectedOption === idx
                          ? "border-cyan-500 bg-cyan-950 text-cyan-400"
                          : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500"
                      }`}>
                      {String.fromCharCode(65 + idx)}. {opt}
                    </button>
                  ))}
                </div>
                <button onClick={handleSubmit} disabled={selectedOption === null || submitting}
                  className="w-full bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-mono font-bold py-3 rounded transition-colors">
                  {submitting ? "Checking..." : "Submit Answer"}
                </button>
              </>
            ) : (
              <div className={`border rounded p-4 ${result.isCorrect ? "border-green-500 bg-green-950" : "border-red-500 bg-red-950"}`}>
                <div className="font-mono font-bold text-xl mb-2 text-center text-white">
                  {result.isCorrect ? "✅ Correct!" : "❌ Wrong!"}
                </div>
                {result.isCorrect && result.pointsEarned > 0 && (
                  <div className="text-center text-yellow-400 font-mono text-sm mb-2">
                    +{result.pointsEarned} points!
                    {result.streak > 1 && <span className="ml-2 text-green-400">⚡ {result.streak}x streak!</span>}
                  </div>
                )}
                <p className="text-gray-300 font-mono text-xs md:text-sm mb-4">{result.explanation}</p>
                <button onClick={nextScenario}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-mono font-bold py-2 rounded transition-colors">
                  Next Scenario →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded p-6 md:p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <div className="text-white font-mono font-bold text-lg md:text-xl mb-2">All scenarios completed!</div>
            <div className="text-gray-400 font-mono text-sm mb-4">You've mastered fraud detection. More coming soon!</div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-cyan-400 font-mono font-bold text-xl md:text-2xl">{correctCount}</div>
                <div className="text-gray-500 font-mono text-xs">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-mono font-bold text-xl md:text-2xl">{answeredCount - correctCount}</div>
                <div className="text-gray-500 font-mono text-xs">Wrong</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-mono font-bold text-xl md:text-2xl">{profile?.accuracy || 0}%</div>
                <div className="text-gray-500 font-mono text-xs">Accuracy</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Leaderboard */}
          <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5">
            <h2 className="text-white font-mono font-bold text-base md:text-lg mb-4 flex items-center gap-2">
              <span className="text-yellow-400">⊙</span> Leaderboard
            </h2>
            {leaderboard.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-gray-600 font-mono text-sm">No players yet.</div>
                <div className="text-gray-700 font-mono text-xs mt-1">Be the first to top the board!</div>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800 rounded px-3 md:px-4 py-2">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <span className={`font-mono font-bold text-sm shrink-0 ${
                        i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-yellow-600" : "text-gray-500"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                      <span className="text-white font-mono text-sm truncate">{entry.name}</span>
                      <span className="text-gray-600 font-mono text-xs shrink-0">Lv.{entry.level}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {entry.streak > 1 && <span className="text-green-400 font-mono text-xs">⚡{entry.streak}</span>}
                      <span className="text-cyan-400 font-mono font-bold text-sm">{entry.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Your Progress */}
          <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5">
            <h2 className="text-white font-mono font-bold text-base md:text-lg mb-2 flex items-center gap-2">
              <span className="text-red-400">⊙</span> Your Progress
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-800 rounded p-2 text-center">
                <div className="text-green-400 font-mono font-bold text-lg">{correctCount}</div>
                <div className="text-gray-500 font-mono text-xs">Correct</div>
              </div>
              <div className="bg-gray-800 rounded p-2 text-center">
                <div className="text-red-400 font-mono font-bold text-lg">{answeredCount - correctCount}</div>
                <div className="text-gray-500 font-mono text-xs">Wrong</div>
              </div>
              <div className="bg-gray-800 rounded p-2 text-center">
                <div className="text-yellow-400 font-mono font-bold text-lg">{profile?.accuracy || 0}%</div>
                <div className="text-gray-500 font-mono text-xs">Accuracy</div>
              </div>
            </div>
            {scenarios.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-600 font-mono text-sm">No scenarios available yet.</div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
                {scenarios.map((s) => (
                  <div key={s._id} className="flex items-center justify-between bg-gray-800 rounded px-3 md:px-4 py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`font-mono text-xs shrink-0 ${
                        s.userProgress?.answered
                          ? s.userProgress?.answeredCorrectly ? "text-green-400" : "text-red-400"
                          : "text-gray-600"
                      }`}>
                        {s.userProgress?.answered ? (s.userProgress?.answeredCorrectly ? "✓" : "✗") : "○"}
                      </span>
                      <span className="text-gray-300 font-mono text-xs truncate">{s.title}</span>
                    </div>
                    <span className={`font-mono text-xs ml-2 shrink-0 px-2 py-0.5 rounded ${DIFFICULTY_COLORS[s.difficulty]}`}>
                      {s.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}