import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { askAi } from '../services/openRouter.services.js';
import User from '../models/user.model.js';
import Interview from "../models/interview.model.js";
import { getNextQuestionParams } from '../services/adaptiveInterview.service.js';
import { generateFeedback } from '../services/feedback.service.js';

/**
 * Extracts expected keywords from a question for feedback analysis
 * @param {string} question - The interview question
 * @returns {Array<string>} Array of expected keywords
 */
function extractExpectedKeywords(question) {
    // Simple keyword extraction based on common technical terms
    const commonKeywords = [
        'function', 'variable', 'class', 'object', 'array', 'string', 'number',
        'algorithm', 'data structure', 'database', 'api', 'framework', 'library',
        'javascript', 'react', 'node', 'python', 'java', 'html', 'css',
        'sql', 'mongodb', 'git', 'api', 'rest', 'json', 'async', 'promise',
        'async await', 'callback', 'closure', 'prototype', 'event loop', 'scope',
        'hoisting', 'this', 'bind', 'call', 'apply', 'map', 'filter', 'reduce'
    ];

    const questionLower = question.toLowerCase();
    return commonKeywords.filter(keyword => questionLower.includes(keyword));
}


export const analyzeResume = async (req, res) => {

    try {
        if (!req.file) {
            console.log("Resume required");
            return res.status(400).json({ message: "Resume required" });
        }
        const filepath = req.file.path;
        const filebuffer = await fs.promises.readFile(filepath);
        const uint8Array = new Uint8Array(filebuffer);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }
        resumeText = resumeText.replace(/\s+/g, " ").trim();

        const messages = [
            {
                role: "system",
                content: `Extract structured data from resume. Return strictly JSON: {
                    "role":"string",
                    "experience":"string",
                    "projects":["project1","project2"],
                    "skills":["skill1","skill2"]
                }`
            },
            {
                role: "user",
                content: resumeText
            }
        ];

        // const aiResponse=await askAi(messages);
        // const parsed=JSON.parse(aiResponse);

        const aiResponse = await askAi(messages);
        let parsed;
        try {
            const cleanJson = aiResponse.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(cleanJson[0]);
        } catch (err) {
            console.log("AI RAW RESPONSE:", aiResponse); // IMPORTANT
            throw new Error("Invalid AI response format");
        }

        fs.unlinkSync(filepath);
        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        });
    } catch (error) {
        console.log(error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: error.message });
    }


}

export const generateQuestions = async (req, res) => {
    try {
        let { role, experience, mode, resumeText, projects, skills } = req.body;
        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if (!role || !experience || !mode) {
            console.log("All fields are required");
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        if (user.credits < 50) {
            console.log("Not enough credits.Minimum 50 credits required");
            return res.status(400).json({ message: "Not enough credits.Minimum 50 credits required" });
        }
        const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
        const skillText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
        const safeResume = resumeText?.trim() || "None";
        const userPrompt = `
        Role: ${role}
        Experience: ${experience}
        InterviewMode: ${mode}
        Projects: ${projectText}
        Skills: ${skillText}
        Resume: ${safeResume}
        `;

        if (!userPrompt.trim()) {
            console.log("Prompt content is empty");
            return res.status(400).json({ message: "Prompt content is empty" });
        }

        const messages = [

            {
                role: "system",
                content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`
            }
            ,
            {
                role: "user",
                content: userPrompt
            }
        ];

        const aiResponse = await askAi(messages);
        if (!aiResponse || !aiResponse.trim()) {
            console.log("AI returned empty response");
            return res.status(500).json({ message: "AI returned empty response" });

        }
        const questionArray = aiResponse.split("\n").map(q => q.trim()).filter(q => q.length > 0).slice(0, 5);
        if (questionArray.length === 0) {
            console.log("AI failed to generate questions");
            return res.status(500).json({ message: "AI failed to generate questions" });
        }

        user.credits -= 50;
        await user.save();

        // Create the interview once with a fixed list of questions.
        // Do not append questions later inside submitAnswer or nextQuestion.
        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            projects,
            skills,
            resumeText: safeResume,
            questions: questionArray.map((q, index) => ({
                question: q,
                difficultyLevel: ["easy", "easy", "medium", "medium", "hard"][index],
                timeLimit: [60, 60, 90, 90, 120][index],
            }))
        })

        res.json({
            success: true,
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: user.name,
            questions: interview.questions.map(q => ({
                _id: q._id,
                question: q.question,
                difficultyLevel: q.difficultyLevel,
                timeLimit: q.timeLimit
            }))
        });




    } catch (error) {
        console.log("failed to create interview");
        return res.status(500).json({ message: `failed to create interview ${error}` });
    }
}

export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body;
        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        if (questionIndex < 0 || questionIndex >= interview.questions.length) {
            return res.status(400).json({ message: "Invalid question index" });
        }

        const question = interview.questions[questionIndex];

        if (!answer) {
            question.score = 0;
            question.feedback = "You did not submit an answer.";
            question.userAnswer = "";
            question.responseTime = timeTaken || 0;

            // FIX: Set legacy fields for no answer case
            question.confidence = 0;
            question.communication = 0;
            question.correctness = 0;

            await interview.save();
            return res.status(200).json({ feedback: question.feedback, score: 0, nextDifficulty: "medium", reason: "No answer submitted" });
        }

        if (timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Time limit exceeded. Answer not evaluated.";
            question.userAnswer = answer;
            question.responseTime = timeTaken;

            // FIX: Set legacy fields for time limit exceeded case
            question.confidence = 0;
            question.communication = 0;
            question.correctness = 0;

            await interview.save();
            return res.status(200).json({ feedback: question.feedback, score: 0, nextDifficulty: "easy", reason: "Exceeded time limit" });
        }

        const expectedKeywords = extractExpectedKeywords(question.question);
        // ISSUE 1 FIX: Pass question text to feedback for dynamic evaluation
        const feedbackData = generateFeedback(answer, expectedKeywords, question.question);

        // Log for debugging (remove in production)
        console.log(`[FEEDBACK DEBUG] Q${questionIndex}: "${question.question.substring(0, 50)}..."`);
        console.log(`[FEEDBACK DEBUG] Answer: "${answer.substring(0, 50)}..."`);
        console.log(`[FEEDBACK DEBUG] Feedback: ${feedbackData.suggestion}`);

        const overallScore = Math.round(
            (feedbackData.technicalScore + feedbackData.depthScore + feedbackData.communicationScore) / 3
        );

        question.userAnswer = answer;
        question.score = overallScore;
        question.responseTime = timeTaken;
        question.difficultyLevel = question.difficultyLevel || question.difficulty;
        // Store feedback with consistent structure
        question.feedback = {
            technical_accuracy_score: feedbackData.technicalScore,
            depth_score: feedbackData.depthScore,
            communication_score: feedbackData.communicationScore,
            missing_concepts: feedbackData.missingConcepts,
            improvement_suggestions: feedbackData.suggestion
        };

        // FIX: Map new feedback scores to legacy fields for report calculation
        question.confidence = feedbackData.technicalScore;
        question.communication = feedbackData.communicationScore;
        question.correctness = feedbackData.depthScore;

        await interview.save();

        const answeredQuestions = interview.questions.filter(q => q.userAnswer && q.userAnswer.trim().length > 0);

        let nextDifficulty = "medium";
        let reason = "Moderate performance";

        if (answeredQuestions.length > 0) {
            const avgScore = answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length;
            const avgTime = answeredQuestions.reduce((sum, q) => sum + q.responseTime, 0) / answeredQuestions.length;

            if (avgScore < 4 || avgTime > 40) {
                nextDifficulty = "easy";
                reason = avgScore < 4 ? "Low score" : "Slow response time";
            } else if (avgScore > 7 && avgTime < 30) {
                nextDifficulty = "hard";
                reason = "Strong performance and fast response";
            }
        }

        return res.status(200).json({
            success: true,
            feedback: {
                technical_accuracy_score: feedbackData.technicalScore,
                depth_score: feedbackData.depthScore,
                communication_score: feedbackData.communicationScore,
                missing_concepts: feedbackData.missingConcepts,
                improvement_suggestions: feedbackData.suggestion
            },
            score: overallScore,
            nextDifficulty,
            reason
        });

    } catch (error) {
        return res.status(500).json({ message: `failed to submit answer ${error}` });
    }
}


export const finishInterview = async (req, res) => {

    try {
        const { interviewId } = req.body;

        if (!interviewId) {
            return res.status(400).json({ message: "Interview ID missing" });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            console.log("Failed to find interview");
            return res.status(400).json({ message: "Failed to find interview" });
        }

        // const totalQuestions=interview.questions.length;
        const questions = interview.questions || [];
const totalQuestions = questions.length;

        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        // interview.questions.forEach(question => {
        //     totalScore += question.score || 0;
        //     totalConfidence += question.confidence || 0;
        //     totalCommunication += question.communication || 0;
        //     totalCorrectness += question.correctness || 0;
        // })
        questions.forEach(question => {
            if (!question) return;
            totalScore += question.score || 0;
            totalConfidence += question.confidence || 0;
            totalCommunication += question.communication || 0;
            totalCorrectness += question.correctness || 0;
        })

        

        const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        interview.finalScore = finalScore;
        // Must match `Interview` schema enum values.
        interview.status = "Completed";
        await interview.save();

        // ISSUE 3 FIX: Return structured report data with all necessary fields
        return res.status(200).json({
            success: true,
            interviewId: interview._id,
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: questions.filter(q => q).map((q) => ({
                question: q.question,
                score: q.score || 0,
                feedback: typeof q.feedback === 'object' ? q.feedback : { improvement_suggestions: q.feedback },
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0
            }))
        });
    } catch (error) {
        return res.status(500).json({ message: `failed to finish the interview ${error}` });
    }
}

export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.userId }).sort({ createdAt: -1 }).select("role experience mode status finalScore createdAt");
        return res.status(200).json(interviews);

    } catch (error) {
        return res.status(500).json({ message: `failed to get current user interviews ${error}` });
    }
}

export const getInterviewReport = async (req, res) => {
    try {

        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            console.log("Failed to find interview");
            return res.status(400).json({ message: "Failed to find interview" });
        }
        // const totalQuestions = interview.questions.length;
        const questions = interview.questions || [];
const totalQuestions = questions.length;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        // interview.questions.forEach(question => {
        //     totalConfidence += question.confidence || 0;
        //     totalCommunication += question.communication || 0;
        //     totalCorrectness += question.correctness || 0;
        // })
        questions.forEach(question => {
            if (!question) return;
            totalConfidence += question.confidence || 0;
            totalCommunication += question.communication || 0;
            totalCorrectness += question.correctness || 0;
        })
        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        return res.json({
            finalScore: interview.finalScore,
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: questions
        })
    } catch (error) {
        return res.status(500).json({ message: `failed to find current user Interview ${error}` });
    }
}

/**
 * Generate next adaptive question based on previous performance
 */
export const generateNextQuestion = async (req, res) => {
    try {
        const { interviewId, previousAnswers } = req.body;

        if (!interviewId) {
            return res.status(400).json({ message: "Interview ID is required" });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.credits < 10) {
            return res.status(400).json({ message: "Not enough credits. Minimum 10 credits required for next question" });
        }

        const answers = Array.isArray(previousAnswers) && previousAnswers.length > 0
            ? previousAnswers.map((a) => ({
                score: Number(a.score || 0),
                responseTime: Number(a.responseTime || 0)
            }))
            : interview.questions.map((q) => ({
                score: Number(q.score || 0),
                responseTime: Number(q.responseTime || 0)
            }));

        const interviewContext = {
            role: interview.role,
            experience: interview.experience,
            projects: interview.projects,
            skills: interview.skills,
            resumeText: interview.resumeText
        };

        const { difficulty, prompt } = getNextQuestionParams(answers, interviewContext);

        const messages = [
            {
                role: "system",
                content: prompt
            }
        ];

        const aiResponse = await askAi(messages);
        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({ message: "Failed to generate next adaptive question" });
        }

        const questionText = aiResponse.trim();
        const timeLimits = { easy: 60, medium: 90, hard: 120 };

        const nextQuestion = {
            question: questionText,
            difficultyLevel: difficulty,
            timeLimit: timeLimits[difficulty] || 60
        };

        // Do not append the generated question in this route.
        // The interview should keep the original question list constant.
        user.credits -= 10;
        await user.save();

        return res.status(200).json({
            nextQuestion,
            creditsLeft: user.credits,
            difficulty
        });
    } catch (error) {
        console.error("Failed to generate next question:", error);
        return res.status(500).json({ message: `Failed to generate next question: ${error.message}` });
    }
};

/**
 * Generate explainable feedback for user answer
 * Uses rule-based analysis for transparency and educational value
 */
export const getExplainableFeedback = async (req, res) => {
    try {
        const { userAnswer, expectedKeywords } = req.body;

        // Input validation
        if (!userAnswer || typeof userAnswer !== 'string') {
            return res.status(400).json({
                message: "userAnswer is required and must be a string"
            });
        }

        if (!Array.isArray(expectedKeywords)) {
            return res.status(400).json({
                message: "expectedKeywords must be an array of strings"
            });
        }

        // Generate feedback using explainable service
        const feedback = generateFeedback(userAnswer, expectedKeywords);

        // Return structured feedback
        res.status(200).json({
            success: true,
            feedback: {
                technicalScore: feedback.technicalScore,
                depthScore: feedback.depthScore,
                communicationScore: feedback.communicationScore,
                missingConcepts: feedback.missingConcepts,
                suggestion: feedback.suggestion
            },
            metadata: feedback.metadata,
            explanation: {
                technicalScore: "Based on percentage of expected keywords found in answer (0-10 scale)",
                depthScore: "Based on answer length and concept coverage (0-10 scale)",
                communicationScore: "Based on sentence structure and clarity heuristics (0-10 scale)",
                missingConcepts: "Keywords from expectedKeywords not found in userAnswer",
                suggestion: "Actionable improvement recommendation based on score analysis"
            }
        });

    } catch (error) {
        console.error("Failed to generate feedback:", error);
        return res.status(500).json({
            message: `Failed to generate feedback: ${error.message}`
        });
    }
};


