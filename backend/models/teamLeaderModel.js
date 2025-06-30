import mongoose from "mongoose";



const teamLeaderSchema = new mongoose.Schema({
    username: String,
    email: String,
    name: String,
    password: String,
    mobile: Number,
    branch: String,
    department: String,
    address: String,
    profile: String,
    designation: String,
    postdesignation: String
}, { timestamps: true });

const TeamLeader = new mongoose.model('teamleader', teamLeaderSchema);

export default TeamLeader;