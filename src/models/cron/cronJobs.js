// cron/cronJobs.js
const cron = require("node-cron");
const { runAutomationTasks, runGoogleSheetsAutomationTask } = require("../leadAutomationIndex");
require('dotenv').config();

const url = process.env.GOOGLE_SHEET_URL;
const GS_URL = process.env.GOOGLE_SHEET_FORM_URL;
const HS_PORTAL = process.env.HUBSPOT_PORTAL;
const HS_FORM = process.env.HUBSPOT_FORM;

function startCronJobs() {
  cron.schedule("*/3 * * * *", async () => {
    console.log("[CRON] Running scheduled lead automation task...");
    await runAutomationTasks();
    await runGoogleSheetsAutomationTask();
  });

  console.log("✅ Cron job scheduled: Every 3 minute");
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

async function triggerFormJob(data) {
  console.log("[GOOGLE SHEETJOB] ▶️  starting:", JSON.stringify(data));

  if(data.url == null){
    data.url = " ";
  }
  // ---------- 1. Google Sheet ----------
  const gsParams = new URLSearchParams({
    "Date and Time"               : data.formatted,
    "Full Name"                   : data.combineName,
    "WhatsApp Number"             : data.whatsappNumber,
    "Email ID"                    : data.email,
    "Business Name"               : data.businessName,
    "Annual Revenue"              : data.annualRevenue,
    "Convenient Time to Connect"  : data.connectTime,
    "Url"                         : data.url,
    "Lp name"                     : data.lpName,
  });

  try {
    const gsRes = await fetch(GS_URL, {
      method : "POST",
      body   : gsParams,
    });
    const gsText = await gsRes.text();
    console.log("[JOB] ✅ Google Sheet:", JSON.stringify({ status: gsRes.status, body: gsText, data: gsParams }));
  } catch (err) {
    console.error("[JOB] ❌ Google Sheet:", err.message);
  }

  // ---------- 2. HubSpot ----------
  const hsPayload = {
    fields: [
      { name: "firstname",           value: data.fullName },
      { name: "lastname",            value: data.lastName },
      { name: "hs_timezone",         value: data.timeZone },
      { name: "email",               value: data.email },
      { name: "hs_whatsapp_phone_number", value: data.whatsappNumber },
      { name: "0-2/name",            value: data.businessName },
      { name: "annualrevenue",       value: data.annualRevenue },
      { name: "connect_time__c",     value: data.connectTime },
      { name: "landing_page_url",    value: data.url },
      { name: "lp_name",             value: data.lpName },
      { name: "submission_time",     value: data.formatted },
      { name: "relationship_status", value: "new_lead" },
    ],
    context: {
      hutk     : data.hutk,                 // pass from client if you need it
      pageUri  : data.url,
      pageName : data.pageTitle,
    },
  };

  try {
    console.log("[HUBSPOTJOB] ▶️  starting:", JSON.stringify(hsPayload));
    const hsRes = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HS_PORTAL}/${HS_FORM}`,
      {
        method      : "POST",
        headers     : { "Content-Type": "application/json" },
        body        : JSON.stringify(hsPayload),
      },
    );
    const hsJson = await hsRes.json();
    console.log("[JOB] ✅ HubSpot:", JSON.stringify({ status: hsRes.status, body: hsJson, data: hsPayload }));
  } catch (err) {
    console.error("[JOB] ❌ HubSpot:", err.message);
  }

  console.log("[JOB] ▶️  finished");
}

module.exports = { startCronJobs, triggerManualJob, triggerFormJob };
