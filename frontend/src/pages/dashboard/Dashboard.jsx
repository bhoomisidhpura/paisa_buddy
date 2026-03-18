import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const QUICK_ACTIONS = [
  { label: "Check Portfolio", icon: "📈", path: "/portfolio", color: "border-cyan-500 hover:bg-cyan-950" },
  { label: "Daily Lesson", icon: "📚", path: "/learning", color: "border-green-500 hover:bg-green-950 bg-green-900" },
  { label: "Fraud Quiz", icon: "🛡", path: "/fraud-awareness", color: "border-red-500 hover:bg-red-950 bg-red-900" },
  { label: "Swipe Decisions", icon: "🔄", path: "/swipe", color: "border-purple-500 hover:bg-purple-950" },
];

const BADGE_INFO = {
  first_transaction: { label: "First Transaction", desc: "Logged your first transaction" },
  budget_master: { label: "Budget Master", desc: "Created 5 successful budgets" },
  fraud_detective: { label: "Fraud Detective", desc: "Completed fraud awareness course" },
  streak_7: { label: "7 Day Streak", desc: "Logged in 7 days in a row" },
  streak_30: { label: "30 Day Streak", desc: "Logged in 30 days in a row" },
  lesson_1: { label: "First Lesson", desc: "Completed your first lesson" },
  lesson_10: { label: "10 Lessons", desc: "Completed 10 lessons" },
  quiz_5: { label: "Quiz Master", desc: "Completed 5 quizzes" },
  level_5: { label: "Level 5", desc: "Reached level 5" },
  level_10: { label: "Level 10", desc: "Reached level 10" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/gamification/profile");
        setProfile(res.data.data);
      } catch (err) {
        console.error("Failed to fetch gamification profile", err);
        setError("Unable to load your dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const safeLevel = profile?.level && profile.level > 0 ? profile.level : 1;
  const safeXp = profile?.xp || 0;
  const xpPercent = safeLevel > 0
    ? Math.min(100, Math.round((safeXp / (safeLevel * 500)) * 100))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-400 font-mono">
        Loading Dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-400 font-mono">
        Unable to load dashboard.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gray-900 border-b border-gray-800"
        style={{ minHeight: "140px", background: "linear-gradient(135deg, #0f172a 0%, #0c1a2e 50%, #0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20">
          <svg viewBox="0 0 400 180" className="w-full h-full">
            <polyline points="0,150 50,120 100,130 150,80 200,90 250,40 300,60 350,20 400,30"
              fill="none" stroke="#22d3ee" strokeWidth="2" />
            <polyline points="0,160 50,140 100,150 150,100 200,110 250,60 300,80 350,40 400,50"
              fill="none" stroke="#eab308" strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center py-8 px-4">
          <h1 className="text-cyan-400 font-mono font-bold text-2xl md:text-4xl mb-1 text-center"
            style={{ textShadow: "0 0 20px #22d3ee" }}>
            Welcome Back, {user?.name?.split(" ")[0] || "Hero"}!
          </h1>
          {profile?.streak > 0 && (
            <p className="text-yellow-400 font-mono text-sm md:text-lg">
              🔥 {profile.streak} Day Streak!
            </p>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats Row */}
        {error ? (
          <div className="bg-red-950 border border-red-500 text-red-400 font-mono text-sm p-4 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "LEVEL", value: safeLevel, color: "text-cyan-400" },
              { label: "COINS", value: `⊙${(profile?.coins || 0).toLocaleString()}`, color: "text-yellow-400" },
              { label: "BADGES", value: profile?.badges?.length || 0, color: "text-green-400" },
              { label: "LESSONS", value: profile?.stats?.lessonsCompleted || 0, color: "text-purple-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded p-4 md:p-6 text-center">
                <div className={`font-mono font-bold text-2xl md:text-3xl ${color} mb-1`}>{value}</div>
                <div className="text-gray-500 font-mono text-xs tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* XP Progress */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400">⚡</span>
            <span className="text-white font-mono font-bold text-sm md:text-base">Experience Progress</span>
          </div>
          <div className="flex justify-between text-gray-400 font-mono text-xs md:text-sm mb-2">
            <span>Level {safeLevel}</span>
            <span>{safeXp}/{safeLevel * 500}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 md:h-4 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(xpPercent, 100)}%`, boxShadow: "0 0 8px #22c55e" }} />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-white font-mono font-bold text-lg md:text-xl mb-3 md:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {QUICK_ACTIONS.map(({ label, icon, path, color }) => (
              <button key={path} onClick={() => navigate(path)}
                className={`bg-gray-900 border-2 ${color} rounded p-4 md:p-5 text-center transition-all hover:scale-105 active:scale-95`}>
                <div className="text-2xl md:text-3xl mb-1 md:mb-2">{icon}</div>
                <div className="text-white font-mono text-xs md:text-sm font-bold">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div>
          <h2 className="text-white font-mono font-bold text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2">
            <span className="text-yellow-400">⊙</span> Recent Achievements
          </h2>
          {!profile?.badges?.length ? (
            <div className="bg-gray-900 border border-gray-800 rounded p-6 text-center text-gray-500 font-mono text-sm">
              No badges yet — start learning to earn your first badge!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(profile?.badges ?? []).slice(0, 4).map((badge, i) => {
                const badgeId = typeof badge === "object" ? (badge.id || badge.name) : badge;
                const info = BADGE_INFO[badgeId] || {
                  label: badge?.name || badgeId,
                  desc: badge?.description || "Achievement unlocked!",
                };
                const colors = ["border-cyan-700 bg-cyan-950", "border-purple-700 bg-purple-950", "border-yellow-700 bg-yellow-950", "border-gray-700 bg-gray-900"];
                return (
                  <div key={badgeId || i} className={`border rounded p-4 flex items-center gap-3 ${colors[i % colors.length]}`}>
                    <div className="text-xl md:text-2xl">🏆</div>
                    <div>
                      <div className="text-white font-mono font-bold text-xs md:text-sm">{info.label}</div>
                      <div className="text-gray-400 font-mono text-xs">{info.desc}</div>
                    </div>
                  </div>
                );
              })}
              {Array(Math.max(0, 4 - (profile?.badges?.length || 0))).fill(0).map((_, i) => (
                <div key={`empty-${i}`} className="border border-gray-800 rounded p-4 flex items-center gap-3 opacity-40">
                  <div className="text-xl md:text-2xl grayscale">🏆</div>
                  <div>
                    <div className="text-gray-600 font-mono font-bold text-xs md:text-sm">???</div>
                    <div className="text-gray-700 font-mono text-xs">Keep playing to unlock</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}