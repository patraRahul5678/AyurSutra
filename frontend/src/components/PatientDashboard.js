import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [currentView, setCurrentView] = useState('dashboard');
  const [showBooking, setShowBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [bookingData, setBookingData] = useState({
    therapy_id: '', appointment_date: '', appointment_time: '', notes: ''
  });
  const [profileData, setProfileData] = useState({
    name: '', age: '', phone: '', email: '', address: '', medical_history: ''
  });

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const refreshData = () => {
    fetchData();
  };

  const fetchData = async () => {
    try {
      const [appointmentsRes, therapiesRes, prescriptionsRes, patientRes] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments'),
        axios.get('http://localhost:5000/api/therapies'),
        axios.get('http://localhost:5000/api/prescriptions'),
        axios.get('http://localhost:5000/api/patients')
      ]);
      setAppointments(appointmentsRes.data);
      setTherapies(therapiesRes.data);
      setPrescriptions(prescriptionsRes.data);
      if (patientRes.data.length > 0) {
        setPatientInfo(patientRes.data[0]);
        setProfileData(patientRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const bookAppointment = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post('http://localhost:5000/api/appointments', {
        ...bookingData,
        patient_id: user.id,
        therapist_name: 'Available Therapist'
      });
      fetchData();
      setShowBooking(false);
      setBookingData({ therapy_id: '', appointment_date: '', appointment_time: '', notes: '' });
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/patients/${patientInfo.id}`, profileData);
      setPatientInfo(profileData);
      setShowProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getTherapyNames = (therapyIds) => {
    if (!therapyIds) return 'N/A';
    const ids = therapyIds.split(',').map(id => parseInt(id));
    return therapies.filter(t => ids.includes(t.id)).map(t => t.name).join(', ');
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(a => a.appointment_date >= today && a.status === 'scheduled');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const activePrescriptions = prescriptions.filter(p => p.status === 'accepted');

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2>Patient Dashboard - {patientInfo.name}</h2>
        <div>
          <button className="btn btn-primary" onClick={refreshData}>🔄 Refresh</button>
          <button className="btn btn-primary" onClick={() => setShowProfile(true)}>My Profile</button>
          <button className="btn btn-success" onClick={() => setShowBooking(true)}>Book Appointment</button>
        </div>
      </div>

      <nav className="nav">
        <button 
          className={currentView === 'dashboard' ? 'active' : ''} 
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </button>
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
          Prescriptions ({activePrescriptions.length})
        </button>
        <button 
          className={currentView === 'history' ? 'active' : ''} 
          onClick={() => setCurrentView('history')}
        >
          Treatment History
        </button>
      </nav>

      {currentView === 'dashboard' && (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">{appointments.length}</div>
              <div>Total Appointments</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{upcomingAppointments.length}</div>
              <div>Upcoming</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{completedAppointments.length}</div>
              <div>Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{activePrescriptions.length}</div>
              <div>Active Prescriptions</div>
            </div>
          </div>

          <h3>Upcoming Appointments</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Therapy</th>
                <th>Therapist</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {upcomingAppointments.slice(0, 5).map(apt => (
                <tr key={apt.id}>
                  <td>{apt.appointment_date}</td>
                  <td>{apt.appointment_time}</td>
                  <td>{apt.therapy_name}</td>
                  <td>{apt.therapist_name}</td>
                  <td>₹{apt.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {currentView === 'appointments' && (
        <>
          <h3>All My Appointments</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Therapy</th>
                <th>Therapist</th>
                <th>Status</th>
                <th>Price</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>{apt.appointment_date}</td>
                  <td>{apt.appointment_time}</td>
                  <td>{apt.therapy_name}</td>
                  <td>{apt.therapist_name}</td>
                  <td className={`status-${apt.status}`}>{apt.status}</td>
                  <td>₹{apt.price}</td>
                  <td>{apt.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {currentView === 'prescriptions' && (
        <>
          <h3>My Prescriptions</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Consultation Fee</th>
                <th>Therapist</th>
                <th>Recommended Therapies</th>
                <th>Prescription</th>
                <th>Duration</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(prescription => (
                <tr key={prescription.id}>
                  <td>{prescription.doctor_name}</td>
                  <td>₹500</td>
                  <td>{prescription.therapist_name}</td>
                  <td>{getTherapyNames(prescription.therapy_ids)}</td>
                  <td>{prescription.prescription_text}</td>
                  <td>{prescription.duration_days} days</td>
                  <td>{prescription.frequency}</td>
                  <td className={`status-${prescription.status}`}>{prescription.status}</td>
                  <td>{new Date(prescription.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {currentView === 'history' && (
        <>
          <h3>Treatment History</h3>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">{completedAppointments.length}</div>
              <div>Completed Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">₹{completedAppointments.reduce((sum, apt) => sum + apt.price, 0)}</div>
              <div>Therapist Fees</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">₹{prescriptions.length * 500}</div>
              <div>Consultation Fees</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">₹{completedAppointments.reduce((sum, apt) => sum + apt.price, 0) + (prescriptions.length * 500)}</div>
              <div>Total Spent</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Therapy</th>
                <th>Therapist</th>
                <th>Duration</th>
                <th>Therapist Fee</th>
                <th>Consultation</th>
                <th>Total Cost</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {completedAppointments.map(apt => (
                <tr key={apt.id}>
                  <td>{apt.appointment_date}</td>
                  <td>{apt.therapy_name}</td>
                  <td>{apt.therapist_name}</td>
                  <td>{apt.duration} min</td>
                  <td>₹{apt.price}</td>
                  <td>₹500</td>
                  <td>₹{apt.price + 500}</td>
                  <td>{apt.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showBooking && (
        <div className="modal">
          <div className="modal-content">
            <h3>Book Appointment</h3>
            <form onSubmit={bookAppointment}>
              <div className="form-group">
                <label>Therapy:</label>
                <select 
                  value={bookingData.therapy_id} 
                  onChange={(e) => setBookingData({...bookingData, therapy_id: e.target.value})} 
                  required
                >
                  <option value="">Select Therapy</option>
                  {therapies.map(therapy => (
                    <option key={therapy.id} value={therapy.id}>
                      {therapy.name} ({therapy.duration} min) - Therapist: ₹{therapy.price} + Consultation: ₹500 = Total: ₹{therapy.price + 500}
                    </option>
                  ))}
                </select>
              </div>
              {bookingData.therapy_id && (
                <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '15px'}}>
                  <h4>Cost Breakdown:</h4>
                  {(() => {
                    const selectedTherapy = therapies.find(t => t.id == bookingData.therapy_id);
                    return selectedTherapy ? (
                      <div>
                        <p><strong>Therapy:</strong> {selectedTherapy.name} ({selectedTherapy.duration} min)</p>
                        <p><strong>Therapist Fee:</strong> ₹{selectedTherapy.price}</p>
                        <p><strong>Doctor Consultation:</strong> ₹500</p>
                        <hr style={{margin: '10px 0'}} />
                        <p><strong>Total Cost:</strong> ₹{selectedTherapy.price + 500}</p>
                      </div>
                    ) : null;
                  })()} 
                </div>
              )}
              <div className="form-group">
                <label>Preferred Date:</label>
                <input 
                  type="date" 
                  value={bookingData.appointment_date} 
                  onChange={(e) => setBookingData({...bookingData, appointment_date: e.target.value})} 
                  min={today}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Preferred Time:</label>
                <input 
                  type="time" 
                  value={bookingData.appointment_time} 
                  onChange={(e) => setBookingData({...bookingData, appointment_time: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Notes:</label>
                <textarea 
                  value={bookingData.notes} 
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})} 
                  placeholder="Any specific requirements or health concerns..."
                />
              </div>
              <button type="submit" className="btn btn-success">Book Appointment</button>
              <button type="button" className="btn btn-danger" onClick={() => setShowBooking(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="modal">
          <div className="modal-content">
            <h3>My Profile</h3>
            <form onSubmit={updateProfile}>
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input 
                  type="number" 
                  value={profileData.age} 
                  onChange={(e) => setProfileData({...profileData, age: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input 
                  type="text" 
                  value={profileData.phone} 
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={profileData.email} 
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea 
                  value={profileData.address} 
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Medical History:</label>
                <textarea 
                  value={profileData.medical_history} 
                  onChange={(e) => setProfileData({...profileData, medical_history: e.target.value})} 
                  placeholder="Any allergies, previous treatments, medical conditions..."
                />
              </div>
              <button type="submit" className="btn btn-success">Update Profile</button>
              <button type="button" className="btn btn-danger" onClick={() => setShowProfile(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;