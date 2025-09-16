import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function DoctorDashboard({ currentView = 'dashboard' }) {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const [therapists, setTherapists] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [prescriptionData, setPrescriptionData] = useState({
    patient_id: '', therapist_name: '', therapy_ids: [], prescription_text: '',
    duration_days: '', frequency: '', special_instructions: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, appointmentsRes, therapistsRes, therapiesRes, revenueRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/patients`),
        axios.get(`${API_BASE_URL}/api/appointments`),
        axios.get(`${API_BASE_URL}/api/therapists`),
        axios.get(`${API_BASE_URL}/api/therapies`),
        axios.get(`${API_BASE_URL}/api/doctor-revenue`)
      ]);
      setPatients(patientsRes.data);
      setAppointments(appointmentsRes.data);
      setTherapists(therapistsRes.data);
      setTherapies(therapiesRes.data);
      setRevenue(revenueRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getPatientAppointments = (patientId) => {
    return appointments.filter(apt => apt.patient_id === patientId);
  };

  const sendPrescription = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/prescriptions`, {
        ...prescriptionData,
        therapy_ids: prescriptionData.therapy_ids.join(',')
      });
      alert('Prescription sent to therapist successfully!');
      setShowPrescription(false);
      setPrescriptionData({
        patient_id: '', therapist_name: '', therapy_ids: [], prescription_text: '',
        duration_days: '', frequency: '', special_instructions: ''
      });
    } catch (error) {
      console.error('Error sending prescription:', error);
    }
  };

  const openPrescription = (patient) => {
    setPrescriptionData({ ...prescriptionData, patient_id: patient.id });
    setShowPrescription(true);
  };

  const getPatientStats = () => {
    const totalRevenue = appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + apt.price, 0);
    
    return {
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      completedSessions: appointments.filter(apt => apt.status === 'completed').length,
      totalRevenue
    };
  };

  const stats = getPatientStats();

  if (currentView === 'revenue') {
    return (
      <div>
        <h2>My Consultation Revenue</h2>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">₹{revenue.reduce((sum, r) => sum + r.consultation_fee, 0)}</div>
            <div>Total Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{revenue.length}</div>
            <div>Consultations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{revenue.length > 0 ? Math.round(revenue.reduce((sum, r) => sum + r.consultation_fee, 0) / revenue.length) : 0}</div>
            <div>Average per Consultation</div>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Consultation Fee</th>
                <th>Prescribed On</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map(rev => (
                <tr key={rev.id}>
                  <td>{rev.date}</td>
                  <td>{rev.patient_name}</td>
                  <td>₹{rev.consultation_fee}</td>
                  <td>{new Date(rev.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalPatients}</div>
          <div>Total Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalAppointments}</div>
          <div>Total Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completedSessions}</div>
          <div>Completed Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">₹{revenue.reduce((sum, r) => sum + r.consultation_fee, 0)}</div>
          <div>My Consultation Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{revenue.length}</div>
          <div>Total Consultations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">₹{stats.totalRevenue + revenue.reduce((sum, r) => sum + r.consultation_fee, 0)}</div>
          <div>Combined Revenue</div>
        </div>
      </div>

      <h3>Patient Records</h3>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Sessions</th>
              <th>Last Visit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => {
              const patientAppointments = getPatientAppointments(patient.id);
              const lastVisit = patientAppointments
                .filter(apt => apt.status === 'completed')
                .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))[0];
              
              return (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.email}</td>
                  <td>{patientAppointments.length}</td>
                  <td>{lastVisit ? lastVisit.appointment_date : 'Never'}</td>
                  <td>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setSelectedPatient(patient)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn btn-success" 
                      onClick={() => openPrescription(patient)}
                    >
                      Prescribe
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedPatient && (
        <div className="modal">
          <div className="modal-content">
            <h3>Patient Details: {selectedPatient.name}</h3>
            <div style={{marginBottom: '20px'}}>
              <p><strong>Age:</strong> {selectedPatient.age}</p>
              <p><strong>Phone:</strong> {selectedPatient.phone}</p>
              <p><strong>Email:</strong> {selectedPatient.email}</p>
              <p><strong>Address:</strong> {selectedPatient.address}</p>
              <p><strong>Medical History:</strong> {selectedPatient.medical_history}</p>
            </div>
            
            <h4>Appointment History</h4>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Therapy</th>
                    <th>Therapist</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {getPatientAppointments(selectedPatient.id).map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.appointment_date}</td>
                      <td>{apt.therapy_name}</td>
                      <td>{apt.therapist_name}</td>
                      <td className={`status-${apt.status}`}>{apt.status}</td>
                      <td>{apt.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button 
              className="btn btn-danger" 
              onClick={() => setSelectedPatient(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPrescription && (
        <div className="modal">
          <div className="modal-content">
            <h3>Send Prescription</h3>
            <form onSubmit={sendPrescription}>
              <div className="form-group">
                <label>Patient:</label>
                <select value={prescriptionData.patient_id} onChange={(e) => setPrescriptionData({...prescriptionData, patient_id: e.target.value})} required>
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Assign to Therapist:</label>
                <select value={prescriptionData.therapist_name} onChange={(e) => setPrescriptionData({...prescriptionData, therapist_name: e.target.value})} required>
                  <option value="">Select Therapist</option>
                  {therapists.map(therapist => (
                    <option key={therapist.username} value={therapist.username}>{therapist.username}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Recommended Therapies:</label>
                <div style={{maxHeight: '100px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px'}}>
                  {therapies.map(therapy => (
                    <label key={therapy.id} style={{display: 'block', marginBottom: '5px'}}>
                      <input 
                        type="checkbox" 
                        checked={prescriptionData.therapy_ids.includes(therapy.id)}
                        onChange={(e) => {
                          const ids = prescriptionData.therapy_ids;
                          if (e.target.checked) {
                            setPrescriptionData({...prescriptionData, therapy_ids: [...ids, therapy.id]});
                          } else {
                            setPrescriptionData({...prescriptionData, therapy_ids: ids.filter(id => id !== therapy.id)});
                          }
                        }}
                      /> {therapy.name} (₹{therapy.price})
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Prescription Details:</label>
                <textarea 
                  value={prescriptionData.prescription_text} 
                  onChange={(e) => setPrescriptionData({...prescriptionData, prescription_text: e.target.value})} 
                  placeholder="Detailed prescription and treatment plan..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (days):</label>
                <input 
                  type="number" 
                  value={prescriptionData.duration_days} 
                  onChange={(e) => setPrescriptionData({...prescriptionData, duration_days: e.target.value})} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Frequency:</label>
                <select value={prescriptionData.frequency} onChange={(e) => setPrescriptionData({...prescriptionData, frequency: e.target.value})} required>
                  <option value="">Select Frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Alternate Days">Alternate Days</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As Needed">As Needed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Special Instructions:</label>
                <textarea 
                  value={prescriptionData.special_instructions} 
                  onChange={(e) => setPrescriptionData({...prescriptionData, special_instructions: e.target.value})} 
                  placeholder="Any special care instructions..."
                />
              </div>
              <button type="submit" className="btn btn-success">Send Prescription</button>
              <button type="button" className="btn btn-danger" onClick={() => setShowPrescription(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;