import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  SpellCheck,
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Zap,
  Bookmark,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function SpellingArena() {
  const { user, triggerCelebration, refreshDashboard } = useApp();

  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'checker'

  // Quiz state
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Checker state
  const [checkText, setCheckText] = useState('I am definately going to accomodate their request untill tomorrow.');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  useEffect(() => {
    if (activeTab === 'quiz') {
      fetchQuiz();
    }
  }, [activeTab]);

  const fetchQuiz = async () => {
    setLoadingQuiz(true);
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      const res = await api.getSpellingQuiz();
      if (res && res.success && res.data) {
        setQuizData(res.data);
      }
    } catch (err) {
      console.error('Failed to load spelling quiz:', err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    if (quizResult) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleGradeQuiz = async () => {
    if (!quizData?.questions) return;
    const submission = quizData.questions.map(q => ({
      question_id: q.id,
      chosen_index: selectedAnswers[q.id] ?? -1,
      correct_index: q.correct_index
    }));

    try {
      const res = await api.gradeSpellingQuiz(submission, quizData.questions.length);
      if (res && res.success && res.data) {
        setQuizResult(res.data);
        if (res.data.percentage >= 80) {
          triggerCelebration();
        }
        refreshDashboard();
      }
    } catch (err) {
      console.error('Error grading spelling quiz:', err);
    }
  };

  const handleCheckSpelling = async () => {
    if (!checkText.trim()) return;
    setChecking(true);
    try {
      const res = await api.checkSpelling(checkText, user.native_language);
      if (res && res.success && res.data) {
        setCheckResult(res.data);
        refreshDashboard();
      }
    } catch (err) {
      console.error('Error running spell check:', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs font-bold uppercase mb-2">
            <SpellCheck className="w-3.5 h-3.5" />
            <span>Spelling & Orthography Agent</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Spelling Arena
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Master tricky orthographic rules and conquer quizzes tailored directly to your personal mistakes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Mistakes Mini-Quiz
          </button>
          <button
            onClick={() => setActiveTab('checker')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'checker'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Rule Analyzer & Checker
          </button>
        </div>
      </div>

      {activeTab === 'quiz' ? (
        /* Quiz Mode */
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Source: {quizData?.source === 'personal_mistakes' ? 'Personal Mistakes History' : 'High-Yield Orthographic Traps'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Spelling Mastery Quiz
                </h3>
              </div>

              <button
                onClick={fetchQuiz}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Generate new quiz"
              >
                <RefreshCw className={`w-4 h-4 ${loadingQuiz ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingQuiz ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-500 font-medium">Scanning personal mistake history for traps...</p>
              </div>
            ) : quizData ? (
              <div className="space-y-6">
                {quizData.questions?.map((q, qIndex) => {
                  const chosen = selectedAnswers[q.id];
                  const hasGraded = Boolean(quizResult);
                  const isCorrect = chosen === q.correct_index;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {qIndex + 1}. {q.prompt}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, optIdx) => {
                          const isSelected = chosen === optIdx;
                          let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';

                          if (hasGraded) {
                            if (optIdx === q.correct_index) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={hasGraded}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center gap-2 ${btnStyle}`}
                            >
                              <span className="font-bold opacity-60">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {hasGraded && (
                        <div className={`p-3 rounded-xl text-xs space-y-1 ${isCorrect ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200' : 'bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200'}`}>
                          <p className="font-bold">
                            {isCorrect ? '✓ Rule: ' : '✗ Rule: '} {q.rule_name || q.explanation}
                          </p>
                          {q.mnemonic && (
                            <p className="italic text-[11px]">
                              🧠 <strong>Memory Trick:</strong> "{q.mnemonic}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!quizResult ? (
                  <button
                    onClick={handleGradeQuiz}
                    disabled={Object.keys(selectedAnswers).length < (quizData.questions?.length || 0)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40"
                  >
                    Grade Spelling Answers
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-base font-extrabold text-rose-700 dark:text-rose-300">
                      <Zap className="w-5 h-5 fill-rose-600" />
                      <span>{quizResult.score}/{quizResult.total} Correct (+{quizResult.xp_earned} XP)</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {quizResult.feedback}
                    </p>
                    <button
                      onClick={fetchQuiz}
                      className="mt-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                    >
                      Try Another Quiz
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* Checker & Rule Analyzer Mode */
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Instant Spelling & Rule Detective
            </h3>
            <p className="text-xs text-slate-500">
              Type or paste sentences containing suspect words. LinguaPal will detect errors, extract the orthographic rule, and save them for SRS review.
            </p>

            <textarea
              value={checkText}
              onChange={(e) => setCheckText(e.target.value)}
              rows={4}
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-rose-500"
            />

            <button
              onClick={handleCheckSpelling}
              disabled={checking || !checkText.trim()}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all disabled:opacity-40"
            >
              {checking ? 'Analyzing Orthography...' : 'Scan for Misspelled Words'}
            </button>

            {checkResult && (
              <div className="mt-6 space-y-3 animate-fade-in">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Errors Found: {checkResult.total_errors}
                </span>

                {checkResult.errors?.length > 0 ? (
                  checkResult.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-rose-700 dark:text-rose-400 line-through">
                            "{err.original_word}"
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700 dark:text-emerald-400">
                            "{err.correct_spelling}"
                          </span>
                        </div>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {err.phonetic_ipa}
                        </span>
                      </div>

                      <p className="text-rose-900/90 dark:text-rose-200 font-medium">
                        📖 <strong>Rule:</strong> {err.rule_name} — {err.rule_explanation}
                      </p>

                      {err.memory_trick && (
                        <p className="text-emerald-800 dark:text-emerald-300 italic font-semibold">
                          💡 <strong>Memory Trick:</strong> "{err.memory_trick}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>All words appear correctly spelled!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
