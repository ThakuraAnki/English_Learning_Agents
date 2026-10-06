import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Volume2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Zap,
  Languages,
  Award
} from 'lucide-react';

export default function PronunciationStudio() {
  const { user, speakText, triggerCelebration, refreshDashboard } = useApp();

  const [level, setLevel] = useState(user.cefr_level || 'B1');
  const [category, setCategory] = useState('minimal_pairs');
  const [drills, setDrills] = useState([]);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [loadingDrills, setLoadingDrills] = useState(true);

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordedBase64, setRecordedBase64] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchDrills();
  }, [level, category]);

  const fetchDrills = async () => {
    setLoadingDrills(true);
    setAnalysisResult(null);
    setRecordedAudioUrl(null);
    setRecordedBase64(null);

    try {
      const res = await api.getPronunciationDrills(level, category);
      if (res && res.success && res.data) {
        setDrills(res.data.challenges || []);
        if (res.data.challenges?.length > 0) {
          setSelectedDrill(res.data.challenges[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load pronunciation drills:', err);
    } finally {
      setLoadingDrills(false);
    }
  };

  const startRecording = async () => {
    setAnalysisResult(null);
    setRecordedAudioUrl(null);
    setRecordedBase64(null);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          setRecordedBase64(base64data);
        };

        // Stop mic tracks
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Please grant microphone permissions in your browser to record your pronunciation!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const submitAudioForAnalysis = async () => {
    if (!selectedDrill) return;
    setAnalyzing(true);

    try {
      const res = await api.analyzePronunciation({
        audioBase64: recordedBase64,
        mimeType: 'audio/webm',
        targetText: selectedDrill.sentence,
        focusWord: selectedDrill.focus_word,
        nativeLanguage: user.native_language
      });

      if (res && res.success && res.data) {
        setAnalysisResult(res.data);
        if (res.data.overall_score >= 80) {
          triggerCelebration();
        }
        refreshDashboard();
      }
    } catch (err) {
      console.error('Failed to analyze audio pronunciation:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header & Category Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase mb-2">
            <Mic className="w-3.5 h-3.5" />
            <span>Pronunciation & Phonetics Agent</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Pronunciation Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record spoken English in real-time. Gemini AI listens to your audio and returns phonetic IPA tips.
          </p>
        </div>

        {/* Drill Category Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="minimal_pairs">Minimal Pairs (/θ/ vs /s/)</option>
            <option value="consonant_clusters">Consonant Clusters</option>
            <option value="word_stress">Word Stress Shifts</option>
            <option value="connected_speech">Connected Speech</option>
            <option value="silent_letters">Silent Letters</option>
          </select>
        </div>
      </div>

      {loadingDrills ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Pronunciation Agent Generating Phonetic Challenges...
          </h3>
          <p className="text-xs text-slate-500 mt-1">Calibrating articulatory mechanics and target IPA phonemes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenge Selector (1 col) */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
              Phonetic Drills ({drills.length})
            </h3>
            {drills.map((drill) => {
              const isSelected = selectedDrill?.id === drill.id;
              return (
                <div
                  key={drill.id}
                  onClick={() => {
                    setSelectedDrill(drill);
                    setAnalysisResult(null);
                    setRecordedAudioUrl(null);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Focus: {drill.focus_word}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {drill.difficulty}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    "{drill.sentence}"
                  </p>
                  <div className="mt-2 text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 truncate">
                    {drill.phonetic_transcription}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Drill Recording Stage (2 cols) */}
          {selectedDrill && (
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
                {/* Coaching tip banner */}
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                      Tutor Coaching Tip
                    </span>
                    <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed font-medium">
                      {selectedDrill.coaching_hint}
                    </p>
                  </div>
                </div>

                {/* Target Sentence Display */}
                <div className="text-center py-6 px-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Read Aloud:
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
                    "{selectedDrill.sentence}"
                  </h2>
                  <div className="mt-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedDrill.phonetic_transcription}
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => speakText(selectedDrill.sentence, 0.9)}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-500" />
                      <span>Hear Native Reference</span>
                    </button>
                  </div>
                </div>

                {/* Recorder Control Deck */}
                <div className="flex flex-col items-center justify-center py-4">
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-4">
                      {/* Animated audio wave bars */}
                      <div className="flex items-center gap-1.5 h-10">
                        {[40, 75, 100, 60, 90, 45, 80, 100, 50, 70].map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-rose-500 rounded-full animate-soundwave"
                            style={{ animationDelay: `${i * 0.1}s`, height: `${h}%` }}
                          />
                        ))}
                      </div>

                      <div className="text-xs font-mono font-bold text-rose-500 animate-pulse">
                        Recording... 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                      </div>

                      <button
                        onClick={stopRecording}
                        className="p-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-xl hover:scale-105 transition-all flex items-center justify-center"
                        title="Stop recording"
                      >
                        <Square className="w-6 h-6 fill-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <button
                        onClick={startRecording}
                        className="p-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                        title="Start speaking"
                      >
                        <Mic className="w-8 h-8" />
                      </button>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Click microphone to start recording
                      </span>
                    </div>
                  )}
                </div>

                {/* Playback of Recorded Audio & Submit */}
                {recordedAudioUrl && !isRecording && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <audio controls src={recordedAudioUrl} className="h-9 w-52 sm:w-64" />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={startRecording}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Re-record
                      </button>
                      <button
                        onClick={submitAudioForAnalysis}
                        disabled={analyzing}
                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-all disabled:opacity-50"
                      >
                        {analyzing ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>AI Analyzing Voice...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Analyze Pronunciation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Result Card */}
              {analysisResult && (
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-xl space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Multimodal Gemini Speech Analysis
                      </span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        Evaluation Results
                      </h3>
                    </div>

                    {/* Overall Score Circle */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-400 block">Overall Score</span>
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                          {analysisResult.overall_score}
                          <span className="text-sm font-semibold text-slate-400">/100</span>
                        </span>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-2xl">
                        {analysisResult.overall_score >= 85 ? '🌟' : analysisResult.overall_score >= 70 ? '👍' : '🎯'}
                      </div>
                    </div>
                  </div>

                  {/* Sub-scores */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Speech Fluency & Cadence
                      </span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {analysisResult.fluency_score}%
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Phonemic Clarity
                      </span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {analysisResult.clarity_score}%
                      </span>
                    </div>
                  </div>

                  {/* Mispronounced Words Breakdown */}
                  {analysisResult.mispronounced_words && analysisResult.mispronounced_words.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Phonetic Precision Corrections ({analysisResult.mispronounced_words.length})
                      </h4>
                      <div className="space-y-3">
                        {analysisResult.mispronounced_words.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-extrabold text-rose-900 dark:text-rose-200 capitalize">
                                Word: "{item.word}"
                              </span>
                              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                                <span className="text-emerald-600 dark:text-emerald-400">Target: {item.expected_ipa}</span>
                                <span className="text-slate-400">→</span>
                                <span className="text-rose-600 dark:text-rose-400">Heard: {item.detected_ipa}</span>
                              </div>
                            </div>
                            <p className="text-xs text-rose-900/90 dark:text-rose-300 font-medium">
                              🗣️ <strong>Articulatory Tip:</strong> {item.articulatory_tip}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>Zero major mispronunciations detected! Your articulation is exceptionally clean.</span>
                    </div>
                  )}

                  {/* Tutor Advice */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      "{analysisResult.coaching_message}"
                    </p>
                    {analysisResult.native_language_advice && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
                        <Languages className="w-4 h-4 shrink-0" />
                        <span>{analysisResult.native_language_advice}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
