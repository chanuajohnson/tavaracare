

## Add SOP Handbook + Daily Checklist to Professional Dashboard & Next Steps

### What You Want
1. **Two new cards** on the professional profile Admin Assistant tab: one for the **Nurse Handbook/SOP** PDF and one for the **Daily Checklist** PDF
2. **Always-visible line items** in the "Your Next Steps" panel (after "Screening Complete") linking to the SOP and Daily Checklist -- visible regardless of journey stage
3. **Interactive daily checklist UI** where nurses can check off items each shift, creating a documented daily log
4. **WhatsApp-sendable checklist summary** for shift handoff briefings
5. **Update the "Onboarding & Job Description" nudge** (not yet implemented) to include links to both documents

### Files to Create / Modify

#### 1. Copy uploaded PDFs into the project
- Copy `Tavara_Nurse_Handbook_Branded_1.pdf` to `public/documents/Tavara_Nurse_Handbook.pdf`
- Copy `Tavara_Daily_Checklist_Branded.pdf` to `public/documents/Tavara_Daily_Checklist.pdf`

#### 2. New component: `src/components/professional/DailyChecklist.tsx`
An interactive checklist UI mirroring the PDF structure with these sections:
- Start of Shift (6 items)
- Care Tasks (5 items)
- Emotional Support (4 items)
- Home Tasks (4 items)
- Monitoring (3 items)
- Communication (3 items)
- Documentation & Logging (5 items)
- End of Shift (4 items)

Features:
- Nurse name, client name, date, shift selector (Morning/Afternoon/Night)
- Checkboxes for each task with real-time state
- Notes/observations text area
- Time in/out fields
- **"Save Daily Log"** button that stores the checklist state to `daily_care_logs` table (new migration)
- **"Send Shift Summary via WhatsApp"** button that builds a text summary of checked/unchecked items and opens WhatsApp with the summary pre-filled

#### 3. New migration: `daily_care_logs` table
```sql
create table public.daily_care_logs (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references auth.users(id) not null,
  client_name text,
  shift_date date not null default current_date,
  shift_type text check (shift_type in ('morning', 'afternoon', 'night')),
  checklist_data jsonb not null default '{}',
  notes text,
  time_in text,
  time_out text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.daily_care_logs enable row level security;
create policy "Professionals manage own logs"
  on public.daily_care_logs for all
  to authenticated
  using (professional_id = auth.uid())
  with check (professional_id = auth.uid());
```

#### 4. Update: `src/components/professional/profile/AdminAssistantCard.tsx`
Add two new cards to the existing grid:
- **"Nurse Handbook & SOP"** card with a `BookOpen` icon and link to open/download the PDF
- **"Daily Care Checklist"** card with a `ClipboardCheck` icon that navigates to the interactive checklist (or opens it in a dialog)

#### 5. Update: `src/components/professional/EnhancedProfessionalNextStepsPanel.tsx`
Add two **always-visible** resource cards between the step list and the "Show All" button:
- A compact row with `BookOpen` icon: "Nurse Handbook & SOP" with a "View PDF" link
- A compact row with `ClipboardCheck` icon: "Daily Care Checklist" with a "Open Checklist" link
These render regardless of journey progress -- they appear for every professional.

#### 6. Update: `src/components/admin/UserNudgeTab.tsx`
Add the **"Onboarding & Job Description"** nudge card (previously planned, not yet built) below the "Screening Complete" card for professional users. The WhatsApp message includes:
- Starting rate ($35/hr Standard, $40 Full Service, $45+ Premium)
- Team structure (main nurse + rotation + fill-ins)
- Probationary period
- Daily log requirements (written, via Tavara platform)
- WhatsApp group expectations
- Links to the Nurse Handbook and Daily Checklist PDFs on tavara.care
- Full job description from GAPP standards

### Technical Summary

| Change | File | Type |
|--------|------|------|
| Copy 2 PDFs | `public/documents/` | Asset |
| Daily checklist component | `src/components/professional/DailyChecklist.tsx` | New |
| Daily care logs table | Migration | New |
| Admin assistant cards | `AdminAssistantCard.tsx` | Edit |
| Always-visible resource links | `EnhancedProfessionalNextStepsPanel.tsx` | Edit |
| Onboarding nudge | `UserNudgeTab.tsx` | Edit |

