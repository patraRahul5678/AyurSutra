import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PatientManager() {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '', age: '', phone: '', email: '', address: '', medical_history: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await axios.put(`http://localhost:5000/api/patients/${editingPatient.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/patients', formData);
      }
      fetchPatients();
      closeModal();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const deletePatient = async (id) => {
    if (confirm('Delete this patient?')) {
      try {
        await axios.delete(`http://localhost:5000/api/patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  const openModal = (patient = null) => {
    setEditingPatient(patient);
    setFormData(patient || { name: '', age: '', phone: '', email: '', address: '', medical_history: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPatient(null);
    setFormData({ name: '', age: '', phone: '', email: '', address: '', medical_history: '' });
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2>Patient Management</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>Add Patient</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.phone}</td>
                <td>{patient.email}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => openModal(patient)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => deletePatient(patient.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingPatient ? 'Edit Patient' : 'Add Patient'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input 
                  type="number" 
                  value={formData.age} 
                  onChange={(e) => setFormData({...formData, age: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Medical History:</label>
                <textarea 
                  value={formData.medical_history} 
                  onChange={(e) => setFormData({...formData, medical_history: e.target.value})} 
                />
              </div>
              <button type="submit" className="btn btn-success">Save</button>
              <button type="button" className="btn btn-danger" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientManager;