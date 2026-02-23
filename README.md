# 🚀 PixelForge Nexus

A comprehensive project management platform built with the MERN stack (MongoDB, Express.js, React, Node.js). PixelForge Nexus enables teams to create, manage, and track projects with role-based access control.

## ✨ Features

- **Role-Based Access Control** - Admin, Project Lead, and Developer roles
- **Project Management** - Create, edit, and track projects
- **Team Assignment** - Assign developers to projects
- **Document Upload** - Upload and manage project documents
- **Dashboard Statistics** - Real-time project and user metrics
- **Responsive UI** - Modern, clean interface with loading states
- **Toast Notifications** - Real-time feedback for user actions

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- React Router DOM
- Axios for API calls
- CSS3 with custom components

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Helmet for security
- CORS enabled

## 📁 Project Structure

```
PixelForge-Nexus/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, upload, error handling
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded documents (gitignored)
│   ├── .env             # Environment variables (gitignored)
│   ├── server.js        # Entry point
│   └── seedAdmin.js     # Admin user seeding script
├── frontend/
│   ├── src/
│   │   ├── api/         # API configuration
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Toast)
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main app component
│   ├── index.html
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/pixelforge-nexus.git
cd pixelforge-nexus
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Then seed the admin user
node seedAdmin.js

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/pixelforge-nexus

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CORS_ORIGIN=http://localhost:5173

# Uploads
MAX_FILE_SIZE=10485760
```

### Frontend

No environment variables required for local development. For production builds, update `vite.config.js` or use `.env` files.

## 👤 Demo Credentials

After running `node backend/seedAdmin.js`:

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@pixelforge.com   | admin123     |

Create additional users through the admin dashboard.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset

### Projects
- `GET /api/projects` - Get all projects (role-based)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Admin/ProjectLead)
- `PUT /api/projects/:id` - Update project
- `PATCH /api/projects/:id/complete` - Mark as complete
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/assign` - Assign developer
- `POST /api/projects/:id/documents` - Upload document

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🚢 Deployment

### Backend (Heroku/Railway/Render)

1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas connection string is configured
3. Update CORS_ORIGIN to your frontend URL
4. Deploy

### Frontend (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Update API base URL in `src/api/api.js` to production backend URL

### Production Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use MongoDB Atlas for production database
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Set up log monitoring
- [ ] Enable rate limiting (already configured)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Helmet.js security headers
- CORS configuration
- Rate limiting (100 requests/15min)
- Input validation
- File upload restrictions

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, open an issue on GitHub.

---

**Built with ❤️ using the MERN Stack**
