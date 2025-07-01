// mailTemplates.js

function meetingBookedEmail(payload) {
    return {
        subject: `Your strategy session is confirmed, ${payload.name}`,
        html: `
            <p>Dear ${payload.name},</p>
            <p>Your strategy session with AIcelerate is confirmed. We look forward to our conversation.</p>
            <p>During this consultation, we will review your current sales model, analyse target market opportunities, and show how our team, with extensive experience scaling companies, helps businesses like yours secure predictable, qualified sales meetings every month.</p>
            <p><strong>Date:</strong> ${payload.date}<br>
            <strong>Time:</strong> ${payload.time}<br>
            <strong>Meeting Link:</strong> <a href="${payload.meetingUrl}">${payload.meetingUrl}</a></p>
            <!-- <p>You can add this meeting to your calendar here:<br>
            <a href="${payload.calendarUrl}">Add to Calendar</a></p>  -->
            <p>If you have any questions before the session, feel free to reply to this email.</p>
            <p>Best regards,<br>The Aicelerate Team</p>
        `
    };
}

function meetingReminder24hrEmail(payload) {
    return {
        subject: `Reminder: Your strategy session is tomorrow.`,
        html: `
            <p>Dear ${payload.name},</p>
            <p>This is a reminder that your strategy session with AIcelerate is scheduled for:</p>
            <p><strong>Date:</strong> ${payload.date}<br>
            <strong>Time:</strong> ${payload.time}<br>
            <strong>Meeting Link:</strong> <a href="${payload.meetingUrl}">${payload.meetingUrl}</a></p>
            <p>In this session, we will review your current sales approach and show how you can use AI to identify more prospects, expand your lead lists, and scale your outbound pipeline, with verified emails, LinkedIn profiles, and phone contacts.</p>
            <p>If you need to reschedule, you can do so directly via your calendar invite or reply to this email.</p>
            <p>We look forward to speaking with you.</p>
            <p>Best regards,<br>The AIcelerate Team</p>
        `
    };
}

function meetingReminder1hrEmail(payload) {
    return {
        subject: `Your strategy session starts in 1 hour`,
        html: `
            <p>Dear ${payload.name},</p>
            <p>A quick reminder that your strategy session with Aicelerate.ai will begin in one hour.</p>
            <p><strong>Date:</strong> ${payload.date}<br>
            <strong>Time:</strong> ${payload.time}<br>
            <strong>Meeting Link:</strong> <a href="${payload.meetingUrl}">${payload.meetingUrl}</a></p>
            <p>We look forward to speaking with you to review your current sales process and demonstrate how you can leverage AIcelerate to optimize your outbound growth using LinkedIn and email, generate more qualified leads, and build a stronger sales pipeline.</p>
            <p>Please feel free to reach out if you have any issues joining the meeting.</p>
            <p>Best regards,<br>The Aicelerate Team</p>
        `
    };
}

function noShowReminderEmail(payload) {
    return {
        subject: `Sorry we missed you — let’s reschedule your session`,
        html: `
            <p>Dear ${payload.name},</p>
            <p>We noticed you weren’t able to attend your strategy session with AIcelerate. We understand that things come up.</p>
            <p>Our team has already prepared your personalised strategy for scaling your B2B sales with AIcelerate. We’ve also generated a preliminary list of high-potential prospects, including verified emails, LinkedIn profiles, and phone contacts.</p>
            <p>You can reschedule here:<br>
            <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
            <p>We look forward to speaking with you and walking through the plan.</p>
            <p>Best regards,<br>The Aicelerate Team</p>
        `
    };
}

function noShowReminderFollowupEmail(payload) {
    return {
        subject: `Your ideal prospects are waiting — let’s reschedule`,
        html: `
            <p>Dear ${payload.name},</p>
            <p>We haven’t heard back since your missed session. Your personalized growth plan is ready.</p>
            <p>We’ve identified verified leads and are ready to walk you through using AIcelerate’s sales engine.</p>
            <p>Book your session:<br>
            <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
            <p>Let us know if you'd like to pause or revisit later.</p>
            <p>Best regards,<br>The AIcelerate Team</p>
        `
    };
}

function meetingNotBookedEmail(payload) {
    return {
        subject: `Let’s show you real leads, book your free AIcelerate strategy session`,
        html: `
            <p>Hi ${payload.name},</p>
            <p>Thanks for your interest in AIcelerate.</p>
            <p>We noticed you haven’t booked your strategy session yet. Our AI has already started sourcing leads tailored to your business.</p>
            <p>Book your session:<br>
            <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
            <p>Let us know if you need help booking or have questions.</p>
            <p>Best regards,<br>The AIcelerate Team</p>
        `
    };
}

function noBookingReminder1Email(payload) {
    return {
        subject: `Still interested in exploring AI solutions?`,
        html: `
            <p>Dear ${payload.name},</p>
            <p>Just following up — your free strategy session with AIcelerate is still available. We’ve already started generating AI-sourced leads for your business.</p>
            <p>Book now:<br>
            <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
            <p>Let us know if you need help.</p>
            <p>Best regards,<br>The Aicelerate Team</p>
        `
    };
}

function noBookingReminder2Email(payload) {
    return {
        subject: `Would you still like to schedule your strategy session?`,
        html: `
            <p>Dear ${payload.name},</p>
            <p>We’re just checking in one final time. Your free strategy session with AIcelerate is still open.</p>
            <p>We’d love to show you how our AI solutions can help scale your outreach and fill your pipeline.</p>
            <p>Book now:<br>
            <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
            <p>If now’s not the time, no worries — reach out anytime.</p>
            <p>Best regards,<br>The Aicelerate Team</p>
        `
    };
}

module.exports = {
    meetingBookedEmail,
    meetingReminder24hrEmail,
    meetingReminder1hrEmail,
    noShowReminderEmail,
    noShowReminderFollowupEmail,
    meetingNotBookedEmail,
    noBookingReminder1Email,
    noBookingReminder2Email,
};
