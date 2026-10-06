import { runAgentPrompt } from '../services/geminiService.js';
import { db } from '../db/database.js';

const LISTENING_SYSTEM_PROMPT = `
You are the LinguaPal Listening Specialist Agent. You generate natural, lifelike spoken English audio scripts (dialogues and narratives) calibrated for ESL learners at CEFR levels A1 through C2.
Your duties:
1. Craft realistic dialogues featuring natural idioms, conversational fillers, and everyday social/workplace dynamics.
2. Produce 3-4 comprehension questions testing both literal understanding and pragmatic implication.
3. Provide targeted dictation sentences that test listening discrimination (homophones, contractions, weak forms).
Always return valid JSON matching the requested structure.
`;

export async function generateListeningLesson({
  level = 'B1',
  topic = 'Planning a Trip or Travel Scenario',
  nativeLanguage = 'Spanish',
  customApiKey = null
}) {
  const prompt = `
Create a spoken dialogue listening exercise for a CEFR ${level} student whose native language is ${nativeLanguage}.
Scenario: ${topic}

Requirements:
1. A lively dialogue between two speakers (e.g., Alex and Maya).
   - Format dialogue lines as an array of objects: { speaker: "Alex", text: "..." }
   - Length: 8-12 dialogue turns total.
2. 3 to 4 multiple-choice comprehension questions with explanations.
3. 2 targeted dictation sentences taken from or inspired by the dialogue to test auditory discrimination.

Return JSON:
{
  "id": "listen_${Date.now()}",
  "level": "${level}",
  "scenario": "${topic}",
  "title": "Title of Conversation",
  "speakers": ["Alex", "Maya"],
  "dialogue": [
    { "speaker": "Alex", "text": "Hey Maya, have you had a chance to look at the train timetable for this weekend?" },
    { "speaker": "Maya", "text": "Yes, I just did! It turns out there's a departure at 8:15 AM that gets us directly into the city center without any transfers." }
  ],
  "full_audio_text": "Alex: Hey Maya, have you had a chance to look at the train timetable for this weekend? Maya: Yes, I just did!...",
  "questions": [
    {
      "id": 1,
      "question": "What is Maya's recommendation regarding the train?",
      "options": ["Take the 8:15 AM direct train", "Wait for the afternoon express", "Take a bus instead", "Book a private taxi"],
      "correct_index": 0,
      "explanation": "Maya recommends the 8:15 AM train because it requires no transfers."
    }
  ],
  "dictation_drills": [
    {
      "id": "dict_1",
      "level": "Medium",
      "audio_sentence": "It turns out there's a departure at eight fifteen that gets us directly into the city center.",
      "focus": "Contractions and numbers"
    }
  ]
}
`;

  const aiLesson = await runAgentPrompt({
    systemInstruction: LISTENING_SYSTEM_PROMPT,
    prompt,
    customApiKey
  });

  if (aiLesson && Array.isArray(aiLesson.dialogue) && Array.isArray(aiLesson.questions)) {
    return aiLesson;
  }

  // Fallback high-quality listening lesson
  return {
    id: `listen_fallback_${level.toLowerCase()}`,
    level: level,
    scenario: topic,
    title: "Navigating the Airport Transfer",
    speakers: ["Sophie", "Liam"],
    dialogue: [
      { speaker: "Sophie", text: "Excuse me Liam, did the flight attendant say our connecting gate had been moved to Terminal B?" },
      { speaker: "Liam", text: "That's right! Because of maintenance on runway three, our flight docked twenty minutes late, so we need to hurry." },
      { speaker: "Sophie", text: "Do we have to re-check our luggage, or will it be transferred automatically to the final destination?" },
      { speaker: "Liam", text: "The gate agent reassured me that our bags are checked all the way through to Zurich. We just need to take the automated monorail across to Concourse B." },
      { speaker: "Sophie", text: "What a relief! Let's follow the overhead yellow signs towards the shuttle." }
    ],
    full_audio_text: "Sophie: Excuse me Liam, did the flight attendant say our connecting gate had been moved to Terminal B? Liam: That's right! Because of maintenance on runway three, our flight docked twenty minutes late, so we need to hurry. Sophie: Do we have to re-check our luggage, or will it be transferred automatically to the final destination? Liam: The gate agent reassured me that our bags are checked all the way through to Zurich. We just need to take the automated monorail across to Concourse B. Sophie: What a relief! Let's follow the overhead yellow signs towards the shuttle.",
    questions: [
      {
        id: 1,
        question: "Why was their arrival delayed?",
        options: [
          "Severe snowstorm at the departure city",
          "Maintenance taking place on runway three",
          "Lost luggage at customs check",
          "Mechanical issue inside the airplane cabin"
        ],
        correct_index: 1,
        explanation: "Liam explicitly points out that runway maintenance delayed their docking by twenty minutes."
      },
      {
        id: 2,
        question: "What must Sophie and Liam do with their luggage?",
        options: [
          "Collect it at the baggage claim immediately",
          "Pay an excess baggage fee at Terminal B",
          "Nothing, as it is already checked through to Zurich",
          "Leave it at the transit security desk"
        ],
        correct_index: 2,
        explanation: "Liam confirms the gate agent told him the bags are transferred directly through to Zurich."
      },
      {
        id: 3,
        question: "How will they travel between the terminals?",
        options: [
          "By taking an outdoor airport taxi",
          "By riding the automated monorail shuttle",
          "By walking along the tarmac",
          "By boarding an express bus"
        ],
        correct_index: 1,
        explanation: "Liam states they just need to take the automated monorail across to Concourse B."
      }
    ],
    dictation_drills: [
      {
        id: "dict_1",
        level: "Easy",
        audio_sentence: "Our flight docked twenty minutes late, so we need to hurry.",
        focus: "Past tense and clauses"
      },
      {
        id: "dict_2",
        level: "Medium",
        audio_sentence: "The gate agent reassured me that our bags are checked all the way through to Zurich.",
        focus: "Prepositions and compound phrases"
      },
      {
        id: "dict_3",
        level: "Challenging",
        audio_sentence: "We just need to take the automated monorail across to Concourse B.",
        focus: "Vocabulary & spelling accuracy"
      }
    ]
  };
}

/**
 * Evaluate dictation input against target audio sentence
 */
export function evaluateDictationInput({ targetSentence, studentInput }) {
  const cleanTarget = targetSentence.trim();
  const cleanInput = studentInput.trim();

  // Normalize tokens (strip punctuation for word accuracy calculation)
  const tokenize = str => str.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
  const targetWords = tokenize(cleanTarget);
  const studentWords = tokenize(cleanInput);

  let matchedCount = 0;
  const wordDiff = [];

  const maxLen = Math.max(targetWords.length, studentWords.length);
  for (let i = 0; i < targetWords.length; i++) {
    const expected = targetWords[i];
    const heard = studentWords[i] || '';

    if (expected === heard) {
      matchedCount++;
      wordDiff.push({ word: expected, status: 'correct' });
    } else if (!heard) {
      wordDiff.push({ word: expected, status: 'missing' });
    } else {
      wordDiff.push({ word: heard, expected: expected, status: 'incorrect' });
    }
  }

  // Extra words typed by user
  if (studentWords.length > targetWords.length) {
    for (let j = targetWords.length; j < studentWords.length; j++) {
      wordDiff.push({ word: studentWords[j], status: 'extra' });
    }
  }

  const accuracy = targetWords.length > 0 ? Math.round((matchedCount / targetWords.length) * 100) : 0;
  const xpEarned = Math.round(accuracy * 0.2) + 10;

  // Log session
  try {
    db.prepare(`
      INSERT INTO practice_sessions (skill, topic, score, max_score, xp_earned, details_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('listening', 'Dictation Drill', accuracy, 100, xpEarned, JSON.stringify({ target: cleanTarget, input: cleanInput }));

    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpEarned, 'default_user');

    const currentStats = db.prepare('SELECT mastery_score FROM skill_stats WHERE skill = ?').get('listening');
    if (currentStats) {
      const newScore = Math.min(100, Math.round(currentStats.mastery_score * 0.8 + accuracy * 0.2));
      db.prepare(`
        UPDATE skill_stats
        SET mastery_score = ?, sessions_completed = sessions_completed + 1, last_practiced = CURRENT_TIMESTAMP
        WHERE skill = 'listening'
      `).run(newScore);
    }
  } catch (e) {
    console.error('Error logging dictation:', e.message);
  }

  return {
    accuracy,
    xp_earned: xpEarned,
    target_sentence: cleanTarget,
    student_input: cleanInput,
    word_diff: wordDiff,
    feedback: accuracy >= 90
      ? "Phenomenal listening precision! You transcribed almost every word accurately."
      : accuracy >= 70
      ? "Well done! You caught the main message. Watch out for small function words and contractions."
      : "Good effort! Listen to the audio again at 0.75x speed and pay close attention to unstressed syllables."
  };
}
