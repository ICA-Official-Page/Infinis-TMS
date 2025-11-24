import Admin from "../models/adminModel.js";
import Manager from "../models/managerModel.js";
import Notification from "../models/notificationModel.js";
import SuperAdmin from "../models/superAdminModel.js";
import TeamLeader from "../models/teamLeaderModel.js";
import User from "../models/userModel.js";

export const fetchNotifications = async (req, res) => {
    try {

        let userObject = await Notification.findOne({ user: req.body.userId });
        let user = await SuperAdmin.findById(req.body.userId);
        if (!user) {
            user = await Admin.findById(req.body.userId);
        }
        if (!user) {
            user = await Manager.findById(req.body.userId);
        }
        if (!user) {
            user = await TeamLeader.findById(req.body.userId);
        }
        if (!user) {
            user = await User.findById(req.body.userId);
        }
        if (!userObject && user) {
            let createNew;
            if (req.body.designation === 'admin') {
                createNew = await Notification({ user: req.body.userId, designation: req.body.designation, branches: req.body.branches });
            }
            else if (req.body.designation === 'superadmin') {
                createNew = await Notification({ user: req.body.userId, designation: req.body.designation });
            }
            else {
                createNew = await Notification({ user: req.body.userId, designation: req.body.designation, branch: req.body.branch, dept: req.body.department });
            }
            await createNew.save();
            return res.status(200).json({
                success: true,
                message: 'Notification object Created!'
            })
        }
        else {
            if (user) {
                if (req.body.designation === 'admin') {
                    if (userObject?.branches.length !== req.body.branches.length) {
                        userObject = await Notification.findByIdAndUpdate(userObject._id,
                            { branches: req.body.branches },
                            { new: true }
                        )
                    }
                }
                return res.status(200).json({
                    success: true,
                    message: 'fetched successfully',
                    userObject
                })
            }
            else {
                return res.status(401).json({
                    message: 'User not authenticated',
                    success: false,
                    notAuthorized: true
                })
            }
        }
    } catch (error) {
        console.log("while fetch notification", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching notification'
        });
    }

}

export const pushNotification = async (req, res) => {
    try {

        const { user, branch, designation, section, department } = req.body;

        let notify = false;

        if (section === 'department') {
            const updateManager = await Notification.updateOne(
                { user: { $ne: user }, branch: branch, designation: 'Manager' },
                {
                    $inc: { department: 1 }
                }
            );
            notify = true;
        }

        else if (section === 'users') {
            if (designation === 'Executive') {
                const updateTL = await Notification.updateOne(
                    { user: { $ne: user }, branch, dept: department },
                    {
                        $inc: { users: 1 }
                    }
                );
            }
            const updateAll = await Notification.updateOne(
                { user: { $ne: user }, branch, designation: 'Manager' }, // filter: user not equal, and exact branch match
                {
                    $inc: {
                        users: 1
                    }
                }
            );
            const updateAdmin = await Notification.updateOne(
                { user: { $ne: user }, branches: branch },
                {
                    $inc: { users: 1 }
                }
            );
            notify = true;
        }

        else if (section === 'tickets') {
            const departmentNames = department.map(d => d.name); // ['IT', 'Finance']

            const updateAll = await Notification.updateMany(
                {
                    user: { $ne: user },
                    branch,
                    dept: { $in: departmentNames }
                },
                {
                    $inc: {
                        tickets: 1
                    }
                }
            );

            const updateManager = await Notification.updateOne(
                { user: { $ne: user }, branch, designation: 'Manager' },
                {
                    $inc: { tickets: 1 }
                }
            );
            const updateAdmin = await Notification.updateOne(
                { user: { $ne: user }, branches: branch },
                {
                    $inc: { tickets: 1 }
                }
            );
            const updateSuperAdmin = await Notification.updateOne(
                { user: { $ne: user }, designation: 'superadmin' },
                {
                    $inc: { tickets: 1 }
                }
            )
            notify = true;
        }

        else if (section === 'passreq') {

            const updateAdmin = await Notification.updateOne(
                { user: { $ne: user }, branches: branch },
                {
                    $inc: { passreq: 1 }
                }
            );
            const updateManager = await Notification.updateOne(
                { user: { $ne: user }, branch: branch, designation: 'Manager' },
                {
                    $inc: { passreq: 1 }
                }
            );

            if (designation === 'Executive') {
                const updateTL = await Notification.updateOne(
                    { user: { $ne: user }, branch: branch, dept: department, designation: 'Team Leader' },
                    {
                        $inc: { passreq: 1 }
                    }
                );
            }



            notify = true;
        }

        else if (section === 'userreq') {
            const updateAdmin = await Notification.updateOne(
                { user: { $ne: user }, branches: branch },
                {
                    $inc: { userreq: 1 }
                }
            );
            const updateManager = await Notification.updateOne(
                { user: { $ne: user }, branch: branch, designation: 'Manager' },
                {
                    $inc: { userreq: 1 }
                }
            );

            if (designation === 'Executive') {
                const updateTL = await Notification.updateOne(
                    { user: { $ne: user }, branch: branch, dept: department, designation: 'Team Leader' },
                    {
                        $inc: { userreq: 1 }
                    }
                );
            }
            notify = true;
        }

        else if (section === 'profile') {

            let findUser;
            if (!findUser) {
                findUser = await User.findOne({ email: user });
            }
            else if (!findUser) {
                findUser = await TeamLeader.findOne({ email: user });
            }
            else if (!findUser) {
                findUser = await Manager.findOne({ email: user });
            }

            const updateAdmin = await Notification.updateOne(
                { user: findUser?._id },
                {
                    $inc: { profile: 1 }
                }
            );
            notify = true;
        }

        else if(section==='subscription'){
            
        }

        if (notify) {
            return res.status(200).json({
                success: true,
                message: 'Notification sent!'
            })
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'Notification not sent!'
            })
        }

    } catch (error) {
        console.log('while push notification', error);
    }
}

export const resolveNotification = async (req, res) => {
    try {
        const { user, section } = req.body;
        let resolve = false;

        if (section === 'department') {
            await Notification.updateOne(
                { user: user },
                { department: 0 }
            )
            resolve = true;
        }

        else if (section === 'users') {
            await Notification.updateOne(
                { user: user },
                { users: 0 }
            )
            resolve = true;
        }

        else if (section === 'tickets') {
            await Notification.updateOne(
                { user: user },
                { tickets: 0 }
            )
            resolve = true;
        }

        else if (section === 'passreq') {
            await Notification.updateOne(
                { user: user },
                { passreq: 0 }
            )
            resolve = true;

        }

        else if (section === 'userreq') {
            await Notification.updateOne(
                { user: user },
                { userreq: 0 }
            )
            resolve = true;
        }

        else if (section === 'profile') {
            await Notification.updateOne(
                { user: user },
                { profile: 0 }
            )
            resolve = true;

        }

        else if (section === 'subscription') {
            await Notification.updateOne(
                { user: user },
                { subscription: 0 }
            )
            resolve = true;

        }

        if (resolve) {
            const notificationObject = await Notification.findOne({ user: user });
            return res.status(200).json({
                success: true,
                notificationObject
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Notification error!'
            });
        }

    } catch (error) {
        console.log('while resolve notification', error);
    }
}