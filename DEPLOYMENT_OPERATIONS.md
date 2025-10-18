# ALCELERATE BACKEND - DEPLOYMENT & OPERATIONS GUIDE

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment Requirements

- [ ] Node.js 16+ installed
- [ ] MongoDB cluster created and accessible
- [ ] HubSpot private app token generated
- [ ] Google Cloud project created with Calendar API enabled
- [ ] Service account JSON key downloaded
- [ ] WhatsApp Business Account setup complete
- [ ] Gmail app password generated
- [ ] All environment variables configured
- [ ] Git repository cloned
- [ ] Dependencies installed (`npm install`)

### Environment Setup

**Create `.env` file in project root:**

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alcelerate

# Email (Gmail SMTP)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx

# HubSpot
HUBSPOT_PRIVATE_TOKEN=pat-na1-xxxxxxxxxxxxx
HUBSPOT_PORTAL=12345678
HUBSPOT_FORM=abcdef123456

# Google Calendar
GOOGLE_KEY_FILE={"type":"service_account","project_id":"..."}
GOOGLE_CLIENT_EMAIL=service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GCAL_IMPERSONATE_USER=user@domain.com
CALENDAR_ID=primary
GOOGLE_CALENDAR_OWNER_EMAIL=owner@domain.com

# Google Sheets
GOOGLE_SHEET_URL=https://script.google.com/macros/d/xxxxx/usercontent/v/...
GOOGLE_SHEET_FORM_URL=https://script.google.com/macros/d/xxxxx/usercontent/v/...

# WhatsApp
WHATS_APP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
```

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/VasavMittal/Alcelerate-BackEnd.git
cd Alcelerate-BackEnd

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with actual values

# 4. Test connection
npm start

# 5. Verify health endpoint
curl http://localhost:3000/health
```

---

## 🏢 PRODUCTION DEPLOYMENT

### Option 1: Heroku Deployment

**Prerequisites:**
- Heroku CLI installed
- Heroku account created

**Steps:**
```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create alcelerate-backend

# 3. Set environment variables
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set HUBSPOT_PRIVATE_TOKEN=pat-...
heroku config:set SMTP_USER=...
heroku config:set SMTP_PASSWORD=...
# ... set all other variables

# 4. Deploy
git push heroku main

# 5. View logs
heroku logs --tail
```

### Option 2: AWS EC2 Deployment

**Prerequisites:**
- AWS account with EC2 instance
- Ubuntu 20.04 LTS or similar

**Steps:**
```bash
# 1. SSH into instance
ssh -i key.pem ubuntu@instance-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone https://github.com/VasavMittal/Alcelerate-BackEnd.git
cd Alcelerate-BackEnd

# 4. Install dependencies
npm install

# 5. Create .env file
nano .env
# Paste environment variables

# 6. Install PM2 (process manager)
sudo npm install -g pm2

# 7. Start application
pm2 start src/index.js --name "alcelerate"
pm2 startup
pm2 save

# 8. Setup Nginx reverse proxy
sudo apt-get install nginx
# Configure nginx to proxy to localhost:3000
```

### Option 3: Docker Deployment

**Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]
```

**Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=${MONGO_URI}
      - HUBSPOT_PRIVATE_TOKEN=${HUBSPOT_PRIVATE_TOKEN}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      # ... other variables
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

---

## 📊 MONITORING & LOGGING

### Application Logs

**Log Locations:**
- Console output (stdout/stderr)
- PM2 logs: `~/.pm2/logs/`
- Docker logs: `docker logs container-id`

**Log Levels:**
- ✅ Success operations
- ❌ Errors
- ⚠️ Warnings
- 🔄 Status updates
- 📧 Email operations
- 💬 WhatsApp operations

### Monitoring Setup

**PM2 Monitoring:**
```bash
# Install PM2 Plus
pm2 install pm2-auto-pull

# Monitor in real-time
pm2 monit

# Get status
pm2 status
```

**Health Check Endpoint:**
```bash
# Monitor health
curl -X GET http://localhost:3000/health

# Setup monitoring script
while true; do
  curl -s http://localhost:3000/health || echo "Server down"
  sleep 60
done
```

### Error Tracking

**Recommended Services:**
- Sentry (error tracking)
- LogRocket (session replay)
- DataDog (monitoring)
- New Relic (APM)

**Sentry Integration Example:**
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

---

## 🔧 MAINTENANCE TASKS

### Daily Tasks
- [ ] Check application logs for errors
- [ ] Verify cron jobs are running
- [ ] Monitor email delivery success rate
- [ ] Check WhatsApp message delivery

### Weekly Tasks
- [ ] Review lead processing statistics
- [ ] Check database performance
- [ ] Verify all integrations are working
- [ ] Review failed email/message logs

### Monthly Tasks
- [ ] Database backup verification
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Update dependencies (`npm audit`)

### Database Maintenance

**Backup MongoDB:**
```bash
# Manual backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/alcelerate" \
  --out=./backup

# Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/alcelerate" \
  ./backup/alcelerate
```

**Database Optimization:**
```javascript
// Remove old records (older than 90 days)
db.aicelerate.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
})

// Rebuild indexes
db.aicelerate.reIndex()
```

---

## 🚨 TROUBLESHOOTING

### Issue: Cron jobs not running

**Symptoms:**
- Reminders not being sent
- No database updates
- Logs show no cron activity

**Solutions:**
```bash
# 1. Check if process is running
pm2 status

# 2. Restart application
pm2 restart alcelerate

# 3. Check logs
pm2 logs alcelerate

# 4. Verify MongoDB connection
# Add test query in code
```

### Issue: Emails not sending

**Symptoms:**
- Email send failures in logs
- Leads not receiving reminders

**Solutions:**
```bash
# 1. Verify SMTP credentials
# Test with telnet
telnet smtp.gmail.com 587

# 2. Check Gmail app password
# Regenerate if needed

# 3. Verify sender email
# Check if support@aicelerate.ai is configured

# 4. Check spam folder
# Verify email isn't being filtered
```

### Issue: WhatsApp messages not delivering

**Symptoms:**
- WhatsApp send failures in logs
- Messages not reaching users

**Solutions:**
```bash
# 1. Verify access token
# Check token expiration

# 2. Verify phone number format
# Should be: country code + number (e.g., 1234567890)

# 3. Check template names
# Verify templates exist in WhatsApp Manager

# 4. Check rate limits
# WhatsApp has rate limits per phone number
```

### Issue: HubSpot sync failing

**Symptoms:**
- Leads not syncing from HubSpot
- Status updates not working

**Solutions:**
```bash
# 1. Verify API token
# Check token hasn't expired

# 2. Test API connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.hubapi.com/crm/v3/objects/contacts

# 3. Check scopes
# Verify token has required scopes

# 4. Check rate limits
# HubSpot has rate limits
```

### Issue: Google Calendar sync not working

**Symptoms:**
- Calendar events not being detected
- Meetings not being marked as booked

**Solutions:**
```bash
# 1. Verify service account has access
# Check calendar sharing settings

# 2. Test authentication
# Verify GOOGLE_KEY_FILE is valid JSON

# 3. Check calendar ID
# Verify CALENDAR_ID is correct

# 4. Check event search
# Verify events have "Aicelerate" in title
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Database Optimization
```javascript
// Add indexes
db.aicelerate.createIndex({ email: 1 }, { unique: true })
db.aicelerate.createIndex({ "meetingDetails.hubspotStatus": 1 })
db.aicelerate.createIndex({ "meetingDetails.meetingTime": 1 })
db.aicelerate.createIndex({ createdAt: 1 })

// Archive old records
db.aicelerate.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 180*24*60*60*1000) }
})
```

### API Optimization
```javascript
// Add caching
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 });

// Cache HubSpot contacts
const cachedContacts = cache.get("hubspot_contacts");
if (!cachedContacts) {
  const contacts = await fetchHubSpotLeads();
  cache.set("hubspot_contacts", contacts);
}
```

### Cron Job Optimization
```javascript
// Prevent overlapping jobs
let isRunning = false;

cron.schedule("*/3 * * * *", async () => {
  if (isRunning) return;
  isRunning = true;
  try {
    await runAutomationTasks();
  } finally {
    isRunning = false;
  }
});
```

---

## 🔐 SECURITY HARDENING

### Environment Variables
- [ ] Never commit .env file
- [ ] Use strong, unique passwords
- [ ] Rotate tokens regularly
- [ ] Use separate tokens for dev/prod

### API Security
- [ ] Add request validation
- [ ] Implement rate limiting
- [ ] Add API authentication
- [ ] Use HTTPS only
- [ ] Add CORS restrictions

### Database Security
- [ ] Enable MongoDB authentication
- [ ] Use IP whitelist
- [ ] Enable encryption at rest
- [ ] Regular backups
- [ ] Audit logging

### Code Security
- [ ] Regular dependency updates
- [ ] Security scanning (`npm audit`)
- [ ] Code review process
- [ ] Secrets scanning in CI/CD

---

## 📞 SUPPORT & ESCALATION

### Common Issues Contact Points

| Issue | Contact | Response Time |
|-------|---------|----------------|
| Server Down | DevOps Team | 15 min |
| Email Failures | Email Provider | 1 hour |
| HubSpot Sync Issues | HubSpot Support | 2 hours |
| Database Issues | Database Admin | 30 min |
| WhatsApp Issues | WhatsApp Support | 4 hours |

### Escalation Path
1. Check logs and monitoring
2. Restart affected service
3. Contact relevant team
4. Escalate to management if critical

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-18  
**Maintained By:** DevOps Team

