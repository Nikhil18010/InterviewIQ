import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";
import crypto from "crypto";


export const createOrder = async (req, res) => {
    try{
        const {planId,amount,credits} = req.body;
        if (amount == null || credits == null) {
            return res.status(400).json({message:"Invalid plan data"});
        }
        if (!planId) {
            return res.status(400).json({ message: "Plan ID missing" });
        }
        if (Number(amount) <= 0 || Number(credits) <= 0) {
            return res.status(400).json({ message: "Amount and credits must be positive" });
        }

        const options={
            amount:amount*100,
            currency:"INR",
            receipt:`receipt${Date.now()}`
        }

        const order=await razorpay.orders.create(options);
        await Payment.create({
            userId: req.userId,
            planId,
            amount,
            credits,
            razorpayOrderId: order.id,
            status:"created"
        });
        return res.status(200).json(order);

    }catch(err){
        return res.status(500).json({message:`Faied to create razorpay order ${err}`});
    }
}

export const verifyPayment =async (req,res)=>{
    try{
        const {razorpay_payment_id,razorpay_order_id,razorpay_signature}=req.body;
        const body=razorpay_order_id+"|"+razorpay_payment_id;

        const expectedSignature=crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if(expectedSignature!==razorpay_signature){
            return res.status(400).json({message:"Invalid payment signature"});
        }

        const payment=await Payment.findOne({razorpayOrderId:razorpay_order_id});
        if(!payment){
            return res.status(404).json({message:"Payment not found"});
        }
        if(payment.status==="paid"){
            return res.status(400).json({message:"Already processed"});
        }

        payment.status="paid";
        payment.razorpayPaymentId=razorpay_payment_id;
        // Backfill userId for legacy records created without it.
        if (!payment.userId) {
            payment.userId = req.userId;
        }
        await payment.save();

        const userIdToUpdate = payment.userId || req.userId;
        const updatedUser=await User.findByIdAndUpdate(
            userIdToUpdate,
            { $inc: { credits: payment.credits } },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found to add credits" });
        }
        return res.json({
            success:true,
            message:"Payment verified and credits added",
            user:updatedUser
        })

    }catch(err){
        return res.status(500).json({message:`Failed to verify payment ${err}`});
    }
}