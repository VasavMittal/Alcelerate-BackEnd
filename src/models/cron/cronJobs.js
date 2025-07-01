// cron/cronJobs.js
const cron = require("node-cron");
const { runAutomationTasks } = require("../leadAutomationIndex");
const fetch = require('node-fetch');
require('dotenv').config();

const url = process.env.GOOGLE_SHEET_URL;

function startCronJobs() {
  cron.schedule("* * * * *", async () => {
    console.log("[CRON] Running scheduled lead automation task...");
    await runAutomationTasks();
  });

  console.log("✅ Cron job scheduled: Every 1 minute");
}
async function triggerManualJob(payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("✅ Response:", data);
  
}

module.exports = { startCronJobs, triggerManualJob };
