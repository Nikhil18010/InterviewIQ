import React from 'react'
// import maleVideo from '../assets/male-ai.mp4'
import femaleVideo from "../assets/Videos/female-ai.mp4";
import maleVideo from "../assets/Videos/male-ai.mp4";
import Timer from './Timer';
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneAlt, FaMicrophoneSlash } from 'react-icons/fa';
import { useState } from 'react';
import { useRef } from 'react'
import { useEffect } from 'react';
import axios from 'axios';
import { ServerUrl } from '../App';
import { BsArrowRight } from 'react-icons/bs';

function Step2Interview({ interviewData, onFinish }) {
    const { interviewId, questions, userName } = interviewData;
    const [isIntroPhase, setIsIntroPhase] = useState(true);

    const [isMicOn, setIsMicOn] = useState(true);
    const recgnitionRef = useRef(null);
    const [isAIPlaying, setIsAIPlaying] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState(null); // Changed to object
    const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
    const [nextDifficulty, setNextDifficulty] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voiceGender, setVoiceGender] = useState("female");
    const [subtitle, setSubtitle] = useState("");

    const videoRef = useRef(null);
    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    const isRecognitionRunning = useRef(false);
    const isStoppingRecognition = useRef(false);
    const autoAdvanceTimeoutRef = useRef(null);

    const [isFinishing, setIsFinishing] = useState(false);




    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices.length) return;

            const femaleVoice = voices.find((v) => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("female"));

            if (femaleVoice) {
                setSelectedVoice(femaleVoice);
                setVoiceGender("female");
                return;
            }

            const maleVoice = voices.find((v) => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("mark") || v.name.toLowerCase().includes("male"));

            if (maleVoice) {
                setSelectedVoice(maleVoice);
                setVoiceGender("male");
                return;
            }

            setSelectedVoice(voices[0]);
            setVoiceGender("female");
        }
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

    // speak function

    const speakText = (text) => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis || !selectedVoice) {
                resolve();
                return;
            }

            window.speechSynthesis.cancel();
            // Flip immediately so the timer pauses reliably,
            // even before the browser fires `utterance.onstart`.
            setIsAIPlaying(true);
            stopMic();

            const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");

            const utterance = new SpeechSynthesisUtterance(humanText);
            utterance.voice = selectedVoice;
            utterance.rate = 0.92;
            utterance.pitch = 1.05;
            utterance.volume = 1;

            let fallbackTimer = setTimeout(() => {
                console.log("Speech fallback timeout reached");
                cleanupAndResolve();
            }, 7000);

            const cleanupAndResolve = () => {
                clearTimeout(fallbackTimer);
                videoRef.current?.pause();
                if (videoRef.current) videoRef.current.currentTime = 0;
                setIsAIPlaying(false);
                if (isMicOn) {
                    startMic();
                }
                setSubtitle("");
                resolve();
            };

            utterance.onstart = () => {
                videoRef.current?.play();
            };

            utterance.onend = cleanupAndResolve;
            utterance.onerror = cleanupAndResolve;

            setSubtitle(text);
            window.speechSynthesis.speak(utterance);
        })
    }

    useEffect(() => {
        if (!selectedVoice) return;
        const runIntro = async () => {
            if (isIntroPhase) {
                await speakText(`Hi ${userName}, its great to meet you today.I hope you are feeling confident and ready.`);
                await speakText(`I will ask you a few questions.Just answer naturally, and take your time.Let's begin.`);
                setIsIntroPhase(false);
            } else if (currentQuestion) {
                await new Promise(r => setTimeout(r, 800));
                if (currentIndex === questions.length - 1) {
                    await speakText("Alright, this one might be a bit more challenging.");
                }
                await speakText(currentQuestion.question);

                // if(isMicOn){
                //     startMic();
                // }
            }
        }
        runIntro();


    }, [selectedVoice, isIntroPhase, currentIndex]);

    const questionDuration =
        currentQuestion?.timeLimit ?? currentQuestion?.timeLeft ?? 60;
    const timerActive =
        !isIntroPhase &&
        !!currentQuestion &&
        !feedback &&
        !isSubmitting &&
        !isAIPlaying;

    // Always reset the ring to full when the question changes.
    // The countdown itself will only start when `timerActive` becomes true
    // (i.e. after AI finishes speaking, and while not submitting/showing feedback).
    useEffect(() => {
        if (isIntroPhase) return;
        if (!currentQuestion) return;
        setTimeLeft(questionDuration);
    }, [currentIndex, isIntroPhase, questionDuration]);

    useEffect(() => {
        if (!timerActive) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timerActive]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            setAnswer((prev) => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.onstart = () => {
            isRecognitionRunning.current = true;
        };

        recognition.onend = () => {
            isRecognitionRunning.current = false;
            if (isStoppingRecognition.current) {
                isStoppingRecognition.current = false;
                return;
            }
            if (isMicOn && !isAIPlaying) {
                setTimeout(() => {
                    if (!isRecognitionRunning.current && recgnitionRef.current) {
                        try {
                            recgnitionRef.current.start();
                        } catch (e) {
                            console.log("Mic restart error:", e);
                        }
                    }
                }, 500);
            }
        };

        recognition.onerror = (event) => {
            console.log("Mic recognition error:", event.error);
            isRecognitionRunning.current = false;
            if (!isStoppingRecognition.current && isMicOn && !isAIPlaying) {
                setTimeout(() => {
                    if (recgnitionRef.current && !isRecognitionRunning.current) {
                        try {
                            recgnitionRef.current.start();
                        } catch (e) {
                            console.log("Mic restart after error failed:", e);
                        }
                    }
                }, 500);
            }
        };

        recgnitionRef.current = recognition;
    }, []);

    const startMic = () => {
        if (recgnitionRef.current && !isAIPlaying && !isRecognitionRunning.current) {
            try {
                recgnitionRef.current.start();
            } catch (e) {
                console.log("Mic error:", e);
            }
        }
    }

    const stopMic = () => {
        if (recgnitionRef.current && isRecognitionRunning.current) {
            isStoppingRecognition.current = true;
            recgnitionRef.current.stop();
        }
    }




    const toggleMic = () => {
        if (isMicOn) {
            stopMic();
        } else {
            startMic();
        }
        setIsMicOn(!isMicOn);
    }

    const submitAnswer = async (autoSubmit = false) => {
        if (isSubmitting) return;
        stopMic();
        setIsSubmitting(true);
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = null;
        }

        try {
            const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
                interviewId,
                questionIndex: currentIndex,
                answer,
                timeTaken: currentQuestion.timeLimit - timeLeft,
            }, { withCredentials: true });

            const data = result.data;
            setFeedback(data.feedback);
            setNextDifficulty(data.nextDifficulty);
            setShowFeedback(true);
            setIsSubmitting(false);

            speakText(data.feedback.improvement_suggestions || "Answer submitted successfully");

            if (autoSubmit || isLastQuestion) {
                autoAdvanceTimeoutRef.current = setTimeout(() => {
                    if (isLastQuestion) {
                        finishInterview();
                    } else {
                        handleNext();
                    }
                }, 4000);
            }
        } catch (e) {
            console.log(e);
            setIsSubmitting(false);
        }
    }

    const handleNext = async () => {
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = null;
        }

        setAnswer("");
        setFeedback(null);
        setShowFeedback(false);
        setNextDifficulty(null);

        if (currentIndex < questions.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setTimeLeft(questions[nextIndex]?.timeLimit || 60);
        } else {
            finishInterview();
            return;
        }

        await speakText("Alright, let's move to the next question.");

        setTimeout(() => {
            if (isMicOn) {
                startMic();
            }
        }, 500);
    }

    const finishInterview = async () => {
        if (isFinishing) return;
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = null;
        }
        setIsFinishing(true);
        stopMic();
        setIsMicOn(false);
        console.log("Sending interviewId:", interviewId);
        try {
            const result = await axios.post(ServerUrl + "/api/interview/finish", {
                interviewId
            }, { withCredentials: true });
            
            console.log("Finish response:", result.data);
            
            // ISSUE 3 FIX: Validate response before calling onFinish
            if (result.data && result.data.success) {
                // Pass the complete report data to parent component
                onFinish(result.data);
            } else {
                console.error("Invalid finish response:", result.data);
                alert("Failed to finish interview");
                setIsFinishing(false);
            }

        } catch (e) {
            console.error("Finish interview error:", e);
            alert("Error finishing interview: " + (e.response?.data?.message || e.message));
            setIsFinishing(false);
        }
    }

    useEffect(() => {
        if (isIntroPhase) return;
        if (!currentQuestion) return;
        if (timeLeft === 0 && !isSubmitting && !feedback) {
            submitAnswer(true);
        }
    }, [timeLeft]);

    useEffect(() => {
        return () => {
            if (recgnitionRef.current) {
                try {
                    recgnitionRef.current.stop();
                    recgnitionRef.current.abort();
                } catch (e) {
                    console.log("Mic cleanup error:", e);
                }
            }
            if (autoAdvanceTimeoutRef.current) {
                clearTimeout(autoAdvanceTimeoutRef.current);
                autoAdvanceTimeoutRef.current = null;
            }
            window.speechSynthesis.cancel();
        }
    }, []);

    return (
        <div className='min-h-screen bg-[#0b1120] flex items-center justify-center p-4 sm:p-6'>
            <div className='w-full max-w-350 min-h-[80vh] bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden'>
                {/* {video section} */}
                <div className='w-full lg:w-[35%] bg-white/5 flex flex-col items-center p-6 space-y-6 border-r border-white/10'>

                    <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
                        <video src={videoSource} key={videoSource} ref={videoRef} muted playsInline preload="auto" className='w-full h-auto object-cover' />
                    </div>

                    {/* {Subtitle pending} */}

                    {subtitle && (
                        <div className='w-full max-w-md bg-white/5 border border-white/10 rounded-xl shadow-lg p-4 '>
                            <p className='text-[#e2e8f0] text-sm sm:text-base font-medium text-center leading-relaxed'>
                                {subtitle}
                            </p>
                        </div>
                    )}

                    {/* {Timer} */}

                    <div className='w-full max-w-md bg-white/5 border border-white/10 rounded-2xl shadow-lg p-6 space-y-5'>
                        <div className='flex justify-between items-center'>
                            <span className='text-sm text-[#94a3b8]'>
                                Interview Status
                            </span>

                            {isAIPlaying && (
                                <span className='text-sm font-semibold text-[#38bdf8]'>
                                    {isAIPlaying ? "AI Speaking" : ""}
                                </span>
                            )}



                        </div>

                        <div className='h-px bg-white/10'>

                        </div>

                        <div className='flex justify-center'>
                            <Timer timeLeft={timeLeft} totalTime={questionDuration} />
                        </div>

                        <div className='h-px bg-white/10'>

                        </div>

                        <div className='grid grid-cols-2 gap-6 text-center'>
                            <div >
                                <span className='text-2xl font-bold text-[#6366f1]'> {currentIndex + 1} </span>
                                <span className='text-xs text-[#94a3b8]'>Current Questions</span>
                            </div>

                            <div>
                                <span className='text-2xl font-bold text-[#6366f1]'>{questions.length}</span>
                                <span className='text-xs text-[#94a3b8]'>Total Questions</span>

                            </div>
                        </div>

                    </div>

                </div>

                {/* {text Section} */}
                <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
                    <h2 className='text-xl sm:text-2xl font-bold text-[#e2e8f0] mb-6'>AI Smart Interview</h2>



                    {!isIntroPhase && (
                        <div className='relative mb-6 bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 shadow-lg'>
                            <p className='text-xs sm:text-sm text-[#94a3b8] mb-2'>
                                Question {currentIndex + 1} of {questions.length}
                            </p>

                            <div className='text-base sm:text-lg font-semibold text-[#e2e8f0] leading-relaxed'>
                                {currentQuestion?.question}
                            </div>
                        </div>
                    )}

                    <textarea
                        placeholder="Type your answer here..."
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer}
                        className=" flex-1 bg-white/5 border border-white/10 px-4 sm:p-6 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-[#6366f1] transition text-[#e2e8f0] placeholder-[#94a3b8]"
                    />

                    {showFeedback && feedback ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className='mt-6 bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg'
                        >
                            <h3 className='text-lg font-semibold text-[#e2e8f0] mb-4'>Feedback Analysis</h3>
                            
                            {/* Scores */}
                            <div className='grid grid-cols-3 gap-4 mb-4'>
                                <div className='text-center'>
                                    <div className={`text-2xl font-bold mb-1 ${
                                        feedback.technical_accuracy_score >= 7 ? 'text-green-400' :
                                        feedback.technical_accuracy_score >= 4 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {feedback.technical_accuracy_score}/10
                                    </div>
                                    <div className='text-xs text-[#94a3b8]'>Technical</div>
                                </div>
                                <div className='text-center'>
                                    <div className={`text-2xl font-bold mb-1 ${
                                        feedback.depth_score >= 7 ? 'text-green-400' :
                                        feedback.depth_score >= 4 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {feedback.depth_score}/10
                                    </div>
                                    <div className='text-xs text-[#94a3b8]'>Depth</div>
                                </div>
                                <div className='text-center'>
                                    <div className={`text-2xl font-bold mb-1 ${
                                        feedback.communication_score >= 7 ? 'text-green-400' :
                                        feedback.communication_score >= 4 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {feedback.communication_score}/10
                                    </div>
                                    <div className='text-xs text-[#94a3b8]'>Communication</div>
                                </div>
                            </div>

                            {/* Missing Concepts */}
                            {feedback.missing_concepts && feedback.missing_concepts.length > 0 && (
                                <div className='mb-4'>
                                    <div className='text-sm text-[#94a3b8] mb-2'>Missing Concepts:</div>
                                    <div className='flex flex-wrap gap-2'>
                                        {feedback.missing_concepts.map((concept, index) => (
                                            <span key={index} className='bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs'>
                                                {concept}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            <div className='mb-4'>
                                <div className='text-sm text-[#94a3b8] mb-2'>Suggestions:</div>
                                <p className='text-[#e2e8f0] text-sm'>{feedback.improvement_suggestions}</p>
                            </div>

                            {/* Next Difficulty Indicator */}
                            {nextDifficulty && (
                                <div className='mb-4'>
                                    <div className='text-sm text-[#94a3b8] mb-2'>Next Question Difficulty:</div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        nextDifficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                                        nextDifficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                        'bg-red-500/20 text-red-300'
                                    }`}>
                                        {nextDifficulty.toUpperCase()}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleNext}
                                className='w-full bg-[#6366f1] text-white py-3 rounded-xl shadow-lg hover:bg-[#5b5bd6] transition flex items-center justify-center gap-2'
                            >
                                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'} <BsArrowRight size={18} />
                            </button>
                        </motion.div>
                    ) : !showFeedback && (
                        <div className='flex items-center gap-4 mt-6'>
                            <motion.button
                                onClick={toggleMic}
                                whileTap={{ scale: 0.9 }}
                                className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#6366f1] text-white shadow-lg hover:bg-[#5b5bd6] transition'>
                                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                            </motion.button>

                            <motion.button
                                onClick={submitAnswer}
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.95 }}
                                className='flex-1 bg-[#6366f1] text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:bg-[#5b5bd6] transition font-semibold disabled:bg-gray-500'>
                                {isSubmitting ? "Submitting..." : "Submit Answer"}
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Step2Interview