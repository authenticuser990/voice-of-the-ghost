# Voice of the Ghost (VotG)

> No one should feel alone when they need to be heard.

## What Is It?

Voice of the Ghost is a free, open-source social platform built for people who feel unheard. It gives users a safe, anonymous space to share their struggles, find emotional support, and connect with others who understand what they are going through.

## The Problem

Modern social media is built for likes, followers, and viral content. If you are dealing with depression, addiction, loneliness, or any mental health challenge, those platforms often make you feel worse. There is no safe space to be honest about how you feel without being judged.

## The Solution

VotG pairs **Help Seekers** who need support with compassionate listeners called **Sages**. Users can post anonymously, vent freely, join moderated communities, and get real-time peer support — all without the pressure of performative social media.

## Features

- **Anonymous posting** — share under a ghost name, no one knows who you are
- **Emotion-tagged posts** — categorize by Mental Health, Self Harm, Loneliness, Joy, and more
- **Emoji reactions & comments** — react with hearts, fire, crying faces, or GIFs
- **Communities** — public, private, or uncensored spaces with admin moderation
- **Real-time chat** — talk inside communities or via direct messages
- **Crisis support** — automatic resource banners for self-harm tagged posts
- **PWA** — installable on any device, works offline
- **Dark/Light mode** — toggle in settings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Vite PWA |
| Backend | Node.js, Express, Prisma ORM |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |

## How to Run

### Prerequisites

- Node.js 18 or higher
- npm

### Steps

```bash
# Clone the repository
git clone https://github.com/your-username/Voice-of-the-Ghost.git
cd Voice-of-the-Ghost

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Set up the database
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..

# Start both servers with one command
npm run dev
```

This runs:
- **Frontend** at http://localhost:5173
- **Backend** at http://localhost:3000

### Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| sam | password123 | Sage |
| alex | password123 | Help Seeker |

## Project Structure

```
Voice of the Ghost/
├── src/                  # React frontend
│   ├── components/       # PostCard, CrisisBanner, ReportModal, etc.
│   ├── pages/            # HomePage, AuthPage, Communities, DMs, Settings
│   ├── contexts/         # AuthContext, SocketContext
│   └── api.js            # Backend API client
├── backend/              # Node.js backend
│   ├── src/routes/       # auth, posts, communities, dms, notifications
│   ├── prisma/           # Database schema (16 models)
│   └── uploads/          # User-uploaded files
└── package.json
```


