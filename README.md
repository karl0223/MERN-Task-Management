
# MERN Task Management App

A full-stack task management application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). The frontend is powered by **Vite** for fast development and build performance. This app includes user authentication, role-based access control (superadmin, admin, member), organization-based task management, and responsive UI.

## 🔗 Live Demo

You can access the deployed application here: [Task Manager Website](https://mern-task-management-1-c1v5.onrender.com)

## 🚀 Features

- User registration and login
- Role-based access: Superadmin, Org Admin, Member
- Organization creation and join via invite code
- Task creation, editing, assignment, and status tracking
- Real-time task status overview and dashboards
- Responsive UI with Tailwind CSS

## 🛠 Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB Atlas
- **FileUpload** AWS S3
- **Deployment:** Render

## 📦 Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## 🧪 Running Locally

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`  
Backend runs at `http://localhost:8000`

## 🌐 Environment Variables

Create a `.env` file in both `/frontend` and `/backend` directories.

### `.env` (backend)

```
PORT=8000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

### `.env` (frontend)

```
VITE_API_BASE_URL=http://localhost:8000
```

## 🔐 Roles

| Role        | Permissions                                  |
|-------------|----------------------------------------------|
| Superadmin  | View all tasks and users across organizations |
| Org Admin   | Manage tasks and members within their org     |
| Member      | View and update assigned tasks                |

## 📁 Project Structure

```
/frontend    → React + Vite frontend code  
/backend     → Express.js API & MongoDB setup  
```
