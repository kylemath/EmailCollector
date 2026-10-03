# Using Live Server with Gmail Email Database Creator

## Why Live Server is Perfect for This App

Live Server is a VS Code/Cursor extension that runs a local development server with hot reload. It's **perfect** for this Gmail API app because:

✅ **It IS a local server** (runs on localhost)  
✅ **Gmail API compatible** (OAuth works perfectly)  
✅ **Auto-reload** (changes refresh automatically)  
✅ **One-click start** (no command line needed)  
✅ **Auto-opens browser** (convenient!)  

## Quick Setup

### 1. Install Live Server

**In VS Code:**
1. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows)
2. Search for "Live Server"
3. Install "Live Server" by Ritwick Dey
4. Reload VS Code

**In Cursor:**
1. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows)
2. Search for "Live Server"
3. Install "Live Server" by Ritwick Dey
4. Reload Cursor

### 2. Configure OAuth Authorized Origins

**Important!** Live Server typically uses port **5500**.

In Google Cloud Console → Your OAuth Client:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Click your OAuth Client ID
4. Under "Authorized JavaScript origins", add:
   - `http://localhost:5500`
   - `http://127.0.0.1:5500`
5. Click "Save"

### 3. Start Live Server

**Method 1: Right-click**
1. Open `index.html` in VS Code/Cursor
2. Right-click anywhere in the file
3. Select "Open with Live Server"
4. Browser opens automatically! 🎉

**Method 2: Status Bar**
1. Look at the bottom-right of VS Code/Cursor
2. Click "Go Live"
3. Browser opens automatically! 🎉

**Method 3: Command Palette**
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type "Live Server: Open with Live Server"
3. Press Enter
4. Browser opens automatically! 🎉

### 4. Use the App

The app should now be running at:
```
http://127.0.0.1:5500/index.html
```

Or:
```
http://localhost:5500/index.html
```

Enter your Gmail credentials and start fetching emails!

## Live Server Settings (Optional)

You can customize Live Server by adding to VS Code/Cursor settings:

**Open Settings JSON:**
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
- Type "Preferences: Open Settings (JSON)"
- Add these settings:

```json
{
  "liveServer.settings.port": 5500,
  "liveServer.settings.root": "/",
  "liveServer.settings.donotShowInfoMsg": true,
  "liveServer.settings.CustomBrowser": "chrome"
}
```

### Change Port (If Needed)

If port 5500 is in use, change it:

```json
{
  "liveServer.settings.port": 8080
}
```

**Remember:** Update OAuth authorized origins if you change the port!

## Troubleshooting

### "Port already in use"
- Close other Live Server instances
- Or change the port in settings
- Or use a different port in OAuth settings

### OAuth Error: "redirect_uri_mismatch"
- Make sure `http://localhost:5500` is in authorized origins
- Check you're not using a different port
- Verify no typos in the URL

### "Live Server" not in context menu
- Make sure extension is installed and enabled
- Reload VS Code/Cursor
- Try opening from status bar instead

### Browser doesn't open automatically
- Check your default browser settings
- Manually navigate to `http://localhost:5500`
- Or click the URL shown in VS Code/Cursor output panel

## Comparison: Live Server vs Python Server

| Feature | Live Server | Python Server |
|---------|-------------|---------------|
| Installation | Extension (one-time) | Built into Python |
| Starting | One click | Command line |
| Port | 5500 (default) | 8000 (typical) |
| Auto-reload | ✅ Yes | ❌ No |
| Auto-open browser | ✅ Yes | ❌ No |
| Hot reload | ✅ Yes | ❌ No |
| Best for | Development | Quick testing |

**Recommendation**: Use Live Server for regular development!

## Live Reload Features

With Live Server, changes are automatically reflected:

✅ Edit HTML → Browser refreshes automatically  
✅ Edit CSS → Styles update without refresh  
✅ Edit JavaScript → Browser reloads  

Great for customizing the app!

## Using Both Methods

You can use both Live Server and Python server:

**Live Server** (port 5500):
- For development and customization
- Daily use

**Python Server** (port 8000):
- For deployment testing
- When Live Server is unavailable

Just add both ports to your OAuth authorized origins:
```
http://localhost:5500
http://localhost:8000
http://127.0.0.1:5500
http://127.0.0.1:8000
```

## Pro Tips

### Tip 1: Custom Port
If you want to match the documentation (port 8000):
```json
{
  "liveServer.settings.port": 8000
}
```

### Tip 2: Specific Browser
Open in a specific browser:
```json
{
  "liveServer.settings.CustomBrowser": "chrome"
}
```
Options: `"chrome"`, `"firefox"`, `"edge"`, `"safari"`

### Tip 3: Auto-Save
Enable auto-save in VS Code/Cursor for instant updates:
```
File → Auto Save (or Cmd+Option+S)
```

### Tip 4: Stop Server
Click "Port: 5500" in status bar to stop the server.

## FAQ

**Q: Do I still need Python?**  
A: No! Live Server is enough for running the app.

**Q: Can I use both Live Server and Python server?**  
A: Yes! Just add both ports to OAuth settings.

**Q: Which port should I use?**  
A: Live Server default (5500) is fine. Or 8000 to match docs.

**Q: Does Live Server work with Gmail API?**  
A: Yes! It runs a real HTTP server on localhost, which is exactly what Gmail API needs.

**Q: Can I use Live Server in production?**  
A: This app is client-side only. For production, host the files on any web server with HTTPS.

**Q: What if I'm not using VS Code/Cursor?**  
A: Use any local server: Python's http.server, Node's http-server, or similar.

## Summary

✨ **Live Server is the easiest way to run this app!**

1. Install the extension
2. Add `http://localhost:5500` to OAuth origins
3. Right-click `index.html` → "Open with Live Server"
4. Done!

No command line, no manual browser opening, with hot reload! 🚀

---

**Bottom Line**: Live Server is a real local HTTP server - perfect for Gmail API OAuth, and way more convenient than command-line servers!

