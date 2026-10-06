import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Zap,
  Languages,
  Bookmark
} from 'lucide-react';
import TapToTranslateModal from '../components/TapToTranslateModal';

export default function ReadingLab() {
  const { user, speakText, stopSpeaking, triggerCelebration, refreshDashboard } = useApp();

  const [level, setLevel] = useState(user.cefr_level || 'B1');
  const [topic, setTopic] = useState('Urban Rewilding and Green Cities');
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);

  // Audio speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Tap-to-translate state
  const [selectedWordData, setSelectedWordData] = useState(null);
  const [lookingUpWord, setLookingUpWord] = useState(false);

  // Questions & Answers state
  const [userAnswers, setUserAnswers] = useState({});
  const [gradingResult, setGradingResult] = useState(null);

  useEffect(() => {
    fetchLesson();
  }, [level]);

  const fetchLesson = async () => {
    setLoading(true);
    setGradingResult(null);
    setUserAnswers({});
    stopSpeaking();
    setIsPlayingAudio(false);

    try {
      const res = await api.getReadingLesson(level, topic, user.native_language);
      if (res && res.success && res.data) {
        setLesson(res.data);
      }
    } catch (err) {
      console.error('Failed to load reading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = async (rawWord) => {
    const cleanWord = rawWord.replace(/[^\w'-]/g, '').trim();
    if (!cleanWord || cleanWord.length < 2) return;

    // Check if this word is already highlighted in vocabulary list
    const existing = lesson?.vocabulary?.find(v => v.word.toLowerCase() === cleanWord.toLowerCase());
    if (existing) {
      setSelectedWordData(existing);
      return;
    }

    setLookingUpWord(true);
    try {
      const res = await api.lookupWord(cleanWord, lesson?.passage?.substring(0, 150) || '', user.native_language);
      if (res && res.success && res.data) {
        setSelectedWordData(res.data);
      }
    } catch (err) {
      setSelectedWordData({
        word: cleanWord,
        simple_definition_en: `Context lookup for '${cleanWord}'.`,
        phonetic: `/${cleanWord.toLowerCase()}/`,
        native_translation: `Traducción: ${cleanWord}`
      });
    } finally {
      setLookingUpWord(false);
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else if (lesson?.passage) {
      setIsPlayingAudio(true);
      speakText(lesson.passage, 0.95, () => setIsPlayingAudio(false));
    }
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    if (gradingResult) return; // locked after grading
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleGrade = async () => {
    if (!lesson || !lesson.questions) return;
    const submission = lesson.questions.map(q => ({
      question_id: q.id,
      chosen_index: userAnswers[q.id] ?? -1,
      correct_index: q.correct_index
    }));

    try {
      const res = await api.gradeReading(lesson.id, submission, lesson.questions.length);
      if (res && res.success && res.data) {
        setGradingResult(res.data);
        if (res.data.percentage >= 80) {
          triggerCelebration();
        }
        refreshDashboard();
      }
    } catch (err) {
      console.error('Failed to grade reading:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reading Specialist Agent</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Interactive Reading Lab
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tap ANY word in the passage to inspect definitions, IPA phonetics, and native translations.
          </p>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">CEFR Level:</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
          >
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          <button
            onClick={fetchLesson}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Generate new passage"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Reading Agent Generating {level} Passage...
          </h3>
          <p className="text-xs text-slate-500 mt-1">Calibrating lexical richness and 5 comprehension questions</p>
        </div>
      ) : lesson ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Passage & Text (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {lesson.topic || 'Reading Passage'}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {lesson.title}
                  </h2>
                </div>
                <button
                  onClick={handleToggleAudio}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 hover:scale-102'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isPlayingAudio ? 'Stop' : 'Listen Aloud'}</span>
                </button>
              </div>

              {/* Passage text with tap-to-translate tokens */}
              <div className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-normal space-y-4">
                {lesson.passage.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph.split(' ').map((wordToken, wIdx) => {
                      const cleanWord = wordToken.replace(/[^\w'-]/g, '').toLowerCase();
                      const isVocab = lesson.vocabulary?.some(v => v.word.toLowerCase() === cleanWord);
                      return (
                        <span
                          key={wIdx}
                          onClick={() => handleWordClick(wordToken)}
                          className={`inline-block cursor-pointer px-0.5 rounded transition-colors ${
                            isVocab
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-semibold underline decoration-blue-400 underline-offset-2 hover:bg-blue-200'
                              : 'hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:text-amber-900 dark:hover:text-amber-200'
                          }`}
                          title="Click for definition"
                        >
                          {wordToken}{' '}
                        </span>
                      );
                    })}
                  </p>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                  Highlighted words are key vocabulary
                </span>
                <span>Click any word to translate</span>
              </div>
            </div>

            {/* 5 Comprehension Questions */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Comprehension Check</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    5 Questions
                  </span>
                </h3>

                {gradingResult && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 font-extrabold text-xs">
                    <Zap className="w-4 h-4 fill-brand-600" />
                    <span>Score: {gradingResult.score}/{gradingResult.total} (+{gradingResult.xp_earned} XP)</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {lesson.questions.map((q, qIndex) => {
                  const chosen = userAnswers[q.id];
                  const hasGraded = Boolean(gradingResult);
                  const isCorrect = chosen === q.correct_index;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {qIndex + 1}. {q.question}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = chosen === optIdx;
                          let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';

                          if (hasGraded) {
                            if (optIdx === q.correct_index) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold shadow-xs';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={hasGraded}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`p-3 rounded-xl border text-xs text-left transition-all flex items-start gap-2 ${btnStyle}`}
                            >
                              <span className="font-bold opacity-60">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation after submit */}
                      {hasGraded && (
                        <div className={`p-3 rounded-xl text-xs font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'}`}>
                          <span className="font-bold block mb-0.5">
                            {isCorrect ? '✓ Correct!' : '✗ Explanation:'}
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!gradingResult ? (
                <button
                  onClick={handleGrade}
                  disabled={Object.keys(userAnswers).length < lesson.questions.length}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  Submit & Grade Answers ({Object.keys(userAnswers).length}/{lesson.questions.length})
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-center">
                  <p className="text-xs font-bold text-brand-900 dark:text-brand-200">
                    {gradingResult.feedback}
                  </p>
                  <button
                    onClick={fetchLesson}
                    className="mt-3 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm"
                  >
                    Next Reading Lesson
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Vocabulary Highlight Sidebar (1 col) */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Key Vocabulary Highlights
                </h3>
              </div>

              <div className="space-y-3.5">
                {lesson.vocabulary?.map((vocab, vIdx) => (
                  <div
                    key={vIdx}
                    onClick={() => setSelectedWordData(vocab)}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300 capitalize">
                        {vocab.word}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-400">
                        {vocab.phonetic}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {vocab.definition}
                    </p>
                    {vocab.native_translation && (
                      <div className="mt-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        <span>{vocab.native_translation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tap to translate modal */}
      <TapToTranslateModal
        wordData={selectedWordData}
        onClose={() => setSelectedWordData(null)}
      />
    </div>
  );
}
