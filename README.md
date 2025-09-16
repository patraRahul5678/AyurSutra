# AyurSutra - Panchakarma Patient Management System

A complete web application for managing Panchakarma patients and therapy scheduling.

## Features

- **Patient Management**: Add, edit, delete patient records
- **Appointment Scheduling**: Schedule therapy sessions with patients
- **Dashboard**: View statistics and recent appointments
- **Therapy Management**: Pre-configured Panchakarma therapies
- **Role-based Authentication**: Separate login pages for patients, therapists, doctors, and admin
- **Patient Registration**: Self-registration for new patients

## Tech Stack

**Backend:**
- Node.js + Express
- SQLite Database
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- Webpack
- Axios for API calls
- Responsive CSS

## Quick Setup

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

## Default Logins

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**Doctor Login:**
- Username: `doctor` 
- Password: `doctor123`

**Therapist Login:**
- Username: `therapist`
- Password: `therapist123`

**Patient Login:**
- Patients can register themselves or use their registered email
- No password required for patients (simplified access)

## Pre-configured Therapies
1. Abhyanga (₹2000) - Full body oil massage
2. Shirodhara (₹2500) - Oil pouring on forehead
3. Panchakarma Detox (₹5000) - Complete detoxification
4. Nasya (₹1500) - Nasal therapy
5. Basti (₹3000) - Medicated enema

## API Endpoints

### Authentication
- POST `/api/login/:role` - Role-based user login
- POST `/api/register/patient` - Patient self-registration

### Patients
- GET `/api/patients` - Get all patients
- POST `/api/patients` - Add new patient
- PUT `/api/patients/:id` - Update patient
- DELETE `/api/patients/:id` - Delete patient

### Appointments
- GET `/api/appointments` - Get all appointments
- POST `/api/appointments` - Schedule appointment
- PUT `/api/appointments/:id` - Update appointment status
- DELETE `/api/appointments/:id` - Cancel appointment

### Therapies
- GET `/api/therapies` - Get all available therapies

## Database Schema

The application uses SQLite with the following tables:
- `users` - System users
- `patients` - Patient information
- `therapies` - Available treatments
- `appointments` - Scheduled sessions