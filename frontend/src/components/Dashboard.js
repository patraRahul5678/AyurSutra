import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedToday: 0,
    revenue: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/patients'),
        axios.get('http://localhost:5000/api/appointments')
      ]);

      const patients = patientsRes.data;
      const appointments = appointmentsRes.data;
      const today = new Date().toISOString().split('T')[0];

      const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
      const completedToday = todayAppointments.filter(apt => apt.status === 'completed');
      const revenue = completedToday.reduce((sum, apt) => sum + apt.price, 0);

      setStats({
        totalPatients: patients.length,
        todayAppointments: todayAppointments.length,
        completedToday: completedToday.length,
        revenue
      });

      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div>
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalPatients}</div>
          <div>Total Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.todayAppointments}</div>
          <div>Today's Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completedToday}</div>
          <div>Completed Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">₹{stats.revenue}</div>
          <div>Today's Revenue</div>
        </div>
      </div>

      <h3>Recent Appointments</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Therapy</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentAppointments.map(apt => (
            <tr key={apt.id}>
              <td>{apt.patient_name}</td>
              <td>{apt.therapy_name}</td>
              <td>{apt.appointment_date}</td>
              <td>{apt.appointment_time}</td>
              <td className={`status-${apt.status}`}>{apt.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;