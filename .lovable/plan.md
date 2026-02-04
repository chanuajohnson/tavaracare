

## Add Caregivers to Featured Spotlight

This plan will add Carrema Canute, Candice Britto, and Daniella Walcott to the /urgent-caregivers page alongside Carlene and Tricia.

---

## Changes Required

### 1. Update Availability Status
Mark these caregivers as available for matching:
- **Candice Britto** - currently `available_for_matching = false`
- **Daniella Walcott** - currently `available_for_matching = false`

### 2. Add to Caregiver Spotlight Table
Insert new spotlight entries for:

| Caregiver | Headline | Description | Order |
|-----------|----------|-------------|-------|
| Carrema Canute | Specialized Care Expert | Experienced caregiver in Arima with expertise in cognitive care, memory support, and special needs. Over 10 years of dedicated service. | 3 |
| Candice Britto | Compassionate Memory Care Specialist | 6-10 years experience providing household and memory care support in Chase Village. | 4 |
| Daniella Walcott | Trusted In-Home Caregiver | Reliable care professional based in Princess Town with 6-10 years of in-home care experience. | 5 |

---

## Database Operations

### Step 1: Update Profiles (mark as available)
```sql
UPDATE profiles 
SET available_for_matching = true, updated_at = NOW()
WHERE id IN (
  '11a77842-32a0-482b-b3eb-e4c7ed7c5b83',  -- Candice Britto
  '150ede63-32f4-4c2b-bf2d-2a66344055f6'   -- Daniella Walcott
);
```

### Step 2: Insert Spotlight Entries
```sql
INSERT INTO caregiver_spotlight (caregiver_id, headline, description, display_order, is_active)
VALUES 
  ('4dedfad6-be2b-4923-b117-37b403f7ac9d', 'Specialized Care Expert', 
   'Experienced caregiver in Arima with expertise in cognitive care, memory support, and special needs. Over 10 years of dedicated service.', 3, true),
  ('11a77842-32a0-482b-b3eb-e4c7ed7c5b83', 'Compassionate Memory Care Specialist', 
   '6-10 years experience providing household and memory care support in Chase Village.', 4, true),
  ('150ede63-32f4-4c2b-bf2d-2a66344055f6', 'Trusted In-Home Caregiver', 
   'Reliable care professional based in Princess Town with 6-10 years of in-home care experience.', 5, true);
```

---

## Result After Implementation

The /urgent-caregivers page will display 5 featured caregivers:

1. **Carlene Williams** - Princess Town (existing)
2. **Tricia Cumm** - Barrackpore (existing)
3. **Carrema Canute** - Arima (new)
4. **Candice Britto** - Chase Village (new)
5. **Daniella Walcott** - Princess Town (new)

---

## Note About Avatars

Currently, only Carlene and Tricia have custom AI-generated avatar images. The new caregivers will show initials (CC, CB, DW) as avatar fallbacks until you provide custom images.

---

## No Code Changes Required

This is purely a database update - the existing spotlight system will automatically display the new caregivers once added to the `caregiver_spotlight` table.

