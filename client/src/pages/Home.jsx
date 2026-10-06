import React from 'react'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import {motion } from 'framer-motion'
import { BsRobot,BsMic,BsClock,BsBarChart,BsFileEarmarkText } from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import AuthModel from '../components/AuthModel'
import { useState } from 'react';
import evalImg from "../assets/ai-ans.png";
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from '../components/Footer'


function Home() {
  const {userData} = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  return (
    <div className='min-h-screen bg-[#0b1120] flex flex-col'>
        <Navbar />
        <div className='flex-1 px-6 py-20'>

            <div className='max-w-6xl mx-auto'>

            <div className='flex justify-center mb-6'>
                <div className='bg-white/10 text-[#94a3b8] text-sm px-4 py-2 rounded-full flex items-center gap-2 border border-white/10'>
                    <HiSparkles size={16} className='text-[#38bdf8]'/>
                    Your AI-Powered Interview Practice Platform
                </div>

            </div>

            <div className='text-center mb-28'>
                    <motion.h1 
                    initial={{opacity:0, y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} 
                    className='text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto text-[#e2e8f0]'>
                        Build confidence with 
                        <span className='relative inline-block'>
                            <span className='bg-[#6366f1]/20 text-[#6366f1] px-5 py-1 rounded-full border border-[#6366f1]/30'>
                                smarter AI practice

                            </span>
                        </span>

                    </motion.h1>

                    <motion.p
                    initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8}} 
                    className='text-[#94a3b8] text-lg mt-6 max-w-2xl mx-auto'>
                        Role-based mock interviews with smart follow-ups,adaptive difficulty and real-time performance evalution.
                    </motion.p>


                    <div className='flex flex-wrap justify-center gap-4 mt-10'>


                        <motion.button
                        onClick={() => {
                            if(!userData) {
                                setShowAuth(true);
                                return;
                            }
                            navigate("/interview");
                        }}
                        whileHover={{opacity:0.9,scale:1.03}} 
                        whileTap={{opacity:1,scale:0.98}}
                        className='bg-[#6366f1] text-white px-10 py-3 rounded-full hover:bg-[#5b5bd6] transition-all shadow-lg'
                        >
                            Start Practicing

                        </motion.button>




                        <motion.button
                        onClick={() => {
                            if(!userData) {
                                setShowAuth(true);
                                return;
                            }
                            navigate("/history");
                        }}
                        whileHover={{opacity:0.9,scale:1.03}} 
                        whileTap={{opacity:1,scale:0.98}}
                        className='border border-white/20 text-[#e2e8f0] px-10 py-3 rounded-full hover:bg-white/10 transition-all'
                        >
                            View History

                        </motion.button>

            </div>
            </div>

            <div className='flex flex-col md:flex-row justify-center item-center gap-10 mb-28'>
            {
                [
                    {
                        icon:<BsRobot size={24} />,
                        step:"Step 1",
                        title:"Role and Experience Selection",
                        desc:"AI adjust difficulty based on selected job role."
                    },
                    {
                        icon:<BsMic size={24} />,
                        step:"Step 2",
                        title:"Smart Voice Interview", 
                        desc:"Dynamic follow-up questions based on your answers."
                    },
                    {
                        icon:<BsClock size={24} />,
                        step:"Step 3",
                        title:"Timer Based Evaluation",
                        desc:"Real Interview pressure with time tracking."
                    }
                ].map((item,index) => (
                    <motion.div key={index} 
                        initial={{opacity:0, y:30}} 
                        whileInView={{opacity:1,y:0}} 
                        transition={{duration:0.6+index*0.2}} 
                        whileHover={{rotate:0,scale:1.06}}
                        className={`relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 w-80 max-w-[90%] shadow-lg hover:shadow-2xl transition-all duration-300
                        ${index===0 ? "rotate-[-4deg]":""}
                        ${index===1 ? "rotate-[3deg] md:-mt-6 shadow-xl":""}
                        ${index===2 ? "rotate-[-3deg]":""}
                        `}
                    >

                        <div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-white/20'>{item.icon}</div>
                            <div className='pt-10 text-center'>
                                <div className='text-sm text-[#38bdf8] font-semibold mb-2 tracking-wider'>{item.step}</div>
                                <h3 className='text-lg font-semibold mb-3 text-[#e2e8f0]'>{item.title}</h3>
                                <p className='text-[#94a3b8] text-sm leading-relaxed'>{item.desc}</p>
                            </div>

                    </motion.div>
                ))
            }
            </div> 

            <div className='mb-32'>
                <motion.h2
                initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.6}} 
                className='text-4xl font-semibold text-center mb-16 text-[#e2e8f0]'>
                    Advanced AI{" "}
                    <span className="text-[#6366f1]">Capabilities</span>
                </motion.h2>

                <div className='grid md:grid-cols-2 gap-10'>
                    {
                        [
                            {
                                image:evalImg,
                                icon:<BsBarChart size={20} />,
                                title:"AI Answer Evaluation",
                                desc:"Scores communication, technical accuracy and confidence."
                            },
                            {
                                image:resumeImg,
                                icon:<BsFileEarmarkText size={20} />,
                                title:"Resume Based Interview",
                                desc:"Project-specific questions based on your resume content."
                            },
                            {
                                image:pdfImg,
                                icon:<BsFileEarmarkText size={20} />,
                                title:"Downloaded PDF Report",
                                desc:"Detailed strengths, weaknesses and improvement insights."
                            },
                            {
                                image:analyticsImg,
                                icon:<BsBarChart size={20} />,
                                title:"History and Analytics",
                                desc:"Track progress with performance graphs and topic analysis."
                            }
                        ].map((item,index)=>(
                            <motion.div key={index} 
                            initial={{opacity:0, y:30}} 
                            whileInView={{opacity:1,y:0}} 
                            transition={{duration:0.5,delay:index*0.1}} 
                            whileHover={{scale:1.02}} 
                            className='bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all'>
                                <div className='flex flex-col md:flex-row items-center gap-8'>
                                    <div className='w-full md:w-1/2 flex justify-center'>
                                        <img src={item.image} alt={item.title} className='w-full h-auto object-contain max-h-64' /> 
                                    </div>
                                    <div className='w-full md:w-1/2'>
                                        <div className='bg-[#6366f1]/20 text-[#6366f1] w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-[#6366f1]/30'>
                                            {item.icon}
                                        </div>
                                        <h3 className='text-xl font-semibold mb-3 text-[#e2e8f0]'>{item.title}</h3>
                                        <p className='text-[#94a3b8] text-sm leading-relaxed'>{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    }
                </div>

            </div>

            <div className='mb-32'>
                <motion.h2
                initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.6}} 
                className='text-4xl font-semibold text-center mb-16 text-[#e2e8f0]'>
                    Multiple Interview{" "}
                    <span className="text-[#6366f1]">Modes</span>
                </motion.h2>

                <div className='grid md:grid-cols-2 gap-10'>
                    {
                        [
                            {
                                image:hrImg,
                                title:"Hr Interview Mode",
                                desc:"Behavioral and communication based evalution."
                            },
                            {
                                image:techImg,
                                title:"Technical Mode",
                                desc:"Deepquestioning based on selected role."
                            },
                            {
                                image:confidenceImg,
                                title:"Confidence Detection",
                                desc:"Basic tone and voice analysis insights."
                            },
                            {
                                image:creditImg,
                                title:"Credits System",
                                desc:"Unlock premium interview sessions easily."
                            }

                        ].map((mode,index)=>(
                            <motion.div key={index} 
                            initial={{opacity:0, y:30}} 
                            whileInView={{opacity:1,y:0}} 
                            transition={{duration:0.5,delay:index*0.1}} 
                            whileHover={{y:-6}} 
                            className='bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all'>
                                <div className='flex justify-between items-center gap-6'>
                                    <div className='w-1/2'>
                                       <h3 className='text-xl font-semibold mb-3 text-[#e2e8f0]'>{mode.title}</h3>
                                       <p className='text-[#94a3b8] text-sm leading-relaxed'>{mode.desc}</p>
                                    </div>

                                    <div className='w-1/2 flex justify-end'>
                                       <img src={mode.image} alt={mode.title} className='w-28 h-28 object-contain' />
                                    </div>
                                </div>

                                
                            </motion.div>
                        ))
                    }
                </div>

            </div>

            </div>

        </div>


        {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
        <Footer />
    </div>
  )
}

export default Home