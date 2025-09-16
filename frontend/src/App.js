import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginSelector from './components/LoginSelector';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientManager from './components/PatientManager';
import AppointmentManager from './components/AppointmentManager';
import PatientDashboard from './components/PatientDashboard';
import TherapistDashboard from './components/TherapistDashboard';
import DoctorDashboard from './components/DoctorDashboard';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setSelectedRole(null); // Reset role selector
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSelectedRole(null);
    setCurrentView('dashboard');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (!user) {
    return (
      <div className="login-page">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        {!selectedRole ? (
          <LoginSelector onSelectRole={setSelectedRole} />
        ) : (
          <Login 
            role={selectedRole} 
            onLogin={login} 
            onBack={() => setSelectedRole(null)} 
          />
        )}
      </div>
    );
  }

  const getBackgroundClass = () => {
    if (!user) return 'login-page';
    switch(user.role) {
      case 'patient': return 'patient-bg';
      case 'doctor': return 'doctor-bg';
      case 'therapist': return 'therapist-bg';
      case 'admin': return 'admin-bg';
      default: return '';
    }
  };

  return (
    <div className={`app ${getBackgroundClass()}`}>
      <div className="header">
        <h1>🕉️ AyurSutra</h1>
        <p>Panchakarma Patient Management System</p>
        <div style={{marginTop: '10px'}}>
          Welcome, {user.username} | <button onClick={logout} className="btn btn-danger">Logout</button>
        </div>
      </div>

      {(user.role === 'admin' || user.role === 'doctor') && (
        <nav className="nav">
          <button 
            className={currentView === 'dashboard' ? 'active' : ''} 
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={currentView === 'patients' ? 'active' : ''} 
            onClick={() => setCurrentView('patients')}
          >
            Patients
          </button>
          <button 
            className={currentView === 'appointments' ? 'active' : ''} 
            onClick={() => setCurrentView('appointments')}
          >
            Appointments
          </button>
          {user.role === 'doctor' && (
            <button 
              className={currentView === 'revenue' ? 'active' : ''} 
              onClick={() => setCurrentView('revenue')}
            >
              My Revenue
            </button>
          )}
        </nav>
      )}

      {user.role === 'patient' && <PatientDashboard />}
      {user.role === 'therapist' && <TherapistDashboard />}
      {user.role === 'doctor' && (
        <>
          {currentView === 'dashboard' && <DoctorDashboard currentView="dashboard" />}
          {currentView === 'patients' && <PatientManager />}
          {currentView === 'appointments' && <AppointmentManager />}
          {currentView === 'revenue' && <DoctorDashboard currentView="revenue" />}
        </>
      )}
      {user.role === 'admin' && (
        <>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'patients' && <PatientManager />}
          {currentView === 'appointments' && <AppointmentManager />}
        </>
      )}
    </div>
  );
}

export default App;