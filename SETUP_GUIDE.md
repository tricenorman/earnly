# Earnly - Complete Setup & Running Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/tricenorman/earnly.git
cd earnly
```

### Step 2: Setup Database

**Create PostgreSQL database:**
```bash
createdb earnly
```

**Load schema:**
```bash
psql earnly < server/schema.sql
```

**Load demo tasks:**
```bash
psql earnly < server/seed.sql
```

### Step 3: Configure Environment

**Create `.env` file in `server/` directory:**
```bash
cd server
cp .env.example .env
```

**Edit `server/.env` with your settings:**
```env
PORT=4000
NODE_ENV=development

# Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/earnly

# Authentication
JWT_SECRET=your-secret-key-change-this-in-production

# PayPal (Sandbox)
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret

# Demo Mode (set to false for live payments)
PAYMENTS_MODE=demo
PAYOUTS_MODE=demo
```

### Step 4: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
cd ..
```

### Step 5: Start Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

---

## 📱 Demo Credentials

You can register a new account or use the demo:

- **Email**: demo@earnly.com
- **Password**: demo123456 (create via registration)

---

## 🔧 Environment Variables Explained

### Server Configuration

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/earnly` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |
| `PAYPAL_ENV` | PayPal environment | `sandbox` or `live` |
| `PAYPAL_CLIENT_ID` | PayPal app ID | From PayPal Developer |
| `PAYPAL_CLIENT_SECRET` | PayPal app secret | From PayPal Developer |
| `PAYMENTS_MODE` | Membership payment mode | `demo` or `live` |
| `PAYOUTS_MODE` | Withdrawal payout mode | `demo` or `live` |
| `FRONTEND_URL` | Frontend base URL | `http://localhost:5173` |

---

## 🏦 PayPal Sandbox Setup

### Get Sandbox Credentials

1. **Go to**: https://developer.paypal.com
2. **Sign up** or login with your PayPal account
3. **Navigate to**: Apps & Credentials
4. **Create Sandbox App**:
   - App Name: "Earnly"
   - App Type: "Merchant"
5. **Copy**:
   - Client ID → `PAYPAL_CLIENT_ID`
   - Client Secret → `PAYPAL_CLIENT_SECRET`

### Test Sandbox Payments

**Buyer Account**:
- Email: `sb-xxxxx@personal.example.com` (provided by PayPal)
- Password: Sandbox password (provided by PayPal)

**Seller Account**:
- Email: `sb-xxxxx@business.example.com`
- Password: Sandbox password

---

## 📊 Database Schema Overview

### Key Tables

- **users**: User accounts and membership status
- **tasks**: Available earning tasks
- **task_completions**: Track which users completed which tasks
- **ledger**: Immutable transaction log (rewards, payouts, etc.)
- **payments**: Membership payment records
- **payout_requests**: Withdrawal requests
- **audit_logs**: All actions logged for compliance

### Data Integrity

All monetary values stored as **cents** (integers):
```
$1.00 = 100 cents
$0.50 = 50 cents
$0.05 = 5 cents
```

This prevents floating-point precision errors.

---

## 🔐 Security Features

✅ Password hashing (bcryptjs)
✅ JWT authentication
✅ Role-based admin access
✅ Database transactions for financial operations
✅ Audit logging for compliance
✅ PayPal server-side verification
✅ Environment variables (no secrets in Git)
✅ CORS configuration
✅ Rate limiting ready
✅ Secure headers (Helmet.js)

---

## 💡 Demo Mode vs Live Mode

### Demo Mode (Default)
```env
PAYMENTS_MODE=demo
PAYOUTS_MODE=demo
```
- ✅ Register and login work
- ✅ Create membership instantly (no real payment)
- ✅ Complete tasks and earn demo rewards
- ✅ Request payouts (completed immediately)
- ✅ Perfect for testing and development

### Live Mode
```env
PAYMENTS_MODE=live
PAYOUTS_MODE=live
PAYPAL_ENV=live
PAYPAL_CLIENT_ID=live-client-id
PAYPAL_CLIENT_SECRET=live-client-secret
```
- ⚠️ Real money transfers via PayPal
- ⚠️ Requires live PayPal account setup
- ⚠️ Only enable after thorough testing
- ⚠️ Ensure compliance with payment regulations

---

## 🧪 Testing Workflows

### Complete User Journey (Demo Mode)

1. **Register**: Create new account at `/register`
2. **Membership**: Pay $1 (demo - instant)
3. **Complete Tasks**: Earn rewards
4. **Wallet**: View balance
5. **Withdraw**: Request payout (demo - instant)
6. **Admin**: View stats and manage payouts

### Test Data

Demo tasks created by `seed.sql`:
- Complete your profile: $0.05
- Daily activity: $0.10
- Product feedback: $0.25

Add more tasks via Admin dashboard.

---

## 🔍 API Endpoints

### Authentication
```
POST   /api/auth/register         - Create account
POST   /api/auth/login            - Login
POST   /api/auth/logout           - Logout
GET    /api/me                    - Current user info
```

### Membership
```
POST   /api/membership/create     - Create payment order
POST   /api/membership/capture    - Capture payment
GET    /api/membership/status     - Check membership
```

### Tasks
```
GET    /api/tasks                 - List available tasks
POST   /api/tasks/:id/complete    - Complete a task
```

### Wallet
```
GET    /api/wallet                - Wallet summary
GET    /api/wallet/transactions   - Transaction history
```

### Payouts
```
POST   /api/payouts               - Request payout
GET    /api/payouts               - Payout history
```

### Admin
```
GET    /api/admin/stats           - Dashboard stats
GET    /api/admin/users           - List users
GET    /api/admin/tasks           - List tasks
POST   /api/admin/tasks           - Create task
PATCH  /api/admin/tasks/:id       - Update task
GET    /api/admin/payouts         - Pending payouts
POST   /api/admin/payouts/:id/approve  - Approve payout
POST   /api/admin/payouts/:id/reject   - Reject payout
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql     # macOS
sudo systemctl start postgresql    # Linux
pg_ctl -D /usr/local/var/postgres -l logfile start  # macOS alternative
```

### Port Already in Use
```
Error: listen EADDRINUSE :::4000
```
**Solution:**
```bash
# Change PORT in .env or kill process
lsof -i :4000
kill -9 <PID>
```

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution:**
```bash
cd server
npm install
```

### JWT Authentication Failed
```
Error: Invalid or expired token
```
**Solutions:**
- Ensure `JWT_SECRET` is set in `.env`
- Clear browser cookies
- Login again

### PayPal Error
```
Error: Failed to get PayPal access token
```
**Solutions:**
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
- Check `PAYPAL_ENV` is `sandbox` for testing
- Ensure credentials haven't expired

---

## 🚀 Deployment to Replit

### 1. Create Replit Project
- Import from GitHub: `https://github.com/tricenorman/earnly`

### 2. Create PostgreSQL Database
- Replit: Click "Database" → Create PostgreSQL

### 3. Set Secrets
Click **Secrets** (lock icon) and add:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-random-secret-here
PAYPAL_CLIENT_ID=sandbox-id
PAYPAL_CLIENT_SECRET=sandbox-secret
PAYPAL_ENV=sandbox
PAYMENTS_MODE=demo
PAYOUTS_MODE=demo
PORT=4000
NODE_ENV=development
```

### 4. Setup Database
In Replit Shell:
```bash
psql $DATABASE_URL < server/schema.sql
psql $DATABASE_URL < server/seed.sql
```

### 5. Install & Run
```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2
cd client && npm install && npm run dev
```

### 6. Access
- Frontend: Click Replit web preview URL
- Backend: http://localhost:4000

---

## 📈 Production Checklist

Before going live with real money:

- [ ] Change `JWT_SECRET` to random string
- [ ] Setup live PayPal Business account
- [ ] Update `PAYPAL_ENV` to `live`
- [ ] Add live PayPal credentials
- [ ] Set `PAYMENTS_MODE=live` and `PAYOUTS_MODE=live`
- [ ] Review all security settings
- [ ] Test payment flows thoroughly
- [ ] Setup error monitoring
- [ ] Configure email notifications
- [ ] Review compliance requirements
- [ ] Setup backup strategy
- [ ] Deploy to production server (not Replit)
- [ ] Setup HTTPS/SSL certificate
- [ ] Configure firewall rules
- [ ] Setup monitoring & alerts
- [ ] Document user support procedures

---

## 📝 Legal & Compliance

⚠️ **Important**: Before launching:

1. **Consult Legal Counsel**: Ensure compliance with:
   - Consumer protection laws
   - Payment processor terms (PayPal)
   - Tax obligations
   - Anti-fraud requirements

2. **PayPal Compliance**:
   - Review Acceptable Use Policy
   - Get approval for reward payouts
   - Ensure terms align with your offering

3. **User Terms**:
   - Clearly state no guaranteed earnings
   - Explain how rewards are calculated
   - Define eligible activities
   - Outline account suspension policies

4. **Data Protection**:
   - Implement GDPR compliance (if applicable)
   - Secure user data properly
   - Have privacy policy

---

## 🎯 Next Steps

1. ✅ Complete setup above
2. ✅ Test in demo mode
3. ✅ Add your own tasks
4. ✅ Customize branding/colors
5. ✅ Test payment flows
6. ✅ Review security
7. ✅ Deploy to production

---

## 📞 Support & Resources

- **GitHub**: https://github.com/tricenorman/earnly
- **PayPal Docs**: https://developer.paypal.com/docs/
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Built with ❤️ | Earn. Complete. Reward.**

For questions or issues, check the GitHub repository.
