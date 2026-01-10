# OAuth & Email Integration Setup Guide

## 🎯 Overview

Your marketplace now supports **OAuth authentication** (Google & GitHub) and **email integration** for user communications. This document explains what was implemented and how to configure it for production.

---

## ✅ What Was Implemented

### 1. **Database Schema Updates**

- Added `email`, `googleId`, `githubId`, and `isEmailVerified` columns to the `users` table
- Made `password` nullable to support OAuth-only accounts
- Updated user creation/lookup methods to support OAuth providers

### 2. **OAuth Authentication (Google & GitHub)**

- Integrated Passport.js strategies for Google OAuth 2.0 and GitHub OAuth
- Automatic account creation or linking when users sign in with social providers
- Email verification is automatically marked as `true` for OAuth users
- OAuth routes:
  - `GET /api/auth/google` - Initiates Google login
  - `GET /api/auth/google/callback` - Google callback handler
  - `GET /api/auth/github` - Initiates GitHub login
  - `GET /api/auth/github/callback` - GitHub callback handler

### 3. **Email Service**

- Created `server/email.ts` with Nodemailer integration
- Functions for:
  - `sendWelcomeEmail()` - Sent automatically on registration
  - `sendVerificationEmail()` - For email verification flows
  - `sendEmail()` - Generic email sender
- Non-blocking email sending (doesn't delay user registration)

### 4. **Updated Authentication UI**

- Added email field to registration form
- Added social login buttons with Google and GitHub
- Visual separator between traditional and social authentication
- Proper icons using Lucide React

### 5. **Security Enhancements**

- Email uniqueness validation during registration
- Duplicate email prevention
- Password validation for local auth users
- OAuth profile data mapping with fallbacks

---

## 🔧 Environment Configuration

Add these variables to your `.env` file:

```bash
# Google OAuth (Get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (Get from https://github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=no-reply@yourdomain.com

# Application URL (for OAuth callbacks)
APP_URL=http://localhost:5000
```

---

## 📝 Setting Up OAuth Providers

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env`

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Your Marketplace Name
   - **Homepage URL**: `http://localhost:5000` (dev) or `https://yourdomain.com` (prod)
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback` (dev) or `https://yourdomain.com/api/auth/github/callback` (prod)
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret
6. Add both to your `.env`

---

## 📧 Email Service Configuration

### Option 1: Gmail (Development/Testing)

1. Enable 2-Factor Authentication on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use these settings:

   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_char_app_password
   ```

### Option 2: SendGrid (Production Recommended)

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Use these settings:

   ```bash
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your_sendgrid_api_key
   ```

### Option 3: AWS SES (Production)

1. Set up AWS SES in your region
2. Verify your domain
3. Get SMTP credentials
4. Use these settings:

   ```bash
   EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
   EMAIL_PORT=587
   EMAIL_USER=your_ses_smtp_username
   EMAIL_PASS=your_ses_smtp_password
   ```

---

## 🚀 Database Migration

Run the migration to apply schema changes:

```bash
npm run db:push
```

**Note**: If you have existing users, you may need to handle the unique email constraint. Options:

- **Development**: Truncate the users table (data loss)
- **Production**: Manually update existing users to add unique emails before migration

---

## 🧪 Testing OAuth Locally

### Testing Google OAuth

1. Set up ngrok or similar tunneling service (OAuth requires HTTPS in production):

   ```bash
   ngrok http 5000
   ```

2. Update your Google OAuth callback URL to use the ngrok URL
3. Update `APP_URL` in `.env` to match ngrok URL
4. Test the login flow at `/auth`

### Testing GitHub OAuth

Same process as Google, but update GitHub OAuth settings instead.

### Testing Email

1. Use a tool like [Ethereal Email](https://ethereal.email) for testing:

   ```bash
   # Ethereal provides test SMTP credentials
   EMAIL_HOST=smtp.ethereal.email
   EMAIL_PORT=587
   EMAIL_USER=test_user@ethereal.email
   EMAIL_PASS=test_password
   ```

2. Check sent emails at the Ethereal inbox

---

## 🔐 Security Considerations

1. **Never commit OAuth secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** in production for OAuth callbacks
4. **Validate email domains** if needed for your business
5. **Implement rate limiting** on OAuth endpoints (already done via existing rate limiters)
6. **Monitor failed OAuth attempts** for security threats

---

## 📊 User Flow Examples

### New User with Google OAuth

1. User clicks "Google" button on `/auth`
2. Redirected to Google consent screen
3. User approves access
4. Callback creates new user with:
   - `googleId`: Google's user ID
   - `email`: From Google profile
   - `username`: From Google display name
   - `isEmailVerified`: `true`
5. User is logged in and redirected to home

### Existing User Linking OAuth

1. User has account with email `user@example.com`
2. User clicks "Google" to sign in
3. Google returns same email
4. System links Google ID to existing account
5. User can now log in with either method

### Traditional Registration with Email

1. User fills username, email, password
2. System validates uniqueness
3. Password is hashed
4. Welcome email is sent (non-blocking)
5. User is logged in automatically

---

## 🐛 Troubleshooting

### "Email already in use" error

- Check if the email exists in the database
- Ensure OAuth and traditional accounts can be linked

### OAuth callback fails

- Verify callback URLs match exactly in provider settings
- Check that `APP_URL` environment variable is correct
- Ensure OAuth credentials are valid

### Emails not sending

- Check SMTP credentials
- Verify firewall/network allows SMTP connections
- Check email service logs for errors
- Test with Ethereal Email first

### "Cannot find module 'nodemailer'" error

- Run: `npm install nodemailer passport-google-oauth20 passport-github2 --legacy-peer-deps`
- Run: `npm install -D @types/nodemailer @types/passport-google-oauth20 @types/passport-github2 --legacy-peer-deps`

---

## 📚 Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Guide](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Nodemailer Documentation](https://nodemailer.com/)

---

**Last Updated**: 2026-01-10  
**Version**: 1.0.0
