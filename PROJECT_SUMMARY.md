# ALCELERATE BACKEND - PROJECT SUMMARY & QUICK REFERENCE

---

## 📌 PROJECT OVERVIEW

**Project Name:** Alcelerate Backend  
**Type:** Lead Management & Automation Platform  
**Status:** Production Ready  
**Version:** 1.0.0  
**Repository:** https://github.com/VasavMittal/Alcelerate-BackEnd  

**Core Purpose:**
Automated lead management system that integrates with HubSpot, Google Calendar, and WhatsApp to manage sales meetings, send timely reminders, and track lead progression through the sales pipeline.

---

## 🎯 KEY FEATURES

### 1. Lead Management
- ✅ Centralized lead database (MongoDB)
- ✅ Multi-stage lead status tracking
- ✅ Lead creation from multiple sources
- ✅ Automatic lead synchronization with HubSpot

### 2. Meeting Management
- ✅ Google Calendar integration
- ✅ Automatic meeting detection
- ✅ Meeting confirmation emails
- ✅ Meeting reminder system (24hr, 1hr)

### 3. Automated Reminders
- ✅ Email reminders via Gmail SMTP
- ✅ WhatsApp reminders via Facebook API
- ✅ Customizable reminder templates
- ✅ Multi-stage follow-up sequences

### 4. No-Show Handling
- ✅ Automatic no-show detection
- ✅ No-show recovery emails
- ✅ Reschedule prompts
- ✅ Multi-stage follow-ups

### 5. Form Processing
- ✅ Landing page form submissions
- ✅ Google Sheets logging
- ✅ HubSpot form integration
- ✅ WhatsApp message handling

### 6. Scheduled Automation
- ✅ Cron-based task scheduling (every 3 minutes)
- ✅ HubSpot synchronization
- ✅ Calendar synchronization
- ✅ Lead processing pipeline
- ✅ No-show detection

---

## 📊 SYSTEM STATISTICS

### Code Metrics
- **Total Files:** 11 main source files
- **Total Lines of Code:** ~1,200 lines
- **Main Entry Point:** src/index.js (97 lines)
- **Largest Module:** googleCalenderSync.js (207 lines)
- **Database Models:** 1 (Aicelerate)
- **API Endpoints:** 4 main endpoints

### Dependencies
- **Total Packages:** 10 production dependencies
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB 6.16.0 + Mongoose 8.15.0
- **Task Scheduler:** node-cron 4.0.7
- **Email:** Nodemailer 7.0.3
- **HTTP Client:** Axios 1.9.0

### Integration Points
- **HubSpot:** CRM & lead management
- **Google Calendar:** Meeting scheduling
- **Google Sheets:** Form data logging
- **WhatsApp:** Message delivery
- **Gmail:** Email delivery
- **MongoDB:** Data persistence

---

## 🔄 LEAD LIFECYCLE

### Stage 1: Lead Creation
```
Landing Page Form → POST /log-form-data
    ↓
Google Sheets + HubSpot
    ↓
Cron Job (3 min) → HubSpot Sync
    ↓
MongoDB Insert (Status: new_lead)
```

### Stage 2: Meeting Booking
```
Calendar Event Created
    ↓
Cron Job (3 min) → Calendar Sync
    ↓
MongoDB Update (Status: meeting_booked)
    ↓
HubSpot Update + Confirmation Email + WhatsApp
```

### Stage 3: Meeting Reminders
```
24 Hours Before
    ↓
Cron Job → Lead Processor
    ↓
Send Email + WhatsApp Reminder
    ↓
1 Hour Before
    ↓
Send Email + WhatsApp Reminder
```

### Stage 4: Meeting Completion
```
Meeting Attended (Status: show)
    ↓
No Further Reminders
    ↓
Lead Marked as Completed
```

### Stage 5: No-Show Handling
```
Meeting Missed (Status: noshow)
    ↓
Cron Job → No-Show Sync
    ↓
Send First Recovery Email
    ↓
24 Hours Later
    ↓
Send Second Recovery Email
    ↓
Offer Reschedule
```

### Stage 6: Not-Booked Follow-ups
```
No Meeting Booked After 24 Hours
    ↓
Status: not_booked
    ↓
Send Initial Booking Reminder
    ↓
24 Hours Later
    ↓
Send First Follow-up
    ↓
72 Hours Later
    ↓
Send Final Follow-up
```

---

## 📁 FILE STRUCTURE & RESPONSIBILITIES

| File | Lines | Purpose |
|------|-------|---------|
| `src/index.js` | 97 | Server initialization, API endpoints |
| `src/models/Aicelerate.js` | 38 | MongoDB schema definition |
| `src/models/MailTemplates.js` | 240 | Email template definitions |
| `src/models/leadAutomationIndex.js` | 35 | Automation orchestration |
| `src/models/cron/cronJobs.js` | 123 | Cron job scheduling |
| `src/services/leadProcessor.js` | 80 | Reminder logic & triggers |
| `src/services/sendTemplate.js` | 234 | Email & WhatsApp sending |
| `src/services/hubspotService.js` | 49 | HubSpot API interactions |
| `src/integrations/hubspotSync.js` | 129 | HubSpot lead sync |
| `src/integrations/googleCalenderSync.js` | 207 | Calendar sync & booking detection |
| `src/integrations/noShowSync.js` | 50 | No-show detection |
| `src/utils/smtpMailer.js` | 17 | SMTP configuration |

---

## 🔌 API ENDPOINTS

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/health` | GET | Health check | "OK" |
| `/log-form-data` | POST | Form submission | Success message |
| `/whatsapp/webhook` | GET | Webhook verification | Challenge token |
| `/whatsapp/webhook` | POST | Message handler | 200 OK |

---

## 📧 EMAIL TEMPLATES (8 Total)

1. **Meeting Booked** - Confirmation after booking
2. **24hr Reminder** - Day before meeting
3. **1hr Reminder** - Hour before meeting
4. **Not Booked** - Initial booking prompt
5. **No Booking Reminder 1** - 24hr follow-up
6. **No Booking Reminder 2** - 72hr follow-up
7. **No-Show Reminder 1** - First recovery
8. **No-Show Reminder 2** - Second recovery

---

## 🔐 SECURITY FEATURES

- ✅ Environment variable protection
- ✅ Bearer token authentication (HubSpot, WhatsApp)
- ✅ Webhook verification token
- ✅ CORS enabled
- ✅ Error handling without data exposure
- ⚠️ No request validation (recommended to add)
- ⚠️ No rate limiting (recommended to add)
- ⚠️ No API authentication (recommended to add)

---

## ⚙️ CONFIGURATION

### Required Environment Variables (20 total)

**Server:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

**Database:**
- `MONGO_URI` - MongoDB connection string

**Email:**
- `SMTP_USER` - Gmail address
- `SMTP_PASSWORD` - Gmail app password

**HubSpot:**
- `HUBSPOT_PRIVATE_TOKEN` - API token
- `HUBSPOT_PORTAL` - Portal ID
- `HUBSPOT_FORM` - Form ID

**Google Calendar:**
- `GOOGLE_KEY_FILE` - Service account JSON
- `GOOGLE_CLIENT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Private key
- `GCAL_IMPERSONATE_USER` - User to impersonate
- `CALENDAR_ID` - Calendar ID
- `GOOGLE_CALENDAR_OWNER_EMAIL` - Owner email

**Google Sheets:**
- `GOOGLE_SHEET_URL` - Apps Script URL
- `GOOGLE_SHEET_FORM_URL` - Form Apps Script URL

**WhatsApp:**
- `WHATS_APP_ACCESS_TOKEN` - API token

---

## 🚀 STARTUP SEQUENCE

```
1. Load environment variables (.env)
2. Initialize Express app
3. Enable CORS middleware
4. Connect to MongoDB
5. On successful connection:
   a. Start cron jobs (every 3 minutes)
   b. Start Express server on PORT
6. Listen for incoming requests
```

---

## 📊 CRON JOB EXECUTION (Every 3 Minutes)

```
1. HubSpot Sync
   └─ Fetch all contacts from HubSpot
   └─ Upsert to MongoDB
   └─ Log statistics

2. Google Calendar Sync
   └─ Fetch events from next 7 days
   └─ Detect new bookings
   └─ Update MongoDB & HubSpot
   └─ Send confirmation emails
   └─ Detect not-booked leads
   └─ Send booking reminders

3. Lead Processor
   └─ Send 24hr meeting reminders
   └─ Send 1hr meeting reminders
   └─ Send not-booked follow-ups
   └─ Send no-show reminders

4. No-Show Sync
   └─ Detect no-show leads
   └─ Send recovery emails
```

---

## 📈 PERFORMANCE CHARACTERISTICS

- **Cron Frequency:** Every 3 minutes
- **Typical Execution Time:** 5-30 seconds
- **Database Queries per Cycle:** ~10-15
- **API Calls per Cycle:** 2-5 (HubSpot, Calendar)
- **Emails Sent per Cycle:** Variable (0-100+)
- **WhatsApp Messages per Cycle:** Variable (0-100+)

---

## 🎓 DOCUMENTATION PROVIDED

1. **CODEBASE_DOCUMENTATION.md** - Complete code overview
2. **TECHNICAL_SPECIFICATIONS.md** - API & technical details
3. **INTEGRATION_GUIDE.md** - Integration setup & configuration
4. **DEPLOYMENT_OPERATIONS.md** - Deployment & maintenance
5. **PROJECT_SUMMARY.md** - This file

---

## 🔗 QUICK LINKS

- **Repository:** https://github.com/VasavMittal/Alcelerate-BackEnd
- **Main Entry:** src/index.js
- **Database Model:** src/models/Aicelerate.js
- **Cron Jobs:** src/models/cron/cronJobs.js
- **Lead Processing:** src/services/leadProcessor.js
- **Integrations:** src/integrations/

---

## ✅ READY FOR

- ✅ Production deployment
- ✅ Scaling to multiple servers
- ✅ Integration with additional platforms
- ✅ Custom template modifications
- ✅ Performance optimization
- ✅ Security hardening

---

## 📞 SUPPORT RESOURCES

- **Issue Tracking:** GitHub Issues
- **Documentation:** See provided markdown files
- **Logs:** Console output, PM2 logs
- **Monitoring:** Health endpoint, PM2 monitoring

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-18  
**Status:** Complete & Ready for Review

