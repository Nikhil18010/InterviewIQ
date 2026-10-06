import React from 'react'
import axios from "axios";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
function Auth({isModel=false}) {
    const dispatch = useDispatch();
    const handleGoogleSignIn =  async() => {
        try {
            const response=await signInWithPopup(auth, provider);
            let User=response.user;
            let name=User.displayName;
            let email=User.email;
            const result=await axios.post(ServerUrl+"/api/auth/google",{name,email},{withCredentials:true});
            dispatch(setUserData(result.data));
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            dispatch(setUserData(null));
        }
    }
  return (
    <div className={`w-full ${isModel? "py-4":"min-h-screen bg-[#0b1120] flex items-center justify-center px-6 py-20"}`}>
        <motion.div 
         initial={{opacity:0, y:-40}} 
         animate={{opacity:1,y:0}} 
         transition={{duration:1.05}} 
         className={`
         w-full 
         ${isModel? "max-w-md p-8 rounded-3xl":"max-w-lg p-12 rounded-[32px]"} bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl`}>
            <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='bg-[#6366f1] text-white p-2 rounded-lg'>
                    <BsRobot size={18} />
                </div>
                <h2 className='text-lg font-semibold text-[#e2e8f0]'>InterviewIQ</h2>
            </div>

            <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4 text-[#e2e8f0]'>
                Continue with{" "}
                <span className='bg-[#6366f1]/20 text-[#6366f1] px-3 py-1 rounded-full inline-flex items-center gap-2 border border-[#6366f1]/30'>
                    <IoSparkles size={16} />
                    AI Smart Interview
                </span>
            </h1>

            <p className='text-center text-[#94a3b8] text-sm md:text-base leading-relaxed mb-8'>
                Sign in to start AI-powered mock interviews, track your progress and unlock detailed performance insights.
            </p>

            <motion.button onClick={handleGoogleSignIn}
            whileHover={{opacity:0.9,scale:1.03}} whileTap={{opacity:1,scale:0.98}} className='w-full flex items-center justify-center gap-3 py-3 bg-[#6366f1] text-white rounded-full shadow-lg hover:bg-[#5b5bd6] transition'>
                <FcGoogle size={20} />
                Sign in with Google
            </motion.button>
            
        </motion.div>
    </div>
  )
}

export default Auth