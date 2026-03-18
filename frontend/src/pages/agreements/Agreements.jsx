import { useEffect, useState } from "react";
import api from "../../api/axios";

const RISK_COLORS = {
  Low: "bg-green-900 text-green-400 border border-green-700",
  Medium: "bg-yellow-900 text-yellow-400 border border-yellow-700",
  High: "bg-red-900 text-red-400 border border-red-700",
};

const CARD_BORDERS = ["border-cyan-700", "border-purple-700", "border-red-700", "border-yellow-700"];

export default function Agreements() {
  const [agreements, setAgreements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const fetchAll = async () => {
    try {
      const [agrRes, statsRes] = await Promise.all([
        api.get("/agreements"),
        api.get("/agreements/stats"),
      ]);
      setAgreements(agrRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAgreement = async (agr) => {
    setSelected(agr);
    setLoadingDetail(true);
    setShowStudy(false);
    setShowQuiz(false);
    setQuizResult(null);
    setAnswers({});
    try {
      const res = await api.get(`/agreements/${agr._id}`);
      setDetail(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const submitQuiz = async () => {
    const answersArray = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId, selectedIndex: parseInt(selectedIndex),
    }));
    try {
      const res = await api.post(`/agreements/${selected._id}/quiz`, { answers: answersArray });
      setQuizResult(res.data.data);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="text-cyan-400 font-mono text-xl animate-pulse">Loading agreements...</span>
    </div>
  );

  const xpPercent = stats ? Math.min(100, Math.round(((stats.xp % 400) / 400) * 100)) : 0;

  // Detail view
  if (selected && detail) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4 flex items-center gap-3">
          <button onClick={() => setSelected(null)}
            className="text-gray-400 hover:text-white font-mono text-sm transition-colors shrink-0">← Back</button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xl md:text-2xl shrink-0">{detail.icon}</span>
            <div className="min-w-0">
              <h1 className="text-white font-mono font-bold text-base md:text-xl truncate">{detail.title}</h1>
              <p className="text-gray-400 font-mono text-xs hidden sm:block">{detail.description}</p>
            </div>
          </div>
          <span className={`shrink-0 font-mono text-xs px-2 md:px-3 py-1 rounded ${RISK_COLORS[detail.riskLevel]}`}>
            {detail.riskLevel}
          </span>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-3xl mx-auto">
          {/* Key Terms */}
          <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5">
            <h2 className="text-cyan-400 font-mono font-bold text-xs md:text-sm mb-3">KEY TERMS TO WATCH:</h2>
            <ul className="space-y-2">
              {detail.keyTerms?.map((term, i) => (
                <li key={i} className="text-gray-300 font-mono text-xs md:text-sm flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5 shrink-0">•</span> {term}
                </li>
              ))}
            </ul>
          </div>

          {/* Red Flags */}
          {detail.redFlags?.length > 0 && (
            <div className="bg-red-950 border border-red-700 rounded p-4 md:p-5">
              <h2 className="text-red-400 font-mono font-bold text-xs md:text-sm mb-3">🚩 RED FLAGS:</h2>
              <ul className="space-y-2">
                {detail.redFlags?.map((flag, i) => (
                  <li key={i} className="text-gray-300 font-mono text-xs md:text-sm flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 shrink-0">⚠</span> {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Study Content */}
          <div>
            <button onClick={() => setShowStudy(!showStudy)}
              className="w-full bg-gray-900 border border-gray-700 hover:border-cyan-600 text-white font-mono font-bold py-3 px-4 rounded transition-colors flex items-center justify-between">
              <span className="text-sm md:text-base">⊙ Study Content</span>
              <span>{showStudy ? "▲" : "▼"}</span>
            </button>
            {showStudy && (
              <div className="bg-gray-900 border border-gray-700 border-t-0 rounded-b p-4 md:p-5">
                <pre className="text-gray-300 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto">{detail.studyContent}</pre>
              </div>
            )}
          </div>

          {/* Quiz */}
          <div>
            <button onClick={() => setShowQuiz(!showQuiz)}
              className="w-full bg-purple-900 border border-purple-700 hover:border-purple-500 text-white font-mono font-bold py-3 px-4 rounded transition-colors flex items-center justify-between">
              <span className="text-sm md:text-base">🎯 Take Quiz (+{detail.xpReward} XP)</span>
              <span>{showQuiz ? "▲" : "▼"}</span>
            </button>
            {showQuiz && (
              <div className="bg-gray-900 border border-purple-700 border-t-0 rounded-b p-4 md:p-5 space-y-4">
                {quizResult ? (
                  <div className={`border rounded p-4 ${quizResult.passed ? "border-green-500 bg-green-950" : "border-red-500 bg-red-950"}`}>
                    <div className="text-center font-mono font-bold text-lg md:text-xl mb-2 text-white">
                      {quizResult.passed ? "🎉 Passed!" : "❌ Try Again"}
                    </div>
                    <div className="text-center font-mono text-white">{quizResult.score}% ({quizResult.correct}/{quizResult.total})</div>
                    <div className="space-y-2 mt-3">
                      {quizResult.results?.map((r, i) => (
                        <div key={i} className={`p-2 rounded border text-xs font-mono ${r.isCorrect ? "border-green-700 bg-green-900" : "border-red-700 bg-red-900"}`}>
                          <span className="font-bold text-white">{r.isCorrect ? "✓" : "✗"} Q{i + 1}</span>
                          {r.explanation && <p className="text-gray-300 mt-1">{r.explanation}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {detail.quiz?.map((q, i) => (
                      <div key={q._id} className="bg-gray-800 border border-gray-700 rounded p-4">
                        <p className="text-white font-mono text-sm font-bold mb-3">{i + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, idx) => (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer">
                              <input type="radio" name={q._id} value={idx}
                                checked={answers[q._id] === String(idx)}
                                onChange={() => setAnswers(p => ({ ...p, [q._id]: String(idx) }))}
                                className="accent-purple-400 shrink-0" />
                              <span className={`font-mono text-sm ${answers[q._id] === String(idx) ? "text-purple-400" : "text-gray-400"}`}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={submitQuiz}
                      disabled={Object.keys(answers).length < (detail.quiz?.length || 0)}
                      className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-mono font-bold py-3 rounded transition-colors">
                      Submit Quiz
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 bg-blue-900 border border-blue-500 rounded flex items-center justify-center text-lg">📄</div>
        <div>
          <h1 className="text-white font-mono font-bold text-base md:text-xl">Agreements & Contracts</h1>
          <p className="text-gray-400 font-mono text-xs hidden sm:block">Master the art of reading financial agreements</p>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* XP Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="flex justify-between text-gray-400 font-mono text-xs md:text-sm mb-2">
            <span>Level {Math.floor((stats?.xp || 0) / 400) + 1} Contract Expert</span>
            <span>{stats?.xp || 0}/1000</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%`, boxShadow: "0 0 8px #22c55e" }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Mastered", value: stats?.mastered || 0, color: "text-cyan-400" },
            { label: "Total Types", value: stats?.total || 0, color: "text-yellow-400" },
            { label: "High Risk", value: stats?.highRiskTotal || 0, color: "text-red-400" },
            { label: "Progress", value: `${stats?.progress || 0}%`, color: "text-purple-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5 text-center">
              <div className={`font-mono font-bold text-2xl md:text-3xl ${color} mb-1`}>{value}</div>
              <div className="text-gray-500 font-mono text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Agreements Grid */}
        <div>
          <h2 className="text-white font-mono font-bold text-lg md:text-xl mb-4 flex items-center gap-2">
            <span className="text-cyan-400">📄</span> Financial Agreements Library
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agreements.map((agr, i) => (
              <div key={agr._id}
                className={`bg-gray-900 border-2 ${CARD_BORDERS[i % CARD_BORDERS.length]} rounded p-4 md:p-5 ${agr.isMastered ? "opacity-90" : ""}`}
                style={agr.isMastered ? { boxShadow: "0 0 10px rgba(34,197,94,0.2)" } : {}}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl md:text-2xl shrink-0">{agr.icon}</span>
                    <div className="min-w-0">
                      <h3 className="text-white font-mono font-bold text-sm flex items-center gap-2">
                        <span className="truncate">{agr.title}</span>
                        {agr.isMastered && <span className="text-green-400 shrink-0">✓</span>}
                      </h3>
                      <p className="text-gray-400 font-mono text-xs truncate">{agr.description}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded shrink-0 ml-2 ${RISK_COLORS[agr.riskLevel]}`}>{agr.riskLevel}</span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-500 font-mono text-xs mb-2">Key Terms to Watch:</p>
                  <ul className="space-y-1">
                    {agr.keyTerms?.slice(0, 3).map((term, j) => (
                      <li key={j} className="text-gray-400 font-mono text-xs flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5 shrink-0">•</span>
                        <span className="line-clamp-1">{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { openAgreement(agr); setShowStudy(true); }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs py-2 rounded border border-gray-700 transition-colors">
                    ⊙ Study
                  </button>
                  <button onClick={() => { openAgreement(agr); setShowQuiz(true); }}
                    className="flex-1 bg-cyan-900 hover:bg-cyan-800 text-cyan-400 font-mono text-xs py-2 rounded border border-cyan-700 transition-colors">
                    ⊙ Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}