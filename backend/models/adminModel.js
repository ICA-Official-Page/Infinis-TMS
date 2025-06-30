import mongoose from "mongoose";


const adminSchema = new mongoose.Schema({
    username: String,
    email: String,
    name: String,
    password: String,
    mobile: Number,
    branches: Array,
    address: String,
    profile: String,
    designation: String,
    postdesignation: String
}, { timestamps: true });

const Admin = new mongoose.model('admin', adminSchema);

export default Admin;