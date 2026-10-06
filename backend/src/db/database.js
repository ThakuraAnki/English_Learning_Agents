import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../linguapal.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // 1. Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      native_language TEXT DEFAULT 'Spanish',
      cefr_level TEXT DEFAULT 'B1',
      xp INTEGER DEFAULT 120,
      streak_days INTEGER DEFAULT 3,
      last_active_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Skill stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skill_stats (
      skill TEXT PRIMARY KEY,
      level TEXT DEFAULT 'B1',
      mastery_score INTEGER DEFAULT 65,
      sessions_completed INTEGER DEFAULT 5,
      last_practiced TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Practice sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS practice_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill TEXT NOT NULL,
      topic TEXT,
      score INTEGER,
      max_score INTEGER,
      xp_earned INTEGER,
      details_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Mistakes log
  db.exec(`
    CREATE TABLE IF NOT EXISTS mistakes_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill TEXT NOT NULL,
      original_item TEXT NOT NULL,
      corrected_item TEXT NOT NULL,
      explanation TEXT,
      context_sentence TEXT,
      mastery_level INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Spaced Repetition (SRS) Flashcards
  db.exec(`
    CREATE TABLE IF NOT EXISTS srs_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_type TEXT NOT NULL, -- 'vocabulary' | 'spelling'
      front_prompt TEXT NOT NULL,
      back_answer TEXT NOT NULL,
      hint TEXT,
      phonetic TEXT,
      cefr_level TEXT DEFAULT 'B1',
      interval_days INTEGER DEFAULT 1,
      ease_factor REAL DEFAULT 2.5,
      repetitions INTEGER DEFAULT 0,
      next_review_due TEXT DEFAULT CURRENT_TIMESTAMP,
      last_reviewed TEXT
    );
  `);

  // Seed default user if not exists
  const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get('default_user');
  if (!existingUser) {
    db.prepare(`
      INSERT INTO users (id, name, native_language, cefr_level, xp, streak_days, last_active_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('default_user', 'Alex Johnson', 'Spanish', 'B1', 250, 4, new Date().toISOString().split('T')[0]);

    // Seed default skills
    const skills = [
      { skill: 'reading', level: 'B1', mastery: 72, sessions: 6 },
      { skill: 'pronunciation', level: 'A2', mastery: 58, sessions: 4 },
      { skill: 'listening', level: 'B1', mastery: 68, sessions: 5 },
      { skill: 'writing', level: 'B1', mastery: 62, sessions: 3 },
      { skill: 'spelling', level: 'A2', mastery: 54, sessions: 7 }
    ];

    const insertSkill = db.prepare(`
      INSERT OR REPLACE INTO skill_stats (skill, level, mastery_score, sessions_completed, last_practiced)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    for (const s of skills) {
      insertSkill.run(s.skill, s.level, s.mastery, s.sessions);
    }

    // Seed initial high-yield SRS cards
    const initialCards = [
      {
        card_type: 'vocabulary',
        front_prompt: 'A feeling of great happiness or excitement',
        back_answer: 'Euphoria',
        hint: 'Noun, begins with E, Greek root for well-being',
        phonetic: '/juːˈfɔː.ri.ə/',
        cefr_level: 'B2'
      },
      {
        card_type: 'vocabulary',
        front_prompt: 'To officially state that you are not guilty of something',
        back_answer: 'Exonerate',
        hint: 'Verb, rhymes with accelerate',
        phonetic: '/ɪɡˈzɒn.ə.reɪt/',
        cefr_level: 'C1'
      },
      {
        card_type: 'vocabulary',
        front_prompt: 'Careful and avoiding risks',
        back_answer: 'Prudent',
        hint: 'Adjective, rhymes with student',
        phonetic: '/ˈpruː.dənt/',
        cefr_level: 'B2'
      },
      {
        card_type: 'spelling',
        front_prompt: 'Spell the word meaning "to accept or take into account, or living space"',
        back_answer: 'Accommodate',
        hint: 'Two C\'s and two M\'s!',
        phonetic: '/əˈkɒm.ə.deɪt/',
        cefr_level: 'B1'
      },
      {
        card_type: 'spelling',
        front_prompt: 'Spell the word meaning "an event that happens, or existence"',
        back_answer: 'Occurrence',
        hint: 'Double C and double R with -ence ending',
        phonetic: '/əˈkʌr.əns/',
        cefr_level: 'B2'
      },
      {
        card_type: 'spelling',
        front_prompt: 'Spell the word meaning "necessary for someone as a duty"',
        back_answer: 'Incumbent',
        hint: 'Starts with in-, ends with -bent',
        phonetic: '/ɪnˈkʌm.bənt/',
        cefr_level: 'B2'
      }
    ];

    const insertCard = db.prepare(`
      INSERT INTO srs_cards (card_type, front_prompt, back_answer, hint, phonetic, cefr_level, interval_days, ease_factor, repetitions, next_review_due)
      VALUES (?, ?, ?, ?, ?, ?, 1, 2.5, 0, CURRENT_TIMESTAMP)
    `);
    for (const c of initialCards) {
      insertCard.run(c.card_type, c.front_prompt, c.back_answer, c.hint, c.phonetic, c.cefr_level);
    }

    // Seed starter mistakes
    const initialMistakes = [
      {
        skill: 'spelling',
        original_item: 'definately',
        corrected_item: 'definitely',
        explanation: 'Derived from "finite". Contains "i", not "a".',
        context_sentence: 'I will definitely come to your celebration.'
      },
      {
        skill: 'pronunciation',
        original_item: 'Comfortable',
        corrected_item: 'COMF-ter-bull',
        explanation: 'Often mispronounced as four syllables "com-for-ta-ble". In native English, pronounce as three syllables /ˈkʌm.fət.ə.bəl/.',
        context_sentence: 'Make yourself comfortable on the sofa.'
      },
      {
        skill: 'writing',
        original_item: 'I look forward to hear from you',
        corrected_item: 'I look forward to hearing from you',
        explanation: '"Look forward to" takes a gerund (-ing) because "to" is a preposition, not an infinitive marker.',
        context_sentence: 'Thank you for your consideration, I look forward to hearing from you soon.'
      }
    ];

    const insertMistake = db.prepare(`
      INSERT INTO mistakes_log (skill, original_item, corrected_item, explanation, context_sentence)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const m of initialMistakes) {
      insertMistake.run(m.skill, m.original_item, m.corrected_item, m.explanation, m.context_sentence);
    }
  }

  console.log('✅ SQLite database initialized with schema and seed data.');
}
