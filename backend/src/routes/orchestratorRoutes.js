import express from 'express';
import {
  getDiagnosticPlacementQuestions,
  evaluatePlacementSubmission,
  generateDaily10MinPlan
} from '../agents/orchestrator.js';

const router = express.Router();

router.get('/placement-test', async (req, res) => {
  try {
    const customKey = req.headers['x-gemini-api-key'];
    const test = await getDiagnosticPlacementQuestions(customKey);
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/placement-test/evaluate', async (req, res) => {
  try {
    const { answers, nativeLanguage } = req.body;
    const customKey = req.headers['x-gemini-api-key'];
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'answers array is required' });
    }
    const result = await evaluatePlacementSubmission(answers, nativeLanguage || 'Spanish', customKey);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/daily-plan', async (req, res) => {
  try {
    const { nativeLanguage } = req.query;
    const customKey = req.headers['x-gemini-api-key'];
    const plan = await generateDaily10MinPlan(nativeLanguage || 'Spanish', customKey);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
