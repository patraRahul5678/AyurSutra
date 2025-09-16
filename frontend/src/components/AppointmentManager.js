import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function AppointmentManager() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '', therapy_id: '', therapist_name: '', appointment_date: '', appointment_time: '', notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, patientsRes, therapiesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/appointments`),
        axios.get(`${API_BASE_URL}/api/patients`),
        axios.get(`${API_BASE_URL}/api/therapies`)
      ]);
      setAppointments(appointmentsRes.data);
      setPatients(patientsRes.data);
      setTherapies(therapiesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/appointments`, formData);
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${id}`, { status, notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id) => {
    if (confirm('Cancel this appointment?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/appointments/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ patient_id: '', therapy_id: '', therapist_name: '', appointment_date: '', appointment_time: '', notes: '' });
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2>Appointment Management</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Schedule Appointment</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Therapy</th>
              <th>Therapist</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(apt => (
              <tr key={apt.id}>
                <td>{apt.patient_name}</td>
                <td>{apt.therapy_name} (₹{apt.price})</td>
                <td>{apt.therapist_name}</td>
                <td>{apt.appointment_date}</td>
                <td>{apt.appointment_time}</td>
                <td className={`status-${apt.status}`}>{apt.status}</td>
                <td>
                  {apt.status === 'scheduled' && (
                    <>
                      <button className="btn btn-success" onClick={() => updateStatus(apt.id, 'completed')}>Complete</button>
                      <button className="btn btn-danger" onClick={() => updateStatus(apt.id, 'cancelled')}>Cancel</button>
                    </>
                  )}
                  <button className="btn btn-danger" onClick={() => deleteAppointment(apt.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Schedule Appointment</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Patient:</label>
                <select 
                  value={formData.patient_id} 
                  onChange={(e) => setFormData({...formData, patient_id: e.target.value})} 
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Therapy:</label>
                <select 
                  value={formData.therapy_id} 
                  onChange={(e) => setFormData({...formData, therapy_id: e.target.value})} 
                  required
                >
                  <option value="">Select Therapy</option>
                  {therapies.map(therapy => (
                    <option key={therapy.id} value={therapy.id}>{therapy.name} - ₹{therapy.price}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Therapist Name:</label>
                <input 
                  type="text" 
                  value={formData.therapist_name} 
                  onChange={(e) => setFormData({...formData, therapist_name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input 
                  type="date" 
                  value={formData.appointment_date} 
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Time:</label>
                <input 
                  type="time" 
                  value={formData.appointment_time} 
                  onChange={(e) => setFormData({...formData, appointment_time: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Notes:</label>
                <textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                />
              </div>
              <button type="submit" className="btn btn-success">Schedule</button>
              <button type="button" className="btn btn-danger" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentManager;