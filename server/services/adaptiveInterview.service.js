/**
 * Adaptive Interview Engine Service
 * Determines next question difficulty and generates LLM prompt based on user performance
 */

/**
 * Calculates the next difficulty level based on previous performance
 * @param {Array} previousQuestions - Array of question objects with scores and response times
 * @returns {string} - "easy", "medium", or "hard"
 */
export const calculateNextDifficulty = (previousQuestions) => {
    if (!previousQuestions || previousQuestions.length === 0) {
        return "easy"; // Start with easy for first question
    }

    // Calculate average score
    const totalScore = previousQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
    const averageScore = totalScore / previousQuestions.length;

    if (averageScore < 4) {
        return "easy";
    } else if (averageScore <= 7) {
        return "medium";
    } else {
        return "hard";
    }
};

/**
 * Generates LLM prompt for the next question based on difficulty
 * @param {string} difficulty - The difficulty level ("easy", "medium", "hard")
 * @param {Object} context - Interview context (role, experience, etc.)
 * @returns {string} - LLM prompt for question generation
 */
export const generateQuestionPrompt = (difficulty, context) => {
    const { role, experience, projects, skills, resumeText } = context;

    let difficultyInstruction = "";
    let questionType = "";

    switch (difficulty) {
        case "easy":
            difficultyInstruction = "Focus on basic concepts and fundamental knowledge.";
            questionType = "basic conceptual questions";
            break;
        case "medium":
            difficultyInstruction = "Focus on practical application and problem-solving.";
            questionType = "application-based questions";
            break;
        case "hard":
            difficultyInstruction = "Focus on advanced scenarios, edge cases, and system design.";
            questionType = "edge cases and system design questions";
            break;
        default:
            difficultyInstruction = "Focus on basic concepts and fundamental knowledge.";
            questionType = "basic conceptual questions";
    }

    const prompt = `
You are a professional interviewer conducting an adaptive interview.

Generate exactly 1 interview question for a candidate with:
- Role: ${role || "Software Developer"}
- Experience: ${experience || "Entry level"}
- Projects: ${Array.isArray(projects) ? projects.join(", ") : projects || "None"}
- Skills: ${Array.isArray(skills) ? skills.join(", ") : skills || "None"}

${difficultyInstruction}

Question Requirements:
- Generate ${questionType}
- Question must be between 15 and 25 words
- One complete sentence only
- Keep language simple and conversational
- Make it practical and realistic
- Do NOT add explanations or extra text

Return only the question text, nothing else.
`;

    return prompt.trim();
};

/**
 * Main service function for adaptive interview engine
 * @param {Array} previousAnswers - Array of answer objects with score and responseTime
 * @param {Object} interviewContext - Interview context (role, experience, etc.)
 * @returns {Object} - { difficulty: string, prompt: string }
 */
export const getNextQuestionParams = (previousAnswers, interviewContext) => {
    const difficulty = calculateNextDifficulty(previousAnswers);
    const prompt = generateQuestionPrompt(difficulty, interviewContext);

    return {
        difficulty,
        prompt
    };
};