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

// 🔗 Webhook Endpoint (e.g., POST /webhook)
app.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;
    console.log("📩 Webhook received:", payload);

    // Example: Trigger a manual cron-like task
    await triggerManualJob(payload); // define this inside cronJobs.js

    res.status(200).json({ message: "Webhook processed successfully." });
  } catch (error) {
    console.error("⚠️ Error in webhook:", error);
    res.status(500).json({ error: "Failed to process webhook." });
  }
});
