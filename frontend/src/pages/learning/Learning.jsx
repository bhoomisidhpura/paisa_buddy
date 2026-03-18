import { useEffect, useState } from "react";
import api from "../../api/axios";

const DIFFICULTY_COLORS = {
  Beginner: "bg-green-900 text-green-400 border border-green-700",
  Intermediate: "bg-yellow-900 text-yellow-400 border border-yellow-700",
  Advanced: "bg-red-900 text-red-400 border border-red-700",
};

const MODULE_COLORS = [
  "border-cyan-700", "border-purple-700", "border-yellow-700", "border-green-700",
  "border-red-700", "border-blue-700", "border-pink-700", "border-orange-700",
];

export default function Learning() {
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleDetail, setModuleDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [localCompleted, setLocalCompleted] = useState(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, modulesRes] = await Promise.all([
          api.get("/learning/stats"),
          api.get("/learning/modules"),
        ]);
        setStats(statsRes.data.data);
        setModules(modulesRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openModule = async (mod) => {
    setSelectedModule(mod);
    setLoadingDetail(true);
    setActiveLesson(null);
    setLocalCompleted(new Set());
    setShowQuiz(false);
    setQuizResult(null);
    try {
      const res = await api.get(`/learning/modules/${mod._id}`);
      setModuleDetail(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const completeLesson = async (lessonId) => {
    // Optimistic update — mark done instantly
    setLocalCompleted(prev => new Set([...prev, lessonId]));
    try {
      await api.post(`/learning/modules/${selectedModule._id}/lessons/${lessonId}/complete`);
      setMsg("✅ Lesson completed! XP earned.");
      const res = await api.get(`/learning/modules/${selectedModule._id}`);
      setModuleDetail(res.data.data);
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      // Revert on error
      setLocalCompleted(prev => {
        const s = new Set(prev);
        s.delete(lessonId);
        return s;
      });
      console.error(err);
    }
  };

  const loadQuiz = async () => {
    try {
      const res = await api.get(`/learning/modules/${selectedModule._id}/quiz`);
      // API returns questions array directly in res.data.data
      setQuiz({ questions: res.data.data });
      setShowQuiz(true);
      setAnswers({});
      setQuizResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  const submitQuiz = async () => {
    const answersArray = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId, selectedIndex: parseInt(selectedIndex),
    }));
    try {
      const res = await api.post(`/learning/modules/${selectedModule._id}/quiz/submit`, { answers: answersArray });
      setQuizResult(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Renders lesson content — splits on double newlines for paragraphs,
  // handles bullet points starting with "• " or "- "
  const renderContent = (content) => {
    return content.split("\n\n").map((para, idx) => (
      <p key={idx} className="text-gray-300 font-mono text-sm leading-relaxed">
        {para.split("\n").map((line, li, arr) => (
          <span key={li}>
            {line.startsWith("• ") || line.startsWith("- ") ? (
              <span className="flex gap-2 mt-1">
                <span className="text-cyan-400 shrink-0">▸</span>
                <span>{line.slice(2)}</span>
              </span>
            ) : (
              line
            )}
            {li < arr.length - 1 && !line.startsWith("• ") && !line.startsWith("- ") && <br />}
          </span>
        ))}
      </p>
    ));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="text-cyan-400 font-mono text-xl animate-pulse">Loading learning hub...</span>
    </div>
  );

  // Module detail view
  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSelectedModule(null)} className="text-gray-400 hover:text-white font-mono text-sm transition-colors">
            ← Back
          </button>
          <div>
            <h1 className="text-white font-mono font-bold text-xl">{selectedModule.title}</h1>
            <p className="text-gray-400 font-mono text-xs">{selectedModule.description}</p>
          </div>
        </div>

        {msg && (
          <div className="mx-6 mt-4 bg-green-950 border border-green-500 text-green-400 font-mono text-sm p-3 rounded">
            {msg}
          </div>
        )}

        <div className="p-6 space-y-6">
          {loadingDetail ? (
            <div className="text-cyan-400 font-mono animate-pulse">Loading module...</div>
          ) : (
            <>
              {/* Lessons */}
              <div>
                <h2 className="text-white font-mono font-bold text-lg mb-3">📚 Lessons</h2>
                <div className="space-y-2">
                  {moduleDetail?.lessons?.map((lesson, i) => {
                    const completed =
                      localCompleted.has(lesson._id) ||
                      lesson.isCompleted;

                    return (
                      <div
                        key={lesson._id}
                        className={`bg-gray-900 border rounded p-4 cursor-pointer transition-all ${
                          activeLesson?._id === lesson._id
                            ? "border-cyan-500"
                            : completed
                            ? "border-green-800 hover:border-green-600"
                            : "border-gray-800 hover:border-gray-600"
                        }`}
                        onClick={() =>
                          setActiveLesson(activeLesson?._id === lesson._id ? null : lesson)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono text-sm font-bold ${
                                completed ? "text-green-400" : "text-gray-500"
                              }`}
                            >
                              {completed ? "✓" : `${i + 1}.`}
                            </span>
                            <span
                              className={`font-mono text-sm ${
                                completed ? "text-green-300" : "text-white"
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-mono text-xs">
                              {lesson.duration} min
                            </span>
                            {completed ? (
                              <span className="bg-green-900 border border-green-600 text-green-400 font-mono text-xs px-3 py-1 rounded">
                                ✓ Completed
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  completeLesson(lesson._id);
                                }}
                                className="bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs px-3 py-1 rounded transition-colors"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded lesson content */}
                        {activeLesson?._id === lesson._id && lesson.content && (
                          <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                            {renderContent(lesson.content)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiz */}
              <div>
                <h2 className="text-white font-mono font-bold text-lg mb-3">🎯 Module Quiz</h2>
                {!showQuiz ? (
                  <button
                    onClick={loadQuiz}
                    className="bg-purple-700 hover:bg-purple-600 text-white font-mono px-6 py-3 rounded transition-colors"
                  >
                    Start Quiz →
                  </button>
                ) : quizResult ? (
                  <div
                    className={`border rounded p-6 ${
                      quizResult.passed
                        ? "border-green-500 bg-green-950"
                        : "border-red-500 bg-red-950"
                    }`}
                  >
                    <div className="text-2xl font-mono font-bold mb-2 text-center">
                      {quizResult.passed ? "🎉 Passed!" : "❌ Try Again"}
                    </div>
                    <div className="text-center font-mono text-lg mb-4">
                      Score: {quizResult.score}% ({quizResult.correct}/{quizResult.total})
                    </div>
                    <div className="space-y-3">
                      {quizResult.results?.map((r, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded border font-mono text-sm ${
                            r.isCorrect
                              ? "border-green-700 bg-green-900"
                              : "border-red-700 bg-red-900"
                          }`}
                        >
                          <div className="font-bold mb-1">
                            {r.isCorrect ? "✓" : "✗"} Question {i + 1}
                          </div>
                          {r.explanation && (
                            <div className="text-gray-300 text-xs">{r.explanation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setShowQuiz(false);
                        setQuizResult(null);
                      }}
                      className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-mono px-4 py-2 rounded transition-colors w-full"
                    >
                      Back
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quiz?.questions?.map((q, i) => (
                      <div key={q._id} className="bg-gray-900 border border-gray-800 rounded p-4">
                        <p className="text-white font-mono text-sm font-bold mb-3">
                          {i + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, idx) => (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="radio"
                                name={q._id}
                                value={idx}
                                checked={answers[q._id] === String(idx)}
                                onChange={() =>
                                  setAnswers((prev) => ({ ...prev, [q._id]: String(idx) }))
                                }
                                className="accent-cyan-400"
                              />
                              <span
                                className={`font-mono text-sm transition-colors ${
                                  answers[q._id] === String(idx)
                                    ? "text-cyan-400"
                                    : "text-gray-400 group-hover:text-white"
                                }`}
                              >
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(answers).length < (quiz?.questions?.length || 0)}
                      className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-mono font-bold px-6 py-3 rounded transition-colors w-full"
                    >
                      Submit Quiz
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Module list view
  const xpPercent = stats
    ? Math.min(
        100,
        Math.round(
          (stats.totalXpEarned / ((stats.totalModulesCompleted + 1) * 300)) * 100
        )
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-900 border border-green-500 rounded flex items-center justify-center text-lg">
          📚
        </div>
        <div>
          <h1 className="text-white font-mono font-bold text-xl">Financial Learning Hub</h1>
          <p className="text-gray-400 font-mono text-xs">
            Master money management through interactive lessons
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* XP Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="flex justify-between text-gray-400 font-mono text-sm mb-2">
            <span>Level {Math.floor((stats?.totalXpEarned || 0) / 300) + 1} Learner</span>
            <span>
              {stats?.totalXpEarned || 0} /{" "}
              {(Math.floor((stats?.totalXpEarned || 0) / 300) + 1) * 300} XP
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${xpPercent}%`,
                background: "linear-gradient(90deg, #06b6d4, #a855f7)",
                boxShadow: "0 0 8px #06b6d4",
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Completed", value: stats?.totalModulesCompleted || 0, color: "text-cyan-400" },
            {
              label: "In Progress",
              value: modules.filter(
                (m) => m.completedLessons > 0 && !m.quizCompleted
              ).length,
              color: "text-green-400",
            },
            { label: "XP Earned", value: stats?.totalXpEarned || 0, color: "text-yellow-400" },
            {
              label: "Overall",
              value: `${Math.round(
                ((stats?.totalModulesCompleted || 0) / (modules.length || 1)) * 100
              )}%`,
              color: "text-purple-400",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded p-5 text-center">
              <div className={`font-mono font-bold text-3xl ${color} mb-1`}>{value}</div>
              <div className="text-gray-500 font-mono text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-white font-mono font-bold text-xl mb-4 flex items-center gap-2">
            <span className="text-cyan-400">□</span> Learning Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod, i) => {
              const lessonsCompleted = mod.completedLessons || 0;
              const totalLessons = mod.lessons?.length || mod.totalLessons || 0;
              const percent =
                totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
              const isCompleted = mod.quizCompleted;

              return (
                <div
                  key={mod._id}
                  className={`bg-gray-900 border-2 ${MODULE_COLORS[i % MODULE_COLORS.length]} rounded p-5 cursor-pointer hover:bg-gray-800 transition-all hover:scale-105`}
                  onClick={() => openModule(mod)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mod.icon || "📖"}</span>
                      <div>
                        <h3 className="text-white font-mono font-bold text-sm">{mod.title}</h3>
                        <p className="text-gray-500 font-mono text-xs">
                          {mod.totalLessons || totalLessons} lessons
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-400 font-mono text-lg">
                      {isCompleted ? "✓" : "▷"}
                    </span>
                  </div>

                  <p className="text-gray-400 font-mono text-xs mb-3 line-clamp-2">
                    {mod.description}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 font-mono text-xs">{percent}% Complete</span>
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[mod.difficulty]}`}
                    >
                      {mod.difficulty}
                    </span>
                  </div>

                  <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-mono text-xs font-bold">
                      +{mod.xpReward} XP
                    </span>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white font-mono text-xs px-3 py-1 rounded transition-colors">
                      {percent === 0 ? "Start" : isCompleted ? "Review" : "Continue"}
                    </button>
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