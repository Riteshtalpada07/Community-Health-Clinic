# Community Health Clinic

A web-based healthcare management platform for booking appointments, managing prescriptions, and accessing medical records.

## Project Status

**In Development** - This project is currently under active development.

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **BcryptJS** - Password hashing

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

## Features

- **User Authentication** - Register/Login for patients, doctors, and admins
- **Appointment Management** - Book and manage medical appointments
- **Prescription Management** - View and manage prescriptions
- **Role-based Access** - Separate portals for patients, doctors, and administrators

## Project Structure

```
Community Health Clinic/
├── backend/
│   ├── models/
│   │   ├── user.js
│   │   ├── appointment.js
│   │   └── prescription.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── appointment.js
│   │   └── prescription.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── *.html (index, login, register, patient, doctor, admin)
│   ├── *.css (styles for each page)
│   ├── main.js
│   └── images/
└── README.md
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/auth` | Authentication routes (register, login) |
| `/api/appointments` | Appointment management |
| `/api/prescriptions` | Prescription management |

## Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create `.env` file in backend directory:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open frontend files in a browser

## Development

- Backend runs on `http://localhost:5000`
- Frontend served as static files (open HTML files directly or use a static server)

## License

ISC