import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Briefcase, BookOpen, Wallet, Shield,
  Search, Target, Shuffle, FileText, CreditCard, LogOut, Menu, X,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/portfolio", label: "Portfolio", icon: Briefcase },
  { path: "/learning", label: "Learning", icon: BookOpen },
  { path: "/budgeting", label: "Budgeting", icon: Wallet },
  { path: "/fraud-awareness", label: "Fraud Awareness", icon: Shield },
  { path: "/fraud-detection", label: "Fraud Detection", icon: Search },
  { path: "/scheme-hunt", label: "Scheme Hunt", icon: Target },
  { path: "/swipe", label: "Swipe Decisions", icon: Shuffle },
  { path: "/agreements", label: "Agreements", icon: FileText },
  { path: "/loans", label: "Loans & Credit", icon: CreditCard },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNav = () => setOpen(false);

  const sidebarContent = (
    <aside className="flex flex-col h-full w-56 bg-gray-900 border-r border-gray-800">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <h1 className="text-cyan-400 font-mono font-bold text-lg">PAISABUDDY</h1>
        {/* Close button — mobile only */}
        <button onClick={() => setOpen(false)} className="md:hidden text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={handleNav}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 my-0.5 rounded font-mono text-sm transition-all ${
                isActive
                  ? "bg-cyan-400 text-black font-bold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-gray-500 font-mono text-xs mb-2">{user?.name || "User"}</p>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 font-mono text-xs transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — fixed, always visible on md+ */}
      <div className="hidden md:flex fixed top-0 left-0 h-screen w-56 z-50 flex-col">
        {sidebarContent}
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-white">
          <Menu size={22} />
        </button>
        <h1 className="text-cyan-400 font-mono font-bold text-lg">PAISABUDDY</h1>
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-56 h-full flex flex-col z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}