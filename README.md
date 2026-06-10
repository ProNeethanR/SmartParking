# 🚗 Smart Parking Management System

A full-stack **Smart Parking Management System** that enables real-time parking slot allocation, vehicle tracking, and efficient parking operations using a modern web interface.

Built using **React (Vite + TanStack)** for the frontend and **Flask + MySQL** for the backend.

---

## 📌 Features

* 🚘 Vehicle Registration System
* 🅿️ Real-Time Parking Slot Allocation
* 📊 Live Parking Dashboard (Available / Occupied Slots)
* 🔄 Session Management (Entry & Exit Tracking)
* 💳 Payment Handling System
* 📂 Centralized Database (10 Relational Tables)
* 🔐 Admin Panel for Monitoring
* 📷 QR Code-Based Identification *(Optional Enhancement)*

---

## 🧠 System Workflow

```
User → Register Vehicle → Allocate Slot → Start Session → Exit → Payment → Database Update
```

---

## 🏗️ Project Structure

```
SmartParking/
├── backend/            # Flask API server
│   ├── app.py
│   ├── setup_db.py
│   └── requirements.txt
├── frontend/           # React (Vite + TanStack)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## ⚙️ Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Frontend | React, Vite, JavaScript |
| Backend  | Python (Flask)          |
| Database | MySQL                   |
| API      | RESTful APIs            |
| Tools    | VS Code, npm, XAMPP     |

---

## 🛠️ Setup Instructions

### 1️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
pip install flask-cors  # if not installed
python setup_db.py
python app.py
```

Server runs on:
👉 http://127.0.0.1:5000

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
👉 http://localhost:5173

---

## 🌐 API Endpoints

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| GET    | `/api/state`              | Fetch system state             |
| POST   | `/api/register_and_allot` | Register vehicle & assign slot |
| POST   | `/api/end_session`        | End parking session            |
| POST   | `/api/pay`                | Process payment                |

---

## 👨‍💼 Admin Access

* **Username:** `admin`
* **Password:** `admin123`

---

## 🗄️ Database Design

The system uses a **relational database with 10 normalized tables**, including:

* Users
* Vehicles
* Parking Slots
* Parking Sessions
* Payments
* Parking History

Ensures:

* Data integrity
* No double booking
* Efficient querying

---

## 📷 Screenshots (Add Here)

> Add screenshots of:

* Dashboard
* Parking Slots Grid
* Slot Allocation
* Admin Panel

---

## 🚀 Future Enhancements

* QR Code Entry/Exit System
* License Plate Recognition (ANPR)
* Mobile App Integration
* Automated Gate Control

---

## 📄 License

This project is for academic and educational purposes.

---

## 👥 Contributors

* Navaneethan R
* Kazim Raza
* Abhinav Kumar
* Vinay Madival

---

## ⭐ Acknowledgment

This project demonstrates the application of full-stack development concepts in solving real-world parking management challenges.
