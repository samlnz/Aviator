# Node SQLite API

A simple REST API using Node.js, Express, and SQLite.

## Deployment on Railway

This project is ready for deployment on [Railway](https://railway.app/).

1.  Fork or push this repository to GitHub.
2.  Create a new project on Railway.
3.  Select "Deploy from GitHub repo".
4.  Railway will automatically detect the Node.js application and deploy it.

**Note:** The SQLite database is stored in a file (`db.sqlite`). On Railway's ephemeral file system, this file will be reset every time the app redeploys. If you need persistent data, consider using a Railway Volume or a managed PostgreSQL/MySQL database.

## API Endpoints

*   `GET /`: Health check.
*   `GET /api/users`: List all users.
*   `GET /api/user/:id`: Get a user by ID.
*   `POST /api/user/`: Create a new user.
    *   Body: `name`, `email`, `password`
*   `PATCH /api/user/:id`: Update a user.
    *   Body: `name`, `email`, `password` (optional)
*   `DELETE /api/user/:id`: Delete a user.
