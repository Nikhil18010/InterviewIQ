/**
 * Explainable Feedback Engine Service
 *
 * This service provides transparent, rule-based feedback analysis for interview answers.
 * The approach uses simple, interpretable heuristics rather than complex ML models,
 * making the feedback generation process fully explainable and reproducible.
 *
 * Research Context:
 * - Designed for educational transparency in AI-assisted assessment
 * - Each score component has clear, deterministic calculation rules
 * - Enables users to understand and improve based on objective criteria
 */

/**
 * Calculates technical accuracy score based on keyword matching
 *
 * Algorithm: Strict percentage of expected keywords found in the answer
 * - Requires higher keyword coverage for good scores
 * - Score ranges from 0-10 with stricter thresholds
 *
 * @param {string} userAnswer - The candidate's answer text
 * @param {string[]} expectedKeywords - Array of expected technical keywords
 * @returns {number} Score between 0-10
 */
export const calculateTechnicalScore = (userAnswer, expectedKeywords) => {
    if (!expectedKeywords || expectedKeywords.length === 0) {
        return 3; // Lower neutral score when no keywords provided
    }

    const answerLower = userAnswer.toLowerCase();
    const matchedKeywords = expectedKeywords.filter(keyword =>
        answerLower.includes(keyword.toLowerCase())
    );

    const matchPercentage = (matchedKeywords.length / expectedKeywords.length) * 100;

    // Stricter scoring: require higher coverage for good scores
    let technicalScore;
    if (matchPercentage >= 80) technicalScore = 8; // Excellent coverage
    else if (matchPercentage >= 60) technicalScore = 6; // Good coverage
    else if (matchPercentage >= 40) technicalScore = 4; // Average coverage
    else if (matchPercentage >= 20) technicalScore = 2; // Poor coverage
    else technicalScore = 0; // Very poor coverage

    return Math.max(0, Math.min(8, technicalScore)); // Cap at 8, never 9-10
};

/**
 * Calculates depth score based on answer comprehensiveness
 *
 * Algorithm: Strict evaluation of answer depth and detail
 * - Requires substantial word count and concept coverage
 * - Penalizes superficial answers
 * - Stricter thresholds for good scores
 *
 * @param {string} userAnswer - The candidate's answer text
 * @param {string[]} expectedKeywords - Array of expected technical keywords
 * @returns {number} Score between 0-10
 */
export const calculateDepthScore = (userAnswer, expectedKeywords) => {
    const wordCount = userAnswer.trim().split(/\s+/).length;

    // Stricter length requirements
    let lengthScore;
    if (wordCount >= 100) lengthScore = 7; // Very detailed
    else if (wordCount >= 75) lengthScore = 5; // Detailed
    else if (wordCount >= 50) lengthScore = 3; // Adequate
    else if (wordCount >= 25) lengthScore = 1; // Brief
    else lengthScore = 0; // Too brief

    // Stricter concept coverage requirements
    const uniqueConcepts = expectedKeywords.length;
    const coverageBonus = uniqueConcepts > 4 ? 2 : uniqueConcepts > 2 ? 1 : 0;

    const depthScore = Math.min(8, lengthScore + coverageBonus); // Cap at 8

    return Math.max(0, Math.round(depthScore));
};

/**
 * Calculates communication clarity score using basic heuristics
 *
 * Algorithm: Strict evaluation of communication effectiveness
 * - Requires proper sentence structure and flow
 * - Penalizes poor grammar and unclear expression
 * - Stricter requirements for good scores
 *
 * @param {string} userAnswer - The candidate's answer text
 * @returns {number} Score between 0-10
 */
export const calculateCommunicationScore = (userAnswer) => {
    if (!userAnswer || userAnswer.trim().length === 0) {
        return 0;
    }

    const sentences = userAnswer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;

    // Stricter sentence length evaluation
    const avgSentenceLength = sentences.reduce((sum, sentence) => {
        return sum + sentence.trim().split(/\s+/).length;
    }, 0) / sentences.length;

    let lengthScore;
    if (avgSentenceLength >= 15 && avgSentenceLength <= 25) lengthScore = 6; // Optimal length
    else if (avgSentenceLength >= 10 && avgSentenceLength <= 30) lengthScore = 4; // Acceptable
    else lengthScore = 2; // Too short or too long

    // Stricter transition word requirements
    const transitionWords = ['however', 'therefore', 'additionally', 'furthermore', 'moreover', 'consequently', 'specifically', 'generally', 'basically', 'essentially', 'first', 'second', 'finally', 'in conclusion'];
    const hasTransitions = transitionWords.some(word =>
        userAnswer.toLowerCase().includes(word)
    );
    const transitionBonus = hasTransitions ? 2 : 0;

    // Check for multiple sentences (structure)
    const structureBonus = sentences.length >= 4 ? 2 : sentences.length >= 2 ? 1 : 0;

    const communicationScore = Math.min(8, lengthScore + transitionBonus + structureBonus); // Cap at 8

    return Math.max(0, Math.round(communicationScore));
};

/**
 * Identifies missing concepts from expected keywords
 *
 * Algorithm: Simple text matching to find absent keywords
 * - Case-insensitive matching
 * - Returns array of unmatched keywords
 *
 * @param {string} userAnswer - The candidate's answer text
 * @param {string[]} expectedKeywords - Array of expected technical keywords
 * @returns {string[]} Array of missing concept keywords
 */
export const identifyMissingConcepts = (userAnswer, expectedKeywords) => {
    if (!expectedKeywords || expectedKeywords.length === 0) {
        return [];
    }

    const answerLower = userAnswer.toLowerCase();
    const missingConcepts = expectedKeywords.filter(keyword =>
        !answerLower.includes(keyword.toLowerCase())
    );

    return missingConcepts;
};

/**
 * Generates improvement suggestion based on analysis
 *
 * Algorithm: Realistic suggestion generation based on strict scoring
 * - Provides critical feedback for low scores
 * - Gives balanced feedback for average scores
 * - Offers appreciation with minor suggestions for high scores
 *
 * @param {number} technicalScore - Technical accuracy score
 * @param {number} depthScore - Depth/comprehensiveness score
 * @param {number} communicationScore - Communication clarity score
 * @param {string[]} missingConcepts - Array of missing concepts
 * @returns {string} Improvement suggestion
 */
export const generateSuggestion = (technicalScore, depthScore, communicationScore, missingConcepts) => {
    const suggestions = [];

    // Stricter technical accuracy suggestions
    if (technicalScore < 4) {
        if (missingConcepts.length > 0) {
            suggestions.push(`Your answer lacks key technical concepts. Include terms like: ${missingConcepts.slice(0, 3).join(', ')}`);
        } else {
            suggestions.push('Your technical knowledge needs improvement. Study the fundamental concepts and terminology.');
        }
    } else if (technicalScore < 6) {
        suggestions.push('Your technical understanding is basic. Add more specific technical details and examples.');
    }

    // Stricter depth suggestions
    if (depthScore < 4) {
        suggestions.push('Your answer is too brief and lacks depth. Provide comprehensive explanations with examples.');
    } else if (depthScore < 6) {
        suggestions.push('Expand your answer with more detailed analysis and practical examples.');
    }

    // Stricter communication suggestions
    if (communicationScore < 4) {
        suggestions.push('Your communication is unclear. Structure your answer with proper sentences and logical flow.');
    } else if (communicationScore < 6) {
        suggestions.push('Improve your communication clarity by using better sentence structure and transitions.');
    }

    // Realistic high score feedback (rare with constraints)
    if (technicalScore >= 7 && depthScore >= 7 && communicationScore >= 7) {
        suggestions.push('Strong answer! Consider adding industry-specific examples to demonstrate deeper expertise.');
    } else if (technicalScore >= 6 && depthScore >= 6 && communicationScore >= 6) {
        suggestions.push('Good answer with solid foundation. Focus on adding more technical precision.');
    }

    return suggestions.length > 0 ? suggestions[0] : 'Decent answer. Continue practicing to improve consistency across all areas.';
};

/**
 * Main feedback generation function
 *
 * This is the primary interface for the Explainable Feedback Engine.
 * All scoring components are calculated using transparent, rule-based algorithms
 * that can be easily audited and explained to users.
 *
 * Research Benefits:
 * - Full transparency in scoring methodology
 * - Reproducible results across different runs
 * - Educational value for candidates learning interview skills
 *
 * @param {string} userAnswer - The candidate's answer text
 * @param {string[]} expectedKeywords - Array of expected technical keywords
 * @returns {Object} Structured feedback object
 */
export const generateFeedback = (userAnswer, expectedKeywords, questionText = '') => {
    // Input validation
    const answer = userAnswer || '';
    const keywords = Array.isArray(expectedKeywords) ? expectedKeywords : [];
    const question = questionText || '';

    // Calculate individual scores
    const technicalScore = calculateTechnicalScore(answer, keywords);
    const depthScore = calculateDepthScore(answer, keywords);
    const communicationScore = calculateCommunicationScore(answer);
    const missingConcepts = identifyMissingConcepts(answer, keywords);
    
    // FIX: Apply constraints to prevent unrealistic score combinations
    let adjustedTechnicalScore = technicalScore;
    let adjustedDepthScore = depthScore;
    let adjustedCommunicationScore = communicationScore;

    // Constraint 1: If technical score is low, depth cannot be high
    if (technicalScore < 4) {
        adjustedDepthScore = Math.min(adjustedDepthScore, 5);
    } else if (technicalScore < 6) {
        adjustedDepthScore = Math.min(adjustedDepthScore, 7);
    }

    // Constraint 2: Communication score cannot be much higher than technical score
    if (communicationScore > technicalScore + 2) {
        adjustedCommunicationScore = technicalScore + 2;
    }

    // Constraint 3: Prevent all scores from being high simultaneously (unrealistic)
    const highScoreCount = [adjustedTechnicalScore, adjustedDepthScore, adjustedCommunicationScore]
        .filter(score => score >= 7).length;
    if (highScoreCount >= 2) {
        // If two scores are high, cap the third
        if (adjustedTechnicalScore < 7) adjustedTechnicalScore = Math.min(adjustedTechnicalScore, 6);
        if (adjustedDepthScore < 7) adjustedDepthScore = Math.min(adjustedDepthScore, 6);
        if (adjustedCommunicationScore < 7) adjustedCommunicationScore = Math.min(adjustedCommunicationScore, 6);
    }

    // Constraint 4: Never allow perfect scores (9-10) unless truly exceptional
    adjustedTechnicalScore = Math.min(adjustedTechnicalScore, 8);
    adjustedDepthScore = Math.min(adjustedDepthScore, 8);
    adjustedCommunicationScore = Math.min(adjustedCommunicationScore, 8);
    
    // ISSUE 1 FIX: Generate context-aware suggestion based on question type
    let suggestion = generateSuggestion(adjustedTechnicalScore, adjustedDepthScore, adjustedCommunicationScore, missingConcepts);
    
    // Add question-specific hints for better variation
    if (question.toLowerCase().includes('design') && adjustedTechnicalScore < 7) {
        suggestion = 'Consider discussing scalability, performance, and trade-offs in your design approach. ' + suggestion;
    }
    if (question.toLowerCase().includes('implement') && adjustedDepthScore < 7) {
        suggestion = 'Walk through your implementation step-by-step. ' + suggestion;
    }
    if (question.toLowerCase().includes('difference') && adjustedTechnicalScore < 7) {
        suggestion = 'Highlight key distinctions with concrete examples. ' + suggestion;
    }
    if (question.toLowerCase().includes('explain') && adjustedCommunicationScore < 7) {
        suggestion = 'Break down your explanation into simpler components. ' + suggestion;
    }

    // Return structured feedback with adjusted scores
    return {
        technicalScore: adjustedTechnicalScore,
        depthScore: adjustedDepthScore,
        communicationScore: adjustedCommunicationScore,
        missingConcepts,
        suggestion,
        // Additional metadata for transparency
        metadata: {
            answerLength: answer.length,
            wordCount: answer.trim().split(/\s+/).length,
            keywordsProvided: keywords.length,
            keywordsMatched: keywords.length - missingConcepts.length,
            questionContext: question.substring(0, 50),
            constraintsApplied: true
        }
    };
};