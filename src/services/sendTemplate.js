// services/sendTemplate.js

const templates = require("../models/MailTemplates");

async function sendEmail(to, subject, body) {
    const mailOptions = {
      from: "support@aicelerate.ai",
      to,
      subject,
      html: body,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}`);
    } catch (err) {
      console.error(`❌ Failed to send email to ${to}:`, err.message);
    }
  }
  

async function sendWhatsApp(to, message) {
  console.log(`[WhatsApp] To: ${to}`);
  console.log(message);
  // TODO: Replace with WhatsApp API integration (e.g., Twilio, Interakt)
}

function buildPayload(lead) {
  return {
    name: lead.name,
    email: lead.email,
    date: lead.meetingDetails?.meetingTime?.toLocaleDateString() || '',
    time: lead.meetingDetails?.meetingTime?.toLocaleTimeString() || '',
    meetingUrl: lead.meetingDetails?.meetingLink || '',
    shortMeetingUrl: lead.meetingDetails?.meetingLink || '',
    rescheduleLink: lead.meetingDetails?.meetingLink || '',
  };
}

async function sendMeetingReminder24hr(lead) {
  const payload = buildPayload(lead);
  const email = templates.meetingReminder24hr.email(payload);
  const whatsapp = templates.meetingReminder24hr.whatsapp(payload);
  await sendEmail(lead.email, email.subject, email.body);
  await sendWhatsApp(lead.name, whatsapp);
}

async function sendMeetingReminder1hr(lead) {
  const payload = buildPayload(lead);
  const email = templates.meetingReminder1hr.email(payload);
  const whatsapp = templates.meetingReminder1hr.whatsapp(payload);
  await sendEmail(lead.email, email.subject, email.body);
  await sendWhatsApp(lead.name, whatsapp);
}

async function sendNoBookReminder(lead, stage) {
  const payload = buildPayload(lead);
  const reminder = templates[`noBookingReminder${stage}`];
  const email = reminder.email(payload);
  const whatsapp = reminder.whatsapp(payload);
  await sendEmail(lead.email, email.subject, email.body);
  await sendWhatsApp(lead.name, whatsapp);
}

async function sendNoShowReminder(lead, stage) {
  const payload = buildPayload(lead);
  const reminder = templates[`noShowReminder${stage}`];
  const email = reminder.email(payload);
  const whatsapp = reminder.whatsapp(payload);
  await sendEmail(lead.email, email.subject, email.body);
  await sendWhatsApp(lead.name, whatsapp);
}

module.exports = {
  sendMeetingReminder24hr,
  sendMeetingReminder1hr,
  sendNoBookReminder,
  sendNoShowReminder,
};