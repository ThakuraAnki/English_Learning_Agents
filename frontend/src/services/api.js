/**
 * LinguaPal Frontend API Client
 */

const API_BASE = '/api';

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const storedKey = localStorage.getItem('linguapal_gemini_key');
  if (storedKey) {
    headers['x-gemini-api-key'] = storedKey;
  }
  return headers;
}

export const api = {
  // Health & Key Check
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Orchestrator
  async getPlacementTest() {
    const res = await fetch(`${API_BASE}/orchestrator/placement-test`, { headers: getHeaders() });
    return res.json();
  },

  async evaluatePlacementTest(answers, nativeLanguage) {
    const res = await fetch(`${API_BASE}/orchestrator/placement-test/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answers, nativeLanguage })
    });
    return res.json();
  },

  async getDailyPlan(nativeLanguage) {
    const res = await fetch(`${API_BASE}/orchestrator/daily-plan?nativeLanguage=${encodeURIComponent(nativeLanguage || 'Spanish')}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Reading Agent
  async getReadingLesson(level, topic, nativeLanguage) {
    const params = new URLSearchParams({
      level: level || 'B1',
      topic: topic || 'Technology and Daily Life',
      nativeLanguage: nativeLanguage || 'Spanish'
    });
    const res = await fetch(`${API_BASE}/reading/lesson?${params.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async gradeReading(lessonId, userAnswers, totalQuestions) {
    const res = await fetch(`${API_BASE}/reading/grade`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ lessonId, userAnswers, totalQuestions })
    });
    return res.json();
  },

  async lookupWord(word, contextSentence, nativeLanguage) {
    const res = await fetch(`${API_BASE}/reading/lookup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ word, contextSentence, nativeLanguage })
    });
    return res.json();
  },

  // Pronunciation Agent
  async getPronunciationDrills(level, category) {
    const params = new URLSearchParams({
      level: level || 'B1',
      category: category || 'minimal_pairs'
    });
    const res = await fetch(`${API_BASE}/pronunciation/drills?${params.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async analyzePronunciation({ audioBase64, mimeType, targetText, focusWord, nativeLanguage }) {
    const res = await fetch(`${API_BASE}/pronunciation/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ audioBase64, mimeType, targetText, focusWord, nativeLanguage })
    });
    return res.json();
  },

  // Listening Agent
  async getListeningLesson(level, topic, nativeLanguage) {
    const params = new URLSearchParams({
      level: level || 'B1',
      topic: topic || 'Workplace Collaboration',
      nativeLanguage: nativeLanguage || 'Spanish'
    });
    const res = await fetch(`${API_BASE}/listening/lesson?${params.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async evaluateDictation(targetSentence, studentInput) {
    const res = await fetch(`${API_BASE}/listening/dictation/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetSentence, studentInput })
    });
    return res.json();
  },

  // Writing Agent
  async getWritingPrompts(level) {
    const res = await fetch(`${API_BASE}/writing/prompts?level=${encodeURIComponent(level || 'B1')}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async reviewWriting(payload) {
    const res = await fetch(`${API_BASE}/writing/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Spelling Agent
  async checkSpelling(text, nativeLanguage) {
    const res = await fetch(`${API_BASE}/spelling/check`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, nativeLanguage })
    });
    return res.json();
  },

  async getSpellingQuiz() {
    const res = await fetch(`${API_BASE}/spelling/quiz`, { headers: getHeaders() });
    return res.json();
  },

  async gradeSpellingQuiz(answers, totalQuestions) {
    const res = await fetch(`${API_BASE}/spelling/quiz/grade`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answers, totalQuestions })
    });
    return res.json();
  },

  // Progress & SRS
  async getDashboard() {
    const res = await fetch(`${API_BASE}/progress/dashboard`, { headers: getHeaders() });
    return res.json();
  },

  async getSrsCards(filter = 'due') {
    const res = await fetch(`${API_BASE}/progress/srs-cards?filter=${filter}`, { headers: getHeaders() });
    return res.json();
  },

  async reviewSrsCard(cardId, rating) {
    const res = await fetch(`${API_BASE}/progress/srs-cards/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cardId, rating })
    });
    return res.json();
  },

  async getMistakes(skill) {
    const url = skill ? `${API_BASE}/progress/mistakes?skill=${skill}` : `${API_BASE}/progress/mistakes`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async updateUserSettings(settings) {
    const res = await fetch(`${API_BASE}/progress/user/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return res.json();
  }
};
