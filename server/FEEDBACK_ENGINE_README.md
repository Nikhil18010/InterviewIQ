# Explainable Feedback Engine

This module provides transparent, rule-based feedback analysis for interview answers using simple, interpretable heuristics instead of complex machine learning models.

## Research Context

The Explainable Feedback Engine is designed for educational transparency in AI-assisted assessment systems. Each scoring component uses clear, deterministic algorithms that can be easily audited and explained to users, making it ideal for research papers on explainable AI in education.

## Architecture

### Service Layer (`feedback.service.js`)
Contains all feedback generation logic with detailed comments explaining the algorithms.

### Controller Layer (`interview.controller.js`)
`getExplainableFeedback()` function handles API requests and responses.

### API Endpoint
`POST /api/interview/feedback` - Generates explainable feedback for user answers.

## Scoring Components

### 1. Technical Score (0-10)
**Algorithm**: Percentage of expected keywords found in the answer
- Each matched keyword contributes equally to the score
- Formula: `(matchedKeywords / totalKeywords) * 10`
- Case-insensitive matching

### 2. Depth Score (0-10)
**Algorithm**: Combines answer length and concept coverage
- Base score from word count (50+ words = 10 points)
- Bonus points for covering multiple concepts
- Formula: `min(10, lengthScore + coverageBonus)`

### 3. Communication Score (0-10)
**Algorithm**: Analyzes sentence structure and readability
- Optimal sentence length: 15-25 words
- Checks for transition words (however, therefore, etc.)
- Evaluates answer structure (multiple sentences)

### 4. Missing Concepts
**Algorithm**: Simple text matching
- Returns array of unmatched keywords
- Case-insensitive comparison

### 5. Suggestion
**Algorithm**: Rule-based recommendation generation
- Prioritizes missing concepts
- Suggests structural improvements
- Provides actionable feedback

## API Usage

### Request
```javascript
POST /api/interview/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "userAnswer": "React is a JavaScript library for building user interfaces...",
  "expectedKeywords": ["React", "JavaScript", "components", "state", "props"]
}
```

### Response
```javascript
{
  "success": true,
  "feedback": {
    "technicalScore": 8,
    "depthScore": 7,
    "communicationScore": 9,
    "missingConcepts": ["hooks", "virtual DOM"],
    "suggestion": "Include key concepts like: hooks, virtual DOM"
  },
  "metadata": {
    "answerLength": 245,
    "wordCount": 42,
    "keywordsProvided": 5,
    "keywordsMatched": 3
  },
  "explanation": {
    "technicalScore": "Based on percentage of expected keywords found in answer (0-10 scale)",
    "depthScore": "Based on answer length and concept coverage (0-10 scale)",
    "communicationScore": "Based on sentence structure and clarity heuristics (0-10 scale)",
    "missingConcepts": "Keywords from expectedKeywords not found in userAnswer",
    "suggestion": "Actionable improvement recommendation based on score analysis"
  }
}
```

## Key Features

✅ **Fully Explainable**: Every score has a clear, documented calculation method
✅ **No ML Dependencies**: Uses simple heuristics, no complex models
✅ **Research-Ready**: Detailed comments and algorithm explanations
✅ **Educational Value**: Helps candidates understand scoring criteria
✅ **Transparent Metadata**: Includes calculation inputs for verification

## Example Usage in Research

```javascript
import { generateFeedback } from './services/feedback.service.js';

// Example for research paper
const feedback = generateFeedback(
  "React uses virtual DOM for performance optimization",
  ["React", "virtual DOM", "performance", "components", "state"]
);

console.log(feedback);
// Output shows exact scoring breakdown for analysis
```

## Integration Notes

- Requires authentication (Bearer token)
- Input validation ensures proper data types
- Returns structured JSON with explanations
- Metadata provides transparency for score verification
- Modular design allows easy testing and modification

## Future Research Directions

- Comparative studies with ML-based feedback systems
- User studies on feedback comprehension
- Algorithm refinements based on educational outcomes
- Integration with learning analytics platforms