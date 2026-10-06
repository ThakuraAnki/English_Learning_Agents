import express from 'express';
import {
  getWritingPrompts,
  reviewWrittenSubmission
} from '../agents/writingAgent.js';

const router = express.Router();

router.get('/prompts', async (req, res) => {
  try {
    const { level } = req.query;
    const customKey = req.headers['x-gemini-api-key'];
    const prompts = await getWritingPrompts({
      level: level || 'B1',
      customApiKey: customKey
    });
    res.json({ success: true, data: prompts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/review', async (req, res) => {
  try {
    const { userText, promptTitle, intendedTone, nativeLanguage } = req.body;
    if (!userText || userText.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Please submit at least a full sentence or paragraph (minimum 10 characters).' });
    }
    const customKey = req.headers['x-gemini-api-key'];
    const review = await reviewWrittenSubmission({
      userText,
      promptTitle: promptTitle || 'Independent Writing',
      intendedTone: intendedTone || 'Professional',
      nativeLanguage: nativeLanguage || 'Spanish',
      customApiKey: customKey
    });
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
