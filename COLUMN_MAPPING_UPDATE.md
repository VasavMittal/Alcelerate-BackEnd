# 📊 GOOGLE SHEET COLUMN MAPPING UPDATE

## 🔄 NEW COLUMN STRUCTURE

A new column **"WhatsApp Contact No"** has been added after **Status**.

### **Old Structure (6 columns)**
| Index | Column | Header |
|-------|--------|--------|
| 0 | A | Full Name |
| 1 | B | Email |
| 2 | C | Status |
| 3 | D | Meeting Booked Time |
| 4 | E | Reconnect Message Time |
| 5 | F | No Show Time |

### **New Structure (7 columns)**
| Index | Column | Header |
|-------|--------|--------|
| 0 | A | Full Name |
| 1 | B | Email |
| 2 | C | Status |
| **3** | **D** | **WhatsApp Contact No** ⭐ NEW |
| **4** | **E** | **Meeting Booked Time** (was D) |
| **5** | **F** | **Reconnect Message Time** (was E) |
| **6** | **G** | **No Show Time** (was F) |

---

## 📝 COLUMN INDEX CHANGES

### **Mapping: Old Index → New Index**

| Data | Old Index | New Index | Change |
|------|-----------|-----------|--------|
| Full Name | 0 | 0 | ✅ No change |
| Email | 1 | 1 | ✅ No change |
| Status | 2 | 2 | ✅ No change |
| WhatsApp Contact No | - | **3** | ⭐ NEW |
| Meeting Booked Time | 3 | **4** | +1 |
| Reconnect Message Time | 4 | **5** | +1 |
| No Show Time | 5 | **6** | +1 |

---

## 🔧 FILES TO UPDATE

### **1. src/integrations/googleSheetSync.js**

**Changes needed:**
- Update RANGE from `"Sheet1!A1:F"` to `"Sheet1!A1:G"`
- Update `buildGoogleSheetPayload()` function
- Update all row index references:
  - `row[3]` → `row[4]` (Meeting Booked Time)
  - `row[4]` → `row[5]` (Reconnect Message Time)
  - `row[5]` → `row[6]` (No Show Time)

**Locations:**
- Line 21: RANGE constant
- Line 147-156: buildGoogleSheetPayload() function
- Line 185: PHASE 1 - Meeting Booked Time
- Line 189: PHASE 1 - Reconnect Message Time
- Line 200-201: PHASE 2 - Meeting Booked Time & Reconnect Time
- Line 215-216: PHASE 3 - Meeting Booked Time & Reconnect Time
- Line 225: PHASE 4 - Meeting Booked Time check
- Line 226: PHASE 4 - Meeting Booked Time parse
- Line 253: PHASE 5 - No Show Time clear
- Line 254: PHASE 5 - No Show Time check
- Line 257: PHASE 5 - No Show Time set
- Line 260: PHASE 5 - No Show Time parse

### **2. src/services/sendTemplate.js**

**Changes needed:**
- Update `buildGoogleSheetPayload()` function (if exists)
- Update all references to WhatsApp contact number
- Update payload building to use correct indices

**Locations:**
- Check for any row index references

### **3. src/models/leadAutomationIndex.js**

**Changes needed:**
- Update RANGE if referenced
- Update any row index references

---

## 📋 SUMMARY OF CHANGES

**Total files to update:** 2-3 files

**Total index changes:**
- Meeting Booked Time: 3 → 4 (appears ~6 times)
- Reconnect Message Time: 4 → 5 (appears ~4 times)
- No Show Time: 5 → 6 (appears ~4 times)
- RANGE: "Sheet1!A1:F" → "Sheet1!A1:G" (appears 1 time)

**Total changes:** ~15 locations

---

## ✅ VERIFICATION CHECKLIST

After updates:
- [ ] RANGE updated to include column G
- [ ] buildGoogleSheetPayload() uses correct indices
- [ ] PHASE 1 uses correct indices
- [ ] PHASE 2 uses correct indices
- [ ] PHASE 3 uses correct indices
- [ ] PHASE 4 uses correct indices
- [ ] PHASE 5 uses correct indices
- [ ] All timestamps use correct indices
- [ ] All status updates use correct indices
- [ ] sendTemplate functions receive correct row data

---

## 🚀 NEXT STEPS

1. Update src/integrations/googleSheetSync.js
2. Update src/services/sendTemplate.js (if needed)
3. Update src/models/leadAutomationIndex.js (if needed)
4. Test with new Google Sheet structure
5. Verify all reminders send correctly

