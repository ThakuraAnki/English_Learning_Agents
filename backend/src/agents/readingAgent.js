import { runAgentPrompt } from '../services/geminiService.js';
import { db } from '../db/database.js';

const READING_SYSTEM_PROMPT = `
You are the LinguaPal Reading Specialist Agent. You craft captivating, linguistically calibrated reading passages strictly suited for the learner's CEFR level (A1 to C2).
You produce:
1. An engaging passage with high lexical richness and natural cadence.
2. 5 rigorous comprehension questions (multiple choice, testing main idea, specific details, inferences, vocabulary in context, and author intent).
3. 4-6 key vocabulary highlights with IPA phonetic transcription, simple definitions, and example sentences.
Always return strictly valid JSON matching the requested structure.
`;

export async function generateReadingLesson({
  level = 'B1',
  topic = 'Technology and Daily Life',
  nativeLanguage = 'Spanish',
  customApiKey = null
}) {
  const prompt = `
Create an interactive reading lesson for a CEFR level ${level} learner whose native language is ${nativeLanguage}.
Topic: ${topic}

Requirements:
1. Passage length:
   - A1-A2: 120-160 words (simple sentences, high-frequency vocabulary)
   - B1-B2: 220-300 words (compound sentences, idiomatic expressions)
   - C1-C2: 350-450 words (nuanced prose, complex rhetoric, formal register)
2. Five comprehension questions (4 options each, single correct answer, with concise explanations).
3. 4 to 5 highlighted vocabulary words found inside the passage, including IPA, definition in English, and translation in ${nativeLanguage}.

Return strictly JSON:
{
  "id": "reading_${Date.now()}",
  "level": "${level}",
  "topic": "${topic}",
  "title": "Title of Passage",
  "passage": "Full passage text...",
  "vocabulary": [
    {
      "word": "resilient",
      "phonetic": "/rɪˈzɪl.jənt/",
      "part_of_speech": "adjective",
      "definition": "Able to quickly recover from difficult conditions or illness.",
      "native_translation": "resiliente",
      "example_in_text": "The local community proved resilient during the storm."
    }
  ],
  "questions": [
    {
      "id": 1,
      "question": "What is the primary theme of the passage?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Option A is correct because the entire second paragraph focuses on..."
    }
  ]
}
`;

  const aiLesson = await runAgentPrompt({
    systemInstruction: READING_SYSTEM_PROMPT,
    prompt,
    customApiKey
  });

  if (aiLesson && aiLesson.passage && Array.isArray(aiLesson.questions) && aiLesson.questions.length === 5) {
    return aiLesson;
  }

  // Fallback high-quality lesson
  return {
    id: `reading_fallback_${level.toLowerCase()}`,
    level: level,
    topic: topic,
    title: level === 'A1' || level === 'A2' ? "The Morning Coffee Habit" : "The Silent Rise of Urban Rewilding",
    passage: `In recent decades, cities across the world have undergone a surprising transformation. Urban planning was once defined almost exclusively by concrete pavements and towering skyscrapers. Today, a growing movement known as "urban rewilding" is restoring natural ecosystems directly within city centers. Abandoned railway corridors, rooftop gardens, and public squares are being repopulated with native flora, pollinator species, and miniature wetlands.

Proponents of this green transition argue that rewilding does far more than enhance aesthetics. Scientific studies have demonstrated that urban greenery acts as a natural buffer against severe heatwaves, lowering municipal temperatures by up to four degrees Celsius. Furthermore, reconnecting with biodiverse natural environments has been shown to alleviate chronic stress and foster psychological well-being among metropolitan residents. As climate volatility intensifies, greening our concrete jungles may no longer be a luxury, but a survival imperative.`,
    vocabulary: [
      {
        word: "transformation",
        phonetic: "/ˌtræns.fəˈmeɪ.ʃən/",
        part_of_speech: "noun",
        definition: "A complete change in the appearance or character of something.",
        native_translation: "transformación",
        example_in_text: "cities across the world have undergone a surprising transformation."
      },
      {
        word: "rewilding",
        phonetic: "/ˌriːˈwaɪl.dɪŋ/",
        part_of_speech: "noun",
        definition: "The practice of protecting an environment and returning it to its natural wild state.",
        native_translation: "resilvestración",
        example_in_text: "a growing movement known as 'urban rewilding' is restoring natural ecosystems."
      },
      {
        word: "buffer",
        phonetic: "/ˈbʌf.ər/",
        part_of_speech: "noun",
        definition: "Something that helps protect from harm, shock, or extreme fluctuations.",
        native_translation: "amortiguador",
        example_in_text: "urban greenery acts as a natural buffer against severe heatwaves."
      },
      {
        word: "imperative",
        phonetic: "/ɪmˈper.ə.tɪv/",
        part_of_speech: "noun",
        definition: "An essential or urgent thing that cannot be ignored.",
        native_translation: "imperativo",
        example_in_text: "greening our concrete jungles may no longer be a luxury, but a survival imperative."
      }
    ],
    questions: [
      {
        id: 1,
        question: "What is the central focus of the passage?",
        options: [
          "The historical architecture of skyscrapers",
          "The ecological and human benefits of reintroducing nature into urban landscapes",
          "The economic cost of cleaning up abandoned industrial railways",
          "Why city residents are moving to rural villages"
        ],
        correct_index: 1,
        explanation: "The passage discusses how urban rewilding restores ecosystems and delivers climate and mental health benefits to city dwellers."
      },
      {
        id: 2,
        question: "According to the passage, how does urban greenery affect city temperatures?",
        options: [
          "It has no measurable effect on weather",
          "It raises temperatures by blocking wind flow",
          "It cools the city by up to four degrees Celsius",
          "It causes unexpected rainstorms"
        ],
        correct_index: 2,
        explanation: "The text explicitly notes that greenery acts as a buffer lowering municipal temperatures by up to four degrees Celsius."
      },
      {
        id: 3,
        question: "What does the word 'alleviate' most likely mean as implied by the context?",
        options: [
          "To reduce or relieve",
          "To exaggerate",
          "To create suddenly",
          "To ignore completely"
        ],
        correct_index: 0,
        explanation: "'Alleviate chronic stress' means to ease or lessen the severity of stress."
      },
      {
        id: 4,
        question: "Which of the following spaces is NOT mentioned as being repurposed for rewilding?",
        options: [
          "Abandoned railway corridors",
          "Rooftop gardens",
          "Underground subway tunnels",
          "Public squares"
        ],
        correct_index: 2,
        explanation: "Railways, rooftops, and public squares are specifically cited; underground subway tunnels are not."
      },
      {
        id: 5,
        question: "What tone does the author take in the concluding sentence?",
        options: [
          "Skeptical and dismissive",
          "Urgent and cautionary",
          "Playful and sarcastic",
          "Indifferent"
        ],
        correct_index: 1,
        explanation: "Describing rewilding as 'no longer a luxury, but a survival imperative' creates an urgent and serious call to action."
      }
    ]
  };
}

export async function lookupWordDefinition({
  word,
  contextSentence = '',
  nativeLanguage = 'Spanish',
  customApiKey = null
}) {
  const prompt = `
Provide an instant lexical lookup for the word: "${word}"
Context sentence: "${contextSentence}"
Student's native language: ${nativeLanguage}

Return strictly JSON:
{
  "word": "${word}",
  "phonetic": "/.../",
  "part_of_speech": "noun | verb | adjective | adverb",
  "simple_definition_en": "Clear, concise meaning in plain English.",
  "native_translation": "Accurate translation in ${nativeLanguage}",
  "example_sentence": "A clean example sentence demonstrating typical usage.",
  "collocations": ["common partner word 1", "common partner word 2"]
}
`;

  const lookupResult = await runAgentPrompt({
    systemInstruction: `You are the LinguaPal Tap-to-Translate Lexicon Agent. You give immediate, learner-friendly word definitions with IPA, translations, and collocations.`,
    prompt,
    customApiKey
  });

  if (lookupResult && lookupResult.simple_definition_en) {
    return lookupResult;
  }

  return {
    word: word,
    phonetic: `/${word.toLowerCase()}/`,
    part_of_speech: "term",
    simple_definition_en: `Meaning of '${word}' in context.`,
    native_translation: `Traducción de ${word}`,
    example_sentence: `This is a helpful example sentence featuring ${word}.`,
    collocations: ["frequent phrase", "natural combination"]
  };
}

export function gradeReadingLesson({ lessonId, userAnswers, totalQuestions = 5 }) {
  // userAnswers: array of { question_id, chosen_index, correct_index }
  let correctCount = 0;
  userAnswers.forEach(ans => {
    if (ans.chosen_index === ans.correct_index) correctCount++;
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const xpEarned = correctCount * 10 + (percentage === 100 ? 25 : 0);

  // Update DB
  try {
    db.prepare(`
      INSERT INTO practice_sessions (skill, topic, score, max_score, xp_earned, details_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('reading', lessonId, correctCount, totalQuestions, xpEarned, JSON.stringify(userAnswers));

    db.prepare(`
      UPDATE users SET xp = xp + ? WHERE id = 'default_user'
    `).run(xpEarned);

    // Update skill mastery
    const currentStats = db.prepare('SELECT mastery_score FROM skill_stats WHERE skill = ?').get('reading');
    if (currentStats) {
      const newScore = Math.min(100, Math.round(currentStats.mastery_score * 0.8 + percentage * 0.2));
      db.prepare(`
        UPDATE skill_stats
        SET mastery_score = ?, sessions_completed = sessions_completed + 1, last_practiced = CURRENT_TIMESTAMP
        WHERE skill = 'reading'
      `).run(newScore);
    }
  } catch (e) {
    console.error('Error logging reading session:', e.message);
  }

  return {
    score: correctCount,
    total: totalQuestions,
    percentage,
    xp_earned: xpEarned,
    feedback: percentage >= 80 ? 'Outstanding reading comprehension! You caught subtle details with ease.' : percentage >= 60 ? 'Good work! Review the explanations for the questions you missed.' : 'Keep practicing! Focus on identifying the main idea before tackling detail questions.'
  };
}
