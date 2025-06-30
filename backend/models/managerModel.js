import mongoose from "mongoose";


const managerSchema = new mongoose.Schema({
    username: String,
    email: String,
    name: String,
    password: String,
    mobile: Number,
    address: String,
    profile: String,
    branch: String,
    designation: String,
    postdesignation: String
}, { timestamps: true });

const Manager = new mongoose.model('manager', managerSchema);

export default Manager;