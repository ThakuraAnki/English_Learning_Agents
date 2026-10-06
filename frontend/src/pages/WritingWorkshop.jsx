import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  PenTool,
  Sparkles,
  CheckCircle,
  Copy,
  Volume2,
  RefreshCw,
  Zap,
  TrendingUp,
  AlertCircle,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function WritingWorkshop() {
  const { user, speakText, triggerCelebration, refreshDashboard } = useApp();

  const [level, setLevel] = useState(user.cefr_level || 'B1');
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  // Editor state
  const [userText, setUserText] = useState('');
  const [intendedTone, setIntendedTone] = useState('Professional');
  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [copiedRewrite, setCopiedRewrite] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, [level]);

  const fetchPrompts = async () => {
    setLoadingPrompts(true);
    setReviewResult(null);
    try {
      const res = await api.getWritingPrompts(level);
      if (res && res.success && res.data) {
        setPrompts(res.data.prompts || []);
        if (res.data.prompts?.length > 0) {
          setSelectedPrompt(res.data.prompts[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load writing prompts:', err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleReview = async () => {
    if (!userText.trim() || userText.trim().length < 10) return;
    setReviewing(true);

    try {
      const res = await api.reviewWriting({
        userText,
        promptTitle: selectedPrompt?.title || 'Free Writing Composition',
        intendedTone,
        nativeLanguage: user.native_language
      });

      if (res && res.success && res.data) {
        setReviewResult(res.data);
        if (res.data.overall_score >= 80) {
          triggerCelebration();
        }
        refreshDashboard();
      }
    } catch (err) {
      console.error('Failed to review writing:', err);
    } finally {
      setReviewing(false);
    }
  };

  const handleCopyRewrite = () => {
    if (reviewResult?.rewritten_version) {
      navigator.clipboard.writeText(reviewResult.rewritten_version);
      setCopiedRewrite(true);
      setTimeout(() => setCopiedRewrite(false), 2000);
    }
  };

  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase mb-2">
            <PenTool className="w-3.5 h-3.5" />
            <span>Writing & Composition Agent</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Writing Workshop
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Submit essays or emails. Gemini checks grammar, vocabulary upgrades, tone, and delivers a native rewrite.
          </p>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Tone:</label>
          <select
            value={intendedTone}
            onChange={(e) => setIntendedTone(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="Professional">Workplace Professional</option>
            <option value="Academic">Academic Formal</option>
            <option value="Casual">Casual / Social</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompts Sidebar (1 col) */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
            Curated Prompts ({prompts.length})
          </h3>
          {prompts.map((p) => {
            const isSelected = selectedPrompt?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPrompt(p);
                  setReviewResult(null);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/60 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 block mb-1 w-max">
                  {p.genre}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {p.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {p.instruction}
                </p>
              </div>
            );
          })}

          <div
            onClick={() => {
              setSelectedPrompt({ title: 'Independent Writing', instruction: 'Write freely on any topic of your choice.' });
              setReviewResult(null);
            }}
            className={`p-3.5 rounded-2xl border border-dashed cursor-pointer text-xs font-bold text-center transition-all ${
              selectedPrompt?.title === 'Independent Writing'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400'
            }`}
          >
            ✏️ Free Writing Mode
          </div>
        </div>

        {/* Writing Editor Stage (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
            {/* Active Prompt Instruction Banner */}
            {selectedPrompt && (
              <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                  Task Prompt: {selectedPrompt.title}
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  {selectedPrompt.instruction}
                </p>
              </div>
            )}

            {/* Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Compose in English ({intendedTone} Register)</span>
                <span className="font-semibold">{wordCount} words</span>
              </div>
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                rows={8}
                placeholder="Start writing here... (e.g. 'I am writing to express my interest in...')"
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-500 font-normal"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Aim for at least 30-50 words for detailed feedback.
              </span>
              <button
                onClick={handleReview}
                disabled={reviewing || wordCount < 3}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:scale-102 transition-all disabled:opacity-50"
              >
                {reviewing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Composition...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Review & Rewrite</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Feedback & Rewrite Display */}
          {reviewResult && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-200 dark:border-amber-800 shadow-xl space-y-6 animate-fade-in">
              {/* Score header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Estimated CEFR Level: {reviewResult.estimated_cefr || 'B1'}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Writing Assessment Report
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block">Overall Score</span>
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                      {reviewResult.overall_score}
                      <span className="text-sm font-semibold text-slate-400">/100</span>
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-2xl">
                    ✍️
                  </div>
                </div>
              </div>

              {/* Sub-metric cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Grammar</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{reviewResult.grammar_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Vocabulary</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{reviewResult.vocabulary_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Cohesion</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{reviewResult.cohesion_score}%</span>
                </div>
              </div>

              {/* Grammar Corrections */}
              {reviewResult.grammar_corrections && reviewResult.grammar_corrections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">
                    Grammar Corrections ({reviewResult.grammar_corrections.length})
                  </h4>
                  <div className="space-y-2.5">
                    {reviewResult.grammar_corrections.map((gc, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 text-xs space-y-1.5"
                      >
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-rose-700 dark:text-rose-400 line-through">
                            "{gc.original_snippet}"
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700 dark:text-emerald-400">
                            "{gc.corrected_snippet}"
                          </span>
                        </div>
                        <p className="text-rose-900/90 dark:text-rose-200 font-medium">
                          💡 <strong>Rule:</strong> {gc.rule_explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Upgrades */}
              {reviewResult.vocabulary_upgrades && reviewResult.vocabulary_upgrades.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">
                    Vocabulary Upgrades
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {reviewResult.vocabulary_upgrades.map((upg, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-slate-500">"{upg.basic_phrase}"</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-blue-700 dark:text-blue-300">"{upg.upgraded_phrase}"</span>
                        </div>
                        <p className="text-[11px] text-blue-900/80 dark:text-blue-200/80">
                          {upg.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Polished Rewritten Version */}
              {reviewResult.rewritten_version && (
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Polished Native Rewrite
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(reviewResult.rewritten_version)}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:scale-105 transition-all text-xs flex items-center gap-1"
                        title="Read rewrite aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                      <button
                        onClick={handleCopyRewrite}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:scale-105 transition-all text-xs flex items-center gap-1"
                        title="Copy rewritten text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedRewrite ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 leading-relaxed font-medium">
                    "{reviewResult.rewritten_version}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
