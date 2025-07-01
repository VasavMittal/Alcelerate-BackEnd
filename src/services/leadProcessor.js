// services/leadProcessor.js

const Aicelerate = require("../models/Aicelerate");
const sendTemplate = require("./sendTemplate");

async function handleRemindersAndTriggers() {
  const now = new Date();
  const oneHour = 60 * 60 * 1000;
  const twentyFourHours = 24 * oneHour;
  const fortyEightHours = 48 * oneHour;
  const seventyTwoHours = 72 * oneHour;

  // 1. 24hr Meeting Reminder
  const reminder24hr = await Aicelerate.find({
    "meetingDetails.meetingBooked": true,
    "meetingDetails.reminder24hrSent": false,
    "meetingDetails.meetingTime": { $gte: new Date(now - twentyFourHours), $lte: new Date(now + twentyFourHours) }
  });

  for (const lead of reminder24hr) {
    await sendTemplate.sendMeetingReminder24hr(lead);
    await Aicelerate.updateOne({ _id: lead._id }, { $set: { "meetingDetails.reminder24hrSent": true } });
  }

  // 2. 1hr Meeting Reminder
  const reminder1hr = await Aicelerate.find({
    "meetingDetails.meetingBooked": true,
    "meetingDetails.reminder1hrSent": false,
    "meetingDetails.meetingTime": { $gte: new Date(now - oneHour), $lte: new Date(now + oneHour) }
  });

  for (const lead of reminder1hr) {
    await sendTemplate.sendMeetingReminder1hr(lead);
    await Aicelerate.updateOne({ _id: lead._id }, { $set: { "meetingDetails.reminder1hrSent": true } });
  }

  // 3. Not Booked Follow-ups (24/48/72 hrs)
  const stages = [24, 72];
  for (let i = 0; i < stages.length; i++) {
    const hours = stages[i];
    const leads = await Aicelerate.find({
      "meetingDetails.meetingBooked": false,
      "meetingDetails.hubspotStatus": "not_booked",
      "meetingDetails.noBookReminderStage": i,
      "meetingDetails.noBookReminderTime": { $lte: new Date(now - hours * oneHour) }
    });
    for (const lead of leads) {
      await sendTemplate.sendNoBookReminder(lead, i + 1);
      await Aicelerate.updateOne({ _id: lead._id }, { $set: { "meetingDetails.noBookReminderStage": i + 1 } });
    }
  }

  // 4. No-show Reminders (first & second)
  const noShowStages = [2];
  for (let stage of noShowStages) {
    const leads = await Aicelerate.find({
      "meetingDetails.hubspotStatus": "noshow",
      "meetingDetails.noShowReminderStage": stage - 1,
      "meetingDetails.noShowTime": { $lte: new Date(now - twentyFourHours) }
    });
    for (const lead of leads) {
      await sendTemplate.sendNoShowReminder(lead, stage);
      await Aicelerate.updateOne({ _id: lead._id }, { $set: { "meetingDetails.noShowReminderStage": stage } });
    }
  }
}

module.exports = { handleRemindersAndTriggers };
