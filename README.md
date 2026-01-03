# Content Planner

## Track Chosen + Why
**Track A — Content Scratchpad + Planning Queue**

I chose this track to build a practical tool that mirrors real-world content management systems like Buffer. 
It helps content creators organize ideas and manage workflow by moving content through stages (Draft → Scheduled → Published), 
making it perfect for learning full-stack development with real-world applications.

## Features Implemented
- [x] User authentication (signup, login, logout)
- [x] Password reset with 6-digit verification code
- [x] Create content ideas with title, description, and platform
- [x] View all content ideas in personalized dashboard
- [x] Move ideas through 3 statuses: Draft → Scheduled → Published
- [x] Delete content ideas
- [x] User-specific data isolation with JWT
- [x] Responsive dark-themed UI
- [x] Form validation and error handling
- [x] Protected API routes

## Tech Stack
**Frontend:**
- React.js
- CSS3 (custom styling)
- Fetch API

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- bcrypt.js for password hashing

## How to Run Locally

### Prerequisites
```bash
# Install Node.js (v14+)
# Install MongoDB locally and setup MongoDB Compass
```

### Backend Setup
```bash
cd backend
npm install cors bcryptjs mongoose jsonwebtoken
# Edit server.js line 15 with your MongoDB connection string
mongoose.connect('mongodb://localhost:27017/contentplannerdb');
node server.js (In a different terminal)
# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm start(another terminal)
# App opens at http://localhost:3000
```

### Quick Start
```bash
# Open http://localhost:3000
# Click "Sign Up"
# Enter name, email, password
# Start creating content ideas!
```

## API Endpoints

### Authentication (Public)
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/forgot-password - Request password reset code
POST   /api/auth/reset-password  - Reset password with code
```

### Ideas (Protected - JWT Required)
```
POST   /api/ideas       - Create new content idea
GET    /api/ideas       - Get all user's ideas
PATCH  /api/ideas/:id   - Update idea status
DELETE /api/ideas/:id   - Delete idea
```

**Authentication Header:**
```
Authorization: Bearer <jwt_token>
```

## Data Model

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique, indexed),
  password: String (required, bcrypt hashed),
  resetToken: String (optional, 6-digit code),
  resetTokenExpiry: Date (optional, expires after 10 minutes),
  created_at: Date (default: now)
}
```

### Idea Schema
```javascript
{
  title: String (required),
  description: String (optional),
  platform: String (optional, e.g., 'Instagram', 'Blog', 'Twitter'),
  status: String (default: 'draft', enum: ['draft', 'scheduled', 'published']),
  userId: ObjectId (required, ref: 'User'),
  created_at: Date (default: now)
}
```

## AI Usage Log

### AI Tools Used
- **Claude (Anthropic)** - Primary development assistant for architecture, debugging, and best practices

### How AI Helped
1. **Authentication**: Implemented JWT tokens and bcrypt password hashing securely
2. **Debugging**: Fixed password validation and error handling in auth flows
3. **Code Quality**: Suggested helper functions like `switchAuthView()` to reduce code duplication
4. **UI/UX**: Recommended dark theme and responsive design patterns

### Example Prompt
```
"I want to add forgot password functionality to my MERN app. 
The user should get a 6-digit code, enter it with a new password, 
and reset their password."
```

### Where I Corrected AI
**AI's Suggestion**: Complex folder structure with separate files for routes, controllers, and models

**My Decision**: Consolidated backend into single `server.js` file for simplicity. This trades modularity for clarity—making it easier to understand and maintain for learning purposes while preserving all functionality.

## Trade-offs + Next Improvements

### Trade-offs Made
- **Single-file backend**: All backend code in `server.js` instead of modular structure. Simpler to understand but less scalable.
- **Console-based password reset**: Reset codes print to terminal instead of email delivery. Easier setup but not production-ready.
- **No edit functionality**: Users can only create/delete ideas, not edit them. Simplified MVP scope.

### Next Improvements
1. **Email verification**: Integrate SendGrid/Nodemailer to send password reset codes via email instead of console logs
2. **Deploy application**: Host backend on Render/Railway and frontend on Vercel/Netlify for live demo
3. **Edit functionality**: Allow users to modify existing content ideas (title, description, platform)
4. **Filter & search**: Add filters by status and search bar to find ideas quickly
5. **Rich text editor**: Integrate editor for better description formatting

## Sample Data

### Seed Script
Create `backend/seed.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/contentplannerdb');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  created_at: Date
});

const ideaSchema = new mongoose.Schema({
  title: String,
  description: String,
  platform: String,
  status: String,
  userId: mongoose.Schema.Types.ObjectId,
  created_at: Date
});

const User = mongoose.model('User', userSchema);
const Idea = mongoose.model('Idea', ideaSchema);

async function seed() {
  await User.deleteMany({});
  await Idea.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: hashedPassword,
    created_at: new Date()
  });

  const ideas = [
    {
      title: '10 Tips for Productivity',
      description: 'Blog post about staying productive while working from home',
      platform: 'Blog',
      status: 'draft',
      userId: user._id,
      created_at: new Date()
    },
    {
      title: 'Monday Motivation Quote',
      description: 'Inspirational quote with sunrise background',
      platform: 'Instagram',
      status: 'scheduled',
      userId: user._id,
      created_at: new Date()
    },
    {
      title: 'Product Launch Announcement',
      description: 'Announcing our new feature release',
      platform: 'Twitter',
      status: 'published',
      userId: user._id,
      created_at: new Date()
    }
  ];

  await Idea.insertMany(ideas);
  console.log('Database seeded!');
  console.log('Login: john@example.com / password123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
```

### Run Seed Script
```bash
cd backend
node seed.js
```

### Sample JSON
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  },
  "ideas": [
    {
      "title": "10 Tips for Productivity",
      "description": "Blog post about staying productive",
      "platform": "Blog",
      "status": "draft"
    },
    {
      "title": "Monday Motivation Quote",
      "description": "Inspirational quote with sunrise",
      "platform": "Instagram",
      "status": "scheduled"
    }
  ]
}
```

---

**👨‍💻 Developer:** Saai Siddarth S | 05SSreeraam@gmail.com | SaaiSiddarth

