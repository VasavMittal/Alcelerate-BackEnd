# 📐 CODE STRUCTURE: Google Sheet Automation

## 📁 File Organization

```
src/
├── integrations/
│   ├── googleSheetSync.js ✅ MODIFIED
│   ├── googleCalenderSync.js (used)
│   └── ...
├── services/
│   ├── sendTemplate.js ✅ MODIFIED
│   └── ...
├── models/
│   ├── leadAutomationIndex.js ✅ MODIFIED
│   ├── MailTemplates.js (used)
│   └── ...
└── ...
```

---

## 🔧 FUNCTION HIERARCHY

### **Entry Point**
```
runGoogleSheetsAutomationTask()
  └─ handleGoogleSheetReminders()
```

### **Main Orchestration**
```
handleGoogleSheetReminders()
  ├─ fetchGoogleSheetData()
  ├─ extractCalendarEmailsWithDetails()
  ├─ checkAndUpdateStatus()
  │   ├─ PHASE 1 Logic
  │   ├─ PHASE 2 Logic
  │   ├─ PHASE 3 Logic
  │   ├─ PHASE 4 Logic
  │   └─ PHASE 5 Logic
  └─ updateGoogleSheetRows()
```

### **Email + WhatsApp Sending**
```
sendGoogleSheetReconnectReminder1(sheetRow)
  ├─ buildGoogleSheetPayload(sheetRow)
  ├─ sendEmail()
  └─ sendWhatsApp()

sendGoogleSheetReconnectReminder2(sheetRow)
  ├─ buildGoogleSheetPayload(sheetRow)
  ├─ sendEmail()
  └─ sendWhatsApp()

sendGoogleSheetMeetingBookedReminder1(sheetRow)
  ├─ buildGoogleSheetPayload(sheetRow)
  ├─ sendEmail()
  └─ sendWhatsApp()

sendGoogleSheetMeetingBookedReminder2(sheetRow)
  ├─ buildGoogleSheetPayload(sheetRow)
  ├─ sendEmail()
  └─ sendWhatsApp()

sendGoogleSheetNoShowReminder(sheetRow)
  ├─ buildGoogleSheetPayload(sheetRow)
  ├─ sendEmail()
  └─ sendWhatsApp()
```

---

## 📊 Data Flow

### **Input: Google Sheet Row**
```javascript
[
  "John Doe",                    // [0] Full Name
  "john@example.com",            // [1] Email
  "new",                         // [2] Status
  "2024-12-25T14:30:00Z",       // [3] Meeting Booked Time
  "",                            // [4] Reconnect Message Time
  ""                             // [5] No Show Time
]
```

### **Processing: Payload**
```javascript
{
  first_name: "John Doe",
  email: "john@example.com",
  date: "12/25/2024",
  time: "2:30:00 PM",
  meeting_url: "2024-12-25T14:30:00Z",
  rescheduleLink: "https://calendar.app.google/..."
}
```

### **Output: Updated Row**
```javascript
[
  "John Doe",
  "john@example.com",
  "meeting_booked",              // Status updated
  "2024-12-25T14:30:00Z",       // Meeting time set
  "",                            // Reconnect time cleared
  ""                             // No show time empty
]
```

---

## 🔄 Status Transitions

```
PHASE 1:
  new/empty
    ├─ → meeting_booked (if in calendar)
    └─ → reconnect_SMS_message_1 (if not in calendar)

PHASE 2:
  reconnect_SMS_message_1
    ├─ → meeting_booked (if in calendar)
    └─ → reconnect_SMS_message_2 (if not in calendar)

PHASE 3:
  reconnect_SMS_message_2
    ├─ → meeting_booked (if in calendar)
    └─ → reconnect_SMS_message_2 (no change)

PHASE 4:
  meeting_booked
    ├─ → meeting_booked_reminder_24hour_message_sent (24hr before)
    └─ → meeting_booked_reminder_1hour_message_sent (1hr before)

PHASE 5:
  no_show
    ├─ → meeting_booked (if in calendar)
    ├─ → no_show (set timestamp, no change)
    └─ → no_show_final_reminder_sent (24hrs after)
```

---

## 📝 Key Variables

### **Time Constants**
```javascript
const oneHour = 60 * 60 * 1000;           // 3,600,000 ms
const twentyFiveHours = 25 * oneHour;     // 90,000,000 ms
const twentyFourHours = 24 * oneHour;     // 86,400,000 ms
```

### **Email Map**
```javascript
const emailMap = new Map([
  ["john@example.com", {
    meetingTime: "2024-12-25T14:30:00Z",
    meetingLink: "https://meet.google.com/..."
  }],
  ...
])
```

### **Updated Rows**
```javascript
const updatedRows = [
  ["Full Name", "Email", "Status", ...],  // Header
  [row1_updated],
  [row2_updated],
  ...
]
```

---

## 🎯 Conditional Logic

### **PHASE 1 Check**
```javascript
if (!status || status === 'new' || status === '') {
  if (calendarData) {
    // Email found in calendar
    row[2] = 'meeting_booked';
    row[3] = calendarData.meetingTime;
  } else {
    // Email NOT in calendar
    row[2] = 'reconnect_SMS_message_1';
    row[4] = now.toISOString();
    await sendTemplate.sendGoogleSheetReconnectReminder1(row);
  }
}
```

### **PHASE 4 Check**
```javascript
if (status === 'meeting_booked' && row[3]) {
  const meetingTime = new Date(row[3]);
  const timeUntilMeeting = meetingTime - now;
  
  if (timeUntilMeeting <= twentyFiveHours && timeUntilMeeting > oneHour) {
    // 24-hour reminder
    row[2] = 'meeting_booked_reminder_24hour_message_sent';
    await sendTemplate.sendGoogleSheetMeetingBookedReminder1(row);
  } else if (timeUntilMeeting <= oneHour && timeUntilMeeting > 0) {
    // 1-hour reminder
    row[2] = 'meeting_booked_reminder_1hour_message_sent';
    await sendTemplate.sendGoogleSheetMeetingBookedReminder2(row);
  }
}
```

### **PHASE 5 Check**
```javascript
if (status === 'no_show') {
  if (calendarData) {
    // Recovery: email found in calendar
    row[2] = 'meeting_booked';
    row[3] = calendarData.meetingTime;
    row[5] = '';
  } else if (!row[5]) {
    // First detection
    row[5] = now.toISOString();
  } else {
    // Check 24 hours
    const noShowTime = new Date(row[5]);
    const timeSinceNoShow = now - noShowTime;
    
    if (timeSinceNoShow >= twentyFourHours) {
      row[2] = 'no_show_final_reminder_sent';
      await sendTemplate.sendGoogleSheetNoShowReminder(row);
    }
  }
}
```

---

## 🔌 External Dependencies

### **Modules Used**
- `googleapis` - Google Sheets API
- `sendTemplate` - Email + WhatsApp sending
- `calendarSync` - Calendar event fetching
- `MailTemplates` - Email templates

### **Environment Variables**
- `GOOGLE_SPREADSHEET_ID` - Sheet ID
- `GOOGLE_SHEET_RANGE` - Range (default: A1:F)
- `GOOGLE_KEY_FILE` - Service account JSON
- `WHATS_APP_ACCESS_TOKEN` - WhatsApp token

---

## ✅ Error Handling

```javascript
try {
  // Main logic
} catch (error) {
  console.error("[GOOGLE-SHEET] ❌ Error:", error.message);
}
```

**Graceful Failures:**
- Email send failure doesn't block WhatsApp
- WhatsApp failure doesn't block sheet update
- Missing data skipped with continue
- All errors logged with [GOOGLE-SHEET] prefix

---

## 📊 Logging Pattern

```
[GOOGLE-SHEET] ▶️  Starting...
[GOOGLE-SHEET] 📅 Found X emails
[GOOGLE-SHEET] ✅ PHASE X: ...
[GOOGLE-SHEET] ⏰ PHASE X: ...
[GOOGLE-SHEET] 📧 PHASE X: ...
[GOOGLE-SHEET] 🚨 PHASE X: ...
[GOOGLE-SHEET] 📤 Updating...
[GOOGLE-SHEET] ✅ Complete
```

---

## 🚀 Performance Notes

- **Batch Update:** Single API call for all rows
- **Deep Copy:** Prevents data mutations
- **Map Lookup:** O(1) email matching
- **Loop:** Single pass through rows
- **Memory:** Efficient for 1000+ rows

---

## 📋 Testing Points

1. Verify row deep copy works
2. Check timestamp calculations
3. Validate email map creation
4. Test status transitions
5. Verify batch update
6. Check logging output
7. Validate email sending
8. Verify WhatsApp sending

Good luck! 🎉

