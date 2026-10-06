import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { Award, CheckCircle, ArrowRight, RefreshCw, Zap, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

export default function PlacementTest({ onFinish }) {
  const { user, triggerCelebration, refreshDashboard } = useApp();

  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadTest();
  }, []);

  const loadTest = async () => {
    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    try {
      const res = await api.getPlacementTest();
      if (res && res.success && res.data) {
        setTestData(res.data);
      }
    } catch (err) {
      console.error('Failed to load placement test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleNext = () => {
    if (currentIndex < (testData?.questions?.length || 0) - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testData || !testData.questions) return;
    setSubmitting(true);

    const submission = testData.questions.map(q => ({
      question_id: q.id,
      chosen_index: selectedAnswers[q.id] ?? -1,
      correct_index: q.correct_index
    }));

    try {
      const res = await api.evaluatePlacementTest(submission, user.native_language);
      if (res && res.success && res.data) {
        setResult(res.data);
        triggerCelebration();
        refreshDashboard();
      }
    } catch (err) {
      console.error('Failed to evaluate placement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Orchestrator Agent Preparing Placement Test...
        </h3>
        <p className="text-xs text-slate-500 mt-1">Calibrating questions across CEFR levels A1-C2</p>
      </div>
    );
  }

  // Result view
  if (result) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden border border-brand-200 dark:border-brand-800 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-white flex items-center justify-center text-3xl shadow-lg mb-4">
            🏆
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Diagnostic Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Your Placement: CEFR Level {result.cefr_level}
          </h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
            Diagnostic Score: {result.score_percentage}%
          </p>

          {/* Feedback English */}
          <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-left border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Orchestrator Evaluation
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {result.summary_en}
            </p>
            {result.summary_native && (
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 font-medium">
                🌐 {result.summary_native}
              </p>
            )}
          </div>

          {/* Strengths & Priorities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-6">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-3.5 h-3.5" /> Key Strengths
              </span>
              <ul className="text-xs space-y-1.5 text-emerald-900 dark:text-emerald-200 font-medium">
                {result.strengths?.map((s, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span>•</span> <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <span className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Focus Priorities
              </span>
              <ul className="text-xs space-y-1.5 text-amber-900 dark:text-amber-200 font-medium">
                {result.priorities?.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span>•</span> <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onFinish && onFinish('dashboard')}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md hover:scale-102 transition-all"
            >
              Go to Learning Dashboard
            </button>
            <button
              onClick={loadTest}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retake Diagnostic
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = testData?.questions?.[currentIndex];
  const totalQs = testData?.questions?.length || 0;
  const isAnswered = selectedAnswers[currentQ?.id] !== undefined;
  const allAnswered = testData?.questions?.every(q => selectedAnswers[q.id] !== undefined);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 animate-fade-in">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            CEFR Placement Diagnostic
          </span>
          <span>Question {currentIndex + 1} of {totalQs}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQs) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
              {currentQ.skill}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Target Level: {currentQ.target_level}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-6">
            {currentQ.prompt}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-sm font-semibold flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Previous
        </button>

        {currentIndex < totalQs - 1 ? (
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-md hover:shadow-lg transition-all"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span>Complete Assessment</span>
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
