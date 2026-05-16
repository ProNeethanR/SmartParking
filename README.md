# Smart Parking System

A full-stack smart parking management system with a **React (TanStack)** frontend and a **Flask + MySQL** backend.

## Project Structure

```
SmartParking/
├── backend/            # Python Flask API server
│   ├── app.py          # Main Flask application with API endpoints
│   ├── setup_db.py     # Database schema creation & seed data
│   └── requirements.txt
├── frontend/           # React + TanStack frontend (Vite)
│   ├── src/            # React components, routes, store
│   ├── package.json
│   ├── vite.config.ts  # Vite config with proxy to Flask backend
│   └── tsconfig.json
└── README.md
```

## Prerequisites

- **Python 3.8+**
- **Node.js 18+** (with npm)
- **MySQL** (running locally with user `root` and no password by default)

## How to Run

### Step 1: Set Up the Database

```bash
cd backend
pip install -r requirements.txt
python setup_db.py
```

This creates the `smart_parking` database with all tables and seed data.

### Step 2: Start the Backend

```bash
cd backend
python app.py
```

The Flask server will start on **http://127.0.0.1:5000**.

### Step 3: Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start (usually on **http://localhost:5173**) and automatically proxy `/api/*` requests to the Flask backend.

### Step 4: Open the App

Visit **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/api/state`            | Get all parking data (sync state)  |
| POST   | `/api/register_and_allot` | Register vehicle & assign slot   |
| POST   | `/api/pay`              | Process a payment                  |
| POST   | `/api/end_session`      | End a parking session              |

## Admin Login

- **Username:** `admin`
- **Password:** `admin123`
