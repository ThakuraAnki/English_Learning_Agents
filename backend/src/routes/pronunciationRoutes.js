import express from 'express';
import multer from 'multer';
import {
  getPronunciationChallenges,
  analyzeAudioPronunciation
} from '../agents/pronunciationAgent.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

router.get('/drills', async (req, res) => {
  try {
    const { level, category } = req.query;
    const customKey = req.headers['x-gemini-api-key'];
    const drills = await getPronunciationChallenges({
      level: level || 'B1',
      category: category || 'minimal_pairs',
      customApiKey: customKey
    });
    res.json({ success: true, data: drills });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze pronunciation endpoint supporting both JSON base64 and multipart/form-data
router.post('/analyze', upload.single('audio'), async (req, res) => {
  try {
    let audioBase64 = null;
    let mimeType = 'audio/webm';
    let targetText = '';
    let focusWord = '';
    let nativeLanguage = 'Spanish';

    if (req.file) {
      // Multipart upload
      audioBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'audio/webm';
      targetText = req.body.targetText || '';
      focusWord = req.body.focusWord || '';
      nativeLanguage = req.body.nativeLanguage || 'Spanish';
    } else {
      // JSON payload
      audioBase64 = req.body.audioBase64;
      mimeType = req.body.mimeType || 'audio/webm';
      targetText = req.body.targetText || '';
      focusWord = req.body.focusWord || '';
      nativeLanguage = req.body.nativeLanguage || 'Spanish';
    }

    if (!targetText) {
      return res.status(400).json({ success: false, error: 'targetText is required' });
    }

    const customKey = req.headers['x-gemini-api-key'];
    const feedback = await analyzeAudioPronunciation({
      audioBufferBase64: audioBase64,
      mimeType,
      targetText,
      focusWord,
      nativeLanguage,
      customApiKey: customKey
    });

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error in pronunciation analysis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
