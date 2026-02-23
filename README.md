# 🚀 PixelForge Nexus

A comprehensive project management platform built with the MERN stack (MongoDB, Express.js, React, Node.js). PixelForge Nexus enables teams to create, manage, and track projects with role-based access control, secure authentication, and real-time dashboard analytics.

---

## 🔗 Live Deployment

| Service | URL |
|---------|-----|
| **🌐 Frontend** | [https://pixelforge-silk.vercel.app](https://pixelforge-silk.vercel.app) |
| **⚙️ Backend API** | [https://pixelforge-rqd5.onrender.com](https://pixelforge-rqd5.onrender.com) |

---

## 🌐 Live Demo

PixelForge Nexus is fully deployed and accessible online:

- **Frontend** is hosted on **Vercel** — a global CDN optimized for React applications with automatic HTTPS and instant deployments.
- **Backend API** is hosted on **Render** — a cloud platform providing scalable Node.js hosting with automatic SSL.
- **Database** is hosted on **MongoDB Atlas** — MongoDB's managed cloud database service with automated backups and high availability.

All services communicate securely over HTTPS in production.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Core Functionalities](#core-functionalities)
- [Role-Based Access Control](#role-based-access-control)
- [Security Features](#security-features)
- [Demo Login Credentials](#demo-login-credentials)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)
- [Security Best Practices](#security-best-practices)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## 📖 Project Overview

**PixelForge Nexus** is a full-stack web application designed for efficient project and team management. It provides a centralized platform where administrators, project leads, and developers can collaborate on projects with clearly defined permissions and responsibilities.

### Key Highlights

- **Role-Based Access Control (RBAC)** - Three-tier permission system
- **Secure Authentication** - JWT-based with bcrypt password hashing
- **Project Management** - Full CRUD operations for projects
- **Team Collaboration** - Developer assignment and task tracking
- **Document Management** - File upload functionality for project documents
- **Real-Time Dashboard** - Live statistics and project metrics
- **Responsive Design** - Modern UI that works on all devices

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Frontend (React 18)                   │   │
│  │                   Vite + React Router                    │   │
│  │              Deployed on Vercel (HTTPS)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Backend (Node.js + Express)             │   │
│  │               JWT Auth | Middleware | Routes             │   │
│  │              Deployed on Render (HTTPS)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  MongoDB Atlas (Cloud)                   │   │
│  │                    NoSQL Database                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Components

| Layer | Technology | Deployment |
|-------|------------|------------|
| Frontend | React 18, Vite, React Router, Axios | Vercel |
| Backend | Node.js, Express.js, JWT, Multer | Render |
| Database | MongoDB Atlas, Mongoose | MongoDB Cloud |

---

## ⚙️ Core Functionalities

### User Management
- User registration and authentication
- Profile management and updates
- Role assignment by administrators
- User listing and search capabilities

### Project Management
- Create, read, update, and delete projects
- Assign team members to projects
- Track project status (Active, Completed, On Hold)
- Upload and manage project documents
- View project-specific dashboards

### Dashboard & Analytics
- Real-time project statistics
- User count and role distribution
- Project status breakdown
- Recent activity tracking

### Notifications
- Toast notifications for user actions
- Success/error feedback
- Loading states for async operations

---

## 🔐 Role-Based Access Control

PixelForge Nexus implements a three-tier role system:

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access. Can create/delete users, manage all projects, assign roles, and access all features. |
| **Project Lead** | Can create and manage projects, assign developers to their projects, upload documents, and view team dashboards. |
| **Developer** | Can view assigned projects, upload documents, update task status, and view personal dashboard. |

### Authorization Flow

```
Request → JWT Verification → Role Check → Permission Grant/Deny → Response
```

---

## 🛡️ Security Features

| Feature | Implementation |
|---------|----------------|
| **Authentication** | JWT (JSON Web Tokens) with secure signing |
| **Password Security** | bcrypt hashing with salt rounds |
| **CORS Protection** | Configured allowed origins (localhost, Vercel) |
| **Role Protection** | Middleware-based authorization checks |
| **Security Headers** | Helmet.js for HTTP header security |
| **Rate Limiting** | 100 requests per 15 minutes per IP |
| **Input Validation** | Server-side validation on all inputs |
| **File Upload Security** | File type and size restrictions |
| **Environment Variables** | Sensitive data stored in .env (not committed) |

---

## 👤 Demo Login Credentials

> ⚠️ **IMPORTANT:** These credentials are for **academic submission and testing purposes only**.  
> ⚠️ Do not use these credentials in production environments.

### Admin Account

| Field | Value |
|-------|-------|
| **Email** | `admin@pixelforge.com` |
| **Password** | `Admin123` |

### Project Lead Account

| Field | Value |
|-------|-------|
| **Email** | `paddu@gmail.com` |
| **Password** | `paddu123` |

### Developer Account

| Field | Value |
|-------|-------|
| **Email** | `pavan@gmail.com` |
| **Password** | `pavan123` |

> 📌 **Note:** These demo accounts are seeded via the `seedAdmin.js` script. In production, create new users through the admin dashboard.

---

## 🔧 Environment Variables Required

### Backend (.env)

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_secure_secret

# CORS Configuration
CLIENT_URL=your_frontend_url

# File Upload Configuration
MAX_FILE_SIZE=10485760
```

### Frontend

No environment variables required. API base URL is configured in `src/api/api.js`.

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account (free tier sufficient)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/pixelforge-nexus.git
cd pixelforge-nexus
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret

# Seed the admin user
node seedAdmin.js

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend
npm install

# Start development server
npm run dev
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health Check | http://localhost:5000/health |

---

## 🌐 Deployment

### Backend Deployment (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure environment variables:
   - `MONGO_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Secure random string
   - `CLIENT_URL` - Your Vercel frontend URL
   - `NODE_ENV` - `production`
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Deploy

### Frontend Deployment (Vercel)

1. Install Vercel CLI or use the web dashboard
2. Connect your GitHub repository
3. Update API base URL in `src/api/api.js` to your Render backend URL
4. Deploy with default settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy

### Post-Deployment Checklist

- [ ] Verify MongoDB connection
- [ ] Test CORS configuration
- [ ] Run admin seed script on production
- [ ] Update frontend API URL to production backend
- [ ] Test all user roles
- [ ] Verify file uploads work correctly

---

## 🔒 Security Best Practices

### For Development

| Practice | Status |
|----------|--------|
| `.env` file in `.gitignore` | ✅ Configured |
| `node_modules` ignored | ✅ Configured |
| Sensitive data in environment variables | ✅ Implemented |
| No hardcoded credentials | ✅ Followed |

### For Production

| Practice | Recommendation |
|----------|----------------|
| **HTTPS** | Enabled by default on Render and Vercel |
| **JWT Secret** | Use a strong, randomly generated string (min 32 characters) |
| **Database** | Use MongoDB Atlas with IP whitelist restrictions |
| **CORS** | Restrict to specific production origins only |
| **Rate Limiting** | Already configured (adjust thresholds as needed) |
| **Logging** | Monitor application logs via Render dashboard |
| **Backups** | Enable MongoDB Atlas automated backups |

### Never Commit

- ❌ `.env` files
- ❌ `node_modules/` directory
- ❌ Database credentials
- ❌ API keys or secrets
- ❌ JWT secrets

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |

### Projects

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/projects` | Get all projects | Yes | All |
| GET | `/api/projects/:id` | Get single project | Yes | All |
| POST | `/api/projects` | Create project | Yes | Admin, Lead |
| PUT | `/api/projects/:id` | Update project | Yes | Admin, Lead |
| PATCH | `/api/projects/:id/complete` | Mark as complete | Yes | Admin, Lead |
| DELETE | `/api/projects/:id` | Delete project | Yes | Admin |
| POST | `/api/projects/:id/assign` | Assign developer | Yes | Admin, Lead |
| POST | `/api/projects/:id/documents` | Upload document | Yes | All |

### Users

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/users` | Get all users | Yes | Admin |
| GET | `/api/users/:id` | Get user by ID | Yes | All |
| PUT | `/api/users/:id` | Update user | Yes | Admin |
| DELETE | `/api/users/:id` | Delete user | Yes | Admin |

---

## 📄 License

MIT License

Copyright (c) 2024 PixelForge Nexus

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 📧 Contact

For questions, support, or contributions:

- **GitHub Issues:** [Open an issue](https://github.com/CHANDU-JANIPIREDDY)
- **Email:** cjanipireddy@gmail.com

---

**Built with ❤️ using the MERN Stack**  
**PixelForge Nexus © 2024**
