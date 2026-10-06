import express from 'express';
import {
  checkSentenceSpelling,
  generateSpellingQuizFromMistakes,
  gradeSpellingQuizSubmission
} from '../agents/spellingAgent.js';

const router = express.Router();

router.post('/check', async (req, res) => {
  try {
    const { text, nativeLanguage } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'text is required' });
    }
    const customKey = req.headers['x-gemini-api-key'];
    const result = await checkSentenceSpelling({
      text,
      nativeLanguage: nativeLanguage || 'Spanish',
      customApiKey: customKey
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/quiz', async (req, res) => {
  try {
    const customKey = req.headers['x-gemini-api-key'];
    const quiz = await generateSpellingQuizFromMistakes({
      customApiKey: customKey
    });
    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/quiz/grade', (req, res) => {
  try {
    const { answers, totalQuestions } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'answers array is required' });
    }
    const graded = gradeSpellingQuizSubmission({
      answers,
      totalQuestions: totalQuestions || 5
    });
    res.json({ success: true, data: graded });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
