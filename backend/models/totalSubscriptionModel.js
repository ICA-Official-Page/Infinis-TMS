import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    currentperiodstart: Date,
    currentperiodend: Date,
    canceledat: Date,
    adminId: String,
    planId: String,
    status: {
        enum: ["active", "expired"],
        type: String
    },
    lasttransactionId: String,

},
    {
        timestamps: true
    }
);

const TotalSubscription=new mongoose.model('total-subscription',subscriptionSchema);

export default TotalSubscription;