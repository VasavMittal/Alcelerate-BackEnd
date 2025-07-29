// integrations/googleCalendarSync.js

const { google } = require('googleapis');
const path = require('path');
const Aicelerate = require('../models/Aicelerate');
const { updateLeadStatusByEmail } = require('../services/hubspotService');
const sendTemplate = require("../services/sendTemplate");
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

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

    const impersonate = process.env.GCAL_IMPERSONATE_USER || undefined;

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
    process.env.GCAL_IMPERSONATE_USER || undefined
  );
}

const authClient = getAuthClient();
const calendar = google.calendar({ version: 'v3', auth: authClient });

/* ------------------------------------------------------------------ */
/* 2️⃣  FETCH EVENTS                                                   */
/* ------------------------------------------------------------------ */
async function fetchCalendarEvents(creatorEmail = null) {
  try {
    if (typeof authClient.authorize === 'function') {
      await authClient.authorize();
    }

    const calendarId = process.env.CALENDAR_ID || 'primary';

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      q: 'Aicelerate',
      showDeleted: false,
      maxResults: 1000,
      singleEvents: true,
      orderBy: 'startTime',
    });

    let events = response.data.items || [];

    // Filter by specific creator email if provided
    if (creatorEmail) {
      events = events.filter(event => 
        event.creator?.email?.toLowerCase() === creatorEmail.toLowerCase()
      );
      console.log(`📧 Filtered to events created by: ${creatorEmail}`);
    }

    if (events.length === 0) {
      console.log('📭 No events found for the specified creator.');
    } else {
      console.log(`📅 Found ${events.length} events by creator: ${creatorEmail || 'any'}`);
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
  const events = await fetchCalendarEvents(process.env.GOOGLE_CALENDAR_OWNER_EMAIL);
  const calendarEmailsSet = new Set();

  /* --------- 1.  Handle every booked event | meeting_booked --------- */
  for (const event of events) {
    // Log creator info for debugging
    console.log(`Event: ${event.summary}, Creator: ${event.creator?.email}`);
    
    const attendees = event.attendees || [];
    console.log(`Event Attendees:`, attendees.map(a => ({
      email: a.email,
      displayName: a.displayName,
      responseStatus: a.responseStatus
    })));
    const guest = attendees.find(a =>
      a.email && a.email !== process.env.GOOGLE_CALENDAR_OWNER_EMAIL && a.email !== 'da@aicelerate.me'
    );
    if (!guest?.email) continue;

    const guestEmail  = guest.email.toLowerCase();
    console.log(`Guest Email: ${guestEmail}`);
    calendarEmailsSet.add(guestEmail);

    const meetingTime = event.start?.dateTime || null;
    const hangoutLink = event.hangoutLink || '';
    const gcalEventId = event.id || '';

    /* Update ONLY if current hubspotStatus ∈ { new_lead, not_booked } */
    const res = await Aicelerate.updateOne(
      {
        email: guestEmail,
        $or: [
          { 'meetingDetails.hubspotStatus': { $in: ['new_lead','not_booked', 'not_booked_final_reminder_sent', 'not_booked_first_reminder_sent'] } },
          {
            'meetingDetails.hubspotStatus': { $in: ['noshow', 'no_show_final_reminder_sent'] },
            'meetingDetails.noShowTime': { $lt: meetingTime }
          }
        ]
      },
      {
        $set: {
          'meetingDetails.meetingBooked': true,
          'meetingDetails.meetingTime': meetingTime,
          'meetingDetails.meetingLink': hangoutLink,
          "meetingDetails.reminder24hrSent": false,
          "meetingDetails.reminder1hrSent": false,
          'meetingDetails.googleCalendarEventId': gcalEventId,
          'meetingDetails.hubspotStatus': 'meeting_booked',
          'meetingDetails.noBookReminderStage': 0,
          'meetingDetails.noBookReminderTime': null
        },
      }
    );

    /* Call HubSpot only if we actually modified a doc */
    if (res.modifiedCount) {
      await updateLeadStatusByEmail(guestEmail, 'meeting_booked');
      const lead = await Aicelerate.findOne(
        { email: guestEmail}                                  
      );
      await sendTemplate.sendMeetingBooked(lead);
    }
  }

  console.log(`✅ Synced ${calendarEmailsSet.size} contacts with calendar.`);

  /* --------- 2.  Flip new_lead ➜ not_booked if still no event -------- */
  const leads = await Aicelerate.find(
    { 'meetingDetails.hubspotStatus': 'new_lead' }, // only new_lead matters
    { email: 1 }                                    // fetch just email field
  );

  for (const { email } of leads) {
    if (!email || calendarEmailsSet.has(email.toLowerCase())) continue;

    const res = await Aicelerate.updateOne(
      { email },
      { $set: { 
        'meetingDetails.hubspotStatus': 'not_booked',
        'meetingDetails.meetingBooked': false,
        'meetingDetails.noBookReminderStage': 0,
        'meetingDetails.noBookReminderTime': new Date()
      } }
    );

    if (res.modifiedCount) {
      await updateLeadStatusByEmail(email, 'not_booked');
      const lead = await Aicelerate.findOne(
        { email: email}                                  
      );
      await sendTemplate.sendBookingReminder(lead);
    }
  }

  console.log('✅ Google Calendar sync complete.');
}

module.exports = { syncGoogleCalendarWithDB };
