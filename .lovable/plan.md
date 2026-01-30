

## UTM Tracking & Link Generator Implementation Plan

This plan covers two key features:
1. **UTM Capture System** - Automatically capture and store UTM parameters when visitors land on the site
2. **UTM Link Generator** - An admin tool to create tracked links for each social media campaign

---

## How It Will Work (Non-Technical Summary)

### For You (The Founder):
1. **Before Running an Ad**: Go to Admin Dashboard > click "Campaign Links" > enter campaign name (e.g., "TikTok Jan 30") > copy the generated link
2. **Paste That Link**: In Instagram Ads Manager's "Website URL" field, or in your TikTok bio
3. **After Ad Runs**: View "Signups by Source" in the admin dashboard to see exactly which ads are working

### For Your Users:
Nothing changes - they click your ad, land on tavara.care as normal. Behind the scenes, we capture where they came from.

---

## Technical Implementation

### Part 1: UTM Capture on Landing Page

**File: `src/pages/Index.tsx`**

Add a useEffect hook that runs on page load to:
- Extract UTM parameters from URL (utm_source, utm_medium, utm_campaign, utm_content)
- Store them in localStorage as `tavara_utm_data` with a timestamp
- This data persists even if user navigates to other pages before registering

```text
Example URL: https://tavara.care?utm_source=instagram&utm_medium=paid&utm_campaign=jan_30_family

Captured Data:
{
  utm_source: "instagram",
  utm_medium: "paid", 
  utm_campaign: "jan_30_family",
  captured_at: "2026-01-30T12:00:00Z"
}
```

### Part 2: Create UTM Utility Functions

**New File: `src/utils/utmTracking.ts`**

Create reusable functions:
- `captureUTMParams()` - Extract and store UTM from URL
- `getStoredUTMData()` - Retrieve stored UTM data
- `clearUTMData()` - Clear after successful registration
- `generateUTMLink()` - Create UTM links for campaigns

### Part 3: Pass UTM Through Registration

**Files to Modify:**
- `src/pages/registration/FamilyRegistration.tsx`
- `src/pages/registration/ProfessionalRegistration.tsx`
- `src/pages/registration/CommunityRegistration.tsx`

On form submission:
1. Read stored UTM data from localStorage
2. Include in the tracking event via PageViewTracker
3. Store in profile's metadata or tracking table

### Part 4: UTM Link Generator Component

**New File: `src/components/admin/UTMLinkGenerator.tsx`**

A simple tool with:
- Platform selector (Instagram, TikTok, Facebook, WhatsApp)
- Campaign type (bio link, paid ad, reel, story)
- Campaign name input
- Auto-generated link with copy button
- Recent links history

### Part 5: Add to Admin Dashboard

**File: `src/pages/admin/AdminDashboard.tsx`**

Add a new quick action button for "Campaign Links" that navigates to a new admin page.

**New File: `src/pages/admin/CampaignLinksPage.tsx`**

Full page with:
- UTM Link Generator tool
- Signups by source table (pulling from cta_engagement_tracking)
- Campaign performance metrics

### Part 6: Track in Database

The existing `cta_engagement_tracking` table already supports `additional_data` JSON field. We'll store:
```json
{
  "utm_source": "instagram",
  "utm_medium": "paid",
  "utm_campaign": "jan_30_family",
  "utm_content": "reel_DUGIL"
}
```

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| Create | `src/utils/utmTracking.ts` | UTM capture and link generation utilities |
| Modify | `src/pages/Index.tsx` | Add UTM capture on page load |
| Modify | `src/pages/registration/FamilyRegistration.tsx` | Include UTM in registration tracking |
| Modify | `src/pages/registration/ProfessionalRegistration.tsx` | Include UTM in registration tracking |
| Modify | `src/pages/registration/CommunityRegistration.tsx` | Include UTM in registration tracking |
| Create | `src/components/admin/UTMLinkGenerator.tsx` | Link generator component |
| Create | `src/pages/admin/CampaignLinksPage.tsx` | Full admin page with generator + analytics |
| Modify | `src/pages/admin/AdminDashboard.tsx` | Add "Campaign Links" button |
| Modify | `src/App.tsx` | Add route for new admin page |

---

## UTM Link Generator Preview

The generator will create links in this format:

**Instagram Bio:**
```
https://tavara.care?utm_source=instagram&utm_medium=bio&utm_campaign=[your_campaign_name]
```

**Instagram Paid Ad:**
```
https://tavara.care?utm_source=instagram&utm_medium=paid&utm_campaign=[your_campaign_name]
```

**TikTok Bio:**
```
https://tavara.care?utm_source=tiktok&utm_medium=bio&utm_campaign=[your_campaign_name]
```

**TikTok Paid Ad:**
```
https://tavara.care?utm_source=tiktok&utm_medium=paid&utm_campaign=[your_campaign_name]
```

---

## What You'll See After Implementation

In Admin Dashboard > Campaign Links:

| Source | Medium | Campaign | Signups | Last Signup |
|--------|--------|----------|---------|-------------|
| instagram | paid | jan_30_family | 3 | 2 hours ago |
| tiktok | bio | garden_ohm_collab | 1 | 5 hours ago |
| instagram | reel | caregiver_story | 2 | 1 day ago |

---

## Next Steps After Implementation

Once approved, I will:
1. Create the UTM utility functions
2. Add capture logic to the landing page
3. Modify registration pages to include UTM data
4. Build the UTM Link Generator component
5. Create the Campaign Links admin page
6. Add the admin dashboard button and route

