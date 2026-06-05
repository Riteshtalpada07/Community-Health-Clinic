# Community Health Clinic

A full-stack web-based healthcare management platform designed to streamline clinic operations through secure, role-based access for patients, doctors, and administrators. The application digitizes patient onboarding, appointment scheduling, prescription management, and medical record-keeping.

## 🚀 Project Status

**In Development** — This project is currently under active development.

## 🛠 Tech Stack

### Backend
- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **MongoDB** — Database
- **Mongoose** — ODM for MongoDB
- **JWT (jsonwebtoken)** — Authentication & authorization
- **BcryptJS** — Password hashing
- **Express Rate Limit** — API rate limiting
- **CORS** — Cross-origin resource sharing
- **Dotenv** — Environment configuration

### Frontend
- **HTML5** — Markup
- **CSS3** — Styling
- **Vanilla JavaScript** — Client-side logic (no frameworks)

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login for patients, doctors, and admins
- JWT-based session management with token expiry handling
- Role-based access control (RBAC) middleware
- Secure password hashing with bcrypt (10 salt rounds)
- Password strength validation (uppercase, number, special character)

### 📅 Appointment Management
- Book new appointments with doctor selection, date/time, and reason
- View upcoming and past appointments
- Cancel or reschedule appointments
- Track appointment status (`scheduled`, `completed`, `cancelled`, `rescheduled`)
- Doctor-specific and patient-specific appointment views
- Admin-level oversight of all appointments

### 💊 Prescription Management
- Doctors can create, edit, and delete prescriptions
- Prescription history per patient with medication, dosage, and notes
- Search prescriptions by patient name
- Doctor-specific prescription tracking

### 👥 Role-Based Dashboards
- **Patient Portal:** View upcoming appointments, appointment history, and prescription records
- **Doctor Portal:** Manage appointments, write/search prescriptions, view patient list
- **Admin Portal:** User management (create/edit/delete), system-wide appointment and prescription oversight

### 🛡️ Security & Validation
- Server-side and client-side input validation
- XSS prevention via HTML escaping
- Indian phone number validation (10-digit, starts with 6-9)
- Email format validation
- Rate limiting on API endpoints

## 📁 Project Structure

```
Community Health Clinic/
├── backend/
│   ├── models/
│   │   ├── user.js           # User schema (patient, doctor, admin)
│   │   ├── appointment.js    # Appointment schema
│   │   └── prescription.js   # Prescription schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── appointment.js    # Appointment CRUD routes
│   │   └── prescription.js   # Prescription CRUD routes
│   ├── middleware/
│   │   └── auth.js           # JWT auth & role-based access middleware
│   ├── seed/
│   │   └── adminSeed.js      # Default admin user seeding
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Environment variables (not committed)
│   ├── server.js             # Express server entry point
│   └── package.json          # Backend dependencies
├── frontend/
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── patient.html          # Patient dashboard
│   ├── doctor.html           # Doctor dashboard
│   ├── admin.html            # Admin dashboard
│   ├── main.js               # Core frontend logic & utilities
│   ├── config.js             # Frontend configuration
│   ├── styles/
│   │   ├── common.css        # Shared styles
│   │   ├── auth.css          # Login/Register styles
│   │   ├── index.css         # Landing page styles
│   │   ├── patient.css       # Patient dashboard styles
│   │   ├── doctor.css        # Doctor dashboard styles
│   │   └── admin.css         # Admin dashboard styles
│   ├── utils/
│   │   └── auth.js           # Frontend auth utilities
│   └── images/               # Static assets
├── .gitignore
├── README.md
└── package.json (root)
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/users` | Get all users (admin) |
| GET | `/api/auth/users/id/:id` | Get user by ID |
| PUT | `/api/auth/users/:id` | Update user details |
| DELETE | `/api/auth/users/:id` | Delete a user |
| GET | `/api/auth/users/role/:role` | Get users by role |

### Appointments (`/api/appointments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments/book` | Book a new appointment |
| GET | `/api/appointments/doctors` | List all doctors |
| GET | `/api/appointments/doctor/:name` | Appointments for a doctor |
| GET | `/api/appointments/patient/:email` | Appointments for a patient |
| GET | `/api/appointments/all` | All appointments (admin/doctor) |
| PUT | `/api/appointments/update/:id` | Update appointment status |
| DELETE | `/api/appointments/cancel/:id` | Cancel an appointment |

### Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/prescriptions/add` | Create a new prescription |
| GET | `/api/prescriptions/all` | All prescriptions (admin/doctor) |
| GET | `/api/prescriptions/doctor/:name` | Prescriptions by doctor |
| GET | `/api/prescriptions/:patientName` | Prescriptions for a patient |
| PUT | `/api/prescriptions/update/:id` | Update a prescription |
| DELETE | `/api/prescriptions/delete/:id` | Delete a prescription |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Community Health Clinic"
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```

   You can copy `.env.example` as a starting point.

4. **Start the backend server**
   ```bash
   npm start
   ```
   
   The backend will run at `http://localhost:5000`

### Frontend Setup

5. **Open the frontend**
   
   Open `frontend/index.html` in a browser, or serve the frontend directory with any static server.

## 🧪 Testing

```bash
cd backend
npm test
```

## 🔒 Security Highlights

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for stateless authentication
- Role-based route protection
- Input sanitization and XSS prevention
- Rate limiting on API endpoints
- HTTPS-ready CORS configuration

## 📝 License

ISC
