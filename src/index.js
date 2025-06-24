// index.js
require("dotenv").config();
const mongoose = require("mongoose");

const { startCronJobs } = require("./models/cron/cronJobs");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");
  //startCronJobs(); // ⏱️ Start the cron after DB connects
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});
