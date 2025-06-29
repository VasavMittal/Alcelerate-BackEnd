// integrations/hubspotService.js
require('dotenv').config();
const axios = require('axios');

// ✅ fail fast if the token is missing
if (!process.env.HUBSPOT_PRIVATE_TOKEN)
  throw new Error('HUBSPOT_PRIVATE_TOKEN is not set in .env');

const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN;
const HUBSPOT_BASE  = 'https://api.hubapi.com';

const axiosHS = axios.create({
  baseURL: HUBSPOT_BASE,
  headers: {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// -------------------------------------------------------------------

async function findContactIdByEmail(email) {
  if (!email) return null;                         // quick sanity check

  const { data } = await axiosHS.post('/crm/v3/objects/contacts/search', {
    filterGroups: [{
      filters: [{ propertyName: 'email', operator: 'EQ', value: email.toLowerCase() }],
    }],
    properties: ['email'],
    limit: 1,
  });
  return data.results?.[0]?.id ?? null;
}

async function updateContactById(id, properties) {
  await axiosHS.patch(`/crm/v3/objects/contacts/${id}`, { properties });
  return true;
}

async function updateLeadStatusByEmail(email, status) {
  const id = await findContactIdByEmail(email);
  if (!id) return console.warn(`⚠️  No HubSpot contact found for ${email}`);
  await updateContactById(id, { relationship_status: status });
  console.log(`✅ HubSpot → '${status}' saved for ${email}`);
}

module.exports = { updateLeadStatusByEmail };
