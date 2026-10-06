import React from 'react'
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import Auth from '../pages/Auth';

function AuthModel({onClose}) {
    const {userData} = useSelector((state) => state.user);
    useEffect(() => {
        if(userData){
            onClose();
        }
    }, [userData,onClose]);
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4'>
        <div className='relative w-full max-w-md'>
            <button onClick={onClose} className='absolute top-8 right-5 text-[#94a3b8] hover:text-[#e2e8f0] text-xl transition'>
                <FaTimes size={18}/>
            </button>
            <Auth isModel={true} />


        </div>
    </div>
  )
}

export default AuthModel