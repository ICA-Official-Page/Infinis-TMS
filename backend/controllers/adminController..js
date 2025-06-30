import Admin from "../models/adminModel.js";
import Branch from "../models/branchModel.js";
import Department from "../models/departmentModel.js";
import Manager from "../models/managerModel.js";
import Notification from "../models/notificationModel.js";
import UserRequests from "../models/reqModel.js";
import TeamLeader from "../models/teamLeaderModel.js";
import TicketSettings from "../models/ticketSetingsModel.js";
import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import UserEditRequests from "../models/userReqModel.js";
import SuperAdmin from "../models/superAdminModel.js";
import nodemailer from 'nodemailer';

export const addUser = async (req, res) => {
    try {

        // const { username, email, password, mobile, branch, address, department, designation } = req.body;

        if (!req.body.username || !req.body.email || !req.body.name || !req.body.password || !req.body.mobile || !req.body.address || !req.body.postdesignation) {
            return res.status(400).json({
                success: false,
                message: 'Something is missing,Please cheack!'
            });
        }

        let imageUrl;
        if (req.file) {
            imageUrl = `https://tms.infinis.io/file/${req.file.originalname}`;
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        let existEmail, existMobile, existUsername;
        if (!existEmail || !existMobile || !existUsername) {
            if (!existUsername) {
                existUsername = await User.findOne({ username: req.body.username });
            }
            if (!existEmail) {
                existEmail = await User.findOne({ email: req.body.email });
            }
            if (!existMobile) {
                existMobile = await User.findOne({ mobile: req.body.mobile });
            }
        }
        if (!existEmail || !existMobile || !existUsername) {
            if (!existUsername) {
                existUsername = await Manager.findOne({ username: req.body.username });
            }
            if (!existEmail) {
                existEmail = await Manager.findOne({ email: req.body.email });
            }
            if (!existMobile) {
                existMobile = await Manager.findOne({ mobile: req.body.mobile });
            }
        }
        if (!existEmail || !existMobile || !existUsername) {
            if (!existUsername) {
                existUsername = await TeamLeader.findOne({ username: req.body.username });
            }
            if (!existEmail) {
                existEmail = await TeamLeader.findOne({ email: req.body.email });
            }
            if (!existMobile) {
                existMobile = await TeamLeader.findOne({ mobile: req.body.mobile });
            }
        }

        if (existUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already exist!'
            });
        }
        if (existEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exist!'
            });
        }
        if (existMobile) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate Mobile number!'
            });
        }
        let user;
        if (req.body.designation === 'Executive') {
            user = await User({ ...req.body, profile: imageUrl, password: hashedPassword });
        }
        if (req.body.designation === 'Manager') {
            user = await Manager({ ...req.body, profile: imageUrl, password: hashedPassword });
        }
        if (req.body.designation === 'Team Leader') {
            // console.log(req.body.department);
            user = await TeamLeader({ ...req.body, profile: imageUrl, password: hashedPassword });
            if (req.body.department) {
                await Department.updateOne({ name: req.body.department }, { teamleader: req.body.username });
            }
        }
        const us = await user.save();
        //set nodemailer transport
        const transtporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.EMAIL_PASS
            }
        });
        //body of mail
        const mailBody = {
            from: process.env.USER_EMAIL,
            to: req?.body?.email,
            subject: 'Account Credentials for Infinis Ticketing System.',
            html: `<strong>Email:</strong><span>${req?.body?.email}</span><br>
                    <strong>Password:</strong><span>${req?.body?.password}</span>
                    `,
        };
        let info = await transtporter.sendMail(mailBody);
        return res.status(200).json({
            success: true,
            message: 'User created Successfully🤗',
            // us
        })
    } catch (error) {
        console.log('while make User', error);
    }
}

export const updateUser = async (req, res) => {
    try {
        const userId = req.body.userid;
        let user;
        let userUpdated = false;

        if (req.body.designation === 'Executive') {
            user = await User.findById(userId);
            if (req.body?.username && user?.username !== req?.body?.username) {
                const username = await User.findByIdAndUpdate(userId, { username: req.body.username });
                userUpdated = true;
            }
            if (req.body?.email && user?.email !== req?.body?.email) {
                const username = await User.findByIdAndUpdate(userId, { email: req.body.email });
                userUpdated = true;
            }
            if (req.body?.name && user?.name !== req?.body?.name) {
                const name = await User.findByIdAndUpdate(userId, { name: req.body.name });
                userUpdated = true;
            }
            if (req.body?.password && user?.password !== req?.body?.password) {
                const hashedPassword = await bcrypt.hash(req?.body?.password, 10);
                const password = await User.findByIdAndUpdate(userId, { password: hashedPassword });
                const transtporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.USER_EMAIL,
                        pass: process.env.EMAIL_PASS
                    }
                });
                //body of mail
                const mailBody = {
                    from: process.env.USER_EMAIL,
                    to: req?.body?.email,
                    subject: 'New Account Credentials for Infinis Ticketing System.',
                    html: `<strong>Email:</strong><span>${req?.body?.email}</span><br>
                    <strong>Password:</strong><span>${req?.body?.password}</span>
                    `,
                };
                let info = await transtporter.sendMail(mailBody);
                userUpdated = true;
            }
            if (req.body?.mobile && String(user?.mobile) !== String(req?.body?.mobile)) {
                const mobile = await User.findByIdAndUpdate(userId, { mobile: req.body.mobile });
                userUpdated = true;
            }
            if (req.body?.branch && user?.branch !== req?.body?.branch) {
                const branch = await User.findByIdAndUpdate(userId, { branch: req.body.branch });
                const notifyBranch = await Notification.findOneAndUpdate({ user: userId }, { branch: req.body.branch });
                userUpdated = true;
            }
            if (req.body?.department && user?.department !== req?.body?.department) {
                const department = await User.findByIdAndUpdate(userId, { department: req.body.department });
                const notifyDepartment = await Notification.findOneAndUpdate({ user: userId }, { dept: req.body.department });
                userUpdated = true;
            }
            if (req.body?.address && user?.address !== req?.body?.address) {
                const address = await User.findByIdAndUpdate(userId, { address: req.body.address });
                userUpdated = true;
            }
            if (req.body?.designation && user?.designation !== req?.body?.designation) {
                const designation = await User.findByIdAndUpdate(userId, { designation: req.body.designation });
                userUpdated = true;
            }
            if (req.body?.postdesignation && user?.postdesignation !== req?.body?.postdesignation) {
                const postdesignation = await User.findByIdAndUpdate(userId, { postdesignation: req.body.postdesignation });
                userUpdated = true;
            }
            if (req?.file) {
                const imageUrl = `https://tms.infinis.io/file/${req.file.originalname}`;
                const profile = await User.findByIdAndUpdate(userId, { profile: imageUrl });
                userUpdated = true;
            }
        }

        if (req.body.designation === 'Manager') {
            user = await Manager.findById(userId);
            if (req.body?.username && user?.username !== req?.body?.username) {
                const username = await Manager.findByIdAndUpdate(userId, { username: req.body.username });
                userUpdated = true;
            }
            if (req.body?.email && user?.email !== req?.body?.email) {
                const username = await Manager.findByIdAndUpdate(userId, { email: req.body.email });
                userUpdated = true;
            }
            if (req.body?.name && user?.name !== req?.body?.name) {
                const name = await Manager.findByIdAndUpdate(userId, { name: req.body.name });
                userUpdated = true;
            }
            if (req.body?.password && user?.password !== req?.body?.password) {
                const hashedPassword = await bcrypt.hash(req?.body?.password, 10);
                const password = await Manager.findByIdAndUpdate(userId, { password: hashedPassword });
                const transtporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.USER_EMAIL,
                        pass: process.env.EMAIL_PASS
                    }
                });
                //body of mail
                const mailBody = {
                    from: process.env.USER_EMAIL,
                    to: req?.body?.email,
                    subject: 'New Account Credentials for Infinis Ticketing System.',
                    html: `<strong>Email:</strong><span>${req?.body?.email}</span><br>
                    <strong>Password:</strong><span>${req?.body?.password}</span>
                    `,
                };
                let info = await transtporter.sendMail(mailBody);
                userUpdated = true;
            }
            if (req.body?.mobile && String(user?.mobile) !== String(req?.body?.mobile)) {
                const mobile = await Manager.findByIdAndUpdate(userId, { mobile: req.body.mobile });
                userUpdated = true;
            }
            if (req.body?.branch && user?.branch !== req?.body?.branch) {
                const branch = await Manager.findByIdAndUpdate(userId, { branch: req.body.branch });
                const notifyBranch = await Notification.findOneAndUpdate({ user: userId }, { branch: req.body.branch });
                userUpdated = true;
            }
            if (req.body?.address && user?.address !== req?.body?.address) {
                const address = await Manager.findByIdAndUpdate(userId, { address: req.body.address });
                userUpdated = true;
            }
            if (req.body?.designation && user?.designation !== req?.body?.designation) {
                const designation = await Manager.findByIdAndUpdate(userId, { designation: req.body.designation });
                userUpdated = true;
            }
            if (req.body?.postdesignation && user?.postdesignation !== req?.body?.postdesignation) {
                const postdesignation = await Manager.findByIdAndUpdate(userId, { postdesignation: req.body.postdesignation });
                userUpdated = true;
            }
            if (req?.file) {
                const imageUrl = `https://tms.infinis.io/file/${req.file.originalname}`;
                const profile = await Manager.findByIdAndUpdate(userId, { profile: imageUrl });
                userUpdated = true;
            }
        }

        if (req.body.designation === 'Team Leader') {
            user = await TeamLeader.findById(userId);
            if (req.body?.username && user?.username !== req?.body?.username) {
                await Department.findOneAndUpdate({ teamleader: user?.username }, { teamleader: req.body.username });
                const username = await TeamLeader.findByIdAndUpdate(userId, { username: req.body.username });
                userUpdated = true;
            }
            if (req.body?.email && user?.email !== req?.body?.email) {
                const username = await TeamLeader.findByIdAndUpdate(userId, { email: req.body.email });
                userUpdated = true;
            }
            if (req.body?.name && user?.name !== req?.body?.name) {
                const name = await TeamLeader.findByIdAndUpdate(userId, { name: req.body.name });
                userUpdated = true;
            }
            if (req.body?.password && user?.password !== req?.body?.password) {
                const hashedPassword = await bcrypt.hash(req?.body?.password, 10);
                const password = await TeamLeader.findByIdAndUpdate(userId, { password: hashedPassword });
                const transtporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.USER_EMAIL,
                        pass: process.env.EMAIL_PASS
                    }
                });
                //body of mail
                const mailBody = {
                    from: process.env.USER_EMAIL,
                    to: req?.body?.email,
                    subject: 'New Account Credentials for Infinis Ticketing System.',
                    html: `<strong>Email:</strong><span>${req?.body?.email}</span><br>
                    <strong>Password:</strong><span>${req?.body?.password}</span>
                    `,
                };
                let info = await transtporter.sendMail(mailBody);
                userUpdated = true;
            }
            if (req.body?.mobile && String(user?.mobile) !== String(req?.body?.mobile)) {
                const mobile = await TeamLeader.findByIdAndUpdate(userId, { mobile: req.body.mobile });
                userUpdated = true;
            }
            if (req.body?.branch && user?.branch !== req?.body?.branch) {
                const branch = await TeamLeader.findByIdAndUpdate(userId, { branch: req.body.branch });
                const notifyBranch = await Notification.findOneAndUpdate({ user: userId }, { branch: req.body.branch });
                userUpdated = true;
            }
            if (req.body?.department && user?.department !== req?.body?.department) {
                const department = await TeamLeader.findByIdAndUpdate(userId, { department: req.body.department });
                const notifyDepartment = await Notification.findOneAndUpdate({ user: userId }, { dept: req.body.department });
                userUpdated = true;
            }
            if (req.body?.address && user?.address !== req?.body?.address) {
                const address = await TeamLeader.findByIdAndUpdate(userId, { address: req.body.address });
                userUpdated = true;
            }
            if (req.body?.designation && user?.designation !== req?.body?.designation) {
                const designation = await TeamLeader.findByIdAndUpdate(userId, { designation: req.body.designation });
                userUpdated = true;
            }
            if (req.body?.postdesignation && user?.postdesignation !== req?.body?.postdesignation) {
                const postdesignation = await TeamLeader.findByIdAndUpdate(userId, { postdesignation: req.body.postdesignation });
                userUpdated = true;
            }
            if (req?.file) {
                const imageUrl = `https://tms.infinis.io/file/${req.file.originalname}`;
                const profile = await TeamLeader.findByIdAndUpdate(userId, { profile: imageUrl });
                userUpdated = true;
            }
        }

        if (req.body.designation === 'admin') {
            user = await Admin.findById(userId);
            if (req.body?.username && user?.username !== req?.body?.username) {
                const branch = await Branch.findOneAndUpdate({ admin: user?.username }, { admin: req.body.username });
                const username = await Admin.findByIdAndUpdate(userId, { username: req.body.username });
                userUpdated = true;
            }
            if (req.body?.email && user?.email !== req?.body?.email) {
                const username = await Admin.findByIdAndUpdate(userId, { email: req.body.email });
                userUpdated = true;
            }
            if (req.body?.name && user?.name !== req?.body?.name) {
                const name = await Admin.findByIdAndUpdate(userId, { name: req.body.name });
                userUpdated = true;
            }
            if (req.body?.password && user?.password !== req?.body?.password) {
                const hashedPassword = await bcrypt.hash(req?.body?.password, 10);
                const password = await Admin.findByIdAndUpdate(userId, { password: hashedPassword });
                const transtporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.USER_EMAIL,
                        pass: process.env.EMAIL_PASS
                    }
                });
                //body of mail
                const mailBody = {
                    from: process.env.USER_EMAIL,
                    to: req?.body?.email,
                    subject: 'New Account Credentials for Infinis Ticketing System.',
                    html: `<strong>Email:</strong><span>${req?.body?.email}</span><br>
                    <strong>Password:</strong><span>${req?.body?.password}</span>
                    `,
                };
                let info = await transtporter.sendMail(mailBody);
                userUpdated = true;
            }
            if (req.body?.mobile && String(user?.mobile) !== String(req?.body?.mobile)) {
                const mobile = await Admin.findByIdAndUpdate(userId, { mobile: req.body.mobile });
                userUpdated = true;
            }
            if (req.body?.branches) {
                // Normalize to array
                if (!Array.isArray(req.body.branches)) {
                    req.body.branches = [req.body.branches];
                }

                // Clean comma-separated strings
                req.body.branches = req.body.branches
                    .flatMap(b => b.split(','))
                    .map(b => b.trim())
                    .filter(Boolean);

                // Compare old and new branches deeply
                const isSameBranches = JSON.stringify(user?.branches?.sort()) === JSON.stringify(req.body.branches?.sort());

                if (!isSameBranches && req.body.branches.length > 0) {

                    await TicketSettings.updateOne(
                        { adminId: userId },
                        { branches: req.body.branches }
                    )

                    await Branch.updateMany(
                        { name: { $in: req.body.branches } },
                        { $set: { admin: req.body.username } }
                    );

                    const cleanBranches = req.body.branches;

                    await Admin.findByIdAndUpdate(
                        userId,
                        { $addToSet: { branches: { $each: cleanBranches } } },
                        { new: true }
                    );

                    await Notification.findOneAndUpdate(
                        { user: userId },
                        { $addToSet: { branches: { $each: cleanBranches } } },
                        { new: true }
                    );

                    userUpdated = true;
                }
            }

            if (req.body?.address && user?.address !== req?.body?.address) {
                const address = await Admin.findByIdAndUpdate(userId, { address: req.body.address });
                userUpdated = true;
            }
            if (req.body?.designation && user?.designation !== req?.body?.designation) {
                const designation = await Admin.findByIdAndUpdate(userId, { designation: req.body.designation });
                userUpdated = true;
            }
            if (req.body?.postdesignation && user?.postdesignation !== req?.body?.postdesignation) {
                const postdesignation = await Admin.findByIdAndUpdate(userId, { postdesignation: req.body.postdesignation });
                userUpdated = true;
            }
            if (req?.file) {
                const imageUrl = `https://tms.infinis.io/file/${req.file.originalname}`;
                const profile = await Admin.findByIdAndUpdate(userId, { profile: imageUrl });
                userUpdated = true;
            }
        }
        if (req.body.designation === 'superadmin') {
            user = await SuperAdmin.findById(userId);
            if (req.body?.username && user?.username !== req?.body?.username) {
                const username = await SuperAdmin.findByIdAndUpdate(userId, { username: req.body.username });
                userUpdated = true;
            }
            if (req.body?.email && user?.email !== req?.body?.email) {
                const username = await SuperAdmin.findByIdAndUpdate(userId, { email: req.body.email });
                userUpdated = true;
            }
            if (req.body?.name && user?.name !== req?.body?.name) {
                const name = await SuperAdmin.findByIdAndUpdate(userId, { name: req.body.name });
                userUpdated = true;
            }
            if (req.body?.password && user?.password !== req?.body?.password) {
                const hashedPassword = await bcrypt.hash(req?.body?.password, 10);
                const password = await SuperAdmin.findByIdAndUpdate(userId, { password: hashedPassword });
                userUpdated = true;
            }
            if (req.body?.mobile && String(user?.mobile) !== String(req?.body?.mobile)) {
                const mobile = await SuperAdmin.findByIdAndUpdate(userId, { mobile: req.body.mobile });
                userUpdated = true;
            }


            if (req.body?.address && user?.address !== req?.body?.address) {
                const address = await SuperAdmin.findByIdAndUpdate(userId, { address: req.body.address });
                userUpdated = true;
            }
            if (req.body?.designation && user?.designation !== req?.body?.designation) {
                const designation = await SuperAdmin.findByIdAndUpdate(userId, { designation: req.body.designation });
                userUpdated = true;
            }
            if (req?.file) {
                const imageUrl = `https://tms.infinis.io/file/${req.file.originalname}`;
                const profile = await SuperAdmin.findByIdAndUpdate(userId, { profile: imageUrl });
                userUpdated = true;
            }
        }

        if (userUpdated) {
            return res?.status(200).json({
                success: true,
                message: 'User Successfully Updated 👍'
            })
        }
        else {
            return res?.status(400).json({
                success: false,
                message: 'No Changes in User!'
            })
        }

    } catch (error) {
        console.log("while updating user", error);
    }
}

export const deleteUpdateRequest = async (req, res) => {
    try {
        const id = req.params.id;
        const request = await UserRequests.findByIdAndDelete(id);
        if (request) {
            return res.status(200).json({
                success: true,
                message: 'Request Deleted!'
            });
        }
    } catch (error) {
        console.log("while delete update request", error);
    }
}

export const deleteUserEditRequest = async (req, res) => {
    try {

        const id = req.params.id;
        const request = await UserEditRequests.findByIdAndDelete(id);
        if (request) {
            return res.status(200).json({
                success: true,
                message: 'Request Deleted!'
            });
        }
    } catch (error) {
        console.log("while delete update request", error);
    }
}
export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        let request;

        // Try deleting from User
        request = await User.findByIdAndDelete(id);

        // If not found in User, try TeamLeader
        if (!request) {
            request = await TeamLeader.findByIdAndDelete(id);
            if (request) {
                await Department.updateOne(
                    { teamleader: request.username },
                    { teamleader: '' }
                );
            }
        }

        // If not found in TeamLeader, try Manager
        if (!request) {
            request = await Manager.findByIdAndDelete(id);
        }

        // If not found in Manager, try Admin
        if (!request) {
            request = await Admin.findByIdAndDelete(id);
        }

        if (request) {
            return res.status(200).json({
                success: true,
                message: 'User Deleted!'
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

    } catch (error) {
        console.log("while deleting user", error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}


export const createDepartment = async (req, res) => {
    try {
        const existDept = await Department.findOne({
            name: req.body.name,
            branch: req.body.branch
        });
        if (existDept) {
            return res.status(400).json({
                success: false,
                message: 'Department Already Exist!'
            })
        }
        const department = await Department(req.body);
        const saveDepartment = await department.save();
        if (req.body.teamleader) {
            await TeamLeader.findOneAndUpdate({ username: req.body.teamleader }, { department: req.body.name });
        }
        if (saveDepartment) {
            return res.status(200).json({
                success: true,
                message: 'Department Created Successfully!😊'
            })
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Error Occure'
            })
        }
    } catch (error) {
        console.log("while creating department", error);
    }
}

export const getDepartments = async (req, res) => {
    try {
        const departmentes = await Department.find();
        if (departmentes) {
            return res.status(200).json({
                success: true,
                departmentes
            })
        }
        else {
            return res.status(404).json({
                success: false,
                message: 'No Departmentes Available!'
            })
        }
    } catch (error) {
        console.log(('while geting departmentes for super admin', error));
    }
}

export const deleteDepartment = async (req, res) => {
    try {
        const id = req.params.id;
        const request = await Department.findByIdAndDelete(id);
        const departmentLength = await Department.countDocuments();
        const updateTL = await TeamLeader.updateOne({ department: request.name }, { department: '' });
        const updateBranch = await Branch.findOneAndUpdate({ name: req.body.branch }, { departments: departmentLength });
        if (request) {
            return res.status(200).json({
                success: true,
                message: 'Department Deleted!'
            });
        }
    } catch (error) {
        console.log("while deleting department", error);
    }
}

export const updateDepartment = async (req, res) => {
    try {
        const departmentId = req.body.departmentid;
        const user = await Department.findById(departmentId);
        let userUpdated = false;

        if (req.body?.name && user?.name !== req?.body?.name) {
            const name = await Department.findByIdAndUpdate(departmentId, { name: req.body.name });
            userUpdated = true;
        }
        if (req.body?.description && user?.description !== req?.body?.description) {
            const username = await Department.findByIdAndUpdate(departmentId, { description: req.body.description });
            userUpdated = true;
        }
        if (req.body?.branch && user?.branch !== req?.body?.branch) {
            const branch = await Department.findByIdAndUpdate(departmentId, { branch: req.body.branch });
            userUpdated = true;
        }
        if (req.body?.teamleader && user?.teamleader !== req?.body?.teamleader) {
            const prevdept = await Department.findOneAndUpdate({ teamleader: req.body.teamleader }, { teamleader: '' });
            const teamleader = await Department.findByIdAndUpdate(departmentId, { teamleader: req.body.teamleader });
            const tl = await TeamLeader.findOneAndUpdate({ username: user?.teamleader }, { department: '' })
            const us = await TeamLeader.findOneAndUpdate({ username: req.body.teamleader }, { department: user?.name });
            const notifyDepartment = await Notification.findOneAndUpdate({ user: us._id }, { dept: user?.name });
            userUpdated = true;
        }

        if (userUpdated) {
            return res?.status(200).json({
                success: true,
                message: 'Department Successfully Updated 👍'
            })
        }
        else {
            return res?.status(400).json({
                success: false,
                message: 'No Changes in Department!'
            })
        }

    } catch (error) {
        console.log("while updating user", error);
    }
}

export const getManagers = async (req, res) => {
    try {
        const allBranchesData = await Manager.find().select('-password');
        res.status(200).json({
            success: true,
            allBranchesData
        });
    } catch (error) {
        console.log('While get all admins', error);
    }
}

export const getTeamLeaders = async (req, res) => {
    try {
        const allBranchesData = await TeamLeader.find().select('-password');
        res.status(200).json({
            success: true,
            allBranchesData
        });
    } catch (error) {
        console.log('While get all admins', error);
    }
}

export const getExecutives = async (req, res) => {
    try {
        const allBranchesData = await User.find().select('-password');
        res.status(200).json({
            success: true,
            allBranchesData
        });
    } catch (error) {
        console.log('While get all admins', error);
    }
}

export const addTicketSettings = async (req, res) => {
    try {
        const { categories, priorities, adminId, ticketId } = req.body;
        const findObject = await TicketSettings.findOne({ adminId });
        if (!findObject) {
            if (categories || priorities || ticketId) {
                const data = TicketSettings({ categories: categories || [], priorities: priorities || [], ticketId: ticketId || '', adminId: adminId, branches: req.body.branches });
                const savedData = await data.save();
                if (savedData) {
                    res.status(200).json({
                        success: true,
                        message: 'Ticket Settings Updated!'
                    })
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: 'No Update Found!'
                    })
                }
            }
        }
        else {
            const updateFields = {};
            if (categories) {
                updateFields.categories = [...findObject.categories, categories];
            }
            if (priorities) {
                updateFields.priorities = [...findObject.priorities, priorities];
            }
            if (ticketId) {
                updateFields.ticketId = ticketId;
            }

            if (Object.keys(updateFields).length > 0) {
                await TicketSettings.updateOne({ adminId }, updateFields);
                return res.status(200).json({
                    success: true,
                    message: 'Ticket Settings Updated!'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Nothing to update.'
                });
            }
        }

    } catch (error) {
        console.log('while ticket settings', error);
    }
}

export const getTicketSettings = async (req, res) => {
    try {
        const { branch } = req.params;
        const ticketSettings = await TicketSettings.findOne({ branches: branch });
        return res.status(200).json({
            success: true,
            ticketSettings
        });
    } catch (error) {
        console.log('while geting ticket settings', error);
    }
}

export const updateTicketSettings = async (req, res) => {
    try {
        const { adminId, categories, priorities, branches, ticketId } = req.body;
        const settingData = await TicketSettings.findOne({ adminId });
        let updation = false;
        if (categories) {
            const categoryData = settingData.categories.filter(cat => cat._id === categories._id);
            if (categories?.name && categories?.name !== categoryData?.name) {
                await TicketSettings.updateOne(
                    { adminId, "categories._id": categories._id },
                    { $set: { "categories.$.name": categories.name } }
                ); updation = true;
            }
            if (categories?.description && categories?.description !== categoryData?.description) {
                await TicketSettings.updateOne(
                    { adminId, "categories._id": categories._id },
                    { $set: { "categories.$.description": categories.description } }
                ); updation = true;
            }
        }
        if (priorities) {
            const priorityData = settingData.priorities.filter(cat => cat._id === priorities._id);
            if (priorities?.name && priorities?.name !== priorityData?.name) {
                await TicketSettings.updateOne(
                    { adminId, "priorities._id": priorities._id },
                    { $set: { "priorities.$.name": priorities.name } }
                ); updation = true;
            }
            if (priorities?.color && priorities?.color !== priorityData?.color) {
                await TicketSettings.updateOne(
                    { adminId, "priorities._id": priorities._id },
                    { $set: { "priorities.$.color": priorities.color } }
                ); updation = true;
            }
            if (priorities?.tat && priorities?.tat !== priorityData?.tat) {
                await TicketSettings.updateOne(
                    { adminId, "priorities._id": priorities._id },
                    { $set: { "priorities.$.tat": priorities.tat } }
                ); updation = true;
            }
        }
        if (ticketId) {
            await TicketSettings.updateOne(
                { adminId: adminId },
                { ticketId: ticketId }
            );
            updation = true;
        }
        if (branches && branches !== settingData?.branches) {
            await TicketSettings.updateOne({ adminId }, { branches: branches });
            updation = true;
        }
        if (updation) {
            return res.status(200).json({
                success: true,
                message: 'Ticket Settings Updated Successfully!'
            })
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'No Updates Found!'
            })
        }
    } catch (error) {
        console.log('while update ticket settings', error);
    }
}

export const deleteTicketSettings = async (req, res) => {
    try {
        const { adminId, categories, priorities, ticketId } = req.body;
        const settingData = await TicketSettings.findOne({ adminId });
        if (categories) {
            const deletedCategory = settingData.categories.filter(cat => cat._id.toString() !== categories);
            await TicketSettings.updateOne({ adminId }, { categories: deletedCategory });
            return res.status(200).json({
                success: true,
                message: 'Category Deleted!'
            })
        }
        else if (priorities) {
            const deletedPriority = settingData.priorities.filter(pri => pri._id.toString() !== priorities);
            await TicketSettings.updateOne({ adminId }, { priorities: deletedPriority });
            return res.status(200).json({
                success: true,
                message: 'Priority Deleted!'
            })
        }
        else if (ticketId) {
            await TicketSettings.updateOne(
                { adminId },
                { $unset: { ticketId: 1 } }
            );
            return res.status(200).json({
                success: true,
                message: 'Ticket Id Deleted!'
            })
        }
    } catch (error) {
        console.log('while delete ticket settings', error);
    }
}