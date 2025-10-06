// mailTemplates.js

function meetingBookedEmail(payload) {
  // return {
  //   subject: `Your strategy session is confirmed, ${payload.name}`,
  //   html: `
  //           <p>Dear ${payload.name},</p>
  //           <p>Your strategy session with AIcelerate is confirmed. We look forward to our conversation.</p>
  //           <p>During this consultation, we will review your current sales model, analyse target market opportunities, and show how our team, with extensive experience scaling companies, helps businesses like yours secure predictable, qualified sales meetings every month.</p>
  //           <p><strong>Date:</strong> ${payload.date}<br>
  //           <strong>Time:</strong> ${payload.time} UTC<br>
  //           <strong>Meeting Link:</strong> <a href="${payload.meetingUrl}">${payload.meetingUrl}</a></p>
  //           <!-- <p>You can add this meeting to your calendar here:<br>
  //           <a href="${payload.calendarUrl}">Add to Calendar</a></p>  -->
  //           <p>If you have any questions before the session, feel free to reply to this email.</p>
  //           <p>Best regards,<br>The Aicelerate Team</p>
  //       `,
  // };

  return {
    subject: `Your strategy session is confirmed, ${payload.name}`,
    html: `
        <p>Dear ${payload.name},</p>
        <p>Your strategy session with AIcelerate is confirmed. We look forward to our conversation.</p>
        <p>During this consultation, we’ll review your current sales model, analyze target market opportunities, and show how our team helps businesses like yours secure predictable, qualified sales meetings every month.</p>
        <p><strong>Special invite:</strong> Because you expressed interest in AIcelerate, you’re eligible for an invite-only <strong>7-day free trial</strong> of AIcelerate — with a guarantee of 1 qualified meeting booked during the trial. We’ll confirm eligibility together in the pilot call and, if there’s a fit, we’ll activate your trial instantly.</p>
        <p><strong>When:</strong> ${payload.date} at ${payload.time} UTC<br>
        <strong>Meeting link:</strong> <a href="${payload.meetingUrl}">${payload.meetingUrl}</a></p>
        <p>Add this to your calendar: <a href="${payload.calendarUrl}">Add to Calendar</a></p>
        <p>If you have any questions before the session, just hit reply.</p>
        <p>Best regards,<br>The AIcelerate Team</p>
    `,
  };
}

function meetingReminder24hrEmail(payload) {
  // return {
  //   subject: `Reminder: Your strategy session is tomorrow.`,
  //   html: `
  //           <p>Dear ${payload.name},</p>
  //           <p>This is a reminder that your strategy session with AIcelerate is scheduled for:</p>
  //           <p><strong>Date:</strong> ${payload.date}<br>
  //           <strong>Time:</strong> ${payload.time} UTC<br>
  //           <strong>Meeting Link:</strong> <a href="${payload.meetingUrl}">${payload.meetingUrl}</a></p>
  //           <p>In this session, we will review your current sales approach and show how you can use AI to identify more prospects, expand your lead lists, and scale your outbound pipeline, with verified emails, LinkedIn profiles, and phone contacts.</p>
  //           <p>If you need to reschedule, you can do so directly via your calendar invite or reply to this email.</p>
  //           <p>We look forward to speaking with you.</p>
  //           <p>Best regards,<br>The AIcelerate Team</p>
  //       `,
  // };

  return {
    subject: `Reminder: Your strategy session is tomorrow (free 7-day trial + 1 meeting)`,
    html: `
        <p>Dear ${payload.name},</p>
        <p>A quick reminder that your strategy session with AIcelerate is scheduled for:</p>
        <p><strong>Date:</strong> ${payload.date}<br>
        <strong>Time:</strong> ${payload.time} UTC<br>
        <strong>Meeting link:</strong> <a href="${payload.meetingUrl}">${payload.meetingUrl}</a></p>
        <p>In this session, we’ll review your current sales approach and show how you can use AI to identify more prospects, expand your lead lists, and scale your outbound pipeline.</p>
        <p><strong>Special invite:</strong> Because you expressed interest in AIcelerate, you’re eligible for an invite-only <strong>7-day free trial</strong> — with <strong>1 qualified meeting guaranteed</strong>. We’ll confirm eligibility on the call and activate it instantly if there’s a fit.</p>
        <p>Need to reschedule? Use your calendar invite or reply to this email.</p>
        <p>Best regards,<br>The AIcelerate Team</p>
    `,
  };
}

function meetingReminder1hrEmail(payload) {
  // return {
  //   subject: `Your strategy session starts in 1 hour`,
  //   html: `
  //           <p>Dear ${payload.name},</p>
  //           <p>A quick reminder that your strategy session with Aicelerate.ai will begin in one hour.</p>
  //           <p><strong>Date:</strong> ${payload.date}<br>
  //           <strong>Time:</strong> ${payload.time} UTC<br>
  //           <strong>Meeting Link:</strong> <a href="${payload.meetingUrl}">${payload.meetingUrl}</a></p>
  //           <p>We look forward to speaking with you to review your current sales process and demonstrate how you can leverage AIcelerate to optimize your outbound growth using LinkedIn and email, generate more qualified leads, and build a stronger sales pipeline.</p>
  //           <p>Please feel free to reach out if you have any issues joining the meeting.</p>
  //           <p>Best regards,<br>The Aicelerate Team</p>
  //       `,
  // };
  return {
    subject: `Your strategy session starts in 1 hour (trial + guaranteed meeting)`,
    html: `
        <p>Dear ${payload.name},</p>
        <p>Your strategy session with AIcelerate begins in one hour.</p>
        <p><strong>Date:</strong> ${payload.date}<br>
        <strong>Time:</strong> ${payload.time} UTC<br>
        <strong>Meeting link:</strong> <a href="${payload.meetingUrl}">${payload.meetingUrl}</a></p>
        <p>On this call, we’ll review your current sales process and demonstrate how to leverage AIcelerate to optimize outbound across LinkedIn and email.</p>
        <p><strong>Special invite:</strong> Since you’ve shown interest, you’re eligible for an invite-only <strong>7-day free trial</strong> with <strong>1 qualified meeting guaranteed</strong> — we’ll confirm eligibility and activate it during the call if there’s a fit.</p>
        <p>If you have trouble joining, reply and we’ll help.</p>
        <p>Best regards,<br>The AIcelerate Team</p>
    `,
  };
}

function noShowReminder1Email(payload) {
  // return {
  //   subject: `Sorry we missed you — let’s reschedule your session`,
  //   html: `
  //           <p>Dear ${payload.name},</p>
  //           <p>We noticed you weren’t able to attend your strategy session with AIcelerate. We understand that things come up.</p>
  //           <p>Our team has already prepared your personalised strategy for scaling your B2B sales with AIcelerate. We’ve also generated a preliminary list of high-potential prospects, including verified emails, LinkedIn profiles, and phone contacts.</p>
  //           <p>You can reschedule here:<br>
  //           <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
  //           <p>We look forward to speaking with you and walking through the plan.</p>
  //           <p>Best regards,<br>The Aicelerate Team</p>
  //       `,
  // };
  return {
    subject: `Sorry we missed you — reschedule to activate your 7-day trial + 1 meeting`,
    html: `
        <p>Dear ${payload.name},</p>
        <p>We noticed you weren’t able to attend your AIcelerate strategy session. No worries — things happen.</p>
        <p>Your invite-only <strong>7-day free trial</strong> — with a <strong>guaranteed 1 qualified meeting</strong> — is still available. We’ll confirm eligibility in the rescheduled pilot call and activate your trial if there’s a fit.</p>
        <p>We’ve also prepared your personalized strategy and a preliminary list of high-potential prospects (with verified emails, LinkedIn profiles, and phone contacts) to review together.</p>
        <p><strong>Reschedule here:</strong><br>
        <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
        <p>Best regards,<br>The AIcelerate Team</p>
    `,
  };
}

function noShowReminder2Email(payload) {
  // return {
  //   subject: `Your ideal prospects are waiting — let’s reschedule`,
  //   html: `
  //           <p>Dear ${payload.name},</p>
  //           <p>We haven’t heard back since your missed session. Your personalized growth plan is ready.</p>
  //           <p>We’ve identified verified leads and are ready to walk you through using AIcelerate’s sales engine.</p>
  //           <p>Book your session:<br>
  //           <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
  //           <p>Let us know if you'd like to pause or revisit later.</p>
  //           <p>Best regards,<br>The AIcelerate Team</p>
  //       `,
  // };
  return {
    subject: `Last call to claim your invite-only 7-day trial (+ 1 qualified meeting)`,
    html: `
        <p>Dear ${payload.name},</p>
        <p>We haven’t heard back since your missed session. Your invite-only <strong>7-day free trial</strong> — with <strong>1 qualified meeting guaranteed</strong> — is still open. We’ll confirm eligibility in the pilot call and activate your trial if there’s a fit.</p>
        <p><strong>Reschedule here:</strong><br>
        <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
        <p>If you’d prefer to pause or revisit later, just let us know.</p>
        <p>Best regards,<br>The AIcelerate Team</p>
    `,
  };
}

function meetingNotBookedEmail(payload) {
  // return {
  //   subject: `Let’s show you real leads, book your free AIcelerate strategy session`,
  //   html: `
  //           <p>Hi ${payload.name},</p>
  //           <p>Thanks for your interest in AIcelerate.</p>
  //           <p>We noticed you haven’t booked your strategy session yet. Our AI has already started sourcing leads tailored to your business.</p>
  //           <p>Book your session:<br>
  //           <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
  //           <p>Let us know if you need help booking or have questions.</p>
  //           <p>Best regards,<br>The AIcelerate Team</p>
  //       `,
  // };
  return {
    subject: `Book your free strategy session — unlock 7-day trial + 1 guaranteed meeting`,
    html: `
        <p>Hi ${payload.name},</p>
        <p>Thanks for your interest in AIcelerate.</p>
        <p>We noticed you haven’t scheduled your strategy session yet. You’re eligible for an invite-only <strong>7-day free trial</strong> — with <strong>1 qualified meeting guaranteed</strong> during the trial. We’ll assess fit together in a short pilot call and, if eligible, we’ll activate your trial immediately.</p>
        <p>On the call, we’ll review your sales model and show you exactly how other companies use our AI engine to scale outreach across email, LinkedIn, and phone — with verified emails and phone contacts — so you can secure predictable, qualified meetings every month.</p>
        <p><strong>Book your session here:</strong><br>
        <a href="${payload.rescheduleLink}">Schedule Your Session</a></p>
        <p>Questions before booking? Just reply — we’re happy to help.</p>
        <p>Best regards,<br>The AIcelerate Team</p>
    `,
  };
}

function noBookingReminder1Email(payload) {
  // return {
  //   subject: `Still interested in exploring AI solutions?`,
  //   html: `
  //           <p>Dear ${payload.name},</p>
  //           <p>Just following up — your free strategy session with AIcelerate is still available. We’ve already started generating AI-sourced leads for your business.</p>
  //           <p>Book now:<br>
  //           <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
  //           <p>Let us know if you need help.</p>
  //           <p>Best regards,<br>The Aicelerate Team</p>
  //       `,
  // };
  return {
    subject: `Still exploring AI? Your 7-day trial + 1 meeting is waiting`,
    html: `
        <p>Dear ${payload.name},</p>
        <p>Just following up — your free strategy session with AIcelerate is still available. You can access an invite-only <strong>7-day free trial</strong> with a <strong>guaranteed 1 qualified meeting</strong> once we confirm fit on the pilot call.</p>
        <p><strong>Pick a time here:</strong><br>
        <a href="${payload.rescheduleLink}">Schedule Your Session</a></p>
        <p>Need anything before booking? Reply to this email.</p>
        <p>Best regards,<br>The AIcelerate Team</p>
    `,
  };
}

function noBookingReminder2Email(payload) {
  // return {
  //   subject: `Would you still like to schedule your strategy session?`,
  //   html: `
  //           <p>Dear ${payload.name},</p>
  //           <p>We’re just checking in one final time. Your free strategy session with AIcelerate is still open.</p>
  //           <p>We’d love to show you how our AI solutions can help scale your outreach and fill your pipeline.</p>
  //           <p>Book now:<br>
  //           <a href="${payload.rescheduleLink}">${payload.rescheduleLink}</a></p>
  //           <p>If now’s not the time, no worries — reach out anytime.</p>
  //           <p>Best regards,<br>The Aicelerate Team</p>
  //       `,
  // };
  return {
    subject: `Final reminder: schedule your session to unlock the 7-day trial + 1 meeting`,
    html: `
        <p>Dear ${payload.name},</p>
        <p>One last check-in: would you like to schedule your free AIcelerate strategy session? You’re eligible for an invite-only <strong>7-day free trial</strong> — with <strong>1 qualified meeting guaranteed</strong> — once we confirm fit on the pilot call.</p>
        <p><strong>Book a time here:</strong><br>
        <a href="${payload.rescheduleLink}">Schedule Your Session</a></p>
        <p>If now isn’t ideal, no problem — feel free to reach out whenever it suits you.</p>
        <p>Best regards,<br>The AIcelerate Team</p>
    `,
  };
}

module.exports = {
  meetingBookedEmail,
  meetingReminder24hrEmail,
  meetingReminder1hrEmail,
  noShowReminder1Email,
  noShowReminder2Email,
  meetingNotBookedEmail,
  noBookingReminder1Email,
  noBookingReminder2Email,
};
