// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { startCronJobs, triggerManualJob } = require("./models/cron/cronJobs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");

  // ⏱️ Start the cron after DB connects
  //startCronJobs();

  // 🌐 Start API server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});
const VERIFY_TOKEN = 'aicelerate_token'; 

// 🔗 Webhook Endpoint (e.g., POST /webhook)
app.get('/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          console.log('Webhook Verified');
          res.status(200).send(challenge);
      } else {
          res.sendStatus(403);
      }
  }
});

// POST route to handle incoming messages and statuses
app.post('/whatsapp/webhook', (req, res) => {
  console.log('Webhook Received: ', JSON.stringify(req.body, null, 2));
  res.sendStatus(200); // Acknowledge receipt to Meta
});
