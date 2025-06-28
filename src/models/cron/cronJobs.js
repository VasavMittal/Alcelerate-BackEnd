// cron/cronJobs.js
const cron = require("node-cron");
const { runAutomationTasks } = require("../leadAutomationIndex");

function startCronJobs() {
  cron.schedule("* * * * *", async () => {
    console.log("[CRON] Running scheduled lead automation task...");
    await runAutomationTasks();
  });

  console.log("✅ Cron job scheduled: Every 1 minute");
}
async function triggerManualJob(payload) {
  // This gets triggered via webhook
  console.log("🚨 Manual job triggered with:", payload);

  // Do your DB logic / processing here
}

module.exports = { startCronJobs, triggerManualJob };
