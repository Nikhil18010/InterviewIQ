import React from 'react'
import { useState } from 'react'
import Step1SetUp from '../components/Step1SetUp.jsx';
import Step2Interview from '../components/Step2Interview.jsx';
import Step3Report from '../components/Step3Report.jsx';


function InterviewPage() {
    const [step,setStep]=useState(1);
    const [interviewData,setInterviewData]=useState(null);
    const [reportData, setReportData] = useState(null);

  return (
    <div className='min-h-screen bg-[#0b1120]'>
        {step===1 && (
            <Step1SetUp onStart={(data)=>{
                setInterviewData(data);
                setStep(2);
            }}/>
        )}
        {step===2 && (
            <Step2Interview interviewData={interviewData} onFinish={(report)=>{
                // ISSUE 3 FIX: Store report data and move to step 3
                console.log("Report received in InterviewPage:", report);
                setReportData(report);
                setStep(3);
            }}/>
        )}
        {step===3 && (
            reportData ? <Step3Report report={reportData}/> : (
                <div className='min-h-screen flex items-center justify-center'>
                    <p className='text-gray-400 text-lg'>Loading report...</p>
                </div>
            )
        )}
    </div>
  )
}

export default InterviewPage