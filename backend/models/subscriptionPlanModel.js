import mongoose from "mongoose"


const planSchema = new mongoose.Schema({
    branch: String,
    duration: String,
    price: Number,
    Active: Number,
    description: String,
    benifits: String,
},
    { timestamps: true }
);

const SubscriptionPlan=new mongoose.model('subscription-plan',planSchema);

export default SubscriptionPlan;