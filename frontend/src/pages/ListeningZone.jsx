import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  ArrowRight,
  PenTool
} from 'lucide-react';

export default function ListeningZone() {
  const { user, speakText, stopSpeaking, triggerCelebration, refreshDashboard } = useApp();

  const [level, setLevel] = useState(user.cefr_level || 'B1');
  const [activeMode, setActiveMode] = useState('dialogue'); // 'dialogue' | 'dictation'
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);

  // Playback state
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.75, 1.0, 1.25
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Comprehension questions state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Dictation state
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationResult, setDictationResult] = useState(null);
  const [evaluatingDictation, setEvaluatingDictation] = useState(false);

  useEffect(() => {
    fetchListeningLesson();
  }, [level]);

  const fetchListeningLesson = async () => {
    setLoading(true);
    stopSpeaking();
    setIsPlaying(false);
    setShowResults(false);
    setSelectedAnswers({});
    setDictationResult(null);
    setDictationInput('');

    try {
      const res = await api.getListeningLesson(level, 'Everyday Situations and Professional Discussions', user.native_language);
      if (res && res.success && res.data) {
        setLesson(res.data);
      }
    } catch (err) {
      console.error('Failed to load listening lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayFullAudio = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else if (lesson?.full_audio_text) {
      setIsPlaying(true);
      speakText(lesson.full_audio_text, playbackSpeed, () => setIsPlaying(false));
    }
  };

  const handlePlaySingleLine = (text) => {
    stopSpeaking();
    setIsPlaying(true);
    speakText(text, playbackSpeed, () => setIsPlaying(false));
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleGradeComprehension = () => {
    setShowResults(true);
    const correctCount = lesson.questions.filter(q => selectedAnswers[q.id] === q.correct_index).length;
    if (correctCount === lesson.questions.length) {
      triggerCelebration();
    }
    refreshDashboard();
  };

  // Dictation Drill Submission
  const handleEvaluateDictation = async () => {
    const currentDrill = lesson?.dictation_drills?.[activeDrillIndex];
    if (!currentDrill || !dictationInput.trim()) return;

    setEvaluatingDictation(true);
    try {
      const res = await api.evaluateDictation(currentDrill.audio_sentence, dictationInput);
      if (res && res.success && res.data) {
        setDictationResult(res.data);
        if (res.data.accuracy >= 80) {
          triggerCelebration();
        }
        refreshDashboard();
      }
    } catch (err) {
      console.error('Error evaluating dictation:', err);
    } finally {
      setEvaluatingDictation(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase mb-2">
            <Headphones className="w-3.5 h-3.5" />
            <span>Listening Specialist Agent</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Listening Zone & Dictation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Train your ear with native-cadence dialogues, speed adjustments, and sentence dictation drills.
          </p>
        </div>

        {/* Speed & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveMode('dialogue')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'dialogue'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Dialogue Lab
            </button>
            <button
              onClick={() => setActiveMode('dictation')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'dictation'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Dictation Mode
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            {[0.75, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  playbackSpeed === spd
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={fetchListeningLesson}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Generate new lesson"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Listening Agent Crafting Audio Dialogue...
          </h3>
          <p className="text-xs text-slate-500 mt-1">Generating speakers and auditory discrimination questions</p>
        </div>
      ) : activeMode === 'dialogue' ? (
        /* Dialogue & Comprehension View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation Player (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {lesson?.scenario || 'Dialogue'}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {lesson?.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title={showTranscript ? "Hide Transcript" : "Reveal Transcript"}
                  >
                    {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="hidden sm:inline">{showTranscript ? 'Hide Text' : 'Read Text'}</span>
                  </button>

                  <button
                    onClick={handlePlayFullAudio}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white transition-all shadow-md ${
                      isPlaying ? 'bg-rose-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-500'
                    }`}
                  >
                    {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause Audio' : `Play Conversation (${playbackSpeed}x)`}</span>
                  </button>
                </div>
              </div>

              {/* Dialogue Transcript bubbles */}
              <div className="space-y-3.5 my-4">
                {lesson?.dialogue?.map((turn, tIdx) => {
                  const isFirstSpeaker = turn.speaker === lesson.speakers?.[0];
                  return (
                    <div
                      key={tIdx}
                      className={`flex flex-col ${isFirstSpeaker ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-extrabold text-slate-500">
                          {turn.speaker}
                        </span>
                        <button
                          onClick={() => handlePlaySingleLine(turn.text)}
                          className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-300"
                          title="Listen to this line"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div
                        className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                          isFirstSpeaker
                            ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                            : 'bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 text-purple-950 dark:text-purple-200 rounded-tr-xs'
                        }`}
                      >
                        {showTranscript ? (
                          turn.text
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 italic text-xs">
                            <Headphones className="w-3.5 h-3.5" />
                            <span>[Audio playing - click "Read Text" above to reveal words]</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comprehension Questions (1 col) */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Listening Comprehension</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {lesson?.questions?.length} Questions
                </span>
              </h3>

              <div className="space-y-4">
                {lesson?.questions?.map((q, qIndex) => {
                  const chosen = selectedAnswers[q.id];
                  const isCorrect = chosen === q.correct_index;

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs"
                    >
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {qIndex + 1}. {q.question}
                      </h4>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = chosen === optIdx;
                          let optStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';

                          if (showResults) {
                            if (optIdx === q.correct_index) {
                              optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrect) {
                              optStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200';
                            }
                          } else if (isSelected) {
                            optStyle = 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={showResults}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${optStyle}`}
                            >
                              <span className="font-bold opacity-60">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showResults && (
                        <p className={`p-2 rounded-xl text-[11px] font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'}`}>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {!showResults ? (
                <button
                  onClick={handleGradeComprehension}
                  disabled={Object.keys(selectedAnswers).length < (lesson?.questions?.length || 0)}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40"
                >
                  Check Answers
                </button>
              ) : (
                <button
                  onClick={fetchListeningLesson}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors"
                >
                  Next Dialogue
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Dictation Mode ("Listen & Type") */
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Dictation Drill {activeDrillIndex + 1} of {lesson?.dictation_drills?.length || 1}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Listen and Type What You Hear
                </h3>
              </div>

              <div className="flex items-center gap-1">
                {lesson?.dictation_drills?.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveDrillIndex(idx);
                      setDictationResult(null);
                      setDictationInput('');
                    }}
                    className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                      activeDrillIndex === idx
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio playback banner */}
            <div className="p-6 rounded-3xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-center mb-6">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block mb-3">
                Focus: {lesson?.dictation_drills?.[activeDrillIndex]?.focus || 'Listening Precision'}
              </span>

              <button
                onClick={() => {
                  const targetSentence = lesson?.dictation_drills?.[activeDrillIndex]?.audio_sentence;
                  if (targetSentence) {
                    speakText(targetSentence, playbackSpeed);
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                <span>Play Audio Clip ({playbackSpeed}x)</span>
              </button>
            </div>

            {/* Input area */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                Type the exact sentence you heard:
              </label>
              <textarea
                value={dictationInput}
                onChange={(e) => setDictationInput(e.target.value)}
                rows={3}
                placeholder="Type your transcription here..."
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />

              <button
                onClick={handleEvaluateDictation}
                disabled={evaluatingDictation || !dictationInput.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40"
              >
                {evaluatingDictation ? 'Evaluating Transcript...' : 'Verify Dictation Accuracy'}
              </button>
            </div>

            {/* Dictation Evaluation Feedback */}
            {dictationResult && (
              <div className="mt-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Auditory Accuracy
                  </span>
                  <div className="flex items-center gap-1 font-black text-xl text-purple-600 dark:text-purple-400">
                    <Zap className="w-4 h-4 fill-purple-600" />
                    <span>{dictationResult.accuracy}% (+{dictationResult.xp_earned} XP)</span>
                  </div>
                </div>

                {/* Word diff breakdown */}
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                    Word-by-word Analysis:
                  </span>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {dictationResult.word_diff?.map((w, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                          w.status === 'correct'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : w.status === 'missing'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 line-through'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title={w.expected ? `Expected: ${w.expected}` : w.status}
                      >
                        {w.word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>Target: </strong> "{dictationResult.target_sentence}"
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 italic">
                  "{dictationResult.feedback}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
