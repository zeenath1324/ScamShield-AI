import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import {
  LayoutDashboard,
  ShieldAlert,
  History,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Lock,
} from 'lucide-react';

export default function RootLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been safely signed out.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to sign out.');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze Content', path: '/analyze', icon: ShieldAlert },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'Account Profile', path: '/profile', icon: UserIcon },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
          </div>

          {/* Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/privacy"
                  className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Terms
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/analyze"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-950/40 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Scan</span>
                </Link>
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-slate-300 truncate max-w-[120px]">
                    {user?.full_name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-950/40 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 mb-2 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">{user?.full_name}</span>
                  <span className="text-[10px] text-teal-400 font-mono px-2 py-0.5 bg-teal-500/10 rounded-full border border-teal-500/20">
                    {user?.role}
                  </span>
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-300 hover:text-white"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-300 hover:text-white"
                >
                  About
                </Link>
                <Link
                  to="/privacy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-300 hover:text-white"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-300 hover:text-white"
                >
                  Terms
                </Link>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-semibold bg-slate-900 text-slate-200 border border-slate-800 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-semibold bg-teal-600 text-white rounded-xl shadow-lg"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <Logo size="sm" />
              <p className="text-xs text-slate-500 mt-1">
                Cybersecurity awareness & static phishing indicator detection platform.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <Link to="/about" className="hover:text-teal-400 transition-colors">
                About ScamShield
              </Link>
              <Link to="/privacy" className="hover:text-teal-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-teal-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-900 text-center text-xs text-slate-600">
            <p>
              &copy; {new Date().getFullYear()} ScamShield AI. For educational and cybersecurity awareness purposes only. 
              Automated heuristics do not provide an absolute guarantee of safety.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
