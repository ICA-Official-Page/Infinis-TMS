import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from 'dotenv';
import SubscriptionPlan from "../models/subscriptionPlanModel.js";

dotenv.config();

// 🧠 Razorpay instance
const razorpay =  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,        // Replace with actual key
    key_secret: process.env.RAZORPAY_KEY_SECRET // Keep this secure
});

// 🔸 Create order
export const payMentNow = async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // Razorpay uses paise
            currency: "INR",
            receipt: "receipt#123"
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.log("while Payment", error);
    }
};

// 🔸 Verify Payment
export const verifyPayment = (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac("sha256", "RAZORPAY_KEY_SECRET");
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
        res.json({ status: "success", paymentId: razorpay_payment_id });
    } else {
        res.status(400).json({ status: "failure" });
    }
};

export const addPlan = async (req, res) => {
    try {
        const newPlan = await SubscriptionPlan(req.body);
        const savePlan = await newPlan.save();
        if (savePlan) {
            return res.status(200).json({
                success: true,
                message: "Subscription Plan Added Successfully"
            })
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Plan not Created!"
            })
        }
    } catch (error) {
        console.log('while Adding Plan', error);
    }
}

export const getAllPlans = async (req, res) => {
    try {
        const allPlans = await SubscriptionPlan.find();
        return res.status(200).json({
            success: true,
            message: 'Fetched Successfully',
            allPlans
        });
    } catch (error) {
        console.log("While geting all plans", error);
    }
}

export const getYourPlan = async (req, res) => {
    try {
        const { branch } = req.params;
        const singleBranch = await SubscriptionPlan.find({ branch });
        if(singleBranch){
            return res.status(200).json({
                success: true,
                message: "Feched",
                singleBranch
            })
        }
        else{
            return res.status(400).json({
                success: false,
                message: "Plan not Found!"
            })
        }
    } catch (error) {
        console.log("While getting single plan", error);
    }
} 