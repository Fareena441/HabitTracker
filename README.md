# Habit Tracker Web Application

A full-stack web application for tracking daily habits, built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### Core Modules
1. **User Registration** - Create an account to start tracking habits
2. **Login Authentication** - Secure login with JWT authentication
3. **User Dashboard** - Central hub for managing all habits and tasks
4. **Habit Creation** - Create custom habits with categories and colors
5. **Daily Habit Check** - Mark habits as complete/incomplete for each day
6. **Streak Tracking** - Track continuous completion streaks for each habit
7. **Daily To-Do List** - Manage daily tasks alongside habits
8. **Progress Analytics** - Visual charts showing weekly progress and statistics

## Tech Stack

- **Frontend**: React, React Router, Axios, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
habit-tracker/
├── backend/
│   ├── middleware/     # Authentication middleware
│   ├── models/         # Mongoose models (User, Habit, Todo)
│   ├── routes/         # API routes
│   ├── .env            # Environment variables
│   ├── package.json
│   └── server.js       # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # Auth context
│   │   ├── pages/      # Page components
│   │   └── services/   # API services
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone and Navigate
```bash
cd HabitTracking
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Environment Variables
The `.env` file in the backend directory already contains the MongoDB connection string.

### 5. Run the Application

**Start Backend Server:**
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```
Server will run on http://localhost:5000

**Start Frontend Development Server:**
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

## Usage

1. **Register** a new account at `/register`
2. **Login** with your credentials at `/login`
3. **Create Habits** from the dashboard
4. **Track Daily Progress** by checking off completed habits
5. **View Analytics** to see your weekly progress
6. **Manage To-Do List** for daily tasks

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/toggle` - Toggle habit completion
- `GET /api/habits/stats/overview` - Get habit statistics

### Todos
- `GET /api/todos` - Get today's todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion

## MongoDB Connection

The application uses MongoDB Atlas with the following connection string:
```
mongodb+srv://user123:user123@cluster01.ibbs2.mongodb.net/habit_tracker?appName=Cluster01
```

## License

This project is created for educational purposes.
