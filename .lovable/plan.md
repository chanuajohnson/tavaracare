

## Edit & Resubmit Daily Care Logs (No Duplicates)

### What Changes

#### 1. Load Existing Log on Open
When the checklist opens (or when client + date changes), query `daily_care_logs` for an existing record matching `professional_id + client_name + shift_date`. If found:
- Pre-populate all checklist items from `checklist_data` JSONB
- Pre-fill notes, time_in, time_out, shift_type
- Store the existing log `id` in state (`existingLogId`)
- Show a badge: "Editing log from [date]" so the nurse knows this was previously submitted

#### 2. Upsert Instead of Insert
Change `handleSave` logic:
- If `existingLogId` exists → use `.update()` on that row instead of `.insert()`
- If no existing log → use `.insert()` as before
- This prevents duplicate logs for the same date/client
- Button label changes to "Update Daily Log" when editing an existing record

#### 3. Schedule View Integration
In the `ProfessionalCalendar.tsx` shift list for each date, add a visual indicator (small checkmark badge) if a `daily_care_logs` record exists for that date. Add a "View/Edit Checklist" button on dates that have a log, which opens the DailyChecklist dialog pre-populated with that log's data.

#### 4. Checklist Data Restoration Logic
The `checklist_data` JSONB is stored as `{ "Section Title": [{ task, completed }] }`. On load, map this back to the `checkedItems` record by matching section titles and item indices from `CHECKLIST_SECTIONS`.

### Current DB State
There are already 2 duplicate logs for April 9 (one with shift_type `morning`, one `scheduled`). The migration should clean this up or the UI should handle multiple existing logs gracefully (use the most recent one).

### Files Modified

| File | Change |
|------|--------|
| `src/components/professional/DailyChecklist.tsx` | Add existing log fetch, upsert logic, edit mode indicator |
| `src/components/professional/ProfessionalCalendar.tsx` | Add log-exists indicator per date, "View/Edit Checklist" button |

### Technical Details

**Fetching existing log** (in DailyChecklist, triggered by client + date change):
```sql
SELECT * FROM daily_care_logs 
WHERE professional_id = ? AND client_name = ? AND shift_date = ?
ORDER BY created_at DESC LIMIT 1
```

**Restoring checkedItems from JSONB**:
```ts
const restored: Record<string, boolean> = {};
CHECKLIST_SECTIONS.forEach((section, sIdx) => {
  const saved = checklistData[section.title];
  if (saved) {
    saved.forEach((item, iIdx) => {
      restored[`${sIdx}-${iIdx}`] = item.completed;
    });
  }
});
```

**Save logic change**:
- `existingLogId` set → `supabase.from('daily_care_logs').update({...}).eq('id', existingLogId)`
- No `existingLogId` → `supabase.from('daily_care_logs').insert({...})`
- Toast says "Log updated" vs "Log saved" accordingly

**Calendar integration**:
- Fetch `daily_care_logs` for the visible month range alongside shifts
- On dates with logs, show a small clipboard icon
- Clicking opens the DailyChecklist dialog with log data pre-loaded via props or URL params

