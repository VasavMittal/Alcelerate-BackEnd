# ALCELERATE BACKEND - INTEGRATION GUIDE & SETUP

---

## 🔗 EXTERNAL INTEGRATIONS OVERVIEW

### Integration Matrix

| Platform | Purpose | Auth Type | Endpoint | Status |
|----------|---------|-----------|----------|--------|
| **HubSpot** | CRM & Lead Management | Bearer Token | api.hubapi.com | Active |
| **Google Calendar** | Meeting Scheduling | Service Account JWT | googleapis.com | Active |
| **Google Sheets** | Form Data Logging | Apps Script | script.google.com | Active |
| **WhatsApp** | Message Delivery | Bearer Token | graph.facebook.com | Active |
| **Gmail SMTP** | Email Delivery | App Password | smtp.gmail.com | Active |
| **MongoDB** | Data Storage | Connection String | mongodb.com | Active |

---

## 🔑 HUBSPOT INTEGRATION

### Setup Requirements

1. **Create Private App**
   - Go to HubSpot Settings → Integrations → Private Apps
   - Create new private app
   - Grant scopes:
     - `crm.objects.contacts.read`
     - `crm.objects.contacts.write`
   - Copy private app token

2. **Environment Variables**
   ```
   HUBSPOT_PRIVATE_TOKEN=pat-na1-xxxxx
   HUBSPOT_PORTAL=12345678
   HUBSPOT_FORM=abcdef123456
   ```

### API Operations

**Search Contact by Email:**
```javascript
POST /crm/v3/objects/contacts/search
{
  "filterGroups": [{
    "filters": [{
      "propertyName": "email",
      "operator": "EQ",
      "value": "user@example.com"
    }]
  }],
  "properties": ["email"],
  "limit": 1
}
```

**Update Contact Properties:**
```javascript
PATCH /crm/v3/objects/contacts/{contactId}
{
  "properties": {
    "relationship_status": "meeting_booked"
  }
}
```

**Form Submission:**
```javascript
POST /submissions/v3/integration/submit/{portalId}/{formId}
{
  "fields": [
    { "name": "firstname", "value": "John" },
    { "name": "email", "value": "john@example.com" },
    { "name": "relationship_status", "value": "new_lead" }
  ],
  "context": {
    "hutk": "tracking-cookie",
    "pageUri": "https://landing-page.com",
    "pageName": "Sales Demo"
  }
}
```

### Custom Properties Used
- `relationship_status` - Lead status tracking
- `hs_whatsapp_phone_number` - WhatsApp contact
- `0-2/name` - Company name
- `annualrevenue` - Annual revenue
- `connect_time__c` - Preferred contact time
- `landing_page_url` - Source landing page
- `lp_name` - Landing page name
- `submission_time` - Form submission timestamp

---

## 📅 GOOGLE CALENDAR INTEGRATION

### Setup Requirements

1. **Create Service Account**
   - Go to Google Cloud Console
   - Create new project
   - Create Service Account
   - Generate JSON key file
   - Enable Calendar API

2. **Domain-Wide Delegation (Optional)**
   - Enable domain-wide delegation
   - Grant scopes to service account
   - Set `GCAL_IMPERSONATE_USER` to user email

3. **Environment Variables**
   ```
   GOOGLE_KEY_FILE={"type":"service_account",...}
   GOOGLE_CLIENT_EMAIL=service@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
   GCAL_IMPERSONATE_USER=user@domain.com
   CALENDAR_ID=primary
   GOOGLE_CALENDAR_OWNER_EMAIL=owner@domain.com
   ```

### API Operations

**List Events:**
```javascript
GET /calendar/v3/calendars/{calendarId}/events
{
  timeMin: "2025-10-18T00:00:00Z",
  timeMax: "2025-10-25T00:00:00Z",
  q: "Aicelerate",
  maxResults: 1000,
  singleEvents: true,
  orderBy: "startTime"
}
```

**Event Data Extracted:**
```javascript
{
  id: "event-id",
  summary: "Aicelerate Strategy Session",
  start: { dateTime: "2025-10-20T14:00:00Z" },
  hangoutLink: "https://meet.google.com/...",
  attendees: [
    {
      email: "guest@example.com",
      displayName: "John Doe",
      responseStatus: "accepted"
    }
  ],
  creator: { email: "owner@domain.com" }
}
```

### Event Processing Logic
1. Extract guest email (exclude organizer)
2. Get meeting time and hangout link
3. Update MongoDB with meeting details
4. Update HubSpot status to `meeting_booked`
5. Send confirmation email + WhatsApp

---

## 💬 WHATSAPP INTEGRATION

### Setup Requirements

1. **Create WhatsApp Business Account**
   - Register at Facebook Business Manager
   - Create WhatsApp Business Account
   - Get Phone Number ID

2. **Create Message Templates**
   - Go to WhatsApp Manager
   - Create templates for each message type
   - Get template names

3. **Environment Variables**
   ```
   WHATS_APP_ACCESS_TOKEN=EAAxxxxx
   ```

### Message Templates

**Template: meeting_booked_v5**
```
Parameters: [name, date, time, url]
Body: "Hi {{1}}, your meeting is confirmed for {{2}} at {{3}}. Join here: {{4}}"
```

**Template: meeting_reminder_24_v2**
```
Parameters: [name, date, time, url]
Body: "Hi {{1}}, reminder: your meeting is tomorrow {{2}} at {{3}}. {{4}}"
```

**Template: _meeting_reminder_one_hour_before_v2**
```
Parameters: [name, time, url]
Body: "Hi {{1}}, your meeting starts in 1 hour at {{2}}. {{3}}"
```

**Template: meeting_not_booked_v2**
```
Parameters: [name, url]
Body: "Hi {{1}}, book your strategy session: {{2}}"
```

**Template: reminder_to_book_1_v2 / reminder_to_book_2_v2**
```
Parameters: [name, url]
Body: "Hi {{1}}, your free session is waiting: {{2}}"
```

**Template: meeting_not_attend_reminder_1_v2 / meeting_not_attend_reminder_2_v2**
```
Parameters: [name, url]
Body: "Hi {{1}}, let's reschedule: {{2}}"
```

### API Request Format
```javascript
POST https://graph.facebook.com/v17.0/{phoneNumberId}/messages
{
  "messaging_product": "whatsapp",
  "to": "1234567890",
  "type": "template",
  "template": {
    "name": "meeting_booked_v5",
    "language": { "code": "en" },
    "components": [{
      "type": "body",
      "parameters": [
        { "type": "text", "text": "John Doe" },
        { "type": "text", "text": "2025-10-20" },
        { "type": "text", "text": "2:00 PM" },
        { "type": "text", "text": "https://meet.google.com/..." }
      ]
    }]
  }
}
```

---

## 📧 EMAIL INTEGRATION

### Gmail SMTP Configuration

**Provider:** Gmail  
**Host:** smtp.gmail.com  
**Port:** 587  
**Security:** TLS

**Setup Steps:**
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password (not regular password)
3. Store in environment variables

**Environment Variables:**
```
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Email Sending Process
```javascript
const mailOptions = {
  from: '"Aicelerate" <support@aicelerate.ai>',
  to: lead.email,
  subject: email.subject,
  html: email.html
};
await transporter.sendMail(mailOptions);
```

### Email Templates Sent
1. Meeting Booked Confirmation
2. 24-Hour Meeting Reminder
3. 1-Hour Meeting Reminder
4. Meeting Not Booked (Initial)
5. No Booking Reminder 1 (24hrs)
6. No Booking Reminder 2 (72hrs)
7. No-Show Reminder 1 (First)
8. No-Show Reminder 2 (Second)

---

## 🗄️ MONGODB INTEGRATION

### Connection Setup

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Environment Variable:**
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/alcelerate
```

### Collections

**Collection: aicelerate**
- Stores all lead information
- Tracks meeting details and reminder status
- Indexes on email, status, meeting time

### Connection Lifecycle
```javascript
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    startCronJobs();
    app.listen(PORT);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
```

---

## 📊 GOOGLE SHEETS INTEGRATION

### Setup Requirements

1. **Create Google Sheet**
   - Create new Google Sheet
   - Add columns for form data

2. **Create Apps Script**
   - Open Apps Script editor
   - Create POST handler function
   - Deploy as web app

3. **Environment Variables**
   ```
   GOOGLE_SHEET_URL=https://script.google.com/macros/d/{scriptId}/usercontent/v/...
   GOOGLE_SHEET_FORM_URL=https://script.google.com/macros/d/{scriptId}/usercontent/v/...
   ```

### Data Mapped to Sheets

| Sheet Column | Source Field | Example |
|--------------|--------------|---------|
| Date and Time | formatted | 2025-10-18 14:30:00 |
| Full Name | combineName | John Doe |
| WhatsApp Number | whatsappNumber | +1234567890 |
| Email ID | email | john@example.com |
| Business Name | businessName | Acme Corp |
| Annual Revenue | annualRevenue | $1M-$5M |
| Convenient Time | connectTime | 9 AM - 12 PM |
| URL | url | https://landing-page.com |
| LP Name | lpName | Sales Demo |

### Apps Script Handler Example
```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = e.parameter;
  sheet.appendRow([
    data["Date and Time"],
    data["Full Name"],
    data["WhatsApp Number"],
    data["Email ID"],
    data["Business Name"],
    data["Annual Revenue"],
    data["Convenient Time to Connect"],
    data["Url"],
    data["Lp name"]
  ]);
  return ContentService.createTextOutput("OK");
}
```

---

## 🔄 COMPLETE INTEGRATION FLOW

### New Lead Journey

```
1. LANDING PAGE
   ├─ User fills form
   └─ POST /log-form-data
   
2. IMMEDIATE PROCESSING
   ├─ Google Sheets (Apps Script)
   ├─ HubSpot Form API
   └─ Console Log
   
3. CRON JOB (Every 3 min)
   ├─ HubSpot Sync
   │  ├─ Fetch from HubSpot
   │  └─ Upsert to MongoDB
   ├─ Calendar Sync
   │  ├─ Check for bookings
   │  └─ Update status
   └─ Lead Processor
      └─ Send reminders
      
4. MEETING BOOKED
   ├─ Calendar event created
   ├─ Cron detects event
   ├─ Update MongoDB
   ├─ Update HubSpot
   └─ Send confirmation
   
5. MEETING REMINDERS
   ├─ 24hr before: Send reminder
   └─ 1hr before: Send reminder
   
6. MEETING ATTENDED
   ├─ HubSpot status: show
   └─ No further reminders
   
7. NO-SHOW HANDLING
   ├─ HubSpot status: noshow
   ├─ Send first reminder
   ├─ 24hrs later: Send second reminder
   └─ Offer reschedule
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-18

