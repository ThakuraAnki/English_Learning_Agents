import express from 'express';
import {
  generateListeningLesson,
  evaluateDictationInput
} from '../agents/listeningAgent.js';

const router = express.Router();

router.get('/lesson', async (req, res) => {
  try {
    const { level, topic, nativeLanguage } = req.query;
    const customKey = req.headers['x-gemini-api-key'];
    const lesson = await generateListeningLesson({
      level: level || 'B1',
      topic: topic || 'Workplace Collaboration and Everyday Dialogues',
      nativeLanguage: nativeLanguage || 'Spanish',
      customApiKey: customKey
    });
    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/dictation/evaluate', (req, res) => {
  try {
    const { targetSentence, studentInput } = req.body;
    if (!targetSentence || studentInput === undefined) {
      return res.status(400).json({ success: false, error: 'targetSentence and studentInput are required' });
    }
    const evaluation = evaluateDictationInput({ targetSentence, studentInput });
    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
