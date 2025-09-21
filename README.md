# CSV Upload Application

A full-stack web application for uploading, processing, and managing CSV files with user authentication and data visualization.

## 🚀 Features

- **User Authentication**: Secure login/register system with JWT tokens
- **CSV File Upload**: Drag-and-drop or click-to-upload CSV files
- **Data Processing**: Automatic parsing and validation of CSV data
- **Dashboard**: Real-time statistics and file management
- **User Management**: Admin panel for user management
- **Responsive Design**: Mobile-friendly interface
- **File History**: Track upload history and processing status

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling and validation
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **CSV Parser** - CSV file processing
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 📁 Project Structure

```
csv-upload-app/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── Dockerfile
├── backend/                 # Node.js backend API
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── uploads/            # File upload directory
│   ├── server.js           # Main server file
│   ├── package.json
│   └── Dockerfile
├── database/               # Database scripts
│   ├── init.sql           # Database initialization
│   └── migration_*.sql    # Database migrations
├── docker-compose.yml     # Development environment
├── docker-compose.prod.yml # Production environment
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/csv-upload-app.git
   cd csv-upload-app
   ```

2. **Start the development environment**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Or use the provided script
   ./start.sh  # Linux/Mac
   start.bat   # Windows
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Default Credentials
- **Admin User**: admin@example.com / admin123
- **Database**: csv_upload_db / csv_user / csv_password

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/update-profile` - Update user profile
- `PUT /auth/change-password` - Change password

### File Upload
- `POST /upload` - Upload CSV file
- `GET /upload` - Get upload history
- `GET /upload/stats` - Get upload statistics

## 🐳 Docker Commands

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build
```

## 🗄️ Database

### Schema
- **users** - User accounts and authentication
- **csv_uploads** - File upload records
- **records** - Parsed CSV data

### Migrations
Run database migrations if needed:
```bash
# Windows
run-migration.bat

# Linux/Mac
./run-migration.sh
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

#### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=csv_upload_db
DB_USER=csv_user
DB_PASSWORD=csv_password
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## 🚀 Deployment

### Production Deployment

1. **Update environment variables** for production
2. **Build and deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   # Serve build folder with nginx or similar
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.







