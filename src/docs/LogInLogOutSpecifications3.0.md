
# Login/Logout System Specifications 3.0

## 1. System Overview

The authentication system in Takes a Village implements a complete login/logout workflow with role-based registration and navigation paths. The system handles multiple user roles (family, professional, community, admin) with custom onboarding flows and dashboard redirection.

### 1.1 Key Components

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
   - Password reset request initiation

3. **LoginForm (`src/components/auth/LoginForm.tsx`)**
   - Email/password credential collection
   - Form validation
   - Loading state visualization
   - "Forgot password" link to trigger reset flow

4. **SignupForm (`src/components/auth/SignupForm.tsx`)**
   - New user registration with email/password
   - Role selection (family, professional, community)
   - User metadata collection

5. **ResetPasswordForm (`src/components/auth/ResetPasswordForm.tsx`)**
   - Email input for password reset requests
   - Confirmation messaging
   - Back button to return to login

6. **ResetPasswordPage (`src/pages/auth/ResetPasswordPage.tsx`)**
   - Token validation from reset email
   - New password input and confirmation
   - Success confirmation with redirection
   - Fallback for invalid tokens

## 2. Authentication Flow

### 2.1 Initial Authentication Check

1. On application load, `AuthProvider` initializes and:
   - Sets loading state with timeout protection (15 seconds)
   - Checks for existing session via `supabase.auth.getSession()`
   - Uses retry logic for role determination
   - Monitors session state changes via `onAuthStateChange` event

### 2.2 Login Process

1. User enters email and password in the LoginForm
2. Form validates inputs and submits credentials to AuthPage
3. AuthPage calls Supabase authentication:
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password,
   });
   ```
4. AuthProvider detects auth state change (`SIGNED_IN` event)
5. Role determination process:
   - First checks user metadata for role
   - Falls back to database lookup in profiles table
   - Syncs role between metadata and database for consistency
6. Profile completeness check determines appropriate redirection

### 2.3 Password Reset Flow

1. **Password Reset Initiation**:
   - User clicks "Forgot Password" link on the login form
   - System displays password reset request form (`ResetPasswordForm` component)
   - User enters email address for account recovery
   - System sends password reset link via email using Supabase
   - Confirmation message displayed to user

2. **Password Reset Link Processing**:
   - User clicks email recovery link which directs to `/auth/reset-password` page
   - URL contains recovery token as query parameter
   - System validates token via `supabase.auth.exchangeCodeForSession()`
   - Upon successful token validation, displays password reset form
   - User enters and confirms new password

3. **Password Update Process**:
   ```typescript
   // From ResetPasswordPage.tsx
   const { error } = await supabase.auth.updateUser({ password });
   
   if (!error) {
     toast.success("Password has been reset successfully");
     setResetComplete(true);
   }
   ```

4. **Success Flow**:
   - After password update is complete, success confirmation is shown
   - User is automatically logged in with new credentials
   - User can navigate to dashboard from success screen

5. **Error Handling**:
   - Invalid tokens show appropriate error messages
   - Expired tokens prompt user to request a new reset link
   - Network errors during reset are reported to user with retry options

### 2.4 Registration Process

1. User selects role during signup (family, professional, community)
2. Role is saved in both:
   - User metadata during registration
   - Profiles table after account creation
3. After signup, user is directed to role-specific registration form:
   - `/registration/family`
   - `/registration/professional`
   - `/registration/community`
4. Profile completeness is determined by presence of required fields

### 2.5 Post-Authentication Redirection

1. **New Users (incomplete profile)**:
   - Directed to appropriate registration form based on role

2. **Returning Users (complete profile)**:
   - Directed to role-specific dashboard:
     - Family users → `/dashboard/family`
     - Professional users → `/dashboard/professional`
     - Community users → `/dashboard/community`
     - Admin users → `/dashboard/admin`

3. **Pending Action Handling**:
   - System remembers intended actions through localStorage
   - After login, completes pending actions

### 2.6 Logout Process

1. User clicks "Sign Out" in Navigation component
2. Logout handler executes:
   ```typescript
   const signOut = async () => {
     setLoadingWithTimeout(true, 'sign-out');
     
     // Clear local state and localStorage items
     setSession(null);
     setUser(null);
     setUserRole(null);
     setIsProfileComplete(false);
     
     // Call Supabase signOut
     await supabase.auth.signOut();
     
     // Redirect to homepage
     navigate('/', { replace: true });
   }
   ```
3. User is redirected to homepage

## 3. Role-Specific Behavior

### 3.1 Family Users
1. **Registration Path**: `/registration/family`
2. **Default Dashboard**: `/dashboard/family`

### 3.2 Professional Users
1. **Registration Path**: `/registration/professional`
2. **Default Dashboard**: `/dashboard/professional`

### 3.3 Community Users
1. **Registration Path**: `/registration/community`
2. **Default Dashboard**: `/dashboard/community`

### 3.4 Admin Users
1. **Default Dashboard**: `/dashboard/admin`

## 4. Error Handling & Recovery

### 4.1 Authentication Errors
1. **Login Failures**:
   - Invalid credentials trigger toast notifications
   - Network errors handled with appropriate messages
   - Rate limiting detection and user guidance

2. **Registration Errors**:
   - Email already in use detection
   - Password strength validation
   - Form field validation with inline feedback

### 4.2 Session Recovery
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

## 5. Security Considerations

### 5.1 Session Management
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

### 5.2 Authentication Protection
1. **Sensitive Route Protection**:
   - `requireAuth` function for access control
   - Action tracking for post-authentication completion
   - Redirection with intent preservation

2. **Loading State Protection**:
   - Prevents UI interaction during authentication
   - Timeouts to prevent indefinite loading states

## 6. Development and Production Considerations

### 6.1 Environment Configuration
- Supabase URL and keys are configured in:
  - Development: Environment variables in `.env` file
  - Production: Environment variables in deploy settings

### 6.2 URL Configuration
- Supabase project settings require proper URL configuration:
  - **Site URL**: Set to the application domain (e.g., `https://tavaracare.lovable.app`)
  - **Redirect URLs**: Include all valid application URLs:
    - Preview URL: `https://preview--tavaracare.lovable.app`
    - Production URL: `https://tavaracare.lovable.app`
    - Development URL: `http://localhost:5173` (for local testing)

### 6.3 Email Templates
- Password reset emails include properly configured URLs
- Email templates can be customized in Supabase dashboard
- For testing, email confirmation can be disabled

## 7. Implementation Details

### 7.1 Password Reset Implementation
The password reset flow now correctly:
1. Generates reset tokens with proper URLs
2. Validates tokens on the reset page
3. Allows users to set new passwords
4. Provides appropriate feedback for success/failure
5. Handles edge cases like expired tokens

### 7.2 Console Debugging
Extensive console logging throughout authentication flow:
- Session establishment tracking
- Role determination steps
- Redirection decision points
- Error states and recovery attempts

## 8. Future Enhancements

1. **Multi-factor Authentication**
   - SMS verification option
   - Authenticator app integration

2. **Social Login Integration**
   - Google, Facebook, Apple sign-in options
   - Profile merging for existing accounts

3. **Session Management Enhancements**
   - Device tracking and management
   - Suspicious login detection
   - Concurrent session limitations

---

## Database Structure

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
