# 💰 Earnly - Earn. Complete. Reward.

A complete, production-ready rewards platform where users can complete tasks, earn rewards, and withdraw earnings via PayPal.

[![GitHub](https://img.shields.io/badge/github-tricenorman/earnly-blue)](https://github.com/tricenorman/earnly)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-16+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18+-blue)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/postgresql-12+-blue)](https://www.postgresql.org)

---

## 🎯 Features

### For Users
- ✅ Register & login with secure authentication
- ✅ One-time $1 membership fee via PayPal
- ✅ Browse and complete available tasks
- ✅ Track earnings in real-time wallet
- ✅ Withdraw earnings ($5 minimum) to PayPal
- ✅ View complete transaction history
- ✅ Mobile-friendly responsive design

### For Admins
- ✅ Dashboard with statistics & metrics
- ✅ User management & account status control
- ✅ Create, edit, and manage tasks
- ✅ Review and approve/reject withdrawals
- ✅ Comprehensive audit logging
- ✅ Full admin panel UI

### Technology Highlights
- ✅ Secure JWT authentication
- ✅ PayPal integration (sandbox & live)
- ✅ PostgreSQL with ACID transactions
- ✅ Immutable ledger for financial records
- ✅ Role-based access control
- ✅ Real-time balance updates
- ✅ Mobile-first responsive design
- ✅ Dark theme UI
- ✅ Complete error handling

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm

### Installation

```bash
# 1. Clone repository
git clone https://github.com/tricenorman/earnly.git
cd earnly

# 2. Setup database
createdb earnly
psql earnly < server/schema.sql
psql earnly < server/seed.sql

# 3. Configure backend
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and PayPal credentials
npm install

# 4. Configure frontend
cd ../client
npm install
cd ..

# 5. Start backend (Terminal 1)
cd server && npm run dev

# 6. Start frontend (Terminal 2)
cd client && npm run dev

# 7. Open http://localhost:5173
```

---

## 📖 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions & deployment
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Copy-paste commands & cheat sheet
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & data flow
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

---

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Vite
- **Database**: PostgreSQL
- **Payments**: PayPal API (Sandbox & Live)
- **Auth**: JWT + bcryptjs
- **Styling**: Custom CSS (Dark Theme)

### System Design
```
React Frontend (Port 5173)
        ↓ (HTTP + JWT)
Express API (Port 4000)
        ↓
PostgreSQL Database + PayPal API
```

---

## 📁 Project Structure

```
earnly/
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── server.js      # App setup
│   │   ├── db.js          # Database connection
│   │   ├── middleware/    # Auth & authorization
│   │   ├── routes/        # API endpoints
│   │   └── services/      # Business logic
│   ├── schema.sql         # Database schema
│   ├── seed.sql           # Demo data
│   └── package.json
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── App.jsx        # Main app & routing
│   │   ├── api.js         # API client
│   │   └── styles.css     # Global styles
│   ├── vite.config.js
│   └── package.json
│
├── SETUP_GUIDE.md         # Setup & deployment guide
├── QUICK_REFERENCE.md     # Quick start reference
├── ARCHITECTURE.md        # System architecture
└── PROJECT_SUMMARY.md     # Project overview
```

---

## 🔐 Security

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication (7-day expiry)
- ✅ Role-based access control (admin verification)
- ✅ Database transactions (ACID compliance)
- ✅ Immutable audit logs
- ✅ PayPal server-side verification
- ✅ Input validation on all endpoints
- ✅ Environment secrets management
- ✅ CORS configuration
- ✅ Secure HTTP headers (Helmet.js)

---

## 💾 Database Features

- **ACID Transactions**: All financial operations atomic
- **Immutable Ledger**: Append-only transaction log
- **Proper Indexing**: Optimized for queries
- **Foreign Keys**: Referential integrity
- **Constraints**: Data validation at DB level
- **Audit Logging**: Track all actions

### Key Tables
- `users` - User accounts & membership status
- `tasks` - Available earning tasks
- `task_completions` - Completed tasks tracking
- `ledger` - Immutable transaction log
- `payments` - Membership payments
- `payout_requests` - Withdrawal requests
- `audit_logs` - Action audit trail

---

## 🧪 Demo Mode

By default, the app runs in **demo mode** (perfect for testing):

```env
PAYMENTS_MODE=demo          # Membership instant
PAYOUTS_MODE=demo          # Withdrawals instant
```

Demo features:
- ✅ Instant membership activation
- ✅ Instant payout processing
- ✅ Full feature testing
- ✅ No real money transfers
- ✅ Perfect for development

---

## 🎬 User Journey

1. **Register** → Create account with email/password
2. **Pay Membership** → $1 one-time fee (or instant in demo)
3. **Browse Tasks** → See available earning opportunities
4. **Complete Tasks** → Earn rewards for activities
5. **Track Earnings** → View balance in wallet
6. **Withdraw** → Request payout to PayPal ($5+ minimum)
7. **History** → View all transactions

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/register       Create account
POST   /api/auth/login          Login
POST   /api/auth/logout         Logout
GET    /api/me                  Current user
```

### Membership
```
POST   /api/membership/create   Create payment order
POST   /api/membership/capture  Capture payment
GET    /api/membership/status   Check membership
```

### Tasks
```
GET    /api/tasks               List tasks
POST   /api/tasks/:id/complete  Complete task
```

### Wallet
```
GET    /api/wallet              Balance summary
GET    /api/wallet/transactions Transaction history
```

### Payouts
```
POST   /api/payouts             Request withdrawal
GET    /api/payouts             Payout history
```

### Admin
```
GET    /api/admin/stats         Dashboard stats
GET    /api/admin/users         List users
GET    /api/admin/tasks         List tasks
POST   /api/admin/tasks         Create task
GET    /api/admin/payouts       Pending payouts
POST   /api/admin/payouts/:id/approve   Approve
POST   /api/admin/payouts/:id/reject    Reject
```

---

## 🎨 UI Features

- ✅ Dark theme (modern & battery-friendly)
- ✅ Responsive mobile-first design
- ✅ Bottom navigation on mobile
- ✅ Top navigation on desktop
- ✅ Loading states & spinners
- ✅ Alert notifications
- ✅ Form validation
- ✅ Real-time balance updates
- ✅ Task completion feedback
- ✅ Admin dashboard

---

## 🚀 Deployment

### Replit (Easiest)
1. Import from GitHub
2. Create PostgreSQL database
3. Set environment secrets
4. Run backend & frontend

See [SETUP_GUIDE.md](SETUP_GUIDE.md#-deployment-to-replit) for detailed steps.

### Traditional Hosting
Deploy backend to: Heroku, Railway, DigitalOcean, AWS
Deploy frontend to: Vercel, Netlify, or same server

See [SETUP_GUIDE.md](SETUP_GUIDE.md#production-checklist) for production checklist.

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED 127.0.0.1:5432` | Start PostgreSQL: `brew services start postgresql` |
| `Cannot find module` | Run `npm install` in that directory |
| `Invalid token` | Clear localStorage, login again |
| `PayPal error` | Verify credentials in `.env` |
| `Port in use` | Change PORT in `.env` or kill process |

See [SETUP_GUIDE.md](SETUP_GUIDE.md#-troubleshooting) for more solutions.

---

## 🔧 Configuration

Create `.env` file in `server/` directory:

```env
# Required
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/earnly
JWT_SECRET=your-random-secret-key

# PayPal (get from developer.paypal.com)
PAYPAL_CLIENT_ID=your-sandbox-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
PAYPAL_ENV=sandbox

# Demo Mode (default)
PAYMENTS_MODE=demo
PAYOUTS_MODE=demo

# Optional
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 📱 Test Credentials

After registration:
- **Email**: test@example.com
- **Password**: password123 (min 8 chars)

Demo tasks are pre-loaded:
- Complete your profile: +$0.05
- Daily activity: +$0.10
- Product feedback: +$0.25

---

## ✨ What's Included

✅ Complete full-stack application
✅ Database schema with migrations
✅ PayPal integration (sandbox & live)
✅ React frontend with all pages
✅ Admin dashboard
✅ Security best practices
✅ Comprehensive documentation
✅ Quick start guide
✅ Architecture guide
✅ Demo data for testing
✅ Error handling throughout
✅ Mobile-responsive UI

---

## 🎯 Next Steps

1. **Setup**: Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) (5-15 min)
2. **Test**: Register and complete tasks
3. **Customize**: Update branding & tasks
4. **Deploy**: Follow deployment section
5. **Launch**: Go live with real PayPal

---

## 📚 Learning Resources

- **React**: https://react.dev
- **Express**: https://expressjs.com
- **PostgreSQL**: https://www.postgresql.org/docs
- **PayPal**: https://developer.paypal.com/docs/
- **Vite**: https://vitejs.dev

---

## 📝 License

MIT License - feel free to use for personal or commercial projects

---

## 🤝 Contributing

Found a bug? Have a suggestion? Open an issue on GitHub!

---

## 📞 Support

- **Issues**: GitHub Issues
- **Setup Help**: See SETUP_GUIDE.md
- **Architecture**: See ARCHITECTURE.md
- **Quick Ref**: See QUICK_REFERENCE.md

---

## ⭐ Show Your Support

If you find this project useful, please star it on GitHub!

---

**Built with ❤️ | Earn. Complete. Reward.**

Ready to launch your rewards platform? Start with the [SETUP_GUIDE.md](SETUP_GUIDE.md)! 🚀
