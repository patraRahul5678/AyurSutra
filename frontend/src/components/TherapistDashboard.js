import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function TherapistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [currentView, setCurrentView] = useState('appointments');
  const [completionNotes, setCompletionNotes] = useState('');
  const [completingAppointment, setCompletingAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const [appointmentsRes, prescriptionsRes, revenueRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/appointments`),
        axios.get(`${API_BASE_URL}/api/prescriptions`),
        axios.get(`${API_BASE_URL}/api/therapist-revenue`)
      ]);
      setAppointments(appointmentsRes.data);
      setPrescriptions(prescriptionsRes.data);
      setRevenue(revenueRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${id}`, { status, notes: '' });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const completeAppointment = async (appointment) => {
    setCompletingAppointment(appointment);
    setCompletionNotes('');
  };

  const submitCompletion = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${completingAppointment.id}`, { 
        status: 'completed', 
        notes: completionNotes 
      });
      setCompletingAppointment(null);
      setCompletionNotes('');
      fetchAppointments();
      alert('Session completed successfully! Revenue has been recorded.');
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const updatePrescriptionStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/prescriptions/${id}`, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating prescription:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
  const upcomingAppointments = appointments.filter(apt => apt.appointment_date > today);

  return (
    <div>
      <h2>Therapist Dashboard</h2>
      
      <nav className="nav">
        <button 
          className={currentView === 'appointments' ? 'active' : ''} 
          onClick={() => setCurrentView('appointments')}
        >
          My Appointments
        </button>
        <button 
          className={currentView === 'prescriptions' ? 'active' : ''} 
          onClick={() => setCurrentView('prescriptions')}
        >
          Prescriptions ({prescriptions.filter(p => p.status === 'pending').length})
        </button>
        <button 
          className={currentView === 'revenue' ? 'active' : ''} 
          onClick={() => setCurrentView('revenue')}
        >
          My Revenue
        </button>
      </nav>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{todayAppointments.length}</div>
          <div>Today's Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{upcomingAppointments.length}</div>
          <div>Upcoming Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{appointments.filter(a => a.status === 'completed').length}</div>
          <div>Completed Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">₹{revenue.reduce((sum, r) => sum + r.amount, 0)}</div>
          <div>My Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{prescriptions.filter(p => p.status === 'pending').length}</div>
          <div>New Prescriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">₹{revenue.length > 0 ? Math.round(revenue.reduce((sum, r) => sum + r.amount, 0) / revenue.length) : 0}</div>
          <div>Avg per Session</div>
        </div>
      </div>

      {currentView === 'appointments' && (
        <>
          <h3>Today's Appointments</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Patient</th>
            <th>Therapy</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todayAppointments.map(apt => (
            <tr key={apt.id}>
              <td>{apt.appointment_time}</td>
              <td>{apt.patient_name}</td>
              <td>{apt.therapy_name}</td>
              <td>{apt.duration} min</td>
              <td className={`status-${apt.status}`}>{apt.status}</td>
              <td>
                {apt.status === 'scheduled' && (
                  <>
                    <button className="btn btn-success" onClick={() => completeAppointment(apt)}>Complete Session</button>
                    <button className="btn btn-danger" onClick={() => updateStatus(apt.id, 'cancelled')}>Cancel</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>All My Appointments</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Patient</th>
            <th>Therapy</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(apt => (
            <tr key={apt.id}>
              <td>{apt.appointment_date}</td>
              <td>{apt.appointment_time}</td>
              <td>{apt.patient_name}</td>
              <td>{apt.therapy_name}</td>
              <td className={`status-${apt.status}`}>{apt.status}</td>
              <td>{apt.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </>
      )}

      {currentView === 'prescriptions' && (
        <>
          <h3>Doctor Prescriptions</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Prescription</th>
                <th>Duration</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(prescription => (
                <tr key={prescription.id}>
                  <td>{prescription.patient_name}</td>
                  <td>{prescription.doctor_name}</td>
                  <td>{prescription.prescription_text}</td>
                  <td>{prescription.duration_days} days</td>
                  <td>{prescription.frequency}</td>
                  <td className={`status-${prescription.status}`}>{prescription.status}</td>
                  <td>
                    {prescription.status === 'pending' && (
                      <>
                        <button className="btn btn-success" onClick={() => updatePrescriptionStatus(prescription.id, 'accepted')}>Accept</button>
                        <button className="btn btn-danger" onClick={() => updatePrescriptionStatus(prescription.id, 'rejected')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {currentView === 'revenue' && (
        <>
          <h3>My Revenue History</h3>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">₹{revenue.reduce((sum, r) => sum + r.amount, 0)}</div>
              <div>Total Earned</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{revenue.length}</div>
              <div>Completed Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">₹{revenue.length > 0 ? Math.round(revenue.reduce((sum, r) => sum + r.amount, 0) / revenue.length) : 0}</div>
              <div>Average per Session</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Therapy</th>
                <th>Amount</th>
                <th>Completed On</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map(rev => (
                <tr key={rev.id}>
                  <td>{rev.date}</td>
                  <td>{rev.patient_name}</td>
                  <td>{rev.therapy_name}</td>
                  <td>₹{rev.amount}</td>
                  <td>{new Date(rev.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {completingAppointment && (
        <div className="modal">
          <div className="modal-content">
            <h3>Complete Session</h3>
            <p><strong>Patient:</strong> {completingAppointment.patient_name}</p>
            <p><strong>Therapy:</strong> {completingAppointment.therapy_name}</p>
            <p><strong>Duration:</strong> {completingAppointment.duration} minutes</p>
            <p><strong>Revenue:</strong> ₹{completingAppointment.price}</p>
            
            <div className="form-group">
              <label>Session Notes:</label>
              <textarea 
                value={completionNotes} 
                onChange={(e) => setCompletionNotes(e.target.value)} 
                placeholder="Treatment notes, patient response, recommendations..."
                rows="4"
                required
              />
            </div>
            
            <button className="btn btn-success" onClick={submitCompletion}>Complete & Record Revenue</button>
            <button className="btn btn-danger" onClick={() => setCompletingAppointment(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TherapistDashboard;