import React from 'react'
import { useSelector} from 'react-redux';
import { motion } from "framer-motion";
import { BsRobot, BsCoin} from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';

function Navbar() {
    const {userData} = useSelector((state) => state.user);
    const [showCreditPopup, setShowCreditPopup] = useState(false);
    const [showUserPopup, setShowUserPopup] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showAuth, setShowAuth] = useState(false);
    const handleLogout = async() => {
        try {
          await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true });
          dispatch(setUserData(null));
          setShowCreditPopup(false);
          setShowUserPopup(false);
          navigate("/");
        } catch (error) {
          console.error("Logout Error:", error);
        }    
    };
  return (
    <div className='bg-[#0b1120] flex justify-center px-4 pt-6'> 
    <motion.div 
    initial={{opacity:0, y:-40}} animate={{opacity:1,y:0}} transition={{duration:1.05}}
    className='w-full max-w-6xl bg-white/5 backdrop-blur-md border border-white/10 rounded-[20px] shadow-lg px-8 py-4 flex justify-between items-center relative'>
        <div className='flex items-center gap-3 cursor-pointer'>
            <div className='bg-[#6366f1] text-white p-2 rounded-lg'>
                <BsRobot size={18} />
            </div>
            <h1 className='font-semibold hidden md:block text-lg text-[#e2e8f0]'>InterviewIQ</h1>
        </div>

        <div className='flex items-center gap-6 relative'>
            <div className='relative'>
                <button onClick={()=>{
                    if(!userData){
                        setShowAuth(true);
                        return;
                    }
                    setShowCreditPopup(!showCreditPopup);
                    setShowUserPopup(false);
                }} 
                    className='flex items-center gap-2 bg-white/10 text-[#e2e8f0] px-4 py-2 rounded-full text-md hover:bg-white/20 transition-all duration-300'>
                    <BsCoin size={20} />
                    {userData?.credits || 0}
                </button>
                {showCreditPopup && (
                    <div className='absolute right-[-50px] mt-3 w-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-5 z-50'>
                        <p className='text-sm text-[#94a3b8] mb-4'>Need more Credits to continue interviews</p>
                        <button onClick={()=>navigate("/pricing")} className='w-full bg-[#6366f1] text-white py-2 rounded-lg text-sm hover:bg-[#5b5bd6] transition'>Buy More Credits</button>
                    </div>
                )}
             
            </div>

            <div className='relative'>
                <button onClick={()=>{
                    if(!userData){
                        setShowAuth(true);
                        return;
                    }
                    setShowUserPopup(!showUserPopup)
                    setShowCreditPopup(false);
                }} className='w-9 h-9 bg-[#38bdf8] text-white rounded-full flex items-center justify-center font-semibold hover:bg-[#0ea5e9] transition'>
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : <FaUserAstronaut size={16} />}
                </button>
                {showUserPopup && (
                    <div className='absolute right-0 mt-3 w-48 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-4 z-50'>
                        <p className='text-md text-[#38bdf8] font-medium mb-1'>{userData?.name}</p>
                        <button onClick={()=>navigate("/history")} className='w-full text-left text-sm py-2 hover:text-[#e2e8f0] text-[#94a3b8] transition'>Interview History</button>
                        <button onClick={handleLogout} className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-400 hover:text-red-300 transition'><HiOutlineLogout size={16} /> Logout</button>
                    </div>  
                )}

            </div>

        </div>
    </motion.div>

    {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

    </div>
  )
}

export default Navbar