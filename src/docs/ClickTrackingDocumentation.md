# Tavara Click Tracking System Documentation

This document provides a comprehensive breakdown of the click tracking implementation across the Tavara platform. The tracking system captures user interactions to generate metrics for conversion rates, feature engagement, and user journey analysis.

## Table of Contents
1. [Overview](#overview)
2. [Implementation Details](#implementation-details)
3. [Tracking by Page](#tracking-by-page)
4. [Tracking by User Type](#tracking-by-user-type)
5. [Button-Specific Tracking](#button-specific-tracking)
6. [Reporting Capabilities](#reporting-capabilities)
7. [Technical Implementation](#technical-implementation)

## Overview

The click tracking system logs user interactions with various interface elements, focusing primarily on call-to-action buttons, navigation events, and feature engagement. This data is stored in Supabase and used to analyze:

- Conversion rates (click-to-signup, signup-to-matching)
- Feature popularity and engagement
- User journey paths
- Premium feature interest

Each tracked event contains:
- User ID (if authenticated)
- Session ID (for anonymous tracking)
- Timestamp
- Action type (e.g., 'button_click', 'page_view')
- Additional contextual data

## Implementation Details

### Database Schema

The tracking system uses the `cta_engagement_tracking` table in Supabase with the following structure:

```sql
CREATE TABLE public.cta_engagement_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NULL,
  session_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  additional_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

### Tracking Function

The core tracking function used across components:

```typescript
const trackEngagement = async (actionType: string, additionalData = {}) => {
  try {
    const sessionId = localStorage.getItem('session_id') || uuidv4();
    
    if (!localStorage.getItem('session_id')) {
      localStorage.setItem('session_id', sessionId);
    }
    
    const { error } = await supabase.from('cta_engagement_tracking').insert({
      user_id: user?.id || null,
      action_type: actionType,
      session_id: sessionId,
      additional_data: additionalData
    });
    
    if (error) {
      console.error("Error tracking engagement:", error);
    }
  } catch (error) {
    console.error("Error in trackEngagement:", error);
  }
};
```

## Tracking by Page

### Home/Landing Page
- **View Hero Section**: `landing_hero_view`
- **CTA Button Clicks**: `landing_cta_click`
- **Feature Section Views**: `landing_features_view`
- **Testimonial Views**: `landing_testimonials_view`

### Authentication Pages
- **Login Page View**: `auth_login_view`
- **Signup Page View**: `auth_signup_view`
- **Login Attempt**: `auth_login_attempt`
- **Signup Attempt**: `auth_signup_attempt`
- **Password Reset Request**: `auth_password_reset_request`
- **Successful Authentication**: `auth_success`

### Family Dashboard
- **Dashboard View**: `family_dashboard_view`
- **Caregiver Matches View**: `dashboard_caregiver_matches_view`
- **Profile Completion CTA**: `profile_completion_cta_click`
- **Unlock Profile Click**: `unlock_profile_click`
- **View All Matches Click**: `view_all_matches_click`
- **Filter Toggle**: `filter_toggle_click`
- **Care Type Filter Change**: `care_type_filter_change`
- **Availability Filter Change**: `availability_filter_change`
- **Distance Range Change**: `distance_range_change`
- **Price Range Change**: `price_range_change`
- **Trained Caregivers Filter Toggle**: `trained_caregivers_filter_toggle`

### Caregiver Matching Page
- **Page View**: `caregiver_matching_page_view`
- **Premium Matching CTA Click**: `premium_matching_cta_click`
- **Unlock Profile Click**: `unlock_profile_click`
- **Filter Interactions**: Various `filter_*` events

### Registration Pages
- **Registration Start**: `registration_start`
- **Registration Step Complete**: `registration_step_complete`
- **Registration Complete**: `registration_complete`

### Subscription Pages
- **Subscription Page View**: `subscription_page_view`
- **Subscription Features Page View**: `subscription_features_view`
- **Plan Selection**: `subscription_plan_select`
- **Checkout Start**: `subscription_checkout_start`
- **Subscription Success**: `subscription_success`

## Tracking by User Type

### Anonymous Users
- Session-based tracking for conversion analysis
- Page views
- CTA clicks
- Signup conversion events

### Family Users
- Profile completion actions
- Caregiver matching interactions
- Subscription interest
- Feature engagement

### Caregiver Users
- Profile completion
- Training module engagement
- Job application actions
- Community engagement

### Admin Users
- Admin dashboard access
- User management actions
- Content management

## Button-Specific Tracking

### Authentication Buttons
- **Login Button**: `auth_login_attempt`
- **Signup Button**: `auth_signup_attempt`
- **Reset Password Button**: `auth_password_reset_request`

### Dashboard Buttons
- **Complete Profile Button**: Tracks clicks with `profile_completion_cta_click`
- **View All Matches Button**: Tracks clicks with `view_all_matches_click`
- **Show/Hide Filters Button**: Tracks toggle state with `filter_toggle_click`

### Caregiver Matching Buttons
- **Unlock Profile Button**: Tracks clicks with `unlock_profile_click` and includes caregiver ID
  ```typescript
  trackEngagement('unlock_profile_click', { caregiver_id: caregiverId });
  ```
- **Upgrade Now Button**: Tracks premium feature interest with `premium_matching_cta_click`

### Subscription Buttons
- **Upgrade Plans**: Tracks clicks with plan details
- **Subscribe Now**: Tracks conversion events

## Reporting Capabilities

The tracking system enables the following reporting capabilities:

### Conversion Funnels
- **Visitor to Signup**: Track anonymous users through signup process
- **Signup to Profile Completion**: Measure onboarding effectiveness
- **Profile Completion to Matching**: Evaluate core feature adoption
- **Matching to Subscription**: Measure premium conversion rate

### Engagement Metrics
- **Feature Popularity**: Most viewed/used features
- **User Retention**: Return visit patterns
- **Session Duration**: Time spent on platform

### A/B Testing Support
- Compare different UI versions with consistent tracking events
- Evaluate conversion rate changes between variants

## Technical Implementation

### Event Listener Implementation

The click tracking is implemented through:

1. **Direct Button Handlers**: For specific user actions
   ```typescript
   const handleUnlockProfile = (caregiverId: string) => {
     trackEngagement('unlock_profile_click', { caregiver_id: caregiverId });
     navigate("/subscription-features", { 
       state: { /* state details */ } 
     });
   };
   ```

2. **useEffect Hooks**: For page view events
   ```typescript
   useEffect(() => {
     const trackPageView = async () => {
       if (user) {
         await trackEngagement('dashboard_caregiver_matches_view');
       }
     };
     
     trackPageView();
   }, [user]);
   ```

3. **Component Event Handlers**: For UI interaction events

### Session Management

The system uses browser localStorage to maintain session identity:

```typescript
const sessionId = localStorage.getItem('session_id') || uuidv4();
if (!localStorage.getItem('session_id')) {
  localStorage.setItem('session_id', sessionId);
}
```

### Data Storage

All events are stored in the Supabase `cta_engagement_tracking` table for analysis.

## Example Implementation: Unlock Profile Button

Here's a detailed breakdown of how the "Unlock Profile" button tracking is implemented:

```typescript
// Component definition
const DashboardCaregiverMatches = () => {
  // ...other code
  
  // Tracking function
  const trackEngagement = async (actionType: string, additionalData = {}) => {
    try {
      const sessionId = localStorage.getItem('session_id') || uuidv4();
      
      if (!localStorage.getItem('session_id')) {
        localStorage.setItem('session_id', sessionId);
      }
      
      const { error } = await supabase.from('cta_engagement_tracking').insert({
        user_id: user?.id || null,
        action_type: actionType,
        session_id: sessionId,
        additional_data: additionalData
      });
      
      if (error) {
        console.error("Error tracking engagement:", error);
      }
    } catch (error) {
      console.error("Error in trackEngagement:", error);
    }
  };

  // Button click handler
  const handleUnlockProfile = (caregiverId: string) => {
    // Track the click event with contextual data
    trackEngagement('unlock_profile_click', { caregiver_id: caregiverId });
    
    // Navigate to subscription page
    navigate("/subscription-features", { 
      state: { 
        returnPath: "/caregiver-matching",
        featureType: "Premium Profiles",
        caregiverId: caregiverId
      } 
    });
  };
  
  // Button in the UI
  return (
    <Button 
      variant="default"
      className="w-full"
      onClick={() => handleUnlockProfile(caregiver.id)}
    >
      Unlock Profile
    </Button>
  );
};
```

This implementation ensures that:
1. Each click is logged with the specific caregiver ID
2. The user is redirected to the appropriate subscription page
3. The original context is preserved for the return journey

## Enhancing the Tracking System

To improve the current implementation, consider:

1. **Adding Context Dimensions**: Expand the `additional_data` to include more context like:
   - User role
   - User subscription status
   - Device type/browser
   - Referral source

2. **Real-time Analytics**: Implement a dashboard that shows real-time click events

3. **Segmentation Analysis**: Add tools to analyze behavior by user segments

4. **Funnel Visualization**: Create visual representations of conversion funnels

By continuing to refine and expand this tracking system, Tavara can gain deeper insights into user behavior and optimize the platform for improved engagement and conversion rates.
