# Adaptive Interview Engine

This module implements an adaptive interview system that dynamically adjusts question difficulty based on candidate performance.

## Features

- **Performance Tracking**: Tracks correctness scores and response times for each question
- **Adaptive Difficulty**: Automatically adjusts question difficulty based on performance
- **Dynamic Question Generation**: Generates questions using LLM with context-aware prompts

## Difficulty Levels

- **Easy** (< 4 average score): Basic concepts and fundamental knowledge
- **Medium** (4-7 average score): Practical application and problem-solving
- **Hard** (> 7 average score): Edge cases and system design

## API Endpoints

### Generate Next Question
**POST** `/api/interview/next-question`

Generates the next adaptive question based on previous performance.

**Request Body:**
```json
{
  "interviewId": "string"
}
```

**Response:**
```json
{
  "question": {
    "question": "string",
    "difficulty": "easy|medium|hard",
    "timeLimit": 60
  },
  "questionIndex": 0,
  "creditsLeft": 90
}
```

**Headers:**
- `Authorization`: Bearer token required

## Service Functions

### `calculateNextDifficulty(previousQuestions)`
Calculates the next difficulty level based on previous question scores.

**Parameters:**
- `previousQuestions`: Array of question objects with `score` property

**Returns:** `"easy" | "medium" | "hard"`

### `generateQuestionPrompt(difficulty, context)`
Generates LLM prompt for question generation based on difficulty and interview context.

**Parameters:**
- `difficulty`: Difficulty level
- `context`: Interview context (role, experience, projects, skills, resume)

**Returns:** LLM prompt string

### `getNextQuestionParams(previousQuestions, interviewContext)`
Main service function that combines difficulty calculation and prompt generation.

**Parameters:**
- `previousQuestions`: Previous questions array
- `interviewContext`: Interview context object

**Returns:**
```javascript
{
  difficulty: "easy|medium|hard",
  prompt: "LLM prompt string"
}
```

## Usage Example

```javascript
import { getNextQuestionParams } from './services/adaptiveInterview.service.js';

// Previous questions with performance data
const previousQuestions = [
  { score: 8, responseTime: 45 },
  { score: 6, responseTime: 62 }
];

const context = {
  role: "Frontend Developer",
  experience: "3 years",
  projects: ["E-commerce site", "Dashboard app"],
  skills: ["React", "JavaScript", "CSS"]
};

const { difficulty, prompt } = getNextQuestionParams(previousQuestions, context);
// difficulty: "medium"
// prompt: LLM prompt for medium difficulty question
```

## Database Schema Updates

The question schema now includes `responseTime` field to track response duration:

```javascript
{
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: String,
  feedback: String,
  score: Number,
  confidence: Number,
  communication: Number,
  correctness: Number,
  responseTime: Number  // New field
}
```

## Integration Notes

- Questions are generated on-demand rather than pre-generating a fixed set
- Each question costs 10 credits (configurable)
- Time limits vary by difficulty: easy (60s), medium (90s), hard (120s)
- Performance data is stored for analysis and reporting