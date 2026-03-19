# 🏙️ Civic Pulse — Full Stack Setup Guide

> AI-powered civic reporting platform with real Gemini AI, Twilio SMS, and SQLite database.

---

## ⚡ QUICK START (5 minutes)

### Step 1 — Prerequisites
Install these if you don't have them:
- **Python 3.10+** → https://python.org/downloads
- That's it. No database server needed (SQLite is built-in).

### Step 2 — Get Your FREE API Keys

#### 🤖 Google Gemini AI (FREE — 1500 requests/day)
1. Go to → https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key (starts with `AIzaSy...`)

#### 📱 Twilio SMS (FREE trial — ~500 SMS)
1. Sign up → https://www.twilio.com/try-twilio
2. Verify your phone number
3. From your dashboard, copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token**
   - **Phone Number** (format: `+1XXXXXXXXXX`)

### Step 3 — Configure
Edit the `.env` file and paste your keys:
```
GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your_auth_token
TWILIO_FROM=whatsapp:+1XXXXXXXXXX
```

### Step 4 — Run

**Mac / Linux:**
```bash
bash start.sh
```

**Windows:**
```
Double-click start.bat
```

**Or manually:**
```bash
pip install -r requirements.txt
python app.py
```

### Step 5 — Open in Browser
```
http://localhost:5000
```

---

## 🗂️ FILE STRUCTURE

```
civicpulse/
├── app.py                 ← Flask backend (all API logic)
├── requirements.txt       ← Python packages
├── .env                   ← Your API keys (create from .env.example)
├── .env.example           ← Template for .env (copy to .env and fill in keys)
├── start.sh               ← Mac/Linux launcher
├── start.bat              ← Windows launcher
├── Procfile               ← For Railway/Render deployment
├── runtime.txt            ← Python version pin (3.11.9)
├── civicpulse.db          ← SQLite database (auto-created on first run)
├── uploads/               ← Uploaded photos stored here
├── static/
│   └── js/
│       └── api.js         ← Shared API client for all HTML pages
└── templates/
    ├── index.html         ← Main page (hero + all sections)
    ├── petition_engine.html
    ├── ADOPT_A_PROBLEM.html
    ├── heat_map.html
    └── SOCIAL_MEDIA.html
```

---

## 🌐 API ENDPOINTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/reports/analyze` | AI image analysis |
| POST | `/api/reports/submit` | File a report → SMS sent |
| GET | `/api/reports` | List all reports |
| POST | `/api/reports/letter` | Generate AI complaint letter |
| GET | `/api/reports/heatmap` | Heatmap data |
| GET | `/api/petitions` | All petitions |
| POST | `/api/petitions/<id>/sign` | Sign petition → SMS sent |
| POST | `/api/posts/create` | Create social post |
| GET | `/api/stats` | Platform statistics |

---

## 📱 SMS NOTIFICATIONS (Twilio)

SMS is sent automatically when:
- ✅ User registers → Welcome SMS
- ✅ Report filed → Confirmation with case ID + deadline
- ✅ Case resolved → Resolution notification
- ✅ Petition signed → Thank you + signature count
- ✅ Petition milestones (100, 250, 500, 1000 signatures) → Auto-escalation

> **Without Twilio configured:** All SMS is logged to database instead of sending. Platform works fully without it.

---

## 🤖 AI FEATURES (Gemini)

- **Image Analysis** → Upload photo of civic issue → AI identifies issue type, routes to correct department
- **Complaint Letter Generation** → AI writes formal government letter
- **Severity Assessment** → Low/Medium/High/Critical
- **Department Routing** → Correct municipal body + contact details

> **Without Gemini configured:** Demo mode uses realistic preset responses. Platform works fully without it.

---

## 🗄️ DATABASE

SQLite database (`civicpulse.db`) is auto-created with these tables:
- `users` — All registered users
- `reports` — Civic issue reports with AI analysis
- `petitions` — Active petitions
- `petition_signatures` — Who signed what
- `adoptions` — Community-funded resolutions
- `social_posts` — Public space posts
- `sms_log` — All SMS history

**View database:** Use [DB Browser for SQLite](https://sqlitebrowser.org/) (free)

---

## 🔐 DEFAULT TEST ACCOUNT

When you first run the app, a demo account is created:
- **Email:** `demo@civicpulse.in`
- **Password:** `password`

---

## 🚀 DEPLOY TO PRODUCTION

### Option A: Railway.app (Recommended, FREE tier)
1. Push code to GitHub
2. Connect at https://railway.app
3. Add environment variables from `.env`
4. Done — live URL in minutes

### Option B: Render.com (FREE tier)
1. Push to GitHub
2. New Web Service at https://render.com
3. Start command: `python app.py`

### Option C: VPS / DigitalOcean
```bash
# Install nginx + gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## ❓ TROUBLESHOOTING

**Port already in use:**
```bash
# Mac/Linux:
kill -9 $(lsof -ti:5000)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Gemini not working:**
- Make sure key starts with `AIzaSy`
- Check quota at https://aistudio.google.com

**Twilio SMS not sending:**
- With trial account, you can only send to verified numbers
- Verify your number at https://www.twilio.com/console/phone-numbers/verified

---

Built with ❤️ for India's cities.
