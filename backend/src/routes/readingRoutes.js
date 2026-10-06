import express from 'express';
import {
  generateReadingLesson,
  lookupWordDefinition,
  gradeReadingLesson
} from '../agents/readingAgent.js';

const router = express.Router();

router.get('/lesson', async (req, res) => {
  try {
    const { level, topic, nativeLanguage } = req.query;
    const customKey = req.headers['x-gemini-api-key'];
    const lesson = await generateReadingLesson({
      level: level || 'B1',
      topic: topic || 'Global Innovations and Cultural Trends',
      nativeLanguage: nativeLanguage || 'Spanish',
      customApiKey: customKey
    });
    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/grade', (req, res) => {
  try {
    const { lessonId, userAnswers, totalQuestions } = req.body;
    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ success: false, error: 'userAnswers array is required' });
    }
    const result = gradeReadingLesson({
      lessonId: lessonId || 'reading_generic',
      userAnswers,
      totalQuestions: totalQuestions || 5
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/lookup', async (req, res) => {
  try {
    const { word, contextSentence, nativeLanguage } = req.body;
    const customKey = req.headers['x-gemini-api-key'];
    if (!word) {
      return res.status(400).json({ success: false, error: 'word is required' });
    }
    const definition = await lookupWordDefinition({
      word,
      contextSentence: contextSentence || '',
      nativeLanguage: nativeLanguage || 'Spanish',
      customApiKey: customKey
    });
    res.json({ success: true, data: definition });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
