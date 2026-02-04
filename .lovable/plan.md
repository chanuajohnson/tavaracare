

## Two-Part Solution: Add Missing Caregivers + Create Shareable Marketing Cards

---

## Part 1: Fix Missing Caregivers (Database Only)

The SQL to add Carrema Canute, Candice Britto, and Daniella Walcott was not executed. You'll need to run these commands in Supabase:

### Step 1: Go to Supabase SQL Editor
https://supabase.com/dashboard/project/cpdfmyemjrefnhddyrck/sql/new

### Step 2: Run these SQL statements

```sql
-- Mark caregivers as available
UPDATE profiles 
SET available_for_matching = true, updated_at = NOW()
WHERE id IN (
  '11a77842-32a0-482b-b3eb-e4c7ed7c5b83',  -- Candice Britto
  '150ede63-32f4-4c2b-bf2d-2a66344055f6'   -- Daniella Walcott
);

-- Add to spotlight
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

## Part 2: Shareable Caregiver Marketing Cards

Create a feature that generates downloadable/shareable images for caregivers to post on their WhatsApp status, Instagram, Facebook, etc.

### What Caregivers Will Get

A professional image card (optimized for social media) showing:
- Their first name and photo/initials
- "Available Now" badge
- Their specialty headline
- Their location
- Tavara branding with QR code to /urgent-caregivers
- WhatsApp contact number

### How It Works

1. **Admin generates cards** from a new section on the Marketing Assets page
2. **Downloads personalized PNG** for each spotlight caregiver
3. **Sends via WhatsApp** to each caregiver with a message like:
   > "Hi Carlene! Here's your availability card - share it on your WhatsApp status and social media to let families know you're available!"

### Technical Implementation

| Action | File | Description |
|--------|------|-------------|
| Create | `src/components/marketing/CaregiverShareCard.tsx` | Shareable card template styled for social media (1080x1080 for Instagram, 9:16 for WhatsApp status) |
| Modify | `src/pages/admin/GenerateMarketingAssets.tsx` | Add "Generate Caregiver Share Cards" section |
| Create | `src/utils/marketing/caregiverShareUtils.ts` | Utility functions to generate and download cards |

### Card Design Concept

```text
┌─────────────────────────────────┐
│        🏡 Tavara.care           │
│    "It takes a village"         │
├─────────────────────────────────┤
│                                 │
│         [Avatar/Photo]          │
│                                 │
│      ✨ CARLENE ✨              │
│   Dedicated Care Professional   │
│                                 │
│   📍 Princess Town              │
│   🕐 3-5 Years Experience       │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ✅ AVAILABLE NOW         │  │
│  │     for families          │  │
│  └───────────────────────────┘  │
│                                 │
│   [QR Code]  📲 WhatsApp me     │
│              +1 (868) 786-5357  │
│                                 │
│  🇹🇹 Serving Trinidad & Tobago  │
└─────────────────────────────────┘
```

### Two Card Formats

1. **Instagram/Facebook (1080x1080)** - Square format
2. **WhatsApp Status (1080x1920)** - Vertical story format

### Admin Workflow

1. Go to Marketing Assets page
2. Click "Generate Caregiver Share Cards"
3. System fetches all spotlight caregivers
4. Generates personalized card for each
5. Download all or individually
6. Send to caregivers via WhatsApp

### Message Template for Sending to Caregivers

```text
Hi [Name]! 💙

Here's your personalized availability card from Tavara.care!

📲 Share it on:
• WhatsApp Status
• Facebook
• Instagram

Let families know you're available for care work!

Need changes? Just reply to this message.
```

---

## Summary

| Task | Type | Time |
|------|------|------|
| Run SQL for 3 new caregivers | Manual (you) | 2 minutes |
| Create CaregiverShareCard component | Code | New file |
| Add to Marketing Assets page | Code | Modify existing |
| Create utility functions | Code | New file |

This gives caregivers professional, branded content they can immediately share to attract families.

