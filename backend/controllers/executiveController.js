import Branch from "../models/branchModel.js";
import Manager from "../models/managerModel.js";
import TeamLeader from "../models/teamLeaderModel.js";
import Tickets from "../models/ticketModel.js";
import nodemailer from 'nodemailer';
import User from "../models/userModel.js";
import TicketSettings from "../models/ticketSetingsModel.js";
import cron from 'node-cron';

export const raiseTicket = async (req, res) => {
  try {
    let imageUrl;
    if (req.file) {
      imageUrl = `${process.env.BACKEND_URI}/file/${req.file.originalname}`;
    }
    const branchlogo = await Branch.findOne({ name: req.body.branch });

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

        const htmlContentofMail = `<html>
  <head>
    <meta charset="UTF-8" />
    <title>New Ticket Raised</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        padding: 0;
        margin: 0;
      }

      .email-wrapper {
        max-width: 700px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        padding: 30px;
      }

      .logo-container {
        text-align: center;
        margin-bottom: 20px;
      }

      .logo-container img {
        max-width: 160px;
        height: auto;
      }

      h2 {
        color: #2c3e50;
        margin-bottom: 20px;
        text-align: center;
      }

      .ticket-info p {
        margin: 8px 0;
        color: #333333;
        line-height: 1.5;
      }

      .department-info {
        background-color: #f0f8ff;
        padding: 10px 15px;
        border-left: 4px solid #007bff;
        margin-top: 15px;
        border-radius: 4px;
      }

      .attachment {
        margin-top: 20px;
      }

      .footer {
        margin-top: 30px;
        font-size: 13px;
        color: #777;
        text-align: center;
      }

      a {
        color: #007bff;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">

      <!-- 🏥 Logo Section -->
      <div class="logo-container">
        <img src="${branchlogo?.profile}" alt="Hospital Logo" />
      </div>

      <h2>New Ticket Raised in Your Branch</h2>

      <div class="ticket-info">
        <p><strong>Ticket ID:</strong> ${formattedTicketId}</p>
        <p><strong>Name:</strong> ${saveddata?.name}</p>
        <p><strong>Subject:</strong> ${saveddata?.subject}</p>
        <p><strong>Mobile:</strong> ${saveddata?.mobile}</p>
        <p><strong>Category:</strong> ${saveddata?.category}</p>
        <p><strong>Priority:</strong> ${saveddata?.priority}</p>
        <p><strong>T.A.T.:</strong> ${saveddata?.tat}</p>
        <p><strong>Raised By:</strong> ${saveddata?.issuedby}</p>
      </div>

      ${saveddata.department.map(dept => `
        <div class="department-info">
          <p><strong>${dept.name}</strong>: ${dept.description}</p>
        </div>
      `).join('')}

      ${attachedFile ? `
        <div class="attachment">
          <p><strong>Attachment:</strong> <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a></p>
        </div>
      ` : ''}

      <div class="footer">© ${new Date().getFullYear()} ICA. All rights reserved.</div>

    </div>
  </body>
</html>`;


        const mailBody = {
          from: process.env.USER_EMAIL,
          to: manageremail?.email,
          subject: 'New Ticket Raised in Your Branch',
          html: htmlContentofMail,
          //     `<p>Ticket ID: ${formattedTicketId} <br>
          //     Name: ${saveddata?.name} <br>
          //     Subject: ${saveddata?.subject} <br>
          //     Mobile: ${saveddata?.mobile} <br>
          //     Category: ${saveddata?.category} <br>
          //     Priority: ${saveddata?.priority} <br>
          //     T.A.T. : ${saveddata?.tat} <br>
          //     Raised By : ${saveddata?.issuedby} <br>
          //     ${saveddata.department.map(dept =>
          //         `${dept?.name} : ${dept?.description} <br>`).join('')}
          //     ${attachedFile ? `Attachment: <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a>` : ''}
          // </p>`
        };
        await transporter.sendMail(mailBody);
      }

      if (emails?.length > 0) {


        await Promise.all(emails.map(async (curElem) => {
          const htmlContentofMail = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>New Ticket Raised</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 20px;
      }

      .email-wrapper {
        background-color: #ffffff;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }

      .logo-container {
        text-align: center;
        margin-bottom: 20px;
      }

      .logo-container img {
        max-width: 160px;
        height: auto;
      }

      h2 {
        color: #2c3e50;
        margin-bottom: 20px;
        text-align: center;
      }

      p {
        font-size: 15px;
        color: #333333;
        line-height: 1.6;
      }

      a {
        color: #007bff;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
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
    <div class="email-wrapper">

      <!-- Logo -->
      <div class="logo-container">
        <img src="${branchlogo?.profile}" alt="Hospital Logo" />
      </div>

      <h2>New Ticket Raised in Your Department</h2>
      <p>
        Ticket ID: ${formattedTicketId} <br>
        Name: ${saveddata?.name} <br>
        Subject: ${saveddata?.subject} <br>
        Mobile: ${saveddata?.mobile} <br>
        Category: ${saveddata?.category} <br>
        Priority: ${saveddata?.priority} <br>
        T.A.T.: ${saveddata?.tat} <br>
        Raised By: ${saveddata?.issuedby} <br>
        Description: ${saveddata?.department?.find(
            dept => dept?.name === curElem?.department
          )?.description || 'N/A'
            } <br>
        ${attachedFile
              ? `Attachment: <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a>`
              : ''
            }
      </p>

      <div class="footer">
        © ${new Date().getFullYear()} ICA. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;

          const mailBody = {
            from: process.env.USER_EMAIL,
            to: curElem.email,
            subject: 'New Ticket Raised in Your Department',
            html: htmlContentofMail,
            //     `<p>
            //     Ticket ID: ${formattedTicketId} <br>
            //     Name: ${saveddata?.name} <br>
            //     Subject: ${saveddata?.subject} <br>
            //     Mobile: ${saveddata?.mobile} <br>
            //     Category: ${saveddata?.category} <br>
            //     Priority: ${saveddata?.priority} <br>
            //     T.A.T. : ${saveddata?.tat} <br>
            //     Raised By : ${saveddata?.issuedby} <br>
            //     Description: ${saveddata?.department?.find(dept => dept?.name === curElem?.department)?.description || 'N/A'}
            //     ${attachedFile ? `Attachment: <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a>` : ''}
            // </p>`,
          };
          await transporter.sendMail(mailBody);
        }));
      }


      if (executiveEmails?.length > 0) {

        await Promise.all(executiveEmails.map(async (curElem) => {
          const htmlContentofMail = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>New Ticket Raised</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 20px;
      }

      .email-wrapper {
        background-color: #ffffff;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }

      .logo-container {
        text-align: center;
        margin-bottom: 20px;
      }

      .logo-container img {
        max-width: 160px;
        height: auto;
      }

      h2 {
        color: #2c3e50;
        margin-bottom: 20px;
        text-align: center;
      }

      p {
        font-size: 15px;
        color: #333333;
        line-height: 1.6;
      }

      a {
        color: #007bff;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
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
    <div class="email-wrapper">

      <!-- ✅ Logo Top Center -->
      <div class="logo-container">
        <img src="${branchlogo?.profile}" alt="Hospital Logo" />
      </div>

      <h2>New Ticket Raised in Your Department</h2>
      <p>
        Ticket ID: ${formattedTicketId} <br>
        Name: ${saveddata?.name} <br>
        Subject: ${saveddata?.subject} <br>
        Mobile: ${saveddata?.mobile} <br>
        Category: ${saveddata?.category} <br>
        Priority: ${saveddata?.priority} <br>
        T.A.T.: ${saveddata?.tat} <br>
        Raised By: ${saveddata?.issuedby} <br>
        Description: ${saveddata?.department?.find(
            dept => dept?.name === curElem?.department
          )?.description || 'N/A'} <br>
        ${attachedFile
              ? `Attachment: <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a>`
              : ''
            }
      </p>

      <div class="footer">
        © ${new Date().getFullYear()} ICA. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;

          const mailBody = {
            from: process.env.USER_EMAIL,
            to: curElem.email,
            subject: 'New Ticket Raised in Your Department',
            html: htmlContentofMail,
            //     `<p>
            //     Ticket ID: ${formattedTicketId} <br>
            //     Name: ${saveddata?.name} <br>
            //     Subject: ${saveddata?.subject} <br>
            //     Mobile: ${saveddata?.mobile} <br>
            //     Category: ${saveddata?.category} <br>
            //     Priority: ${saveddata?.priority} <br>
            //     T.A.T. : ${saveddata?.tat} <br>
            //     Raised By : ${saveddata?.issuedby} <br>
            //     Description: ${saveddata?.department?.find(dept => dept?.name === curElem?.department)?.description || 'N/A'}
            //     ${attachedFile ? `Attachment: <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a>` : ''}
            // </p>`,
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
    const issuedByRaw = ticket?.issuedby || ''; // example: "Ganesh - HR (Executive)"
    const username = issuedByRaw.split(' ')[0].trim(); // Result: "Ganesh"
    let executive = await User.findOne({ username });
    if (!executive) {
      executive = await TeamLeader.findOne({ username });
    }
    if (!executive) {
      executive = await Manager.findOne({ username });
    }
    const branchlogo = await Branch.findOne({ name: ticket.branch });
    const htmlContentofMail = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Ticket Resolved</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }

      .email-wrapper {
        max-width: 700px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }

      .logo-container {
        text-align: center;
        margin-bottom: 20px;
      }

      .logo-container img {
        max-width: 160px;
        height: auto;
      }

      h2 {
        color: #27ae60;
        margin-bottom: 20px;
        text-align: center;
      }

      .info p, .actions p {
        margin: 8px 0;
        color: #333333;
        line-height: 1.6;
      }

      .department-box {
        margin-top: 10px;
        background-color: #f9f9f9;
        border-left: 4px solid #2980b9;
        padding: 10px;
        border-radius: 5px;
      }

      .comment-box {
        margin-top: 10px;
        background-color: #eef7ed;
        border-left: 4px solid #27ae60;
        padding: 10px;
        border-radius: 5px;
      }

      .footer {
        margin-top: 30px;
        font-size: 13px;
        color: #777;
        text-align: center;
      }

      .label {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">

      <!-- ✅ Logo Added Here -->
      <div class="logo-container">
        <img src="${branchlogo?.profile}" alt="Organization Logo" />
      </div>

      <h2>🎉 Your Ticket Has Been Resolved</h2>

      <div class="info">
        <p><span class="label">Name:</span> ${ticket?.name}</p>
        <p><span class="label">Subject:</span> ${ticket?.subject}</p>
        <p><span class="label">Mobile:</span> ${ticket?.mobile}</p>
        <p><span class="label">Category:</span> ${ticket?.category}</p>
        <p><span class="label">Priority:</span> ${ticket?.priority}</p>
      </div>

      ${ticket.department?.map(dept => `
        <div class="department-box">
          <p><span class="label">Department:</span> ${dept?.name}</p>
          <p><span class="label">Description:</span> ${dept?.description}</p>
          ${dept?.users?.length
        ? `<p><span class="label">Users:</span><br> ${dept.users.map(user => `${user}`).join('<br>')}</p>`
        : ''
      }
        </div>
      `).join('')}

      <div class="actions">
        <p><strong>Actions on Ticket:</strong></p>
        ${ticket?.comments?.map(comment => `
          <div class="comment-box">
            <p>${comment?.content}</p>
            <p><strong>By:</strong> ${comment?.commenter}</p>
            <p><strong>At:</strong> ${new Date(comment.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      })}</p>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} Your Company Name. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;

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
          html: htmlContentofMail,
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
      const teamleader = await TeamLeader.findOne({ department: req.body.reAssignto.name, branch: ticket?.branch });
      const branchlogo = await Branch.findOne({ name: ticket.branch });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.EMAIL_PASS
        }
      });
      const reassignedMailHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Ticket Re-Assignment</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        padding: 0;
        margin: 0;
      }

      .email-wrapper {
        max-width: 700px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        padding: 30px;
      }

      .logo {
        text-align: center;
        margin-bottom: 20px;
      }

      .logo img {
        max-width: 180px;
      }

      h2 {
        color: #e67e22;
        margin-bottom: 20px;
        text-align: center;
      }

      .ticket-info p {
        margin: 8px 0;
        color: #333333;
        line-height: 1.6;
      }

      .reassign-info {
        background-color: #fff3e0;
        padding: 12px 18px;
        border-left: 4px solid #e67e22;
        border-radius: 4px;
        margin-top: 20px;
      }

      .footer {
        margin-top: 30px;
        font-size: 13px;
        color: #777;
        text-align: center;
      }

      .label {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">

      <!-- Logo -->
      <div class="logo">
        <img src="${branchlogo?.profile}" alt="S. R. Kalla Memorial Hospital Logo" />
      </div>

      <h2>Ticket Has Been Reassigned</h2>

      <div class="ticket-info">
        <p><span class="label">Ticket ID:</span> ${req.body.ticketId}</p>
        <p><span class="label">Subject:</span> ${ticket?.subject}</p>
        <p><span class="label">Category:</span> ${ticket?.category}</p>
        <p><span class="label">Priority:</span> ${ticket?.priority}</p>
        <p><span class="label">Raised By:</span> ${ticket?.issuedby}</p>
        <p><span class="label">T.A.T.:</span> ${ticket?.tat}</p>
      </div>

      <div class="reassign-info">
        <p>This ticket has been <strong>reassigned</strong> to:</p>
        <p><span class="label">New Assignee:</span> ${req.body.reAssignto.name} Department</p>
        ${req.body.presentDept
          ? `<p><span class="label">Reassigned By:</span> ${req.body.presentDept}</p>`
          : ''
        }
        <p><span class="label">Date:</span> ${new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata'
        })}</p>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} ICA. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;


      if (teamleader) {
        const mailBody = {
          from: process.env.USER_EMAIL,
          to: teamleader.email,
          subject: 'New Ticket Raised in Your Department',
          html: reassignedMailHtml,

        };
        await transporter.sendMail(mailBody);
      }

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

export const sendTatOverMail = async (ticket) => {
  try {
    const branchlogo = await Branch.findOne({ name: ticket.branch });

    const deptNames = ticket.department.map(dep => dep.name);
    const executiveUsernames = ticket.department.flatMap(dep => dep.users);

    const manageremail = await Manager.findOne({ branch: ticket.branch });
    const teamleaders = await TeamLeader.find({
      branch: ticket.branch,
      department: { $in: deptNames }
    });
    const executives = await User.find({
      branch: ticket.branch,
      username: { $in: executiveUsernames }
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });

    const attachedFile = ticket?.file;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Ticket T.A.T. Expired</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f6f8;
              margin: 0;
              padding: 20px;
            }
            .wrapper {
              max-width: 700px;
              margin: auto;
              background: #fff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .logo-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo-container img {
              max-width: 150px;
              height: auto;
            }
            h2 {
              color: #c0392b;
              text-align: center;
            }
            .info p {
              margin: 8px 0;
              color: #333;
            }
            .footer {
              text-align: center;
              color: #777;
              margin-top: 30px;
              font-size: 13px;
            }
            a {
              color: #007bff;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            .department-info {
              background-color: #f0f8ff;
              padding: 10px 15px;
              border-left: 4px solid #007bff;
              margin-top: 15px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="logo-container">
              <img src="${branchlogo?.profile}" alt="Branch Logo" />
            </div>
            <h2>⚠️ Ticket T.A.T. Expired</h2>
            <div class="info">
              <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
              <p><strong>Name:</strong> ${ticket?.name}</p>
              <p><strong>Subject:</strong> ${ticket.subject}</p>
              <p><strong>Mobile:</strong> ${ticket?.mobile}</p>
              <p><strong>Category:</strong> ${ticket.category}</p>
              <p><strong>Priority:</strong> ${ticket.priority}</p>
              <p><strong>T.A.T.:</strong> ${ticket.tat}</p>
              <p><strong>Raised By:</strong> ${ticket.issuedby}</p>
              <p><strong>Expired On:</strong> ${new Date().toLocaleString('en-IN')}</p>
            </div>
            ${ticket.department.map(dept => `
              <div class="department-info">
                <p><strong>${dept.name}</strong>: ${dept.description}</p>
              </div>
            `).join('')}

            ${attachedFile ? `
              <div class="info">
                <p><strong>Attachment:</strong> <a href="${attachedFile}" target="_blank" rel="noopener noreferrer">View Attached File</a></p>
              </div>
            ` : ''}

            <div class="footer">© ${new Date().getFullYear()} ICA. All rights reserved.</div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.USER_EMAIL,
      subject: `⏰ Ticket TAT Expired - ${ticket.subject}`,
      html: htmlContent
    };

    // 💌 Manager Mail
    if (manageremail?.email) {
      await transporter.sendMail({
        ...mailOptions,
        to: manageremail.email
      });
    }

    // 💌 Team Leaders Mail
    if (teamleaders?.length > 0) {
      await Promise.all(teamleaders.map(tl =>
        transporter.sendMail({ ...mailOptions, to: tl.email })
      ));
    }

    // 💌 Executives Mail
    if (executives?.length > 0) {
      await Promise.all(executives.map(exe =>
        transporter.sendMail({ ...mailOptions, to: exe.email })
      ));
    }

    // ✅ Update lastTatMailSent after sending
    await Tickets.findByIdAndUpdate(ticket._id, {
      lastTatMailSent: new Date()
    });

    console.log('✅ TAT Over Mail sent to all relevant recipients:', ticket.ticketId);
  } catch (err) {
    console.error('❌ Error in TAT Mail:', err.message);
  }
};


function getTatDeadline(createdAt, tatString) {
  const value = parseInt(tatString);
  if (isNaN(value)) return new Date(createdAt); // fallback

  const lowerTat = tatString.toLowerCase();

  let multiplier;

  if (lowerTat.includes('minute')) {
    multiplier = 60 * 1000;
  } else if (lowerTat.includes('hour')) {
    multiplier = 60 * 60 * 1000;
  } else if (lowerTat.includes('day')) {
    multiplier = 24 * 60 * 60 * 1000;
  } else if (lowerTat.includes('week')) {
    multiplier = 7 * 24 * 60 * 60 * 1000;
  } else {
    multiplier = 60 * 1000; // default to minute
  }

  return new Date(new Date(createdAt).getTime() + value * multiplier);
}

export const startTatCron = () => {
  cron.schedule('0 * * * *', async () => {
    // console.log('⏳ Running TAT Scheduler...');

    try {
      const now = new Date();

      const tickets = await Tickets.find({
        status: { $nin: ['Resolved', 'Closed'] },
        tat: { $exists: true, $ne: '' },
      });

      for (const ticket of tickets) {
        const deadline = getTatDeadline(ticket.createdAt, ticket.tat);

        // Ignore if deadline is not yet over
        if (deadline > now) continue;

        // Ignore if last mail sent within 24 hours
        const lastSent = ticket.lastTatMailSent || new Date(0);
        const hoursSinceLastMail = (now - lastSent) / (1000 * 60 * 60);

        if (hoursSinceLastMail >= 24) {
          const branchlogo = await Branch.findOne({ name: ticket.branch });

          await sendTatOverMail(ticket, branchlogo);

          await Tickets.findByIdAndUpdate(ticket._id, {
            lastTatMailSent: now,
          });

          // console.log(`📧 Mail sent for ticket ${ticket.ticketId}`);
        }
      }
    } catch (err) {
      console.error('❌ Error in TAT cron job:', err.message);
    }
  });

  // console.log('✅ TAT Cron Scheduler started (runs every 1 hour)');
};