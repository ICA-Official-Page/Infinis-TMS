import express from 'express'
import { createBranch, deleteAdmin, deleteBranch, deleteTicket, getAllAdmins, getBranches, getRequests, makeAdmin, updateBranch, updatePassword } from '../controllers/superAdminController.js';
import { upload, uploadToGridFs } from '../middlewares/uploadToGFS.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const app = express();

app.post('/makeadmin', isAuthenticated, upload.single('profile'), uploadToGridFs, makeAdmin);
app.get('/getadmins', getAllAdmins);
app.get('/getalladminrequests', getRequests);
app.post('/updatepassword', isAuthenticated, updatePassword);
app.post('/createbranch', isAuthenticated, upload.single('profile'), uploadToGridFs, createBranch);
app.get('/branches', getBranches);
app.post('/updatebranch', isAuthenticated, upload.single('profile'), uploadToGridFs, updateBranch);
app.delete('/deletebranch/:id', isAuthenticated, deleteBranch);
app.delete('/deleteadmin/:id', isAuthenticated, deleteAdmin);
app.delete('/deleteticket/:id', isAuthenticated, deleteTicket);

export default app;