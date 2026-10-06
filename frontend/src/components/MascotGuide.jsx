import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Volume2, X } from 'lucide-react';

export default function MascotGuide() {
  const { mascotMessage, mascotMood, speakText } = useApp();
  const [minimized, setMinimized] = useState(false);

  const moodEmojis = {
    happy: '🦉',
    excited: '✨🦉✨',
    thinking: '🧐🦉',
    proud: '👑🦉'
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-5 right-5 z-30 p-3 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-400 text-white shadow-xl hover:scale-110 transition-all flex items-center justify-center text-2xl group"
        title="Open Pal the Tutor"
      >
        <span>🦉</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 max-w-sm w-[90vw] sm:w-80 transition-all duration-300">
      <div className="glass-panel p-4 rounded-2xl shadow-xl border border-brand-200/60 dark:border-brand-800/60 relative overflow-hidden group">
        {/* Decorative ambient gradient */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-400/10 dark:bg-brand-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-3">
          {/* Mascot Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-300 dark:from-brand-600 dark:to-emerald-500 flex items-center justify-center text-2xl shadow-md select-none group-hover:scale-105 transition-transform">
              {moodEmojis[mascotMood] || '🦉'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          {/* Speech Bubble */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1">
                Pal • AI Tutor
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => speakText(mascotMessage)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMinimized(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Minimize"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              "{mascotMessage}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
