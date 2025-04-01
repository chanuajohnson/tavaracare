
# TAVARA.CARE UI Style Guide 1.0

## 1. Brand Identity

### Company Mission and Vision
**Mission:** To make quality caregiving instantly accessible to those who need it most, when they need it.

**Vision:** Creating a world where personalized care is available to everyone, revolutionizing how caregiving is delivered by connecting families with qualified caregivers on demand.

### Target Audience
- **Care Recipients/Families:**
  - Adults (35-65) coordinating care for elderly parents
  - Parents of children with special needs
  - Individuals recovering from surgery or illness
  - Family members living at a distance from loved ones requiring care

- **Caregivers:**
  - Professional caregivers with formal training
  - Healthcare students seeking flexible opportunities
  - Certified nursing assistants (CNAs)
  - Experienced family caregivers transitioning to professional roles

### Core Brand Values
- **Reliability:** Consistent, dependable service when people need it most
- **Compassion:** Genuine care and empathy in every interaction
- **Accessibility:** Simple, intuitive design that works for all users
- **Transparency:** Clear communication about processes, pricing, and expectations
- **Security:** Maintaining privacy and building trust through secure systems

## 2. Color Palette

### Primary Colors
- **TAVARA Blue** (Primary brand color)
  - Hex: #4A89DC
  - RGB: 74, 137, 220
  - Usage: Main brand identifier, primary buttons, key interactive elements

- **TAVARA Teal** (Secondary brand color)
  - Hex: #3CBBB4
  - RGB: 60, 187, 180
  - Usage: Secondary brand elements, progress indicators, highlights

### Secondary Colors
- **Calm Purple**
  - Hex: #967ADC
  - RGB: 150, 122, 220
  - Usage: Feature highlights, secondary buttons, accent elements

- **Nurturing Green**
  - Hex: #37BC9B
  - RGB: 55, 188, 155
  - Usage: Success states, positive feedback, wellness indicators

### Accent Colors
- **Warm Orange**
  - Hex: #F6BB42
  - RGB: 246, 187, 66
  - Usage: Call-to-actions, important notifications, energy points

- **Alert Red**
  - Hex: #E9573F
  - RGB: 233, 87, 63
  - Usage: Errors, warnings, critical notifications

### Neutral Colors
- **Dark Slate**
  - Hex: #434A54
  - RGB: 67, 74, 84
  - Usage: Primary text, headings

- **Medium Gray**
  - Hex: #AAB2BD
  - RGB: 170, 178, 189
  - Usage: Secondary text, borders, dividers

- **Light Gray**
  - Hex: #E6E9ED
  - RGB: 230, 233, 237
  - Usage: Backgrounds, disabled states

- **Pure White**
  - Hex: #FFFFFF
  - RGB: 255, 255, 255
  - Usage: Backgrounds, cards, contrasting elements

### Background Colors
- Primary Background: Light Gray (#E6E9ED)
- Card Background: Pure White (#FFFFFF)
- Alternate Background: Very Light Blue (#F5F7FA)

### Text Colors
- Primary Text on Light Background: Dark Slate (#434A54)
- Secondary Text on Light Background: Medium Gray (#AAB2BD)
- Text on Dark Background: Pure White (#FFFFFF)
- Disabled Text: Medium Gray at 50% opacity

### Accessibility Considerations
- All color combinations must meet WCAG AA standard (contrast ratio of at least 4.5:1 for normal text and 3:1 for large text)
- Primary interactive elements must have a contrast ratio of at least 3:1 against adjacent colors
- Never use color as the only means of conveying information
- Provide text alternatives when using color to indicate status or meaning

## 3. Typography

### Font Families
- **Primary Font:** Inter
  - Web-safe alternatives: Helvetica Neue, Arial, sans-serif
  - Usage: All UI text, content, buttons

- **Secondary Font:** Merriweather
  - Web-safe alternatives: Georgia, Times New Roman, serif
  - Usage: Testimonials, featured quotes, occasional headings for contrast

### Font Sizes
- **Headings:**
  - H1: 36px/2.25rem (mobile: 28px/1.75rem)
  - H2: 30px/1.875rem (mobile: 24px/1.5rem)
  - H3: 24px/1.5rem (mobile: 20px/1.25rem)
  - H4: 20px/1.25rem (mobile: 18px/1.125rem)
  - H5: 18px/1.125rem (mobile: 16px/1rem)
  - H6: 16px/1rem (mobile: 14px/0.875rem)

- **Body Text:**
  - Body Regular: 16px/1rem
  - Body Small: 14px/0.875rem
  - Caption: 12px/0.75rem

- **Other Elements:**
  - Button Text: 16px/1rem
  - Navigation: 16px/1rem
  - Form Labels: 14px/0.875rem
  - Form Input: 16px/1rem
  - Helper Text: 12px/0.75rem
  - Error Message: 14px/0.875rem

### Font Weights
- Light: 300 (used sparingly for large headings only)
- Regular: 400 (body text, labels, captions)
- Medium: 500 (emphasis, subheadings)
- Semibold: 600 (headings, buttons, important UI elements)
- Bold: 700 (primary headings, strong emphasis)

### Line Heights
- Headings: 1.2 times the font size
- Body Text: 1.5 times the font size
- Buttons and UI elements: 1.2 times the font size
- Single line elements: 1 times the font size

### Letter Spacing
- Headings: -0.01em
- Body Text: 0
- ALL CAPS text: 0.05em
- Buttons: 0.01em

### Text Alignment
- Body text should typically be left-aligned
- Center alignment for short headings, buttons, and isolated UI elements
- Avoid justified text
- Right alignment only for specific UI elements where appropriate (e.g., numeric values in tables)

## 4. Button Styles

### Primary Buttons
- Background: TAVARA Blue (#4A89DC)
- Text: White (#FFFFFF)
- Border: None
- Border Radius: 8px
- Padding: 12px 24px (adjusts with button size)
- Font: Inter Semibold, 16px
- Shadow: 0 2px 4px rgba(0, 0, 0, 0.1)

### Secondary Buttons
- Background: White (#FFFFFF)
- Text: TAVARA Blue (#4A89DC)
- Border: 1.5px solid TAVARA Blue (#4A89DC)
- Border Radius: 8px
- Padding: 12px 24px (adjusts with button size)
- Font: Inter Semibold, 16px
- Shadow: None

### Tertiary Buttons (Text Buttons)
- Background: Transparent
- Text: TAVARA Blue (#4A89DC)
- Border: None
- Padding: 12px 16px
- Font: Inter Medium, 16px
- Underline: None (appears on hover)

### Button States

#### Primary Button States
- **Default:** As described above
- **Hover:** Slightly darker blue (#3D7BCD), cursor: pointer
- **Focus:** Blue with 3px outline in lighter blue (#4A89DC with 3px outline in #97BEFC), visible focus ring
- **Active/Pressed:** Darker blue (#3671C5)
- **Disabled:** Light gray background (#E6E9ED), medium gray text (#AAB2BD), no shadow, cursor: not-allowed

#### Secondary Button States
- **Default:** As described above
- **Hover:** Light blue background (#EDF2FB), cursor: pointer
- **Focus:** 3px outline in light blue (#97BEFC), visible focus ring
- **Active/Pressed:** Slightly darker blue border (#3D7BCD), light blue background (#E1EBFA)
- **Disabled:** Light gray border and text (#AAB2BD), cursor: not-allowed

#### Tertiary Button States
- **Default:** As described above
- **Hover:** Text darkens slightly (#3D7BCD), cursor: pointer
- **Focus:** 3px outline in light blue (#97BEFC), visible focus ring
- **Active/Pressed:** Darker blue text (#3671C5)
- **Disabled:** Medium gray text (#AAB2BD), cursor: not-allowed

### Button Sizes
- **Large:** Padding 16px 32px, font-size 18px, height 56px
  - Use: Primary CTAs, hero sections
- **Medium:** Padding 12px 24px, font-size 16px, height 48px
  - Use: Most interface buttons
- **Small:** Padding 8px 16px, font-size 14px, height 36px
  - Use: Inline actions, compact UI areas

### Icon Buttons
- **Icon Only:**
  - Square aspect ratio
  - Clear visual affordance
  - Minimum tap target 44x44px
  - Tooltip on hover for clarity

- **Icon with Text:**
  - Icon positioned either left or right of text
  - 8px spacing between icon and text
  - Icons should be 20px for medium buttons
  - Icons align with the vertical center of text

### Button Placement Guidelines
- Primary actions aligned to the right in multi-button containers
- Single primary button centered on mobile views
- Maintain 16px minimum spacing between adjacent buttons
- Button width should be proportional to label length (avoid overly wide buttons)
- Full-width buttons on mobile for important actions
- Buttons should be placed in predictable, consistent locations throughout the interface

## 5. Form Elements

### Text Input Fields
- **Default State:**
  - Border: 1px solid Medium Gray (#AAB2BD)
  - Background: White (#FFFFFF)
  - Text: Dark Slate (#434A54)
  - Border Radius: 8px
  - Padding: 12px 16px
  - Height: 48px

- **Focus State:**
  - Border: 2px solid TAVARA Blue (#4A89DC)
  - Background: White (#FFFFFF)
  - Box Shadow: 0 0 0 3px rgba(74, 137, 220, 0.2)

- **Error State:**
  - Border: 2px solid Alert Red (#E9573F)
  - Background: White (#FFFFFF)
  - Box Shadow: 0 0 0 3px rgba(233, 87, 63, 0.2)
  - Error text below field: Alert Red (#E9573F)

- **Disabled State:**
  - Border: 1px solid Light Gray (#E6E9ED)
  - Background: Light Gray (#E6E9ED)
  - Text: Medium Gray (#AAB2BD)
  - Cursor: not-allowed

### Dropdown Menus and Select Components
- Follows similar styling as text inputs
- Custom chevron icon indicating dropdown functionality
- Selected value displayed in the same style as text input
- Dropdown menu with 8px border radius
- 8px padding for dropdown items
- Hover and selected states with Light Gray (#E6E9ED) background

### Checkboxes and Radio Buttons
- **Checkboxes:**
  - Size: 20px x 20px
  - Border: 1.5px solid Medium Gray (#AAB2BD)
  - Border Radius: 4px
  - Checked state: TAVARA Blue (#4A89DC) background with white checkmark
  - Focus state: 3px outline in light blue (#97BEFC)

- **Radio Buttons:**
  - Size: 20px x 20px
  - Border: 1.5px solid Medium Gray (#AAB2BD)
  - Border Radius: 50%
  - Checked state: White outer circle with TAVARA Blue (#4A89DC) inner circle
  - Focus state: 3px outline in light blue (#97BEFC)

### Toggle Switches
- Height: 24px
- Width: 44px
- Border Radius: 12px (fully rounded)
- Off State: Medium Gray (#AAB2BD) with white toggle
- On State: TAVARA Blue (#4A89DC) with white toggle
- Transition: Smooth 0.2s transition

### Date Pickers
- Input field follows text input guidelines
- Calendar dropdown with 8px border radius and 1px border
- Current date highlighted with subtle background
- Selected date with TAVARA Blue (#4A89DC) background
- Navigation arrows with clear hover states
- Day names and month as column/row headers

### Error and Validation Message Display
- Error messages positioned directly below the related field
- Color: Alert Red (#E9573F)
- Font: Inter Regular, 14px
- Icon: Small alert icon preceding the message
- Validation success: Brief green checkmark or success message
- Real-time validation when appropriate

### Form Layout Guidelines
- Single column layout preferred
- Consistent vertical spacing (24px between fields)
- Logical grouping of related fields with group headings
- Required fields indicated by asterisk (*)
- Clear section dividers for multi-part forms
- Contextual help via tooltips for complex fields
- Prominent labels positioned above fields
- Responsive layouts that adapt to screen size

## 6. Spacing and Layout

### Grid System
- Base on a 12-column grid system
- Gutters: 24px between columns
- Fluid columns that adapt to screen width
- Maintain consistent vertical and horizontal rhythm

### Spacing Scale
- **4px base unit with the following scale:**
  - 4px (0.25rem) - Tiny spacing (between inline elements)
  - 8px (0.5rem) - Extra small spacing (tight internal padding)
  - 16px (1rem) - Small spacing (standard padding, spacing between related items)
  - 24px (1.5rem) - Medium spacing (spacing between components)
  - 32px (2rem) - Large spacing (section padding)
  - 48px (3rem) - Extra large spacing (between major sections)
  - 64px (4rem) - Huge spacing (page margins, major landmarks)

### Margin and Padding Standards
- Consistent margins for components of the same type
- Padding inside containers: 24px standard (16px on mobile)
- Section margins: 48px top and bottom (32px on mobile)
- Form field padding: 12px vertical, 16px horizontal
- Card padding: 24px (16px on mobile)

### Content Container Widths
- Max width for content: 1200px
- Narrow content (like forms): 600px max-width
- Medium width content: 800px max-width
- Full bleed sections where appropriate
- Consistent padding from viewport edges: 24px (16px on mobile)

### Vertical Rhythm Guidelines
- Consistent spacing ratios between headings and content
- Paragraph spacing: 16px between paragraphs
- Section spacing: 48px between major sections
- Subsection spacing: 32px between related content blocks
- Maintain baseline grid for text elements

## 7. Responsive Breakpoints

### Device Breakpoint Definitions
- **Mobile Small:** < 375px
- **Mobile:** 375px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px - 1439px
- **Large Desktop:** ≥ 1440px

### Responsive Behavior
- Mobile-first design approach
- Fluid layouts that adapt to available space
- Strategic breakpoints based on content rather than specific devices
- Critical content prioritized at all screen sizes

### Component-Specific Responsive Behavior
- **Navigation:** Collapsible menu on mobile, horizontal on larger screens
- **Grids:** Stack on mobile, 2-columns on tablet, 3+ columns on desktop
- **Typography:** Reduced font sizes on mobile (see Typography section)
- **Buttons:** Full-width on small screens, natural width on larger screens
- **Forms:** Full-width inputs on mobile, optimized layouts on larger screens
- **Tables:** Horizontal scroll or responsive reflow on small screens
- **Cards:** Full-width on mobile, grid layout on larger screens

### Mobile-Specific UI Adjustments
- Touch targets minimum 44px × 44px
- Simplified interactions for touch input
- Critical actions visible without scrolling
- Reduced visual complexity
- Bottom navigation for key actions
- Collapsible sections to conserve space

## 8. Component Library

### Cards and Containers
- **Standard Card:**
  - White background
  - 8px border radius
  - 1px border in Light Gray (#E6E9ED)
  - 4px subtle shadow
  - 24px padding (16px on mobile)
  - Clear hierarchy of information

- **Feature Card:**
  - Similar to standard card with added visual emphasis
  - May include accent color top border or icon
  - Slightly larger shadow

- **Container Types:**
  - Content containers (centered, max-width)
  - Full-bleed containers (edge-to-edge)
  - Split containers (side-by-side content)
  - Nested containers (for complex layouts)

### Navigation Elements
- **Main Navigation:**
  - Clear active states
  - Consistent placement
  - Mobile-adaptable

- **Breadcrumbs:**
  - Light gray separators
  - Current page non-clickable
  - Truncation for long paths

- **Pagination:**
  - Numbered pages with clear current state
  - Previous/Next buttons
  - "..." for truncated page numbers
  - Mobile-friendly controls

### Alerts and Notifications
- **Success Alert:**
  - Green background (#37BC9B at 10% opacity)
  - Green text (#37BC9B)
  - Green success icon
  - 8px border radius

- **Warning Alert:**
  - Orange background (#F6BB42 at 10% opacity)
  - Orange text (#F6BB42 darker variant)
  - Warning icon
  - 8px border radius

- **Error Alert:**
  - Red background (#E9573F at 10% opacity)
  - Red text (#E9573F)
  - Error icon
  - 8px border radius

- **Info Alert:**
  - Blue background (#4A89DC at 10% opacity)
  - Blue text (#4A89DC)
  - Info icon
  - 8px border radius

- **Toast Notifications:**
  - Brief, non-disruptive
  - Appear at top or bottom of screen
  - Auto-dismiss after 5 seconds
  - Option to manually dismiss

### Modals and Dialogs
- **Standard Modal:**
  - White background
  - 12px border radius
  - 32px padding (24px on mobile)
  - Clear header and close button
  - Semitransparent overlay behind
  - 600px maximum width
  - Centered on screen

- **Dialog Types:**
  - Confirmation dialog
  - Form dialog
  - Alert dialog
  - Feature tour dialog

### Loading States and Indicators
- **Spinner:**
  - Circular animation
  - TAVARA Blue (#4A89DC)
  - 3 size options (small, medium, large)

- **Progress Bar:**
  - Linear indicator
  - TAVARA Blue (#4A89DC) fill
  - Light gray background
  - 4px height
  - 4px border radius

- **Skeleton Screens:**
  - Placeholder content during loading
  - Light gray backgrounds (#E6E9ED)
  - Pulsing animation
  - Match actual content layout

### Tables and Data Display
- **Tables:**
  - Subtle header background
  - Alternating row colors (optional)
  - Adequate cell padding (12px vertical, 16px horizontal)
  - Clear borders or dividers
  - Responsive options for small screens

- **Data Visualization:**
  - Consistent color coding
  - Clear labels
  - Appropriate chart types for data
  - Interactive elements where needed

### Avatars and User Identification
- **Avatars:**
  - Circular format
  - Multiple size options (24px, 32px, 48px, 64px)
  - Placeholder for missing images
  - Option for status indicator

- **User Cards:**
  - Compact representation of user info
  - Avatar + name + role/status
  - Action options where appropriate

### Tooltips and Popovers
- **Tooltips:**
  - Simple text information
  - Dark background (#434A54)
  - White text
  - 4px border radius
  - Appears on hover or focus
  - 8px padding
  - Small arrow pointer to trigger element

- **Popovers:**
  - Richer content than tooltips
  - White background
  - 8px border radius
  - 12px padding
  - Shadow for depth
  - Can contain interactive elements

## 9. Imagery and Icons

### Icon Style Guidelines
- **Icon System:** Line icons with consistent 1.5px stroke weight
- **Size Options:**
  - Small: 16x16px
  - Medium: 24x24px
  - Large: 32x32px
- **Color:** Inherit from text color by default
- **Special States:** Specific colors for status or alerts
- **Touch Targets:** Ensure 44x44px minimum tap target when interactive
- **Consistency:** Use from a single icon family for visual harmony

### Image Aspect Ratios and Treatment
- **Hero Images:** 16:9 or 2:1 aspect ratio
- **Profile Photos:** 1:1 (square, displayed as circle)
- **Feature Images:** 3:2 aspect ratio
- **Thumbnails:** 1:1 aspect ratio
- **Image Treatment:** Consistent photographic style
- **Overlay Text:** Ensure adequate contrast for text overlaid on images
- **Responsive Images:** Multiple resolutions for different devices

### Illustration Style
- **Style:** Simple, friendly illustrations with consistent line weights
- **Colors:** Utilize brand color palette
- **Purpose:** Enhance understanding, not just decoration
- **Consistency:** Maintain unified illustration style throughout
- **Accessibility:** Never rely solely on illustrations to convey critical information

### Empty State Design
- **Components:**
  - Simple illustration representing the empty state
  - Clear, friendly heading
  - Brief explanation text
  - Call-to-action when appropriate
- **Style:** Helpful and encouraging, not error-like
- **Placement:** Centered in the available space
- **Sizing:** Proportional to the container

## 10. Animation and Transitions

### Transition Timing Functions
- **Default Easing:** Ease-out (cubic-bezier(0.0, 0.0, 0.2, 1))
- **Entry Animations:** Ease-out
- **Exit Animations:** Ease-in (cubic-bezier(0.4, 0.0, 1, 1))
- **Emphasis Animations:** Ease-in-out for bounces or special attention

### Animation Duration Standards
- **Extra Fast:** 100ms (micro-interactions, button states)
- **Fast:** 200ms (simple transitions, hover states)
- **Medium:** 300ms (standard transitions, page elements)
- **Slow:** 500ms (emphasis animations, major transitions)
- **Never exceed 700ms** for standard interface animations

### Hover and Interaction Animations
- **Buttons:** Subtle background/color change, 200ms
- **Cards:** Slight elevation increase, 200ms
- **Interactive Elements:** Clear state change, 200ms
- **Links:** Color change, optional underline animation, 150ms
- **Form Controls:** Smooth state transitions, 200ms

### Page Transition Effects
- **Page Entry:** Fade in, slight move up (300ms)
- **Page Exit:** Quick fade out (200ms)
- **Between Sections:** Content-aware transitions
- **Modal Open:** Fade in with slight scale up (300ms)
- **Modal Close:** Quick fade out (200ms)
- **Mobile Considerations:** Simplified transitions for performance

## Implementation Guidelines

All UI elements should be implemented using the guidelines above to ensure a consistent, accessible, and professional user experience across the TAVARA.CARE platform. This style guide should be regularly updated as the design system evolves.

When implementing new features or components not explicitly covered in this guide, designers and developers should adhere to the established patterns and principles while consulting with the design team for guidance.
