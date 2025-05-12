
# Authentication Flows

## 1. Initial Authentication Check

1. On application load, `AuthProvider` initializes and:
   - Sets loading state with timeout protection (15 seconds)
   - Checks for existing session via `supabase.auth.getSession()`
   - Uses retry logic for role determination
   - Monitors session state changes via `onAuthStateChange` event

## 2. Login Process

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

## 3. Password Reset Flow

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

## 4. Registration Process

1. User selects role during signup (family, professional, community)
2. Role is saved in both:
   - User metadata during registration
   - Profiles table after account creation
3. After signup, user is directed to role-specific registration form:
   - `/registration/family`
   - `/registration/professional`
   - `/registration/community`
4. Profile completeness is determined by presence of required fields

## 5. Post-Authentication Redirection

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

## 6. Logout Process

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
