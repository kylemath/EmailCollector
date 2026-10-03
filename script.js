// Email Database Creator - Main Script
// All processing happens client-side for privacy

// Credentials Manager
class CredentialsManager {
    constructor() {
        this.CLIENT_ID_KEY = 'gmail_client_id';
        this.API_KEY_KEY = 'gmail_api_key';
    }

    // Save credentials to localStorage
    saveCredentials(clientId, apiKey) {
        localStorage.setItem(this.CLIENT_ID_KEY, clientId);
        if (apiKey) {
            localStorage.setItem(this.API_KEY_KEY, apiKey);
        }
    }

    // Get credentials from localStorage (or fallback to config.js if it exists)
    getCredentials() {
        let clientId = localStorage.getItem(this.CLIENT_ID_KEY);
        let apiKey = localStorage.getItem(this.API_KEY_KEY);

        // Fallback to config.js if available and not placeholder
        if (!clientId && typeof CONFIG !== 'undefined') {
            if (!CONFIG.CLIENT_ID.includes('YOUR_CLIENT_ID')) {
                clientId = CONFIG.CLIENT_ID;
                apiKey = CONFIG.API_KEY;
            }
        }

        return {
            clientId: clientId || '',
            apiKey: apiKey || ''
        };
    }

    // Check if credentials are configured
    isConfigured() {
        const creds = this.getCredentials();
        return creds.clientId && creds.clientId.length > 0;
    }

    // Clear saved credentials
    clearCredentials() {
        localStorage.removeItem(this.CLIENT_ID_KEY);
        localStorage.removeItem(this.API_KEY_KEY);
    }
}

// Gmail API Service
class GmailService {
    constructor(credentialsManager) {
        this.isSignedIn = false;
        this.tokenClient = null;
        this.accessToken = null;
        this.credentialsManager = credentialsManager;
        this.DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
        this.SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
    }

    // Initialize Gmail API
    async initialize() {
        try {
            const creds = this.credentialsManager.getCredentials();
            
            if (!creds.clientId) {
                console.warn('Gmail API not configured. Please enter your credentials.');
                return false;
            }

            // Initialize Google Identity Services
            return new Promise((resolve) => {
                gapi.load('client', async () => {
                    await gapi.client.init({
                        apiKey: creds.apiKey || undefined,
                        discoveryDocs: this.DISCOVERY_DOCS,
                    });
                    resolve(true);
                });
            });
        } catch (error) {
            console.error('Error initializing Gmail API:', error);
            return false;
        }
    }

    // Initialize token client for OAuth
    initTokenClient(callback) {
        const creds = this.credentialsManager.getCredentials();
        
        if (!creds.clientId) {
            console.error('Cannot initialize token client: Client ID not configured');
            return false;
        }

        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: creds.clientId,
            scope: this.SCOPES,
            callback: callback,
        });
        
        return true;
    }

    // Request access token
    requestAccessToken() {
        return new Promise((resolve, reject) => {
            try {
                this.tokenClient.callback = async (response) => {
                    if (response.error !== undefined) {
                        reject(response);
                        return;
                    }
                    this.accessToken = response.access_token;
                    this.isSignedIn = true;
                    resolve(response);
                };
                
                // Request token
                if (gapi.client.getToken() === null) {
                    this.tokenClient.requestAccessToken({ prompt: 'consent' });
                } else {
                    this.tokenClient.requestAccessToken({ prompt: '' });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Sign out
    signOut() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
        }
        this.isSignedIn = false;
        this.accessToken = null;
    }

    // Fetch emails from Gmail
    async fetchEmails(targetEmail, maxResults = 500) {
        const allEmails = [];
        let pageToken = null;
        const query = targetEmail ? `from:${targetEmail} OR to:${targetEmail}` : '';

        try {
            do {
                const response = await gapi.client.gmail.users.messages.list({
                    userId: 'me',
                    q: query,
                    maxResults: Math.min(100, maxResults - allEmails.length),
                    pageToken: pageToken
                });

                const messages = response.result.messages || [];
                
                // Fetch full message details for each message
                for (const message of messages) {
                    const fullMessage = await this.fetchMessageDetails(message.id);
                    if (fullMessage) {
                        allEmails.push(fullMessage);
                    }
                    
                    // Respect rate limits - small delay between requests
                    await this.sleep(50);
                }

                pageToken = response.result.nextPageToken;
                
            } while (pageToken && allEmails.length < maxResults);

            return allEmails;
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw error;
        }
    }

    // Fetch full details of a single message
    async fetchMessageDetails(messageId) {
        try {
            const response = await gapi.client.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full'
            });

            return this.parseGmailMessage(response.result);
        } catch (error) {
            console.error('Error fetching message:', messageId, error);
            return null;
        }
    }

    // Parse Gmail message to our format
    parseGmailMessage(message) {
        const headers = message.payload.headers;
        const email = {
            from: this.getHeader(headers, 'From'),
            to: this.getHeader(headers, 'To'),
            subject: this.getHeader(headers, 'Subject'),
            date: this.getHeader(headers, 'Date'),
            body: '',
            headers: {}
        };

        // Store all headers
        headers.forEach(header => {
            email.headers[header.name.toLowerCase()] = header.value;
        });

        // Extract email addresses
        email.from = this.extractEmail(email.from);
        email.to = this.extractEmail(email.to);

        // Parse date
        email.date = this.parseDate(email.date);

        // Extract body
        email.body = this.extractBody(message.payload);

        return email;
    }

    // Get header value by name
    getHeader(headers, name) {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
    }

    // Extract email body from message payload
    extractBody(payload) {
        let body = '';

        if (payload.body && payload.body.data) {
            body = this.decodeBase64(payload.body.data);
        } else if (payload.parts) {
            // Multipart message
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                    body += this.decodeBase64(part.body.data);
                } else if (part.parts) {
                    // Recursive for nested parts
                    body += this.extractBody(part);
                }
            }
        }

        return this.cleanBody(body);
    }

    // Decode base64url encoded data
    decodeBase64(data) {
        try {
            // Replace URL-safe characters and add padding
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            const padding = base64.length % 4;
            const padded = padding ? base64 + '='.repeat(4 - padding) : base64;
            return decodeURIComponent(escape(atob(padded)));
        } catch (error) {
            console.error('Error decoding base64:', error);
            return data;
        }
    }

    // Extract email address
    extractEmail(header) {
        const match = header.match(/<([^>]+)>/);
        if (match) {
            return match[1].toLowerCase();
        }
        const emailMatch = header.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
            return emailMatch[0].toLowerCase();
        }
        return header.toLowerCase();
    }

    // Parse date
    parseDate(dateString) {
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        } catch (error) {
            console.error('Error parsing date:', error);
        }
        return dateString;
    }

    // Clean email body
    cleanBody(body) {
        return body
            .replace(/^>+\s*/gm, '')
            .replace(/^\s*On .+ wrote:\s*$/gm, '')
            .replace(/--\s*\n.*$/s, '')
            .replace(/_{5,}/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    // Utility: sleep function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get user profile
    async getUserProfile() {
        try {
            const response = await gapi.client.gmail.users.getProfile({
                userId: 'me'
            });
            return response.result;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }
}

class EmailParser {
    constructor() {
        this.emails = [];
        this.processedData = null;
    }

    // Parse various email formats
    async parseFiles(files) {
        const allContent = [];
        
        for (const file of files) {
            const content = await this.readFile(file);
            const fileName = file.name.toLowerCase();
            
            if (fileName.endsWith('.mbox')) {
                allContent.push(...this.parseMbox(content));
            } else if (fileName.endsWith('.eml')) {
                allContent.push(this.parseEml(content));
            } else if (fileName.endsWith('.txt')) {
                // Try to detect format
                if (content.includes('From ') && content.includes('\n\nFrom ')) {
                    allContent.push(...this.parseMbox(content));
                } else {
                    allContent.push(this.parseEml(content));
                }
            }
        }
        
        this.emails = allContent.filter(email => email !== null);
        return this.emails;
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Parse MBOX format (Gmail Takeout, etc.)
    parseMbox(content) {
        const emails = [];
        // Split by "From " at the beginning of lines
        const messages = content.split(/\n(?=From )/);
        
        for (const message of messages) {
            if (message.trim()) {
                const email = this.parseEml(message);
                if (email) {
                    emails.push(email);
                }
            }
        }
        
        return emails;
    }

    // Parse EML format (individual email files)
    parseEml(content) {
        try {
            const lines = content.split('\n');
            const email = {
                from: '',
                to: '',
                subject: '',
                date: '',
                body: '',
                headers: {}
            };
            
            let inHeaders = true;
            let bodyLines = [];
            let currentHeader = '';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                if (inHeaders) {
                    // Empty line marks end of headers
                    if (line.trim() === '') {
                        inHeaders = false;
                        continue;
                    }
                    
                    // Header continuation (starts with whitespace)
                    if (line.match(/^\s/) && currentHeader) {
                        email.headers[currentHeader] += ' ' + line.trim();
                    } else {
                        // New header
                        const match = line.match(/^([^:]+):\s*(.*)$/);
                        if (match) {
                            const headerName = match[1].toLowerCase();
                            const headerValue = match[2].trim();
                            currentHeader = headerName;
                            email.headers[headerName] = headerValue;
                            
                            // Extract common headers
                            if (headerName === 'from') {
                                email.from = this.extractEmail(headerValue);
                            } else if (headerName === 'to') {
                                email.to = this.extractEmail(headerValue);
                            } else if (headerName === 'subject') {
                                email.subject = this.decodeHeader(headerValue);
                            } else if (headerName === 'date') {
                                email.date = this.parseDate(headerValue);
                            }
                        }
                    }
                } else {
                    bodyLines.push(line);
                }
            }
            
            email.body = this.cleanBody(bodyLines.join('\n'));
            
            // Validate required fields
            if (email.from && email.date) {
                return email;
            }
            
            return null;
        } catch (error) {
            console.error('Error parsing email:', error);
            return null;
        }
    }

    // Extract email address from "Name <email@example.com>" format
    extractEmail(header) {
        const match = header.match(/<([^>]+)>/);
        if (match) {
            return match[1].toLowerCase();
        }
        // Handle plain email addresses
        const emailMatch = header.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
            return emailMatch[0].toLowerCase();
        }
        return header.toLowerCase();
    }

    // Decode MIME encoded headers
    decodeHeader(header) {
        try {
            // Basic MIME decoding (this could be expanded)
            return header.replace(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi, (match, charset, encoding, text) => {
                if (encoding.toUpperCase() === 'B') {
                    // Base64
                    try {
                        return atob(text);
                    } catch (e) {
                        return text;
                    }
                } else if (encoding.toUpperCase() === 'Q') {
                    // Quoted-printable
                    return text.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, 
                        (match, hex) => String.fromCharCode(parseInt(hex, 16)));
                }
                return text;
            });
        } catch (error) {
            return header;
        }
    }

    // Parse date to ISO format
    parseDate(dateString) {
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        } catch (error) {
            console.error('Error parsing date:', error);
        }
        return dateString;
    }

    // Clean email body (remove quoted text markers, etc.)
    cleanBody(body) {
        // Remove common email artifacts
        let cleaned = body
            .replace(/^>+\s*/gm, '') // Remove quote markers
            .replace(/^\s*On .+ wrote:\s*$/gm, '') // Remove "On X wrote:" lines
            .replace(/--\s*\n.*$/s, '') // Remove signatures
            .replace(/_{5,}/g, '') // Remove long underscores
            .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
            .trim();
        
        return cleaned;
    }

    // Filter emails by criteria
    filterEmails(targetEmail, yearsBack) {
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsBack);
        
        return this.emails.filter(email => {
            // Check date
            const emailDate = new Date(email.date);
            if (isNaN(emailDate.getTime()) || emailDate < cutoffDate) {
                return false;
            }
            
            // Check if email involves target person (if specified)
            if (targetEmail) {
                const target = targetEmail.toLowerCase();
                return email.from.includes(target) || email.to.includes(target);
            }
            
            return true;
        });
    }

    // Organize emails into conversations and structure for LLM
    organizeForLLM(emails, includeSubject, includeMetadata) {
        // Sort by date
        emails.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Group by conversation threads (using subject as key)
        const conversations = {};
        
        for (const email of emails) {
            // Normalize subject (remove Re:, Fwd:, etc.)
            let subject = email.subject
                .replace(/^(Re:|Fwd?:|AW:|Antw:)\s*/gi, '')
                .trim();
            
            if (!subject) {
                subject = '(No Subject)';
            }
            
            if (!conversations[subject]) {
                conversations[subject] = [];
            }
            
            conversations[subject].push(email);
        }
        
        // Format for LLM training
        const formatted = {
            metadata: {
                total_emails: emails.length,
                conversations: Object.keys(conversations).length,
                date_range: {
                    earliest: emails[0]?.date || null,
                    latest: emails[emails.length - 1]?.date || null
                },
                generated: new Date().toISOString()
            },
            conversations: []
        };
        
        // Convert each conversation thread
        for (const [subject, thread] of Object.entries(conversations)) {
            const conversation = {
                thread_subject: includeSubject ? subject : null,
                messages: []
            };
            
            for (const email of thread) {
                const message = {
                    role: this.determineRole(email),
                    content: email.body
                };
                
                if (includeMetadata) {
                    message.metadata = {
                        from: email.from,
                        to: email.to,
                        date: email.date,
                        subject: email.subject
                    };
                }
                
                conversation.messages.push(message);
            }
            
            formatted.conversations.push(conversation);
        }
        
        // Also create a flat format for easy LLM consumption
        formatted.flat_format = emails.map(email => ({
            role: this.determineRole(email),
            content: email.body,
            ...(includeMetadata && {
                metadata: {
                    from: email.from,
                    to: email.to,
                    date: email.date,
                    subject: includeSubject ? email.subject : null
                }
            })
        }));
        
        return formatted;
    }

    // Determine if email is from user or assistant (target person)
    determineRole(email) {
        // This is a simple heuristic - you might want to customize based on your email
        // For now, we'll mark it as the direction (sent/received)
        return {
            sender: email.from,
            type: 'message'
        };
    }

    // Get statistics
    getStats(data) {
        return {
            totalEmails: data.metadata.total_emails,
            conversations: data.metadata.conversations,
            dateRange: `${this.formatDate(data.metadata.date_range.earliest)} - ${this.formatDate(data.metadata.date_range.latest)}`
        };
    }

    formatDate(isoDate) {
        if (!isoDate) return 'N/A';
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}

// UI Controller
class EmailDatabaseApp {
    constructor() {
        this.parser = new EmailParser();
        this.credentialsManager = new CredentialsManager();
        this.gmailService = new GmailService(this.credentialsManager);
        this.processedData = null;
        this.gmailEmails = [];
        this.initializeUI();
        this.loadCredentials();
        this.initializeGmailAPI();
    }

    async initializeGmailAPI() {
        if (!this.credentialsManager.isConfigured()) {
            console.log('Credentials not configured yet');
            return;
        }
        
        const initialized = await this.gmailService.initialize();
        if (initialized) {
            const success = this.gmailService.initTokenClient();
            if (!success) {
                this.showToast('❌ Failed to initialize Gmail API. Check your credentials.');
            }
        }
    }

    initializeUI() {
        // File upload
        this.fileInput = document.getElementById('emailFileInput');
        this.fileInfo = document.getElementById('fileInfo');
        
        // Filters
        this.targetEmailInput = document.getElementById('targetEmail');
        this.yearsBackInput = document.getElementById('yearsBack');
        this.includeSubjectCheck = document.getElementById('includeSubject');
        this.includeMetadataCheck = document.getElementById('includeMetadata');
        
        // Credentials
        this.clientIdInput = document.getElementById('clientIdInput');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.saveCredentialsBtn = document.getElementById('saveCredentialsBtn');
        this.clearCredentialsBtn = document.getElementById('clearCredentialsBtn');
        this.credentialsStatus = document.getElementById('credentialsStatus');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.authStatus = document.getElementById('authStatus');
        
        // Gmail specific
        this.authorizeBtn = document.getElementById('authorizeBtn');
        this.signoutBtn = document.getElementById('signoutBtn');
        this.userInfo = document.getElementById('userInfo');
        this.gmailTargetEmail = document.getElementById('gmailTargetEmail');
        this.gmailMaxResults = document.getElementById('gmailMaxResults');
        this.fetchGmailBtn = document.getElementById('fetchGmailBtn');
        this.gmailFetchSection = document.getElementById('gmailFetchSection');
        this.fetchProgress = document.getElementById('fetchProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Modal
        this.setupModal = document.getElementById('setupModal');
        this.setupInstructionsLink = document.getElementById('setupInstructionsLink');
        this.closeModal = document.querySelector('.close-modal');
        
        // Actions
        this.processBtn = document.getElementById('processBtn');
        this.downloadBtn = document.getElementById('downloadJsonBtn');
        this.copyBtn = document.getElementById('copyJsonBtn');
        
        // Results
        this.resultsSection = document.getElementById('resultsSection');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Event listeners
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.processBtn.addEventListener('click', () => this.processEmails());
        this.downloadBtn.addEventListener('click', () => this.downloadJSON());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        // Credentials event listeners
        this.saveCredentialsBtn.addEventListener('click', () => this.saveCredentials());
        this.clearCredentialsBtn.addEventListener('click', () => this.clearCredentials());
        
        // Gmail event listeners
        this.authorizeBtn.addEventListener('click', () => this.handleAuthClick());
        this.signoutBtn.addEventListener('click', () => this.handleSignoutClick());
        this.fetchGmailBtn.addEventListener('click', () => this.fetchGmailEmails());
        
        // Modal event listeners
        this.setupInstructionsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.setupModal.style.display = 'flex';
        });
        this.closeModal.addEventListener('click', () => {
            this.setupModal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === this.setupModal) {
                this.setupModal.style.display = 'none';
            }
        });
        
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    // Load saved credentials
    loadCredentials() {
        const creds = this.credentialsManager.getCredentials();
        
        if (creds.clientId) {
            this.clientIdInput.value = creds.clientId;
            this.apiKeyInput.value = creds.apiKey;
            this.updateCredentialsStatus(true);
        } else {
            this.updateCredentialsStatus(false);
        }
    }

    // Save credentials
    saveCredentials() {
        const clientId = this.clientIdInput.value.trim();
        const apiKey = this.apiKeyInput.value.trim();

        if (!clientId) {
            alert('Please enter your OAuth Client ID');
            return;
        }

        // Validate Client ID format
        if (!clientId.includes('.apps.googleusercontent.com') && !clientId.includes('YOUR_CLIENT_ID')) {
            if (!confirm('The Client ID format looks unusual. Are you sure this is correct?')) {
                return;
            }
        }

        // Save credentials
        this.credentialsManager.saveCredentials(clientId, apiKey);
        this.updateCredentialsStatus(true);
        this.showToast('✅ Credentials saved successfully!');

        // Initialize Gmail API with new credentials
        this.initializeGmailAPI();
    }

    // Clear saved credentials
    clearCredentials() {
        if (!confirm('Are you sure you want to clear your saved credentials?')) {
            return;
        }

        this.credentialsManager.clearCredentials();
        this.clientIdInput.value = '';
        this.apiKeyInput.value = '';
        this.updateCredentialsStatus(false);
        this.updateSignInStatus(false);
        this.showToast('🗑️ Credentials cleared');
    }

    // Update credentials status UI
    updateCredentialsStatus(isConfigured) {
        if (isConfigured) {
            this.credentialsStatus.classList.add('configured');
            this.statusIndicator.textContent = '✅';
            this.statusText.textContent = 'Gmail API credentials configured';
            this.clearCredentialsBtn.style.display = 'inline-flex';
            this.authStatus.style.display = 'block';
        } else {
            this.credentialsStatus.classList.remove('configured');
            this.statusIndicator.textContent = '⚙️';
            this.statusText.textContent = 'Gmail API credentials not configured';
            this.clearCredentialsBtn.style.display = 'none';
            this.authStatus.style.display = 'none';
        }
    }

    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    async handleAuthClick() {
        try {
            await this.gmailService.requestAccessToken();
            this.updateSignInStatus(true);
            
            // Get user profile
            const profile = await this.gmailService.getUserProfile();
            if (profile) {
                this.userInfo.innerHTML = `
                    <p>✅ Connected as: <strong>${profile.emailAddress}</strong></p>
                    <p>Total messages: ${profile.messagesTotal.toLocaleString()}</p>
                `;
                this.userInfo.style.display = 'block';
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert('Failed to authenticate. Please check your API configuration.');
        }
    }

    handleSignoutClick() {
        this.gmailService.signOut();
        this.updateSignInStatus(false);
    }

    updateSignInStatus(isSignedIn) {
        if (isSignedIn) {
            this.authorizeBtn.style.display = 'none';
            this.signoutBtn.style.display = 'inline-flex';
            this.gmailFetchSection.style.display = 'block';
        } else {
            this.authorizeBtn.style.display = 'inline-flex';
            this.signoutBtn.style.display = 'none';
            this.gmailFetchSection.style.display = 'none';
            this.userInfo.style.display = 'none';
            this.userInfo.innerHTML = '';
        }
    }

    async fetchGmailEmails() {
        const targetEmail = this.gmailTargetEmail.value.trim();
        const maxResults = parseInt(this.gmailMaxResults.value) || 500;

        if (!targetEmail) {
            alert('Please enter a target email address to filter conversations.');
            return;
        }

        this.fetchProgress.style.display = 'block';
        this.fetchGmailBtn.disabled = true;
        
        try {
            let fetched = 0;
            this.progressText.textContent = 'Starting email fetch...';
            
            // We'll update progress as we fetch
            const progressInterval = setInterval(() => {
                fetched += 5;
                const percent = Math.min((fetched / maxResults) * 100, 95);
                this.progressFill.style.width = percent + '%';
                this.progressText.textContent = `Fetching emails... (estimated ${fetched}/${maxResults})`;
            }, 500);

            this.gmailEmails = await this.gmailService.fetchEmails(targetEmail, maxResults);
            
            clearInterval(progressInterval);
            this.progressFill.style.width = '100%';
            this.progressText.textContent = `✅ Fetched ${this.gmailEmails.length} emails successfully!`;
            
            // Add to parser
            this.parser.emails = this.gmailEmails;
            
            // Show success message
            this.fileInfo.classList.add('active');
            this.fileInfo.innerHTML = `
                <p><strong>📥 Gmail Fetch Complete:</strong></p>
                <p>• ${this.gmailEmails.length} emails fetched with ${targetEmail}</p>
                <p>• Ready to process and export</p>
            `;
            
            // Scroll to process button
            setTimeout(() => {
                document.querySelector('.action-section').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
            
        } catch (error) {
            console.error('Error fetching Gmail emails:', error);
            this.progressText.textContent = '❌ Error fetching emails. Check console for details.';
            alert('Failed to fetch emails. Please check your permissions and try again.');
        } finally {
            this.fetchGmailBtn.disabled = false;
        }
    }

    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.fileInfo.classList.add('active');
            this.fileInfo.innerHTML = `
                <p><strong>📁 Selected Files:</strong></p>
                ${Array.from(files).map(f => `<p>• ${f.name} (${this.formatBytes(f.size)})</p>`).join('')}
            `;
        }
    }

    async processEmails() {
        // Check if we have emails from Gmail or files
        const files = this.fileInput.files;
        const hasGmailEmails = this.gmailEmails.length > 0;
        const hasFiles = files.length > 0;

        if (!hasGmailEmails && !hasFiles) {
            alert('Please either fetch emails from Gmail or upload email files first!');
            return;
        }

        this.showLoading(true);

        try {
            // If we have files, parse them
            if (hasFiles && !hasGmailEmails) {
                await this.parser.parseFiles(Array.from(files));
            }
            // Gmail emails are already in this.parser.emails from fetchGmailEmails
            
            // Apply filters
            const targetEmail = this.targetEmailInput.value.trim();
            const yearsBack = parseInt(this.yearsBackInput.value) || 5;
            const includeSubject = this.includeSubjectCheck.checked;
            const includeMetadata = this.includeMetadataCheck.checked;
            
            // Only apply additional filtering for manual uploads
            let filteredEmails;
            if (hasGmailEmails) {
                // Gmail emails are already filtered by target email
                filteredEmails = this.parser.filterEmails('', yearsBack);
            } else {
                filteredEmails = this.parser.filterEmails(targetEmail, yearsBack);
            }
            
            if (filteredEmails.length === 0) {
                alert('No emails found matching your criteria. Try adjusting the filters.');
                this.showLoading(false);
                return;
            }
            
            // Organize for LLM
            this.processedData = this.parser.organizeForLLM(filteredEmails, includeSubject, includeMetadata);
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('Error processing emails:', error);
            alert('An error occurred while processing emails. Check the console for details.');
        }

        this.showLoading(false);
    }

    displayResults() {
        const stats = this.parser.getStats(this.processedData);
        
        document.getElementById('totalEmails').textContent = stats.totalEmails;
        document.getElementById('dateRange').textContent = stats.dateRange;
        document.getElementById('conversations').textContent = stats.conversations;
        
        // Show preview (first 5 messages)
        const preview = {
            ...this.processedData,
            flat_format: this.processedData.flat_format.slice(0, 5),
            conversations: this.processedData.conversations.slice(0, 2)
        };
        
        document.getElementById('jsonPreview').textContent = JSON.stringify(preview, null, 2);
        
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    downloadJSON() {
        if (!this.processedData) return;
        
        const dataStr = JSON.stringify(this.processedData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-database-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        this.showToast('✅ JSON file downloaded successfully!');
    }

    async copyToClipboard() {
        if (!this.processedData) return;
        
        try {
            const dataStr = JSON.stringify(this.processedData, null, 2);
            await navigator.clipboard.writeText(dataStr);
            this.showToast('✅ JSON copied to clipboard!');
        } catch (error) {
            alert('Failed to copy to clipboard. Please use the download button instead.');
        }
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.emailApp = new EmailDatabaseApp();
});

