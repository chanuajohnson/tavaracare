

## Save UTM Campaign Links to Database

This enhancement will store your generated campaign links permanently in the database, connect them to signups, and provide full attribution tracking.

---

## What This Means for You

### Current Situation
- Links saved only in your browser (localStorage)
- Lost if you clear browser data or use a different device
- No connection between the link you created and who signed up from it

### After Enhancement
- Links saved permanently in database
- Access from any device
- See exactly: "I created this link on Jan 30 > 5 people clicked it > 3 signed up"
- Track campaign ROI over time

---

## Database Changes

### New Table: `utm_campaign_links`

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Unique identifier |
| platform | text | instagram, tiktok, facebook, etc. |
| medium | text | bio, paid, story, reel, etc. |
| campaign | text | Your campaign name |
| content | text | Optional content ID |
| full_url | text | The complete generated URL |
| created_by | UUID | Your admin user ID |
| created_at | timestamp | When you generated it |
| is_active | boolean | Can archive old links |
| notes | text | Optional notes about the campaign |

This table will:
- Store every link you generate
- Connect to your admin account
- Allow filtering by platform, date, campaign name
- Support archiving old campaigns

---

## How It Will Connect to Signups

When someone registers from a UTM link:

```text
1. User clicks: https://tavara.care?utm_source=instagram&utm_medium=paid&utm_campaign=jan_30_family

2. Landing page captures: {source: "instagram", medium: "paid", campaign: "jan_30_family"}

3. Registration saves to cta_engagement_tracking with UTM data

4. Dashboard queries BOTH tables:
   - utm_campaign_links: Links you created
   - cta_engagement_tracking: Signups that happened
   
5. Shows: "jan_30_family" link > 3 signups > 25% conversion rate
```

---

## Updated Dashboard View

After implementation, Campaign Links page will show:

### Your Created Links Section:
| Platform | Medium | Campaign | Created | Signups | Copy |
|----------|--------|----------|---------|---------|------|
| Instagram | Paid | jan_30_family | Today | 3 | Copy Button |
| TikTok | Bio | garden_ohm | Yesterday | 1 | Copy Button |
| Instagram | Bio | bio_link_main | 5 days ago | 0 | Copy Button |

### Signups by Source (unchanged):
Shows aggregated conversion data from all tracked sources.

---

## Technical Implementation

### Part 1: Database Migration
Create `utm_campaign_links` table with:
- RLS policies allowing admin users to create/read/update
- Indexes for efficient querying by platform, campaign

### Part 2: Update UTMLinkGenerator Component
- Save to database when copying link (instead of localStorage)
- Load recent links from database
- Add optional notes field for campaign context
- Add archive/delete functionality

### Part 3: Enhanced Campaign Page
- Show created links with their signup counts
- Calculate conversion rate per link
- Add filtering by platform/date range
- Export capability for reporting

### Part 4: Connect Links to Conversions
- Query joins utm_campaign_links with cta_engagement_tracking
- Match by campaign name (utm_campaign)
- Show which specific links drove which signups

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| Create | SQL Migration | New utm_campaign_links table |
| Modify | `src/components/admin/UTMLinkGenerator.tsx` | Save to database instead of localStorage |
| Modify | `src/pages/admin/CampaignLinksPage.tsx` | Show created links with conversion metrics |
| Modify | `src/utils/utmTracking.ts` | Add database save functions |

---

## Security

- Only admin users can create/view campaign links
- RLS policies ensure data isolation
- Links are tied to the admin who created them

