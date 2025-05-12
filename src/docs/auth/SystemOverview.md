
# Authentication System Overview

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
