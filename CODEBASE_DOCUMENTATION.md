# ALCELERATE BACKEND - COMPREHENSIVE TECHNICAL DOCUMENTATION

**Project Name:** Alcelerate Backend  
**Version:** 1.0.0  
**Repository:** https://github.com/VasavMittal/Alcelerate-BackEnd  
**Main Entry Point:** `src/index.js`  
**Runtime:** Node.js with Express.js Framework

---

## 📋 EXECUTIVE SUMMARY

Alcelerate is an automated lead management and engagement platform that integrates with HubSpot, Google Calendar, and WhatsApp to manage sales meetings, send automated reminders, and track lead status through various stages of the sales pipeline. The system uses scheduled cron jobs to automate lead processing, reminder delivery, and synchronization across multiple platforms.

---

## 🏗️ ARCHITECTURE OVERVIEW

### Technology Stack
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB 6.16.0 with Mongoose 8.15.0 ODM
- **Task Scheduling:** node-cron 4.0.7
- **Email Service:** Nodemailer 7.0.3 (Gmail SMTP)
- **Messaging:** WhatsApp API (Facebook Graph API v17.0)
- **CRM Integration:** HubSpot API
- **Calendar Integration:** Google Calendar API
- **HTTP Client:** Axios 1.9.0
- **Environment Management:** dotenv 16.5.0
- **CORS:** cors 2.8.5

### Project Structure
```
src/
├── index.js                          # Main application entry point
├── models/
│   ├── Aicelerate.js                # MongoDB schema for leads
│   ├── MailTemplates.js             # Email template definitions
│   ├── leadAutomationIndex.js       # Automation orchestration
│   └── cron/
│       └── cronJobs.js              # Scheduled task definitions
├── services/
│   ├── leadProcessor.js             # Lead reminder logic
│   ├── sendTemplate.js              # Email & WhatsApp sending
│   └── hubspotService.js            # HubSpot API interactions
├── integrations/
│   ├── hubspotSync.js               # HubSpot lead synchronization
│   ├── googleCalenderSync.js        # Google Calendar synchronization
│   └── noShowSync.js                # No-show detection & handling
└── utils/
    └── smtpMailer.js                # SMTP transporter configuration
```

---

## 🔧 CORE COMPONENTS DETAILED BREAKDOWN

### 1. MAIN APPLICATION (src/index.js)

**Purpose:** Initialize Express server, connect to MongoDB, and define API endpoints.

**Key Functionality:**
- **Port Configuration:** Runs on `process.env.PORT` (default: 3000)
- **MongoDB Connection:** Connects to MongoDB URI from environment variables
- **CORS Enabled:** Allows cross-origin requests
- **Cron Job Initialization:** Starts automated tasks after DB connection

**API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check endpoint |
| `/log-form-data` | POST | Receives form submissions from landing pages |
| `/whatsapp/webhook` | GET | WhatsApp webhook verification |
| `/whatsapp/webhook` | POST | Receives incoming WhatsApp messages |

**Webhook Verification Token:** `aicelerate_token`

---

### 2. DATA MODELS (src/models/)

#### 2.1 Aicelerate.js - Lead Schema

**Collections:** Aicelerate (MongoDB)

**Lead Document Structure:**
```javascript
{
  name: String,                    // Lead's full name
  email: String,                   // Primary contact email
  contact: String,                 // WhatsApp phone number
  meetingDetails: {
    meetingBooked: Boolean,        // Meeting scheduled flag
    meetingTime: Date,             // Scheduled meeting datetime
    meetingLink: String,           // Video conference URL
    googleCalendarEventId: String, // Google Calendar event ID
    hubspotStatus: String,         // Lead status enum
    landingPageBook: Boolean,      // Booked via landing page
    reminder24hrSent: Boolean,     // 24-hour reminder sent flag
    reminder1hrSent: Boolean,      // 1-hour reminder sent flag
    noBookReminderStage: Number,   // 0=none, 1=24hr, 2=48hr, 3=72hr
    noBookReminderTime: Date,      // When lead was created
    noShowReminderStage: Number,   // 0=none, 1=first, 2=second
    noShowTime: Date               // When marked as no-show
  },
  createdAt: Date                  // Record creation timestamp
}
```

**HubSpot Status Enum Values:**
- `new_lead` - Initial lead state
- `meeting_booked` - Meeting confirmed
- `show` - Lead attended meeting
- `noshow` - Lead missed meeting
- `not_booked` - Lead hasn't scheduled meeting
- `not_booked_first_reminder_sent` - First reminder sent
- `not_booked_final_reminder_sent` - Final reminder sent
- `no_show_final_reminder_sent` - No-show final reminder sent

#### 2.2 MailTemplates.js - Email Templates

**Functions Exported:** 8 email template generators

**Email Templates:**
1. `meetingBookedEmail()` - Confirmation after booking
2. `meetingReminder24hrEmail()` - 24-hour pre-meeting reminder
3. `meetingReminder1hrEmail()` - 1-hour pre-meeting reminder
4. `noShowReminder1Email()` - First no-show follow-up
5. `noShowReminder2Email()` - Second no-show follow-up
6. `meetingNotBookedEmail()` - Initial booking reminder
7. `noBookingReminder1Email()` - First booking follow-up
8. `noBookingReminder2Email()` - Final booking follow-up

**Template Features:**
- Personalized with lead name
- Meeting details (date, time, link)
- Calendar integration links
- 7-day free trial offer messaging
- Responsive HTML formatting

---

### 3. CRON JOBS & AUTOMATION (src/models/cron/cronJobs.js)

**Schedule:** Runs every 3 minutes (`*/3 * * * *`)

**Functions:**

#### 3.1 startCronJobs()
- Initializes node-cron scheduler
- Executes `runAutomationTasks()` every 3 minutes
- Logs confirmation message

#### 3.2 triggerManualJob(payload)
- **Input:** `{ Name, WhatsappNumber, Time, Message }`
- **Purpose:** Send WhatsApp messages to Google Apps Script
- **Endpoint:** Google Sheet Form URL (env: `GOOGLE_SHEET_URL`)
- **Error Handling:** Throws error if required fields missing

#### 3.3 triggerFormJob(data)
- **Purpose:** Process form submissions to multiple platforms
- **Destinations:**
  1. Google Sheets (via Apps Script)
  2. HubSpot CRM (via form submission API)
- **Data Mapped:**
  - Personal info (name, email, phone)
  - Business details (company, revenue)
  - Preferences (timezone, connection time)
  - Landing page metadata

---

### 4. LEAD PROCESSING (src/services/leadProcessor.js)

**Purpose:** Orchestrate reminder sending based on lead status and timing.

**Main Function:** `handleRemindersAndTriggers()`

**Processing Logic:**

#### Stage 1: 24-Hour Meeting Reminders
- Finds leads with booked meetings within 25 hours
- Sends email + WhatsApp reminder
- Marks `reminder24hrSent` flag

#### Stage 2: 1-Hour Meeting Reminders
- Finds leads with booked meetings within 1 hour
- Sends email + WhatsApp reminder
- Marks `reminder1hrSent` flag

#### Stage 3: Not-Booked Follow-ups (24/72 hours)
- Targets leads who haven't scheduled meetings
- Sends reminders at 24-hour and 72-hour intervals
- Updates HubSpot status accordingly
- Increments `noBookReminderStage`

#### Stage 4: No-Show Reminders
- Detects leads marked as "noshow" in HubSpot
- Sends first reminder after 24 hours
- Sends second reminder after 48 hours
- Updates `noShowReminderStage`

---

### 5. EMAIL & MESSAGING (src/services/sendTemplate.js)

**Functions:**

#### 5.1 sendEmail(to, subject, body)
- Uses Nodemailer with Gmail SMTP
- Sender: `support@aicelerate.ai`
- Logs success/failure

#### 5.2 sendWhatsApp(to, templateName, payload)
- **Endpoint:** Facebook Graph API v17.0
- **Phone Number ID:** 704713369388414
- **Template Names:**
  - `meeting_booked_v5`
  - `meeting_reminder_24_v2`
  - `_meeting_reminder_one_hour_before_v2`
  - `meeting_not_booked_v2`
  - `reminder_to_book_1_v2` / `reminder_to_book_2_v2`
  - `meeting_not_attend_reminder_1_v2` / `meeting_not_attend_reminder_2_v2`

#### 5.3 buildPayload(lead)
- Extracts meeting details from lead document
- Formats dates and times for display
- Includes reschedule link

#### 5.4 Specialized Send Functions
- `sendMeetingBooked()` - Meeting confirmation
- `sendMeetingReminder24hr()` - 24-hour reminder
- `sendMeetingReminder1hr()` - 1-hour reminder
- `sendBookingReminder()` - Initial booking prompt
- `sendNoBookReminder(lead, stage)` - Not-booked follow-ups
- `sendNoShowReminder(lead, stage)` - No-show follow-ups

---

### 6. HUBSPOT INTEGRATION (src/services/hubspotService.js)

**API Base:** `https://api.hubapi.com`

**Functions:**

#### 6.1 findContactIdByEmail(email)
- Searches HubSpot contacts by email
- Returns contact ID or null

#### 6.2 updateContactById(id, properties)
- Updates contact properties via PATCH request
- Returns boolean success status

#### 6.3 updateLeadStatusByEmail(email, status)
- Finds contact by email
- Updates `relationship_status` property
- Logs result

**Status Values Updated:**
- `meeting_booked`
- `not_booked`
- `not_booked_first_reminder_sent`
- `not_booked_final_reminder_sent`
- `no_show_final_reminder_sent`

---

### 7. HUBSPOT SYNC (src/integrations/hubspotSync.js)

**Purpose:** Synchronize HubSpot contacts with MongoDB database.

**Functions:**

#### 7.1 fetchHubSpotLeads()
- Fetches all contacts from HubSpot with pagination
- Batch size: 100 contacts per request
- Properties fetched: email, firstname, lastname, relationship_status, whatsapp_phone
- Returns array of all leads

#### 7.2 syncHubSpotLeadsWithDB()
- Processes each HubSpot lead
- **Logic:**
  - If `new_lead` status: Delete existing record and reinsert
  - Otherwise: Upsert (insert if new, update if exists)
- **Tracking:** Counts inserted, updated, skipped, and email-not-found records
- **Output:** Summary log with statistics

---

### 8. GOOGLE CALENDAR SYNC (src/integrations/googleCalenderSync.js)

**Purpose:** Sync Google Calendar events with MongoDB and trigger meeting confirmations.

**Authentication Methods:**
1. Service Account with JSON key (env: `GOOGLE_KEY_FILE`)
2. Domain-wide delegation (env: `GCAL_IMPERSONATE_USER`)
3. Legacy env vars (env: `GOOGLE_PRIVATE_KEY`, `GOOGLE_CLIENT_EMAIL`)

**Functions:**

#### 8.1 getAuthClient()
- Initializes Google authentication
- Supports multiple auth methods
- Returns JWT or GoogleAuth client

#### 8.2 fetchCalendarEvents(creatorEmail)
- Fetches events from next 7 days
- Filters by "Aicelerate" keyword
- Optional filter by creator email
- Returns up to 1000 events

#### 8.3 syncGoogleCalendarWithDB()
- **Part 1:** Process booked events
  - Extracts guest email from attendees
  - Updates lead with meeting details
  - Sends meeting confirmation email
  - Updates HubSpot status to `meeting_booked`
  
- **Part 2:** Flip new_lead to not_booked
  - Finds leads still in `new_lead` status
  - Not present in calendar events
  - Updates status to `not_booked`
  - Sends booking reminder email

---

### 9. NO-SHOW SYNC (src/integrations/noShowSync.js)

**Purpose:** Detect and process no-show leads.

**Function:** `syncNoShows()`

**Logic:**
- Finds leads with `hubspotStatus: "noshow"`
- Sets `noShowReminderStage` to 1
- Records `noShowTime` as current timestamp
- Sends first no-show reminder email
- Resets booking reminder stage

---

### 10. SMTP MAILER (src/utils/smtpMailer.js)

**Configuration:**
- **Host:** smtp.gmail.com
- **Port:** 587 (TLS)
- **Auth:** Gmail credentials from env vars
- **Cipher:** SSLv3

**Environment Variables Required:**
- `SMTP_USER` - Gmail address
- `SMTP_PASSWORD` - Gmail app password

---

## 🔄 AUTOMATION WORKFLOW

### Complete Lead Journey

```
1. LEAD CREATION
   ↓
   Form submission → Google Sheets + HubSpot
   ↓
2. HUBSPOT SYNC (Every 3 min)
   ↓
   Fetch from HubSpot → Store in MongoDB
   ↓
3. CALENDAR SYNC (Every 3 min)
   ↓
   Check Google Calendar for bookings
   ├─ If booked: Update status → Send confirmation
   └─ If not booked after 24hrs: Update status → Send reminder
   ↓
4. LEAD PROCESSING (Every 3 min)
   ├─ 24hr before meeting: Send reminder
   ├─ 1hr before meeting: Send reminder
   ├─ 24/72hrs no booking: Send follow-ups
   └─ No-show detected: Send recovery emails
   ↓
5. NO-SHOW SYNC (Every 3 min)
   ↓
   Detect no-shows → Send reminders
```

---

## 📊 ENVIRONMENT VARIABLES REQUIRED

```
# Server
PORT=3000

# Database
MONGO_URI=mongodb+srv://...

# Gmail SMTP
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# HubSpot
HUBSPOT_PRIVATE_TOKEN=pat-...
HUBSPOT_PORTAL=your-portal-id
HUBSPOT_FORM=your-form-id

# Google Calendar
GOOGLE_KEY_FILE={"type":"service_account",...}
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GCAL_IMPERSONATE_USER=...
CALENDAR_ID=primary
GOOGLE_CALENDAR_OWNER_EMAIL=...

# Google Sheets
GOOGLE_SHEET_URL=https://script.google.com/...
GOOGLE_SHEET_FORM_URL=https://script.google.com/...

# WhatsApp
WHATS_APP_ACCESS_TOKEN=...
```

---

## 🚀 DEPLOYMENT & STARTUP

**Start Command:**
```bash
npm start
```

**Process:**
1. Load environment variables
2. Connect to MongoDB
3. Start cron jobs (every 3 minutes)
4. Start Express server on configured port
5. Listen for webhook requests

---

## 📝 NOTES & OBSERVATIONS

- **Cron Frequency:** 3-minute intervals ensure timely reminders
- **Dual Channel:** Email + WhatsApp for maximum engagement
- **Status Tracking:** Comprehensive lead status tracking prevents duplicate sends
- **Error Handling:** Graceful error handling with detailed logging
- **Scalability:** Pagination in HubSpot sync handles large contact lists
- **Flexibility:** Multiple authentication methods for Google Calendar

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-18  
**Prepared For:** Technical Documentation & Code Review

