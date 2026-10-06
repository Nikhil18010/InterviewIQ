import mongoose from "mongoose";
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    userAnswer: {
        type: String,
        default: ""
    },
    score: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    difficultyLevel: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true
    },
    responseTime: {
        type: Number,
        default: 0
    },
    feedback: {
        technical_accuracy_score: { type: Number, default: 0 },
        depth_score: { type: Number, default: 0 },
        communication_score: { type: Number, default: 0 },
        missing_concepts: [{ type: String }],
        improvement_suggestions: { type: String, default: "" }
    },
    // Legacy fields for backward compatibility
    confidence: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 },
    timeLimit: { type: Number, default: 60 }
});

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ["HR","Technical"],
        required: true
    },
    resumeText: {
        type: String,
    },
    questions: [questionSchema],
    finalScore: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Incompleted","Completed"],
        default: "Incompleted"
    }
}, { timestamps: true });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;    
