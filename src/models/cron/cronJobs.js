// cron/cronJobs.js
const cron = require("node-cron");
const { runAutomationTasks } = require("../leadAutomationIndex");
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
    const { Name, WhatsappNumber, Time, Message } = payload;
    if (!Name || !WhatsappNumber || !Time || !Message) {
      throw new Error('Payload is missing one or more required fields.');
    }
    const body = new URLSearchParams({
      Name,
      WhatsappNumber,
      Time,
      Message,
    });
    try {
      const res = await fetch(url, { method: 'POST', body });
  
      // GAS often returns plain text ("OK") so read with .text()
      const text = await res.text();
  
      if (!res.ok) {
        throw new Error(
          `Apps Script responded ${res.status} ${res.statusText}: ${text}`,
        );
      }
  
      console.log('✅ Apps Script response:', text);
    } catch (err) {
      console.error('❌ triggerManualJob failed:', err.message);
      throw err; // re‑throw so upstream code can handle it
    }
  
}

module.exports = { startCronJobs, triggerManualJob };
