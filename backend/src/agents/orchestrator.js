import { runAgentPrompt } from '../services/geminiService.js';
import { db } from '../db/database.js';

const ORCHESTRATOR_SYSTEM_PROMPT = `
You are the LinguaPal Master Orchestrator Agent. You are a senior educational psychologist and English language curriculum architect.
Your role:
1. Conduct diagnostic placement assessments to accurately classify learners across CEFR levels (A1, A2, B1, B2, C1, C2).
2. Design custom 10-minute daily micro-lesson plans addressing the student's weakest areas.
3. Dynamically adjust difficulty based on performance.
Always reply with valid, strict JSON matching the requested structure.
`;

export async function getDiagnosticPlacementQuestions(customApiKey = null) {
  const prompt = `
Generate a quick 6-question diagnostic English placement test evaluating:
- Question 1: Basic grammar / vocabulary (A1-A2)
- Question 2: Everyday conversation / tense usage (A2-B1)
- Question 3: Intermediate vocabulary & sentence connectors (B1-B2)
- Question 4: Complex sentence structure / conditionals (B2)
- Question 5: Advanced idioms, collocations, or nuance (C1)
- Question 6: Nuanced rhetorical usage or subtle semantic distinctions (C1-C2)

Return JSON with this exact schema:
{
  "test_id": "diagnostic_placement_v1",
  "questions": [
    {
      "id": 1,
      "skill": "Grammar",
      "target_level": "A1-A2",
      "prompt": "Choose the correct sentence:",
      "options": ["She don't like coffee.", "She doesn't likes coffee.", "She doesn't like coffee.", "She not like coffee."],
      "correct_index": 2,
      "explanation": "With third person singular (she/he/it) in present simple negative, we use 'doesn\\'t' + base verb."
    }
  ]
}
`;

  const result = await runAgentPrompt({
    systemInstruction: ORCHESTRATOR_SYSTEM_PROMPT,
    prompt,
    customApiKey
  });

  if (result && Array.isArray(result.questions) && result.questions.length >= 4) {
    return result;
  }

  // Robust Fallback Curriculum
  return {
    test_id: "diagnostic_placement_fallback",
    questions: [
      {
        id: 1,
        skill: "Grammar & Basic Syntax",
        target_level: "A1-A2",
        prompt: "Choose the correct sentence to complete the idea:",
        options: [
          "Yesterday, I go to the supermarket with my sister.",
          "Yesterday, I went to the supermarket with my sister.",
          "Yesterday, I have gone to the supermarket with my sister.",
          "Yesterday, I was went to the supermarket with my sister."
        ],
        correct_index: 1,
        explanation: "Specific past time markers like 'Yesterday' require the simple past tense ('went')."
      },
      {
        id: 2,
        skill: "Vocabulary & Prepositions",
        target_level: "A2-B1",
        prompt: "Which preposition correctly fills the blank: 'She is very good ___ solving difficult math puzzles.'",
        options: ["in", "at", "for", "on"],
        correct_index: 1,
        explanation: "The adjective 'good' takes the dependent preposition 'at' when referring to skills or abilities."
      },
      {
        id: 3,
        skill: "Sentence Connectors & Logic",
        target_level: "B1-B2",
        prompt: "Choose the sentence connector that expresses contrast: 'The weather forecast predicted heavy rain; ____, the marathon took place without interruption.'",
        options: ["nevertheless", "consequently", "moreover", "otherwise"],
        correct_index: 0,
        explanation: "'Nevertheless' introduces a contrast or concession despite the previous condition."
      },
      {
        id: 4,
        skill: "Conditionals & Mood",
        target_level: "B2",
        prompt: "Select the grammatically accurate conditional: 'If we ___ about the traffic jam earlier, we would have taken the train.'",
        options: ["knew", "would know", "had known", "have known"],
        correct_index: 2,
        explanation: "Third conditional (hypothetical past) uses 'If + past perfect (had known), would have + past participle'."
      },
      {
        id: 5,
        skill: "Advanced Idiomatic Usage",
        target_level: "C1",
        prompt: "What does the expression 'to play devil's advocate' mean in a professional discussion?",
        options: [
          "To act in bad faith to sabotage a project",
          "To argue against an idea simply to test its validity and uncover flaws",
          "To mediate between two hostile parties without taking sides",
          "To pretend to agree with everyone to avoid conflict"
        ],
        correct_index: 1,
        explanation: "Playing devil's advocate means putting forward an opposing view to provoke debate or test the strength of an argument."
      },
      {
        id: 6,
        skill: "Collocations & Semantic Precision",
        target_level: "C1-C2",
        prompt: "Choose the word that naturally collocates: 'The research team made a ___ effort to verify every single data point before publication.'",
        options: ["painstaking", "laborious", "distressful", "troublesome"],
        correct_index: 0,
        explanation: "'Painstaking effort' is the natural, sophisticated collocation meaning done with extreme care and thoroughness."
      }
    ]
  };
}

export async function evaluatePlacementSubmission(answers, nativeLanguage = 'Spanish', customApiKey = null) {
  // answers: array of { question_id, chosen_index, correct_index }
  let correctCount = 0;
  answers.forEach(a => {
    if (a.chosen_index === a.correct_index) correctCount++;
  });

  const percentage = Math.round((correctCount / answers.length) * 100);

  let calculatedLevel = 'B1';
  if (percentage <= 25) calculatedLevel = 'A1';
  else if (percentage <= 45) calculatedLevel = 'A2';
  else if (percentage <= 65) calculatedLevel = 'B1';
  else if (percentage <= 80) calculatedLevel = 'B2';
  else if (percentage <= 92) calculatedLevel = 'C1';
  else calculatedLevel = 'C2';

  const prompt = `
A student whose native language is ${nativeLanguage} just took an English placement test.
They scored ${correctCount}/${answers.length} (${percentage}%).
Their estimated CEFR level is ${calculatedLevel}.

Provide an encouraging assessment summary with:
1. A friendly personalized overview in English.
2. An optional brief explanation snippet in their native language (${nativeLanguage}).
3. Recommended focus skills.
4. CEFR breakdown estimates for reading, listening, writing, pronunciation, and spelling (as numbers 0-100).

Return JSON:
{
  "cefr_level": "${calculatedLevel}",
  "score_percentage": ${percentage},
  "summary_en": "Your diagnostic shows solid command...",
  "summary_native": "Resumen en idioma nativo...",
  "strengths": ["Clear sentence basics", "Good conversational instincts"],
  "priorities": ["Phonetic clarity in connected speech", "Spelling orthography patterns"],
  "skill_scores": {
    "reading": 70,
    "pronunciation": 55,
    "listening": 65,
    "writing": 60,
    "spelling": 50
  }
}
`;

  const aiEvaluation = await runAgentPrompt({
    systemInstruction: ORCHESTRATOR_SYSTEM_PROMPT,
    prompt,
    customApiKey
  });

  const result = aiEvaluation || {
    cefr_level: calculatedLevel,
    score_percentage: percentage,
    summary_en: `Welcome to LinguaPal! You demonstrated strong foundational skills, placing you solidly at the ${calculatedLevel} level. We will personalize your exercises to help you reach the next milestone!`,
    summary_native: `¡Bienvenido a LinguaPal! Tu prueba de nivel te ubica en ${calculatedLevel}. Tus lecciones diarias se adaptarán a tus puntos de mejora.`,
    strengths: [
      percentage > 50 ? "Solid sentence comprehension" : "Good grasp of everyday vocabulary",
      "Willingness to learn and improve"
    ],
    priorities: [
      "Targeted pronunciation & connected speech",
      "Active vocabulary retention with Spaced Repetition",
      "Expressive writing structures"
    ],
    skill_scores: {
      reading: Math.min(100, percentage + 5),
      pronunciation: Math.max(30, percentage - 10),
      listening: Math.min(100, percentage),
      writing: Math.max(35, percentage - 5),
      spelling: Math.max(30, percentage - 12)
    }
  };

  // Update DB user profile
  try {
    db.prepare(`
      UPDATE users
      SET cefr_level = ?, xp = xp + 50
      WHERE id = 'default_user'
    `).run(result.cefr_level);

    // Update individual skill stats
    const updateSkill = db.prepare(`
      UPDATE skill_stats
      SET level = ?, mastery_score = ?
      WHERE skill = ?
    `);

    for (const [skill, score] of Object.entries(result.skill_scores)) {
      updateSkill.run(result.cefr_level, score, skill);
    }
  } catch (err) {
    console.error('Error updating DB after placement:', err.message);
  }

  return result;
}

export async function generateDaily10MinPlan(nativeLanguage = 'Spanish', customApiKey = null) {
  // Query lowest scoring skills
  const skills = db.prepare('SELECT skill, level, mastery_score FROM skill_stats ORDER BY mastery_score ASC').all();
  const weakestSkill1 = skills[0]?.skill || 'pronunciation';
  const weakestSkill2 = skills[1]?.skill || 'spelling';
  const secondarySkill = skills[2]?.skill || 'reading';

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get('default_user') || { cefr_level: 'B1' };

  const prompt = `
Design a focused 10-Minute Daily English Lesson Plan for a ${user.cefr_level} student whose native language is ${nativeLanguage}.
Their weakest skill areas right now are: 1. ${weakestSkill1}, 2. ${weakestSkill2}, 3. ${secondarySkill}.

Create exactly 3 micro-activities that total 10 minutes:
- Activity 1 (3 mins): Targeting ${weakestSkill1}
- Activity 2 (4 mins): Targeting ${secondarySkill}
- Activity 3 (3 mins): Targeting ${weakestSkill2}

Return JSON:
{
  "date": "${new Date().toISOString().split('T')[0]}",
  "theme": "Everyday Professional & Social English",
  "total_minutes": 10,
  "xp_reward": 60,
  "activities": [
    {
      "step": 1,
      "skill": "${weakestSkill1}",
      "title": "Quick Vocal Warm-up",
      "duration_minutes": 3,
      "description": "Practice minimal pairs...",
      "route": "/pronunciation"
    },
    {
      "step": 2,
      "skill": "${secondarySkill}",
      "title": "Interactive Story Reading",
      "duration_minutes": 4,
      "description": "Read a short paragraph and answer 2 comprehension checks.",
      "route": "/reading"
    },
    {
      "step": 3,
      "skill": "${weakestSkill2}",
      "title": "Memory Blitz",
      "duration_minutes": 3,
      "description": "Review tricky spelling traps and reinforce orthographic rules.",
      "route": "/spelling"
    }
  ]
}
`;

  const aiPlan = await runAgentPrompt({
    systemInstruction: ORCHESTRATOR_SYSTEM_PROMPT,
    prompt,
    customApiKey
  });

  if (aiPlan && Array.isArray(aiPlan.activities)) {
    return aiPlan;
  }

  return {
    date: new Date().toISOString().split('T')[0],
    theme: "High-Frequency Fluency Accelerator",
    total_minutes: 10,
    xp_reward: 60,
    activities: [
      {
        step: 1,
        skill: weakestSkill1,
        title: `${weakestSkill1.charAt(0).toUpperCase() + weakestSkill1.slice(1)} Mastery Drill`,
        duration_minutes: 3,
        description: `Targeted practice for ${weakestSkill1} to build muscle memory and confidence.`,
        route: `/${weakestSkill1}`
      },
      {
        step: 2,
        skill: secondarySkill,
        title: `${secondarySkill.charAt(0).toUpperCase() + secondarySkill.slice(1)} Comprehension`,
        duration_minutes: 4,
        description: `Engaging interactive context exercise at ${user.cefr_level} difficulty.`,
        route: `/${secondarySkill}`
      },
      {
        step: 3,
        skill: weakestSkill2,
        title: `${weakestSkill2.charAt(0).toUpperCase() + weakestSkill2.slice(1)} Precision Check`,
        duration_minutes: 3,
        description: `Quick reinforcement quiz to solidify your understanding.`,
        route: `/${weakestSkill2}`
      }
    ]
  };
}
