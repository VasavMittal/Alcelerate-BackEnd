# ALCELERATE BACKEND - TECHNICAL SPECIFICATIONS & API REFERENCE

---

## 📡 API ENDPOINTS SPECIFICATION

### 1. Health Check Endpoint

**Endpoint:** `GET /health`

**Purpose:** Server health verification

**Request:**
```
GET /health HTTP/1.1
Host: localhost:3000
```

**Response:**
```
Status: 200 OK
Body: "OK"
```

**Use Case:** Load balancer health checks, monitoring systems

---

### 2. Form Data Logging Endpoint

**Endpoint:** `POST /log-form-data`

**Purpose:** Receive and process form submissions from landing pages

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "formatted": "2025-10-18 14:30:00",
  "combineName": "John Doe",
  "whatsappNumber": "+1234567890",
  "email": "john@example.com",
  "businessName": "Acme Corp",
  "annualRevenue": "$1M-$5M",
  "connectTime": "9 AM - 12 PM",
  "url": "https://landing-page.com",
  "lpName": "Sales Demo",
  "fullName": "John",
  "lastName": "Doe",
  "timeZone": "EST",
  "hutk": "tracking-cookie",
  "pageTitle": "Sales Strategy Session"
}
```

**Response:**
```
Status: 200 OK
Body: "Form submission logged successfully."
```

**Processing:**
1. Logs submission to console
2. Sends data to Google Sheets via Apps Script
3. Submits to HubSpot form API
4. Stores in MongoDB (via cron job)

**Error Handling:** Errors logged but response still 200 (async processing)

---

### 3. WhatsApp Webhook Verification

**Endpoint:** `GET /whatsapp/webhook`

**Purpose:** Verify webhook with WhatsApp/Facebook

**Query Parameters:**
```
hub.mode=subscribe
hub.verify_token=aicelerate_token
hub.challenge=<challenge_string>
```

**Response (Success):**
```
Status: 200 OK
Body: <challenge_string>
```

**Response (Failure):**
```
Status: 403 Forbidden
```

**Note:** Required for initial webhook setup with WhatsApp Business API

---

### 4. WhatsApp Webhook Message Handler

**Endpoint:** `POST /whatsapp/webhook`

**Purpose:** Receive incoming WhatsApp messages and statuses

**Request Body Structure:**
```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "contacts": [
              {
                "profile": {
                  "name": "John Doe"
                },
                "wa_id": "1234567890"
              }
            ],
            "messages": [
              {
                "timestamp": "1697635200",
                "text": {
                  "body": "Hello, I'm interested in your service"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Extracted Data:**
```javascript
{
  Name: "John Doe",
  WhatsappNumber: "1234567890",
  Time: "10/18/2025, 2:00:00 PM",
  Message: "Hello, I'm interested in your service"
}
```

**Response:**
```
Status: 200 OK
```

**Processing:**
- Extracts contact name, phone, timestamp, message
- Converts UNIX timestamp to readable format
- Triggers manual job to log to Google Sheets
- Stores in database via cron

**Error Handling:**
```
Status: 400 - Missing contact or message
Status: 500 - Processing error
```

---

## 🗄️ DATABASE SCHEMA DETAILS

### Aicelerate Collection

**Indexes Recommended:**
```javascript
db.aicelerate.createIndex({ email: 1 }, { unique: true })
db.aicelerate.createIndex({ "meetingDetails.hubspotStatus": 1 })
db.aicelerate.createIndex({ "meetingDetails.meetingTime": 1 })
db.aicelerate.createIndex({ createdAt: 1 })
```

**Query Examples:**

Find leads needing 24hr reminder:
```javascript
db.aicelerate.find({
  "meetingDetails.meetingBooked": true,
  "meetingDetails.reminder24hrSent": false,
  "meetingDetails.meetingTime": { $lt: new Date(Date.now() + 25*60*60*1000) }
})
```

Find no-show leads:
```javascript
db.aicelerate.find({
  "meetingDetails.hubspotStatus": "noshow",
  "meetingDetails.noShowReminderStage": 0
})
```

---

## 🔐 SECURITY CONSIDERATIONS

### Authentication
- **HubSpot:** Bearer token in Authorization header
- **Google Calendar:** Service account JWT or OAuth
- **WhatsApp:** Bearer token in Authorization header
- **Gmail SMTP:** App-specific password (not main password)

### Data Protection
- Email addresses stored in MongoDB
- Phone numbers stored in plain text (consider encryption)
- API tokens stored in environment variables only
- No sensitive data in logs

### Webhook Security
- WhatsApp webhook verification token required
- Webhook signature validation recommended
- Rate limiting not implemented (consider adding)

---

## ⏱️ TIMING & SCHEDULING

### Cron Job Schedule
```
*/3 * * * *  (Every 3 minutes)
```

### Reminder Timing Logic

| Reminder Type | Trigger | Timing |
|---------------|---------|--------|
| 24hr Meeting | Meeting booked | 24-25 hours before |
| 1hr Meeting | Meeting booked | 0-1 hour before |
| Not Booked 1st | No booking | 24 hours after creation |
| Not Booked 2nd | No booking | 72 hours after creation |
| No-Show 1st | No-show detected | Immediately |
| No-Show 2nd | No-show detected | 24 hours after first |

### Processing Order (Per Cron Cycle)
1. HubSpot sync (fetch & upsert leads)
2. Google Calendar sync (check bookings)
3. Lead processor (send reminders)
4. No-show sync (detect & process)

---

## 📊 DATA FLOW DIAGRAMS

### Form Submission Flow
```
Landing Page Form
    ↓
POST /log-form-data
    ↓
    ├→ Google Sheets (Apps Script)
    ├→ HubSpot Form API
    └→ Console Log
    ↓
Cron Job (3 min)
    ↓
    ├→ HubSpot Sync
    ├→ MongoDB Insert/Update
    └→ Calendar Sync Check
```

### WhatsApp Message Flow
```
WhatsApp Message
    ↓
POST /whatsapp/webhook
    ↓
Extract Data
    ↓
triggerManualJob()
    ↓
Google Sheets (Apps Script)
    ↓
Cron Job (3 min)
    ↓
MongoDB Insert
```

### Meeting Reminder Flow
```
Google Calendar Event Created
    ↓
Cron Job (3 min)
    ↓
Calendar Sync
    ↓
Update MongoDB
    ↓
Update HubSpot
    ↓
Send Confirmation Email + WhatsApp
    ↓
Set reminder flags
    ↓
24hr Before: Send reminder
    ↓
1hr Before: Send reminder
```

---

## 🔧 CONFIGURATION PARAMETERS

### Email Configuration
```javascript
{
  from: '"Aicelerate" <support@aicelerate.ai>',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  tls: { ciphers: 'SSLv3' }
}
```

### WhatsApp Configuration
```javascript
{
  url: 'https://graph.facebook.com/v17.0/704713369388414/messages',
  phoneNumberId: '704713369388414',
  apiVersion: 'v17.0'
}
```

### Google Calendar Configuration
```javascript
{
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  timeMin: new Date().toISOString(),
  timeMax: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  maxResults: 1000,
  searchQuery: 'Aicelerate'
}
```

### HubSpot Configuration
```javascript
{
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  }
}
```

---

## 🐛 ERROR HANDLING STRATEGY

### Graceful Degradation
- Email send failure: Logged but doesn't stop process
- WhatsApp send failure: Logged but doesn't stop process
- HubSpot update failure: Logged but doesn't stop process
- Calendar fetch failure: Returns empty array, continues

### Retry Logic
- No automatic retries implemented
- Manual retry via cron job next cycle
- Consider implementing exponential backoff

### Logging
- All operations logged to console
- Emoji indicators for status (✅ ❌ ⚠️ 🔄)
- Timestamp included in logs
- Error messages include context

---

## 📈 PERFORMANCE METRICS

### Database Operations
- HubSpot sync: ~100 contacts per request
- Calendar fetch: Up to 1000 events per request
- Lead processor: Batch queries by status
- No-show sync: Single query for all no-shows

### API Response Times
- Health check: <10ms
- Form submission: <100ms (async)
- Webhook verification: <10ms
- Webhook message: <100ms (async)

### Cron Job Frequency
- Runs every 3 minutes
- Total execution time: ~5-30 seconds (depends on lead volume)
- Overlapping jobs: Not prevented (consider adding mutex)

---

## 🚨 KNOWN LIMITATIONS & IMPROVEMENTS

### Current Limitations
1. No duplicate job prevention (overlapping cron cycles)
2. No rate limiting on API endpoints
3. Phone numbers stored in plain text
4. No request validation/sanitization
5. No authentication on API endpoints
6. Limited error recovery mechanisms
7. No database transaction support

### Recommended Improvements
1. Add request validation middleware
2. Implement rate limiting
3. Add API authentication (JWT/API keys)
4. Encrypt sensitive data in database
5. Add job locking mechanism for cron
6. Implement comprehensive error recovery
7. Add request logging/audit trail
8. Add database transaction support
9. Implement webhook signature verification
10. Add monitoring and alerting

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-18

