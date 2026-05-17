## Add Blog link to top nav and footer

Yes, correct. Two minimal additions.

### 1. Top navigation (`src/components/layout/Navigation.tsx`)
Add a `<Link to="/blog">Blog</Link>` entry alongside the existing About / Errands / Tav Demo links (around line 158), styled identically (`text-gray-700 hover:text-primary`, closes mobile menu on click). One-line addition, no restructuring of the auth/dashboard logic.

### 2. Footer (`src/components/layout/Footer.tsx`)
Add a `<Link to="/blog">Blog</Link>` entry in the "Quick Links" column (the block around lines 43–70 with Home / About / dashboards / FAQ), placed between About and the dashboard links, same `text-gray-300 hover:text-primary-400` styling.

### Out of scope
- No router changes (`/blog` route already exists)
- No changes to auth, dashboard, or chat flow logic
- No restyling of the existing nav or footer
- Explicit user request satisfies the Navigation.tsx protection rule
