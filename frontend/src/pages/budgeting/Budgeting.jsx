import { useEffect, useState } from "react";
import api from "../../api/axios";

const CATEGORY_ICONS = {
  Rent: "🏠", Food: "🍔", Transport: "🚗", Entertainment: "🎮",
  Shopping: "🛍️", Healthcare: "💊", Other: "💰",
};

const CATEGORY_COLORS = {
  Rent: "bg-red-400", Food: "bg-cyan-400", Transport: "bg-blue-400",
  Entertainment: "bg-purple-400", Shopping: "bg-yellow-400",
  Healthcare: "bg-green-400", Other: "bg-gray-400",
};

const CATEGORIES = ["Rent", "Food", "Transport", "Entertainment", "Shopping", "Healthcare", "Other"];

export default function Budgeting() {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [incomeInput, setIncomeInput] = useState("");
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: "Rent", amount: "", limit: "" });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: "", targetAmount: "", icon: "🎯" });
  const [contributeGoalId, setContributeGoalId] = useState(null);
  const [contributeAmount, setContributeAmount] = useState("");

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const fetchBudget = async () => {
    try {
      const res = await api.get(`/budget?month=${month}&year=${year}`);
      setBudget(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudget(); }, []);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMsg(msg);
    setTimeout(() => { setMsg(""); setError(""); }, 3000);
  };

  const handleSetIncome = async () => {
    const val = parseInt(incomeInput);
    if (!incomeInput || isNaN(val) || val < 1) {
      flash("Please enter a valid income amount", true);
      return;
    }
    if (val > 10000000) {
      flash("Income cannot exceed ₹1,00,00,000", true);
      return;
    }
    try {
      await api.put("/budget/income", { income: val, month, year });
      flash("✅ Income updated!");
      setShowIncomeForm(false);
      fetchBudget();
    } catch (err) {
      flash(err.response?.data?.message || "Failed", true);
    }
  };

  const handleAddExpense = async () => {
    const amount = parseInt(expenseForm.amount);
    const limit = expenseForm.limit ? parseInt(expenseForm.limit) : 0;
    if (!expenseForm.amount || isNaN(amount) || amount < 1) {
      flash("Amount must be greater than ₹0", true);
      return;
    }
    if (amount > 10000000) {
      flash("Amount seems too high. Please check.", true);
      return;
    }
    if (expenseForm.limit && (isNaN(limit) || limit < amount)) {
      flash("Limit cannot be less than the expense amount", true);
      return;
    }
    try {
      await api.post("/budget/expenses", { category: expenseForm.category, amount, limit, month, year });
      flash("✅ Expense added!");
      setShowExpenseForm(false);
      setExpenseForm({ category: "Rent", amount: "", limit: "" });
      fetchBudget();
    } catch (err) {
      flash(err.response?.data?.message || "Failed", true);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/budget/expenses/${id}?month=${month}&year=${year}`);
      fetchBudget();
    } catch (err) {
      flash("Delete failed", true);
    }
  };

  const handleAddGoal = async () => {
    const target = parseInt(goalForm.targetAmount);
    if (!goalForm.name.trim()) {
      flash("Goal name is required", true);
      return;
    }
    if (goalForm.name.trim().length < 2) {
      flash("Goal name must be at least 2 characters", true);
      return;
    }
    if (!goalForm.targetAmount || isNaN(target) || target < 1) {
      flash("Target amount must be greater than ₹0", true);
      return;
    }
    if (target > 100000000) {
      flash("Target amount seems too high. Please check.", true);
      return;
    }
    try {
      await api.post("/budget/goals", { name: goalForm.name, targetAmount: target, icon: goalForm.icon, month, year });
      flash("✅ Goal added!");
      setShowGoalForm(false);
      setGoalForm({ name: "", targetAmount: "", icon: "🎯" });
      fetchBudget();
    } catch (err) {
      flash(err.response?.data?.message || "Failed", true);
    }
  };

  const handleContribute = async (goalId) => {
    const amount = parseInt(contributeAmount);
    if (!contributeAmount || isNaN(amount) || amount < 1) {
      flash("Contribution must be greater than ₹0", true);
      return;
    }
    try {
      await api.post(`/budget/goals/${goalId}/contribute`, { amount, month, year });
      flash("✅ Amount added to goal!");
      setContributeGoalId(null);
      setContributeAmount("");
      fetchBudget();
    } catch (err) {
      flash("Failed", true);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.delete(`/budget/goals/${id}?month=${month}&year=${year}`);
      fetchBudget();
    } catch (err) {
      flash("Delete failed", true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="text-cyan-400 font-mono text-xl animate-pulse">Loading budget...</span>
    </div>
  );

  const xpPercent = budget ? Math.min(100, Math.round((budget.budgeterXp / (budget.budgeterLevel * 300)) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 bg-green-900 border border-green-500 rounded flex items-center justify-center text-lg">$</div>
        <div>
          <h1 className="text-white font-mono font-bold text-base md:text-xl">Smart Budgeting</h1>
          <p className="text-gray-400 font-mono text-xs hidden sm:block">Track expenses and achieve your goals!</p>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="flex justify-between text-gray-400 font-mono text-xs md:text-sm mb-2">
            <span>Level {budget?.budgeterLevel} Budgeter</span>
            <span>{budget?.budgeterXp}/{budget?.budgeterLevel * 300}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%`, boxShadow: "0 0 8px #22c55e" }} />
          </div>
        </div>

        {msg && <div className="bg-green-950 border border-green-500 text-green-400 font-mono text-sm p-3 rounded">{msg}</div>}
        {error && <div className="bg-red-950 border border-red-500 text-red-400 font-mono text-sm p-3 rounded">⚠ {error}</div>}

        {budget?.warnings?.map((w, i) => (
          <div key={i} className="bg-yellow-950 border border-yellow-600 text-yellow-400 font-mono text-sm p-3 rounded">{w}</div>
        ))}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded p-4 cursor-pointer hover:border-gray-600 transition-colors col-span-2 md:col-span-1"
            onClick={() => setShowIncomeForm(!showIncomeForm)}>
            <div className="text-gray-400 font-mono text-xs mb-1">Monthly Income</div>
            <div className="text-white font-mono font-bold text-xl md:text-2xl">₹{budget?.monthlyIncome?.toLocaleString() || 0}</div>
            <div className="text-cyan-400 font-mono text-xs mt-1">Tap to edit</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4 text-center">
            <div className="text-red-400 font-mono font-bold text-xl md:text-2xl mb-1">₹{budget?.totalExpenses?.toLocaleString() || 0}</div>
            <div className="text-gray-500 font-mono text-xs">Expenses</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4 text-center">
            <div className="text-green-400 font-mono font-bold text-xl md:text-2xl mb-1">₹{budget?.savings?.toLocaleString() || 0}</div>
            <div className="text-gray-500 font-mono text-xs">Savings</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4 text-center">
            <div className="text-yellow-400 font-mono font-bold text-xl md:text-2xl mb-1">{budget?.savingsRate || 0}%</div>
            <div className="text-gray-500 font-mono text-xs">Savings Rate</div>
          </div>
        </div>

        {/* Income form */}
        {showIncomeForm && (
          <div className="bg-gray-900 border border-cyan-700 rounded p-4 space-y-3">
            <div>
              <input type="number" value={incomeInput} onChange={e => setIncomeInput(e.target.value)}
                placeholder="Enter monthly income (₹)"
                min="1" max="10000000"
                className={`w-full bg-gray-800 border text-white font-mono text-sm px-4 py-2 rounded focus:outline-none transition-colors ${
                  incomeInput && (parseInt(incomeInput) < 1 || parseInt(incomeInput) > 10000000)
                    ? "border-red-500" : "border-gray-600 focus:border-cyan-400"
                }`} />
              {incomeInput && parseInt(incomeInput) < 1 && (
                <p className="text-red-400 font-mono text-xs mt-1">⚠ Income must be greater than ₹0</p>
              )}
              {incomeInput && parseInt(incomeInput) > 10000000 && (
                <p className="text-red-400 font-mono text-xs mt-1">⚠ Income cannot exceed ₹1,00,00,000</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSetIncome} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold px-4 py-2 rounded transition-colors">Save</button>
              <button onClick={() => setShowIncomeForm(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-mono px-4 py-2 rounded transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Monthly Expenses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-mono font-bold text-lg md:text-xl flex items-center gap-2">
              <span className="text-cyan-400">⊙</span> Monthly Expenses
            </h2>
            <button onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs md:text-sm px-3 md:px-4 py-2 rounded transition-colors">
              + Add
            </button>
          </div>

          {showExpenseForm && (
            <div className="bg-gray-900 border border-cyan-700 rounded p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-400 font-mono text-xs mb-1 block">Category</label>
                  <select value={expenseForm.category} onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 text-white font-mono text-sm px-3 py-2 rounded focus:outline-none focus:border-cyan-400">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 font-mono text-xs mb-1 block">Amount (₹)</label>
                  <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="15000" min="1"
                    className={`w-full bg-gray-800 border text-white font-mono text-sm px-3 py-2 rounded focus:outline-none transition-colors ${
                      expenseForm.amount && parseInt(expenseForm.amount) < 1 ? "border-red-500" : "border-gray-600 focus:border-cyan-400"
                    }`} />
                  {expenseForm.amount && parseInt(expenseForm.amount) < 1 && (
                    <p className="text-red-400 font-mono text-xs mt-1">⚠ Must be greater than ₹0</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 font-mono text-xs mb-1 block">Limit (optional)</label>
                  <input type="number" value={expenseForm.limit} onChange={e => setExpenseForm(p => ({ ...p, limit: e.target.value }))}
                    placeholder="18000" min="1"
                    className={`w-full bg-gray-800 border text-white font-mono text-sm px-3 py-2 rounded focus:outline-none transition-colors ${
                      expenseForm.limit && expenseForm.amount && parseInt(expenseForm.limit) < parseInt(expenseForm.amount)
                        ? "border-red-500" : "border-gray-600 focus:border-cyan-400"
                    }`} />
                  {expenseForm.limit && expenseForm.amount && parseInt(expenseForm.limit) < parseInt(expenseForm.amount) && (
                    <p className="text-red-400 font-mono text-xs mt-1">⚠ Limit can't be less than amount</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddExpense} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold px-4 py-2 rounded transition-colors">Add</button>
                <button onClick={() => setShowExpenseForm(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-mono px-4 py-2 rounded transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {budget?.expenses?.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded p-6 text-center text-gray-500 font-mono text-sm">
              No expenses yet — add your first expense!
            </div>
          ) : (
            <div className="space-y-3">
              {budget?.expenses?.map((exp) => (
                <div key={exp._id} className="bg-gray-900 border border-gray-800 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 md:w-10 md:h-10 shrink-0 rounded flex items-center justify-center text-base md:text-lg ${exp.isOverLimit ? "bg-red-900 border border-red-600" : "bg-gray-800"}`}>
                        {CATEGORY_ICONS[exp.category] || "💰"}
                      </div>
                      <div>
                        <div className="text-white font-mono font-bold text-sm md:text-base">{exp.category}</div>
                        <div className="text-gray-500 font-mono text-xs">Monthly expense</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className={`font-mono font-bold text-base md:text-lg ${exp.isOverLimit ? "text-red-400" : "text-white"}`}>
                        ₹{exp.amount.toLocaleString()}
                      </span>
                      <button onClick={() => handleDeleteExpense(exp._id)}
                        className="bg-red-700 hover:bg-red-600 text-white font-mono text-xs px-2 py-1.5 rounded transition-colors">🗑</button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-1 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${exp.isOverLimit ? "bg-red-500" : CATEGORY_COLORS[exp.category] || "bg-cyan-400"}`}
                      style={{ width: `${Math.min(exp.percentOfIncome * 2, 100)}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-mono text-xs">
                      {exp.isOverLimit && <span className="text-red-400">⚠ Over by ₹{exp.overBy}</span>}
                    </span>
                    <span className="text-gray-400 font-mono text-xs">{exp.percentOfIncome}% of income</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Goals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-mono font-bold text-lg md:text-xl flex items-center gap-2">
              <span className="text-yellow-400">⊙</span> Savings Goals
            </h2>
            <button onClick={() => setShowGoalForm(!showGoalForm)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-xs md:text-sm px-3 md:px-4 py-2 rounded transition-colors">
              + Add Goal
            </button>
          </div>

          {showGoalForm && (
            <div className="bg-gray-900 border border-yellow-700 rounded p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-400 font-mono text-xs mb-1 block">Goal Name</label>
                  <input type="text" value={goalForm.name} onChange={e => setGoalForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Emergency Fund"
                    className={`w-full bg-gray-800 border text-white font-mono text-sm px-3 py-2 rounded focus:outline-none transition-colors ${
                      goalForm.name && goalForm.name.trim().length < 2 ? "border-red-500" : "border-gray-600 focus:border-yellow-400"
                    }`} />
                  {goalForm.name && goalForm.name.trim().length < 2 && (
                    <p className="text-red-400 font-mono text-xs mt-1">⚠ At least 2 characters</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 font-mono text-xs mb-1 block">Target Amount (₹)</label>
                  <input type="number" value={goalForm.targetAmount} onChange={e => setGoalForm(p => ({ ...p, targetAmount: e.target.value }))}
                    placeholder="150000" min="1"
                    className={`w-full bg-gray-800 border text-white font-mono text-sm px-3 py-2 rounded focus:outline-none transition-colors ${
                      goalForm.targetAmount && parseInt(goalForm.targetAmount) < 1 ? "border-red-500" : "border-gray-600 focus:border-yellow-400"
                    }`} />
                  {goalForm.targetAmount && parseInt(goalForm.targetAmount) < 1 && (
                    <p className="text-red-400 font-mono text-xs mt-1">⚠ Must be greater than ₹0</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 font-mono text-xs mb-1 block">Icon</label>
                  <input type="text" value={goalForm.icon} onChange={e => setGoalForm(p => ({ ...p, icon: e.target.value }))}
                    placeholder="🎯"
                    className="w-full bg-gray-800 border border-gray-600 text-white font-mono text-sm px-3 py-2 rounded focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddGoal} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold px-4 py-2 rounded transition-colors">Add Goal</button>
                <button onClick={() => setShowGoalForm(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-mono px-4 py-2 rounded transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {budget?.savingsGoals?.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded p-6 text-center text-gray-500 font-mono text-sm">
              No savings goals yet — add your first goal!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {budget?.savingsGoals?.map((goal) => (
                <div key={goal._id} className="bg-gray-900 border border-gray-800 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.icon}</span>
                      <div>
                        <div className="text-white font-mono font-bold text-sm">{goal.name}</div>
                        <div className="text-gray-500 font-mono text-xs">₹{goal.targetAmount?.toLocaleString()}</div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteGoal(goal._id)}
                      className="text-gray-600 hover:text-red-400 font-mono text-xs transition-colors p-1">✕</button>
                  </div>
                  <div className="flex justify-between text-gray-400 font-mono text-xs mb-1">
                    <span>{goal.percentComplete}% Complete</span>
                    <span>₹{goal.currentAmount?.toLocaleString()}/₹{goal.targetAmount?.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-3 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${goal.percentComplete}%`, boxShadow: "0 0 4px #22c55e" }} />
                  </div>
                  {goal.isCompleted ? (
                    <div className="text-green-400 font-mono text-xs text-center">🎉 Goal Completed!</div>
                  ) : contributeGoalId === goal._id ? (
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <input type="number" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)}
                          placeholder="Amount" min="1"
                          className={`flex-1 bg-gray-800 border text-white font-mono text-xs px-2 py-1.5 rounded focus:outline-none transition-colors ${
                            contributeAmount && parseInt(contributeAmount) < 1 ? "border-red-500" : "border-gray-600 focus:border-green-400"
                          }`} />
                        <button onClick={() => handleContribute(goal._id)} className="bg-green-700 hover:bg-green-600 text-white font-mono text-xs px-2 py-1.5 rounded transition-colors">Add</button>
                        <button onClick={() => setContributeGoalId(null)} className="bg-gray-700 text-white font-mono text-xs px-2 py-1.5 rounded">✕</button>
                      </div>
                      {contributeAmount && parseInt(contributeAmount) < 1 && (
                        <p className="text-red-400 font-mono text-xs">⚠ Amount must be greater than ₹0</p>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => setContributeGoalId(goal._id)}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-cyan-400 font-mono text-xs py-2 rounded transition-colors border border-gray-700">
                      Add amount
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {budget?.budgetTip && (
          <div className="border-2 border-green-600 bg-green-950 rounded p-4">
            <p className="text-green-400 font-mono text-sm font-bold mb-1">~ Budget Tip!</p>
            <p className="text-green-300 font-mono text-xs md:text-sm">{budget.budgetTip}</p>
          </div>
        )}
      </div>
    </div>
  );
}