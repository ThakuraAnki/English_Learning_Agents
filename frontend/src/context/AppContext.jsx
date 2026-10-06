import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

const AppContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'Spanish', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'French', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'German', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'Hindi', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'Japanese', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'Chinese', name: 'Chinese (中文)', flag: '🇨🇳' },
  { code: 'Portuguese', name: 'Portuguese (Português)', flag: '🇧🇷' },
  { code: 'Italian', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'Arabic', name: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'Russian', name: 'Russian (Русский)', flag: '🇷🇺' },
  { code: 'Korean', name: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'Turkish', name: 'Turkish (Türkçe)', flag: '🇹🇷' }
];

export function AppProvider({ children }) {
  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('linguapal_theme') === 'dark' ||
      (!('linguapal_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // User & Stats
  const [user, setUser] = useState({
    id: 'default_user',
    name: 'Alex Johnson',
    native_language: 'Spanish',
    cefr_level: 'B1',
    xp: 250,
    streak_days: 4
  });
  const [skills, setSkills] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [stats, setStats] = useState({ totalMistakesLogged: 0, srsCardsDue: 0 });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Settings modals
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDailyPlanModal, setShowDailyPlanModal] = useState(false);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [loadingDailyPlan, setLoadingDailyPlan] = useState(false);

  // Custom API key stored
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('linguapal_gemini_key') || '');
  const [envKeyConfigured, setEnvKeyConfigured] = useState(false);

  // Mascot Pal State
  const [mascotMessage, setMascotMessage] = useState("Hi there! I'm Pal, your AI English mentor. Let's conquer new vocabulary today!");
  const [mascotMood, setMascotMood] = useState('happy'); // 'happy', 'excited', 'thinking', 'proud'

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('linguapal_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('linguapal_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Check health and load dashboard
  const refreshDashboard = useCallback(async () => {
    try {
      const [healthRes, dashRes] = await Promise.all([
        api.checkHealth().catch(() => ({ gemini_key_configured: false })),
        api.getDashboard()
      ]);

      if (healthRes) {
        setEnvKeyConfigured(Boolean(healthRes.gemini_key_configured));
      }

      if (dashRes && dashRes.success && dashRes.data) {
        if (dashRes.data.user) setUser(dashRes.data.user);
        if (dashRes.data.skills) setSkills(dashRes.data.skills);
        if (dashRes.data.weakAreas) setWeakAreas(dashRes.data.weakAreas);
        if (dashRes.data.stats) setStats(dashRes.data.stats);
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Save custom API key
  const saveApiKey = (key) => {
    setApiKey(key);
    if (key.trim()) {
      localStorage.setItem('linguapal_gemini_key', key.trim());
    } else {
      localStorage.removeItem('linguapal_gemini_key');
    }
  };

  // Update native language
  const changeNativeLanguage = async (langCode) => {
    try {
      const res = await api.updateUserSettings({ native_language: langCode });
      if (res && res.success) {
        setUser(prev => ({ ...prev, native_language: langCode }));
      }
    } catch (err) {
      console.error('Error setting language:', err);
    }
  };

  // Trigger celebration confetti
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Text-To-Speech using Browser Web Speech API with adjustable rate
  const speakText = useCallback((text, rate = 1.0, onEndCallback = null) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate; // 0.75, 1.0, 1.25
    utterance.lang = 'en-US';

    // Attempt to pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Fetch Daily 10-Minute Plan
  const openDailyPlan = async () => {
    setShowDailyPlanModal(true);
    if (!dailyPlan) {
      setLoadingDailyPlan(true);
      try {
        const res = await api.getDailyPlan(user.native_language);
        if (res && res.success && res.data) {
          setDailyPlan(res.data);
        }
      } catch (err) {
        console.error('Failed to load daily plan:', err);
      } finally {
        setLoadingDailyPlan(false);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        user,
        setUser,
        skills,
        weakAreas,
        stats,
        loadingDashboard,
        refreshDashboard,
        apiKey,
        saveApiKey,
        envKeyConfigured,
        showApiKeyModal,
        setShowApiKeyModal,
        showLanguageModal,
        setShowLanguageModal,
        showDailyPlanModal,
        setShowDailyPlanModal,
        dailyPlan,
        loadingDailyPlan,
        openDailyPlan,
        changeNativeLanguage,
        mascotMessage,
        setMascotMessage,
        mascotMood,
        setMascotMood,
        triggerCelebration,
        speakText,
        stopSpeaking
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
