import React, { useState } from 'react';
import axios from 'axios';

function Login({ role, onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', age: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const loginData = role === 'patient' ? { username } : { username, password };
      const response = await axios.post(`http://localhost:5000/api/login/${role}`, loginData);
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Invalid credentials';
      setError(errorMessage);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!registerData.name || !registerData.email || !registerData.phone || !registerData.age) {
      setError('All fields are required');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/register/patient', registerData);
      alert('Registration successful! You can now login with your email.');
      setShowRegister(false);
      setRegisterData({ name: '', email: '', phone: '', age: '' });
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
    }
  };

  const getRoleTitle = () => {
    const titles = {
      patient: '👤 Patient Login',
      therapist: '🧘 Therapist Login', 
      doctor: '👨⚕️ Doctor Login',
      admin: '🔧 Admin Login'
    };
    return titles[role];
  };

  const getDefaultCredentials = () => {
    const defaults = {
      patient: 'Use your registered email',
      therapist: 'therapist / therapist123',
      doctor: 'doctor / doctor123', 
      admin: 'admin / admin123'
    };
    return defaults[role];
  };

  if (showRegister && role === 'patient') {
    return (
      <div className="login-form">
        <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#4a7c59'}}>👤 Patient Registration</h2>
        {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name:</label>
            <input 
              type="text" 
              value={registerData.name} 
              onChange={(e) => setRegisterData({...registerData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={registerData.email} 
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input 
              type="text" 
              value={registerData.phone} 
              onChange={(e) => setRegisterData({...registerData, phone: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Age:</label>
            <input 
              type="number" 
              value={registerData.age} 
              onChange={(e) => setRegisterData({...registerData, age: e.target.value})} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-success" style={{width: '100%', marginBottom: '10px'}}>Register</button>
          <button type="button" className="btn btn-primary" style={{width: '100%'}} onClick={() => setShowRegister(false)}>Back to Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-form">
      <button onClick={onBack} style={{marginBottom: '20px', background: 'none', border: 'none', color: '#4a7c59'}}>← Back</button>
      <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#4a7c59'}}>{getRoleTitle()}</h2>
      {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{role === 'patient' ? 'Email:' : 'Username:'}</label>
          <input 
            type={role === 'patient' ? 'email' : 'text'} 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        {role !== 'patient' && (
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{width: '100%', marginBottom: '10px'}}>Login</button>
        {role === 'patient' && (
          <button type="button" className="btn btn-success" style={{width: '100%'}} onClick={() => setShowRegister(true)}>New Patient? Register</button>
        )}
      </form>
      <div style={{marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center'}}>
        {getDefaultCredentials()}
      </div>
    </div>
  );
}

export default Login;