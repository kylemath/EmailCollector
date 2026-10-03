# Gmail API Credentials - Easy Setup Guide

## ✨ Enter Credentials Directly in the App!

No need to edit config files - just paste your credentials into the web interface.

## How It Works

### 1. Get Your Credentials

Follow the Gmail API setup (see `QUICK_START.md` or `SETUP_CHECKLIST.md`):
- Create Google Cloud project
- Enable Gmail API
- Create OAuth Client ID
- Create API Key (optional)

You'll end up with:
- **Client ID**: `123456789-xxxxx.apps.googleusercontent.com`
- **API Key**: `AIzaSyAbc123xyz...` (optional)

### 2. Enter Credentials in the App

1. Start the app: `./start-server.sh`
2. Open: `http://localhost:8000`
3. You'll see a form at the top: "Configure Gmail API & Connect"
4. Paste your **Client ID** in the first field
5. Paste your **API Key** in the second field (optional but recommended)
6. Click **"Save Credentials"**

Done! ✅

### 3. Where Are Credentials Stored?

Your credentials are stored securely in your browser's **localStorage**:

- ✅ **Stored locally** on your computer only
- ✅ **Never sent** to any external server
- ✅ **Persists** across browser sessions (no need to re-enter)
- ✅ **Private** to your browser (other browsers won't have access)
- ✅ **Clearable** with one click using the "Clear Saved Credentials" button

### 4. Managing Credentials

**View Status**
- Status indicator shows: ✅ "Gmail API credentials configured" when saved
- Or: ⚙️ "Gmail API credentials not configured" when empty

**Clear Credentials**
- Click "Clear Saved Credentials" button
- Confirms before clearing
- Useful if you need to change credentials or troubleshoot

**Update Credentials**
- Simply enter new credentials and click "Save Credentials"
- Old credentials are automatically replaced

## Comparison: Web UI vs config.js

### Web Interface (Recommended)
✅ **Easy**: Just paste and click save  
✅ **Visual**: See status indicator  
✅ **Safe**: Stored in browser localStorage  
✅ **Flexible**: Easy to update or clear  
✅ **No files**: No need to edit code files  

### config.js File (Advanced)
📝 Requires file editing  
📝 Need to reload page after changes  
✅ Good for developers  
✅ Can be version controlled (if needed)  
✅ Works as fallback if localStorage is cleared  

**You can use both!** The app checks localStorage first, then falls back to config.js.

## Security Notes

### What's Stored
- OAuth Client ID (public identifier, not secret)
- API Key (restricts to Gmail API only)

### What's NOT Stored
- Your Google password (never entered in the app)
- Access tokens (managed by Google, expire automatically)
- Your emails (processed in memory, never stored)

### Best Practices
1. ✅ Only use on devices you trust
2. ✅ Clear credentials when done (optional)
3. ✅ Don't share screenshots showing your credentials
4. ✅ Use API key restrictions in Google Cloud Console

### Clearing All Data

**Clear credentials only:**
```
Click "Clear Saved Credentials" button in the app
```

**Clear all browser data (nuclear option):**
```
Browser Settings → Privacy → Clear browsing data → 
Check "Cookies and site data" → Clear
```

## Troubleshooting

### Credentials won't save
- Check that localStorage is enabled in your browser
- Try private/incognito mode to test
- Clear browser cache and try again

### Authentication fails after saving
- Verify you copied the Client ID correctly (no extra spaces)
- Click "Clear Saved Credentials" and re-enter
- Check browser console (F12) for error messages
- Verify the Client ID format ends with `.apps.googleusercontent.com`

### Need to use different credentials
- Just click "Clear Saved Credentials"
- Enter new credentials
- Click "Save Credentials"

### Lost my credentials
- Go back to [Google Cloud Console](https://console.cloud.google.com/)
- APIs & Services → Credentials
- Find your OAuth Client ID and copy it again
- Copy your API Key again
- Re-enter in the app

## FAQ

**Q: Do I still need config.js?**  
A: No! You can delete it or leave it as a template. The web interface is easier.

**Q: What if I clear my browser cookies?**  
A: You'll need to re-enter your credentials, but it only takes 10 seconds.

**Q: Can someone steal my credentials from localStorage?**  
A: Only if they have physical access to your computer and browser. The Client ID isn't a secret anyway - it's safe to use in client-side apps.

**Q: Can I use this on multiple browsers?**  
A: Yes, but you'll need to enter credentials in each browser (they don't sync automatically).

**Q: What if I want to use config.js instead?**  
A: That's fine! Just edit `config.js` with your credentials. The app will use those if localStorage is empty.

**Q: How do I back up my credentials?**  
A: Simply copy the Client ID and API Key to a password manager or secure note. Or keep config.js as a backup.

## Example Workflow

### First Time Setup
```
1. Get credentials from Google Cloud Console
2. Right-click index.html → Open with Live Server
3. Browser opens automatically at http://localhost:5500
4. Paste Client ID
5. Paste API Key
6. Click "Save Credentials"
7. Click "Connect Gmail Account"
8. Done! ✅
```

### Next Time
```
1. Right-click index.html → Open with Live Server
2. Browser opens automatically at http://localhost:5500
3. Credentials already there! ✅
4. Click "Connect Gmail Account"
5. Start fetching emails
```

### Switching Accounts
```
1. Click "Clear Saved Credentials"
2. Enter new credentials
3. Click "Save Credentials"
4. Connect with new account
```

---

**Bottom Line**: Enter your credentials once in the web interface, and you're done. Much easier than editing config files! 🎉

