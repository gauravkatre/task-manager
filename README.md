# TaskFlow – Team Task Manager

A full-stack collaborative task management web application built with React, Node.js, Express, and MongoDB.

---

## Features

- **Authentication** – JWT-based signup/login with bcrypt password hashing
- **Projects** – Create projects, invite members, manage roles (Admin / Member)
- **Tasks** – Full CRUD with title, description, due date, priority, assignee, status
- **Kanban Board** – Visual board with To Do / In Progress / Done columns
- **Dashboard** – Stats: total tasks, by status, per user, overdue tasks
- **Role-Based Access** – Admins manage everything; Members update their own tasks only

---

## Tech Stack

| Layer      | Technology                   |
|------------|------------------------------|
| Frontend   | React 18, React Router v6, Vite |
| Styling    | Custom CSS (no framework)     |
| Backend    | Node.js, Express.js           |
| Database   | MongoDB with Mongoose         |
| Auth       | JWT + bcryptjs                |
| Validation | express-validator             |
| Deployment | Railway                       |

---

## Project Structure

```
task-manager/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/generateToken.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── TaskCard.jsx
    │   │   ├── ProjectCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   ├── ProjectDetails.jsx
    │   │   ├── Tasks.jsx
    │   │   └── NotFound.jsx
    │   ├── services/
    │   │   ├── authService.js
    │   │   ├── projectService.js
    │   │   └── taskService.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI and JWT_SECRET in .env
npm run dev
```

Backend runs on `http://localhost:5000`

### 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## API Reference

### Auth
| Method | Endpoint           | Description       | Access  |
|--------|--------------------|-------------------|---------|
| POST   | /api/auth/signup   | Register user     | Public  |
| POST   | /api/auth/login    | Login user        | Public  |
| GET    | /api/auth/me       | Get current user  | Private |

### Projects
| Method | Endpoint                              | Description           | Access        |
|--------|---------------------------------------|-----------------------|---------------|
| GET    | /api/projects                         | Get user's projects   | Private       |
| POST   | /api/projects                         | Create project        | Private       |
| GET    | /api/projects/:id                     | Get project details   | Member+       |
| PUT    | /api/projects/:id                     | Update project        | Admin only    |
| DELETE | /api/projects/:id                     | Delete project        | Admin only    |
| POST   | /api/projects/:id/members             | Add member            | Admin only    |
| DELETE | /api/projects/:id/members/:userId     | Remove member         | Admin only    |

### Tasks
| Method | Endpoint                              | Description           | Access        |
|--------|---------------------------------------|-----------------------|---------------|
| GET    | /api/projects/:id/tasks               | Get project tasks     | Member+       |
| POST   | /api/projects/:id/tasks               | Create task           | Admin only    |
| GET    | /api/tasks/:taskId                    | Get single task       | Member+       |
| PUT    | /api/tasks/:taskId                    | Update task           | Role-based    |
| DELETE | /api/tasks/:taskId                    | Delete task           | Admin only    |

### Dashboard
| Method | Endpoint         | Description          | Access  |
|--------|------------------|----------------------|---------|
| GET    | /api/dashboard   | Get dashboard stats  | Private |

---

## Deployment on Railway

### Step 1 – Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2 – Deploy Backend
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → choose the `backend` folder (set **Root Directory** to `backend`)
3. Add environment variables:
   ```
   PORT=5000
   MONGO_URI=<your MongoDB Atlas URI>
   JWT_SECRET=<a strong random string>
   NODE_ENV=production
   FRONTEND_URL=<your Railway frontend URL>
   ```
4. Railway auto-detects Node.js and runs `npm start`

### Step 3 – Deploy Frontend
1. New service in same project → Deploy from same repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=<your Railway backend URL>/api
   ```
4. Build command: `npm run build`
5. Start command: `npx serve dist -p $PORT`

### Step 4 – Link them
- Copy the backend Railway URL → paste into frontend's `VITE_API_URL`
- Copy the frontend Railway URL → paste into backend's `FRONTEND_URL`
- Redeploy both services

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=supersecretkey
NODE_ENV=production
FRONTEND_URL=https://your-frontend.railway.app
```

### Frontend `.env`
```
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Role Permissions

| Action                    | Admin | Member       |
|---------------------------|-------|--------------|
| Create/delete tasks       | ✅    | ❌           |
| View all project tasks    | ✅    | ❌           |
| View own assigned tasks   | ✅    | ✅           |
| Update task status        | ✅    | ✅ (own only)|
| Manage project members    | ✅    | ❌           |
| Delete project            | ✅    | ❌           |
