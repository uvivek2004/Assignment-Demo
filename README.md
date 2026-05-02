# 📋 TaskFlow — Team Task Manager

A full-stack web app for team project management with role-based access control (Admin/Member).

## 🚀 Live Demo
> Add your Railway URL here after deployment

## 🔗 GitHub Repo
> Add your GitHub URL here

---

## ✨ Features

- **Authentication** — Signup/Login with JWT (first user auto-becomes Admin)
- **Role-Based Access Control** — Admin vs Member permissions
- **Project Management** — Create projects, assign team members
- **Task Management** — Create, assign, track tasks with status & priority
- **Dashboard** — Stats, progress bars, recent activity
- **Overdue Detection** — Visual alerts for past-due tasks

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Deployment | Railway |

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with role
│   │   ├── Project.js       # Project schema
│   │   └── Task.js          # Task schema
│   ├── routes/
│   │   ├── auth.js          # /api/auth/register, /api/auth/login
│   │   ├── users.js         # /api/users
│   │   ├── projects.js      # /api/projects (CRUD)
│   │   └── tasks.js         # /api/tasks (CRUD)
│   ├── middleware/
│   │   └── auth.js          # JWT auth + adminOnly guard
│   ├── server.js            # Express entry point
│   ├── package.json
│   ├── railway.toml
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx           # Full React app (auth, dashboard, tasks, projects)
    │   └── main.jsx          # React entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔐 Role-Based Access

| Action | Admin | Member |
|--------|-------|--------|
| Create/edit projects | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| View all tasks | ✅ | Own + assigned only |
| Change user roles | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Edit assigned tasks | ✅ | ✅ |

---

## ⚙️ Local Development

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🌐 REST API Endpoints

### Auth
```
POST /api/auth/register    { name, email, password }
POST /api/auth/login       { email, password }
```

### Users (requires auth)
```
GET  /api/users
PATCH /api/users/:id/role  { role } — admin only
```

### Projects (requires auth)
```
GET    /api/projects
POST   /api/projects        { name, description, members[] } — admin only
PUT    /api/projects/:id    — admin only
DELETE /api/projects/:id    — admin only
```

### Tasks (requires auth)
```
GET    /api/tasks
POST   /api/tasks           { title, description, status, priority, projectId, assignedTo, dueDate }
PUT    /api/tasks/:id
DELETE /api/tasks/:id       — admin only
```

---

## 🚢 Deployment on Railway

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Step 2 — Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) → New Project → GitHub repo
2. Select the `backend/` folder (or add Root Directory as `backend`)
3. Add **MongoDB** plugin (or use MongoDB Atlas — paste URI as env var)
4. Set environment variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = a long random string
5. Deploy — Railway auto-detects Node.js

### Step 3 — Deploy Frontend on Railway
1. New Service → GitHub repo, Root Directory = `frontend`
2. Set environment variable:
   - `VITE_API_URL` = your backend Railway URL (e.g. `https://taskflow-backend.railway.app/api`)
3. Update `frontend/src/App.jsx` line: `const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";`
4. Deploy

---

## 📸 Screenshots
> Add screenshots of your dashboard, task list, and project views here

---

## 👤 Author
> Your name here

## 📄 License
MIT
