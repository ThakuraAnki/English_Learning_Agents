# 🦉 LinguaPal — Multi-Agent AI English Tutor

**LinguaPal** is a production-grade, multi-agent AI English tutoring web application that accelerates ESL learners' mastery across **Reading**, **Pronunciation**, **Listening**, **Writing**, and **Spelling** using the **Google Gemini API** (`@google/genai` SDK) and adaptive CEFR learning trajectories.

---

## 🌟 Architecture & Multi-Agent Ecosystem

LinguaPal employs an Orchestrator + Specialist Agent architecture where each agent operates with dedicated system prompts, distinct pedagogical objectives, and structured outputs:

```
                          ┌───────────────────────────┐
                          │    Orchestrator Agent     │
                          │  • Placement Test (A1-C2) │
                          │  • Adaptive Difficulty    │
                          │  • 10-Min Daily Plan Gen  │
                          └─────────────┬─────────────┘
                                        │
     ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
     ▼                  ▼               ▼               ▼                  ▼
┌───────────┐    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    ┌─────────────┐
│  Reading  │    │Pronunciation│ │  Listening  │ │   Writing   │    │  Spelling   │
│   Agent   │    │    Agent    │ │    Agent    │ │    Agent    │    │    Agent    │
├───────────┤    ├─────────────┤ ├─────────────┤ ├─────────────┤    ├─────────────┤
│• Passages │    │• Multimodal │ │• Dialogues  │ │• Grammar Fix│    │• Orthography│
│• 5 MCQ Qs │    │  Audio /100 │ │• 0.75-1.25x │ │• Vocab Range│    │  Rule Engine│
│• Vocab Tag│    │• Target IPA │ │• Dictation  │ │• Polished   │    │• Personal   │
│• Tap-to-  │    │• Articulator│ │  Mode Diff  │ │  Rewrite    │    │  Mistakes   │
│  Translate│    │  Tips       │ │• Auditory Qs│ │• CEFR Rate  │    │  Mini-Quiz  │
└───────────┘    └─────────────┘ └─────────────┘ └─────────────┘    └─────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │   Spaced Repetition (SRS)   │
                         │   SQLite SM-2 Memory Engine │
                         └─────────────────────────────┘
```

1. **Orchestrator Agent**:
   - Diagnoses learner proficiency via a 6-question multi-skill diagnostic placement test.
   - Calibrates initial CEFR level (A1, A2, B1, B2, C1, C2).
   - Generates personalized **10-minute daily micro-lesson plans** based on the student's weakest skills.
   - Dynamically adapts exercise difficulty based on rolling session scores.

2. **Reading Agent**:
   - Crafts level-appropriate reading passages on engaging contemporary themes (Science, Rewilding, Career, Travel).
   - Generates 5 comprehension questions with rationale for every correct and incorrect answer.
   - Highlights vocabulary words with CEFR tags and definitions.
   - **Tap-to-Translate**: Clicking *any* word opens an instant popup with IPA transcription, English definition, and mother-tongue translation.

3. **Pronunciation Agent**:
   - In-browser microphone audio capture via `MediaRecorder` API.
   - Sends recorded audio to Gemini multimodal audio analysis.
   - Evaluates overall pronunciation, fluency, and phonemic clarity out of 100.
   - Identifies mispronounced words and provides IPA contrast (`/θ/` vs `/s/`).
   - Delivers physical articulatory mechanics tips ("Place tongue tip between incisors and exhale gently").

4. **Listening Agent**:
   - Generates natural, lifelike dual-speaker audio dialogues.
   - Plays audio with adjustable playback speeds (**0.75x**, **1.0x**, **1.25x**).
   - Features a **Dictation Mode** ("Listen & Type") with real-time character/word-diff analysis.
   - Includes comprehension questions with optional transcript hide/reveal toggle.

5. **Writing Agent**:
   - Offers level-appropriate prompts across Workplace, Opinion, and Narrative genres.
   - Identifies grammatical errors with exact substring replacements and rule explanations.
   - Recommends vocabulary upgrades to replace basic words with rich collocations.
   - Evaluates tone (Professional, Academic, Casual).
   - Provides a polished rewritten version of the text and CEFR estimation.

6. **Spelling Agent**:
   - Detects spelling errors in sentences and explains the orthographic rule (Latin roots, double consonants, silent letters).
   - Provides memorable mnemonic memory devices.
   - **Personal Mistakes Mini-Quiz**: Generates custom quizzes built directly from the learner's logged mistakes in SQLite.
   - Automatically synchronizes new errors to the Spaced Repetition deck.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Audio & Voice** | Web Speech API (`SpeechSynthesis`), `MediaRecorder` Audio Capture |
| **Backend** | Node.js (ESM), Express 4, Multer (multipart audio uploads), CORS |
| **AI Engine** | Google Gemini API (`@google/genai` SDK v2.27.0), `gemini-2.5-flash` / `gemini-3.8-flash` |
| **Database** | SQLite via `better-sqlite3` (WAL mode) |
| **Memory Engine** | SuperMemo SM-2 Spaced Repetition Algorithm |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** >= 18.0.0 (Tested on Node.js v24)
- **npm** >= 9.0.0
- Google Gemini API Key ([Get one at Google AI Studio](https://aistudio.google.com/))

### 2. Clone and Setup Environment
```bash
git clone https://github.com/ThakuraAnki/English_Learning_Agents.git
cd English_Learning_Agents
```

Create a `.env` file in the `backend/` directory:
```bash
# backend/.env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=5000
```
*(Note: If you run LinguaPal without an API key, it seamlessly runs in **Smart Curriculum Demo Mode** with high-yield pedagogical drills!)*

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Run the Application
In your first terminal (Backend):
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

In your second terminal (Frontend):
```bash
cd frontend
npm run dev
# Vite will launch on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 📡 API Endpoints Reference

### Orchestrator Agent
- `GET /api/orchestrator/placement-test` — Diagnostic placement questions across CEFR levels
- `POST /api/orchestrator/placement-test/evaluate` — Evaluates submission, computes CEFR score & level
- `GET /api/orchestrator/daily-plan` — Generates 3-step 10-minute micro-lesson plan

### Reading Agent
- `GET /api/reading/lesson?level=B1&topic=...` — Generates passage, 5 Qs, and vocabulary highlights
- `POST /api/reading/grade` — Grades comprehension responses and awards XP
- `POST /api/reading/lookup` — Instant tap-to-translate dictionary lookup in context

### Pronunciation Agent
- `GET /api/pronunciation/drills?level=B1&category=...` — Fetches phonetic challenges & minimal pairs
- `POST /api/pronunciation/analyze` — Receives voice recording (base64 or audio file) + target text, evaluates phonetics, IPA & tips

### Listening Agent
- `GET /api/listening/lesson?level=B1` — Generates dialogue script, comprehension questions & dictations
- `POST /api/listening/dictation/evaluate` — Compares student transcript against target sentence with word-diff

### Writing Agent
- `GET /api/writing/prompts?level=B1` — Retrieves level-appropriate composition prompts
- `POST /api/writing/review` — Analyzes essay, grammar errors, tone, and generates polished rewrite

### Spelling Agent
- `POST /api/spelling/check` — Analyzes text for spelling errors and extracts orthographic rules
- `GET /api/spelling/quiz` — Generates a mini-quiz crafted from the student's personal mistake history
- `POST /api/spelling/quiz/grade` — Grades spelling quiz answers and awards XP

### Progress & Memory Engine
- `GET /api/progress/dashboard` — User profile, streak days, XP, skill-wise breakdown, weak areas
- `GET /api/progress/srs-cards` — Retrieves flashcards due for SM-2 review
- `POST /api/progress/srs-cards/review` — Records recall rating (Again, Hard, Good, Easy) and updates intervals
- `GET /api/progress/mistakes` — Retrieves mistake history by skill

---

## 🦉 Tutor Features & UI Polish
- **Mascot Guide "Pal"**: An interactive animated owl tutor who offers verbal encouragement via Web Speech API.
- **Adaptive CEFR Progression**: Level indicator dynamically calibrated from A1 to C2 based on performance.
- **Daily Streak & XP Gamification**: Visual fire streak animations, level tier progress bars, and celebration confetti.
- **Dark/Light Mode**: Full theme customization with system preference detection.
- **Mother-Tongue Assistance**: 12 supported native languages with contextual translation switches.
