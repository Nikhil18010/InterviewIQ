import React from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react';
import { useState } from 'react';
import axios from "axios";
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';




function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch=useDispatch();

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      descrption: "Perfect for beginners starting interview preparation",
      features: ["100 AI Interview Credits", "Basic Performance Report", "Voice Interview Access", "Limited History Tracking"],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      descrption: "Great for focused practice and skill improvement",
      features: ["150 AI Interview Credits", "Detailed Feedback", "Performance Analysis", "Full Interview History "],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      descrption: "Best practice for serious job preparation.",
      features: ["650 AI Interview Credits", "Advanced AI Feedback", "Skill Trend Analysis", "Priority AI Processing "],
      badge: "Best Value",
    }
  ]

  const handlePayment=async(plan)=>{
    setLoadingPlan(plan.id);
    try {
      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;
      const result=await axios.post(ServerUrl+"/api/payment/order",{
        planId:plan.id,
        amount:amount,
        credits:plan.credits
      },{withCredentials:true});

      const options={
        key:import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:result.data.amount,
        currency:"INR",
        name:"InterviewIQ",
        description:`${plan.name} - ${plan.credits} Credits`,
        order_id:result.data.id,
        handler:async function(response){
          try {
            const verifypay = await axios.post(
              ServerUrl + "/api/payment/verify",
              response,
              { withCredentials: true }
            );

            if (verifypay.data?.success) {
              dispatch(setUserData(verifypay.data.user));

              // Force refresh user from server so Navbar/Home instantly show updated credits.
              const freshUser = await axios.get(
                ServerUrl + "/api/user/current-user",
                { withCredentials: true }
              );
              dispatch(setUserData(freshUser.data));

              alert(`Payment successful. ${plan.credits} credits added!`);
              navigate("/");
            } else {
              alert("Payment verification failed. Credits not added.");
            }
          } catch (err) {
            console.log(err);
            alert("Payment verification failed. Credits not added.");
          }
        },
        theme: {
          color: "#10b981",
        },
      }

      const rzp=new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        alert("Payment failed or cancelled.");
      });
      rzp.open();
      setLoadingPlan(null);

    } catch (error) {
      console.log(error);
      alert("Unable to start payment. Please try again.");
      setLoadingPlan(null);
    }
  }


  return (
    <div className='min-h-screen bg-[#0b1120] py-16 px-6'>

      <div className='max-w-6xl mx-auto mb-14 flex items-start gap-4'>

        <button
          onClick={() => navigate("/")}
          className='mt-2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10'>
          <FaArrowLeft size={24} className='text-[#94a3b8]' />
        </button>

        <div className='text-center w-full'>
          <h1 className='text-4xl font-bold text-[#e2e8f0]'>
            Choose Your Plan
          </h1>
          <p className='text-[#94a3b8] mt-3 text-lg'>
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>

      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (

              <motion.div
                whileHover={!plan.default && { scale: 1.03 }}
                key={plan.id}
                onClick={() => !plan.default && setSelectedPlan(plan.id)}
                className={`relative rounded-3xl p-8 transition-all duration-300 border ${isSelected ? "border-[#6366f1] shadow-2xl bg-white/5 backdrop-blur-md" : "border-white/10 bg-white/5 backdrop-blur-md shadow-lg"} ${plan.default ? "cursor-default" : "cursor-pointer"}`}>

                {plan.badge && (
                  <div className='absolute top-6 right-6 bg-[#6366f1] text-white text-sm px-4 py-1 rounded-full shadow'>
                    {plan.badge}
                  </div>
                )}

                {plan.default && (
                  <div className='absolute top-6 right-6 bg-gray-700 text-[#94a3b8] text-sm px-3 py-1 rounded-full '>
                    Default
                  </div>
                )}

                <h2 className='text-xl font-semibold text-[#e2e8f0]'>
                  {plan.name}
                </h2>

                <div className='mt-4'>
                  <span className='text-3xl font-bold text-[#38bdf8]'>
                    {plan.price}
                  </span>
                  <p className='text-[#94a3b8] mt-1'>
                    {plan.credits} Credits
                  </p>
                </div>

                <p className='text-[#94a3b8] mt-4 text-sm leading-relaxed'>{plan.descrption}</p>
                <div className='mt-6 space-y-3 text-left'>
                  {plan.features.map((feature,i) => (
                    <div key={i} className='flex items-center gap-3'>
                      <FaCheckCircle className='text-[#6366f1] text-sm' />
                      <span className='text-[#e2e8f0] text-sm'>{feature}</span>
                    </div>
                  ))}

                </div>

                {!plan.default &&
                  <button 
                    disabled={loadingPlan===plan.id}
                    onClick={(e) => {e.stopPropagation();
                      if (!isSelected) {
                        setSelectedPlan(plan.id);
                        return;
                      }
                      handlePayment(plan);
                    }
                    } 
                    className={`w-full mt-8 py-3 rounded-xl font-semibold transition ${isSelected ? "bg-[#6366f1] text-white hover:bg-[#5b5bd6]" : "bg-white/10 text-[#e2e8f0] hover:bg-white/20"}`}>
                    {loadingPlan===plan.id ? "Processing..." :isSelected ? "Proceed to Pay" : "Select Plan"}
                  </button>
                }
              </motion.div>
            )
          }
          )}
      </div>

    </div>
  )
}

export default Pricing