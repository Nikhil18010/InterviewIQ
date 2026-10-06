import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { analyzeResume, finishInterview, getInterviewReport, getMyInterviews, submitAnswer, generateQuestions, generateNextQuestion, getExplainableFeedback } from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post("/resume",isAuth,upload.single("resume"),analyzeResume);
interviewRouter.post("/generate-questions",isAuth,generateQuestions);
interviewRouter.post("/next-question",isAuth,generateNextQuestion);
interviewRouter.post("/submit-answer",isAuth,submitAnswer);
interviewRouter.post("/finish",isAuth,finishInterview);
interviewRouter.post("/feedback",isAuth,getExplainableFeedback);

interviewRouter.get("/get-interview",isAuth,getMyInterviews);
interviewRouter.get("/report/:id",isAuth,getInterviewReport);


export default interviewRouter;
