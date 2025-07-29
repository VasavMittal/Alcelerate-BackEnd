const Aicelerate = require("../models/Aicelerate");
const sendTemplate = require("../services/sendTemplate");

async function syncNoShows() {
  const ONE_HOUR = 60 * 60 * 1000;
  const cutoff   = new Date(Date.now() - ONE_HOUR);
  const now      = new Date();

  const noShowCandidates = await Aicelerate.find({
    "meetingDetails.meetingBooked": true,
    "meetingDetails.hubspotStatus": "noshow",
  });

  if (!noShowCandidates.length) {
    console.log("⏭  No new no-shows found.");
    return;
  }

  console.log(`🚨 Processing ${noShowCandidates.length} potential no-shows…`);

  for (const lead of noShowCandidates) {
    const email = lead.email?.toLowerCase();
    if (!email) continue;                                   // Skip records with no email

    // 1. MongoDB update
    const res = await Aicelerate.updateOne(
      {
        _id: lead._id,
        "meetingDetails.noShowReminderStage": { $exists: false }
      },
      {
        $set: {
          "meetingDetails.noShowReminderStage": 1,
          'meetingDetails.noShowTime': now,
          'meetingDetails.noBookReminderStage': 0,
          'meetingDetails.noBookReminderTime': null
        }
      }
    );    
    if (res.modifiedCount) {
      await sendTemplate.sendNoShowReminder(lead, 1);
    }

  }

  console.log("✅ No-show sync complete.");
}

module.exports = { syncNoShows };
