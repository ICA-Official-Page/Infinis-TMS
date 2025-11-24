// const { default: mongoose } = require("mongoose");
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: String,
    designation: String,
    branch: String,
    branches: Array,
    dept: String,
    department: Number,
    users: Number,
    tickets: Number,
    passreq: Number,
    userreq: Number,
    profile: Number,
    subscription: Number
});

const Notification = new mongoose.model('notification', notificationSchema);

export default Notification;