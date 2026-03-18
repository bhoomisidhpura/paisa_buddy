import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SchemeHunt() {
  const [schemes, setSchemes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [schemeDetail, setSchemeDetail] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [msg, setMsg] = useState("");
  // Track which boxes have been opened THIS session only
  const [sessionOpened, setSessionOpened] = useState(new Set());

  const fetchAll = async () => {
    try {
      const [schemesRes, statsRes] = await Promise.all([
        api.get("/scheme-hunt"),
        api.get("/scheme-hunt/stats"),
      ]);
      setSchemes(schemesRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUnlock = async (scheme) => {
    // Already opened this session — just show detail again
    if (sessionOpened.has(scheme._id)) {
      try {
        const res = await api.get(`/scheme-hunt/${scheme._id}`);
        setSchemeDetail(res.data.data);
        setSelected(scheme);
        setQuizAnswer(null);
        setQuizResult(null);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // First time opening this session — call unlock (or fetch if already unlocked in DB)
    setUnlocking(true);
    try {
      let detail;
      if (scheme.isUnlocked) {
        // Already in DB — just fetch detail
        const res = await api.get(`/scheme-hunt/${scheme._id}`);
        detail = res.data.data;
      } else {
        // New unlock — save to DB and get coins
        const res = await api.post(`/scheme-hunt/${scheme._id}/unlock`);
        detail = res.data.data;
        setMsg(`🎉 Unlocked! +${scheme.coinsReward} coins`);
        fetchAll();
        setTimeout(() => setMsg(""), 3000);
      }
      setSchemeDetail(detail);
      setSelected(scheme);
      setQuizAnswer(null);
      setQuizResult(null);
      // Mark as opened this session
      setSessionOpened(prev => new Set([...prev, scheme._id]));
    } catch (err) {
      console.error(err);
    } finally {
      setUnlocking(false);
    }
  };

  const handleQuiz = async () => {
    if (quizAnswer === null) return;
    try {
      const res = await api.post(`/scheme-hunt/${selected._id}/quiz`, { selectedIndex: quizAnswer });
      setQuizResult(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="text-cyan-400 font-mono text-xl animate-pulse">Loading treasure map...</span>
    </div>
  );

  const xpPercent = stats ? Math.min(100, Math.round(((stats.totalXpEarned % 1000) / 1000) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Player Stats */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-cyan-400 font-mono font-bold text-sm tracking-widest">PLAYER STATS</span>
          <span className="text-yellow-400 font-mono font-bold">⚡ LVL {stats?.level || 1}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-400 font-mono font-bold text-xl">{stats?.totalCoinsEarned || 0}</span>
          <span className="text-gray-500 font-mono text-xs">PAISA COINS</span>
        </div>
        <div className="flex items-center justify-between text-gray-500 font-mono text-xs mb-1">
          <span>EXPERIENCE</span>
          <span>{stats?.totalXpEarned || 0}/1000</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-cyan-500 rounded-full transition-all"
            style={{ width: `${xpPercent}%` }} />
        </div>
      </div>

      {msg && <div className="mx-6 mt-4 bg-yellow-950 border border-yellow-500 text-yellow-400 font-mono text-sm p-3 rounded">{msg}</div>}

      <div className="p-6 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-white font-mono font-bold text-3xl tracking-widest mb-1">SCHEME TREASURE HUNT</h1>
          <p className="text-yellow-400 font-mono text-sm">Discover government schemes and unlock benefits!</p>
        </div>

        {/* Treasure Map */}
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <h2 className="text-cyan-400 font-mono font-bold text-sm tracking-widest mb-1">⊙ TREASURE MAP</h2>
          <p className="text-gray-400 font-mono text-xs mb-4">Click on mystery boxes to discover government schemes!</p>

          <div className="grid grid-cols-3 gap-3">
            {schemes.map((scheme) => {
              const isOpenedThisSession = sessionOpened.has(scheme._id);
              const isSelected = selected?._id === scheme._id;

              return (
                <button key={scheme._id}
                  onClick={() => handleUnlock(scheme)}
                  disabled={unlocking}
                  className={`relative rounded p-6 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 border-2 ${
                    isOpenedThisSession
                      ? isSelected
                        ? "border-cyan-400 bg-purple-900"
                        : "border-green-700 bg-gray-800"
                      : "border-gray-700 bg-gray-900 hover:border-yellow-600"
                  }`}
                  style={isOpenedThisSession && isSelected ? { boxShadow: "0 0 20px #06b6d4" } : {}}>
                  {isOpenedThisSession ? (
                    <>
                      <span className="text-2xl">{scheme.icon}</span>
                      <span className="text-white font-mono text-xs font-bold text-center">
                        {scheme.shortName || scheme.title?.split(" ").slice(0, 2).join(" ")}
                      </span>
                      {isSelected && <span className="absolute top-2 right-2 text-green-400 text-xs">✓</span>}
                    </>
                  ) : (
                    <>
                      <span className="text-3xl">📦</span>
                      <span className="text-gray-400 font-mono text-xs">MYSTERY</span>
                    </>
                  )}
                  <span className="text-yellow-400 font-mono text-xs">+{scheme.coinsReward}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scheme Detail */}
        {schemeDetail && selected && (
          <div className="bg-gray-900 border border-cyan-700 rounded p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{schemeDetail.icon}</span>
              <h2 className="text-white font-mono font-bold text-xl">
                {schemeDetail.title || schemeDetail.name}
              </h2>
            </div>

            {schemeDetail.description && (
              <p className="text-gray-400 font-mono text-sm leading-relaxed">{schemeDetail.description}</p>
            )}

            <div>
              <p className="text-green-400 font-mono text-xs font-bold mb-2">🎁 BENEFITS:</p>
              {schemeDetail.benefits?.map((b, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded px-4 py-2 mb-2 text-gray-300 font-mono text-sm">{b}</div>
              ))}
            </div>

            <div>
              <p className="text-cyan-400 font-mono text-xs font-bold mb-2">ELIGIBILITY:</p>
              <div className="grid grid-cols-2 gap-2">
                {schemeDetail.eligibility?.map((e, i) => (
                  <div key={i} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-300 font-mono text-xs flex items-center gap-2">
                    <span className="text-yellow-400">☆</span> {e}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-purple-400 font-mono text-xs font-bold mb-2">HOW TO APPLY:</p>
              <div className="bg-purple-950 border border-purple-700 rounded px-4 py-3 text-gray-300 font-mono text-sm">
                {schemeDetail.howToApply}
              </div>
            </div>

            {schemeDetail.officialLink && (
              <a href={schemeDetail.officialLink} target="_blank" rel="noopener noreferrer"
                className="inline-block text-cyan-400 font-mono text-xs underline hover:text-cyan-300">
                🔗 Official Website →
              </a>
            )}

            {/* Bonus Quiz */}
            {schemeDetail.quiz && (
              <div className="border border-green-700 rounded p-4">
                <p className="text-green-400 font-mono text-xs font-bold mb-3">BONUS QUIZ:</p>
                {!quizResult ? (
                  <>
                    <p className="text-white font-mono text-sm mb-3">{schemeDetail.quiz.question}</p>
                    <div className="space-y-2 mb-3">
                      {schemeDetail.quiz.options?.map((opt, idx) => (
                        <button key={idx} onClick={() => setQuizAnswer(idx)}
                          className={`w-full text-left font-mono text-sm px-4 py-2 rounded border transition-all ${
                            quizAnswer === idx
                              ? "border-cyan-500 bg-cyan-950 text-cyan-400"
                              : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500"
                          }`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleQuiz} disabled={quizAnswer === null}
                      className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white font-mono text-sm px-6 py-2 rounded transition-colors">
                      Submit
                    </button>
                  </>
                ) : (
                  <div className={`p-4 rounded border ${quizResult.isCorrect ? "border-green-500 bg-green-950 text-green-400" : "border-red-500 bg-red-950 text-red-400"}`}>
                    <p className="font-mono font-bold mb-1">{quizResult.isCorrect ? "✅ Correct!" : "❌ Wrong!"}</p>
                    {quizResult.xpEarned > 0 && <p className="text-yellow-400 font-mono text-xs">+{quizResult.xpEarned} XP earned!</p>}
                    {quizResult.explanation && <p className="text-gray-300 font-mono text-xs mt-2">{quizResult.explanation}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}