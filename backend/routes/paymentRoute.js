import express from 'express';
import { addPlan, getAllPlans, getYourPlan, payMentNow, verifyPayment } from '../controllers/paymentController.js';

const app = express();

app.post('/create-order', payMentNow);
app.post('/verify', verifyPayment);
app.post('/addplan', addPlan);
app.get('/allplans',getAllPlans);
app.get('/yourplans/:branch',getYourPlan);

export default app;