// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { startCronJobs, triggerManualJob, triggerFormJob } = require("./models/cron/cronJobs");

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // ⏱️ Start the cron after DB connects
    startCronJobs();

    // 🌐 Start API server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
const VERIFY_TOKEN = "aicelerate_token";

app.get("/health", (req, res) => {
  console.log("health check");
  res.status(200).send("OK");
});

// Logging Endpoint to receive form data and store it in a .txt file
app.post("/log-form-data", (req, res) => {
  const formData = req.body;
  const timestamp = new Date().toISOString();

  console.log("[LOG] New form submission:", JSON.stringify({ timestamp, formData }));

  triggerFormJob(formData).catch(err => console.error("[LOG] triggerFormJob error:", err.message));

  res.status(200).send("Form submission logged successfully.");
});

// 🔗 Webhook Endpoint (e.g., POST /webhook)
app.get("/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook Verified");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// POST route to handle incoming messages and statuses
app.post("/whatsapp/webhook", (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const contact = value?.contacts?.[0];
    const message = value?.messages?.[0];

    if (!contact || !message) {
      return res.status(400).send("Missing contact or message");
    }

    const Name = contact.profile?.name || "Unknown";
    const WhatsappNumber = contact.wa_id || "";
    const Time = new Date(parseInt(message.timestamp) * 1000).toLocaleString(); // Convert UNIX to readable
    const Message = message.text?.body || "No message";

    const payload = {
      Name: Name,
      WhatsappNumber: WhatsappNumber,
      Time: Time,
      Message: Message,
    };
    triggerManualJob(payload);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error in webhook handler:", err.message);
    res.sendStatus(500);
  }
});
