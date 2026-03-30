# Trackly 🚀

> Modern project management for high-performing teams.

Trackly is a full-stack project management application with real-time collaboration, Kanban task boards, team chat, analytics, and role-based access control.

---

## ✨ Features

- **Dashboard** — Organisation-wide overview with metrics, progress bars, and assigned tasks
- **Projects** — Create, manage, and track multiple projects with live progress calculation
- **Kanban Board** — Drag-and-drop task management across To Do → In Progress → Review → Done columns
- **Task Management** — Priority levels, due dates, assignees, status tracking, and file attachments
- **Real-time Chat** — Per-project messaging powered by Socket.IO
- **Team Management** — Invite members, manage roles, and view team activity
- **Analytics** — Weekly performance charts and task distribution breakdowns
- **Notifications** — Real-time push notifications for assignments, status changes, and invites
- **Calendar** — Visual task deadline calendar
- **Admin Panel** — User management and system overview (Admin role only)
- **Dark / Light Mode** — Persisted theme preference per user
- **Avatar Upload** — Profile photo upload and management

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Redux Toolkit | Global state management |
| React Router v6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Socket.IO Client | Real-time communication |
| Recharts | Analytics charts |
| @hello-pangea/dnd | Drag-and-drop Kanban |
| date-fns | Date formatting |
| Framer Motion | Animations |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Socket.IO | WebSocket server |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | File uploads |
| Morgan | HTTP request logging |

---

## 📁 Project Structure

```
trackly/
├── backend/
│   ├── controllers/        # Route handler logic
│   ├── db/                 # MongoDB connection
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route definitions
│   ├── uploads/            # Uploaded user avatars & attachments
│   ├── utils/              # Helpers & middleware
│   ├── index.js            # Server entry point
│   └── .env                # Backend environment variables (not committed)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Page layout wrappers
│   │   ├── pages/          # Route-level page components
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── team/
│   │   │   ├── calendar/
│   │   │   ├── analytics/
│   │   │   ├── notifications/
│   │   │   ├── settings/
│   │   │   ├── admin/
│   │   │   └── utility/
│   │   ├── store/          # Redux store & slices
│   │   │   └── slices/
│   │   └── utils/          # API client, socket helpers
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/trackly.git
cd trackly
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/trackly
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The backend runs at **http://localhost:5001**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend dev server:

```bash
npm run dev
```

The frontend runs at **http://localhost:5173**

> The frontend is pre-configured to proxy `/api/v1` requests to `http://localhost:5001` via `vite.config.js`.

---

### 4. Create an Admin User

After starting both servers, run the admin promotion script from the project root:

```bash
node promoteAdmin.js
```

Follow the prompts to elevate an existing user to the `Admin` role.

---

## 🌐 API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and receive JWT |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/projects` | List all user projects |
| POST | `/api/v1/projects` | Create a new project |
| GET | `/api/v1/projects/:id` | Get project by ID |
| PATCH | `/api/v1/projects/:id` | Update project |
| DELETE | `/api/v1/projects/:id` | Delete project |
| GET | `/api/v1/tasks/project/:id` | Get tasks for a project |
| POST | `/api/v1/tasks` | Create a task |
| PATCH | `/api/v1/tasks/:id/status` | Update task status |
| GET | `/api/v1/notifications` | Get user notifications |
| GET | `/api/v1/messages/:contextId` | Get chat messages |
| POST | `/api/v1/messages` | Send a chat message |

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default: `5001`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens |
| `CLIENT_URL` | Frontend origin for CORS (default: `http://localhost:5173`) |

---

## 📄 License

MIT © 2026 Trackly Inc.
"# Trackly" 
