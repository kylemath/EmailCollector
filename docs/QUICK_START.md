# Quick Start Guide

## Gmail API Setup (10 minutes)

### 1. Google Cloud Console Setup

```
1. Go to: https://console.cloud.google.com/
2. Create new project: "Email Database"
3. Enable Gmail API:
   - APIs & Services → Library → Search "Gmail API" → Enable
```

### 2. OAuth Setup

```
1. APIs & Services → OAuth consent screen
2. User type: External → Create
3. Fill in:
   - App name: "Email Database Creator"
   - Your email for support
4. Scopes → Add: https://www.googleapis.com/auth/gmail.readonly
5. Test users → Add your Gmail address
```

### 3. Create Credentials

```
1. APIs & Services → Credentials
2. Create Credentials → OAuth client ID
3. Type: Web application
4. Authorized JavaScript origins:
   - http://localhost:5500 (for Live Server)
   - http://127.0.0.1:5500 (for Live Server)
   - http://localhost:8000 (for Python server)
5. Copy your Client ID
```

### 4. Run Local Server

**Option A: Live Server (Easiest!)**
```
1. In Cursor/VS Code, right-click index.html
2. Select "Open with Live Server"
3. App opens at http://localhost:5500
```

**Option B: Python Server**
```bash
cd /Users/kylemathewson/EmailCollector
python3 -m http.server 8000
# Opens at http://localhost:8000
```

**Note**: Use whichever port you added to OAuth settings in Step 3!

### 5. Configure & Use the App

```
1. Open: http://localhost:8000
2. Enter your OAuth Client ID (from step 3)
3. Enter your API Key (optional, from step 3)
4. Click "Save Credentials"
5. Click "Connect Gmail Account"
6. Authorize the app
7. Enter target email (e.g., steve@example.com)
8. Click "Fetch Emails from Gmail"
9. Configure options
10. Click "Process Emails"
11. Download JSON!
```

**Note**: Your credentials are saved in your browser's localStorage - you only need to enter them once!

## Troubleshooting

**Can't authenticate?**
- Make sure you're on localhost, not file://
- Verify Client ID in config.js
- Check you're added as test user

**No emails found?**
- Check target email address spelling
- Verify that email exists in your Gmail

**Slow fetching?**
- Normal! Gmail API has rate limits
- Start with 100-500 emails

## Example Use Case

**Goal**: Create a chatbot trained on emails with Steve Mann

1. Connect Gmail
2. Enter: `steve@example.com`
3. Set max: `500 emails`
4. Fetch → Process → Download
5. Use JSON with ChatGPT, Claude, or your own LLM

**Result**: A structured database of all conversations with Steve that can be used as context for an AI assistant!

---

For detailed docs, see [README.md](README.md)

