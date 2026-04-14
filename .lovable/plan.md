

## Plan: Generate NarrateAI Context Document for Tavara

Create a markdown/text document summarizing Tavara's purpose, features, user roles, and key pages — optimized for NarrateAI to produce accurate voiceover narration.

### What I'll Create

A single file at `/mnt/documents/Tavara_NarrateAI_Context.md` containing:

1. **Application Overview** — Tavara.care is a care coordination platform based in Trinidad & Tobago. Tagline: "It takes a village to care." Connects families with professional caregivers, not as an employer/agency but as a managed coordination platform.

2. **Three User Roles**:
   - **Family** — Find caregivers, create care plans, track medications/appointments, manage payroll/NIS, coordinate care teams
   - **Professional** — Showcase qualifications, find care opportunities, manage client relationships, access training, daily checklists, NIS documentation
   - **Community** — Join care circles, share resources, volunteer, connect with families

3. **Key Platform Features**:
   - AI-powered caregiver matching with compatibility scores
   - Care plan creation and management
   - Payroll system with NIS (National Insurance) calculation, NI 184/187 form generation
   - Daily care checklists and shift logs
   - Bank transfer tracking for monthly NIS payments
   - Nurse Handbook & SOP documentation
   - TAV — AI virtual care coordinator assistant
   - Chat-based registration flow with form pre-fill

4. **Navigation & Page Map**:
   - Landing page (`/`) — role selection (Family, Professional, Community)
   - Auth (`/auth`) — login/registration
   - Family Dashboard (`/dashboard/family`) — care plans, team, schedule
   - Professional Dashboard (`/dashboard/professional`) — assignments, profile, admin tools
   - Care Management (`/family/care-management/:id`) — payroll, daily logs, care team, NIS reports
   - About (`/about`) — mission, values, story

5. **Positioning Language** — "Tavara helps you build, manage, and coordinate your care team." Families engage caregivers directly; Tavara coordinates, enforces standards, and manages quality.

6. **Values**: Empathy, Community, Innovation, Accessibility, Trust

7. **Technical Stack**: React, Supabase, Tailwind CSS, AI-powered chat

### Single file, no code changes needed — just artifact generation.

