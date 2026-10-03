# Gmail API Setup Checklist

Use this checklist to track your setup progress. Check off items as you complete them.

## ☐ Prerequisites
- [ ] Have a Google/Gmail account
- [ ] Have a web browser (Chrome, Firefox, Safari, Edge)
- [ ] Have Python 3 installed (check: `python3 --version`)
- [ ] Have 10 minutes for initial setup

## ☐ Google Cloud Console Setup

### Create Project
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Click "Select a project" → "New Project"
- [ ] Name it "Email Database" (or your choice)
- [ ] Click "Create"
- [ ] Wait for project creation to complete

### Enable Gmail API
- [ ] In the Cloud Console, go to "APIs & Services" → "Library"
- [ ] Search for "Gmail API"
- [ ] Click on it
- [ ] Click "Enable"
- [ ] Wait for API to be enabled

## ☐ OAuth Consent Screen

- [ ] Go to "APIs & Services" → "OAuth consent screen"
- [ ] Select "External" user type
- [ ] Click "Create"
- [ ] Fill in required fields:
  - [ ] App name: "Email Database Creator"
  - [ ] User support email: (your email)
  - [ ] Developer contact: (your email)
- [ ] Click "Save and Continue"
- [ ] On Scopes page:
  - [ ] Click "Add or Remove Scopes"
  - [ ] Search for "Gmail API"
  - [ ] Select: `https://www.googleapis.com/auth/gmail.readonly`
  - [ ] Click "Update"
  - [ ] Click "Save and Continue"
- [ ] On Test users page:
  - [ ] Click "Add Users"
  - [ ] Enter your Gmail address
  - [ ] Click "Add"
  - [ ] Click "Save and Continue"
- [ ] Review and click "Back to Dashboard"

## ☐ Create OAuth Credentials

- [ ] Go to "APIs & Services" → "Credentials"
- [ ] Click "Create Credentials" → "OAuth client ID"
- [ ] Application type: Select "Web application"
- [ ] Name: "Email Database Web Client" (or your choice)
- [ ] Under "Authorized JavaScript origins", click "Add URI":
  - [ ] Add: `http://localhost:8000`
  - [ ] Add: `http://localhost:8080`
  - [ ] Add: `http://127.0.0.1:8000`
- [ ] Click "Create"
- [ ] **IMPORTANT**: Copy your Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
- [ ] Save it somewhere temporarily
- [ ] Click "OK"

## ☐ Create API Key (Optional but Recommended)

- [ ] Still in "Credentials", click "Create Credentials" → "API key"
- [ ] Copy your API Key
- [ ] Save it somewhere temporarily
- [ ] Click "Edit API key" (optional but recommended):
  - [ ] Name: "Email Database API Key"
  - [ ] API restrictions: Select "Restrict key"
  - [ ] Select "Gmail API"
  - [ ] Click "Save"

## ☐ Keep Your Credentials Handy

- [ ] Have your Client ID ready (from step: Create OAuth Credentials)
- [ ] Have your API Key ready (from step: Create API Key)
- [ ] You'll enter these directly in the web interface - no file editing needed!

**Note**: You can also optionally edit `config.js` if you prefer, but entering directly in the UI is easier.

## ☐ Test the Application

### Start Server

**Option A: Live Server (Easiest)**
- [ ] Have VS Code or Cursor open with the project
- [ ] Install "Live Server" extension (if not already installed)
- [ ] Right-click `index.html`
- [ ] Select "Open with Live Server"
- [ ] Browser opens automatically at `http://localhost:5500` (or similar)

**Option B: Command Line Server** (if needed)
- [ ] Open Terminal (Mac/Linux) or Command Prompt (Windows)
- [ ] Navigate to project directory:
  ```bash
  cd /Users/kylemathewson/EmailCollector
  ```
- [ ] Start server:
  - Mac/Linux: `python3 -m http.server 8000`
  - Windows: `python -m http.server 8000`
- [ ] Verify you see "Serving HTTP on..."
- [ ] Manually open browser to `http://localhost:8000`

**Note**: Live Server (Option A) is easier - it opens the browser automatically!

### Open Application
- [ ] Open web browser
- [ ] Go to: `http://localhost:8000`
- [ ] Verify the page loads correctly
- [ ] You should see "Email Exchange Database Creator" header

### Enter Credentials
- [ ] See the "Configure Gmail API & Connect" section at the top
- [ ] In the "OAuth Client ID" field, paste your Client ID
- [ ] In the "API Key" field, paste your API Key (optional but recommended)
- [ ] Click "Save Credentials" button
- [ ] Should see: ✅ "Gmail API credentials configured"
- [ ] Should see: "Credentials saved successfully!" toast message
- [ ] The "Connect Gmail Account" button should now be visible

### Test Authentication
- [ ] Click "Connect Gmail Account" button
- [ ] Google sign-in popup should appear
- [ ] Select your Google account
- [ ] Review permissions (read-only Gmail access)
- [ ] Click "Allow" or "Continue"
- [ ] Should return to app and show "Connected as: your@email.com"
- [ ] Verify the "Fetch Emails from Gmail" section appears

## ☐ First Email Fetch Test

- [ ] In the "Fetch Emails from Gmail" section:
  - [ ] Enter a test email address (someone you've emailed)
  - [ ] Set "Maximum Emails" to `10` (small test)
- [ ] Click "Fetch Emails from Gmail"
- [ ] Wait for progress bar to complete
- [ ] Should see: "✅ Fetched X emails successfully!"
- [ ] Scroll down to "Process Emails" button
- [ ] Click "Process Emails"
- [ ] Should see results section with statistics
- [ ] Click "Download JSON Database"
- [ ] Verify JSON file downloads

## ☐ Optional: Test with Sample Data

If you want to test without setting up Gmail API yet:
- [ ] Open the app (even without Gmail API configured)
- [ ] Scroll to "Or Upload Email Files Manually" section
- [ ] Click the upload area
- [ ] Select `sample-emails.mbox` from the project folder
- [ ] Click "Process Emails"
- [ ] Verify it works and shows 6 sample emails

## ☐ Troubleshooting (If Issues)

If credentials won't save:
- [ ] Make sure you clicked "Save Credentials" button
- [ ] Check that localStorage is enabled in your browser
- [ ] Try clearing browser cache and re-entering credentials
- [ ] Verify Client ID format (should end with .apps.googleusercontent.com)

If authentication fails:
- [ ] Verify you entered the correct Client ID (no spaces, exact copy)
- [ ] Click "Clear Saved Credentials" and re-enter them
- [ ] Verify you're accessing via `localhost:8000` not `file://`
- [ ] Check browser console (F12) for error messages
- [ ] Verify you added yourself as test user in OAuth consent screen
- [ ] Verify authorized JavaScript origins include `http://localhost:8000`

If no emails found:
- [ ] Verify the target email address is spelled correctly
- [ ] Verify you have emails with that person in your Gmail
- [ ] Try increasing "Years Back" setting
- [ ] Try with a different email address you know you've corresponded with

If fetching is slow:
- [ ] This is normal! Gmail API has rate limits
- [ ] Large batches (500+) can take several minutes
- [ ] Start with smaller batches (50-100) for testing

## ✅ Setup Complete!

Once all items are checked, you're ready to:
- Fetch emails from any contact
- Process large email archives
- Export JSON databases for LLM training
- Use with ChatGPT, Claude, or custom models

## 📝 Notes

Write any issues or observations here:
```
[Your notes here]
```

## 🎯 Next Steps

After successful setup:
1. [ ] Fetch emails with your target person (e.g., Steve Mann)
2. [ ] Experiment with different export options
3. [ ] Use the JSON with your preferred LLM
4. [ ] Consider setting up a system prompt for your chatbot

## 🔐 Security Reminder

- [ ] Never share your `config.js` file with real credentials
- [ ] Add `config.js` to `.gitignore` if using Git (already done!)
- [ ] Revoke access in [Google Account Settings](https://myaccount.google.com/permissions) when done

---

**Setup Date**: _______________  
**Gmail Account Used**: _______________  
**First Successful Fetch**: _______________  

Congratulations on completing the setup! 🎉

