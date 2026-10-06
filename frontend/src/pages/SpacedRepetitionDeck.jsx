import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Layers,
  RotateCw,
  Volume2,
  Sparkles,
  HelpCircle,
  CheckCircle,
  Zap,
  RefreshCw,
  Award
} from 'lucide-react';

export default function SpacedRepetitionDeck() {
  const { speakText, triggerCelebration, refreshDashboard } = useApp();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setSessionCompleted(false);

    try {
      const res = await api.getSrsCards('due');
      if (res && res.success && res.data) {
        setCards(res.data);
      }
    } catch (err) {
      console.error('Failed to load SRS cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      await api.reviewSrsCard(currentCard.id, rating);
      refreshDashboard();

      if (currentIndex < cards.length - 1) {
        setIsFlipped(false);
        setShowHint(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setSessionCompleted(true);
        triggerCelebration();
      }
    } catch (err) {
      console.error('Error reviewing card:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Loading Spaced Repetition Memory Deck...
        </h3>
        <p className="text-xs text-slate-500 mt-1">Retrieving cards due for algorithmic review</p>
      </div>
    );
  }

  if (sessionCompleted || cards.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-fade-in text-center">
        <div className="glass-panel p-8 rounded-3xl border border-indigo-200 dark:border-indigo-800 shadow-xl space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-3xl shadow-lg">
            🎉
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Deck Review Complete!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            You've refreshed all scheduled vocabulary and spelling cards for today. Your memory consolidation is on track!
          </p>
          <button
            onClick={fetchCards}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Review Again
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto pb-12">
      {/* Header & Progress */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>SM-2 Memory Retention</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Flashcard Deck
          </h1>
        </div>

        <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flashcard Flip Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer min-h-[300px] glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl flex flex-col justify-between transition-all duration-300 hover:shadow-2xl relative select-none"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
            {currentCard.card_type} • Level {currentCard.cefr_level || 'B1'}
          </span>
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5" /> Tap to flip
          </span>
        </div>

        {/* Card Content (Front vs Back) */}
        {!isFlipped ? (
          <div className="my-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Prompt:
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
              "{currentCard.front_prompt}"
            </h2>

            {currentCard.hint && (
              <div className="pt-2">
                {showHint ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                    💡 Hint: {currentCard.hint}
                  </p>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(true);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline font-semibold"
                  >
                    Reveal Hint
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="my-8 text-center space-y-3 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Target Answer:
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white capitalize">
              {currentCard.back_answer}
            </h2>

            {currentCard.phonetic && (
              <div className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {currentCard.phonetic}
              </div>
            )}

            <div className="pt-2 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(currentCard.back_answer);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <span>Hear Pronunciation</span>
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-[11px] text-slate-400 font-medium">
          {isFlipped ? "Rate your recall ease below" : "Can you recall the exact word?"}
        </div>
      </div>

      {/* SM-2 Rating Response Controls */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-2.5 animate-fade-in">
          <button
            onClick={() => handleRate('again')}
            className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex flex-col items-center gap-1 shadow-xs transition-all hover:scale-102"
          >
            <span>Again</span>
            <span className="text-[10px] opacity-70">&lt; 1 day</span>
          </button>
          <button
            onClick={() => handleRate('hard')}
            className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold flex flex-col items-center gap-1 shadow-xs transition-all hover:scale-102"
          >
            <span>Hard</span>
            <span className="text-[10px] opacity-70">2 days</span>
          </button>
          <button
            onClick={() => handleRate('good')}
            className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex flex-col items-center gap-1 shadow-xs transition-all hover:scale-102"
          >
            <span>Good</span>
            <span className="text-[10px] opacity-70">4 days</span>
          </button>
          <button
            onClick={() => handleRate('easy')}
            className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex flex-col items-center gap-1 shadow-xs transition-all hover:scale-102"
          >
            <span>Easy</span>
            <span className="text-[10px] opacity-70">7 days</span>
          </button>
        </div>
      )}
    </div>
  );
}
