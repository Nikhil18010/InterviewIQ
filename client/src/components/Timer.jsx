import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Timer({timeLeft,totalTime}) {
    const safeTotal = Number(totalTime) > 0 ? Number(totalTime) : 1;
    const safeLeft = Number(timeLeft) >= 0 ? Number(timeLeft) : 0;
    const percentage = Math.min(100, Math.max(0, (safeLeft / safeTotal) * 100));
  return (
    <div className='w-20 h-20'>
        <CircularProgressbar value={percentage} text={`${safeLeft}s`} styles={buildStyles({
            textSize:"28px",
            pathColor:"#6366f1",
            textColor:"#e2e8f0",
            trailColor:"#374151"
        })}/>
    </div>
  )
}

export default Timer