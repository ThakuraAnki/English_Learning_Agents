import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Mic,
  Headphones,
  PenTool,
  SpellCheck,
  Flame,
  Zap,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const {
    user,
    skills,
    weakAreas,
    stats,
    openDailyPlan
  } = useApp();

  const skillConfig = {
    reading: {
      name: 'Reading Lab',
      desc: 'Passages, 5 comprehension questions, vocabulary highlights & tap-to-translate.',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50 dark:bg-blue-950/40',
      textColor: 'text-blue-600 dark:text-blue-400',
      route: 'reading'
    },
    pronunciation: {
      name: 'Pronunciation Studio',
      desc: 'Record voice in browser, Gemini multimodal phonetics analysis, IPA hints & tips.',
      icon: Mic,
      color: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      route: 'pronunciation'
    },
    listening: {
      name: 'Listening Zone',
      desc: 'Real-world dialogues with adjustable audio speeds (0.75x-1.25x) & dictation mode.',
      icon: Headphones,
      color: 'from-purple-500 to-pink-600',
      lightBg: 'bg-purple-50 dark:bg-purple-950/40',
      textColor: 'text-purple-600 dark:text-purple-400',
      route: 'listening'
    },
    writing: {
      name: 'Writing Workshop',
      desc: 'Essay critiques, grammar corrections with rules, tone check & rewritten version.',
      icon: PenTool,
      color: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50 dark:bg-amber-950/40',
      textColor: 'text-amber-600 dark:text-amber-400',
      route: 'writing'
    },
    spelling: {
      name: 'Spelling Arena',
      desc: 'Orthographic rule explanations and quizzes generated from your personal mistakes.',
      icon: SpellCheck,
      color: 'from-rose-500 to-red-600',
      lightBg: 'bg-rose-50 dark:bg-rose-950/40',
      textColor: 'text-rose-600 dark:text-rose-400',
      route: 'spelling'
    }
  };

  // Next level XP threshold (e.g. 500 XP)
  const nextLevelXp = 500;
  const xpProgress = Math.min(100, Math.round((user.xp / nextLevelXp) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-emerald-600 to-teal-700 text-white p-6 sm:p-10 shadow-xl shadow-brand-900/10">
        {/* Abstract background decorative shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 rounded-full bg-emerald-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Multi-Agent AI English Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed">
              Your personalized multi-agent tutoring squad is ready. Let's sharpen your fluency and pronunciation with today's practice.
            </p>

            {/* Quick action pill buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={openDailyPlan}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs sm:text-sm font-extrabold shadow-md hover:scale-102 transition-all active:scale-95"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Start 10-Minute Daily Plan</span>
              </button>
              <button
                onClick={() => onNavigate('placement')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700/60 hover:bg-emerald-700/80 border border-emerald-400/30 text-white text-xs sm:text-sm font-bold backdrop-blur-xs transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Placement Diagnostic ({user.cefr_level})</span>
              </button>
            </div>
          </div>

          {/* Gamification Stats Card */}
          <div className="shrink-0 bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 min-w-[240px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 block">
                  Current Level
                </span>
                <span className="text-2xl font-black">{user.cefr_level} Mastery</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                🏆
              </div>
            </div>

            {/* XP progress bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-emerald-100 mb-1.5">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  {user.xp} XP
                </span>
                <span>{nextLevelXp} XP (Next Tier)</span>
              </div>
              <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs font-medium text-emerald-100">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-300 fill-orange-300" />
                {user.streak_days} Day Streak
              </span>
              <button
                onClick={() => onNavigate('srs')}
                className="flex items-center gap-1 hover:text-white font-bold"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{stats.srsCardsDue} Cards Due</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Weak Areas Banner (if any skills need reinforcement) */}
      {weakAreas && weakAreas.length > 0 && (
        <section className="p-4 sm:p-5 rounded-3xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  Targeted Skill Reinforcement
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  Your lowest mastery area right now is <strong className="capitalize">{weakAreas[0].skill}</strong> ({weakAreas[0].score}%). Spend 3 minutes here to level up!
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate(weakAreas[0].skill)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Boost {weakAreas[0].skill}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* 5 Specialist Agent Studios Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Specialist Agent Labs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each module is powered by a dedicated AI agent with specialized pedagogical prompts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {['reading', 'pronunciation', 'listening', 'writing', 'spelling'].map((skillKey) => {
            const conf = skillConfig[skillKey];
            const Icon = conf.icon;
            const skillData = skills.find(s => s.skill === skillKey) || { mastery_score: 60, level: 'B1', sessions_completed: 4 };

            return (
              <div
                key={skillKey}
                onClick={() => onNavigate(conf.route)}
                className="glass-panel-hover rounded-3xl p-6 flex flex-col justify-between cursor-pointer border border-slate-200/80 dark:border-slate-800/80 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${conf.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {skillData.level}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {conf.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {conf.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2 text-slate-600 dark:text-slate-400">
                    <span>Mastery</span>
                    <span className="font-bold text-slate-900 dark:text-white">{skillData.mastery_score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${conf.color} rounded-full`}
                      style={{ width: `${skillData.mastery_score}%` }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    <span>{skillData.sessions_completed} sessions</span>
                    <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                      Open Lab <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Spaced Repetition Flashcard Card */}
          <div
            onClick={() => onNavigate('srs')}
            className="glass-panel-hover rounded-3xl p-6 flex flex-col justify-between cursor-pointer border border-dashed border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/20 group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  SM-2 Engine
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                SRS Memory Deck
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Review tricky vocabulary and spelling mistakes with algorithmically scheduled active recall.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs font-bold">
              <span className="text-indigo-600 dark:text-indigo-400">
                {stats.srsCardsDue} review cards ready
              </span>
              <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                Review Now <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
