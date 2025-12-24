# AKVORA Authentication System

A full-stack application with Clerk authentication and custom AKVORA ID system.

## Features

- **Authentication**: Clerk integration for OAuth (Google, GitHub) and email authentication
- **Custom OTP System**: Email verification with 6-digit OTP
- **AKVORA ID**: Unique ID generation in format `AKVORA:YEAR:NUMBER`
- **User Profiles**: Complete profile management with MongoDB
- **Protected Routes**: React Router with Clerk authentication guards

## Project Structure

```
m/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── server/          # Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm run install-all
```

Or install separately:

```bash
# Root
npm install

# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Environment Variables

#### Server (`server/.env`)

Copy `server/.env.example` to `server/.env` and fill in:

```env
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
MONGODB_URI=mongodb://localhost:27017/akvora
PORT=5000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-random-secret-key-here
```

#### Client (`client/.env`)

Copy `client/.env.example` to `client/.env` and fill in:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_API_URL=http://localhost:5000/api
```

### 3. MongoDB Setup

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service, it should start automatically)
# Or start manually:
mongod
```

### 4. Clerk Setup

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Configure OAuth providers (Google, GitHub) if needed
4. Copy your Publishable Key and Secret Key to `.env` files

### 5. Email Service Setup (Gmail)

1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

### 6. Run the Application

```bash
# Run both client and server
npm run dev

# Or run separately:
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

## API Endpoints

### Authentication
- `POST /api/auth/verify-email` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP code

### Users
- `POST /api/users/create-profile` - Create/update user profile (requires auth)
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `GET /api/users/akvora-id/:clerkId` - Get AKVORA ID (requires auth)

## Technology Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Clerk React SDK
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Clerk SDK Node
- Nodemailer
- Bcryptjs
- JSON Web Token

## Development

The application uses:
- **ES Modules** (type: "module" in package.json)
- **Concurrently** for running both servers
- **Vite** for fast frontend development

## License

ISC





