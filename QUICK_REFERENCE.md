# 🚀 QUICK REFERENCE: Google Sheet Automation

## 📊 STATUS VALUES

| Status | Phase | Action |
|--------|-------|--------|
| `new` or empty | 1 | Check calendar, send reconnect if not found |
| `reconnect_SMS_message_1` | 2 | Check calendar, send reconnect 2 if not found |
| `reconnect_SMS_message_2` | 3 | Check calendar, wait if not found |
| `meeting_booked` | 4 | Send 24hr reminder, then 1hr reminder |
| `meeting_booked_reminder_24hour_message_sent` | 4 | Waiting for 1-hour mark |
| `meeting_booked_reminder_1hour_message_sent` | 4 | Meeting reminder complete |
| `no_show` | 5 | Set timestamp, wait 24hrs, send reminder |
| `no_show_final_reminder_sent` | 5 | No-show reminder sent |

---

## 📧 EMAIL TEMPLATES & WHATSAPP

| Function | Email Template | WhatsApp Template |
|----------|---|---|
| `sendGoogleSheetReconnectReminder1()` | `reConnectReminder1Email` | `reminder_to_book_1_v2` |
| `sendGoogleSheetReconnectReminder2()` | `reConnectReminder2Email` | `reminder_to_book_2_v2` |
| `sendGoogleSheetMeetingBookedReminder1()` | `googleSheetMeetingBookedReminder1` | `meeting_reminder_24_v2` |
| `sendGoogleSheetMeetingBookedReminder2()` | `googleSheetMeetingBookedReminder2` | `_meeting_reminder_one_hour_before_v2` |
| `sendGoogleSheetNoShowReminder()` | `googleSheetNoShowReminder` | `meeting_not_attend_reminder_1_v2` |

---

## 🔧 KEY FUNCTIONS

### **googleSheetSync.js**
```javascript
handleGoogleSheetReminders()
  ├─ fetchGoogleSheetData()
  ├─ extractCalendarEmailsWithDetails()
  ├─ checkAndUpdateStatus()
  ├─ updateGoogleSheetRows()
  └─ sendTemplate functions
```

### **sendTemplate.js**
```javascript
buildGoogleSheetPayload(sheetRow)
sendGoogleSheetMeetingBookedReminder1(sheetRow)
sendGoogleSheetMeetingBookedReminder2(sheetRow)
sendGoogleSheetNoShowReminder(sheetRow)
sendGoogleSheetReconnectReminder1(sheetRow)
sendGoogleSheetReconnectReminder2(sheetRow)
```

---

## 📝 PAYLOAD STRUCTURE

```javascript
{
  first_name: "John",           // Column A
  email: "john@example.com",    // Column B
  date: "12/25/2024",           // From Column D
  time: "2:30:00 PM",           // From Column D
  meeting_url: "2024-12-25T14:30:00Z",  // Column D
  rescheduleLink: "https://calendar.app.google/..."
}
```

---

## ⏱️ TIME CALCULATIONS

```javascript
const oneHour = 60 * 60 * 1000;           // 3,600,000 ms
const twentyFiveHours = 25 * oneHour;     // 90,000,000 ms
const twentyFourHours = 24 * oneHour;     // 86,400,000 ms

// 24-Hour Reminder
if (timeUntilMeeting <= twentyFiveHours && timeUntilMeeting > oneHour)

// 1-Hour Reminder
if (timeUntilMeeting <= oneHour && timeUntilMeeting > 0)

// 24 Hours After No-Show
if (timeSinceNoShow >= twentyFourHours)
```

---

## 🔍 DEBUGGING TIPS

### Check Logs
```
[GOOGLE-SHEET] ▶️  Starting Google Sheet reminders & triggers...
[GOOGLE-SHEET] 📅 Found X unique emails in calendar events
[GOOGLE-SHEET] ✅ PHASE 1: Email found in calendar - Status → meeting_booked
[GOOGLE-SHEET] ⏰ PHASE 1: Email NOT in calendar - Status → reconnect_SMS_message_1
[GOOGLE-SHEET] 📧 PHASE 4 (24hr): Email - Sending 24-hour reminder
[GOOGLE-SHEET] 🚨 PHASE 5 (Detection): Email - No Show Time set
[GOOGLE-SHEET] 📤 Updating Google Sheet with all changes...
[GOOGLE-SHEET] ✅ Google Sheet updated successfully
```

### Common Issues
1. **Email not found in calendar:** Check if attendee email matches exactly
2. **Reminders not sending:** Verify WhatsApp token and email templates exist
3. **Sheet not updating:** Check GOOGLE_SPREADSHEET_ID and GOOGLE_SHEET_RANGE

---

## 🎯 EXECUTION FLOW

```
Every 3 minutes:
  runGoogleSheetsAutomationTask()
    ↓
  handleGoogleSheetReminders()
    ├─ Fetch sheet data (A1:F)
    ├─ Get calendar events
    ├─ Process each row through 5 phases
    ├─ Send emails + WhatsApp
    └─ Update sheet (batch)
```

---

## 📋 COLUMN REFERENCE

```
A (0): Full Name
B (1): Email
C (2): Status
D (3): Meeting Booked Time
E (4): Reconnect Message Time
F (5): No Show Time
```

---

## ✅ READY TO TEST

1. Ensure Google Sheet has correct headers
2. Add test data with different statuses
3. Monitor logs for [GOOGLE-SHEET] messages
4. Verify emails and WhatsApp messages are sent
5. Check Google Sheet updates

Good luck! 🚀

