// services/leadProcessor.js

const Aicelerate = require("../models/Aicelerate");
const sendTemplate = require("./sendTemplate");
const { updateLeadStatusByEmail } = require('./hubspotService');

async function handleRemindersAndTriggers() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const twentyFourHours = 24 * oneHour;
  const twentyFiveHours = 25 * oneHour;
  const fortyEightHours = 48 * oneHour;
  const seventyTwoHours = 72 * oneHour;

  // 1. 24hr Meeting Reminder
  const reminder24hr = await Aicelerate.find({
    "meetingDetails.meetingBooked": true,
    "meetingDetails.reminder24hrSent": false,
    "meetingDetails.meetingTime": {$lt: new Date(now + twentyFiveHours) }
  });

  for (const lead of reminder24hr) {
    await sendTemplate.sendMeetingReminder24hr(lead);
    await Aicelerate.updateOne({ _id: lead._id }, { $set: { "meetingDetails.reminder24hrSent": true } });
  }

  // 2. 1hr Meeting Reminder
  const reminder1hr = await Aicelerate.find({
    "meetingDetails.meetingBooked": true,
    "meetingDetails.reminder1hrSent": false,
    "meetingDetails.meetingTime": { $lt: new Date(now + oneHour) }
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
      "meetingDetails.hubspotStatus": { $in: ['not_booked','not_booked_first_reminder_sent'] },
      "meetingDetails.noBookReminderStage": i,
      "meetingDetails.noBookReminderTime": { $lt: new Date(now - hours * oneHour) }
    });
    for (const lead of leads) {
      if(i+1 === 2) {
        await updateLeadStatusByEmail(lead.email, 'not_booked_final_reminder_sent');
      }
      if(i+1 === 1) {
        await updateLeadStatusByEmail(lead.email, 'not_booked_first_reminder_sent');
      }
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
      "meetingDetails.noShowTime": { $lt: new Date(now - twentyFourHours) }
    });
    for (const lead of leads) {
      if(stage === 2) {
        await updateLeadStatusByEmail(lead.email, 'no_show_final_reminder_sent');
      }
      await sendTemplate.sendNoShowReminder(lead, stage);
      await Aicelerate.updateOne({ _id: lead._id }, { $set: { "meetingDetails.noShowReminderStage": stage } });
    }
  }
}

module.exports = { handleRemindersAndTriggers };
