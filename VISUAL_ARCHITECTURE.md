# ALCELERATE BACKEND - VISUAL ARCHITECTURE & DIAGRAMS

---

## 🏗️ SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SYSTEMS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  HubSpot     │  │   Google     │  │  WhatsApp    │           │
│  │   CRM        │  │  Calendar    │  │   API        │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Gmail       │  │   Google     │  │  Landing     │           │
│  │  SMTP        │  │   Sheets     │  │   Pages      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ALCELERATE BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              EXPRESS.JS SERVER (Port 3000)              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  GET  /health                                           │   │
│  │  POST /log-form-data                                    │   │
│  │  GET  /whatsapp/webhook (verification)                 │   │
│  │  POST /whatsapp/webhook (message handler)              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         CRON JOBS (Every 3 Minutes)                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  1. HubSpot Sync                                        │   │
│  │  2. Google Calendar Sync                                │   │
│  │  3. Lead Processor                                      │   │
│  │  4. No-Show Sync                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SERVICES & INTEGRATIONS                    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ├─ leadProcessor.js (Reminder logic)                  │   │
│  │  ├─ sendTemplate.js (Email & WhatsApp)                 │   │
│  │  ├─ hubspotService.js (HubSpot API)                    │   │
│  │  ├─ hubspotSync.js (Lead sync)                         │   │
│  │  ├─ googleCalenderSync.js (Calendar sync)              │   │
│  │  └─ noShowSync.js (No-show detection)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  MONGODB DATABASE                       │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  Collection: aicelerate                                 │   │
│  │  ├─ Lead information                                    │   │
│  │  ├─ Meeting details                                    │   │
│  │  ├─ Reminder status                                    │   │
│  │  └─ Lead status tracking                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEAD CREATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Landing Page Form
    │
    ├─→ POST /log-form-data
    │
    ├─→ Google Sheets (Apps Script)
    │
    ├─→ HubSpot Form API
    │
    └─→ Console Log
    
    ↓ (Cron Job - Every 3 min)
    
HubSpot Sync
    │
    ├─→ Fetch from HubSpot
    │
    ├─→ MongoDB Insert/Update
    │
    └─→ Status: new_lead
    
    ↓ (Cron Job - Every 3 min)
    
Calendar Sync
    │
    ├─→ Check Google Calendar
    │
    ├─→ If Event Found:
    │   ├─→ Update MongoDB (meeting_booked)
    │   ├─→ Update HubSpot
    │   └─→ Send Confirmation Email + WhatsApp
    │
    └─→ If No Event:
        ├─→ Update MongoDB (not_booked)
        ├─→ Update HubSpot
        └─→ Send Booking Reminder
    
    ↓ (Cron Job - Every 3 min)
    
Lead Processor
    │
    ├─→ 24hr Before Meeting: Send Reminder
    │
    ├─→ 1hr Before Meeting: Send Reminder
    │
    ├─→ 24hrs No Booking: Send Follow-up
    │
    └─→ 72hrs No Booking: Send Final Follow-up
    
    ↓ (Cron Job - Every 3 min)
    
No-Show Sync
    │
    ├─→ Detect No-Shows
    │
    ├─→ Send First Recovery Email
    │
    └─→ 24hrs Later: Send Second Recovery Email
```

---

## 🔄 LEAD STATUS STATE MACHINE

```
                    ┌─────────────────┐
                    │   new_lead      │
                    │  (Initial)      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Check Calendar │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐      ┌────────▼────────┐
        │  meeting_booked│      │   not_booked    │
        │  (Confirmed)   │      │  (No booking)   │
        └───────┬────────┘      └────────┬────────┘
                │                        │
        ┌───────▼────────┐      ┌────────▼────────────────┐
        │ Send Reminders │      │ Send Follow-ups         │
        │ 24hr, 1hr      │      │ 24hr, 72hr              │
        └───────┬────────┘      └────────┬────────────────┘
                │                        │
        ┌───────▼────────┐      ┌────────▼────────┐
        │  Meeting Day   │      │ Booking Timeout │
        └───────┬────────┘      └────────┬────────┘
                │                        │
        ┌───────▼────────┐      ┌────────▼────────┐
        │ Attended/Show  │      │  Abandoned      │
        │ (Completed)    │      │  (No Action)    │
        └────────────────┘      └─────────────────┘
                │
        ┌───────▼────────┐
        │   noshow       │
        │ (Missed)       │
        └───────┬────────┘
                │
        ┌───────▼────────────────────┐
        │ Send Recovery Emails       │
        │ 1st & 2nd Reminders        │
        └───────┬────────────────────┘
                │
        ┌───────▼────────┐
        │  Rescheduled   │
        │  (Back to      │
        │   meeting_     │
        │   booked)      │
        └────────────────┘
```

---

## 📧 EMAIL SENDING FLOW

```
Lead Processor
    │
    ├─→ Identify Trigger
    │   ├─ 24hr before meeting
    │   ├─ 1hr before meeting
    │   ├─ 24hrs no booking
    │   ├─ 72hrs no booking
    │   ├─ No-show 1st reminder
    │   └─ No-show 2nd reminder
    │
    ├─→ Build Payload
    │   ├─ Lead name
    │   ├─ Meeting date/time
    │   ├─ Meeting link
    │   └─ Reschedule link
    │
    ├─→ Select Template
    │   └─ MailTemplates.js
    │
    ├─→ Send Email
    │   ├─ From: support@aicelerate.ai
    │   ├─ To: lead.email
    │   ├─ Subject: Template subject
    │   └─ Body: HTML template
    │
    └─→ Send WhatsApp
        ├─ To: lead.contact (phone)
        ├─ Template: Corresponding WhatsApp template
        └─ Parameters: Name, date, time, link
```

---

## 🔌 INTEGRATION POINTS

```
┌──────────────────────────────────────────────────────────────┐
│                   ALCELERATE BACKEND                         │
└──────────────────────────────────────────────────────────────┘
         │              │              │              │
         │              │              │              │
    ┌────▼────┐    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ HubSpot  │    │ Google   │   │WhatsApp  │   │  Gmail   │
    │   CRM    │    │Calendar  │   │   API    │   │  SMTP    │
    └────┬────┘    └────┬────┘   └────┬────┘   └────┬────┘
         │              │              │              │
    ┌────▼────────────────────────────────────────────▼────┐
    │                                                       │
    │  API Calls:                                          │
    │  • Search contacts by email                          │
    │  • Update contact properties                         │
    │  • Fetch calendar events                             │
    │  • Send WhatsApp messages                            │
    │  • Send emails via SMTP                              │
    │                                                       │
    └───────────────────────────────────────────────────────┘
         │              │              │              │
         │              │              │              │
    ┌────▼────┐    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ Leads   │    │ Meetings │   │Messages  │   │ Emails   │
    │ Status  │    │ Booked   │   │ Sent     │   │ Sent     │
    └─────────┘    └──────────┘   └──────────┘   └──────────┘
```

---

## ⏱️ CRON JOB EXECUTION TIMELINE

```
Minute 0:00
    │
    ├─→ HubSpot Sync (30-60 sec)
    │   ├─ Fetch all contacts
    │   ├─ Upsert to MongoDB
    │   └─ Log statistics
    │
    ├─→ Google Calendar Sync (20-40 sec)
    │   ├─ Fetch events
    │   ├─ Update bookings
    │   └─ Send confirmations
    │
    ├─→ Lead Processor (10-20 sec)
    │   ├─ Check reminders
    │   └─ Send emails/WhatsApp
    │
    └─→ No-Show Sync (5-10 sec)
        ├─ Detect no-shows
        └─ Send recovery emails

Minute 3:00
    │
    └─→ Repeat cycle...

Minute 6:00
    │
    └─→ Repeat cycle...

(Continues every 3 minutes)
```

---

## 📁 FILE DEPENDENCY GRAPH

```
src/index.js (Main Entry)
    │
    ├─→ cronJobs.js
    │   ├─→ leadAutomationIndex.js
    │   │   ├─→ hubspotSync.js
    │   │   ├─→ googleCalenderSync.js
    │   │   ├─→ leadProcessor.js
    │   │   │   ├─→ sendTemplate.js
    │   │   │   │   ├─→ MailTemplates.js
    │   │   │   │   ├─→ smtpMailer.js
    │   │   │   │   └─→ Aicelerate.js (Model)
    │   │   │   └─→ hubspotService.js
    │   │   └─→ noShowSync.js
    │   │       ├─→ sendTemplate.js
    │   │       └─→ Aicelerate.js (Model)
    │   │
    │   ├─→ triggerManualJob()
    │   │   └─→ Google Sheets API
    │   │
    │   └─→ triggerFormJob()
    │       ├─→ Google Sheets API
    │       └─→ HubSpot Form API
    │
    ├─→ Aicelerate.js (Model)
    │   └─→ MongoDB
    │
    └─→ Express Routes
        ├─→ /health
        ├─→ /log-form-data
        └─→ /whatsapp/webhook
```

---

## 🔐 SECURITY LAYERS

```
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL REQUESTS                          │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  CORS Middleware              │
        │  (Allow cross-origin)         │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Webhook Verification         │
        │  (Token check for WhatsApp)   │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Request Parsing              │
        │  (JSON body parsing)          │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Route Handler                │
        │  (Process request)            │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  API Authentication           │
        │  (Bearer tokens for APIs)     │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Database Operations          │
        │  (MongoDB queries)            │
        └───────────────────────────────┘
```

---

## 📈 SCALABILITY ARCHITECTURE

```
Current Setup (Single Server):
┌─────────────────────────────────┐
│  Express Server (Port 3000)     │
│  ├─ API Endpoints               │
│  ├─ Cron Jobs                   │
│  └─ Service Layer               │
└──────────────┬──────────────────┘
               │
        ┌──────▼──────┐
        │  MongoDB    │
        │  Database   │
        └─────────────┘

Scalable Setup (Multiple Servers):
┌──────────────────────────────────────────────┐
│  Load Balancer (Nginx/HAProxy)               │
└──────────────┬───────────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼──┐  ┌───▼──┐  ┌───▼──┐
│ App1 │  │ App2 │  │ App3 │
└───┬──┘  └───┬──┘  └───┬──┘
    │         │         │
    └─────────┼─────────┘
              │
        ┌─────▼──────┐
        │  MongoDB   │
        │  Cluster   │
        └────────────┘

Cron Job Coordination:
┌──────────────────────────────────────────────┐
│  Redis (Job Lock/Coordination)               │
└──────────────┬───────────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼──┐  ┌───▼──┐  ┌───▼──┐
│ Cron1│  │ Cron2│  │ Cron3│
│(Lock)│  │(Wait)│  │(Wait)│
└──────┘  └──────┘  └──────┘
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-18

