

## Comprehensive Tavara Feature Audit and Care Billing Document System

### Part 1: Complete Feature Inventory by Tier

Based on full codebase analysis, here is every feature currently built and functional in Tavara, organized by tier:

```text
+------------------------------------------------------------------+
| FAMILY BASIC (FREE)                                              |
+------------------------------------------------------------------+
| BUILT & WORKING:                                                 |
|  - Account creation & role-based auth                            |
|  - Family registration with care needs, schedule, budget prefs   |
|  - Complete family profile management                            |
|  - Care Needs Assessment form                                    |
|  - Legacy Story ("Tell Their Story") for care recipients         |
|  - Instant caregiver matching (algorithm-based)                  |
|  - Caregiver profile viewing & comparison                        |
|  - Caregiver chat (text messaging)                               |
|  - Medication management & scheduling (per care plan)            |
|  - Meal planning & grocery lists (per care plan)                 |
|  - Care plan creation & management                               |
|  - Journey progress visualization (12+ step tracker)             |
|  - Visit scheduling (Tavara site visit)                          |
|  - Scheduling status banner                                      |
|  - Feature voting / roadmap participation                        |
|  - Onboarding checklist (read-only family view)                  |
|  - Rate tier reference card (viewable)                           |
|  - Community & email support                                     |
|  - Mobile-responsive dashboard                                   |
|                                                                  |
| JOURNEY STEPS (tracked):                                         |
|  1. Create account                                               |
|  2. Complete registration                                        |
|  5. Initial care assessment                                      |
|  6. Legacy Story                                                 |
|  7. See caregiver matches                                        |
|  8. Set up medication management                                 |
|  9. Set up meal management                                       |
| 10. Schedule Tavara visit                                        |
| 12. Schedule trial day (future)                                  |
| 13. Pay for trial day (future)                                   |
| 14. Begin trial (future)                                         |
| 15. Rate & choose path (future)                                  |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
| FAMILY CARE ($199.99/week or $699.99/month)                      |
+------------------------------------------------------------------+
| Everything in Basic, PLUS:                                       |
|  - Dedicated care coordinator                                    |
|  - Instant video calls with caregivers (30-min sessions)         |
|  - Skip text chat phase entirely                                 |
|  - Weekly/monthly billing management                             |
|  - NIS coverage for assigned nurse (mandatory local compliance)  |
|  - Caregiver replacement if sick (continuity guarantee)          |
|  - Care needs change management (basic)                          |
|  - Onboarding with admin notes & next steps                      |
|                                                                  |
| BUSINESS CONTEXT:                                                |
|  $199.99/week = $5/hr platform fee x 40hr work week              |
|  Added to nurse base rate (e.g. $35/hr + $5/hr = $40/hr total)  |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
| FAMILY PREMIUM ($399.99/mo or $1,099.99/mo)                      |
+------------------------------------------------------------------+
| Everything in Care, PLUS:                                        |
|  - Priority caregiver matching                                   |
|  - Extended video sessions                                       |
|  - Advanced care plan management                                 |
|  - Priority support & escalation                                 |
|  - Custom care team coordination                                 |
|  - Detailed care analytics & reports                             |
|  - Multi-caregiver scheduling                                    |
|  - 24/7 on-call availability                                     |
|  - Care escalation protocols (rate changes, condition changes)   |
|  - Disease progression support                                   |
|  - Multi-specialist coordination                                 |
+------------------------------------------------------------------+
```

### Part 2: Onboarding Notes Visibility -- CONFIRMED WORKING

The family onboarding checklist page (`/family/onboarding-checklist`) already renders `OnboardingNotesCard` **without** a `filterAssignee` prop, meaning ALL notes (admin, family, caregiver) are shown to the logged-in family. This is already built and working per the memory note. No changes needed here.

### Part 3: Care Billing Document System (Quote/Invoice/Receipt)

This is the main implementation work. Build a client-side PDF generation system using `jspdf` + `html2canvas` for Tavara-branded billing documents.

**Dependencies to install**: `jspdf`, `html2canvas`

**New files to create**:

1. **`src/utils/numberToWords.ts`** -- Convert TTD amounts to words (e.g., "One Thousand Four Hundred Trinidad & Tobago Dollars Only")

2. **`src/utils/documentNumbering.ts`** -- Sequential document numbering using care plan count (QUOTE-XXX, INV-XXX, RECEIPT-XXX)

3. **`src/services/care-plans/invoiceService.ts`** -- Main service with three functions:
   - `generateQuotePDF(carePlanData)` -- Generates quote with:
     - Tavara logo and branding (purple/teal colors)
     - "QUOTE" header with sequential number
     - Bill To section (family name, phone, email, address)
     - Line items: Nurse rate ($35/hr), Platform fee ($5/hr), Total ($40/hr)
     - Weekly hours and weekly total
     - Subscription tier line: Family Care $199.99/week
     - NIS coverage note
     - Terms: 14-day validity, payment terms, late fee policy
     - What's included in subscription (coordinator, replacement, etc.)
   - `generateInvoicePDF(carePlanData)` -- Similar to quote but marked INVOICE, includes billing period, due date
   - `generateReceiptPDF(carePlanData)` -- Minimal receipt with amount paid, payment method, amount in words, signature line

4. **`src/components/admin/care-plans/DocumentGenerationMenu.tsx`** -- Dropdown menu component with "Generate Quote / Invoice / Receipt" options

**Files to modify**:

5. **`src/pages/admin/AdminFamilyCarePlansPage.tsx`** -- Add DocumentGenerationMenu to each care plan row/card actions

6. **`src/pages/admin/AdminOnboardingChecklistPage.tsx`** -- Add a "Documents" section with quick-generate buttons for the family's first quote

**PDF Template Design** (matching uploaded samples):
- Letter size (8.5" x 11")
- Tavara purple (#7E69AB) header bar with white text
- Company info top-right: Tavara.Care, address, phone, email
- Line items table with alternating row shading
- Subtotal / fees / total section
- Footer with terms, contact info, and "Thank you" message
- TTD currency throughout
- Amount in words on receipts

**Quote-specific content for Anna Maria's case**:
```text
Line Items:
- Nursing Care (Standard Tier)    40 hrs/wk   $35.00/hr   $1,400.00
- Platform Management Fee          40 hrs/wk    $5.00/hr     $200.00
                                                 Subtotal: $1,600.00
- NIS Coverage (included)                                    $0.00
                                                    Total: $1,600.00

Subscription: Family Care -- $199.99/week
  Includes: Dedicated care coordinator, caregiver replacement,
  care needs change management, billing management

Terms & Conditions:
- Payment due every Friday (weekly billing)
- Late payment: 5% fee after 3 business days
- Operating hours: 8AM-4PM, transactions close 4:30PM
- Holiday rates: 1.5x standard, Christmas 2x
- Extended hours beyond schedule: 1.5x rate
- Care escalation (condition changes) may require rate adjustment
```

### Implementation Order

1. Install `jspdf` and `html2canvas`
2. Create utility files (numberToWords, documentNumbering)
3. Create invoiceService with all three PDF generators
4. Create DocumentGenerationMenu component
5. Wire into AdminFamilyCarePlansPage
6. Wire into AdminOnboardingChecklistPage
7. Test PDF generation with sample data

Payment terms and late fee policy page will be done separately as requested.

