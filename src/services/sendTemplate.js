// services/sendTemplate.js
const templates = require("../models/MailTemplates");
const transporter = require("../utils/smtpMailer");
require("dotenv").config();

async function sendEmail(to, subject, body) {
  const mailOptions = {
    from: '"Aicelerate" <support@aicelerate.ai>',
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

async function sendWhatsApp(to, templateName, payload) {
  const url = `https://graph.facebook.com/v17.0/704713369388414/messages`;
  const token = process.env.WHATS_APP_ACCESS_TOKEN;

  const body = buildWhatsAppPayload(to, templateName, payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`❌ Failed to send WhatsApp message:`, response.statusText);
    } else {
      console.log(`✅ WhatsApp message sent to ${to}`);
    }
  } catch (err) {
    console.error(`❌ Error sending WhatsApp message:`, err.message);
  }
}

function buildPayload(lead) {
  return {
    name: lead.name,
    email: lead.email,
    date: lead.meetingDetails?.meetingTime?.toLocaleDateString() || "",
    time: lead.meetingDetails?.meetingTime?.toLocaleTimeString() || "",
    meetingUrl: lead.meetingDetails?.meetingLink || "",
    shortMeetingUrl: lead.meetingDetails?.meetingLink || "",
    rescheduleLink:
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2Yd_EFVhC34rxLO6czM5HWZRYADzzupQg9BbXKikBEXJX4QiNsWb_Qb0xFu6jxitocPrU1juVJ?gv=true",
  };
}

function buildWhatsAppPayload(to, templateName, payload) {
  if (
    templateName === "meeting_reminder_24_v2" ||
    templateName === "meeting_booked_v5"
  ) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: payload.name },
              { type: "text", text: payload.date },
              { type: "text", text: payload.time },
              { type: "text", text: payload.url },
            ],
          },
        ],
      },
    };
  }
  if (templateName === "_meeting_reminder_one_hour_before_v2") {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: payload.name },
              { type: "text", text: payload.time },
              { type: "text", text: payload.url },
            ],
          },
        ],
      },
    };
  }
  if (
    templateName === "meeting_not_attend_reminder_1_v2" ||
    templateName === "meeting_not_attend_reminder_2_v2" ||
    templateName === "reminder_to_book_1_v2" ||
    templateName === "reminder_to_book_2_v2" ||
    templateName === "meeting_not_booked_v2"
  ) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: payload.name },
              { type: "text", text: payload.url },
            ],
          },
        ],
      },
    };
  }
}

async function sendMeetingBooked(lead) {
  const payload = buildPayload(lead);
  const email = templates.meetingBookedEmail(payload);
  const whatsAppPayload = {
    name: payload.name,
    date: payload.date,
    time: payload.time,
    url: payload.meetingUrl,
  };
  await sendEmail(lead.email, email.subject, email.html);
  await sendWhatsApp(lead.contact, "meeting_booked_v5", whatsAppPayload);
}

async function sendMeetingReminder24hr(lead) {
  const payload = buildPayload(lead);
  const email = templates.meetingReminder24hrEmail(payload);
  const whatsAppPayload = {
    name: payload.name,
    date: payload.date,
    time: payload.time,
    url: payload.meetingUrl,
  };
  await sendEmail(lead.email, email.subject, email.html);
  await sendWhatsApp(lead.contact, "meeting_reminder_24_v2", whatsAppPayload);
}

async function sendMeetingReminder1hr(lead) {
  const payload = buildPayload(lead);
  const email = templates.meetingReminder1hrEmail(payload);
  const whatsAppPayload = {
    name: payload.name,
    date: payload.date,
    time: payload.time,
    url: payload.meetingUrl,
  };
  await sendEmail(lead.email, email.subject, email.html);
  await sendWhatsApp(
    lead.contact,
    "_meeting_reminder_one_hour_before_v2",
    whatsAppPayload
  );
}

async function sendBookingReminder(lead) {
  const payload = buildPayload(lead);
  const email = templates.meetingNotBookedEmail(payload);
  const whatsAppPayload = {
    name: payload.name,
    date: payload.date,
    time: payload.time,
    url: payload.rescheduleLink,
  };
  await sendEmail(lead.email, email.subject, email.html);
  await sendWhatsApp(lead.contact, `meeting_not_booked_v2`, whatsAppPayload);
}

async function sendNoBookReminder(lead, stage) {
  const payload = buildPayload(lead);
  const email = templates[`noBookingReminder${stage}Email`](payload);
  const whatsAppPayload = {
    name: payload.name,
    date: payload.date,
    time: payload.time,
    url: payload.rescheduleLink,
  };
  await sendEmail(lead.email, email.subject, email.html);
  await sendWhatsApp(
    lead.contact,
    `reminder_to_book_${stage}_v2`,
    whatsAppPayload
  );
}

async function sendNoShowReminder(lead, stage) {
  const payload = buildPayload(lead);
  const email = templates[`noShowReminder${stage}Email`](payload);
  const whatsAppPayload = {
    name: payload.name,
    date: payload.date,
    time: payload.time,
    url: payload.rescheduleLink,
  };
  await sendEmail(lead.email, email.subject, email.html);
  await sendWhatsApp(
    lead.contact,
    `meeting_not_attend_reminder_${stage}_v2`,
    whatsAppPayload
  );
}

module.exports = {
  sendMeetingReminder24hr,
  sendMeetingReminder1hr,
  sendNoBookReminder,
  sendNoShowReminder,
  sendMeetingBooked,
  sendBookingReminder,
};
