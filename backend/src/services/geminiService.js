import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Primary model per user spec: gemini-2.5-flash (with fallbacks if needed)
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-3.8-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Clean and parse JSON from LLM responses (stripping markdown code blocks)
 */
export function parseJSONFromText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty or invalid text response from model');
  }

  // 1. Try direct parse
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    // Continue to cleaners
  }

  // 2. Strip ```json ... ``` or ``` ... ```
  let cleaned = text.trim();
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // 3. Find outermost { ... } or [ ... ]
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf(']');
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse cleaned JSON:', cleaned);
    throw new Error(`Model returned malformed JSON: ${err.message}`);
  }
}

/**
 * Get Gemini API Client with either runtime key or env key
 */
export function getGeminiClient(customApiKey) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

/**
 * Universal Agent Query Runner with Retry & Fallback
 */
export async function runAgentPrompt({
  systemInstruction,
  prompt,
  audioData = null, // { mimeType, data: base64String }
  customApiKey = null,
  jsonExpected = true
}) {
  const aiClient = getGeminiClient(customApiKey);

  if (!aiClient) {
    console.warn('⚠️ No GEMINI_API_KEY detected. Utilizing intelligent local curriculum fallback.');
    return null;
  }

  let lastError = null;

  // Attempt across available models
  for (const model of MODEL_CANDIDATES) {
    try {
      // Build contents
      const parts = [];
      if (audioData && audioData.data) {
        parts.push({
          inlineData: {
            mimeType: audioData.mimeType || 'audio/webm',
            data: audioData.data
          }
        });
      }
      parts.push({ text: prompt });

      const response = await aiClient.models.generateContent({
        model: model,
        contents: parts,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 2500,
          responseMimeType: jsonExpected ? 'application/json' : 'text/plain'
        }
      });

      const responseText = response.text || '';
      if (jsonExpected) {
        return parseJSONFromText(responseText);
      }
      return responseText;
    } catch (err) {
      console.warn(`Model ${model} attempt failed:`, err.message);
      lastError = err;
      // If quota or not found, try next candidate
      continue;
    }
  }

  console.error('All Gemini model candidates exhausted or failed:', lastError?.message);
  return null;
}
