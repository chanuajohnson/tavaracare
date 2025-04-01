
# TAVARA.CARE Site Map Documentation

> **Version:** 1.0  
> **Last Updated:** July 2024  
> **Status:** Active Reference Document

## 1. Introduction

### Purpose of This Document

This Site Map Documentation serves as the authoritative reference for the structure, navigation patterns, and page hierarchy of TAVARA.CARE. It defines how users navigate through the platform, what content appears on each page, and how different user types experience the application. This document is essential for:

- **Developers:** Understanding the application structure and navigation requirements
- **Content creators:** Identifying where content should be placed and maintained
- **Product managers:** Planning feature expansions and understanding user flows
- **UX/UI designers:** Ensuring consistent navigation patterns and user experiences

### How to Use and Maintain This Site Map

This document should be consulted:
- Before adding new pages or features to ensure they fit within the established information architecture
- When modifying navigation patterns to maintain consistency
- As a reference when discussing page locations or navigation flows
- During onboarding for new team members to understand the platform structure

Updates to this document should follow these principles:
- All changes must be reviewed by at least one product team member and one developer
- Major structural changes require UX review and testing
- Documentation should be updated before or in parallel with implementation

### Document Versioning and Update Procedures

Version numbering follows: `Major.Minor` format
- **Major version** changes (1.0 → 2.0): Significant restructuring of site architecture
- **Minor version** changes (1.0 → 1.1): Addition of new sections, pages, or navigation patterns

Update procedure:
1. Document proposed changes with rationale
2. Submit for review to product and development teams
3. Update document with approved changes
4. Update version number and last modified date
5. Notify all stakeholders of updates
6. Archive previous version

## 2. Hierarchical Structure

### Visual Representation of Site Hierarchy

*[Placeholder for Site Hierarchy Diagram]*

The diagram should show:
- Primary navigation categories
- Secondary page groupings
- User role-specific sections
- Authentication boundaries

### Primary Navigation Categories with Descriptions

1. **Home/Landing Page**
   - Public-facing introduction to TAVARA.CARE
   - Focus on value proposition, call-to-action for registration
   - Showcases key features and testimonials

2. **Features**
   - Comprehensive overview of platform capabilities
   - Segmented by user type (Family, Professional, Community)
   - Includes comparison tables and interactive demonstrations

3. **About**
   - Company mission, vision, and team
   - Origin story and values
   - Podcast and media resources

4. **Authentication**
   - Login and registration pages
   - Password reset functionality
   - Account verification processes

5. **Dashboards**
   - Personalized user starting points based on role
   - Activity summaries and quick access to key functions
   - Different implementations for Family, Professional, Community, and Admin users

6. **Registration Flows**
   - Role-specific multi-step registration processes
   - Profile completion workflows
   - Verification procedures

7. **Care Matching**
   - Family care need postings
   - Caregiver profile discovery
   - Matching algorithms and recommendation systems

8. **Training Resources**
   - Professional development modules
   - Certification tracking
   - Learning progress dashboards

9. **Messaging System**
   - Direct messaging between users
   - Community message boards
   - Notification management

10. **Support**
    - FAQ and help center
    - Contact methods
    - Troubleshooting guides

11. **Subscription & Pricing**
    - Plan comparisons
    - Payment processing
    - Feature access management

### Secondary Pages Under Each Primary Category

1. **Home/Landing Page**
   - No secondary pages (serves as entry point)

2. **Features**
   - Family Features Overview
   - Professional Features Overview
   - Community Features Overview
   - Tech Innovators Hub

3. **About**
   - Team Page
   - Mission and Vision
   - Press and Media
   - Careers
   - Contact

4. **Authentication**
   - Login Page
   - Signup Page
   - Password Reset Page
   - Email Verification Page

5. **Dashboards**
   - Family Dashboard
   - Professional Dashboard
   - Community Dashboard
   - Admin Dashboard

6. **Registration Flows**
   - Family Registration
   - Professional Registration
   - Community Registration

7. **Care Matching**
   - Caregiver Matching (for families)
   - Family Matching (for caregivers)
   - Match Management
   - References and Reviews

8. **Training Resources**
   - Module List
   - Individual Module Viewer
   - Certification Tracking
   - Resource Library

9. **Messaging System**
   - Message Board
   - Direct Messages
   - Notification Settings

10. **Support**
    - FAQ Page
    - Contact Form
    - Help Center
    - Troubleshooting Guides

11. **Subscription & Pricing**
    - Subscription Plans
    - Premium Features
    - Payment Methods
    - Billing History

### Tertiary Pages and Their Parent Relationships

1. **Features**
   - Family Features → Care Schedule Management
   - Family Features → Caregiver Verification
   - Professional Features → Certification Upload
   - Professional Features → Availability Management
   - Community Features → Volunteer Opportunities
   - Community Features → Resource Sharing

2. **Dashboards**
   - Family Dashboard → Care Plan Management
   - Family Dashboard → Caregiver Relationships
   - Professional Dashboard → Job Applications
   - Professional Dashboard → Earnings Reports
   - Community Dashboard → Event Calendar
   - Community Dashboard → Resource Directory
   - Admin Dashboard → User Management
   - Admin Dashboard → Content Moderation

3. **Training Resources**
   - Module List → Category Pages
   - Module Viewer → Individual Lessons
   - Module Viewer → Lesson Quizzes
   - Module Viewer → Completion Certificates

### Cross-Navigation Opportunities Between Sections

Key cross-navigation paths include:

1. **Dashboard ↔ Matching**
   - Family Dashboard provides direct access to Caregiver Matching
   - Professional Dashboard links to Family Matching opportunities

2. **Training ↔ Profile**
   - Completed training modules automatically update professional profiles
   - Profile completion status directs to relevant training opportunities

3. **Messaging ↔ Matching**
   - Match suggestions include direct message capabilities
   - Message threads can reference specific care opportunities

4. **Support ↔ Feature Pages**
   - Contextual help links from feature pages to specific FAQ sections
   - FAQ answers link to relevant feature pages for immediate action

5. **Subscription ↔ Features**
   - Feature pages highlight subscription requirements
   - Subscription pages link to feature demonstrations

### Information Architecture Principles

TAVARA.CARE's information architecture adheres to these key principles:

1. **Role-Based Organization**
   - Primary navigation and content organization reflects user roles
   - Different entry points and journeys for families, professionals, and community members

2. **Progressive Disclosure**
   - Critical information presented first
   - Details available through expandable sections or child pages
   - Complex workflows broken into manageable steps

3. **Contextual Relevance**
   - Navigation options change based on user context
   - Related content and actions suggested based on current activity

4. **Consistent Mental Models**
   - Similar functions work similarly across the platform
   - Navigation patterns remain consistent within role-specific sections

5. **Clear Wayfinding**
   - Users should always know where they are in the site
   - Breadcrumb navigation on all interior pages
   - Clear visual hierarchy and section labeling

6. **Minimal Cognitive Load**
   - No more than 7±2 primary navigation options
   - Secondary navigation grouped logically
   - Search functionality for direct access to content

## 3. Page Types & Templates

### List of Page Templates with Descriptions

1. **Landing Template**
   - Purpose: Convert visitors to users, communicate value proposition
   - Characteristics: Hero section, feature highlights, testimonials, CTAs

2. **Dashboard Template**
   - Purpose: Provide personalized overview and quick access to key functions
   - Characteristics: Activity feed, metric cards, quick action buttons, notifications

3. **List/Directory Template**
   - Purpose: Display collections of similar items with filtering and sorting
   - Characteristics: Filter controls, sort options, list/grid toggle, pagination

4. **Detail Template**
   - Purpose: Display comprehensive information about a single item
   - Characteristics: Header with key info, tabbed content sections, action buttons

5. **Form Template**
   - Purpose: Collect structured data from users
   - Characteristics: Input fields, validation, progress indicators for multi-step forms

6. **Article/Content Template**
   - Purpose: Present long-form content with proper hierarchy
   - Characteristics: Title, metadata, content sections, related content suggestions

7. **Module/Lesson Template**
   - Purpose: Present educational content with progress tracking
   - Characteristics: Navigation sidebar, content area, progress indicators, quizzes

8. **Profile Template**
   - Purpose: Display and edit user information
   - Characteristics: Avatar, key information, editable sections, privacy controls

9. **Messaging Template**
   - Purpose: Facilitate communication between users
   - Characteristics: Conversation list, message thread view, compose interface

10. **Comparison Template**
    - Purpose: Allow side-by-side comparison of options
    - Characteristics: Feature matrix, highlighting of differences, selection controls

### Screenshot Placeholders for Each Template

*[Placeholder for Landing Template Screenshot]*
*[Placeholder for Dashboard Template Screenshot]*
*[Placeholder for List/Directory Template Screenshot]*
*[Placeholder for Detail Template Screenshot]*
*[Placeholder for Form Template Screenshot]*
*[Placeholder for Article/Content Template Screenshot]*
*[Placeholder for Module/Lesson Template Screenshot]*
*[Placeholder for Profile Template Screenshot]*
*[Placeholder for Messaging Template Screenshot]*
*[Placeholder for Comparison Template Screenshot]*

### When to Use Each Template Type

1. **Landing Template**
   - Use for: Home page, feature overview pages, marketing landing pages
   - Not for: Authenticated user experiences, data-heavy pages

2. **Dashboard Template**
   - Use for: Role-specific dashboards, personal account overview
   - Not for: Public-facing pages, detailed single-item views

3. **List/Directory Template**
   - Use for: Caregiver listings, job opportunities, resource libraries, search results
   - Not for: Single-item focus, narrative content

4. **Detail Template**
   - Use for: Caregiver profiles, job listings, training module details
   - Not for: Collections of items, dashboard overviews

5. **Form Template**
   - Use for: Registration, profile completion, care need postings, settings
   - Not for: Content consumption, browsing experiences

6. **Article/Content Template**
   - Use for: Help articles, blog posts, resource documents, long-form content
   - Not for: Interactive features, data collection

7. **Module/Lesson Template**
   - Use for: Training modules, certification courses, guided tutorials
   - Not for: Static content, administrative functions

8. **Profile Template**
   - Use for: User profiles, account settings
   - Not for: Content not directly related to user identity

9. **Messaging Template**
   - Use for: Direct messaging, community forums, notification centers
   - Not for: Content consumption, non-communication features

10. **Comparison Template**
    - Use for: Subscription plans, service tiers, feature comparisons
    - Not for: Single-item details, narrative content

### Custom vs. Standard Page Layouts

**Standard Layouts** (use whenever possible for consistency):
- Landing Template
- Dashboard Template
- List/Directory Template
- Detail Template
- Form Template
- Article/Content Template

**Custom Layouts** (used only for specific functionality):
- Home page (custom version of Landing Template)
- Matching algorithm results page
- Interactive care scheduling calendar
- Subscription management interface
- Admin analytics dashboard

### Component Availability by Template

| Component Type | Landing | Dashboard | List | Detail | Form | Article | Module | Profile | Messaging | Comparison |
|---------------|:-------:|:---------:|:----:|:------:|:----:|:-------:|:------:|:-------:|:---------:|:----------:|
| Hero Banner   |    ✓    |     -     |  -   |    -   |  -   |    -    |   -    |    -    |     -     |      -     |
| Card Grid     |    ✓    |     ✓     |  ✓   |    -   |  -   |    -    |   -    |    -    |     -     |      -     |
| Data Tables   |    -    |     ✓     |  ✓   |    ✓   |  -   |    -    |   -    |    -    |     -     |      ✓     |
| Form Elements |    ✓    |     -     |  ✓   |    ✓   |  ✓   |    -    |   ✓    |    ✓    |     ✓     |      -     |
| Rich Text     |    ✓    |     -     |  -   |    ✓   |  -   |    ✓    |   ✓    |    ✓    |     -     |      -     |
| Media Gallery |    ✓    |     -     |  -   |    ✓   |  -   |    ✓    |   ✓    |    ✓    |     -     |      -     |
| Charts/Graphs |    -    |     ✓     |  -   |    ✓   |  -   |    ✓    |   -    |    -    |     -     |      ✓     |
| Calendar      |    -    |     ✓     |  -   |    ✓   |  ✓   |    -    |   -    |    -    |     -     |      -     |
| Progress Bar  |    -    |     ✓     |  -   |    -   |  ✓   |    -    |   ✓    |    ✓    |     -     |      -     |
| Comments      |    -    |     -     |  -   |    ✓   |  -   |    ✓    |   ✓    |    -    |     ✓     |      -     |
| Ratings       |    ✓    |     -     |  ✓   |    ✓   |  -   |    -    |   ✓    |    ✓    |     -     |      -     |
| Notifications |    -    |     ✓     |  -   |    -   |  -   |    -    |   -    |    ✓    |     ✓     |      -     |
| Maps          |    ✓    |     -     |  ✓   |    ✓   |  -   |    -    |   -    |    ✓    |     -     |      -     |

### Template Restrictions and Limitations

1. **Landing Template**
   - Limited to 5 main content sections
   - No user-specific content except CTAs for returning users
   - Must include primary conversion path

2. **Dashboard Template**
   - Maximum of 8 metric cards
   - Activity feed limited to last 7 days by default
   - Quick actions limited to 6 items

3. **List/Directory Template**
   - Maximum of 5 primary filter controls
   - Pagination required for >20 items
   - Must include search functionality

4. **Detail Template**
   - Maximum of 6 primary content tabs
   - Related items limited to 4 visible recommendations
   - Must maintain breadcrumb navigation

5. **Form Template**
   - Steps in multi-page forms should not exceed 5
   - Form submission must include loading state and success/error feedback
   - Required fields must be clearly marked

6. **Article/Content Template**
   - Must include estimated reading time
   - Table of contents required for articles >800 words
   - Related content limited to 3 recommendations

7. **Module/Lesson Template**
   - Navigation sidebar cannot exceed 3 levels of hierarchy
   - Progress must be automatically saved
   - No more than 10 lessons per module

8. **Profile Template**
   - Public vs. private information must be clearly differentiated
   - Edit mode must include validation and save/cancel options
   - Contact options must be privacy-controlled

9. **Messaging Template**
   - Unread messages must be clearly indicated
   - Thread participants limited to visible space
   - Must include typing indicators and read receipts

10. **Comparison Template**
    - Maximum of 4 items in side-by-side comparison
    - Feature differences must be visually highlighted
    - Must include ability to select/save preferred option

## 4. User Access Levels

### Detailed Matrix Showing Page Visibility by User Type

| Page/Section                   | Visitor | Family (Basic) | Family (Premium) | Caregiver (Unverified) | Caregiver (Verified) | Community | Admin |
|--------------------------------|:-------:|:--------------:|:----------------:|:----------------------:|:--------------------:|:---------:|:-----:|
| **Home/Landing**               |    ✓    |        ✓       |         ✓        |            ✓           |           ✓          |     ✓     |   ✓   |
| **Features Overview**          |    ✓    |        ✓       |         ✓        |            ✓           |           ✓          |     ✓     |   ✓   |
| **About Pages**                |    ✓    |        ✓       |         ✓        |            ✓           |           ✓          |     ✓     |   ✓   |
| **Login/Signup**               |    ✓    |        -       |         -        |            -           |           -          |     -     |   -   |
| **Password Reset**             |    ✓    |        ✓       |         ✓        |            ✓           |           ✓          |     ✓     |   ✓   |
| **Family Dashboard**           |    -    |        ✓       |         ✓        |            -           |           -          |     -     |   ✓   |
| **Professional Dashboard**     |    -    |        -       |         -        |            ✓           |           ✓          |     -     |   ✓   |
| **Community Dashboard**        |    -    |        -       |         -        |            -           |           -          |     ✓     |   ✓   |
| **Admin Dashboard**            |    -    |        -       |         -        |            -           |           -          |     -     |   ✓   |
| **Family Registration**        |    ✓    |        -       |         -        |            -           |           -          |     -     |   ✓   |
| **Professional Registration**  |    ✓    |        -       |         -        |            -           |           -          |     -     |   ✓   |
| **Community Registration**     |    ✓    |        -       |         -        |            -           |           -          |     -     |   ✓   |
| **Caregiver Profiles**         |    -    |        ✓       |         ✓        |            -           |           -          |     -     |   ✓   |
| **Care Need Postings**         |    -    |        -       |         -        |            ✓           |           ✓          |     -     |   ✓   |
| **Messaging - Direct**         |    -    |        ✓       |         ✓        |            ✓           |           ✓          |     ✓     |   ✓   |
| **Messaging - Community**      |    -    |        ✓       |         ✓        |            ✓           |           ✓          |     ✓     |   ✓   |
| **Training Modules (Basic)**   |    -    |        -       |         -        |            ✓           |           ✓          |     ✓     |   ✓   |
| **Training Modules (Advanced)**|    -    |        -       |         -        |            -           |           ✓          |     -     |   ✓   |
| **Subscription Management**    |    -    |        ✓       |         ✓        |            ✓           |           ✓          |     ✓     |   ✓   |
| **Analytics Reports**          |    -    |        -       |         ✓        |            -           |           ✓          |     -     |   ✓   |
| **User Management**            |    -    |        -       |         -        |            -           |           -          |     -     |   ✓   |
| **Content Management**         |    -    |        -       |         -        |            -           |           -          |     -     |   ✓   |
| **System Settings**            |    -    |        -       |         -        |            -           |           -          |     -     |   ✓   |

### Permission Inheritance Rules

1. **Role Hierarchy**
   - Admin inherits all permissions from all roles
   - Premium plan users inherit all permissions from basic plan users
   - Verified caregivers inherit all permissions from unverified caregivers

2. **Content Access Rules**
   - Users can always access content they created
   - Users can access shared content based on explicit sharing settings
   - Public content is accessible to all authenticated users

3. **Dashboard Access Control**
   - Users can only access dashboards matching their primary role
   - Admin users can access all dashboards
   - Multi-role users (e.g., both family and professional) can switch between relevant dashboards

4. **Feature Entitlement Rules**
   - Subscription-based features are controlled by subscription status
   - Role-based features are controlled by user role
   - Verification-based features require completed verification process

### Login/Authentication Requirements by Section

1. **Public Sections** (no authentication required)
   - Home/Landing page
   - Features overview
   - About pages
   - Login/Signup pages
   - Password reset (initiation)
   - Public blog articles and resources

2. **Basic Authentication Required**
   - Role-specific dashboards
   - Profile viewing and editing
   - Basic messaging functions
   - Community forums (read-only)
   - Basic search functions

3. **Authentication + Profile Completion Required**
   - Matching platform access
   - Advanced search with filtering
   - Posting care needs
   - Direct messaging with other users
   - Community forums (posting)

4. **Authentication + Verification Required**
   - For caregivers: Applying to care opportunities
   - For families: Booking verified caregivers
   - For community members: Volunteering opportunities
   - Rating and review systems
   - Certificate generation

5. **Authentication + Subscription Required**
   - Premium features
   - Advanced reporting
   - Priority matching
   - Enhanced profile visibility
   - Advanced filtering options

### Restricted Area Handling

1. **Authentication Redirects**
   - Unauthenticated users attempting to access restricted areas are redirected to the login page
   - Login page preserves the originally requested URL for post-login redirect
   - Clear messaging explains why authentication is required

2. **Unauthorized Access Handling**
   - Users with insufficient permissions receive a 403 page
   - 403 page explains the required permissions and how to obtain them
   - Related, accessible alternatives are suggested when available

3. **Partial Access Controls**
   - Pages with mixed public/private content show only accessible portions
   - Locked features display upgrade/verification prompts
   - Previews of premium content are available with clear upgrade paths

4. **Verification Pending States**
   - Users with pending verifications see status indicators
   - Estimated completion times are displayed when possible
   - Alternative actions are suggested during waiting periods

## 5. Functional Elements by Page

### Interactive Components Inventory by Page

**Home/Landing Page**
- Hero section with CTA buttons
- Role selection cards (Family, Professional, Community)
- Feature highlights with expandable details
- Testimonial carousel
- Newsletter signup form
- Contact form

**Family Dashboard**
- Care status overview cards
- Quick action buttons (Post need, Message, etc.)
- Upcoming care calendar
- Recent caregiver matches
- Notification center
- Care plan progress tracker

**Professional Dashboard**
- Job opportunity feed
- Earnings summary chart
- Profile completion indicator
- Upcoming assignments calendar
- Training module progress
- Rating and review display

**Caregiver Matching Page**
- Search filters (location, skills, availability)
- Caregiver profile cards
- Map view of caregivers
- Comparison tool
- Saved favorites list
- Contact/booking request form

**Training Module Page**
- Module navigation sidebar
- Video/content player
- Interactive quizzes
- Progress tracker
- Note-taking tool
- Resource downloads
- Certification tracking

### Forms and Data Collection Points

**Registration Forms**
- Family Registration (5 steps)
  - Basic information
  - Care recipient details
  - Care needs assessment
  - Schedule preferences
  - Account creation
  
- Professional Registration (6 steps)
  - Basic information
  - Professional qualifications
  - Experience details
  - Verification documents
  - Availability settings
  - Account creation

- Community Registration (4 steps)
  - Basic information
  - Interest areas
  - Skills and resources
  - Account creation

**Other Key Forms**
- Care Need Posting
- Caregiver Application
- Message Composition
- Review Submission
- Support Request
- Subscription Management
- Profile Editing
- Feedback Collection

### Decision Points and User Flows

**Family User Journey**
1. Registration → Dashboard
2. Post Care Need → Review Matches → Select Caregiver
3. Schedule Care → Receive Care → Review Caregiver
4. Manage Recurring Care → Adjust Preferences

**Professional User Journey**
1. Registration → Verification → Dashboard
2. Complete Training → Update Profile → Browse Opportunities
3. Apply to Jobs → Interview → Accept Position
4. Provide Care → Get Rated → Receive Payment

**Community User Journey**
1. Registration → Dashboard
2. Browse Resources → Contribute Resources
3. Join Discussions → Connect with Members
4. Volunteer for Events → Share Experiences

### API Integrations Specific to Each Section

**Authentication System**
- Supabase Auth API for login/registration
- Social login providers (Google, Facebook)
- Email verification service

**Matching Platform**
- Geolocation services for proximity matching
- Calendar APIs for availability checking
- Background check verification services

**Messaging System**
- Real-time messaging service
- Notification delivery system
- Email notification gateway

**Payment Processing**
- Stripe for subscription management
- Payment processing gateway
- Invoice generation service

**Content Delivery**
- Video hosting and streaming
- Document storage and retrieval
- Image optimization services

### Database Relationships and Dependencies

**Core Entities and Relationships**
- Users → Profiles (1:1)
- Families → Care Recipients (1:n)
- Professionals → Certifications (1:n)
- Care Needs → Applications (1:n)
- Users → Messages (1:n)
- Training Modules → Lessons (1:n)
- Users → Subscriptions (1:n)

**Key Dependencies**
- Care matching requires complete profiles
- Payment processing depends on subscription status
- Messaging depends on user relationship status
- Content access depends on verification status

### State Management Considerations

**Global State Requirements**
- Authentication status
- User role and permissions
- Subscription status
- Notification count
- Current navigation context

**Page-Specific State Management**
- Form completion progress
- Filter and search parameters
- Viewing mode (list, grid, map)
- Sorting preferences
- Expanded/collapsed sections

**Persistent State Requirements**
- User preferences
- Recently viewed items
- Search history
- Draft messages
- Incomplete form data

## 6. Navigation Patterns

### Global Navigation Implementation Details

**Primary Navigation Bar**
- Located at top of all pages
- Contains logo, main navigation categories, authentication controls
- Responsive design with mobile hamburger menu
- Role-specific navigation options appear after authentication
- Indication of current section

**Secondary Navigation Elements**
- Tab bars for subsections within primary categories
- Sidebar navigation for complex sections (admin, training)
- Bottom navigation bar on mobile for key actions
- Floating action buttons for contextual primary actions

**User Account Menu**
- Accessible from global header
- Contains profile, settings, logout
- Shows user avatar and name when authenticated
- Includes subscription status indicator

### Breadcrumb Implementation Specifications

**Breadcrumb Structure**
- Home > [Primary Category] > [Secondary Page] > [Current Page]
- Maximum depth of 4 levels displayed
- Truncation with ellipsis for very long paths on mobile
- Current page is displayed but not clickable

**Technical Implementation**
- Uses standard breadcrumb component
- Dynamically generated based on site hierarchy
- Preserves navigation state when form submission fails
- Special handling for wizard/multi-step forms

**Visual Design**
- Subtle, secondary visual treatment
- Chevron separators between levels
- Consistent placement below header, above page title
- Maintains accessibility with proper ARIA roles

### Breadcrumb Display Rules and Exceptions

**Standard Display Rules**
- All authenticated pages display breadcrumbs
- Breadcrumbs begin with Home for public pages
- Breadcrumbs begin with Dashboard for authenticated experiences
- Current page name matches page title

**Special Cases and Exceptions**
- Landing pages do not display breadcrumbs
- Error pages show simplified breadcrumbs
- Multi-step forms show step indicator instead of full breadcrumbs
- Deep links preserve full navigation path in breadcrumbs

**Dynamic Content Considerations**
- User-generated content pages include content type in breadcrumb
- Search results show search term in breadcrumb path
- Filtered list views include primary filter in breadcrumb

### Secondary Navigation Patterns

**Tab Navigation**
- Used for switching between related views of the same content
- Horizontal tabs for up to 6 options
- Vertical tabs for more than 6 options or when more space is needed
- Responsive design converts to dropdown on mobile

**Sidebar Navigation**
- Used for sections with many subsections
- Collapsible categories for complex hierarchies
- Sticky positioning to remain visible during scrolling
- Responsive design collapses to hamburger menu on mobile

**Wizard Navigation**
- Used for multi-step forms and processes
- Shows all steps with completion status
- Allows back navigation to previous steps
- Forward navigation requires step completion

### Contextual Navigation Elements

**Related Content Links**
- "You might also like" sections
- "Frequently used together" suggestions
- "Next steps" recommendations

**Action Menus**
- Context-appropriate actions in page headers
- Item-specific actions in list/grid views
- Prioritized actions as buttons, secondary in dropdown menus

**Quick Filters**
- Frequently used filters as toggleable buttons
- Recently used filters remembered per user
- Save filter configuration option

### Footer Navigation Standards

**Primary Footer Sections**
- Quick links to key pages
- Resources and help section
- Contact information
- Legal links (Terms, Privacy, etc.)
- Social media links

**Footer Content Guidelines**
- Present on all pages except full-screen workflows
- Consistent structure throughout the site
- Responsive design with stacking columns on mobile
- Clear visual separation from page content

**Role-Specific Footer Elements**
- Authenticated users see role-specific quick links
- Admin users see system status information
- Premium subscribers see dedicated support options

### Mobile Navigation Specifications

**Mobile Header**
- Simplified logo and branding
- Hamburger menu for primary navigation
- Quick access to search and notifications
- User avatar for account menu

**Bottom Navigation Bar**
- Contains 4-5 most important actions
- Role-specific actions based on user type
- Indication of current section
- Optional badge notifications

**Gestures and Interactions**
- Swipe gestures for common actions
- Pull to refresh for content updates
- Long press for additional options
- Back gesture navigation support

### Search Functionality Placement

**Global Search**
- Accessible from header on all pages
- Expands to show recent searches
- Offers search suggestions as typing
- Can filter results by content type

**Contextual Search**
- Section-specific search within current context
- Advanced filters relevant to current section
- Preserves search parameters during navigation within section
- Displays recent searches within context

**Search Results Presentation**
- Grouped by content type
- Quick filters to narrow results
- Summary showing match counts by category
- Option to expand search to all content

## 7. URL Structure

### URL Naming Conventions and Patterns

**Base URL Pattern**
- `https://tavara.care/[section]/[subsection]/[item-identifier]`

**Section Naming Conventions**
- Use lowercase, hyphenated names for all URL segments
- Keep URLs as short as practical while maintaining clarity
- Use nouns rather than verbs in URL paths
- Prefer singular nouns for resource types (e.g., `/profile` not `/profiles`)

**Specific URL Patterns by Section**

| Section | Pattern | Example |
|---------|---------|---------|
| Authentication | `/auth/[action]` | `/auth/login`, `/auth/reset-password` |
| Dashboards | `/dashboard/[role]` | `/dashboard/family`, `/dashboard/professional` |
| Registration | `/registration/[role]` | `/registration/family`, `/registration/professional` |
| Features | `/[role]/features-overview` | `/family/features-overview` |
| Profiles | `/profile/[user-id]` | `/profile/12345` |
| Care Matching | `/caregiver-matching` or `/family-matching` | `/caregiver-matching?location=chicago` |
| Training | `/professional/training-resources/module/[module-id]/lesson/[lesson-id]` | `/professional/training-resources/module/care-basics/lesson/2` |
| Messages | `/messages/[conversation-id]` | `/messages/conversation-12345` |
| Support | `/faq`, `/contact`, `/help/[article-id]` | `/help/payment-issues` |
| Admin | `/dashboard/admin/[section]` | `/dashboard/admin/user-management` |

### Parameter Handling and Requirements

**Common Query Parameters**

| Parameter | Purpose | Format | Example |
|-----------|---------|--------|---------|
| `sort` | Defines list sorting | `field:direction` | `sort=date:desc` |
| `filter` | Filters results | `field:value` | `filter=specialty:elderly` |
| `page` | Pagination control | integer | `page=2` |
| `limit` | Results per page | integer | `limit=20` |
| `search` | Search term | string | `search=CPR+certified` |
| `location` | Geographic filter | string, coordinates | `location=chicago` or `location=41.8781,-87.6298` |
| `radius` | Search radius | number+unit | `radius=10mi` |

**Parameter Usage Rules**
- Use query parameters for filtering, sorting, and pagination
- Use path segments for identifying resources
- Boolean flags use presence/absence rather than true/false values
- Arrays represented as comma-separated values or multiple parameters
- Special characters in parameters must be properly encoded

### SEO Considerations for URLs

**SEO Best Practices**
- Keep URLs descriptive but concise (under 60 characters when possible)
- Include relevant keywords in URLs
- Avoid URL parameters for important content pages
- Use hyphens (not underscores) to separate words
- Maintain a logical hierarchy reflecting site structure

**URL Stability Principles**
- Once published, URLs should not change
- If content moves, implement 301 redirects from old URLs
- Content type should be identifiable from URL pattern
- Avoid exposing database IDs in user-facing URLs when possible

### Redirect Handling for Legacy URLs

**Redirect Implementation**
- Maintain a redirect map in the application
- All redirects should be HTTP 301 (permanent)
- Log redirect usage to identify frequently accessed legacy URLs
- Legacy URL patterns must redirect to equivalent new URL patterns

**Common Redirect Scenarios**
- Renamed sections or features
- Restructured content hierarchies
- Moved content between sections
- Changed URL parameter formats
- Consolidated duplicate content

### Canonical URL Guidelines

**Canonical URL Definition**
- Every page must specify a canonical URL
- The canonical URL is the preferred, authoritative version of the page
- Parameters that don't change core content should not affect canonical URL

**Implementation Rules**
- Include `<link rel="canonical" href="https://tavara.care/canonical-path" />` in all pages
- Pagination parameters don't change canonical except for paginated series
- Sort and filter parameters don't affect canonical URL
- Session and tracking parameters must not affect canonical URL

### URL Character Limitations

- Maximum total URL length: 2048 characters
- Path segments: Alphanumeric characters, hyphens only
- No spaces in URLs (use hyphens instead)
- Avoid special characters except when properly encoded
- Case sensitivity: All URLs should be lowercase
- Trailing slashes: Standardize on no trailing slash and redirect URLs with trailing slashes

### Localization in URLs

**Future Implementation**
- Localization will use language code subdirectories: `https://tavara.care/es/[path]`
- Default language (English) may omit language code
- Content available in multiple languages will use hreflang annotations
- Language detection will suggest but not force language-specific URLs

## 8. Content Ownership

### Content Responsibility Matrix

| Content Type | Creation Responsibility | Approval Needed | Update Frequency | Archival Policy |
|--------------|-------------------------|----------------|------------------|----------------|
| Marketing Pages | Marketing Team | CMO | Quarterly review | Maintain version history |
| Feature Descriptions | Product Team | Product Manager | With feature updates | Maintain historical descriptions |
| Help Articles | Support Team | Support Manager | Monthly review | Archive outdated articles |
| Training Modules | Professional Development | Compliance Officer | Bi-annual review | Maintain previous versions |
| Legal Documents | Legal Team | Legal Counsel | As regulations change | Maintain all versions indefinitely |
| User Profiles | Users | None (flaggable) | User-driven | Hidden when inactive > a year |
| Community Posts | Users | None (moderated) | User-driven | Archive after 1 year inactivity |
| System Notifications | System Admin | Product Manager | With system updates | Archive after 30 days |

### Update Frequency Expectations by Section

**High-Frequency Updates (Daily/Weekly)**
- User-generated content (profiles, posts, listings)
- Job opportunities and care needs
- Community message boards
- System notifications and alerts

**Medium-Frequency Updates (Monthly/Quarterly)**
- Feature descriptions and tutorials
- FAQ and help content
- Training resources and modules
- Marketing landing pages

**Low-Frequency Updates (Semi-annually/Annually)**
- Legal documents and policies
- About pages and company information
- Core user flow and onboarding content
- Accessibility and compliance information

### Content Approval Workflows by Section

**Marketing Content Workflow**
1. Draft creation (Marketing Team)
2. Internal review (Marketing Manager)
3. Stakeholder review (Product Team)
4. Final approval (CMO)
5. Publication and distribution

**Product Documentation Workflow**
1. Draft creation (Product Team)
2. Technical review (Engineering)
3. User experience review (UX Team)
4. Final approval (Product Manager)
5. Publication with feature release

**Community Content Moderation Workflow**
1. User submission
2. Automated moderation (prohibited content)
3. Community flagging mechanism
4. Moderator review (when flagged)
5. Content resolution (approve, edit, or remove)

**Training Content Workflow**
1. Draft creation (Subject Matter Expert)
2. Content review (Professional Development)
3. Compliance review (Legal/Compliance)
4. User testing (selected users)
5. Final approval (Professional Development Lead)
6. Publication and announcement

### Static vs. Dynamic Content Areas

**Static Content Areas**
- Company information pages
- Core feature descriptions
- Legal documents and policies
- Process explanations and tutorials
- Value propositions and marketing claims

**Dynamic Content Areas**
- User profiles and portfolios
- Job listings and care needs
- Community discussions and resources
- Ratings and reviews
- Usage statistics and analytics
- Notifications and alerts

**Mixed Content Areas**
- Dashboard (static structure, dynamic data)
- Directory listings (static categories, dynamic entries)
- Training modules (static lessons, dynamic progress)
- Help center (static articles, dynamic recommendations)

## 9. Metadata Requirements

### Page Title Conventions

**Title Format**
- `[Page-Specific Title] | [Section] | Tavara.Care`
- Maximum length: 60 characters (including brand name)
- Lead with most specific, unique content
- Include primary keyword for page content

**Title Construction by Section**

| Section | Format | Example |
|---------|--------|---------|
| Home | `[Tagline] | Tavara.Care` | "Quality Caregiving, Instantly Available | Tavara.Care" |
| Features | `[Feature Category] Features | Tavara.Care` | "Family Features | Tavara.Care" |
| Profile | `[Name]'s Profile | Tavara.Care` | "Jane Smith's Profile | Tavara.Care" |
| Dashboard | `[Role] Dashboard | Tavara.Care` | "Professional Dashboard | Tavara.Care" |
| Care Match | `Caregivers in [Location] | Tavara.Care` | "Caregivers in Chicago | Tavara.Care" |
| Help | `[Topic] Help | Support | Tavara.Care` | "Payment Help | Support | Tavara.Care" |
| Training | `[Module Title] | Training | Tavara.Care` | "Basic Care Skills | Training | Tavara.Care" |

### Meta Description Standards

**Description Format**
- Unique, compelling summary of page content
- 120-155 characters
- Include call-to-action where appropriate
- Contain primary and secondary keywords
- No duplicate descriptions across pages

**Description Templates by Section**

| Section | Format | Example |
|---------|--------|---------|
| Home | "Tavara.Care connects [audience] with [benefit]. [Unique value]. Start [action] today." | "Tavara.Care connects families with qualified caregivers. Find compassionate care for any duration, instantly. Start your search today." |
| Feature | "[Feature set] helps [audience] [benefit]. Learn how Tavara.Care [unique advantage]." | "Family features help care recipients find perfect matches. Learn how Tavara.Care makes finding qualified caregivers simple and secure." |
| Profile | "[Role] profile for [Name] specializing in [specialty]. [Experience] of experience available through Tavara.Care." | "Caregiver profile for Jane Smith specializing in elderly care. 10+ years of experience available through Tavara.Care." |
| Dashboard | "Manage your [role] activities, [key function] and [key function]. Access your Tavara.Care dashboard." | "Manage your family care plans, caregiver connections and care schedules. Access your Tavara.Care dashboard." |
| Help | "Learn about [topic]: [brief description of solution]. Find more help at Tavara.Care." | "Learn about payment options: methods, timing, and troubleshooting. Find more help at Tavara.Care." |

### Open Graph Requirements

**Required Open Graph Tags**
- `og:title` - Same as page title or slightly modified for social context
- `og:description` - Same as meta description
- `og:type` - "website" for general pages, "profile" for user profiles
- `og:url` - Canonical URL of the page
- `og:image` - High-quality image representing page content
- `og:site_name` - "Tavara.Care"

**Image Specifications**
- Primary OG image: 1200×630 pixels
- Minimum size: 600×315 pixels
- Aspect ratio: 1.91:1
- Format: PNG or JPG
- Text limited to 20% of image area

**Content Type-Specific Tags**
- Profiles: Include `og:profile:first_name`, `og:profile:last_name`, `og:profile:username`
- Locations: Include `og:latitude`, `og:longitude` for care services with specific locations
- Articles: Include `og:article:published_time`, `og:article:author`

### Schema.org Implementation

**Core Schema Types by Section**

| Section | Schema Type | Properties |
|---------|-------------|------------|
| Organization | `Organization` | name, logo, url, contactPoint, sameAs |
| Profiles | `Person` | name, image, description, jobTitle, knowsAbout |
| Care Services | `Service` | name, description, provider, serviceType, areaServed |
| Training | `Course` | name, description, provider, courseCode, hasCourseInstance |
| Events | `Event` | name, startDate, endDate, location, organizer |
| Reviews | `Review` | itemReviewed, reviewRating, author, datePublished |
| FAQ | `FAQPage` with `Question` and `Answer` | name, text, acceptedAnswer |

**Implementation Method**
- JSON-LD format in document head
- Dynamic generation based on page content
- Testing with Google's Structured Data Testing Tool
- Regular audits for schema compliance

### Required Metadata by Page Type

**All Pages**
- Title tag
- Meta description
- Canonical URL
- Viewport settings
- Open Graph basic tags
- Twitter card tags

**Home/Landing Pages**
- Schema.org Organization
- Extended Open Graph for site representation
- Primary feature keywords
- Location availability meta tags

**Profile Pages**
- Schema.org Person
- Professional credentials structured data
- Availability information
- Service area specifications

**Care Service Pages**
- Schema.org Service
- Pricing information structured data
- Availability structured data
- Geographic service area data

**Training Content**
- Schema.org Course and CourseInstance
- Learning time estimates
- Prerequisite information
- Certification details

## 10. Future Expansion Areas

### Planned Additions to Site Structure

1. **Enhanced Matching Platform** (Q3 2024)
   - AI-powered matching algorithm
   - Video introduction integration
   - Real-time availability checking
   - Instant booking capabilities
   - Background verification automation

2. **Advanced Family Portal** (Q4 2024)
   - Digital care journal
   - Medication management tools
   - Care team collaboration features
   - Integrated calendar sharing
   - Care recipient profile expansion

3. **Professional Development Hub** (Q1 2025)
   - Expanded certification programs
   - Peer mentoring network
   - Career advancement resources
   - Professional networking tools
   - Continuing education tracking

4. **Community Expansion** (Q2 2025)
   - Resource exchange marketplace
   - Community events calendar
   - Volunteer matching system
   - Support group facilitation
   - Knowledge base contributions

5. **International Expansion** (2025)
   - Multi-language support
   - Region-specific compliance
   - International payment processing
   - Location-based feature availability
   - Cultural adaptation of content

### Deprecated Sections and Sunset Timeline

1. **Legacy Messaging System**
   - To be replaced: Q3 2024
   - Transition period: 2 months
   - Data migration: Automatic
   - User notification: 30 days before sunset

2. **Original Profile Templates**
   - To be replaced: Q4 2024
   - Transition period: 3 months
   - Migration: Guided user update process
   - User notification: 60 days before sunset

3. **Basic Search Functionality**
   - To be replaced: Q1 2025
   - Transition: Gradual feature enhancement
   - Backward compatibility: 6 months
   - User education: Tutorial on new search features

4. **Manual Verification Process**
   - To be replaced: Q2 2025
   - Transition: Phased rollout of automation
   - Hybrid period: 3 months
   - User impact: Streamlined verification experience

### Beta/Experimental Sections

1. **AI Care Assistant** (Beta Q3 2024)
   - Limited release to premium subscribers
   - Feedback collection mechanism
   - Iterative improvement cycle
   - Estimated full release: Q1 2025

2. **Predictive Care Needs** (Experimental Q4 2024)
   - Opt-in data collection
   - Research partnership with universities
   - Focus group testing
   - Potential integration timeline: Q3 2025

3. **Virtual Care Observation** (Concept Testing Q1 2025)
   - Limited feasibility study
   - Regulatory and privacy assessment
   - User acceptance research
   - Go/no-go decision: Q2 2025

4. **Care Outcome Tracking** (Beta Q2 2025)
   - Healthcare provider partnerships
   - Anonymized data analysis
   - Impact measurement framework
   - Validation period: 6 months

---

## Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | July 2024 | Product Team | Initial documentation of site structure |
| 0.9 | June 2024 | Product Team | Draft review with stakeholders |
| 0.8 | May 2024 | Product Team | Preliminary structure documentation |

