// integrations/hubspotService.js
const axios = require('axios');
require('dotenv').config();

/*** CONFIG ************************************************************/
const HUBSPOT_TOKEN   = process.env.HUBSPOT_PRIVATE_TOKEN;           // private-app token
const HUBSPOT_BASE    = 'https://api.hubapi.com';
const HEADERS         = {
  Authorization : `Bearer ${HUBSPOT_TOKEN}`,
  'Content-Type': 'application/json',
};

/*** 1️⃣  FIND THE CONTACT ID BY EMAIL *********************************/
async function findContactIdByEmail(email) {
  try {
    const res = await axios.post(
      `${HUBSPOT_BASE}/crm/v3/objects/contacts/search`,
      {
        filterGroups: [
          {
            filters: [
              { propertyName: 'email', operator: 'EQ', value: email },
            ],
          },
        ],
        properties: ['email'],
        limit: 1,
      },
      { headers: HEADERS }
    );

    const first = res.data.results?.[0];
    return first?.id || null;
  } catch (err) {
    console.error('❌ HubSpot search error:', err.response?.data || err.message);
    return null;
  }
}

/*** 2️⃣  UPDATE THE CONTACT *******************************************/
async function updateContactById(id, properties) {
  try {
    await axios.patch(
      `${HUBSPOT_BASE}/crm/v3/objects/contacts/${id}`,
      { properties },
      { headers: HEADERS }
    );
    return true;
  } catch (err) {
    console.error('❌ HubSpot update error:', err.response?.data || err.message);
    return false;
  }
}

/*** 3️⃣  PUBLIC API: UPDATE LEAD STATUS BY EMAIL **********************/
/**
 * Update the `relationship_status` (custom) or any other property
 * on a HubSpot contact, looked up by email.
 *
 * @param {string} email  – primary email of the contact
 * @param {string} status – e.g. 'meeting_booked', 'not_booked', 'noshow'
 */
async function updateLeadStatusByEmail(email, status) {
  const id = await findContactIdByEmail(email);

  if (!id) {
    console.warn(`⚠️  No HubSpot contact found for ${email}`);
    return;
  }

  const ok = await updateContactById(id, { relationship_status: status });

  if (ok) {
    console.log(`✅ HubSpot → '${status}' saved for ${email}`);
  }
}

module.exports = { updateLeadStatusByEmail };
