// integrations/googleCalendarSync.js

const { google } = require('googleapis');
const path = require('path');
const Aicelerate = require('../models/Aicelerate');
const { updateLeadStatusByEmail } = require('../services/hubspotService');
require('dotenv').config();

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
const calendar = google.calendar({ version: 'v3', auth: authClient });

/* ------------------------------------------------------------------ */
/* 2️⃣  FETCH EVENTS                                                   */
/* ------------------------------------------------------------------ */
async function fetchCalendarEvents() {
  try {
    if (typeof authClient.authorize === 'function') {
      await authClient.authorize();
    }

    const calendarId = process.env.CALENDAR_ID || 'primary';

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    if (events.length === 0) {
      console.log('📭 No upcoming events found.');
    } else {
      console.log(`📅 Found ${events.length} upcoming events.`);
    }

    return events;
  } catch (error) {
    console.error('❌ Google Calendar fetch error:', error.response?.data || error.message);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* 3️⃣  SYNC WITH MONGODB & HUBSPOT                                   */
/* ------------------------------------------------------------------ */
async function syncGoogleCalendarWithDB() {
  const events = await fetchCalendarEvents();
  const calendarEmailsSet = new Set();

  for (const event of events) {
    const attendees = event.attendees || [];
    const guest = attendees.find(
      a => a.email && a.email !== process.env.GOOGLE_CALENDAR_OWNER_EMAIL
    );
    if (!guest || !guest.email) continue;

    const guestEmail = guest.email.toLowerCase();
    calendarEmailsSet.add(guestEmail);

    const meetingTime = event.start?.dateTime || null;
    const hangoutLink = event.hangoutLink || '';
    const googleCalendarEventId = event.id || '';

    await Aicelerate.updateOne(
      { email: guestEmail },
      {
        $set: {
          'meetingDetails.meetingBooked': true,
          'meetingDetails.meetingTime': meetingTime,
          'meetingDetails.meetingLink': hangoutLink,
          'meetingDetails.googleCalendarEventId': googleCalendarEventId,
          'meetingDetails.hubspotStatus': 'meeting_booked',
        },
      }
    );

    await updateLeadStatusByEmail(guestEmail, 'meeting_booked');
  }

  console.log(`✅ Synced ${calendarEmailsSet.size} contacts with calendar.`);

  // Now update leads without any event
  const now = new Date();
  const allLeads = await Aicelerate.find({});

  for (const lead of allLeads) {
    const email = lead.email?.toLowerCase();
    if (!email || calendarEmailsSet.has(email)) continue;

    const updates = {
      'meetingDetails.meetingBooked': false,
      'meetingDetails.noBookReminderStage': 0,
      'meetingDetails.noBookReminderTime': now,
      'meetingDetails.hubspotStatus': 'not_booked',
    };

    await Aicelerate.updateOne({ _id: lead._id }, { $set: updates });
    await updateLeadStatusByEmail(email, 'not_booked');
  }

  console.log('✅ Google Calendar sync complete.');
}

module.exports = { syncGoogleCalendarWithDB };
