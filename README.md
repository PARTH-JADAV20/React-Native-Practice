# Login System Setup Guide

## Backend Setup
1. Make sure MongoDB is installed and running on localhost:27017
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Start the server: `npm start`
5. Server will run on http://localhost:5000

## Frontend Setup
1. Navigate to the my-app directory: `cd my-app`
2. Start the Expo app: `npm start`
3. Open the "Ex" tab to access the login/registration form

## API Endpoints
- POST /api/register - Register new user
  - Body: { "name": "string", "email": "string", "password": "string" }
- POST /api/login - Login user
  - Body: { "email": "string", "password": "string" }
- GET /api/users - Get all users (for testing)

## Features
✅ User registration with name, email, password
✅ Password hashing with bcrypt
✅ User login with credential validation
✅ MongoDB integration with Mongoose
✅ React Native frontend with form validation
✅ Toggle between login and registration modes
✅ Error handling and user feedback
✅ Responsive UI with dark theme

## Database Schema
Users are stored in MongoDB with:
- name: String (required)
- email: String (required, unique)
- password: String (hashed, required)
- createdAt: Date (auto-generated)
