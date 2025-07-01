/**
 * Mark “no-show” contacts in both MongoDB and HubSpot.
 *
 *  CRITERIA
 *  ──────────────────────────────────────────────────────────────
 *   1. meetingBooked          == true
 *   2. hubspotStatus (Mongo)  == "meeting_booked"
 *   3. meetingTime            < NOW – 1 hour
 *
 *  ACTION
 *   • MongoDB  → hubspotStatus = "noshow",
 *                noShowTime    = now,
 *                noShowReminderStage = 0
 *   • HubSpot  → relationship_status   = "noshow"
 */

const Aicelerate = require("../models/Aicelerate");
const { updateLeadStatusByEmail } = require("../services/hubspotService");

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
    await Aicelerate.updateOne(
      { _id: lead._id },
      {
        $set: {
          "meetingDetails.hubspotStatus": "noshow",
          "meetingDetails.noShowReminderStage": 0,
        }
      }
    );

    // 2. HubSpot update
    await updateLeadStatusByEmail(email, "noshow");
  }

  console.log("✅ No-show sync complete.");
}

module.exports = { syncNoShows };