# 📋 Team Task Manager

A full-stack web application for managing team tasks and projects with role-based access control.

## Tech Stack

| Layer     | Technology             |
|-----------|------------------------|
| Frontend  | React, React Router    |
| Backend   | Node.js, Express       |
| Database  | MongoDB (Mongoose)     |
| Auth      | JWT (JSON Web Tokens)  |
| HTTP      | Axios (REST APIs)      |

---

## Folder Structure

```
team-task-manager/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT protect + adminOnly middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js          # POST /api/auth/signup, /login
│   │   ├── projects.js      # GET, POST, DELETE /api/projects
│   │   ├── tasks.js         # GET, POST, PATCH, DELETE /api/tasks
│   │   ├── dashboard.js     # GET /api/dashboard
│   │   └── users.js         # GET /api/users, /me
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── Navbar.css
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js
    │   │   ├── Projects.js
    │   │   └── Tasks.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

---

## API Routes

### Auth
| Method | Endpoint            | Access  | Description       |
|--------|---------------------|---------|-------------------|
| POST   | /api/auth/signup    | Public  | Register user     |
| POST   | /api/auth/login     | Public  | Login user        |

### Users
| Method | Endpoint            | Access  | Description            |
|--------|---------------------|---------|------------------------|
| GET    | /api/users          | Admin   | Get all users          |
| GET    | /api/users/me       | Auth    | Get current user       |

### Projects
| Method | Endpoint            | Access  | Description            |
|--------|---------------------|---------|------------------------|
| GET    | /api/projects       | Auth    | Get all projects       |
| POST   | /api/projects       | Admin   | Create a project       |
| DELETE | /api/projects/:id   | Admin   | Delete a project       |

### Tasks
| Method | Endpoint                 | Access  | Description            |
|--------|--------------------------|---------|------------------------|
| GET    | /api/tasks               | Auth    | Get tasks              |
| POST   | /api/tasks               | Admin   | Create a task          |
| PATCH  | /api/tasks/:id/status    | Auth    | Update task status     |
| DELETE | /api/tasks/:id           | Admin   | Delete a task          |

### Dashboard
| Method | Endpoint            | Access  | Description            |
|--------|---------------------|---------|------------------------|
| GET    | /api/dashboard      | Auth    | Get stats summary      |

---

## User Roles

| Role   | Can Do                                                              |
|--------|---------------------------------------------------------------------|
| Admin  | Create/delete projects, create/delete tasks, view all data         |
| Member | View assigned tasks, update task status, view own stats            |

---

## Running Locally

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone & setup backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev   # Starts on http://localhost:5000
```

### 2. Setup frontend

```bash
cd frontend
npm install
npm start     # Starts on http://localhost:3000
```

> The frontend proxies `/api` requests to `http://localhost:5000` automatically.

---

## Deploying on Railway

### Step 1 — Prepare

1. Push your code to a GitHub repository (backend and frontend as separate folders)
2. Sign up at [railway.app](https://railway.app)

### Step 2 — Deploy Backend

1. Click **New Project** → **Deploy from GitHub repo**
2. Select your repository, set the **Root Directory** to `backend`
3. Railway auto-detects Node.js and runs `npm start`
4. Go to **Variables** and add:
   - `MONGO_URI` → your MongoDB Atlas connection string
   - `JWT_SECRET` → a long random string (e.g. `openssl rand -hex 32`)
   - `PORT` → `5000`
5. Go to **Settings → Networking** → click **Generate Domain**
6. Copy the backend URL (e.g. `https://your-app.up.railway.app`)

### Step 3 — Deploy Frontend

1. Click **New Service** in the same project → **GitHub Repo**
2. Set **Root Directory** to `frontend`
3. Go to **Variables** and add:
   - `REACT_APP_API_URL` → `https://your-backend-url.up.railway.app/api`
4. Railway will run `npm run build` and serve the static files
5. Generate a domain for the frontend too

### Step 4 — MongoDB Atlas (Free)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a DB user and whitelist `0.0.0.0/0` for Railway IPs
4. Copy the connection string and use it as `MONGO_URI`

---

## Sample Test Data

### Admin User
```json
{
  "name": "Alice Admin",
  "email": "alice@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Member Users
```json
{
  "name": "Bob Builder",
  "email": "bob@example.com",
  "password": "password123",
  "role": "member"
}
```
```json
{
  "name": "Carol Coder",
  "email": "carol@example.com",
  "password": "password123",
  "role": "member"
}
```

### Sample Projects
- Website Redesign
- Mobile App Launch
- Q3 Marketing Campaign

### Sample Tasks
| Title                  | Project            | Assigned To | Status      |
|------------------------|--------------------|-------------|-------------|
| Design homepage mockup | Website Redesign   | Bob         | In Progress |
| Write landing copy     | Website Redesign   | Carol       | Pending     |
| Set up CI/CD pipeline  | Mobile App Launch  | Bob         | Done        |
| Create ad creatives    | Q3 Marketing       | Carol       | Pending     |

---

## Environment Variables Reference

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_super_secret_jwt_key
```

### Frontend `.env` (for production)
```
REACT_APP_API_URL=https://your-backend-url.up.railway.app/api
```

---

## License

MIT — free to use and modify.
