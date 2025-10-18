# 📋 DETAILED PLAN: Google Sheet Automation with Reminders & Triggers

## 📊 Google Sheet Headers (Column Mapping)
```
Column A (Index 0): Full Name
Column B (Index 1): Email
Column C (Index 2): Status
Column D (Index 3): Meeting Booked Time
Column E (Index 4): Reconnect Message Time
Column F (Index 5): No Show Time
```

---

## 🎯 AUTOMATION FLOW & LOGIC

### **PHASE 1: Initial Status Check (Status = 'new' or empty)**

**Condition:** `status === 'new' OR status === '' OR status === null`

**Action:**
1. Check if email exists in Google Calendar events
2. **IF email found in calendar:**
   - Update `Status` → `'meeting_booked'`
   - Update `Meeting Booked Time` → Meeting start time from calendar
   - Send email: `googleSheetMeetingBookedReminder1` (24hr before)
   - Log: "✅ Email found in calendar - Status updated to meeting_booked"

3. **IF email NOT found in calendar:**
   - Update `Status` → `'reconnect_message1'`
   - Update `Reconnect Message Time` → Current timestamp (NOW)
   - Send email: `reConnectReminder1Email`
   - Log: "⏰ Email not in calendar - Status updated to reconnect_message1, reminder sent"

---

### **PHASE 2: Reconnect Message 1 Follow-up (Status = 'reconnect_message1')**

**Condition:** `status === 'reconnect_message1' AND (NOW - Reconnect Message Time) >= 24 hours`

**Action:**
1. Check if email exists in Google Calendar events
2. **IF email found in calendar:**
   - Update `Status` → `'meeting_booked'`
   - Update `Meeting Booked Time` → Meeting start time from calendar
   - Clear `Reconnect Message Time` → Empty/null
   - Send email: `googleSheetMeetingBookedReminder1`
   - Log: "✅ Email found in calendar after reconnect - Status updated to meeting_booked"

3. **IF email NOT found in calendar:**
   - Update `Status` → `'reconnect_message2'`
   - Send email: `reConnectReminder2Email`
   - Keep `Reconnect Message Time` → Same (don't update)
   - Log: "⏰ Email still not in calendar - Status updated to reconnect_message2, reminder sent"

---

### **PHASE 3: Reconnect Message 2 Follow-up (Status = 'reconnect_message2')**

**Condition:** `status === 'reconnect_message2'`

**Action:**
1. Check if email exists in Google Calendar events
2. **IF email found in calendar:**
   - Update `Status` → `'meeting_booked'`
   - Update `Meeting Booked Time` → Meeting start time from calendar
   - Clear `Reconnect Message Time` → Empty/null
   - Send email: `googleSheetMeetingBookedReminder1`
   - Log: "✅ Email found in calendar after reconnect_message2 - Status updated to meeting_booked"

3. **IF email NOT found in calendar:**
   - No action (wait for manual intervention or next cycle)
   - Log: "⏳ Email still not in calendar - Status remains reconnect_message2"

---

### **PHASE 4: Meeting Booked Reminders (Status = 'meeting_booked')**

**Condition:** `status === 'meeting_booked' AND meetingTime exists`

**Action:**
1. **24-Hour Before Meeting:**
   - Check if `reminder24hrSent` flag is false
   - If `NOW + 25 hours >= Meeting Booked Time`:
     - Send email: `googleSheetMeetingBookedReminder1`
     - Set `reminder24hrSent` flag to true
     - Log: "📧 24-hour reminder sent"

2. **1-Hour Before Meeting:**
   - Check if `reminder1hrSent` flag is false
   - If `NOW + 1 hour >= Meeting Booked Time`:
     - Send email: `googleSheetMeetingBookedReminder2`
     - Set `reminder1hrSent` flag to true
     - Log: "📧 1-hour reminder sent"

---

### **PHASE 5: No-Show Handling (Status = 'no_show')**

**Condition:** `status === 'no_show'`

**Action:**
1. **First Detection:**
   - If `No Show Time` is empty:
     - Update `No Show Time` → Current timestamp (NOW)
     - Update `Status` → `'no_show_reminder_sent1'`
     - Send email: `googleSheetNoShowReminder`
     - Log: "🚨 No-show detected - Reminder sent"

2. **After 24 Hours:**
   - Check if `(NOW - No Show Time) >= 24 hours`
   - If true:
     - Update `Status` → `'no_show_reminder_sent2'`
     - Send email: `googleSheetNoShowReminder` (second reminder)
     - Log: "🚨 24-hour no-show reminder sent"

3. **Check Calendar for Recovery:**
   - If email found in calendar AND status is `'no_show_reminder_sent1'` or `'no_show_reminder_sent2'`:
     - Update `Status` → `'meeting_booked'`
     - Update `Meeting Booked Time` → New meeting time from calendar
     - Clear `No Show Time` → Empty/null
     - Reset reminder flags to false
     - Send email: `googleSheetMeetingBookedReminder1`
     - Log: "✅ No-show email found in calendar - Status updated to meeting_booked"

---

## 📁 FILES TO BE MODIFIED

### **1. src/integrations/googleSheetSync.js** (MAIN FILE - 70% changes)
**Current Functions:**
- `getAuthClient()` - Keep as is
- `fetchGoogleSheetData()` - Keep as is
- `checkSheetEmailsInCalendar()` - REPLACE with new comprehensive logic

**New Functions to Add:**
- `handleGoogleSheetReminders()` - Main orchestration function
- `updateSheetRow()` - Helper to update specific rows
- `sendGoogleSheetEmail()` - Helper to send emails with proper payload
- `extractCalendarEmailsWithDetails()` - Extract emails + meeting times + links
- `checkAndUpdateStatus()` - Core logic for all 5 phases

**Changes:**
- Expand RANGE to include all 6 columns: `"Sheet1!A1:F"`
- Add tracking for reminder flags (in-memory or sheet-based)
- Add timestamp comparison logic for 24-hour intervals
- Add email sending integration

---

### **2. src/services/sendTemplate.js** (MINOR - 10% changes)
**New Functions to Add:**
- `sendGoogleSheetMeetingBookedReminder1(email, payload)` - Send reminder 1
- `sendGoogleSheetMeetingBookedReminder2(email, payload)` - Send reminder 2
- `sendGoogleSheetNoShowReminder(email, payload)` - Send no-show reminder
- `sendReconnectReminder1(email, payload)` - Send reconnect 1
- `sendReconnectReminder2(email, payload)` - Send reconnect 2

**Changes:**
- Create payload builder for Google Sheet data (different from MongoDB leads)
- Use existing `sendEmail()` function
- Map Google Sheet columns to email template variables

---

### **3. src/models/leadAutomationIndex.js** (MINOR - 5% changes)
**Changes:**
- Update `runGoogleSheetsAutomationTask()` to call new `handleGoogleSheetReminders()`
- Add logging for each phase

---

## 🔄 EXECUTION FLOW

```
runGoogleSheetsAutomationTask()
    ↓
handleGoogleSheetReminders()
    ├─ Fetch all Google Sheet data
    ├─ Fetch all Calendar events
    ├─ Extract calendar emails + details
    ├─ Loop through each sheet row:
    │   ├─ PHASE 1: Check 'new' status
    │   ├─ PHASE 2: Check 'reconnect_message1' (24hr check)
    │   ├─ PHASE 3: Check 'reconnect_message2'
    │   ├─ PHASE 4: Check 'meeting_booked' (reminder timing)
    │   └─ PHASE 5: Check 'no_show' (24hr check)
    ├─ Collect all row updates
    ├─ Update Google Sheet with all changes
    └─ Log completion
```

---

## 📧 EMAIL TEMPLATES USED

1. ✅ `reConnectReminder1Email` - Already created
2. ✅ `reConnectReminder2Email` - Already created
3. ✅ `googleSheetMeetingBookedReminder1` - Already created
4. ✅ `googleSheetMeetingBookedReminder2` - Already created
5. ✅ `googleSheetNoShowReminder` - Already created

---

## ⚠️ IMPORTANT CONSIDERATIONS

1. **Reminder Flags:** Need to track `reminder24hrSent` and `reminder1hrSent` per row
   - Option A: Store in Google Sheet (add 2 more columns)
   - Option B: Store in memory during execution (simpler, but resets on restart)
   - **RECOMMENDATION:** Option B for now (simpler)

2. **Timestamp Comparisons:** All times in UTC
   - Use `new Date()` for current time
   - Parse sheet timestamps carefully

3. **Calendar Sync Frequency:** Runs every 3 minutes (from cron)
   - Efficient for checking multiple phases

4. **Error Handling:** Graceful failures
   - If email send fails, don't update status
   - Log all errors clearly

---

## ✅ SUMMARY OF CHANGES

| File | Changes | Impact |
|------|---------|--------|
| `googleSheetSync.js` | Replace `checkSheetEmailsInCalendar()` + Add 4 new functions | HIGH |
| `sendTemplate.js` | Add 5 new email sending functions | MEDIUM |
| `leadAutomationIndex.js` | Update `runGoogleSheetsAutomationTask()` | LOW |
| `MailTemplates.js` | No changes (templates already exist) | NONE |

---

## 🚀 READY FOR IMPLEMENTATION?

**Please review and approve this plan before I proceed with coding!**

Questions to clarify:
1. Should reminder flags be stored in Google Sheet or in-memory?
2. Should we send both email AND WhatsApp for Google Sheet leads?
3. Any specific timezone for timestamp comparisons?

