import mongoose from "mongoose";

const transactionSchema=new mongoose.Schema({
    userId: String,
    planId: String,
    amountPaid: String,
    paymentStatus: {
        type: String,
        enum: ['success','failed','pending']
    },
    razorpayTransactionId: String,
});

const Transaction = new mongoose.model('transaction',transactionSchema);

export default Transaction;