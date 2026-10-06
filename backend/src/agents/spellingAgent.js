import { runAgentPrompt } from '../services/geminiService.js';
import { db } from '../db/database.js';

const SPELLING_SYSTEM_PROMPT = `
You are the LinguaPal Spelling & Orthography Specialist Agent. You are an expert linguist specializing in English orthography, etymology, and phoneme-grapheme correspondences.
Your tasks:
1. Identify misspelled words and explain the underlying spelling rule (morphology, historical sound changes, Latin/Greek roots, prefix/suffix alteration).
2. Create engaging spelling challenge quizzes tailored to common traps.
3. Generate personalized mini-quizzes built from the student's personal mistake history.
Always return strictly valid JSON matching the requested structure.
`;

export async function checkSentenceSpelling({ text, nativeLanguage = 'Spanish', customApiKey = null }) {
  const prompt = `
Analyze the following sentence or paragraph for spelling errors:
"""
${text}
"""
Native Language: ${nativeLanguage}

Identify every misspelled word.
For each error, provide:
- original_word: the misspelled token as written
- correct_spelling: accurate spelling
- phonetic_ipa: standard IPA
- rule_name: name of the spelling rule (e.g., "Double Consonant Suffix Rule", "I Before E Rule", "Silent Letter Pattern")
- rule_explanation: clear, memorable pedagogical explanation
- memory_trick: mnemonic device to never forget it

Return JSON:
{
  "total_errors": 2,
  "errors": [
    {
      "original_word": "seperate",
      "correct_spelling": "separate",
      "phonetic_ipa": "/ˈsep.ər.ət/",
      "rule_name": "Vowel Alternation in Latin Roots",
      "rule_explanation": "Contains 'par' from Latin 'parare' (to prepare), not 'per'.",
      "memory_trick": "Remember: There is 'A RAT' in separate!"
    }
  ]
}
`;

  const aiCheck = await runAgentPrompt({
    systemInstruction: SPELLING_SYSTEM_PROMPT,
    prompt,
    customApiKey
  });

  let checkResult = aiCheck;

  if (!checkResult) {
    // Basic fallback dictionary check
    const commonTraps = {
      'definately': { correct: 'definitely', rule: 'Finite root rule', trick: 'There is "finite" in definitely.' },
      'seperate': { correct: 'separate', rule: 'Vowel pattern', trick: 'There is "A RAT" in separate.' },
      'accomodate': { correct: 'accommodate', rule: 'Double consonant rule', trick: 'Accommodate has two C\'s and two M\'s!' },
      'untill': { correct: 'until', rule: 'Single L suffix rule', trick: 'Until has only one L at the end.' },
      'recieved': { correct: 'received', rule: 'I before E except after C', trick: 'After C, use EI.' },
      'occured': { correct: 'occurred', rule: 'Doubling consonant on stressed syllable', trick: 'Double R when stress falls on second syllable.' }
    };

    const tokens = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const foundErrors = [];

    tokens.forEach(t => {
      if (commonTraps[t]) {
        foundErrors.push({
          original_word: t,
          correct_spelling: commonTraps[t].correct,
          phonetic_ipa: `/${commonTraps[t].correct}/`,
          rule_name: commonTraps[t].rule,
          rule_explanation: `Common ESL orthographic trap for ${t}.`,
          memory_trick: commonTraps[t].trick
        });
      }
    });

    checkResult = {
      total_errors: foundErrors.length,
      errors: foundErrors
    };
  }

  // Automatically record detected errors to mistakes_log and srs_cards
  if (Array.isArray(checkResult.errors)) {
    const insertMistake = db.prepare(`
      INSERT INTO mistakes_log (skill, original_item, corrected_item, explanation, context_sentence)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertSRS = db.prepare(`
      INSERT INTO srs_cards (card_type, front_prompt, back_answer, hint, phonetic, cefr_level)
      VALUES ('spelling', ?, ?, ?, ?, 'B1')
    `);

    for (const err of checkResult.errors) {
      try {
        insertMistake.run('spelling', err.original_word, err.correct_spelling, err.rule_explanation, text.substring(0, 100));
        insertSRS.run(
          `Spell the word: ${err.rule_explanation || 'Common spelling trap'}`,
          err.correct_spelling,
          err.memory_trick || err.rule_name,
          err.phonetic_ipa || ''
        );
      } catch (e) {
        // ignore duplicate errors
      }
    }
  }

  return checkResult;
}

/**
 * Generate a spelling quiz from the student's personal mistake history!
 */
export async function generateSpellingQuizFromMistakes({ customApiKey = null }) {
  // Query past spelling mistakes from DB
  const pastMistakes = db.prepare(`
    SELECT DISTINCT original_item, corrected_item, explanation
    FROM mistakes_log
    WHERE skill = 'spelling'
    ORDER BY id DESC
    LIMIT 10
  `).all();

  const mistakeWords = pastMistakes.map(m => m.corrected_item);

  const prompt = `
Create a 5-question adaptive Spelling Mastery Quiz.
Target Words to include or adapt from the learner's personal mistake history:
${mistakeWords.length > 0 ? mistakeWords.join(', ') : 'definitely, accommodate, occurrence, privilege, rhythm'}

For each question, formulate a high-yield question:
Type 1: "Which spelling is correct?" (4 options)
Type 2: "Find the misspelled word in this sentence."
Type 3: "Fill in the blank with the accurate spelling."

Include rule explanations and mnemonic memory tricks.

Return JSON:
{
  "quiz_id": "spelling_quiz_${Date.now()}",
  "source": "${mistakeWords.length > 0 ? 'personal_mistakes' : 'curated_high_yield'}",
  "questions": [
    {
      "id": 1,
      "prompt": "Select the correct spelling to complete the sentence: 'The hotel can ___ up to five hundred guests.'",
      "options": ["acomodate", "accommodate", "accomodete", "acommodate"],
      "correct_index": 1,
      "rule_name": "Double Consonant Rule",
      "explanation": "Accommodate features both double C and double M.",
      "mnemonic": "Remember: The hotel has enough room for two C's (comfortable cabins) and two M's (modern meals)!"
    }
  ]
}
`;

  const aiQuiz = await runAgentPrompt({
    systemInstruction: SPELLING_SYSTEM_PROMPT,
    prompt,
    customApiKey
  });

  if (aiQuiz && Array.isArray(aiQuiz.questions) && aiQuiz.questions.length >= 3) {
    return aiQuiz;
  }

  // Fallback high-yield spelling quiz
  return {
    quiz_id: "spelling_quiz_fallback",
    source: mistakeWords.length > 0 ? "personal_mistakes" : "curated_high_yield",
    questions: [
      {
        id: 1,
        prompt: "Choose the word with the correct spelling:",
        options: ["Definately", "Definetely", "Definitely", "Definitly"],
        correct_index: 2,
        rule_name: "Root Word 'Finite'",
        explanation: "Derived from 'finite' (having limits). It has an 'i' in the middle, never an 'a'.",
        mnemonic: "There is 'finite' right in the center of 'de-finite-ly'."
      },
      {
        id: 2,
        prompt: "Which sentence has NO spelling errors?",
        options: [
          "It was an unforseen occurrence during the ceremony.",
          "It was an unforeseen occurrence during the ceremony.",
          "It was an unforeseen occurence during the ceremony.",
          "It was an unforseen occurance during the ceremony."
        ],
        correct_index: 1,
        rule_name: "Suffix & Consonant Doubling",
        explanation: "'Occurrence' has double C, double R, and ends in -ence. 'Unforeseen' has double E.",
        mnemonic: "Double C, double R, never a single letter in occurrence."
      },
      {
        id: 3,
        prompt: "Select the correct spelling of the musical or poetic concept:",
        options: ["Rythm", "Rhytm", "Rhythm", "Rhythym"],
        correct_index: 2,
        rule_name: "Greek Root 'Rhythm'",
        explanation: "English words derived from Greek often pair Rh- and have 'y' as the only vowel.",
        mnemonic: "Rhythm Helps Your Two Hips Move!"
      },
      {
        id: 4,
        prompt: "Choose the correct spelling meaning 'special right or advantage':",
        options: ["Privilege", "Privelege", "Priviledge", "Privelidge"],
        correct_index: 0,
        explanation: "'Privilege' comes from Latin 'privus' (private) + 'lex' (law). There is no 'd'.",
        mnemonic: "Two 'i's and two 'e's in a clean pattern: P-R-I-V-I-L-E-G-E."
      },
      {
        id: 5,
        prompt: "Select the sentence with the accurate spelling of 'receive':",
        options: [
          "Did you recieve my confirmation email?",
          "Did you receive my confirmation email?",
          "Did you receeve my confirmation email?",
          "Did you reseive my confirmation email?"
        ],
        correct_index: 1,
        rule_name: "I Before E Except After C",
        explanation: "When following 'c' and making an /iː/ sound, the order is 'ei' ('receive', 'deceive', 'ceiling').",
        mnemonic: "I before E, except after C!"
      }
    ]
  };
}

export function gradeSpellingQuizSubmission({ answers, totalQuestions = 5 }) {
  let correctCount = 0;
  answers.forEach(a => {
    if (a.chosen_index === a.correct_index) correctCount++;
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const xpEarned = correctCount * 12 + (percentage === 100 ? 30 : 0);

  try {
    db.prepare(`
      INSERT INTO practice_sessions (skill, topic, score, max_score, xp_earned, details_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('spelling', 'Spelling Quiz', correctCount, totalQuestions, xpEarned, JSON.stringify(answers));

    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpEarned, 'default_user');

    const currentStats = db.prepare('SELECT mastery_score FROM skill_stats WHERE skill = ?').get('spelling');
    if (currentStats) {
      const newScore = Math.min(100, Math.round(currentStats.mastery_score * 0.75 + percentage * 0.25));
      db.prepare(`
        UPDATE skill_stats
        SET mastery_score = ?, sessions_completed = sessions_completed + 1, last_practiced = CURRENT_TIMESTAMP
        WHERE skill = 'spelling'
      `).run(newScore);
    }
  } catch (e) {
    console.error('Error logging spelling grade:', e.message);
  }

  return {
    score: correctCount,
    total: totalQuestions,
    percentage,
    xp_earned: xpEarned,
    feedback: percentage >= 80 ? 'Masterful spelling accuracy! Your orthographic pattern memory is sharp.' : percentage >= 60 ? 'Solid performance! Memorize the mnemonic rhymes for the ones you missed.' : 'Keep practicing! Review the rules behind silent letters and double consonants.'
  };
}
