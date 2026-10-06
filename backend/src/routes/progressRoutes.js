import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

/**
 * Dashboard Overview Data
 */
router.get('/dashboard', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('default_user');
    const skills = db.prepare('SELECT * FROM skill_stats ORDER BY mastery_score ASC').all();
    const recentSessions = db.prepare('SELECT * FROM practice_sessions ORDER BY id DESC LIMIT 5').all();
    const mistakesCount = db.prepare('SELECT COUNT(*) as count FROM mistakes_log').get();
    const dueCardsCount = db.prepare("SELECT COUNT(*) as count FROM srs_cards WHERE datetime(next_review_due) <= datetime('now')").get();

    // Identify weak areas (skills below 70% mastery)
    const weakAreas = skills.filter(s => s.mastery_score < 70).map(s => ({
      skill: s.skill,
      score: s.mastery_score,
      level: s.level,
      recommendation: s.mastery_score < 50
        ? `High priority: Dedicated 5-minute daily focus on ${s.skill}.`
        : `Moderate focus: Reinforce ${s.skill} with quick practice sessions.`
    }));

    res.json({
      success: true,
      data: {
        user,
        skills,
        weakAreas,
        recentSessions,
        stats: {
          totalMistakesLogged: mistakesCount?.count || 0,
          srsCardsDue: dueCardsCount?.count || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Spaced Repetition Flashcards
 */
router.get('/srs-cards', (req, res) => {
  try {
    const { filter = 'due' } = req.query;
    let cards = [];
    if (filter === 'due') {
      cards = db.prepare(`
        SELECT * FROM srs_cards
        WHERE datetime(next_review_due) <= datetime('now')
        ORDER BY datetime(next_review_due) ASC
        LIMIT 20
      `).all();

      // If no cards strictly due right now, return the top cards for practice
      if (cards.length === 0) {
        cards = db.prepare(`SELECT * FROM srs_cards ORDER BY repetitions ASC LIMIT 10`).all();
      }
    } else {
      cards = db.prepare(`SELECT * FROM srs_cards ORDER BY id DESC LIMIT 30`).all();
    }

    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Review Spaced Repetition Card (SuperMemo SM-2 Interval Calculation)
 */
router.post('/srs-cards/review', (req, res) => {
  try {
    const { cardId, rating } = req.body; // rating: 'again' | 'hard' | 'good' | 'easy'
    if (!cardId || !rating) {
      return res.status(400).json({ success: false, error: 'cardId and rating are required' });
    }

    const card = db.prepare('SELECT * FROM srs_cards WHERE id = ?').get(cardId);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    let interval = card.interval_days || 1;
    let ease = card.ease_factor || 2.5;
    let reps = card.repetitions || 0;

    if (rating === 'again') {
      reps = 0;
      interval = 1;
      ease = Math.max(1.3, ease - 0.2);
    } else if (rating === 'hard') {
      interval = Math.max(1, Math.round(interval * 1.2));
      ease = Math.max(1.3, ease - 0.15);
      reps += 1;
    } else if (rating === 'good') {
      if (reps === 0) interval = 1;
      else if (reps === 1) interval = 3;
      else interval = Math.round(interval * ease);
      reps += 1;
    } else if (rating === 'easy') {
      if (reps === 0) interval = 2;
      else if (reps === 1) interval = 5;
      else interval = Math.round(interval * ease * 1.3);
      ease += 0.15;
      reps += 1;
    }

    // Calculate next due date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    db.prepare(`
      UPDATE srs_cards
      SET interval_days = ?, ease_factor = ?, repetitions = ?,
          next_review_due = ?, last_reviewed = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(interval, ease, reps, nextDate.toISOString(), cardId);

    // Award XP
    const xpReward = rating === 'again' ? 2 : 10;
    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpReward, 'default_user');

    res.json({
      success: true,
      data: {
        cardId,
        interval_days: interval,
        next_review_due: nextDate.toISOString(),
        xp_earned: xpReward
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Mistake History by Skill
 */
router.get('/mistakes', (req, res) => {
  try {
    const { skill } = req.query;
    let query = 'SELECT * FROM mistakes_log';
    const params = [];
    if (skill) {
      query += ' WHERE skill = ?';
      params.push(skill);
    }
    query += ' ORDER BY id DESC LIMIT 50';

    const mistakes = db.prepare(query).all(...params);
    res.json({ success: true, data: mistakes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update User Settings
 */
router.post('/user/settings', (req, res) => {
  try {
    const { name, native_language, cefr_level } = req.body;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (native_language) {
      updates.push('native_language = ?');
      params.push(native_language);
    }
    if (cefr_level) {
      updates.push('cefr_level = ?');
      params.push(cefr_level);
    }

    if (updates.length > 0) {
      params.push('default_user');
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get('default_user');
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
