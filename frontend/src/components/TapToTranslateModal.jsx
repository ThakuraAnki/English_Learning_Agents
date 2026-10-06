import React from 'react';
import { Volume2, X, Sparkles, Languages, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TapToTranslateModal({ wordData, onClose }) {
  const { speakText } = useApp();

  if (!wordData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Word header */}
        <div className="flex items-center justify-between mb-3 pr-6">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-extrabold capitalize text-slate-900 dark:text-white">
              {wordData.word}
            </h3>
            {wordData.part_of_speech && (
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {wordData.part_of_speech}
              </span>
            )}
          </div>
          <button
            onClick={() => speakText(wordData.word, 0.9)}
            className="p-2 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 hover:scale-105 transition-all shadow-xs"
            title="Listen to pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* IPA Phonetics */}
        {wordData.phonetic && (
          <div className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold mb-3">
            {wordData.phonetic}
          </div>
        )}

        {/* English Definition */}
        <div className="mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            English Definition
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {wordData.simple_definition_en || wordData.definition || 'Definition loading...'}
          </p>
        </div>

        {/* Native Translation */}
        {(wordData.native_translation || wordData.nativeTranslation) && (
          <div className="mb-4 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="text-xs text-indigo-950 dark:text-indigo-200">
              <span className="font-semibold">Meaning: </span>
              {wordData.native_translation || wordData.nativeTranslation}
            </div>
          </div>
        )}

        {/* Example Sentence */}
        {wordData.example_sentence && (
          <div className="mb-4 text-xs italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            "{wordData.example_sentence}"
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
