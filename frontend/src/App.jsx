import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Portfolio from "./pages/portfolio/Portfolio";
import Learning from "./pages/learning/Learning";
import Budgeting from "./pages/budgeting/Budgeting";
import FraudAwareness from "./pages/fraud/FraudAwareness";
import FraudDetection from "./pages/fraud/FraudDetection";
import SchemeHunt from "./pages/scheme/SchemeHunt";
import SwipeDecisions from "./pages/swipe/SwipeDecisions";
import Agreements from "./pages/agreements/Agreements";
import Loans from "./pages/loans/Loans";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-cyan-400 font-mono text-xl">Loading...</span>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-950">
    <Sidebar />
    {/* md+: offset for fixed sidebar. mobile: offset for top bar */}
    <main className="flex-1 md:ml-56 mt-12 md:mt-0 overflow-y-auto min-h-screen">
      {children}
    </main>
  </div>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
    <Route path="/portfolio" element={<ProtectedRoute><AppLayout><Portfolio /></AppLayout></ProtectedRoute>} />
    <Route path="/learning" element={<ProtectedRoute><AppLayout><Learning /></AppLayout></ProtectedRoute>} />
    <Route path="/budgeting" element={<ProtectedRoute><AppLayout><Budgeting /></AppLayout></ProtectedRoute>} />
    <Route path="/fraud-awareness" element={<ProtectedRoute><AppLayout><FraudAwareness /></AppLayout></ProtectedRoute>} />
    <Route path="/fraud-detection" element={<ProtectedRoute><AppLayout><FraudDetection /></AppLayout></ProtectedRoute>} />
    <Route path="/scheme-hunt" element={<ProtectedRoute><AppLayout><SchemeHunt /></AppLayout></ProtectedRoute>} />
    <Route path="/swipe" element={<ProtectedRoute><AppLayout><SwipeDecisions /></AppLayout></ProtectedRoute>} />
    <Route path="/agreements" element={<ProtectedRoute><AppLayout><Agreements /></AppLayout></ProtectedRoute>} />
    <Route path="/loans" element={<ProtectedRoute><AppLayout><Loans /></AppLayout></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;