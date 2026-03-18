# 💰 PaisaBuddy — Financial Learning Platform

A gamified full-stack web app that teaches personal finance through interactive lessons, quizzes, fraud detection, virtual portfolio trading, and more.

Built by **Bhoomi Sidhpura**

---

## 🚀 Features

- **📚 Financial Learning Hub** — Structured modules on money basics, budgeting, investing, and credit with XP rewards and quizzes
- **📈 Virtual Portfolio** — Buy and sell Indian stocks with virtual money, live price simulation, and P&L tracking
- **🛡 Fraud Defense Academy** — Scenario-based fraud awareness training with leaderboard and streak system
- **🔍 Fraud Detection Scanner** — Paste any suspicious message and get an instant AI-powered scam analysis
- **💰 Smart Budgeting** — Track monthly income, expenses by category, and savings goals with progress bars
- **🎯 Scheme Hunt** — Discover Indian government schemes through a gamified treasure hunt
- **🔄 Swipe Decisions** — Tinder-style financial decision game — approve or reject money choices
- **📄 Agreements & Contracts** — Learn to read rental, employment, loan, and investment agreements
- **💳 Loans & Credit** — Credit score tracker, loan type guide, and EMI calculator
- **🏆 Gamification** — XP, levels, coins, badges, and streaks across all modules

---

## 🛠 Tech Stack

**Frontend**
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt
- dotenv

---

## 📁 Project Structure

```
paisa_buddy/
├── frontend/          # React app (Vite)
│   └── src/
│       ├── pages/     # All page components
│       ├── components/# Sidebar, Layout
│       ├── api/       # Axios instance
│       └── context/   # Auth context
├── backend/           # Express API
│   └── src/
│       ├── modules/   # Feature modules (learning, portfolio, etc.)
│       ├── middleware/ # Auth middleware
│       └── config/    # DB and env config
└── README.md
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/your-username/paisa_buddy.git
cd paisa_buddy
```

### 2. Set up backend environment
```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:
```env
PORT=5179
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
FRONTEND_URL=http://localhost:5173
```

### 3. Install dependencies
```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 4. Seed the database
```bash
cd backend
node src/modules/learning/seed.js
node src/modules/fraudAwareness/seedScenarios.js
node src/modules/swipe/seedCards.js
node src/modules/agreements/seedAgreements.js
node src/modules/scheme-hunt/seedSchemes.js
```

### 5. Start both servers
```bash
# From root folder
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5179`

---

## 🌐 Deployment

- **Frontend** — Vercel
- **Backend** — Render
- **Database** — MongoDB Atlas

---

## 📬 Contact

**Bhoomi Sidhpura**  
[GitHub](https://github.com/bhoomisidhpura) · 
