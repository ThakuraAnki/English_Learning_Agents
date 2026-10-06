import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import MascotGuide from './components/MascotGuide';
import ApiKeyModal from './components/ApiKeyModal';
import NativeLanguageModal from './components/NativeLanguageModal';
import DailyPlanModal from './components/DailyPlanModal';

import Dashboard from './pages/Dashboard';
import PlacementTest from './pages/PlacementTest';
import ReadingLab from './pages/ReadingLab';
import PronunciationStudio from './pages/PronunciationStudio';
import ListeningZone from './pages/ListeningZone';
import WritingWorkshop from './pages/WritingWorkshop';
import SpellingArena from './pages/SpellingArena';
import SpacedRepetitionDeck from './pages/SpacedRepetitionDeck';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sticky Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'placement' && <PlacementTest onFinish={setActiveTab} />}
        {activeTab === 'reading' && <ReadingLab />}
        {activeTab === 'pronunciation' && <PronunciationStudio />}
        {activeTab === 'listening' && <ListeningZone />}
        {activeTab === 'writing' && <WritingWorkshop />}
        {activeTab === 'spelling' && <SpellingArena />}
        {activeTab === 'srs' && <SpacedRepetitionDeck />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">LinguaPal</span>
            <span>• Multi-Agent AI English Ecosystem</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>CEFR Aligned (A1-C2)</span>
            <span>•</span>
            <span>Powered by Google Gemini</span>
            <span>•</span>
            <span>Spaced Repetition (SM-2)</span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Modals & Mascot */}
      <MascotGuide />
      <ApiKeyModal />
      <NativeLanguageModal />
      <DailyPlanModal onNavigate={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
