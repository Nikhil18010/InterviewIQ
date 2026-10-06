import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from '../App'
import { FaArrowLeft } from 'react-icons/fa';

function InterviewHistory() {
  const[interviews,setInterviews]=useState([]) ;
  const navigate = useNavigate();


  useEffect(() => {
    const getInterviews = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/get-interview", {withCredentials: true});
        setInterviews(result.data);
      } catch (error) {
        console.log(error);
      }
    }
    getInterviews();
  }, []);
  return (
    <div className='min-h-screen bg-[#0b1120] py-10'>
      <div className='w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto'>

        <div className='mb-10 w-full flex items-start gap-4 flex-wrap'>

          <button className='mt-1 p-3 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10'>
            <FaArrowLeft size={24} onClick={() => navigate("/")} className='text-[#94a3b8]'/>
          </button>

          <div>
            <h1 className='text-3xl font-bold flex-nowrap text-[#e2e8f0]'>Interview History</h1>
            <p className='text-[#94a3b8] mt-2'> Track your past interviews and performance reports.</p>
          </div>

        </div>

        {interviews.length===0?
        <div className='bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-lg text-center'>
          <p className='text-[#94a3b8]'>No interviews found.Start your first interview</p>
        </div>
        :
        <div className='grid gap-6'>
          {interviews.map((item,index)=>(
            <div 
            key={index}
            onClick={()=>navigate(`/report/${item._id}`)} 
            className='bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div>
                  <h3 className='text-lg font-semibold text-[#e2e8f0]'>
                    {item.title}
                  </h3>

                  <p className='text-[#94a3b8] text-sm mt-1'>
                    {item.experience} * {item.role}
                  </p>

                  <p className='text-xs text-[#94a3b8]  mt-2'>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                </div>

                {/* score */}
                <div className='flex items-center gap-6'>
                  <div className='text-right'>
                    <p className='text-xl font-bold text-[#38bdf8]'>
                    {item.finalScore || 0}/10
                  </p>
                  <p className='text-xs text-[#94a3b8]'>
                    Overall Score
                  </p>

                  </div>

                  {/* status */}
                <span className= {`px-4 py-1 rounded-full text-xs font-medium ${item.status==="Completed"?"bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30":"bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                  {item.status}
                </span>


                  
                </div>

                
              </div>

            </div>
          ))}
        </div>
        }
      </div>
    </div>
  )
}

export default InterviewHistory