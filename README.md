# Email Exchange Database Creator

A client-side web application that converts email exchanges into structured JSON format suitable for LLM training and context. Now with **automatic Gmail API integration**!

## Features

- 🔐 **Gmail API Integration**: Automatically fetch emails directly from Gmail (NEW!)
- 📁 **Multiple Format Support**: Parses .mbox, .eml, and .txt email files
- 🎯 **Smart Filtering**: Filter by specific email address and date range
- 🧵 **Conversation Threading**: Automatically organizes emails into conversation threads
- 📊 **Statistics Dashboard**: View email counts, date ranges, and conversation statistics
- 💾 **JSON Export**: Download organized data in LLM-friendly JSON format
- 🔒 **Privacy First**: All processing happens locally in your browser - no data is sent to any server

## Quick Start

### Option 1: Gmail API (Recommended)

This is the easiest and fastest way to get your emails!

1. **Setup Gmail API** (one-time, ~10 minutes)
2. **Run the app** on localhost
3. **Connect** your Gmail account
4. **Fetch** emails automatically
5. **Export** as JSON

### Option 2: Manual Upload

Upload exported email files if you prefer not to use the API.

## Gmail API Setup (Detailed)

### Prerequisites
- A Google account with Gmail
- ~10 minutes for initial setup
- A web browser

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Email Database")
4. Click "Create"

### Step 2: Enable Gmail API

1. In the Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on it and press **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type (unless you have Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - App name: "Email Database Creator"
   - User support email: Your email
   - Developer contact: Your email
5. Click **"Save and Continue"**
6. On the Scopes page:
   - Click **"Add or Remove Scopes"**
   - Search for "Gmail API"
   - Select `https://www.googleapis.com/auth/gmail.readonly`
   - Click **"Update"** then **"Save and Continue"**
7. On the Test users page:
   - Click **"Add Users"**
   - Add your Gmail address
   - Click **"Save and Continue"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: "Email Database Web Client"
5. Under **"Authorized JavaScript origins"**, add:
   - `http://localhost:5500` (for Live Server - recommended)
   - `http://127.0.0.1:5500` (for Live Server - recommended)
   - `http://localhost:8000` (for Python http.server)
   - `http://127.0.0.1:8000` (for Python http.server)
6. Click **"Create"**
7. **Copy your Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
8. Click "OK"

### Step 5: Get API Key (Optional but Recommended)

1. Still in **"Credentials"**, click **"Create Credentials"** → **"API key"**
2. **Copy your API Key**
3. Click "Restrict Key" and select "Gmail API" for better security
4. Click "Save"

### Step 6: Configure the Application

**Option A: Enter Directly in the Web Interface (Recommended)**

You can enter your credentials directly in the app - no file editing needed!

1. Start the local server (Step 7)
2. Open the app in your browser
3. Enter your Client ID in the "OAuth Client ID" field
4. Enter your API Key in the "API Key" field (optional)
5. Click "Save Credentials"
6. Your credentials are saved securely in your browser's localStorage

**Option B: Edit config.js File (Advanced)**

1. Open `config.js` in your favorite text editor
2. Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID from Step 4
3. Replace `YOUR_API_KEY_HERE` with your API Key from Step 5
4. Save the file

```javascript
const CONFIG = {
    CLIENT_ID: '123456789-abcdefg.apps.googleusercontent.com',  // Your actual ID
    API_KEY: 'AIzaSyAbc123...',  // Your actual key
    // ... rest stays the same
};
```

**Note**: Web interface is easier - credentials are stored in your browser and never sent anywhere.

### Step 7: Run a Local Server

Gmail API requires the app to run on localhost for security.

**Option A: Live Server (Easiest - Recommended)**

If you're using VS Code or Cursor:
1. Install "Live Server" extension (if not already installed)
2. Right-click `index.html` → "Open with Live Server"
3. Or click "Go Live" in the status bar
4. App opens at `http://localhost:5500` (or similar)

**Option B: Python's Built-in Server** (if needed)

```bash
cd /Users/kylemathewson/EmailCollector
python3 -m http.server 8000
# Then open: http://localhost:8000
```

**Option C: Node.js http-server** (alternative)

```bash
npx http-server -p 8000
# Then open: http://localhost:8000
```

**Note**: Make sure to add your server's URL to OAuth authorized origins in Step 4!

### Step 8: Open the Application

1. Open your browser to your server's URL:
   - Live Server: `http://localhost:5500`
   - Python server: `http://localhost:8000`
2. Enter your OAuth Client ID and API Key in the form
3. Click **"Save Credentials"**
4. Click **"Connect Gmail Account"**
5. Sign in with your Google account
6. Grant permissions (read-only access to Gmail)
7. Start fetching emails!

**💡 Pro Tip:** See `LIVE_SERVER_GUIDE.md` for detailed Live Server setup - it's the easiest method!

## Using the Application

### Method 1: Gmail API (Automatic)

1. **Connect**: Click "Connect Gmail Account" and authorize
2. **Enter target email**: Type the email address of the person you want to extract conversations with (e.g., `steve@example.com`)
3. **Set max results**: Choose how many emails to fetch (10-5000)
4. **Fetch**: Click "Fetch Emails from Gmail"
5. **Wait**: The app will download and parse all matching emails
6. **Configure options**: Choose whether to include subjects, metadata, etc.
7. **Process**: Click "Process Emails"
8. **Download**: Download your JSON database

### Method 2: Manual File Upload

#### Export Your Emails

##### Gmail (via Google Takeout)
1. Go to [Google Takeout](https://takeout.google.com/)
2. Deselect all, then select only "Mail"
3. Choose "All Mail data included" or select specific labels
4. Set format to .mbox
5. Download and extract the .mbox files

#### Outlook
1. Select emails you want to export
2. File → Save As → Save as type: Outlook Message Format (.msg) or .eml
3. Or export to .pst and convert using a tool like Aid4Mail

#### Apple Mail
1. Select the emails or mailbox
2. Mailbox → Export Mailbox...
3. Choose a location and export

##### Manual Upload Steps

1. **Open the App**: Open in browser (or run on localhost:8000)
2. **Upload Files**: Click the upload area and select your email files
3. **Configure Filters**: Set date range and target email
4. **Process**: Click "Process Emails"
5. **Download**: Download the JSON

## Use with LLMs

The generated JSON has two formats optimized for different LLM use cases:

#### Conversation Format (Threaded)
```json
{
  "metadata": {
    "total_emails": 150,
    "conversations": 23,
    "date_range": {...}
  },
  "conversations": [
    {
      "thread_subject": "Project Discussion",
      "messages": [
        {
          "role": {...},
          "content": "Email body text...",
          "metadata": {...}
        }
      ]
    }
  ]
}
```

#### Flat Format (Sequential)
```json
{
  "flat_format": [
    {
      "role": {...},
      "content": "Email body text...",
      "metadata": {...}
    }
  ]
}
```

## File Structure

```
EmailCollector/
├── index.html           # Main application interface
├── styles.css           # Beautiful, modern styling
├── script.js            # Email parsing and Gmail API integration
├── config.js            # Gmail API credentials (YOU MUST CONFIGURE THIS)
├── sample-emails.mbox   # Sample data for testing
└── README.md            # This file
```

## Gmail API Benefits

### Why use Gmail API?

✅ **Automatic**: No manual export needed  
✅ **Fast**: Fetch emails in seconds  
✅ **Filtered**: Target specific conversations directly  
✅ **Up-to-date**: Get your latest emails instantly  
✅ **Easy**: No need to understand email export formats  

### Comparison

| Feature | Gmail API | Manual Upload |
|---------|-----------|---------------|
| Setup time | ~10 minutes (one-time) | None |
| Export emails | Automatic | Manual export required |
| Speed | Fast (~500 emails/min) | Depends on export |
| Filtering | Built-in | Done after upload |
| Updates | Real-time access | Re-export needed |

## Troubleshooting

### Gmail API Issues

**Problem**: "Gmail API not configured" message  
**Solution**: Make sure you've edited `config.js` with your actual credentials

**Problem**: "Failed to authenticate"  
**Solution**: 
- Verify your Client ID is correct in `config.js`
- Make sure you're running on localhost (not file://)
- Check that you've added yourself as a test user in OAuth consent screen

**Problem**: "Access blocked: This app's request is invalid"  
**Solution**: 
- Ensure authorized JavaScript origins include your localhost URL
- Make sure Gmail API is enabled in Google Cloud Console

**Problem**: "Daily quota exceeded"  
**Solution**: 
- Gmail API has daily limits (check Google Cloud Console)
- Wait 24 hours or request quota increase
- Reduce the number of emails fetched per session

**Problem**: "Fetching is slow"  
**Solution**: 
- This is normal - Gmail API rate limits requests
- Smaller batches (100-500 emails) work better
- The app adds delays to respect rate limits

### General Issues

**Problem**: JSON export seems incomplete  
**Solution**: Check that emails aren't being filtered by the date range (years back setting)

**Problem**: Email bodies are empty  
**Solution**: Some email formats don't parse well - try Gmail API instead of manual upload

## Supported Email Formats

- **.mbox**: Standard Unix mailbox format (Gmail Takeout, Thunderbird)
- **.eml**: Individual email message files (Outlook, most email clients)
- **.txt**: Plain text emails (will attempt to auto-detect format)

## Technical Details

### Email Parsing
The app extracts and parses:
- From/To addresses
- Subject lines
- Dates (converted to ISO format)
- Email body content
- MIME encoded headers
- Conversation threads (based on subject)

### Data Structure
The JSON output includes:
- **Metadata**: Email counts, date ranges, generation timestamp
- **Conversations**: Threaded email exchanges grouped by subject
- **Flat Format**: Sequential list of all messages
- **Role Information**: Sender identification for each message
- **Optional Metadata**: Timestamps, subjects, participants (configurable)

### Privacy & Security
- All processing happens in your browser using JavaScript
- No data is uploaded to any server
- No external API calls
- Files are read directly from your local machine
- Safe to use with confidential email content

## Browser Compatibility

Works with any modern browser that supports:
- File API
- ES6 JavaScript
- Async/await
- Clipboard API (for copy function)

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Tips for Best Results

1. **Clean Email Selection**: Export only relevant conversations to reduce noise
2. **Date Filtering**: Use appropriate year ranges to limit context size
3. **Subject Lines**: Include them for better conversation threading
4. **Metadata**: Include metadata if you want temporal context in your LLM
5. **File Size**: For very large email archives, consider processing in batches

## Use Cases

- **Personal AI Assistant**: Train a chatbot on your communication style and history
- **Conversational Context**: Provide LLMs with background on relationships and past discussions
- **Email Analysis**: Analyze communication patterns and topics
- **Archive Organization**: Create searchable, structured email databases
- **Memory Augmentation**: Give LLMs access to your email history as context

## Security & Privacy

### Data Privacy
- ✅ All processing happens **locally in your browser**
- ✅ Emails are **never sent to external servers**
- ✅ No tracking or analytics
- ✅ Gmail API uses **read-only access** (cannot delete or modify emails)

### Credential Security
- 🔐 Keep `config.js` private - **never commit to public repositories**
- 🔐 Add `config.js` to `.gitignore` if using version control
- 🔐 Use test users in OAuth consent screen during development
- 🔐 Only grant access to accounts you control

### Best Practices
1. Only use on devices you trust
2. Sign out after fetching emails
3. Don't share your OAuth credentials
4. Revoke access in [Google Account Settings](https://myaccount.google.com/permissions) when done

## Rate Limits & Quotas

Gmail API has quotas to prevent abuse:

- **Default quota**: 1 billion quota units per day
- **User rate limit**: 250 quota units per user per second
- **Reading a message**: ~5 quota units

**What this means:**
- You can fetch ~1000 emails before hitting short-term limits
- The app includes delays to stay within limits
- For very large archives (>5000 emails), fetch in multiple sessions

Check your quota usage: [Google Cloud Console → APIs & Services → Dashboard](https://console.cloud.google.com/apis/dashboard)

## Limitations

### Gmail API
- Requires one-time setup (~10 minutes)
- Must run on localhost or HTTPS
- Subject to Google's API quotas
- Requires OAuth authentication

### Email Parsing
- Very large files (>50MB) may be slow to process
- Complex MIME multipart messages may not parse perfectly  
- Attachments are not extracted (only text content)
- HTML emails are preserved as-is (not converted to plain text)
- Thread detection is subject-based (not Message-ID based)

## Future Enhancements

Potential improvements:
- ✨ Batch processing for large archives (>5000 emails)
- ✨ HTML to plain text conversion
- ✨ Attachment extraction and indexing
- ✨ Better thread detection using In-Reply-To headers
- ✨ Multiple target email addresses
- ✨ Advanced filtering (by keyword, labels, etc.)
- ✨ Export to other formats (CSV, Markdown, JSONL)
- ✨ Sentiment analysis and email statistics
- ✨ Integration with other email providers (Outlook, Yahoo)

## License

Free to use and modify for personal and commercial purposes.

## Support

### Getting Help

For issues or questions:

1. Check the browser console (F12) for error messages
2. Review the troubleshooting section above
3. Verify your Gmail API setup in Google Cloud Console
4. Make sure you're running on localhost

### Common Issues
- **Authentication errors**: Check `config.js` credentials
- **No emails found**: Verify your target email address is correct
- **Slow performance**: Normal for large batches due to rate limiting
- **Quota exceeded**: Wait 24 hours or reduce batch size

---

## Important Notes

⚠️ **Gmail API Credentials**: You must set up your own Google Cloud project and credentials. This is free for personal use.

⚠️ **Privacy**: This tool is designed for personal email archiving and AI training purposes. Always respect privacy and data protection regulations when handling email data.

⚠️ **Security**: Never share your API credentials or commit them to public repositories.

💡 **Tip**: Start with the sample email file (`sample-emails.mbox`) to test the app before setting up Gmail API.

---

Made with ❤️ for LLM researchers and AI enthusiasts

