# Aviator Game Deployment

This project contains a Node.js backend and a React (Vite) frontend.

## Deployment on Railway

1. Connect your GitHub repository to Railway.
2. Railway will use the `Procfile` to build the frontend (`npm run build`) and start the backend (`npm start`).
3. The backend serves the built frontend from the `dist` directory.

## Features

- **Express Backend**: Handles API and Socket.io.
- **SQLite Database**: Stores user data (stored in `db.sqlite`).
- **React Frontend**: Built with Vite, Tailwind CSS, and Unity WebGL.
- **Socket.io**: Real-time game updates.

## Local Development

1. Install dependencies: `npm install`
2. Run backend: `npm start`
3. Run frontend: `npm run dev`
