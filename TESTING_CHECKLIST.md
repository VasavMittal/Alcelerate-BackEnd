# ✅ TESTING CHECKLIST: Google Sheet Automation

## 🔧 PRE-DEPLOYMENT SETUP

### Environment Variables
- [ ] `GOOGLE_SPREADSHEET_ID` is set
- [ ] `GOOGLE_SHEET_RANGE` is set (or defaults to "Sheet1!A1:F")
- [ ] `GOOGLE_KEY_FILE` contains valid service account JSON
- [ ] `WHATS_APP_ACCESS_TOKEN` is configured
- [ ] Email SMTP settings are configured

### Google Sheet Setup
- [ ] Sheet has 6 columns: A-F
- [ ] Column A: Full Name
- [ ] Column B: Email
- [ ] Column C: Status
- [ ] Column D: Meeting Booked Time
- [ ] Column E: Reconnect Message Time
- [ ] Column F: No Show Time
- [ ] Header row exists (row 1)

### Email Templates
- [ ] `reConnectReminder1Email` exists in MailTemplates.js
- [ ] `reConnectReminder2Email` exists in MailTemplates.js
- [ ] `googleSheetMeetingBookedReminder1` exists in MailTemplates.js
- [ ] `googleSheetMeetingBookedReminder2` exists in MailTemplates.js
- [ ] `googleSheetNoShowReminder` exists in MailTemplates.js

### Calendar Setup
- [ ] Google Calendar has test events
- [ ] Test events have attendees with email addresses
- [ ] Calendar API is accessible

---

## 🧪 UNIT TESTS

### Test 1: PHASE 1 - New Email in Calendar
**Setup:**
- Add row: `["John Doe", "john@example.com", "new", "", "", ""]`
- Add calendar event with attendee: john@example.com

**Expected Result:**
- Status → `meeting_booked`
- Meeting Booked Time → Set to calendar event time
- NO email sent
- Log: `✅ PHASE 1: Email found in calendar`

**Verification:**
- [ ] Status updated correctly
- [ ] Meeting time populated
- [ ] No email in inbox
- [ ] Log message appears

---

### Test 2: PHASE 1 - New Email NOT in Calendar
**Setup:**
- Add row: `["Jane Doe", "jane@example.com", "new", "", "", ""]`
- NO calendar event for jane@example.com

**Expected Result:**
- Status → `reconnect_SMS_message_1`
- Reconnect Message Time → Set to NOW
- Email sent: `reConnectReminder1Email`
- WhatsApp sent: `reminder_to_book_1_v2`
- Log: `⏰ PHASE 1: Email NOT in calendar`

**Verification:**
- [ ] Status updated correctly
- [ ] Reconnect time set
- [ ] Email received
- [ ] WhatsApp sent
- [ ] Log message appears

---

### Test 3: PHASE 2 - Reconnect 1 Email Found in Calendar
**Setup:**
- Add row: `["Bob Smith", "bob@example.com", "reconnect_SMS_message_1", "", "2024-12-20T10:00:00Z", ""]`
- Add calendar event with attendee: bob@example.com

**Expected Result:**
- Status → `meeting_booked`
- Meeting Booked Time → Set to calendar event time
- Reconnect Message Time → Cleared
- NO email sent
- Log: `✅ PHASE 2: Email found in calendar`

**Verification:**
- [ ] Status updated correctly
- [ ] Meeting time populated
- [ ] Reconnect time cleared
- [ ] No email sent
- [ ] Log message appears

---

### Test 4: PHASE 2 - Reconnect 1 Email NOT in Calendar
**Setup:**
- Add row: `["Alice Brown", "alice@example.com", "reconnect_SMS_message_1", "", "2024-12-20T10:00:00Z", ""]`
- NO calendar event for alice@example.com

**Expected Result:**
- Status → `reconnect_SMS_message_2`
- Email sent: `reConnectReminder2Email`
- WhatsApp sent: `reminder_to_book_2_v2`
- Log: `⏰ PHASE 2: Email NOT in calendar`

**Verification:**
- [ ] Status updated correctly
- [ ] Email received
- [ ] WhatsApp sent
- [ ] Log message appears

---

### Test 5: PHASE 4 - 24-Hour Reminder
**Setup:**
- Add row: `["Charlie Davis", "charlie@example.com", "meeting_booked", "2024-12-25T14:30:00Z", "", ""]`
- Current time: 2024-12-24T14:00:00Z (24 hours before)

**Expected Result:**
- Status → `meeting_booked_reminder_24hour_message_sent`
- Email sent: `googleSheetMeetingBookedReminder1`
- WhatsApp sent: `meeting_reminder_24_v2`
- Log: `📧 PHASE 4 (24hr): Email - Sending 24-hour reminder`

**Verification:**
- [ ] Status updated correctly
- [ ] Email received
- [ ] WhatsApp sent
- [ ] Log message appears

---

### Test 6: PHASE 4 - 1-Hour Reminder
**Setup:**
- Add row: `["Diana Evans", "diana@example.com", "meeting_booked_reminder_24hour_message_sent", "2024-12-25T14:30:00Z", "", ""]`
- Current time: 2024-12-25T13:30:00Z (1 hour before)

**Expected Result:**
- Status → `meeting_booked_reminder_1hour_message_sent`
- Email sent: `googleSheetMeetingBookedReminder2`
- WhatsApp sent: `_meeting_reminder_one_hour_before_v2`
- Log: `📧 PHASE 4 (1hr): Email - Sending 1-hour reminder`

**Verification:**
- [ ] Status updated correctly
- [ ] Email received
- [ ] WhatsApp sent
- [ ] Log message appears

---

### Test 7: PHASE 5 - No-Show Detection
**Setup:**
- Add row: `["Edward Frank", "edward@example.com", "no_show", "", "", ""]`

**Expected Result:**
- No Show Time → Set to NOW
- Status → Remains `no_show`
- NO email sent
- Log: `🚨 PHASE 5 (Detection): Email - No Show Time set`

**Verification:**
- [ ] No Show Time populated
- [ ] Status unchanged
- [ ] No email sent
- [ ] Log message appears

---

### Test 8: PHASE 5 - No-Show Reminder (24 Hours)
**Setup:**
- Add row: `["Fiona Green", "fiona@example.com", "no_show", "", "", "2024-12-20T10:00:00Z"]`
- Current time: 2024-12-21T10:00:00Z (24 hours after)

**Expected Result:**
- Status → `no_show_final_reminder_sent`
- Email sent: `googleSheetNoShowReminder`
- WhatsApp sent: `meeting_not_attend_reminder_1_v2`
- Log: `🚨 PHASE 5 (24hr): Email - Sending no-show reminder`

**Verification:**
- [ ] Status updated correctly
- [ ] Email received
- [ ] WhatsApp sent
- [ ] Log message appears

---

### Test 9: PHASE 5 - No-Show Recovery
**Setup:**
- Add row: `["George Harris", "george@example.com", "no_show", "", "", "2024-12-20T10:00:00Z"]`
- Add calendar event with attendee: george@example.com

**Expected Result:**
- Status → `meeting_booked`
- Meeting Booked Time → Set to calendar event time
- No Show Time → Cleared
- NO email sent
- Log: `✅ PHASE 5 (Recovery): Email found in calendar`

**Verification:**
- [ ] Status updated correctly
- [ ] Meeting time populated
- [ ] No Show Time cleared
- [ ] No email sent
- [ ] Log message appears

---

## 🔍 INTEGRATION TESTS

### Test 10: Batch Update
**Setup:**
- Add 5 rows with different statuses

**Expected Result:**
- All rows processed
- Single batch update to Google Sheet
- All changes reflected in sheet
- Log: `📤 Updating Google Sheet with all changes...`

**Verification:**
- [ ] All rows updated
- [ ] Sheet reflects changes
- [ ] Single API call made
- [ ] Log message appears

---

### Test 11: Error Handling
**Setup:**
- Invalid email format
- Missing calendar data
- Network error

**Expected Result:**
- Errors logged with [GOOGLE-SHEET] prefix
- Processing continues
- No crashes

**Verification:**
- [ ] Errors logged
- [ ] Processing continues
- [ ] No exceptions thrown

---

## 📊 MONITORING

### Logs to Check
```
[GOOGLE-SHEET] ▶️  Starting Google Sheet reminders & triggers...
[GOOGLE-SHEET] 📅 Found X unique emails in calendar events
[GOOGLE-SHEET] ✅ PHASE X: ...
[GOOGLE-SHEET] 📧 PHASE X: ...
[GOOGLE-SHEET] 🚨 PHASE X: ...
[GOOGLE-SHEET] 📤 Updating Google Sheet with all changes...
[GOOGLE-SHEET] ✅ Google Sheet updated successfully
[GOOGLE-SHEET] ✅ All reminders & triggers completed
```

### Email Verification
- [ ] Emails received in inbox
- [ ] Subject lines correct
- [ ] Content matches templates
- [ ] Timestamps accurate

### WhatsApp Verification
- [ ] WhatsApp messages received
- [ ] Template names correct
- [ ] Parameters passed correctly

---

## ✅ FINAL CHECKLIST

- [ ] All 9 unit tests passed
- [ ] Integration tests passed
- [ ] Logs show correct messages
- [ ] Emails received correctly
- [ ] WhatsApp messages sent
- [ ] Google Sheet updated
- [ ] No errors in console
- [ ] Performance acceptable
- [ ] Ready for production

---

## 🚀 DEPLOYMENT

Once all tests pass:
1. [ ] Commit code changes
2. [ ] Deploy to production
3. [ ] Monitor logs for 24 hours
4. [ ] Verify reminders are sent
5. [ ] Check Google Sheet updates

Good luck! 🎉

