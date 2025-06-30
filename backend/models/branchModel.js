import mongoose from "mongoose";


const branchSchema = new mongoose.Schema({
    name: String,
    location: String,
    admin: String,
    departments: Number,
    tickets: Number,
    profile: String //logo
}, { timestamps: true });

const Branch = new mongoose.model('Branch', branchSchema);

export default Branch;