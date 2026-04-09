

## Fix Daily Checklist: DB Constraint, Persistence, and PDF Logo

### Problems Identified

1. **Save error ("daily_care_logs_shift_type_check")**: The database `shift_type` column has a CHECK constraint allowing only `'morning'`, `'afternoon'`, `'night'`. But the code sends `'scheduled'` or `'other'`. All three buttons (Save, Save & Send, Send) are affected since Save & Send calls Save first.

2. **No persistence across page refresh**: All checklist state (checked items, client, shift, times, notes) is in React `useState` -- lost on refresh.

3. **PDF logo**: The Nurse Handbook PDF currently has a text-based or low-quality logo. The user wants the proper `.png` Tavara logo. This requires regenerating the PDF, which is a separate artifact task outside the codebase.

### Plan

#### 1. Migration: Update shift_type constraint
Create a new migration to drop the old CHECK constraint and add an expanded one that includes `'scheduled'`, `'other'`, and the original values:

```sql
ALTER TABLE public.daily_care_logs DROP CONSTRAINT daily_care_logs_shift_type_check;
ALTER TABLE public.daily_care_logs ADD CONSTRAINT daily_care_logs_shift_type_check 
  CHECK (shift_type IN ('morning', 'afternoon', 'night', 'scheduled', 'other'));
```

#### 2. Add localStorage persistence to DailyChecklist.tsx
- Create a `STORAGE_KEY` constant (e.g., `'tavara_daily_checklist_draft'`)
- On every state change (checkedItems, clientName, selectedShiftId, shiftDate, timeIn, timeOut, notes, customClientName), debounce-save to localStorage
- On mount, restore state from localStorage if a draft exists for the current date
- On successful save to database, clear the localStorage draft
- This ensures nurses can close/refresh the browser and continue where they left off

#### 3. Regenerate Nurse Handbook PDF with .png logo
- Use the uploaded `TAVARACARElogo.png` to regenerate the PDF with proper branding
- Copy the new PDF to `public/documents/Tavara_Nurse_Handbook.pdf`

### Files Changed

| File | Change |
|------|--------|
| New migration | Update `shift_type` CHECK constraint |
| `src/components/professional/DailyChecklist.tsx` | Add localStorage save/restore for draft persistence; clear on successful DB save |
| `public/documents/Tavara_Nurse_Handbook.pdf` | Regenerate with .png logo |

