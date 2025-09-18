# AI Customer Support – Full Stack

A minimal AI-powered customer support chat app with JWT auth, chat history, and OpenRouter/Hugging Face integration.

## Features

- JWT auth (signup/login)
- Chat with AI
- MongoDB chat history
- Protected routes, token handling
- Dockerized with docker-compose

## Monorepo Structure

- server/ – Node.js + Express + MongoDB
- client/ – React + Vite

## Prerequisites

- Node 20+
- Docker + Docker Compose
- MongoDB Atlas (free)
- OpenRouter or Hugging Face API key

## Environment Setup

Use per-environment files.

server/.env.development (local dev):

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ai-customer-support
JWT_SECRET=dev-change-me
JWT_EXPIRES_IN=7d
OPENROUTER_API_KEY= # optional in dev
AI_MODEL=openai/gpt-4o-mini
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

server/.env.production (deploy):

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/ai-customer-support?retryWrites=true&w=majority
JWT_SECRET=prod-long-random
JWT_EXPIRES_IN=7d
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=openai/gpt-4o-mini
CLIENT_URL=https://your-frontend.example.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

client/.env.development:

```
VITE_API_URL=http://localhost:5000/api
```

client/.env.production:

```
VITE_API_URL=https://your-api.example.com/api
```

## Run with Docker

Build and run both services:

```
docker compose up --build -d
```

- Client: http://localhost:3000
- Server health: http://localhost:5000/api/health

Notes:

- Client is a static Nginx app. It does not proxy /api; always call the API on port 5000.
- Ensure client/.env.production has VITE_API_URL pointing to the server URL you expose.
- To run compose in dev, change server env_file to `./server/.env.development`.

## Local Dev (without Docker)

Server:

```
cd server
npm i
set NODE_ENV=development
npm run dev
```

Client:

```
cd client
npm i
npm run dev
```

## API Endpoints

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/profile
- POST /api/chat (create chat)
- GET /api/chat (history)
- GET /api/chat/:chatId
- POST /api/chat/:chatId/messages
- DELETE /api/chat/:chatId

## Clean Architecture Notes

- controllers/ – request/response mapping
- services/ – domain logic (auth, chat, AI)
- models/ – persistence models
- middleware/ – cross-cutting concerns

## Bonus

- Typing indicator
- Rate limiting + helmet

## Deploy

- Client to Vercel/Netlify (set VITE_API_URL)
- Server to Render/Railway (set env vars)

## Troubleshooting

- Route not found: you likely hit the wrong path. UI is on 3000, API is on 5000 under /api/\*.
- Unauthorized (Access token required): send Authorization: Bearer <JWT> to protected routes.
- AI fallback replies: check OPENROUTER_API_KEY, AI_MODEL, and CLIENT_URL referer domain; restart server.
