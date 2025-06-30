import Branch from "../models/branchModel.js";
import Manager from "../models/managerModel.js";
import TeamLeader from "../models/teamLeaderModel.js";
import Tickets from "../models/ticketModel.js";
import nodemailer from 'nodemailer';
import User from "../models/userModel.js";
import TicketSettings from "../models/ticketSetingsModel.js";



export const raiseTicket = async (req, res) => {
    try {
        let imageUrl;
        if (req.file) {
            imageUrl = `https://tms.infinis.io/file/${req.file.originalname}`;
        }

        const parsedDepartment = JSON.parse(req.body.department);

        // STEP 1: Get ticket settings to find the prefix
        const ticketSettings = await TicketSettings.findOne({ adminId: req.body.adminId });
        const prefix = req?.body?.ticketId || 'TICKET'; // fallback

        // STEP 2: Find the count of tickets with this prefix to generate number
        const prefixRegex = new RegExp(`^${prefix}-\\d{3}$`);
        const existingTickets = await Tickets.find({ ticketId: { $regex: prefixRegex } }).sort({ createdAt: -1 });

        let nextNumber = 1;
        if (existingTickets.length > 0 && typeof existingTickets[0]?.ticketId === 'string') {
            const lastTicket = existingTickets[0].ticketId;
            const parts = lastTicket.split('-');
            if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
                const lastNumber = parseInt(parts[1]);
                nextNumber = lastNumber + 1;
            }
        }

        const formattedTicketId = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

        // STEP 3: Save the ticket with generated ticket number
        const data = new Tickets({
            ...req.body,
            department: parsedDepartment,
            file: imageUrl,
            ticketId: formattedTicketId
        });
        const saveddata = await data.save();

        const ticketLength = await Tickets.countDocuments();
        await Branch.findOneAndUpdate({ name: req.body.branch }, { tickets: ticketLength });

        if (saveddata) {
            const deptNames = parsedDepartment.map(dep => dep.name);
            const emails = await TeamLeader.find({
                branch: req.body.branch,
                department: { $in: deptNames }
            });
            const attachedFile = saveddata?.file;

            const executiveUsernames = parsedDepartment.flatMap(dep => dep.users);
            const executiveEmails = await User.find({
                branch: req.body.branch,
                username: { $in: executiveUsernames }
            });

            const manageremail = await Manager.findOne({ branch: req.body.branch });
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.USER_EMAIL,
                    pass: process.env.EMAIL_PASS
                }
            });
            if (manageremail && manageremail !== '') {


                const mailBody = {
                    from: process.env.USER_EMAIL,
                    to: manageremail?.email,
                    subject: 'New Ticket Raised in Your Branch',
                    html: `<p>Ticket ID: ${formattedTicketId} <br>
                    Name: ${saveddata?.name} <br>
                    Subject: ${saveddata?.subject} <br>
                    Mobile: ${saveddata?.mobile} <br>
                    Category: ${saveddata?.category} <br>
                    Priority: ${saveddata?.priority} <br>
                    T.A.T. : ${saveddata?.tat} <br>
                    Raised By : ${saveddata?.issuedby} <br>
                    ${saveddata.department.map(dept =>
                        `${dept?.name} : ${dept?.description} <br>`).join('')}
                    ${attachedFile ? `Attachment: <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a>` : ''}
                </p>`
                };
                await transporter.sendMail(mailBody);
            }

            if (emails?.length > 0) {
                await Promise.all(emails.map(async (curElem) => {
                    const mailBody = {
                        from: process.env.USER_EMAIL,
                        to: curElem.email,
                        subject: 'New Ticket Raised in Your Department',
                        html: `<p>
                        Ticket ID: ${formattedTicketId} <br>
                        Name: ${saveddata?.name} <br>
                        Subject: ${saveddata?.subject} <br>
                        Mobile: ${saveddata?.mobile} <br>
                        Category: ${saveddata?.category} <br>
                        Priority: ${saveddata?.priority} <br>
                        T.A.T. : ${saveddata?.tat} <br>
                        Raised By : ${saveddata?.issuedby} <br>
                        Description: ${saveddata?.department?.find(dept => dept?.name === curElem?.department)?.description || 'N/A'}
                        ${attachedFile ? `Attachment: <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a>` : ''}
                    </p>`,
                    };
                    await transporter.sendMail(mailBody);
                }));
            }


            if (executiveEmails?.length > 0) {
                await Promise.all(executiveEmails.map(async (curElem) => {
                    const mailBody = {
                        from: process.env.USER_EMAIL,
                        to: curElem.email,
                        subject: 'New Ticket Raised in Your Department',
                        html: `<p>
                        Ticket ID: ${formattedTicketId} <br>
                        Name: ${saveddata?.name} <br>
                        Subject: ${saveddata?.subject} <br>
                        Mobile: ${saveddata?.mobile} <br>
                        Category: ${saveddata?.category} <br>
                        Priority: ${saveddata?.priority} <br>
                        T.A.T. : ${saveddata?.tat} <br>
                        Raised By : ${saveddata?.issuedby} <br>
                        Description: ${saveddata?.department?.find(dept => dept?.name === curElem?.department)?.description || 'N/A'}
                        ${attachedFile ? `Attachment: <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a>` : ''}
                    </p>`,
                    };
                    await transporter.sendMail(mailBody);
                }));
            }


            return res.status(200).json({
                success: true,
                message: 'Ticket Raised Successfully! 😊',
                ticketNumber: formattedTicketId
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Error occurred while saving ticket! 🙏'
            });
        }
    } catch (error) {
        console.log("while raising a ticket", error);
        res?.status(500).json({
            success: false,
            message: `Error While Raising a Ticket. Contact Admin.`
        });
    }
};

export const getAllTickets = async (req, res) => {
    try {
        const data = await Tickets.find();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.log('While geting all tickets', error);
    }
}

export const updateTicketStatus = async (req, res) => {
    try {
        const { ticketId, status } = req.body;
        const updated = await Tickets.findByIdAndUpdate(ticketId, { status: status });
        const ticket = await Tickets.findById(ticketId);
        let executive = await User.findOne({ username: ticket?.issuedby });
        if (!executive) {
            executive = await TeamLeader.findOne({ username: ticket?.issuedby });
        }
        if (!executive) {
            executive = await Manager.findOne({ username: ticket?.issuedby });
        }
        if (status === 'resolved') {
            //set nodemailer transport
            const transtporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.USER_EMAIL,
                    pass: process.env.EMAIL_PASS
                }
            });
            if (executive && executive.email !== '') {
                const mailBody = {
                    from: process.env.USER_EMAIL,
                    // to: ticket.email,
                    to: executive.email,
                    subject: 'Your Ticket is Resolved',
                    html: `<p>Name: ${ticket?.name} <br>
                Subject: ${ticket?.subject} <br>
                Mobile: ${ticket?.mobile} <br> 
                Category: ${ticket?.category} <br> 
                Priority: ${ticket?.priority} <br>
                ${ticket.department.map(dept =>
                        `${dept?.name} : ${dept?.description} <br>
                    ${dept?.users?.map(user =>
                            `${user} <br>`
                        )}
                    `
                    )}
                Actions on Ticket: <br>
                ${ticket?.comments?.map(comment =>
                        `${comment?.content}-${comment?.commenter}-${new Date(comment.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Asia/Kolkata'
                        })
                        } <br>`
                    )}  
                </p>`,
                };
                await transtporter.sendMail(mailBody);
            }
        }
        if (updated) {
            return res.status(200).json({
                success: true,
                message: `Ticket ${status}`
            })
        }
    } catch (error) {
        console.log("while ticket updation", error);
    }
}

export const addCommentOnTicket = async (req, res) => {
    try {
        const { ticketId, comment, commenter } = req.body;
        // console.log(req.body);
        const updated = await Tickets.findByIdAndUpdate(ticketId, {
            $push: { comments: { content: comment, commenter: commenter } }
        },
            { new: true }
        )
        if (updated) {
            return res.status(200).json({
                success: true,
                message: 'Comment Added!'
            })
        } else {
            return res.status(400).json({
                success: false,
                message: 'No Comment Added!'
            })
        }
    } catch (error) {
        console.log("while add comment on ticket", error);
    }
}

export const reAssignTheTicket = async (req, res) => {
    try {
        const ticket = await Tickets.findByIdAndUpdate(req.body.ticketId, { $push: { department: req.body.reAssignto } });
        if (ticket) {
            return res.status(200).json({
                success: true,
                message: `Ticket Assign to ${req.body.reAssignto.name}!`
            })
        }
    } catch (error) {
        console.log('while reassigning ticket', error);
    }
}

export const updatePriority = async (req, res) => {
    try {
        const { id, priority, tat } = req.body;
        const priorityy = await Tickets.findByIdAndUpdate(id, { priority, tat }, { new: true });
        if (priorityy) {
            return res.status(200).json({
                success: true,
                message: 'Priority Successfully Updated!'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Priority not Updated!'
            });
        }
    } catch (error) {
        console.log('while updating priority of ticket', error);
    }
}