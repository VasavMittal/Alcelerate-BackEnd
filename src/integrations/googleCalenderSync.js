// integrations/googleCalendarSync.js
const { google } = require("googleapis");
const Aicelerate = require("../models/Aicelerate");
require("dotenv").config()

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// You should persist and load tokens securely
auth.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: "v3", auth });

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
