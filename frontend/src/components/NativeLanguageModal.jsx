import React from 'react';
import { useApp, SUPPORTED_LANGUAGES } from '../context/AppContext';
import { Globe, Check, X } from 'lucide-react';

export default function NativeLanguageModal() {
  const {
    showLanguageModal,
    setShowLanguageModal,
    user,
    changeNativeLanguage
  } = useApp();

  if (!showLanguageModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={() => setShowLanguageModal(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Native Language Assistance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              LinguaPal will offer hints and grammatical contrast in your mother tongue.
            </p>
          </div>
        </div>

        <div className="overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = user.native_language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  changeNativeLanguage(lang.code);
                  setShowLanguageModal(false);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-semibold transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setShowLanguageModal(false)}
            className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
