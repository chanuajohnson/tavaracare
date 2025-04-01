
# Tavara Click Tracking System Documentation: Comprehensive Edition

This document provides a thorough and detailed breakdown of the click tracking implementation across the Tavara platform. The tracking system captures user interactions to generate metrics for conversion rates, feature engagement, user journey analysis, and provides a complete mapping of the user journey through the platform.

## Table of Contents

1. [Overview](#overview)
2. [Implementation Architecture](#implementation-architecture)
3. [Tracking by Page](#tracking-by-page)
   - [Home/Landing Page](#homelanding-page)
   - [Authentication Pages](#authentication-pages)
   - [Family Dashboard](#family-dashboard)
   - [Professional Dashboard](#professional-dashboard)
   - [Community Dashboard](#community-dashboard)
   - [Admin Dashboard](#admin-dashboard)
   - [Caregiver Matching Page](#caregiver-matching-page)
   - [Family Matching Page](#family-matching-page)
   - [Registration Pages](#registration-pages)
   - [Subscription Pages](#subscription-pages)
   - [About Page](#about-page)
   - [Features Page](#features-page)
   - [Professional Training Resources Page](#professional-training-resources-page)
   - [Message Board Page](#message-board-page)
   - [Module Viewer Page](#module-viewer-page)
   - [FAQ Page](#faq-page)
4. [Tracking by User Type](#tracking-by-user-type)
   - [Anonymous Users](#anonymous-users)
   - [Family Users](#family-users)
   - [Professional/Caregiver Users](#professionalcaregiver-users)
   - [Community Users](#community-users)
   - [Admin Users](#admin-users)
5. [Button-Specific Tracking](#button-specific-tracking)
6. [User Journey Mapping](#user-journey-mapping)
7. [Conversion Funnels](#conversion-funnels)
8. [Engagement Metrics](#engagement-metrics)
9. [A/B Testing Support](#ab-testing-support)
10. [Technical Implementation](#technical-implementation)
11. [Data Analysis and Reporting](#data-analysis-and-reporting)

## Overview

The click tracking system logs user interactions with various interface elements, focusing primarily on call-to-action buttons, navigation events, and feature engagement. This data is stored in Supabase and used to analyze:

- Conversion rates across multiple funnels
- Feature popularity and engagement
- User journey paths
- Premium feature interest
- Session duration and retention patterns
- A/B testing results

Each tracked event contains:
- User ID (if authenticated)
- Session ID (for anonymous tracking)
- Timestamp
- Action type (e.g., 'button_click', 'page_view')
- Additional contextual data

## Implementation Architecture

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

### Core Tracking Function

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

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Page Load | Page View | `landing_page_view` | `{ referrer: document.referrer }` |
| Hero Section | Section View | `landing_hero_view` | `{ hero_version: 'v1' }` |
| Primary CTA Button | Button Click | `landing_primary_cta_click` | `{ button_text: 'Get Started', position: 'hero' }` |
| Secondary CTA Button | Button Click | `landing_secondary_cta_click` | `{ button_text: 'Learn More', position: 'hero' }` |
| Feature Section | Section View | `landing_features_view` | `{ section_name: 'features' }` |
| Feature Card Click | Card Click | `landing_feature_card_click` | `{ feature_name: 'Feature Name' }` |
| Testimonial Section | Section View | `landing_testimonials_view` | `{ section_name: 'testimonials' }` |
| Testimonial Card Click | Card Click | `landing_testimonial_click` | `{ testimonial_id: 'id' }` |
| Navigation Link Click | Link Click | `landing_nav_click` | `{ link_text: 'Features', destination: '/features' }` |
| Footer Link Click | Link Click | `landing_footer_link_click` | `{ link_text: 'About', destination: '/about' }` |

### Authentication Pages

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Login Page Load | Page View | `auth_login_view` | `{ referrer: document.referrer }` |
| Signup Page Load | Page View | `auth_signup_view` | `{ referrer: document.referrer }` |
| Reset Password Page Load | Page View | `auth_reset_password_view` | `{ referrer: document.referrer }` |
| Login Form Submit | Form Submit | `auth_login_attempt` | `{ success: true/false, error_message: '...' }` |
| Signup Form Submit | Form Submit | `auth_signup_attempt` | `{ success: true/false, error_message: '...' }` |
| Reset Password Request | Form Submit | `auth_password_reset_request` | `{ success: true/false }` |
| Switch to Signup | Link Click | `auth_switch_to_signup` | `{}` |
| Switch to Login | Link Click | `auth_switch_to_login` | `{}` |
| Forgot Password Link | Link Click | `auth_forgot_password_click` | `{}` |
| Successful Login | Auth Event | `auth_login_success` | `{ user_role: 'family/professional/community/admin' }` |
| Successful Signup | Auth Event | `auth_signup_success` | `{ user_role: 'family/professional/community/admin' }` |
| Failed Login | Auth Event | `auth_login_failure` | `{ error_message: '...' }` |
| Failed Signup | Auth Event | `auth_signup_failure` | `{ error_message: '...' }` |

### Family Dashboard

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Dashboard Load | Page View | `family_dashboard_view` | `{ profile_completion: '80%' }` |
| Caregiver Matches View | Section View | `dashboard_caregiver_matches_view` | `{ matches_count: 5 }` |
| Profile Completion Card View | Card View | `profile_completion_card_view` | `{ completion_percentage: 75 }` |
| Complete Profile Button | Button Click | `profile_completion_cta_click` | `{ completion_percentage: 75 }` |
| Unlock Profile Button | Button Click | `unlock_profile_click` | `{ caregiver_id: 'id' }` |
| View All Matches Button | Button Click | `view_all_matches_click` | `{}` |
| Filter Toggle Button | Button Click | `filter_toggle_click` | `{ is_expanded: true/false }` |
| Care Type Filter | Filter Change | `care_type_filter_change` | `{ selected_types: ['elderly', 'special_needs'] }` |
| Availability Filter | Filter Change | `availability_filter_change` | `{ availability: ['morning', 'evening'] }` |
| Distance Range Slider | Filter Change | `distance_range_change` | `{ distance_km: 15 }` |
| Price Range Slider | Filter Change | `price_range_change` | `{ min_price: 20, max_price: 40 }` |
| Trained Caregivers Filter | Filter Toggle | `trained_caregivers_filter_toggle` | `{ is_checked: true/false }` |
| Next Steps Section View | Section View | `next_steps_section_view` | `{ tasks_count: 3, completed_count: 1 }` |
| Task Item Click | List Item Click | `task_item_click` | `{ task_id: 'id', task_name: 'Complete Profile' }` |
| View All Tasks Button | Button Click | `view_all_tasks_click` | `{}` |
| Logout Button | Button Click | `logout_click` | `{ session_duration_seconds: 1200 }` |

### Professional Dashboard

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Dashboard Load | Page View | `professional_dashboard_view` | `{ profile_completion: '65%' }` |
| Family Matches View | Section View | `dashboard_family_matches_view` | `{ matches_count: 3 }` |
| Job Listings View | Section View | `job_listings_view` | `{ jobs_count: 4 }` |
| Training Modules View | Section View | `training_modules_view` | `{ modules_count: 5, completed_count: 2 }` |
| Job Card Click | Card Click | `job_card_click` | `{ job_id: 'id', job_title: 'Elderly Care' }` |
| View All Jobs Button | Button Click | `view_all_jobs_click` | `{}` |
| Profile Completion Card View | Card View | `profile_completion_card_view` | `{ completion_percentage: 65 }` |
| Complete Profile Button | Button Click | `profile_completion_cta_click` | `{ completion_percentage: 65 }` |
| Training Module Card Click | Card Click | `training_module_card_click` | `{ module_id: 'id', module_title: 'Basics of Care' }` |
| Training Progress View | Component View | `training_progress_view` | `{ progress_percentage: 40 }` |
| View All Training Button | Button Click | `view_all_training_click` | `{}` |
| Next Steps Section View | Section View | `next_steps_section_view` | `{ tasks_count: 4, completed_count: 1 }` |
| Task Item Click | List Item Click | `task_item_click` | `{ task_id: 'id', task_name: 'Complete Training' }` |
| Community Engagement View | Section View | `community_engagement_view` | `{ posts_count: 3 }` |
| Community Post Click | Card Click | `community_post_click` | `{ post_id: 'id', post_title: 'Weekly Meetup' }` |

### Community Dashboard

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Dashboard Load | Page View | `community_dashboard_view` | `{ profile_completion: '55%' }` |
| Events Calendar View | Component View | `events_calendar_view` | `{ events_count: 5 }` |
| Event Card Click | Card Click | `event_card_click` | `{ event_id: 'id', event_name: 'Support Group Meeting' }` |
| Resource Library View | Component View | `resource_library_view` | `{ resources_count: 12 }` |
| Resource Card Click | Card Click | `resource_card_click` | `{ resource_id: 'id', resource_name: 'Caregiving Tips PDF' }` |
| Profile Completion Card View | Card View | `profile_completion_card_view` | `{ completion_percentage: 55 }` |
| Complete Profile Button | Button Click | `profile_completion_cta_click` | `{ completion_percentage: 55 }` |
| Community Forum View | Component View | `community_forum_view` | `{ topics_count: 8 }` |
| Forum Topic Click | List Item Click | `forum_topic_click` | `{ topic_id: 'id', topic_title: 'Transportation Solutions' }` |
| Next Steps Section View | Section View | `next_steps_section_view` | `{ tasks_count: 3, completed_count: 1 }` |

### Admin Dashboard

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Dashboard Load | Page View | `admin_dashboard_view` | `{}` |
| User Management View | Tab View | `admin_user_management_view` | `{ users_count: 150 }` |
| Feature Interest Tracker View | Tab View | `admin_feature_interest_view` | `{ data_points: 500 }` |
| User Row Click | Table Row Click | `admin_user_row_click` | `{ user_id: 'id', user_email: 'email' }` |
| Edit User Button | Button Click | `admin_edit_user_click` | `{ user_id: 'id' }` |
| Delete User Button | Button Click | `admin_delete_user_click` | `{ user_id: 'id' }` |
| Feature Interest Chart Interaction | Chart Interaction | `admin_feature_chart_interaction` | `{ chart_type: 'bar', action: 'filter' }` |
| Export Data Button | Button Click | `admin_export_data_click` | `{ data_type: 'users/features/engagement' }` |
| Feature Table Filter Change | Filter Change | `admin_feature_filter_change` | `{ filter_type: 'date_range', value: '7d' }` |

### Caregiver Matching Page

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Page Load | Page View | `caregiver_matching_page_view` | `{ results_count: 10 }` |
| Filter Panel View | Component View | `caregiver_filter_panel_view` | `{}` |
| Filter Toggle | Button Click | `filter_toggle_click` | `{ is_expanded: true/false }` |
| Care Type Filter | Filter Change | `care_type_filter_change` | `{ selected_types: ['elderly', 'special_needs'] }` |
| Availability Filter | Filter Change | `availability_filter_change` | `{ availability: ['morning', 'evening'] }` |
| Distance Range Slider | Filter Change | `distance_range_change` | `{ distance_km: 15 }` |
| Price Range Slider | Filter Change | `price_range_change` | `{ min_price: 20, max_price: 40 }` |
| Trained Caregivers Filter | Filter Toggle | `trained_caregivers_filter_toggle` | `{ is_checked: true/false }` |
| Caregiver Card View | Card View | `caregiver_card_view` | `{ caregiver_id: 'id' }` |
| Caregiver Card Click | Card Click | `caregiver_card_click` | `{ caregiver_id: 'id' }` |
| Unlock Profile Button | Button Click | `unlock_profile_click` | `{ caregiver_id: 'id', subscription_status: 'none/active' }` |
| Contact Caregiver Button | Button Click | `contact_caregiver_click` | `{ caregiver_id: 'id', subscription_status: 'none/active' }` |
| Premium Matching CTA | Button Click | `premium_matching_cta_click` | `{}` |
| Sort Dropdown Change | Dropdown Change | `caregiver_sort_change` | `{ sort_by: 'rating', direction: 'desc' }` |
| Pagination Click | Button Click | `caregiver_pagination_click` | `{ page_number: 2, results_per_page: 10 }` |

### Family Matching Page

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Page Load | Page View | `family_matching_page_view` | `{ results_count: 8 }` |
| Filter Panel View | Component View | `family_filter_panel_view` | `{}` |
| Filter Toggle | Button Click | `filter_toggle_click` | `{ is_expanded: true/false }` |
| Care Type Filter | Filter Change | `care_type_filter_change` | `{ selected_types: ['elderly', 'special_needs'] }` |
| Location Filter | Filter Change | `location_filter_change` | `{ locations: ['downtown', 'east_end'] }` |
| Family Card View | Card View | `family_card_view` | `{ family_id: 'id' }` |
| Family Card Click | Card Click | `family_card_click` | `{ family_id: 'id' }` |
| View Family Details Button | Button Click | `view_family_details_click` | `{ family_id: 'id', subscription_status: 'none/active' }` |
| Contact Family Button | Button Click | `contact_family_click` | `{ family_id: 'id', subscription_status: 'none/active' }` |
| Premium Matching CTA | Button Click | `premium_matching_cta_click` | `{}` |
| Sort Dropdown Change | Dropdown Change | `family_sort_change` | `{ sort_by: 'date', direction: 'desc' }` |
| Pagination Click | Button Click | `family_pagination_click` | `{ page_number: 2, results_per_page: 10 }` |

### Registration Pages

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Family Registration Page Load | Page View | `family_registration_view` | `{ referrer: document.referrer }` |
| Professional Registration Page Load | Page View | `professional_registration_view` | `{ referrer: document.referrer }` |
| Community Registration Page Load | Page View | `community_registration_view` | `{ referrer: document.referrer }` |
| Registration Step Change | Step Change | `registration_step_change` | `{ from_step: 1, to_step: 2, user_type: 'family' }` |
| Registration Form Field Focus | Field Focus | `registration_field_focus` | `{ field_name: 'care_types', user_type: 'family' }` |
| Registration Form Field Blur | Field Blur | `registration_field_blur` | `{ field_name: 'care_types', is_valid: true/false, user_type: 'family' }` |
| Registration Form Submit | Form Submit | `registration_form_submit` | `{ success: true/false, step: 2, user_type: 'family' }` |
| Registration Step Complete | Step Complete | `registration_step_complete` | `{ step: 2, user_type: 'family' }` |
| Registration Complete | Process Complete | `registration_complete` | `{ user_id: 'id', user_type: 'family', time_to_complete_sec: 180 }` |
| Registration Error | Error | `registration_error` | `{ step: 2, field: 'email', message: 'Invalid email', user_type: 'family' }` |

### Subscription Pages

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Subscription Page Load | Page View | `subscription_page_view` | `{ referrer: document.referrer }` |
| Subscription Features Page Load | Page View | `subscription_features_view` | `{ referrer: document.referrer, feature_type: 'Premium Profiles' }` |
| Plan Card View | Card View | `subscription_plan_card_view` | `{ plan_id: 'id', plan_name: 'Premium' }` |
| Plan Feature Hover | Hover | `subscription_plan_feature_hover` | `{ feature_name: 'Unlimited Matches', plan_id: 'id' }` |
| Plan Selection | Button Click | `subscription_plan_select` | `{ plan_id: 'id', plan_name: 'Premium', price: 29.99 }` |
| Checkout Start | Process Start | `subscription_checkout_start` | `{ plan_id: 'id', plan_name: 'Premium', price: 29.99 }` |
| Payment Method Selection | Selection | `subscription_payment_method_select` | `{ method: 'credit_card/paypal' }` |
| Checkout Form Submit | Form Submit | `subscription_checkout_submit` | `{ success: true/false, plan_id: 'id' }` |
| Subscription Success | Process Complete | `subscription_success` | `{ user_id: 'id', plan_id: 'id', plan_name: 'Premium' }` |
| Subscription Error | Error | `subscription_error` | `{ step: 'payment', message: 'Card declined' }` |
| Feature Section View | Section View | `subscription_feature_section_view` | `{ section_name: 'Communication', feature_count: 4 }` |
| Back to Previous Page | Button Click | `subscription_back_click` | `{ return_path: '/caregiver-matching' }` |

### About Page

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Page Load | Page View | `about_page_view` | `{ referrer: document.referrer }` |
| Story Card Click | Card Click | `about_story_card_click` | `{ is_expanded: true/false }` |
| Mission Card Click | Card Click | `about_mission_card_click` | `{ is_expanded: true/false }` |
| Vision Section View | Section View | `about_vision_section_view` | `{}` |
| Values Section View | Section View | `about_values_section_view` | `{}` |
| Platform Section View | Section View | `about_platform_section_view` | `{}` |
| Podcast Play Button | Button Click | `podcast_play_click` | `{ episode_name: 'Introduction to Tavara' }` |
| Subscribe to Podcast | Button Click | `podcast_subscribe_click` | `{ platform: 'all' }` |
| Platform Features Hover | Hover | `platform_feature_hover` | `{ feature_name: 'Care Management' }` |
| Navigation Menu Item Click | Menu Item Click | `about_nav_menu_click` | `{ menu_item: 'For Families', is_expanded: true/false }` |
| Join Community Button | Button Click | `join_community_click` | `{ position: 'bottom' }` |

### Features Page

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Page Load | Page View | `features_page_view` | `{ referrer: document.referrer }` |
| Feature Card View | Card View | `feature_card_view` | `{ feature_id: 'id', feature_name: 'Care Coordination' }` |
| Feature Card Click | Card Click | `feature_card_click` | `{ feature_id: 'id', feature_name: 'Care Coordination' }` |
| Upvote Feature Button | Button Click | `upvote_feature_click` | `{ feature_id: 'id', feature_name: 'Care Coordination', current_votes: 42 }` |
| Database Feature Card View | Card View | `database_feature_card_view` | `{ feature_id: 'id', feature_name: 'Medication Tracking' }` |
| Additional Feature Card View | Card View | `additional_feature_card_view` | `{ feature_id: 'id', feature_name: 'AI Care Assistant' }` |
| Tech Innovators Hub View | Section View | `tech_innovators_hub_view` | `{}` |
| Feature Filter Change | Filter Change | `feature_filter_change` | `{ filter_type: 'status', value: 'planned' }` |
| Feature Sort Change | Sort Change | `feature_sort_change` | `{ sort_by: 'votes', direction: 'desc' }` |

### Professional Training Resources Page

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Page Load | Page View | `training_resources_page_view` | `{ referrer: document.referrer }` |
| Training Module Card View | Card View | `training_module_card_view` | `{ module_id: 'id', module_name: 'Basics of Care' }` |
| Training Module Card Click | Card Click | `training_module_card_click` | `{ module_id: 'id', module_name: 'Basics of Care' }` |
| Progress Tracker View | Component View | `training_progress_tracker_view` | `{ progress_percentage: 35 }` |
| Get Started Today Button | Button Click | `training_get_started_click` | `{ module_id: 'id', module_name: 'Basics of Care' }` |
| Training Program Section View | Section View | `training_program_section_view` | `{}` |

### Message Board Page

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Page Load | Page View | `message_board_page_view` | `{ referrer: document.referrer }` |
| Post Card View | Card View | `message_post_card_view` | `{ post_id: 'id', post_title: 'Seeking Evening Care' }` |
| Post Card Click | Card Click | `message_post_card_click` | `{ post_id: 'id', post_title: 'Seeking Evening Care' }` |
| Filter Change | Filter Change | `message_board_filter_change` | `{ filter_type: 'post_type', value: 'job_opportunity' }` |
| Sort Change | Sort Change | `message_board_sort_change` | `{ sort_by: 'date', direction: 'desc' }` |
| Create Post Button | Button Click | `message_create_post_click` | `{}` |
| Contact Post Author Button | Button Click | `message_contact_author_click` | `{ post_id: 'id', subscription_status: 'none/active' }` |
| Premium Features Button | Button Click | `message_premium_features_click` | `{}` |

### Module Viewer Page

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Page Load | Page View | `module_viewer_page_view` | `{ module_id: 'id', lesson_id: 'id', referrer: document.referrer }` |
| Lesson Navigation Click | Button Click | `lesson_navigation_click` | `{ direction: 'next/prev', from_lesson_id: 'id', to_lesson_id: 'id' }` |
| Lesson Content Block View | Component View | `lesson_content_block_view` | `{ lesson_id: 'id', block_type: 'text/video/quiz' }` |
| Lesson Completion Button | Button Click | `lesson_completion_button_click` | `{ lesson_id: 'id', module_id: 'id' }` |
| Module Progress Update | System Event | `module_progress_update` | `{ module_id: 'id', progress_percentage: 65, completed_lessons: 4 }` |
| Lesson Content Interaction | Content Interaction | `lesson_content_interaction` | `{ interaction_type: 'video_play/quiz_answer', lesson_id: 'id' }` |
| Return to Modules Button | Button Click | `return_to_modules_click` | `{ current_module_id: 'id' }` |

### FAQ Page

| Element | Event Type | Action Type | Additional Data |
|---------|------------|-------------|----------------|
| Page Load | Page View | `faq_page_view` | `{ referrer: document.referrer }` |
| FAQ Category Click | Tab Click | `faq_category_click` | `{ category: 'Subscription' }` |
| FAQ Item Expand | Accordion Click | `faq_item_expand` | `{ question_id: 'id', question_text: 'How do I cancel?' }` |
| FAQ Item Collapse | Accordion Click | `faq_item_collapse` | `{ question_id: 'id', question_text: 'How do I cancel?' }` |
| Search FAQ | Search Input | `faq_search` | `{ search_term: 'cancel subscription', results_count: 3 }` |
| Contact Support Button | Button Click | `faq_contact_support_click` | `{ from_section: 'Subscription' }` |

## Tracking by User Type

### Anonymous Users

| Tracked Information | Event Types | Purpose |
|---------------------|------------|---------|
| Session ID | All events | Cross-session user identification |
| Page Views | `*_page_view` | Understanding entry points and popular pages |
| Landing Page Interactions | `landing_*` | Measuring initial engagement |
| Feature Interest | `feature_*`, `landing_feature_*` | Identifying appealing features |
| Auth Page Views | `auth_*_view` | Tracking path to authentication |
| FAQ Interactions | `faq_*` | Identifying common questions |
| Signup Conversion | `auth_signup_*` | Conversion rate analysis |
| Referrer Data | All page views | Traffic source analysis |
| Device & Browser | All events | Platform usage patterns |
| Time Spent | Session calculations | Engagement level metrics |

### Family Users

| Tracked Information | Event Types | Purpose |
|---------------------|------------|---------|
| All Anonymous Metrics | All anonymous events | Baseline comparison |
| Dashboard Engagement | `family_dashboard_*` | Feature usage patterns |
| Profile Completion | `profile_completion_*` | Onboarding funnel analysis |
| Caregiver Matching | `caregiver_*`, `unlock_profile_*` | Core feature usage |
| Filter Usage | `filter_*` | Search refinement patterns |
| Subscription Interest | `subscription_*`, `premium_*` | Conversion opportunity identification |
| Task Completion | `task_*`, `next_steps_*` | User progression tracking |
| Feature Exploration | Various feature-specific events | Feature popularity metrics |
| Session Frequency | Login patterns | Retention analysis |
| Communication Actions | `contact_*` | Connection initiation rate |

### Professional/Caregiver Users

| Tracked Information | Event Types | Purpose |
|---------------------|------------|---------|
| All Anonymous Metrics | All anonymous events | Baseline comparison |
| Dashboard Engagement | `professional_dashboard_*` | Feature usage patterns |
| Profile Completion | `profile_completion_*` | Onboarding funnel analysis |
| Family Matching | `family_*`, `view_family_details_*` | Core feature usage |
| Job Interactions | `job_*` | Job interest patterns |
| Training Engagement | `training_*`, `module_*`, `lesson_*` | Professional development metrics |
| Community Engagement | `community_*`, `message_*` | Network participation |
| Subscription Interest | `subscription_*`, `premium_*` | Conversion opportunity identification |
| Task Completion | `task_*`, `next_steps_*` | User progression tracking |
| Session Frequency | Login patterns | Retention analysis |

### Community Users

| Tracked Information | Event Types | Purpose |
|---------------------|------------|---------|
| All Anonymous Metrics | All anonymous events | Baseline comparison |
| Dashboard Engagement | `community_dashboard_*` | Feature usage patterns |
| Profile Completion | `profile_completion_*` | Onboarding funnel analysis |
| Event Interactions | `event_*` | Community event participation |
| Resource Usage | `resource_*` | Resource utilization patterns |
| Forum Engagement | `forum_*` | Discussion participation |
| Contribution Actions | Various contribution events | Community impact metrics |
| Session Frequency | Login patterns | Retention analysis |

### Admin Users

| Tracked Information | Event Types | Purpose |
|---------------------|------------|---------|
| Dashboard Usage | `admin_dashboard_*` | Admin tool usage patterns |
| User Management | `admin_user_*` | User administration patterns |
| Data Analysis | `admin_*_filter_*`, `admin_*_chart_*` | Analytics usage patterns |
| Export Actions | `admin_export_*` | Data export needs |
| Administrative Actions | Various admin actions | System management needs |

## Button-Specific Tracking

### Authentication Buttons

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Login Button | `auth_login_attempt` | `{ success: true/false, error_message: '...' }` | 
```typescript
const handleLogin = async (credentials) => {
  try {
    const result = await supabase.auth.signIn(credentials);
    if (result.error) {
      await trackEngagement('auth_login_attempt', { 
        success: false, 
        error_message: result.error.message 
      });
      return { error: result.error };
    }
    
    await trackEngagement('auth_login_attempt', { success: true });
    await trackEngagement('auth_login_success', { 
      user_role: result.user?.user_metadata?.role || 'family' 
    });
    return result;
  } catch (error) {
    await trackEngagement('auth_login_attempt', { 
      success: false, 
      error_message: error.message 
    });
    return { error };
  }
};
```

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Signup Button | `auth_signup_attempt` | `{ success: true/false, error_message: '...' }` | 
```typescript
const handleSignup = async (credentials) => {
  try {
    const result = await supabase.auth.signUp(credentials);
    if (result.error) {
      await trackEngagement('auth_signup_attempt', { 
        success: false, 
        error_message: result.error.message 
      });
      return { error: result.error };
    }
    
    await trackEngagement('auth_signup_attempt', { success: true });
    await trackEngagement('auth_signup_success', { 
      user_role: credentials.user_role || 'family' 
    });
    return result;
  } catch (error) {
    await trackEngagement('auth_signup_attempt', { 
      success: false, 
      error_message: error.message 
    });
    return { error };
  }
};
```

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Reset Password Button | `auth_password_reset_request` | `{ success: true/false, error_message: '...' }` | 
```typescript
const handlePasswordReset = async (email) => {
  try {
    const result = await supabase.auth.resetPasswordForEmail(email);
    if (result.error) {
      await trackEngagement('auth_password_reset_request', { 
        success: false, 
        error_message: result.error.message 
      });
      return { error: result.error };
    }
    
    await trackEngagement('auth_password_reset_request', { success: true });
    return result;
  } catch (error) {
    await trackEngagement('auth_password_reset_request', { 
      success: false, 
      error_message: error.message 
    });
    return { error };
  }
};
```

### Dashboard Buttons

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Complete Profile Button | `profile_completion_cta_click` | `{ completion_percentage: 75 }` | 
```typescript
const handleCompleteProfile = () => {
  trackEngagement('profile_completion_cta_click', { 
    completion_percentage: userProfile.completionPercentage 
  });
  navigate("/registration/family");
};
```

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| View All Matches Button | `view_all_matches_click` | `{}` | 
```typescript
const handleViewAllMatches = () => {
  trackEngagement('view_all_matches_click');
  navigate("/caregiver-matching");
};
```

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| View All Jobs Button | `view_all_jobs_click` | `{}` | 
```typescript
const handleViewAllJobs = () => {
  trackEngagement('view_all_jobs_click');
  navigate("/professional/message-board", { state: { filter: 'jobs' } });
};
```

### Caregiver Matching Buttons

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Unlock Profile Button | `unlock_profile_click` | `{ caregiver_id: 'id' }` | 
```typescript
const handleUnlockProfile = (caregiverId) => {
  trackEngagement('unlock_profile_click', { caregiver_id: caregiverId });
  navigate("/subscription-features", { 
    state: { 
      returnPath: "/caregiver-matching",
      featureType: "Premium Profiles",
      caregiverId: caregiverId
    } 
  });
};
```

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Premium Matching CTA | `premium_matching_cta_click` | `{}` | 
```typescript
const handlePremiumCTA = () => {
  trackEngagement('premium_matching_cta_click');
  navigate("/subscription-features", { 
    state: { 
      returnPath: "/caregiver-matching",
      featureType: "Premium Matching"
    } 
  });
};
```

### Training Resource Buttons

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Get Started Today Button | `training_get_started_click` | `{ module_id: 'id', module_name: 'Basics of Care' }` | 
```typescript
const handleGetStarted = (moduleId, moduleName) => {
  trackEngagement('training_get_started_click', { 
    module_id: moduleId, 
    module_name: moduleName 
  });
  toast({
    title: "Enrollment Request Received!",
    description: "We have your request logged and you will receive an email when this feature is live and launched.",
  });
};
```

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Lesson Completion Button | `lesson_completion_button_click` | `{ lesson_id: 'id', module_id: 'id' }` | 
```typescript
const handleLessonComplete = async (lessonId, moduleId) => {
  await trackEngagement('lesson_completion_button_click', { 
    lesson_id: lessonId, 
    module_id: moduleId 
  });
  
  const { error } = await updateLessonProgress(lessonId, moduleId);
  
  if (!error) {
    await trackEngagement('module_progress_update', { 
      module_id: moduleId, 
      progress_percentage: calculateProgressPercentage(moduleId),
      completed_lessons: countCompletedLessons(moduleId)
    });
  }
};
```

### About Page Buttons

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Podcast Play Button | `podcast_play_click` | `{ episode_name: 'Introduction to Tavara' }` | 
```typescript
const handlePodcastPlay = (episodeName) => {
  trackEngagement('podcast_play_click', { episode_name: episodeName });
  toast({
    title: "Podcast Request Received!",
    description: "We have your request logged and you will receive an email when this feature is live and launched.",
  });
};
```

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Subscribe to Podcast | `podcast_subscribe_click` | `{ platform: 'all' }` | 
```typescript
const handlePodcastSubscribe = (platform = 'all') => {
  trackEngagement('podcast_subscribe_click', { platform });
  toast({
    title: "Podcast Request Received!",
    description: "We have your request logged and you will receive an email when this feature is live and launched.",
  });
};
```

| Button | Action Type | Additional Data | Implementation Example |
|--------|------------|-----------------|------------------------|
| Join Community Button | `join_community_click` | `{ position: 'bottom' }` | 
```typescript
const handleJoinCommunity = (position) => {
  trackEngagement('join_community_click', { position });
  navigate("/dashboard/community");
};
```

## User Journey Mapping

The tracking system enables comprehensive user journey mapping across the platform, identifying common paths and conversion patterns:

### Anonymous User Journey

1. **Entry Path Tracking**: Track the initial landing page and referrer source
2. **Content Engagement**: Monitor which sections/features receive attention
3. **Conversion Points**: Identify where users decide to sign up
4. **Abandonment Points**: Pinpoint where users leave without converting

Example query for anonymous user journey analysis:
```sql
SELECT 
  session_id,
  array_agg(action_type ORDER BY created_at) as user_journey,
  min(created_at) as journey_start,
  max(created_at) as journey_end,
  count(*) as total_actions,
  EXTRACT(EPOCH FROM (max(created_at) - min(created_at)))/60 as journey_minutes
FROM cta_engagement_tracking
WHERE user_id IS NULL
GROUP BY session_id
HAVING count(*) > 5
ORDER BY journey_minutes DESC;
```

### Family User Onboarding Journey

1. **Registration Completion**: Track step-by-step progression through registration
2. **Profile Completion**: Monitor profile completion progress
3. **Feature Discovery**: Identify which features are explored first
4. **Match Engagement**: Track interactions with caregiver profiles
5. **Subscription Decision**: Monitor the path to subscription conversion

### Professional Development Journey

1. **Training Progression**: Track module-by-module completion
2. **Job Search Behavior**: Monitor job listing interactions
3. **Profile Enhancement**: Track profile completion steps
4. **Match Engagement**: Track interactions with family profiles
5. **Subscription Decision**: Monitor the path to subscription conversion

## Conversion Funnels

The tracking system enables detailed analysis of multiple conversion funnels:

### Visitor to Signup Funnel

**Tracked Event Sequence:**
1. `landing_page_view`
2. Various `landing_*` interactions
3. `auth_signup_view`
4. `auth_signup_attempt`
5. `auth_signup_success`

**Conversion Rate Calculation:**
```sql
WITH funnel_steps AS (
  SELECT
    session_id,
    COUNT(CASE WHEN action_type = 'landing_page_view' THEN 1 END) as step1,
    COUNT(CASE WHEN action_type = 'auth_signup_view' THEN 1 END) as step2,
    COUNT(CASE WHEN action_type = 'auth_signup_attempt' THEN 1 END) as step3,
    COUNT(CASE WHEN action_type = 'auth_signup_success' THEN 1 END) as step4
  FROM cta_engagement_tracking
  GROUP BY session_id
)
SELECT
  COUNT(CASE WHEN step1 > 0 THEN 1 END) as landing_visitors,
  COUNT(CASE WHEN step2 > 0 THEN 1 END) as signup_page_visitors,
  COUNT(CASE WHEN step3 > 0 THEN 1 END) as signup_attempts,
  COUNT(CASE WHEN step4 > 0 THEN 1 END) as successful_signups,
  ROUND(100.0 * COUNT(CASE WHEN step2 > 0 THEN 1 END) / NULLIF(COUNT(CASE WHEN step1 > 0 THEN 1 END), 0), 2) as landing_to_signup_page_rate,
  ROUND(100.0 * COUNT(CASE WHEN step3 > 0 THEN 1 END) / NULLIF(COUNT(CASE WHEN step2 > 0 THEN 1 END), 0), 2) as signup_page_to_attempt_rate,
  ROUND(100.0 * COUNT(CASE WHEN step4 > 0 THEN 1 END) / NULLIF(COUNT(CASE WHEN step3 > 0 THEN 1 END), 0), 2) as attempt_to_success_rate,
  ROUND(100.0 * COUNT(CASE WHEN step4 > 0 THEN 1 END) / NULLIF(COUNT(CASE WHEN step1 > 0 THEN 1 END), 0), 2) as overall_conversion_rate
FROM funnel_steps;
```

### Signup to Profile Completion Funnel

**Tracked Event Sequence:**
1. `auth_signup_success`
2. `family_dashboard_view` or `professional_dashboard_view`
3. `profile_completion_cta_click`
4. `registration_step_change` (multiple)
5. `registration_complete`

### Profile Completion to Matching Funnel

**Tracked Event Sequence:**
1. `registration_complete`
2. `dashboard_caregiver_matches_view` or `dashboard_family_matches_view`
3. `view_all_matches_click`
4. `caregiver_matching_page_view` or `family_matching_page_view`
5. `caregiver_card_click` or `family_card_click`
6. `unlock_profile_click` or `view_family_details_click`

### Matching to Subscription Funnel

**Tracked Event Sequence:**
1. `unlock_profile_click` or other premium feature interaction
2. `subscription_features_view`
3. `subscription_page_view`
4. `subscription_plan_select`
5. `subscription_checkout_start`
6. `subscription_success`

## Engagement Metrics

### Feature Popularity

Track which features receive the most engagement:

```sql
SELECT
  SUBSTRING(action_type FROM 1 FOR POSITION('_' IN action_type) - 1) as feature_category,
  COUNT(*) as interaction_count
FROM cta_engagement_tracking
WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY feature_category
ORDER BY interaction_count DESC;
```

### User Retention

Track return visit patterns:

```sql
WITH user_sessions AS (
  SELECT
    user_id,
    DATE_TRUNC('day', created_at) as session_day,
    COUNT(DISTINCT session_id) as daily_sessions
  FROM cta_engagement_tracking
  WHERE user_id IS NOT NULL
  GROUP BY user_id, DATE_TRUNC('day', created_at)
)
SELECT
  user_id,
  COUNT(DISTINCT session_day) as active_days,
  MAX(session_day) - MIN(session_day) as day_span,
  COUNT(DISTINCT session_day)::float / (EXTRACT(DAY FROM (MAX(session_day) - MIN(session_day))) + 1) as activity_ratio
FROM user_sessions
GROUP BY user_id
HAVING MAX(session_day) - MIN(session_day) > INTERVAL '7 days'
ORDER BY activity_ratio DESC;
```

### Session Duration

Calculate time spent on platform:

```sql
WITH session_times AS (
  SELECT
    session_id,
    MIN(created_at) as session_start,
    MAX(created_at) as session_end,
    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/60 as session_minutes
  FROM cta_engagement_tracking
  GROUP BY session_id
  HAVING COUNT(*) > 1
)
SELECT
  AVG(session_minutes) as avg_session_minutes,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY session_minutes) as median_session_minutes,
  MAX(session_minutes) as max_session_minutes
FROM session_times
WHERE session_minutes < 120; -- Filter out likely abandoned sessions
```

## A/B Testing Support

The tracking system supports A/B testing with:

1. **Variant Tracking**: Include variant information in the `additional_data`
   ```typescript
   trackEngagement('landing_primary_cta_click', { 
     button_text: 'Get Started', 
     position: 'hero',
     variant: 'variant_a' 
   });
   ```

2. **Conversion Analysis By Variant**: Compare conversion rates between variants
   ```sql
   WITH variant_conversions AS (
     SELECT
       t.session_id,
       MAX(CASE WHEN t.action_type = 'landing_page_view' AND 
                     t.additional_data->>'variant' = 'variant_a' THEN 1 ELSE 0 END) as variant_a_view,
       MAX(CASE WHEN t.action_type = 'landing_page_view' AND 
                     t.additional_data->>'variant' = 'variant_b' THEN 1 ELSE 0 END) as variant_b_view,
       MAX(CASE WHEN t.action_type = 'auth_signup_success' THEN 1 ELSE 0 END) as converted
     FROM cta_engagement_tracking t
     GROUP BY t.session_id
   )
   SELECT
     'Variant A' as variant,
     SUM(variant_a_view) as visitors,
     SUM(CASE WHEN variant_a_view = 1 AND converted = 1 THEN 1 ELSE 0 END) as conversions,
     ROUND(100.0 * SUM(CASE WHEN variant_a_view = 1 AND converted = 1 THEN 1 ELSE 0 END) / NULLIF(SUM(variant_a_view), 0), 2) as conversion_rate
   FROM variant_conversions
   UNION ALL
   SELECT
     'Variant B' as variant,
     SUM(variant_b_view) as visitors,
     SUM(CASE WHEN variant_b_view = 1 AND converted = 1 THEN 1 ELSE 0 END) as conversions,
     ROUND(100.0 * SUM(CASE WHEN variant_b_view = 1 AND converted = 1 THEN 1 ELSE 0 END) / NULLIF(SUM(variant_b_view), 0), 2) as conversion_rate
   FROM variant_conversions;
   ```

## Technical Implementation

### Integration with State Management

For React applications using React Query:

```typescript
// Hook for tracking engagement
export const useTrackEngagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const trackMutation = useMutation({
    mutationFn: async ({ actionType, additionalData = {} }) => {
      const sessionId = localStorage.getItem('session_id') || uuidv4();
      
      if (!localStorage.getItem('session_id')) {
        localStorage.setItem('session_id', sessionId);
      }
      
      return supabase.from('cta_engagement_tracking').insert({
        user_id: user?.id || null,
        action_type: actionType,
        session_id: sessionId,
        additional_data: additionalData
      });
    },
    onError: (error) => {
      console.error("Error tracking engagement:", error);
    }
  });
  
  const trackEngagement = (actionType, additionalData = {}) => {
    trackMutation.mutate({ actionType, additionalData });
  };
  
  return { trackEngagement };
};
```

### Page View Tracking with React Router

```typescript
// Component for tracking page views
export const PageViewTracker = () => {
  const location = useLocation();
  const { trackEngagement } = useTrackEngagement();
  
  useEffect(() => {
    // Extract page name from path
    const pageName = location.pathname.split('/').filter(Boolean).join('_') || 'home';
    
    // Track the page view
    trackEngagement(`${pageName}_page_view`, { 
      url: location.pathname,
      referrer: document.referrer
    });
  }, [location.pathname, trackEngagement]);
  
  return null;
};
```

### Component-Level View Tracking

```typescript
export const CaregiverCard = ({ caregiver }) => {
  const { trackEngagement } = useTrackEngagement();
  
  useEffect(() => {
    // Track that this card was viewed
    trackEngagement('caregiver_card_view', { 
      caregiver_id: caregiver.id 
    });
  }, [caregiver.id, trackEngagement]);
  
  const handleCardClick = () => {
    trackEngagement('caregiver_card_click', { 
      caregiver_id: caregiver.id 
    });
    // Navigate or expand card
  };
  
  // Component render
};
```

### Button Click Tracking HOC

```typescript
export const withClickTracking = (Component, actionType, getAdditionalData = () => ({})) => {
  return (props) => {
    const { trackEngagement } = useTrackEngagement();
    
    const handleClick = (...args) => {
      trackEngagement(actionType, getAdditionalData(props));
      
      if (props.onClick) {
        props.onClick(...args);
      }
    };
    
    return <Component {...props} onClick={handleClick} />;
  };
};

// Usage
const TrackingButton = withClickTracking(Button, 'premium_matching_cta_click', 
  (props) => ({ current_page: props.currentPage || 'unknown' })
);
```

## Data Analysis and Reporting

The tracking system enables powerful data analysis capabilities:

### Real-time Dashboards

Create dashboards showing:
- Current active users
- Top features being used
- Conversion rates
- Subscription rates

### Cohort Analysis

Track how different user cohorts behave:
- Users who registered in a specific month
- Users from different referral sources
- Users with different user roles

### Custom Reports

Generate reports for specific business questions:
- Which features lead to the highest conversion rates?
- What days/times have the highest user activity?
- Which user journeys result in the highest subscription rates?
- What is the average time to subscription?

### Data Export

Enable data export for detailed analysis in external tools:
- CSV exports of engagement data
- Conversion funnel reports
- User journey visualizations

## Enhancing the Tracking System

To improve the current implementation, consider:

1. **Adding More Context Dimensions**: Expand the `additional_data` to include more context like:
   - User role
   - User subscription status
   - Device type/browser
   - Referral source
   - Time on page

2. **Real-time Analytics**: Implement a dashboard that shows real-time click events

3. **Segmentation Analysis**: Add tools to analyze behavior by user segments

4. **Funnel Visualization**: Create visual representations of conversion funnels

5. **Retention Analysis**: Add tools to track user retention over time

6. **Custom Event Definitions**: Allow admin users to define custom events to track

7. **Advanced Filtering**: Enable filtering of tracking data by multiple dimensions

By continuing to refine and expand this tracking system, Tavara can gain deeper insights into user behavior and optimize the platform for improved engagement and conversion rates.
