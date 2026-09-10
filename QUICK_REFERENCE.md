# Earnly - Quick Reference Card

## 🚀 Start Here (Copy-Paste Commands)

### First Time Setup
```bash
# 1. Clone
git clone https://github.com/tricenorman/earnly.git
cd earnly

# 2. Database
createdb earnly
psql earnly < server/schema.sql
psql earnly < server/seed.sql

# 3. Backend config
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and PayPal credentials

# 4. Install
npm install
cd ../client
npm install
cd ..
```

### Daily Development
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend (new terminal)
cd client
npm run dev

# Open http://localhost:5173
```

---

## 📋 Essential .env Values

```env
# Must have
DATABASE_URL=postgresql://user:password@localhost:5432/earnly
JWT_SECRET=change-me-to-random-string

# For PayPal (Sandbox testing)
PAYPAL_CLIENT_ID=your-sandbox-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
PAYPAL_ENV=sandbox

# Demo mode (default)
PAYMENTS_MODE=demo
PAYOUTS_MODE=demo
```

---

## 🧪 Test User Journey

1. **Register**: Go to `/register`
   - Email: `test@example.com`
   - Password: `password123` (min 8 chars)

2. **Pay for Membership**: $1 (demo - instant)

3. **Complete Tasks**:
   - "Complete your profile" → +$0.05
   - "Daily activity" → +$0.10
   - "Product feedback" → +$0.25

4. **Withdraw**: Request payout (demo - instant)

5. **Admin Dashboard**: `/admin` (create admin user first)

---

## 🔧 Create Admin User

```bash
# Connect to database
psql earnly

# Create admin after user registers
INSERT INTO admin_users (user_id, role) 
VALUES ('user-uuid-here', 'admin');
```

Then login and access `/admin`

---

## 📱 Key Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/membership/create` | Start payment |
| POST | `/api/membership/capture` | Verify payment |
| GET | `/api/tasks` | Get available tasks |
| POST | `/api/tasks/:id/complete` | Complete task |
| GET | `/api/wallet` | Wallet balance |
| POST | `/api/payouts` | Request withdrawal |
| GET | `/api/admin/stats` | Admin dashboard |

---

## 🎨 Customize Brand

### Change Primary Color
Edit `client/src/styles.css`:
```css
:root {
  --primary: #6366f1;        /* Change this */
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  /* ... */
}
```

### Change App Name
Edit `client/src/App.jsx`, `Navigation.jsx`, etc.
Search for "EARNLY" and replace with your brand.

---

## 🔐 Security Essentials

✅ **DO:**
- Keep `.env` secret
- Hash passwords (bcryptjs handles this)
- Verify payments server-side ✓
- Use HTTPS in production
- Rotate JWT_SECRET periodically
- Audit all transactions

❌ **DON'T:**
- Commit `.env` to Git
- Store plaintext passwords
- Trust frontend for payments
- Expose PayPal secret
- Skip input validation

---

## 💾 Database Queries

### Quick Checks
```sql
-- User count
SELECT COUNT(*) FROM users;

-- Total rewards distributed
SELECT SUM(amount_cents)/100 as total FROM ledger WHERE type='reward';

-- Pending payouts
SELECT COUNT(*) FROM payout_requests WHERE status='pending';

-- User transactions
SELECT * FROM ledger WHERE user_id = 'user-id' ORDER BY created_at DESC;
```

---

## 📊 Demo Task Ideas

Add via Admin Dashboard:

```
Survey: "How would you improve Earnly?"
Reward: $0.50

Sign up for newsletter
Reward: $0.10

Refer a friend (Code: EARN10)
Reward: $0.75 (requires PayPal verification)

Write app review
Reward: $1.00

Participate in beta testing
Reward: $2.00 (weekly)
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED 127.0.0.1:5432` | Start PostgreSQL: `brew services start postgresql` |
| `Cannot find module` | Run `npm install` in that directory |
| `Invalid token` | Clear localStorage, login again |
| `PayPal error` | Verify credentials in `.env` |
| `Port 4000 in use` | Change PORT in `.env` or kill process |
| `CORS error` | Frontend URL must match backend config |

---

## 🚀 Deployment Steps

### Replit (Easiest)
1. Import repo from GitHub
2. Create PostgreSQL DB in Replit
3. Set Secrets (same as `.env`)
4. Run: `cd server && npm install && npm run dev`
5. In new terminal: `cd client && npm install && npm run dev`

### Self-Hosted
1. Deploy backend to server (Heroku, Railway, etc.)
2. Deploy frontend to CDN (Vercel, Netlify, etc.)
3. Update API URLs
4. Get SSL certificate
5. Enable HTTPS

---

## 📞 Contact & Support

- **Issues?** Check SETUP_GUIDE.md
- **GitHub**: https://github.com/tricenorman/earnly
- **PayPal Help**: https://developer.paypal.com
- **React Help**: https://react.dev

---

## ✅ Checklist for Going Live

- [ ] Tested all flows in demo mode
- [ ] Changed JWT_SECRET
- [ ] Setup live PayPal account
- [ ] Reviewed all code
- [ ] Tested payments end-to-end
- [ ] Setup monitoring/logging
- [ ] Deployed to HTTPS
- [ ] Created admin user
- [ ] Reviewed legal terms
- [ ] Created support procedures
- [ ] Backup database
- [ ] Monitor for fraud
- [ ] Track all transactions

---

**Ready to launch? Read SETUP_GUIDE.md for detailed instructions.**
