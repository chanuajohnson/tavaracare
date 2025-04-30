
# Technical Infrastructure

## User Journey Tracking System
The Tavara.care platform uses a sophisticated tracking system to understand user behavior and optimize the experience:

1. **Core Tracking Components**:
   - `UserJourneyTracker.tsx`: Tracks key stages in the user journey
   - `PageViewTracker.tsx`: Automatically tracks page views with context
   - `DashboardTracker.tsx`: Tracks dashboard-specific interactions
   - `MatchingTracker.tsx`: Tracks matching behavior and preferences
   - `SubscriptionTrackingButton.tsx`: Tracks premium feature interest

2. **Journey Stages Tracked**:
   - Discovery: Initial platform exploration
   - Authentication: Login and signup processes
   - Profile Creation: Registration steps and completion
   - Feature Discovery: Exploring available features
   - Matching Exploration: Using caregiver/family matching
   - Subscription Consideration: Viewing premium features
   - Active Usage: Return visits and engagement patterns

3. **Database Structure**:
   ```
   cta_engagement_tracking
     - user_id (UUID or null for anonymous)
     - session_id (Text for cross-session tracking)
     - action_type (Type of action performed)
     - additional_data (JSONB with contextual information)
     - created_at (Timestamp)
   ```

4. **Conversion Funnels Tracked**:
   - Visitor to Signup
   - Signup to Profile Completion
   - Profile Completion to Matching
   - Matching to Subscription

## Authentication System

The authentication system uses Supabase with custom enhancements:

1. **Key Components**:
   - AuthProvider: Central state management for auth
   - Role-based access control with user roles
   - Custom session handling with timeout recovery
   - Redirect logic based on profile completion

2. **Security Features**:
   - Row-Level Security policies for data protection
   - Role verification on sensitive operations
   - Session timeout detection and recovery
