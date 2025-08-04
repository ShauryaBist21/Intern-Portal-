# 🚀 Intern Portal - Full Stack Dashboard

A comprehensive intern portal with modern UI, referral system, rewards, and leaderboards. Built with React, TypeScript, Node.js, Express, and MongoDB.

## ✨ Features

### 🔐 Authentication
- Secure login/signup with JWT tokens
- Password hashing with bcrypt
- Protected routes and middleware
- Session management

### 📊 Dashboard
- Real-time donation tracking
- Referral code management
- Progress visualization
- Reward system with badges
- Shareable referral links

### 🏆 Leaderboard
- Top donors ranking
- Top referrers ranking
- Overall leaderboard with scoring
- Pagination support
- Real-time statistics

### 👤 Profile Management
- User profile editing
- Referral history tracking
- Reward achievements
- Account statistics

### 🎯 Referral System
- Unique referral codes
- Referral validation
- Referral tracking
- Shareable links

### 🏅 Rewards System
- Bronze, Silver, Gold, Platinum, Diamond badges
- Progress tracking
- Automatic reward unlocking
- Achievement notifications

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Framer Motion** for animations
- **Recharts** for data visualization

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for validation
- **CORS** for cross-origin requests
- **Helmet** for security headers

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intern-portal
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - API Documentation: http://localhost:5000/api/health

## 📁 Project Structure

```
intern-portal/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # Utilities and API
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # App entry point
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── server.js           # Express server
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/intern-portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS and referral links)
FRONTEND_URL=http://localhost:3000
```

### MongoDB Setup

1. **Local MongoDB**
   ```bash
   # Install MongoDB locally
   # Start MongoDB service
   mongod
   ```

2. **MongoDB Atlas (Cloud)**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Update `MONGODB_URI` in `.env`

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/validate-referral` - Validate referral code

### Dashboard Endpoints

- `GET /api/dashboard/profile` - Get user profile
- `POST /api/dashboard/update-donations` - Update donations
- `GET /api/dashboard/referrals` - Get user referrals
- `GET /api/dashboard/rewards` - Get user rewards
- `POST /api/dashboard/share-referral` - Generate share link

### Leaderboard Endpoints

- `GET /api/leaderboard/top-donors` - Get top donors
- `GET /api/leaderboard/top-referrers` - Get top referrers
- `GET /api/leaderboard/overall` - Get overall leaders
- `GET /api/leaderboard/stats` - Get platform statistics

## 🎮 Demo Credentials

For testing purposes, you can use these demo credentials:

- **Email:** demo@internportal.com
- **Password:** password123

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Backend Deployment (Render/Railway)

1. **Prepare for deployment**
   ```bash
   cd backend
   npm install
   ```

2. **Environment variables**
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Set `FRONTEND_URL` to your frontend domain

3. **Deploy to Render**
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`

4. **Deploy to Railway**
   - Connect your GitHub repository
   - Add environment variables
   - Deploy automatically

### Docker Deployment

1. **Build and run with Docker**
   ```bash
   docker-compose up --build
   ```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- Rate limiting (can be added)

## 🎨 UI/UX Features

- Responsive design
- Dark/light theme support
- Smooth animations
- Loading states
- Error handling
- Toast notifications
- Modern card-based layout

## 📈 Performance Optimizations

- Code splitting with React.lazy()
- Image optimization
- Bundle size optimization
- Database indexing
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the database
- Vercel/Netlify for hosting
- All open-source contributors

## 📞 Support

If you have any questions or need help:

1. Check the documentation
2. Search existing issues
3. Create a new issue with details
4. Contact the maintainers

---

**Made with ❤️ for the intern community** 