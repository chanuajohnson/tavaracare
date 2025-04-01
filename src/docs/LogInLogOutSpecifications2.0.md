# Login/Logout System Specifications 2.0

## Version 1.0 (Current Implementation)

### 1. System Overview

The authentication system in Takes a Village implements a complete login/logout workflow with role-based registration and navigation paths. The system handles multiple user roles (family, professional, community, admin) with custom onboarding flows and dashboard redirection.

### 2. Technical Architecture

#### 2.1 Key Components

1. **AuthProvider (`src/components/providers/AuthProvider.tsx`)**
   - Central authentication state management
   - Session monitoring and persistence
   - Role determination and synchronization
   - Post-login/registration navigation logic
   - Loading state management with timeout safeguards
   - Protected route access control

2. **AuthPage (`src/pages/auth/AuthPage.tsx`)**
   - Combined login/signup UI with tabbed interface
   - Form submission handling
   - Role selection during registration
   - Error handling and user feedback

3. **LoginForm (`src/components/auth/LoginForm.tsx`)**
   - Email/password credential collection
   - Form validation
   - Loading state visualization
   - Error presentation

4. **SignupForm (`src/components/auth/SignupForm.tsx`)**
   - New user registration with email/password
   - Role selection (family, professional, community)
   - User metadata collection
   - Profile creation/update logic

5. **Navigation (`src/components/layout/Navigation.tsx`)**
   - Authentication-aware navigation links
   - Login/logout button states
   - Dashboards access

### 3. Authentication Flow

#### 3.1 Initial Authentication Check

1. On application load, `AuthProvider` initializes and:
   - Sets loading state with timeout protection (15 seconds)
   - Checks for existing session via `supabase.auth.getSession()`
   - Uses retry logic for role determination
   - Monitors session state changes via `onAuthStateChange` event

#### 3.2 Login Process

1. User enters email and password in the LoginForm
2. Form validates inputs (ensuring both fields are entered)
3. Form submits credentials to parent AuthPage
4. AuthPage calls Supabase authentication:
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password,
   });
   ```
5. AuthProvider detects auth state change (`SIGNED_IN` event)
6. Role determination process:
   - First checks user metadata for role
   - Falls back to database lookup in profiles table
   - Syncs role between metadata and database for consistency
7. Profile completeness check:
   - Verifies minimum required profile data exists
   - Determines if registration process is needed

#### 3.2.1 Password Reset Flow

1. **Password Reset Initiation**:
   - User clicks "Forgot Password" link on the login form
   - System displays password reset request form (`ResetPasswordForm` component)
   - User enters email address for account recovery
   - System sends password reset link via email using Supabase (`supabase.auth.resetPasswordForEmail()`)
   - Confirmation message displayed to user

2. **Password Reset Link Processing**:
   - User clicks email recovery link which directs to `/auth/reset-password` page
   - URL contains recovery token as a query parameter or hash fragment
   - System validates token via `supabase.auth.exchangeCodeForSession()`
   - **Current Issue**: After successful token validation, user is automatically logged in and cannot enter a new password
   - The reset password form briefly appears but then disappears as the automatic login redirects the user

3. **Password Update Process (Current Implementation)**:
   ```typescript
   // From ResetPasswordPage.tsx
   // Token validation code
   const { data, error } = await supabase.auth.exchangeCodeForSession(queryParams.get("code") || "");
   
   if (data?.user) {
     console.log("[ResetPasswordPage] Valid reset token for user:", data.user.email);
     setEmail(data.user.email || null);
     setMode("reset");
     setError(null);
     setTokenValidated(true);
     
     // This automatic login notification happens, but user cannot set new password
     toast.info("You've been automatically logged in. Please set a new password you'll remember.", { duration: 6000 });
   }
   ```

4. **Required Fix**:
   - The `ResetPasswordPage` component needs modification to ensure users can enter a new password after token validation
   - Prevent automatic navigation after login until user explicitly submits new password
   - Ensure `tokenValidated` state is properly used to control the display of the password reset form
   - Only display success screen after user has successfully set a new password

5. **Successful Password Reset**:
   - After password update is complete, show success confirmation
   - User should be able to navigate to their dashboard from success screen
   - System should maintain login session with new credentials

6. **Error Handling**:
   - Invalid tokens show appropriate error messages
   - Expired tokens prompt user to request a new reset link
   - Network errors during reset are reported to user with retry options
   - Rate limiting for password reset requests (enforced by Supabase)

#### 3.3 Registration Process

1. User selects role during signup (family, professional, community)
2. Role is saved in both:
   - User metadata during registration
   - Profiles table after account creation
3. After signup, user is directed to role-specific registration form:
   - `/registration/family`
   - `/registration/professional`
   - `/registration/community`
4. Profile completeness is determined by presence of required fields
   - For all roles: `full_name` is the minimum requirement
   - Role-specific fields may apply

#### 3.4 Post-Authentication Redirection

1. **New Users (incomplete profile)**:
   - Directed to appropriate registration form based on role
   - Registration role determined through multiple sources:
     1. Database profile role
     2. User metadata role
     3. Registration intent stored in localStorage

2. **Returning Users (complete profile)**:
   - Directed to role-specific dashboard:
     - Family users → `/dashboard/family`
     - Professional users → `/dashboard/professional`
     - Community users → `/dashboard/community`
     - Admin users → `/dashboard/admin`

3. **Pending Action Handling**:
   - System remembers intended actions through localStorage
   - After login, completes pending actions:
     - Feature upvoting
     - Booking requests
     - Message sending
     - Profile updates

#### 3.5 Logout Process

1. User clicks "Sign Out" in Navigation component
2. Logout handler executes:
   ```typescript
   const signOut = async () => {
     isSigningOutRef.current = true;
     setLoadingWithTimeout(true, 'sign-out');
     
     // Clear local state
     setSession(null);
     setUser(null);
     setUserRole(null);
     setIsProfileComplete(false);
     
     // Clear localStorage items
     localStorage.removeItem('authStateError');
     localStorage.removeItem('authTimeoutRecovery');
     // ...more localStorage cleanup...
     
     // Call Supabase signOut
     const { error } = await supabase.auth.signOut();
     
     // Redirect to homepage
     navigate('/', { replace: true });
   }
   ```
3. System clears:
   - Local React state
   - localStorage authentication data
   - Supabase session
4. User is redirected to homepage

### 4. Role-Specific Behavior

#### 4.1 Family Users

1. **Registration Path**: `/registration/family`
2. **Default Dashboard**: `/dashboard/family`
3. **Profile Requirements**:
   - Basic personal information
   - Care recipient details
   - Care preferences

#### 4.2 Professional Users

1. **Registration Path**: `/registration/professional`
2. **Default Dashboard**: `/dashboard/professional`
3. **Profile Requirements**:
   - Professional qualifications
   - Services offered
   - Pricing information
   - Availability
   - Certifications and experience

#### 4.3 Community Users

1. **Registration Path**: `/registration/community`
2. **Default Dashboard**: `/dashboard/community`
3. **Profile Requirements**:
   - Organization/individual information
   - Community involvement interests
   - Contribution areas

#### 4.4 Admin Users

1. No separate registration (assigned administratively)
2. **Default Dashboard**: `/dashboard/admin`
3. **Additional Permissions**:
   - User management
   - System configuration

### 5. Error Handling & Recovery

#### 5.1 Authentication Errors

1. **Login Failures**:
   - Invalid credentials trigger toast notifications
   - Network errors handled with appropriate messages
   - Rate limiting detection and user guidance

2. **Registration Errors**:
   - Email already in use detection
   - Password strength validation
   - Form field validation with inline feedback

#### 5.2 Session Recovery

1. **Loading Timeouts**:
   - 15-second maximum wait for authentication operations
   - Auto-recovery with session reset if timeout occurs
   - Clear error messaging to guide user actions

2. **Database Connection Issues**:
   - Retry logic (3 attempts) for profile and role fetching
   - Progressive backoff between retries

3. **Role Synchronization**:
   - Automatic repair of metadata/database role mismatches
   - Logging of reconciliation attempts for debugging

### 6. Security Considerations

#### 6.1 Session Management

1. **Session Persistence**:
   - Supabase handles token storage and refresh
   - Client configured with:
     ```typescript
     auth: {
       autoRefreshToken: true,
       persistSession: true,
       detectSessionInUrl: true,
       storageKey: 'supabase.auth.token',
     }
     ```

2. **Token Refresh**:
   - Automatic token refresh before expiration
   - Silent renewal to maintain session continuity

#### 6.2 Authentication Protection

1. **Sensitive Route Protection**:
   - `requireAuth` function for access control
   - Action tracking for post-authentication completion
   - Redirection with intent preservation

2. **Loading State Protection**:
   - Prevents UI interaction during authentication
   - Timeouts to prevent indefinite loading states

### 7. Development Considerations

#### 7.1 Email Verification

For development and testing:
- Email verification can be disabled in Supabase Console
- Auto-confirmation settings can be adjusted
- Test accounts can bypass verification

#### 7.2 Console Debugging

Extensive console logging throughout authentication flow:
- Session establishment tracking
- Role determination steps
- Redirection decision points
- Error states and recovery attempts

## Future Enhancements (Planned)

1. **Multi-factor Authentication**
   - SMS verification option
   - Authenticator app integration

2. **Social Login Integration**
   - Google, Facebook, Apple sign-in options
   - Profile merging for existing accounts

3. **Password Recovery Improvements**
   - Guided password reset flow
   - Security question options

4. **Session Management Enhancements**
   - Device tracking and management
   - Suspicious login detection
   - Concurrent session limitations

5. **Profile Completion Incentives**
   - Gamification elements
   - Progress indicators
   - Reward system for complete profiles

---

## Implementation Notes

### Database Structure

The authentication system relies on the following database structure:

1. **Supabase Auth Tables** (managed by Supabase):
   - `auth.users` - Core user accounts
   - `auth.sessions` - Active sessions

2. **Application Tables**:
   - `public.profiles` - Extended user information with the following key fields:
     - `id` (references `auth.users.id`)
     - `role` (user_role enum: 'family', 'professional', 'community', 'admin')
     - `full_name` (used to determine profile completion)
     - Various role-specific fields

### Architecture Decisions

1. **Single Profiles Table**:
   - All user types store data in a single `profiles` table
   - Role-specific fields may be null depending on user type
   - Simplifies queries and role transitions

2. **Metadata Synchronization**:
   - User role stored in both Supabase user metadata and profiles table
   - Automatic reconciliation if mismatches detected
   - Provides redundancy for critical role information

3. **Profile Completion Logic**:
   - Determined by presence of required fields rather than explicit flag
   - Minimum requirement is `full_name` being non-null
   - Additional role-specific requirements may apply
