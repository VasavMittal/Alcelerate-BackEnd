// Entry point to centralize all automation modules

const cronJobs = require("./cron/cronJobs");
const hubspotSync = require("../integrations/hubspotSync");
const calendarSync = require("../integrations/googleCalenderSync");
const leadProcessor = require("../services/leadProcessor");
const sendTemplate = require("../services/sendTemplate");
const noShowSync = require("../integrations/noShowSync");
const googleSheetSync = require("../integrations/googleSheetSync");

async function runAutomationTasks() {
  try {
    console.log("[Automation] Starting scheduled tasks...");

    // Step 1: Sync with HubSpot (optional pull updates)
    await hubspotSync.syncHubSpotLeadsWithDB();

    // Step 2: Sync with Google Calendar
    await calendarSync.syncGoogleCalendarWithDB();

    // Step 3: Run lead processing
    await leadProcessor.handleRemindersAndTriggers();

    await noShowSync.syncNoShows();

    console.log("[Automation] All tasks completed.");
  } catch (err) {
    console.error("[Automation Error]", err);
  }
}
async function runGoogleSheetsAutomationTask() {
  try {
    console.log("[GOOGLE-SHEETS-AUTOMATION] Starting Google Sheets automation...");

    // Handle all Google Sheet reminders and triggers
    await googleSheetSync.handleGoogleSheetReminders();

    console.log("[GOOGLE-SHEETS-AUTOMATION] All tasks completed.");
  } catch (err) {
    console.error("[GOOGLE-SHEETS-AUTOMATION Error]", err);
  }
}
// Export function for manual or scheduled use
module.exports = { runAutomationTasks, runGoogleSheetsAutomationTask };

// Optional: Uncomment to run directly when this file is executed
// runAutomationTasks();