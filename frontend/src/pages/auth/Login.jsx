import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const validate = (email, password) => {
  const errors = {};
  if (!email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";
  return errors;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fieldErrors = validate(email, password);
  const isValid = Object.keys(fieldErrors).length === 0;

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-cyan-400 font-mono font-bold text-4xl tracking-widest mb-2">
            PAISA<span className="text-yellow-400">BUDDY</span>
          </h1>
          <p className="text-gray-500 font-mono text-sm">Your Financial Learning Game</p>
        </div>

        <div className="bg-gray-900 border-2 border-gray-700 rounded p-8"
          style={{ boxShadow: "4px 4px 0px #06b6d4" }}>
          <h2 className="text-white font-mono font-bold text-xl mb-6 flex items-center gap-2">
            <span className="text-cyan-400">▶</span> LOGIN
          </h2>

          {error && (
            <div className="bg-red-950 border border-red-500 text-red-400 font-mono text-sm p-3 rounded mb-4">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="text-gray-400 font-mono text-xs mb-1 block">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="you@example.com"
                className={`w-full bg-gray-800 border text-white font-mono text-sm px-4 py-3 rounded focus:outline-none transition-colors ${
                  touched.email && fieldErrors.email
                    ? "border-red-500 focus:border-red-400"
                    : "border-gray-600 focus:border-cyan-400"
                }`}
              />
              {touched.email && fieldErrors.email && (
                <p className="text-red-400 font-mono text-xs mt-1">⚠ {fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="text-gray-400 font-mono text-xs mb-1 block">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••"
                className={`w-full bg-gray-800 border text-white font-mono text-sm px-4 py-3 rounded focus:outline-none transition-colors ${
                  touched.password && fieldErrors.password
                    ? "border-red-500 focus:border-red-400"
                    : "border-gray-600 focus:border-cyan-400"
                }`}
              />
              {touched.password && fieldErrors.password && (
                <p className="text-red-400 font-mono text-xs mt-1">⚠ {fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-mono font-bold py-3 rounded transition-colors mt-2"
              style={{ boxShadow: loading ? "none" : "2px 2px 0px #0891b2" }}
            >
              {loading ? "LOGGING IN..." : "▶ LOGIN"}
            </button>
          </form>

          <p className="text-gray-500 font-mono text-sm text-center mt-6">
            No account?{" "}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}