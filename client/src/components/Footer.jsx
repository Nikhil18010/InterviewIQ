import React from 'react'
import { BsRobot } from 'react-icons/bs';

function Footer() {
  return (
    <div className='bg-[#0b1120] flex justify-center px-4 pb-10 py-4 pt-10'>
        <div className='w-full max-w-6xl bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] shadow-lg px-3 py-8 text-center'>
            <div className='flex justify-center items-center gap-3 mb-3'>
                <div className='bg-[#6366f1] text-white p-2 rounded-lg'>
                    <BsRobot size={16} />
                </div>
                <h2 className='font-semibold text-[#e2e8f0]'>InterviewIQ</h2>
            </div>
            <p className='text-[#94a3b8] text-sm max-w-xl mx-auto'>
                AI-powered interview preperation platform designed to improve communication skills,technical depth and professional confidence.
            </p>
        </div>
    </div>
  )
}

export default Footer