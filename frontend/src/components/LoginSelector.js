import React from 'react';

function LoginSelector({ onSelectRole }) {
  return (
    <div className="login-form">
      <h2 style={{textAlign: 'center', marginBottom: '30px', color: '#4a7c59'}}>🕉️ AyurSutra</h2>
      <p style={{textAlign: 'center', marginBottom: '30px', color: '#666'}}>Select your login type</p>
      
      <div style={{display: 'grid', gap: '15px'}}>
        <button 
          className="btn btn-primary" 
          style={{padding: '15px', fontSize: '16px'}}
          onClick={() => onSelectRole('patient')}
        >
          👤 Patient Login
        </button>
        
        <button 
          className="btn btn-primary" 
          style={{padding: '15px', fontSize: '16px'}}
          onClick={() => onSelectRole('therapist')}
        >
          🧘 Therapist Login
        </button>
        
        <button 
          className="btn btn-primary" 
          style={{padding: '15px', fontSize: '16px'}}
          onClick={() => onSelectRole('doctor')}
        >
          👨‍⚕️ Doctor Login
        </button>
        
        <button 
          className="btn btn-primary" 
          style={{padding: '15px', fontSize: '16px'}}
          onClick={() => onSelectRole('admin')}
        >
          🔧 Admin Login
        </button>
      </div>
    </div>
  );
}

export default LoginSelector;