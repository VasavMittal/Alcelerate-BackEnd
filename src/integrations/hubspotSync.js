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
// integrations/hubspotSync.js
async function syncHubSpotLeadsWithDB() {
  const leads = await fetchHubSpotLeads();
  if (!leads.length) {
    console.log("⚠️ No leads found from HubSpot.");
    return;
  }

  let inserted = 0, updated = 0, skipped = 0, emailNotFound = 0;

  for (const lead of leads) {
    const email = lead.properties?.email;
    if (!email) { emailNotFound++; continue; }

    const hubspotStatus   = (lead.properties?.relationship_status || 'new_lead').toLowerCase();
    const fullName        = `${lead.properties?.firstname || ""} ${lead.properties?.lastname || ""}`.trim();
    const contact         = lead.properties?.hs_whatsapp_phone_number || "";
    const hubspotId       = lead.id || lead.properties?.hs_object_id;
    const hubspotCreated  = new Date(lead.properties?.createdate || lead.createdAt);

    try {
      const existing = await Aicelerate.findOne({ email });

      if (existing && hubspotStatus === 'new_lead') {
        // Treat as fresh lead
        await Aicelerate.deleteOne({ email });
        await Aicelerate.create({
          email,
          name: fullName,
          contact,
          hubspotId,
          meetingDetails: {
            hubspotStatus,
            noBookReminderTime: hubspotCreated
          },
          createdAt: hubspotCreated
        });
        inserted++;
        console.log(`🔁 Reinserted as new lead: ${email}`);
      } else {
        // Normal upsert logic
        const res = await Aicelerate.updateOne(
          { email },
          {
            $set: {
              'meetingDetails.hubspotStatus': hubspotStatus
            },
            $setOnInsert: {
              name: fullName,
              contact,
              hubspotId,
              'meetingDetails.noBookReminderTime': hubspotCreated,
              createdAt: hubspotCreated
            }
          },
          { upsert: true }
        );
      
        if (res.upsertedCount) {
          inserted++;
          console.log(`➕ Inserted new lead: ${email}`);
        } else if (res.modifiedCount) {
          updated++;
          console.log(`🔄 Status updated for: ${email} → ${hubspotStatus}`);
        } else {
          skipped++;
        }
      }      
    } catch (err) {
      skipped++;
      console.error(`❌ DB error for ${email}:`, err.message);
    }
  }

  console.log("🎯 HubSpot Sync Summary:");
  console.log(`   → Processed : ${leads.length}`);
  console.log(`   → Inserted  : ${inserted}`);
  console.log(`   → Updated   : ${updated}`);
  console.log(`   → Skipped   : ${skipped}`);
  console.log(`   → Email Not Found: ${emailNotFound}`);
}


module.exports = {
  syncHubSpotLeadsWithDB
};