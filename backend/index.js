import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './utills/dbConnect.js';
import superAdminApp from './routes/superAdminRoute.js'
import authApp from './routes/authRoute.js'
import cors from 'cors'
import { getProfilePic } from './middlewares/uploadToGFS.js';
import adminApp from './routes/adminRoute.js';
import executiveApp from './routes/executiveRoute.js';
import notificationApp from './routes/notificationRoute.js';
import path from 'path';
import cookieParser from 'cookie-parser';
// import paymentApp from './routes/paymentRoute.js';
import { startTatCron } from './controllers/executiveController.js';

dotenv.config();

const app = express();

app.use(cors(
    {
        origin: process.env.URI,
        credentials: true
    }
));

app.use(express.json());
app.use(cookieParser());


dbConnect();

startTatCron();

app.use('/superadmin', superAdminApp);

app.use('/auth', authApp);

app.use('/admin', adminApp);

app.use('/executive', executiveApp);

app.use('/notification', notificationApp);

// app.use('/payment', paymentApp);

app.get('/file/:filename', getProfilePic);

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, '/frontend/build')));

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
});


// const __dirname=path.resolve();
// app.use(express.static(path.join(__dirname,'/frontend/build')));
// app.get('*',(req,res)=>{
//     res.sendFile(path.resolve(__dirname,"frontend","build","index.html"));
// });

app.listen(process.env.PORT, '0.0.0.0', () => console.log(`Server successfully runs on port ${process.env.PORT}`))