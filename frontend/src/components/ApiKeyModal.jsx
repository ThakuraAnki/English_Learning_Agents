import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Key, CheckCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function ApiKeyModal() {
  const {
    showApiKeyModal,
    setShowApiKeyModal,
    apiKey,
    saveApiKey,
    envKeyConfigured,
    refreshDashboard
  } = useApp();

  const [inputVal, setInputVal] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!showApiKeyModal) return null;

  const handleSave = () => {
    saveApiKey(inputVal);
    setSavedSuccess(true);
    refreshDashboard();
    setTimeout(() => {
      setSavedSuccess(false);
      setShowApiKeyModal(false);
    }, 1200);
  };

  const handleClear = () => {
    setInputVal('');
    saveApiKey('');
    refreshDashboard();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={() => setShowApiKeyModal(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Google Gemini API Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by gemini-2.5-flash / gemini-3.8-flash
            </p>
          </div>
        </div>

        {/* Backend .env status banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
          {envKeyConfigured ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active: </span>
                GEMINI_API_KEY is detected in backend environment (<code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">.env</code>).
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-amber-600 dark:text-amber-400">Demo Curriculum Active: </span>
                No key set in <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">.env</code>. The app runs with high-yield smart local curriculum, or you can paste your key below to activate live AI.
              </div>
            </>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Runtime API Key Override
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            Keys are never logged and stored securely in local session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            {savedSuccess ? '✓ Saved Successfully' : 'Apply Key'}
          </button>
          {inputVal && (
            <button
              onClick={handleClear}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
