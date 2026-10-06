import React, { useState } from 'react';
import { useApp, SUPPORTED_LANGUAGES } from '../context/AppContext';
import {
  BookOpen,
  Mic,
  Headphones,
  PenTool,
  SpellCheck,
  Flame,
  Award,
  Zap,
  Moon,
  Sun,
  Globe,
  Key,
  Clock,
  Layers,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const {
    darkMode,
    toggleDarkMode,
    user,
    envKeyConfigured,
    apiKey,
    setShowApiKeyModal,
    setShowLanguageModal,
    openDailyPlan
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hasApiKey = Boolean(apiKey || envKeyConfigured);
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === user.native_language) || SUPPORTED_LANGUAGES[0];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reading', label: 'Reading', icon: BookOpen },
    { id: 'pronunciation', label: 'Pronunciation', icon: Mic },
    { id: 'listening', label: 'Listening', icon: Headphones },
    { id: 'writing', label: 'Writing', icon: PenTool },
    { id: 'spelling', label: 'Spelling', icon: SpellCheck },
    { id: 'srs', label: 'SRS Flashcards', icon: Layers },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white text-xl">
              🦉
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                LinguaPal
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                AI Multi-Agent
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-xs border border-brand-200/60 dark:border-brand-800/60'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Gamification Stats & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Daily 10-Min Plan Button */}
            <button
              onClick={openDailyPlan}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all"
              title="Daily 10-minute micro-lesson plan"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>10m Plan</span>
            </button>

            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 text-xs font-bold"
              title={`${user.streak_days} Day Streak!`}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{user.streak_days}d</span>
            </div>

            {/* XP Counter */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold"
              title="Experience Points"
            >
              <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
              <span>{user.xp} XP</span>
            </div>

            {/* CEFR Level Badge */}
            <div
              onClick={() => handleNavClick('placement')}
              className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-extrabold hover:ring-2 hover:ring-emerald-400 transition-all"
              title="Click to take placement diagnostic"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{user.cefr_level}</span>
            </div>

            {/* Native Language Selector */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Native Language: ${currentLang.name}`}
            >
              <span className="text-base">{currentLang.flag}</span>
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4" />
              <span
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                  hasApiKey ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium ${
                    isActive
                      ? 'bg-brand-500 text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => {
                openDailyPlan();
                setMobileMenuOpen(false);
              }}
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white"
            >
              <Clock className="w-4 h-4" />
              Start 10-Minute Daily Plan
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
