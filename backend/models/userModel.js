import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
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
},{timestamps:true});

const User = new mongoose.model('user', userSchema);

export default User;