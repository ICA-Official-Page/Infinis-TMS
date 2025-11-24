import User from "../models/userModel.js";
import UserRequests from "../models/reqModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserEditRequests from "../models/userReqModel.js";
import SuperAdmin from "../models/superAdminModel.js";
import Admin from "../models/adminModel.js";
import Manager from "../models/managerModel.js";
import TeamLeader from "../models/teamLeaderModel.js";
import nodemailer from 'nodemailer';

export const findUserForForgetPass = async (req, res) => {
    try {
        const email = req.params.email;
        // const designation = req.params.designation;
        const existReq = await UserRequests.findOne({ email });
        if (existReq) {
            return res.status(400).json({
                success: false,
                message: 'Already Requested!',
                existReq
            });
        }
        else {
            let user;
            if (!user) {
                user = await SuperAdmin.findOne({ email }).select('-password');
            }
            if (!user) {
                user = await Admin.findOne({ email }).select('-password');
            }
            if (!user) {
                user = await Manager.findOne({ email }).select('-password');
            }
            if (!user) {
                user = await TeamLeader.findOne({ email }).select('-password');
            }
            if (!user) {
                user = await User.findOne({ email }).select('-password');
            }
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'You are not our User!',
                });
            }
            else {
                res.status(200).json({
                    success: true,
                    user
                });
            }
        }
    } catch (error) {
        console.log("while finding email", error);
    }
}

export const reqForUpdatePassword = async (req, res) => {
    try {

        const request = await UserRequests(req.body);
        const saveReq = await request.save();
        res.status(200).json({
            success: true,
            message: 'Request Sent Successfully! 😊'
        })
    } catch (error) {
        console.log("while requesting for password update", error);
    }
}

export const sendMail = async (req, res) => {
    const { email, code } = req.body;
    //set nodemailer transport
    const transtporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });
    //body of mail

    const resetCode = '123456'; // ⬅️ Ye aap dynamic banaoge backend se

const htmlForgotPasswordMail = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset Code</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f2f4f6;
        margin: 0;
        padding: 0;
      }

      .email-container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }

      h2 {
        color: #2c3e50;
      }

      p {
        font-size: 15px;
        color: #333333;
        line-height: 1.6;
      }

      .code-box {
        background-color: #f0f8ff;
        color: #2c3e50;
        font-weight: bold;
        font-size: 22px;
        letter-spacing: 3px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
        border-radius: 6px;
        border-left: 4px solid #3498db;
      }

      .footer {
        margin-top: 30px;
        font-size: 13px;
        color: #777;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <h2>Password Reset Request</h2>

      <p>Hello,</p>

      <p>We received a request to reset your account password. Use the code below to proceed:</p>

      <div class="code-box">${code}</div>

      <p>This code is valid for the next 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>

      <p>Thank you,<br/>The Support Team</p>

      <div class="footer">
        © ${new Date().getFullYear()} ICA. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;


    const mailBody = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: 'Reset Password Request.',
        html: htmlForgotPasswordMail,
    };
    try {
        let info = await transtporter.sendMail(mailBody);
        res.status(200).json({
            success: true,
            message: 'we send a code on your mail! please confirm'
        });
    } catch (error) {
        console.error('error sending mail:' + error);
        res.status(500).send("error sending mail:" + error.message);
    }
};

export const updateForgetPassword = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const admin = await Admin.findOneAndUpdate({ email: req.body.email }, { password: hashedPassword });
        const superAdmin = await SuperAdmin.findOneAndUpdate({ email: req.body.email }, { password: hashedPassword });
        if (admin || superAdmin) {
            return res.status(200).json({
                success: true,
                message: 'Password Updated Succesfully!😊'
            })
        }
    } catch (error) {
        console.log("while updating forget password", error);
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                success: false,
                message: 'something is missing,Please cheack!'
            });
        }
        let user;
        if (!user) {
            user = await SuperAdmin.findOne({ email });
        }
        if (!user) {
            user = await Admin.findOne({ email });
        }
        if (!user) {
            user = await Manager.findOne({ email });
        }
        if (!user) {
            user = await TeamLeader.findOne({ email });
        }
        if (!user) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect Credentials!'
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect Password!'
            });
        }

        const token = jwt.sign({
            userId: user._id
        },
            process.env.SECRET_KEY,
            {
                expiresIn: '10h'
            }
        );
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 10 * 60 * 60 * 1000 }).json({
            success: true,
            message: `Welcome ${user?.name}`,
            user
        });


    } catch (error) {
        console.log("error while Login", error);
    }
}

export const logout = async (req, res) => {
    try {
        return res.cookie('token', "", { maxAge: 0 }).json({
            success: true,
            message: 'Logged out Successfully'
        })
    } catch (error) {
        console.log("error while logout", error);
    }
}

export const verifySuperAdmin = async (req, res) => {
    try {
        const designation = 'superadmin';
        const superadmin = await SuperAdmin.findOne();
        if (superadmin) {
            return res.status(200).json({
                success: true
            })
        }
        else {
            return res.status(400).json({
                success: false
            })
        }
    } catch (error) {
        console.log("while verify super admin", error);
    }
}

export const reqToEditProfile = async (req, res) => {
    try {
        const request = await UserEditRequests(req.body);
        const saveReq = await request.save();
        res.status(200).json({
            success: true,
            message: 'Request Sent Successfully! 😊'
        })
    } catch (error) {
        console.log('while Requesting for edit profile', error);
    }
}

export const fetchUpdateProfileRequests = async (req, res) => {
    try {
        const requests = await UserEditRequests.find();
        if (requests) {
            return res.status(200).json({
                success: true,
                requests
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: `No Requests from Users!`
            });
        }
    } catch (error) {
        console.log('while fetching update profile requests', error);
    }
}

export const updateStatustoProfileUpdateRequest = async (req, res) => {
    try {
        const request = await UserEditRequests.findByIdAndUpdate(req?.body?.requestId, { status: req?.body?.status });
        if (request) {
            return res.status(200).json({
                success: true,
                message: 'Request Accepted'
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Status not changed!'
            });
        }
    } catch (error) {
        console.log('while updating status in user request', error);
    }
}

export const superAdminSignUp = async (req, res) => {
    try {
        const { username, email, password, mobile, branch, address, department, designation } = req.body;
        let imageUrl;
        const Existuser = await SuperAdmin.findOne({ designation: designation });
        if (Existuser) {
            return res.status(400).json({
                success: false,
                message: 'Administrator Already Created!'
            });
        }
        if (req.file) {
            imageUrl = `https://tms.infinis.io/file/${req.file.originalname}`;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const existUsername = await SuperAdmin.findOne({ username });
        const existEmail = await SuperAdmin.findOne({ email });
        const existMobile = await SuperAdmin.findOne({ mobile });
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
        const user = await SuperAdmin({ ...req.body, profile: imageUrl, password: hashedPassword });
        const us = await user.save();
        res.status(200).json({
            success: true,
            message: 'User created Successfully🤗',
            // us
        })
    } catch (error) {
        console.log('while make super admin', error);
    }
}

export const updateUserPassword = async (req, res) => {
    try {
        let user;
        if (!user) {
            user = await User.findById(req.body.id);
        }
        if (!user) {
            user = await TeamLeader.findById(req.body.id);
        }
        if (!user) {
            user = await Manager.findById(req.body.id);
        }
        if (!user) {
            user = await Admin.findById(req.body.id);
        }
        if (!user) {
            user = await SuperAdmin.findById(req.body.id);
        }
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found!'
            })
        }
        else {
            const isPasswordMatch = await bcrypt.compare(req.body.currentPassword, user?.password);
            if (!isPasswordMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Wrong Current Password!'
                })
            }
            else {
                const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
                let updation = false;
                if (user?.designation === 'Executive') {
                    await User.findByIdAndUpdate(req.body.id, { password: hashedPassword });
                    updation = true;
                }
                else if (user?.designation === 'Team Leader') {
                    await TeamLeader.findByIdAndUpdate(req.body.id, { password: hashedPassword });
                    updation = true;
                }
                else if (user?.designation === 'Manager') {
                    await Manager.findByIdAndUpdate(req.body.id, { password: hashedPassword });
                    updation = true;
                }
                else if (user?.designation === 'admin') {
                    await Admin.findByIdAndUpdate(req.body.id, { password: hashedPassword });
                    updation = true;
                }
                else if (user?.designation === 'superadmin') {
                    await SuperAdmin.findByIdAndUpdate(req.body.id, { password: hashedPassword });
                    updation = true;
                }
                if (updation) {
                    return res.status(200).json({
                        success: true,
                        message: 'Your Password Successfully Updated!😊'
                    })
                }
                else {
                    return res.status(400).json({
                        success: true,
                        message: 'No Changes Found!'
                    })
                }
            }
        }
    } catch (error) {
        console.log('while updating user password', error);
    }
}

