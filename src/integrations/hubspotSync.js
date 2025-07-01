// integrations/hubspotSync.js
const axios = require("axios");
require("dotenv").config();

const Aicelerate = require("../models/Aicelerate");

const HUBSPOT_API_KEY = process.env.HUBSPOT_PRIVATE_TOKEN;
const HUBSPOT_BASE_URL = "https://api.hubapi.com";

// ⬇️ Fetch all pages of leads using pagination
async function fetchHubSpotLeads() {
  const allLeads = [];
  let after = null;

  try {
    do {
      const response = await axios.get(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts`, {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`
        },
        params: {
          properties: "email,firstname,lastname,relationship_status,hs_whatsapp_phone_number",
          limit: 100,
          ...(after && { after })
        }
      });

      const data = response.data;
      allLeads.push(...(data.results || []));
      after = data.paging?.next?.after || null;

    } while (after);

    console.log(`✅ Total HubSpot leads fetched: ${allLeads.length}`);
    return allLeads;

  } catch (err) {
    console.error("❌ HubSpot fetch error:", err.response?.data || err.message);
    return [];
  }
}

// ⬇️ Sync all leads to MongoDB
async function syncHubSpotLeadsWithDB() {
  const leads = await fetchHubSpotLeads();

  if (!leads.length) {
    console.log("⚠️ No leads found from HubSpot.");
    return;
  }

  let savedCount = 0;
  let skippedCount = 0;

  for (const lead of leads) {
    console.log(lead);
    const email = lead.properties?.email;
    const firstname = lead.properties?.firstname || "";
    const lastname = lead.properties?.lastname || "";
    const fullName = `${firstname} ${lastname}`.trim();
    const hubspotStatus = lead.properties?.relationship_status || "new_lead";
    const contact = lead.properties?.hs_whatsapp_phone_number || "";

    if (!email) {
      skippedCount++;
      console.warn("⚠️ Skipped lead with no email:", lead.id);
      continue;
    }

    try {
      await Aicelerate.updateOne(
        { email },
        {
          $set: {
            name: fullName,
            contact: contact,
            'meetingDetails.noBookReminderTime': new Date(),
            "meetingDetails.hubspotStatus": hubspotStatus
          }
        },
        { upsert: true }
      );

      savedCount++;
      console.log(`✅ Saved/Updated: ${email} → Status: ${hubspotStatus}, Contact: ${contact}`);
    } catch (err) {
      console.error(`❌ Failed to save lead: ${email}`, err.message);
    }
  }

  console.log("🎯 HubSpot Sync Summary:");
  console.log(`   → Total leads processed: ${leads.length}`);
  console.log(`   → Leads saved/updated: ${savedCount}`);
  console.log(`   → Leads skipped (no email): ${skippedCount}`);
}

module.exports = {
  syncHubSpotLeadsWithDB
};