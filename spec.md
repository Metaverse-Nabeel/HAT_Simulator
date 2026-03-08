# HAT Simulator - System Design Document

## 1. Introduction
The HAT (Higher Education Aptitude Test) Simulator is a web-based application designed to help students prepare for Pakistan's HEC HAT exam. By using AI (Claude API) to generate dynamic questions, the platform offers an infinite practice environment. This document outlines the architectural and functional specifications for the project.

## 2. Core Features
### 2.1 Exam Categories & Levels
- **Categories** (aligned with official HEC HAT streams):
  - **HAT-I**: Engineering & Technology, Computer Science, Mathematics, Statistics, Physics.
  - **HAT-II**: Management Sciences, Business Education.
  - **HAT-III**: Arts & Humanities, Social Sciences, Psychology, Law.
  - **HAT-IV**: Biological & Medical Sciences, Agriculture & Veterinary, Physical Sciences.
  - **HAT-General**: Religious Studies.
- **Levels**: MS (Master's) and PhD. Each category has a separate question pool and difficulty calibration per level.

### 2.2 Question Sections
Each exam consists of 100 questions within a 120-minute limit, divided into three sections:
- **Verbal Reasoning**: Sentence completion, analogies, sentence correction, antonyms, synonyms, reading comprehension.
- **Analytical Reasoning**: Logic puzzles (grouping, ordering, scheduling), critical reasoning, conditional logic.
- **Quantitative Reasoning**: Arithmetic, algebra, geometry, number theory, speed/distance/time, statistics.

### 2.3 Section Distribution by HAT Category
Although every full exam contains 100 questions and offers 120 minutes, the distribution of questions across the three sections differs based on the chosen category. The system dynamically generates the exam according to these official weightages:

| Category | Verbal | Analytical | Quantitative | Total |
|---|---|---|---|---|
| HAT-I (Engineering / CS / Math / Physics) | 30 | 30 | 40 | 100 |
| HAT-II (Management Sciences / Business) | 30 | 40 | 30 | 100 |
| HAT-III (Arts / Humanities / Social Sciences / Psychology / Law) | 40 | 35 | 25 | 100 |
| HAT-IV (Biological / Medical / Agriculture / Physical Sciences) | 40 | 30 | 30 | 100 |
| HAT-General (Religious Studies) | 40 | 30 | 30 | 100 |

Users can also take **section-specific practice tests** to focus on a single section.

### 2.4 Category-Based Exam Generation
The exam engine dynamically calculates the question distribution required for the selected category before generating the exam.

**Generation Logic**:
1. When a user selects a category (e.g., `HAT-I`), the system loads the specific section distribution rules for that category (e.g., 30 Verbal, 30 Analytical, 40 Quantitative).
2. The exam generator first attempts to select questions from the internal **Question Cache** using these exact ratios ensuring no duplicates for the user.
3. If insufficient questions exist in the cache for a specific section, the system calls the Claude API to generate the exact shortfall for that specific section.
4. Newly generated questions are immediately stored in the Question Cache for reuse.

*Example Pseudocode*:
```javascript
const distribution = getSectionDistribution('HAT-I'); 
// Returns: { verbal: 30, analytical: 30, quantitative: 40 }
```

### 2.5 Exam Simulation Modes
- **Testing Mode**: Replicates the real exam experience. Default is 100 questions and 120 minutes limit. Results are hidden until the exam is submitted. Includes "Mark for Review" feature to flag questions for later revisit, confirmation dialog before final submission, time warnings (e.g., 5 min remaining), and auto-submit on timeout.
- **Learning Mode**: An untimed or self-paced mode where answers and detailed explanations are provided immediately after attempting each question to facilitate learning.

### 2.6 Gamification
- **Difficulty Levels**: Questions are categorized as Easy, Medium, Hard, and Super Hard. Users can select difficulty per test or use a "Random" mode.
- **Experience Points (XP)**: Points are awarded based on the difficulty of correct answers.
- **Streaks**: Consecutive daily logins or test completions build a streak, adding multiplier bonuses to XP earned.
- **Leaderboard**: A global ranking system based on total XP to encourage competition among users.

### 2.7 Customizable Constraints
- **Custom Time Limits**: Users can manually reduce the default exam time (e.g., from 120 minutes down to 60 minutes) to increase pressure.
- **Custom Question Counts**: Users can select fewer questions for a quick session. The time limit scales proportionally automatically.

### 2.8 Test Reporting
- **PDF Generation**: Users can download a detailed PDF report of their exam performance. The report includes:
  - Overall score and percentage.
  - Section score breakdown (number of correct/total questions per section).
  - Percentage score per section.
  - Time analysis (time spent per section).
  - Individual question reviews with correct answers and explanations.

### 2.9 Dashboards
- **User Dashboard**: Displays the user's XP, current streak, exam history, performance analytics, and quick links to start new exams.
- **Admin Dashboard**: Accessible only to users with the `ADMIN` role. Features user management (role assignment, bans) and platform-wide analytics.

## 3. Technology Stack
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4, shadcn/ui. Mobile-first responsive design.
- **Backend**: Next.js Server Actions & API Routes (Node.js).
- **Database**: Vercel Postgres managed via Prisma ORM.
- **Authentication**: NextAuth.js (Auth.js) with Google OAuth Provider for seamless self-signup.
- **AI Integration**: Google GenAI API (`@google/genai`) utilizing the Bonsai Frontier model (`gemini-2.5-pro`) with structured JSON schema for question generation. Integrates a custom `question-generator` AI skill built using actual HAT syllabus and past papers to ensure accurate formatting, difficulty calibration, and domain specificity. **AI Generation Rule:** The AI question generation system must strictly respect the section distribution for the requested category (e.g., if HAT-III is selected and 40 verbal questions are required, the generator must produce exactly 40 verbal reasoning questions). Daily test generation limit per user (e.g., 10/day) to control API costs.
- **PDF Generation**: `@react-pdf/renderer` or `jspdf` for generating downloadable test reports directly in the browser or via backend.
- **Deployment**: Vercel.

## 4. Architecture & System Diagram
- **Client**: Requests pages, manages local exam state (`useReducer`), displays UI.
- **Next.js Server**: Handles SSR, protects `/admin` routes via middleware, acts as a proxy for the Claude API to protect API keys.
- **Database**: Stores `User`, `Account` (OAuth), `Session`, `ExamAttempt` (historical results), and `GamificationProfile` (XP, streaks).
- **External APIs**: Google (OAuth login), Anthropic (LLM question generation).

## 5. Database Schema Overview
1. **User**: id, name, email, role (USER/ADMIN), createdAt.
2. **GamificationProfile**: userId (relation), totalXP, currentStreak, longestStreak, lastActivityDate.
3. **ExamAttempt**: id, userId (relation), category, level (MS/PHD), mode (TESTING/LEARNING), difficulty (EASY/MEDIUM/HARD/SUPER_HARD/RANDOM), questionCount, timeLimit, score, maxScore, timeSpent, timestamp, resultsData (JSON).
   - **resultsData JSON shape**: Array of `{ questionId, questionText, options, userAnswer, correctAnswer, section (VERBAL/ANALYTICAL/QUANTITATIVE), explanation, timeTaken }`.
4. **Question** (cache): id, category, level (MS/PHD), section (VERBAL/ANALYTICAL/QUANTITATIVE), difficulty (EASY/MEDIUM/HARD/SUPER_HARD), questionText, options (JSON), correctAnswer, explanation, createdAt.
   - Generated questions are stored here for reuse. Tests pull from cached questions when available and generate new ones via Claude API when needed.
   - The question cache also serves as a **fallback**: if the Claude API is unavailable, tests are assembled entirely from cached questions. New questions can be generated in the background to replenish the cache.

## 6. Implementation Milestones
- **M1**: Scaffolding, DB connection, and Google Authentication.
- **M2a**: Exam UI — category/level selection, question display, answer tracking, navigation.
- **M2b**: Exam Engine — timer, auto-submit, scoring, results screen (Testing mode).
- **M2c**: Learning Mode — immediate feedback, explanations, self-paced flow.
- **M3**: Claude AI integration with difficulty mappings, prompt engineering, and question caching.
- **M4**: Gamification logic, Profiles, and Leaderboard.
- **M5**: PDF Report generation and Admin Dashboard.
