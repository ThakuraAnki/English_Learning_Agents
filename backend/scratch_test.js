import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testInteractions() {
  try {
    const res = await client.interactions.create({
      model: 'gemini-3.8-flash',
      input: 'You are a JSON assistant. Respond with strictly valid JSON: {"status": "success", "message": "LinguaPal is awesome"}'
    });
    console.log('Interactions JSON test:');
    console.log(res.output_text);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testInteractions();
