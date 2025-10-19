/**
 * ⏰ IMPORTANT: ALL TIMESTAMPS ARE IN UTC FORMAT
 *
 * Format: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
 * Example: 2024-12-25T14:30:00.000Z
 *
 * The 'Z' at the end indicates UTC (Coordinated Universal Time)
 * This ensures no time zone conflicts when deployed to any server
 *
 * Columns in Google Sheet:
 * - Column A: Full Name (index 0)
 * - Column B: Email (index 1)
 * - Column C: Status (index 2)
 * - Column D: WhatsApp Contact No (index 3)
 * - Column E: Meeting Booked Time (UTC) (index 4)
 * - Column F: Reconnect Message Time (UTC) (index 5)
 * - Column G: No Show Time (UTC) (index 6)
 */

const { google } = require('googleapis');
const calendarSync = require('./googleCalenderSync');
require('dotenv').config();

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const RANGE = process.env.GOOGLE_SHEET_RANGE || "Sheet1!A1:G";

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/* ------------------------------------------------------------------ */
/* 1️⃣  AUTHENTICATION – SERVICE ACCOUNT                               */
/* ------------------------------------------------------------------ */
function getAuthClient() {
  /*** 1) Prefer GOOGLE_KEY_FILE if present ********************************/
  if (process.env.GOOGLE_KEY_FILE) {
    let key;
    try {
      // .env stores one long JSON string → parse it to an object
      key = JSON.parse(process.env.GOOGLE_KEY_FILE);
    } catch (err) {
      throw new Error('GOOGLE_KEY_FILE env var is not valid JSON');
    }

    const impersonate = process.env.GSHEET_IMPERSONATE_USER || undefined;

    // ---- A. With impersonation (domain‑wide delegation) ----
    if (impersonate) {
      return new google.auth.JWT(
        key.client_email,            // service‑account email
        null,                        // keyFile, not needed
        key.private_key,             // raw private key
        SCOPES,
        impersonate                  // subject / user to act on behalf of
      );
    }

    // ---- B. Normal service‑account use ----
    return new google.auth.GoogleAuth({
      credentials: key,             // JSON parsed above
      scopes: SCOPES,
    });
  }

  /*** 2) Fallback: legacy env vars GOOGLE_PRIVATE_KEY / GOOGLE_CLIENT_EMAIL */
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  return new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    privateKey,
    SCOPES,
    process.env.GSHEET_IMPERSONATE_USER || undefined
  );
}

const authClient = getAuthClient();
const sheets = google.sheets({ version: "v4", auth: authClient });

/* ------------------------------------------------------------------ */
/* 2️⃣  FETCH GOOGLE SHEET DATA                                        */
/* ------------------------------------------------------------------ */
async function fetchGoogleSheetData() {
  try {
    console.log("[GOOGLE-SHEET] ▶️  Starting Google Sheet data fetch...");

    // Check if required environment variables are set
    if (!SPREADSHEET_ID) {
      console.warn("[GOOGLE-SHEET] ⚠️  GOOGLE_SPREADSHEET_ID not configured, skipping");
      return [];
    }

    // Authorize if needed
    if (typeof authClient.authorize === 'function') {
      await authClient.authorize();
    }

    // 1️⃣ Fetch existing rows from Google Sheet
    console.log("[GOOGLE-SHEET] 📥 Fetching data from Google Sheet...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("[GOOGLE-SHEET] ℹ️  No data found in sheet");
      return [];
    }

    console.log(`[GOOGLE-SHEET] 📊 Found ${rows.length} rows`);
    console.log("[GOOGLE-SHEET] ✅ Data fetched successfully");

    return rows;

  } catch (error) {
    console.error("[GOOGLE-SHEET] ❌ Error fetching data:", error.response?.data || error.message);
    console.error("[GOOGLE-SHEET] ❌ Full error:", error);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* 3️⃣  HANDLE GOOGLE SHEET REMINDERS & TRIGGERS                       */
/* ------------------------------------------------------------------ */

const sendTemplate = require("../services/sendTemplate");

async function extractCalendarEmailsWithDetails() {
  try {
    const calendarEvents = await calendarSync.fetchCalendarEvents();
    const emailMap = new Map();

    calendarEvents.forEach(event => {
      const attendees = event.attendees || [];
      attendees.forEach(attendee => {
        if (attendee.email) {
          const email = attendee.email.toLowerCase();

          // Convert meeting time to UTC format
          let meetingTimeUTC = null;
          if (event.start?.dateTime) {
            // Convert to UTC ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
            const meetingDate = new Date(event.start.dateTime);
            meetingTimeUTC = meetingDate.toISOString();
            console.log(`[GOOGLE-SHEET] 🕐 Meeting Time Conversion: ${event.start.dateTime} → ${meetingTimeUTC}`);
          }

          emailMap.set(email, {
            meetingTime: meetingTimeUTC,
            meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || '',
          });
        }
      });
    });

    return emailMap;
  } catch (error) {
    console.error("[GOOGLE-SHEET] ❌ Error extracting calendar emails:", error.message);
    return new Map();
  }
}

function buildGoogleSheetPayload(sheetRow) {
  return {
    first_name: sheetRow[0] || "",
    email: sheetRow[1] || "",
    status: sheetRow[2] || "",
    whatsappContact: sheetRow[3] || "",
    meetingTime: sheetRow[4] || "",
    reconnectTime: sheetRow[5] || "",
    noShowTime: sheetRow[6] || "",
  };
}

/**
 * Get current UTC timestamp in ISO format
 * Format: YYYY-MM-DDTHH:mm:ss.sssZ (UTC)
 * Example: 2024-12-25T14:30:00.000Z
 */
function getCurrentUTCTimestamp() {
  return new Date().toISOString();
}

async function checkAndUpdateStatus(sheetData, emailMap) {
  const updatedRows = JSON.parse(JSON.stringify(sheetData)); // Deep copy
  const now = new Date(); // Current time in UTC

  for (let index = 1; index < updatedRows.length; index++) {
    const row = updatedRows[index];
    const email = row[1]?.toLowerCase();
    const status = row[2];

    if (!email) continue;

    const calendarData = emailMap.get(email);

    // ========== PHASE 1: Initial Check (Status = 'new' or empty) ==========
    if (!status || status === 'new' || status === '') {
      if (calendarData) {
        console.log(`[GOOGLE-SHEET] ✅ PHASE 1: Email ${email} found in calendar - Status → meeting_booked`);
        row[2] = 'meeting_booked';
        row[4] = calendarData.meetingTime;
      } else {
        console.log(`[GOOGLE-SHEET] ⏰ PHASE 1: Email ${email} NOT in calendar - Status → reconnect_SMS_message_1`);
        row[2] = 'reconnect_SMS_message_1';
        row[5] = getCurrentUTCTimestamp(); // UTC timestamp: YYYY-MM-DDTHH:mm:ss.sssZ
        await sendTemplate.sendGoogleSheetReconnectReminder1(row);
      }
      continue;
    }

    // ========== PHASE 2: Reconnect SMS Message 1 ==========
    if (status === 'reconnect_SMS_message_1') {
        const reconnectTime = new Date(row[5]);
        const timeUntilMeeting =  now - reconnectTime;
        const oneHour = 60 * 60 * 1000;
        const twentyFiveHours = 25 * oneHour;
      if (calendarData) {
        console.log(`[GOOGLE-SHEET] ✅ PHASE 2: Email ${email} found in calendar - Status → meeting_booked`);
        row[2] = 'meeting_booked';
        row[4] = calendarData.meetingTime;
        row[5] = ''; // Clear reconnect time
      } else if(timeUntilMeeting >= twentyFiveHours){
        console.log(`[GOOGLE-SHEET] ⏰ PHASE 2: Email ${email} NOT in calendar - Status → reconnect_SMS_message_2`);
        row[2] = 'reconnect_SMS_message_2';
        await sendTemplate.sendGoogleSheetReconnectReminder2(row);
      }
      continue;
    }

    // ========== PHASE 3: Reconnect SMS Message 2 ==========
    if (status === 'reconnect_SMS_message_2') {
      if (calendarData) {
        console.log(`[GOOGLE-SHEET] ✅ PHASE 3: Email ${email} found in calendar - Status → meeting_booked`);
        row[2] = 'meeting_booked';
        row[4] = calendarData.meetingTime;
        row[5] = ''; // Clear reconnect time
      } else {
        console.log(`[GOOGLE-SHEET] ⏳ PHASE 3: Email ${email} still not in calendar - No action`);
      }
      continue;
    }

    // ========== PHASE 4: Meeting Booked Reminders ==========
    // Check for both 'meeting_booked' and '24hour_message_sent' statuses
    if ((status === 'meeting_booked' || status === 'meeting_booked_reminder_24hour_message_sent') && row[4]) {
      const meetingTime = new Date(row[4]);
      const timeUntilMeeting = meetingTime - now;
      console.log(`[GOOGLE-SHEET] 🕒 PHASE 4: Email ${email} - Time until meeting: ${timeUntilMeeting} ms`);
      const oneHour = 60 * 60 * 1000;
      const twentyFiveHours = 25 * oneHour;

      // 24-Hour Reminder (only if status is 'meeting_booked')
      if (status === 'meeting_booked' && timeUntilMeeting <= twentyFiveHours && timeUntilMeeting > oneHour) {
        console.log(`[GOOGLE-SHEET] 📧 PHASE 4 (24hr): Email ${email} - Sending 24-hour reminder`);
        row[2] = 'meeting_booked_reminder_24hour_message_sent';
        await sendTemplate.sendGoogleSheetMeetingBookedReminder1(row, calendarData.meetingLink);
      }
      // 1-Hour Reminder (check both statuses to ensure it runs after 24hr reminder)
      else if (timeUntilMeeting <= oneHour && timeUntilMeeting > 0) {
        console.log(`[GOOGLE-SHEET] 📧 PHASE 4 (1hr): Email ${email} - Sending 1-hour reminder`);
        row[2] = 'meeting_booked_reminder_1hour_message_sent';
        await sendTemplate.sendGoogleSheetMeetingBookedReminder2(row, calendarData.meetingLink);
      }
      continue;
    }

    // ========== PHASE 5: No-Show Handling ==========
    if (status === 'noshow') {
      // Check if email found in calendar (recovery)
      if (calendarData) {
        console.log(`[GOOGLE-SHEET] ✅ PHASE 5 (Recovery): Email ${email} found in calendar - Status → meeting_booked`);
        row[2] = 'meeting_booked';
        row[4] = calendarData.meetingTime;
        row[6] = ''; // Clear no show time
      } else if (!row[6]) {
        // First detection of no-show
        console.log(`[GOOGLE-SHEET] 🚨 PHASE 5 (Detection): Email ${email} - No Show Time set`);
        row[6] = getCurrentUTCTimestamp(); // UTC timestamp: YYYY-MM-DDTHH:mm:ss.sssZ
      } else {
        // Check if 24 hours have passed
        const noShowTime = new Date(row[6]);
        const timeSinceNoShow = now - noShowTime;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (timeSinceNoShow >= twentyFourHours) {
          console.log(`[GOOGLE-SHEET] 🚨 PHASE 5 (24hr): Email ${email} - Sending no-show reminder`);
          row[2] = 'no_show_final_reminder_sent';
          await sendTemplate.sendGoogleSheetNoShowReminder(row);
        }
      }
      continue;
    }
  }

  return updatedRows;
}

async function updateGoogleSheetRows(updatedRows) {
  try {
    console.log("[GOOGLE-SHEET] 📤 Updating Google Sheet with all changes...");
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: { values: updatedRows },
    });
    console.log("[GOOGLE-SHEET] ✅ Google Sheet updated successfully");
  } catch (error) {
    console.error("[GOOGLE-SHEET] ❌ Error updating sheet:", error.response?.data || error.message);
  }
}

async function handleGoogleSheetReminders() {
  try {
    console.log("[GOOGLE-SHEET] ▶️  Starting Google Sheet reminders & triggers...");

    // Step 1: Fetch all data from Google Sheet
    const sheetData = await fetchGoogleSheetData();
    if (sheetData.length === 0) {
      console.log("[GOOGLE-SHEET] ℹ️  No sheet data to process");
      return;
    }

    // Step 2: Extract calendar emails with details
    const emailMap = await extractCalendarEmailsWithDetails();
    console.log(`[GOOGLE-SHEET] 📅 Found ${emailMap.size} unique emails in calendar events`);

    // Step 3: Check and update status for all rows
    const updatedRows = await checkAndUpdateStatus(sheetData, emailMap);

    // Step 4: Update Google Sheet with all changes (batch update)
    await updateGoogleSheetRows(updatedRows);

    console.log("[GOOGLE-SHEET] ✅ All reminders & triggers completed");
  } catch (error) {
    console.error("[GOOGLE-SHEET] ❌ Error:", error.message);
  }
}

module.exports = { fetchGoogleSheetData, handleGoogleSheetReminders };
