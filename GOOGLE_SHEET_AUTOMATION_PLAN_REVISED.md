# 📋 REVISED PLAN: Google Sheet Automation with Reminders & Triggers

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

## 🎯 AUTOMATION FLOW & LOGIC (REVISED)

### **PHASE 1: Initial Status Check (Status = 'new' or empty)**

**Condition:** `status === 'new' OR status === '' OR status === null`

**Action:**
1. Check if email exists in Google Calendar events
2. **IF email found in calendar:**
   - Update `Status` → `'meeting_booked'`
   - Update `Meeting Booked Time` → Meeting start time from calendar
   - ❌ **NO EMAIL SENT** (No reminder, no WhatsApp)
   - Log: "✅ Email found in calendar - Status updated to meeting_booked"

3. **IF email NOT found in calendar:**
   - Update `Status` → `'reconnect_SMS_message_1'`
   - Update `Reconnect Message Time` → Current timestamp (NOW)
   - ✅ Send email: `reConnectReminder1Email`
   - Log: "⏰ Email not in calendar - Status updated to reconnect_SMS_message_1, reminder sent"

---

### **PHASE 2: Reconnect SMS Message 1 Follow-up (Status = 'reconnect_SMS_message_1')**

**Condition:** `status === 'reconnect_SMS_message_1'`

**Action:**
1. Check if email exists in Google Calendar events
2. **IF email found in calendar:**
   - Update `Status` → `'meeting_booked'`
   - Update `Meeting Booked Time` → Meeting start time from calendar
   - Clear `Reconnect Message Time` → Empty/null
   - ❌ **NO EMAIL SENT** (No reminder)
   - Log: "✅ Email found in calendar after reconnect_SMS_message_1 - Status updated to meeting_booked"

3. **IF email NOT found in calendar:**
   - Update `Status` → `'reconnect_SMS_message_2'`
   - Keep `Reconnect Message Time` → Same (don't update)
   - ✅ Send email: `reConnectReminder2Email`
   - Log: "⏰ Email still not in calendar - Status updated to reconnect_SMS_message_2, reminder sent"

---

### **PHASE 3: Reconnect SMS Message 2 (Ongoing)**

**Condition:** `status === 'reconnect_SMS_message_2'`

**Action:**
1. Check if email exists in Google Calendar events
2. **IF email found in calendar:**
   - Update `Status` → `'meeting_booked'`
   - Update `Meeting Booked Time` → Meeting start time from calendar
   - Clear `Reconnect Message Time` → Empty/null
   - ❌ **NO EMAIL SENT**
   - Log: "✅ Email found in calendar after reconnect_SMS_message_2 - Status updated to meeting_booked"

3. **IF email NOT found in calendar:**
   - ❌ **NO ACTION** (Wait for manual intervention)
   - Log: "⏳ Email still not in calendar - Status remains reconnect_SMS_message_2"

---

### **PHASE 4: Meeting Booked Reminders (Status = 'meeting_booked')**

**Condition:** `status === 'meeting_booked' AND Meeting Booked Time exists`

**Action:**

**Step 1: Check 24-Hour Before Meeting**
- Calculate: `timeUntilMeeting = Meeting Booked Time - NOW`
- If `timeUntilMeeting <= 25 hours AND timeUntilMeeting > 1 hour`:
  - Update `Status` → `'meeting_booked_reminder_24hour_message_sent'`
  - ✅ Send email: `googleSheetMeetingBookedReminder1`
  - ✅ Send WhatsApp message (using `handleRemindersAndTriggers` pattern)
  - Log: "📧 24-hour reminder sent - Status updated to meeting_booked_reminder_24hour_message_sent"

**Step 2: Check 1-Hour Before Meeting**
- If `status === 'meeting_booked_reminder_24hour_message_sent'`:
  - Calculate: `timeUntilMeeting = Meeting Booked Time - NOW`
  - If `timeUntilMeeting <= 1 hour`:
    - Update `Status` → `'meeting_booked_reminder_1hour_message_sent'`
    - ✅ Send email: `googleSheetMeetingBookedReminder2`
    - ✅ Send WhatsApp message (using `handleRemindersAndTriggers` pattern)
    - Log: "📧 1-hour reminder sent - Status updated to meeting_booked_reminder_1hour_message_sent"

---

### **PHASE 5: No-Show Handling (Status = 'no_show')**

**Condition:** `status === 'no_show'`

**Action:**

**Step 1: First Detection of No-Show**
- If `No Show Time` is empty/null:
  - Update `No Show Time` → Current timestamp (NOW)
  - ❌ **NO EMAIL SENT** (Just set the timestamp)
  - Log: "🚨 No-show detected - No Show Time set, waiting 24 hours"

**Step 2: After 24 Hours**
- Check if `(NOW - No Show Time) >= 24 hours`:
  - If true:
    - Update `Status` → `'no_show_final_reminder_sent'` (or flag = 1)
    - ✅ Send email: `googleSheetNoShowReminder`
    - Log: "🚨 24-hour no-show reminder sent - Status updated to no_show_final_reminder_sent"

**Step 3: Check Calendar for Recovery (Any Time)**
- If email found in Google Calendar AND status is `'no_show'` OR `'no_show_final_reminder_sent'`:
  - Update `Status` → `'meeting_booked'`
  - Update `Meeting Booked Time` → New meeting time from calendar
  - Clear `No Show Time` → Empty/null
  - ❌ **NO EMAIL SENT** (Just update status)
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
- `extractCalendarEmailsWithDetails()` - Extract emails + meeting times + links
- `checkAndUpdateStatus()` - Core logic for all 5 phases
- `updateGoogleSheetRows()` - Global batch update function for all rows
- `buildGoogleSheetPayload()` - Build payload from Google Sheet row data

**Changes:**
- Expand RANGE to include all 6 columns: `"Sheet1!A1:F"`
- Add timestamp comparison logic for 24-hour intervals
- Add email + WhatsApp sending integration
- Import `sendTemplate` module for email/WhatsApp sending
- Use `handleRemindersAndTriggers` pattern for WhatsApp messages

---

### **2. src/services/sendTemplate.js** (MEDIUM - 20% changes)
**New Functions to Add:**
- `sendGoogleSheetMeetingBookedReminder1(sheetRow, payload)` - Send 24hr reminder + WhatsApp
- `sendGoogleSheetMeetingBookedReminder2(sheetRow, payload)` - Send 1hr reminder + WhatsApp
- `sendGoogleSheetNoShowReminder(sheetRow, payload)` - Send no-show reminder + WhatsApp
- `sendGoogleSheetReconnectReminder1(sheetRow, payload)` - Send reconnect 1 + WhatsApp
- `sendGoogleSheetReconnectReminder2(sheetRow, payload)` - Send reconnect 2 + WhatsApp

**Changes:**
- Create payload builder for Google Sheet data (similar to `buildPayload()` but for sheet rows)
- Use existing `sendEmail()` function
- Use existing `sendWhatsApp()` function (reuse from `handleRemindersAndTriggers` pattern)
- Map Google Sheet columns to email template variables
- Map Google Sheet data to WhatsApp template variables

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
    │   ├─ PHASE 1: Check 'new' status → Update to meeting_booked OR reconnect_SMS_message_1
    │   ├─ PHASE 2: Check 'reconnect_SMS_message_1' → Update to meeting_booked OR reconnect_SMS_message_2
    │   ├─ PHASE 3: Check 'reconnect_SMS_message_2' → Update to meeting_booked OR wait
    │   ├─ PHASE 4: Check 'meeting_booked' → Send 24hr reminder OR 1hr reminder
    │   └─ PHASE 5: Check 'no_show' → Set no_show_time OR send reminder after 24hrs OR recover from calendar
    ├─ Collect all row updates
    ├─ Update Google Sheet with all changes
    └─ Log completion
```

---

## 📧 EMAIL TEMPLATES USED

1. ✅ `reConnectReminder1Email` - Sent in Phase 1 (if no calendar match)
2. ✅ `reConnectReminder2Email` - Sent in Phase 2 (if still no calendar match)
3. ✅ `googleSheetMeetingBookedReminder1` - Sent in Phase 4 (24-hour before)
4. ✅ `googleSheetMeetingBookedReminder2` - Sent in Phase 4 (1-hour before)
5. ✅ `googleSheetNoShowReminder` - Sent in Phase 5 (after 24 hours of no-show)

---

## 📱 WHATSAPP INTEGRATION

**Pattern:** Reuse `handleRemindersAndTriggers` function pattern from `src/services/sendTemplate.js`

**WhatsApp Messages Sent With:**
1. **Phase 1 - Reconnect Message 1:** `reConnectReminder1Email` + WhatsApp template
2. **Phase 2 - Reconnect Message 2:** `reConnectReminder2Email` + WhatsApp template
3. **Phase 4 - 24-Hour Reminder:** `googleSheetMeetingBookedReminder1` + WhatsApp template
4. **Phase 4 - 1-Hour Reminder:** `googleSheetMeetingBookedReminder2` + WhatsApp template
5. **Phase 5 - No-Show Reminder:** `googleSheetNoShowReminder` + WhatsApp template

**Implementation:**
- Use existing `sendWhatsApp()` function from `sendTemplate.js`
- Map Google Sheet data to WhatsApp payload (name, date, time, meeting link)
- Use appropriate WhatsApp template names (similar to existing patterns)
- Handle WhatsApp errors gracefully (don't fail email if WhatsApp fails)

---

## 🔄 GLOBAL SHEET UPDATE STRATEGY

**Approach:** Batch update all rows at the end of processing

**Function:** `updateGoogleSheetRows(updatedRows)`
- Collects all row changes during processing
- Updates Google Sheet once at the end (efficient)
- Logs all changes made
- Handles errors gracefully

**Benefits:**
- Single API call to Google Sheets (efficient)
- Atomic update (all or nothing)
- Easier to track changes
- Better error handling

---

## ⚠️ KEY DIFFERENCES FROM ORIGINAL PLAN

| Phase | Original | Revised |
|-------|----------|---------|
| Phase 1 | Send reminder if no calendar match | ✅ Send email + WhatsApp if no calendar match |
| Phase 1 | Send reminder if calendar match | ❌ NO EMAIL/WHATSAPP if calendar match |
| Phase 2 | Send reminder if calendar match | ❌ NO EMAIL/WHATSAPP if calendar match |
| Phase 4 | Send both 24hr + 1hr reminders | ✅ Send 24hr + WhatsApp, then 1hr + WhatsApp |
| Phase 4 | Status stays 'meeting_booked' | ✅ Status: meeting_booked → meeting_booked_reminder_24hour_message_sent → meeting_booked_reminder_1hour_message_sent |
| Phase 5 | Send reminder immediately | ❌ Wait 24 hours, then send reminder + WhatsApp |
| Phase 5 | Send multiple reminders | ✅ Send only 1 reminder after 24 hours |

---

## ✅ SUMMARY OF CHANGES

| File | Changes | Impact |
|------|---------|--------|
| `googleSheetSync.js` | Replace `checkSheetEmailsInCalendar()` + Add 4 new functions | **HIGH** |
| `sendTemplate.js` | Add 5 new email+WhatsApp sending functions | **MEDIUM** |
| `leadAutomationIndex.js` | Update `runGoogleSheetsAutomationTask()` | **LOW** |
| `MailTemplates.js` | No changes (templates already exist) | **NONE** |

---

## 📋 COMPLETE FUNCTION LIST

### **googleSheetSync.js Functions:**
1. `getAuthClient()` - Keep as is
2. `fetchGoogleSheetData()` - Keep as is
3. `handleGoogleSheetReminders()` - Main orchestration ⭐ NEW
4. `extractCalendarEmailsWithDetails()` - Extract calendar data ⭐ NEW
5. `checkAndUpdateStatus()` - Core logic for all 5 phases ⭐ NEW
6. `updateGoogleSheetRows()` - Global batch update ⭐ NEW
7. `buildGoogleSheetPayload()` - Build payload from row ⭐ NEW

### **sendTemplate.js Functions:**
1. `sendGoogleSheetMeetingBookedReminder1()` - 24hr + WhatsApp ⭐ NEW
2. `sendGoogleSheetMeetingBookedReminder2()` - 1hr + WhatsApp ⭐ NEW
3. `sendGoogleSheetNoShowReminder()` - No-show + WhatsApp ⭐ NEW
4. `sendGoogleSheetReconnectReminder1()` - Reconnect 1 + WhatsApp ⭐ NEW
5. `sendGoogleSheetReconnectReminder2()` - Reconnect 2 + WhatsApp ⭐ NEW

---

## 🚀 READY FOR IMPLEMENTATION?

**Please review and confirm this FINAL revised plan is correct before I proceed!**

Confirm:
1. ✅ 1-Hour status is now `'meeting_booked_reminder_1hour_message_sent'`?
2. ✅ WhatsApp messages sent with each email (using `handleRemindersAndTriggers` pattern)?
3. ✅ Global batch update strategy for Google Sheet?
4. ✅ All 5 new functions in sendTemplate.js for email + WhatsApp?

If all correct, I will proceed with implementation! 🚀

