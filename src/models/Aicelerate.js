const mongoose = require("mongoose");

// Meeting sub-schema
const meetingSchema = new mongoose.Schema({
  meetingBooked: { type: Boolean, default: false },
  meetingTime: Date,
  meetingLink: String,
  googleCalendarEventId: String,
  hubspotStatus: {
    type: String,
    enum: ['new_lead', 'meeting_booked', 'show', 'noshow'],
    default: 'new_lead'
  },
  landingPageBook: { type: Boolean, default: false },

  // Reminder flags
  reminder24hrSent: { type: Boolean, default: false },
  reminder1hrSent: { type: Boolean, default: false },

  // Not booked reminder stages
  noBookReminderStage: { type: Number, default: 0 }, // 0 = none, 1 = 24hr, 2 = 48hr, 3 = 72hr
  noBookReminderTime: Date, // when the lead was created

  // No show follow-up tracking
  noShowReminderStage: { type: Number, default: 0 }, // 0 = none, 1 = first reminder, 2 = second
  noShowTime: Date // when 'noshow' was marked
}, { _id: false });

// Customer schema
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  contact: String, // ✅ Added contact number
  meetingDetails: meetingSchema,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Aicelerate", customerSchema);