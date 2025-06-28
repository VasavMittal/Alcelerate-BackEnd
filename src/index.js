// index.js
require("dotenv").config();
const mongoose = require("mongoose");

const { startCronJobs, triggerManualJob } = require("./models/cron/cronJobs");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");
  startCronJobs(); // ⏱️ Start the cron after DB connects
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

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
