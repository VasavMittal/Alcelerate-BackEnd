// integrations/googleCalendarSync.js
const { google } = require("googleapis");
const Aicelerate = require("../models/Aicelerate");
require("dotenv").config()

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

/* ------------------------------------------------------------------ */
/* 1️⃣  AUTHENTICATION – SERVICE ACCOUNT                               */
/* ------------------------------------------------------------------ */
function getAuthClient() {
  if (process.env.GOOGLE_KEY_FILE) {
    const keyPath = process.env.GOOGLE_KEY_FILE;
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: SCOPES,
    });
    return auth;
  }

  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    privateKey,
    SCOPES,
    process.env.GCAL_IMPERSONATE_USER || undefined
  );
  return jwtClient;
}

const authClient = getAuthClient();
console.log(authClient);
const calendar = google.calendar({ version: 'v3', auth: authClient });

async function fetchCalendarEvents() {
  try {
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime"
    });

    return res.data.items || [];
  } catch (error) {
    console.error("Google Calendar fetch error:", error.message);
    return [];
  }
}

async function syncGoogleCalendarWithDB() {
  const events = await fetchCalendarEvents();

  for (const event of events) {
    const attendees = event.attendees || [];
    const guest = attendees.find(a => a.email !== process.env.GOOGLE_CALENDAR_OWNER_EMAIL);

    if (!guest) continue;

    await Aicelerate.updateOne(
      { email: guest.email },
      {
        $set: {
          "meetingDetails.meetingBooked": true,
          "meetingDetails.meetingTime": event.start?.dateTime,
          "meetingDetails.meetingLink": event.hangoutLink || "",
          "meetingDetails.googleCalendarEventId": event.id,
          "meetingDetails.hubspotStatus": "meeting_booked"
        }
      }
    );
  }

  console.log(`✅ Google Calendar sync complete: ${events.length} events processed.`);
}

module.exports = {
  syncGoogleCalendarWithDB
};
