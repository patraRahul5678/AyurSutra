const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'ayursutra_secret_key';
const MONGODB_URI = 'mongodb+srv://rahulvssut12345_db_user:7eQrg7o5E2oAlGrZ@cluster0.lpow2gh.mongodb.net/AyurSutra';

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'therapist' }
});

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  phone: String,
  email: { type: String, unique: true, required: true },
  address: String,
  medical_history: String,
  created_at: { type: Date, default: Date.now }
});

const therapySchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: Number,
  description: String,
  price: Number
});

const appointmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  therapy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapy', required: true },
  therapist_name: String,
  appointment_date: String,
  appointment_time: String,
  status: { type: String, default: 'scheduled' },
  notes: String
});

const prescriptionSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor_name: String,
  therapist_name: String,
  therapy_ids: String,
  prescription_text: String,
  duration_days: Number,
  frequency: String,
  special_instructions: String,
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

const therapistRevenueSchema = new mongoose.Schema({
  therapist_name: String,
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patient_name: String,
  therapy_name: String,
  amount: Number,
  date: String,
  created_at: { type: Date, default: Date.now }
});

const doctorRevenueSchema = new mongoose.Schema({
  doctor_name: String,
  prescription_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  patient_name: String,
  consultation_fee: { type: Number, default: 500 },
  date: String,
  created_at: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Therapy = mongoose.model('Therapy', therapySchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Prescription = mongoose.model('Prescription', prescriptionSchema);
const TherapistRevenue = mongoose.model('TherapistRevenue', therapistRevenueSchema);
const DoctorRevenue = mongoose.model('DoctorRevenue', doctorRevenueSchema);

// Initialize default data
const initializeData = async () => {
  try {
    // Insert default therapies
    const therapyCount = await Therapy.countDocuments();
    if (therapyCount === 0) {
      await Therapy.insertMany([
        { name: 'Abhyanga', duration: 60, description: 'Full body oil massage', price: 2000 },
        { name: 'Shirodhara', duration: 45, description: 'Oil pouring on forehead', price: 2500 },
        { name: 'Panchakarma Detox', duration: 90, description: 'Complete detoxification', price: 5000 },
        { name: 'Nasya', duration: 30, description: 'Nasal therapy', price: 1500 },
        { name: 'Basti', duration: 60, description: 'Medicated enema', price: 3000 }
      ]);
    }

    // Insert default users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const users = [
        { username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
        { username: 'doctor', password: bcrypt.hashSync('doctor123', 10), role: 'doctor' },
        { username: 'therapist', password: bcrypt.hashSync('therapist123', 10), role: 'therapist' },
        { username: 'therapist2', password: bcrypt.hashSync('therapist123', 10), role: 'therapist' },
        { username: 'therapist3', password: bcrypt.hashSync('therapist123', 10), role: 'therapist' }
      ];
      await User.insertMany(users);
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Initialize data after connection
mongoose.connection.once('open', initializeData);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/login/:role', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { role } = req.params;
    
    if (role === 'patient') {
      if (!username) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      const patient = await Patient.findOne({ email: username });
      if (!patient) {
        return res.status(401).json({ error: 'Patient not found. Please register first.' });
      }
      const token = jwt.sign({ id: patient._id, username: patient.email, role: 'patient' }, JWT_SECRET);
      res.json({ token, user: { id: patient._id, username: patient.name, role: 'patient' } });
    } else {
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      
      const user = await User.findOne({ username, role });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/register/patient', async (req, res) => {
  try {
    const { name, email, phone, age } = req.body;
    
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const patient = new Patient({ name, email, phone, age });
    await patient.save();
    res.json({ message: 'Patient registered successfully', id: patient._id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Patient routes
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'patient') {
      const patient = await Patient.findById(req.user.id);
      res.json([patient]);
    } else {
      const patients = await Patient.find().sort({ created_at: -1 });
      res.json(patients);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    const { name, age, phone, email, address, medical_history } = req.body;
    const patient = new Patient({ name, age, phone, email, address, medical_history });
    await patient.save();
    res.json({ id: patient._id, message: 'Patient added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { name, age, phone, email, address, medical_history } = req.body;
    await Patient.findByIdAndUpdate(req.params.id, { name, age, phone, email, address, medical_history });
    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Therapy routes
app.get('/api/therapies', authenticateToken, async (req, res) => {
  try {
    const therapies = await Therapy.find();
    res.json(therapies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Appointment routes
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'patient') {
      filter.patient_id = req.user.id;
    } else if (req.user.role === 'therapist') {
      filter.therapist_name = req.user.username;
    }
    
    const appointments = await Appointment.find(filter)
      .populate('patient_id', 'name')
      .populate('therapy_id', 'name duration price')
      .sort({ appointment_date: 1, appointment_time: 1 });
    
    const formattedAppointments = appointments.map(apt => ({
      ...apt.toObject(),
      patient_name: apt.patient_id?.name,
      therapy_name: apt.therapy_id?.name,
      duration: apt.therapy_id?.duration,
      price: apt.therapy_id?.price
    }));
    
    res.json(formattedAppointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { patient_id, therapy_id, therapist_name, appointment_date, appointment_time, notes } = req.body;
    const appointment = new Appointment({ patient_id, therapy_id, therapist_name, appointment_date, appointment_time, notes });
    await appointment.save();
    res.json({ id: appointment._id, message: 'Appointment scheduled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointmentId = req.params.id;
    
    await Appointment.findByIdAndUpdate(appointmentId, { status, notes });
    
    if (status === 'completed') {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patient_id', 'name')
        .populate('therapy_id', 'name price');
      
      if (appointment) {
        const revenue = new TherapistRevenue({
          therapist_name: appointment.therapist_name,
          appointment_id: appointmentId,
          patient_name: appointment.patient_id.name,
          therapy_name: appointment.therapy_id.name,
          amount: appointment.therapy_id.price,
          date: appointment.appointment_date
        });
        await revenue.save();
      }
    }
    
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Therapist routes
app.get('/api/therapists', authenticateToken, async (req, res) => {
  try {
    const therapists = await User.find({ role: 'therapist' }, 'username');
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prescription routes
app.get('/api/prescriptions', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'patient') {
      filter.patient_id = req.user.id;
    } else if (req.user.role === 'therapist') {
      filter.therapist_name = req.user.username;
    }
    
    const prescriptions = await Prescription.find(filter)
      .populate('patient_id', 'name')
      .sort({ created_at: -1 });
    
    const formattedPrescriptions = prescriptions.map(pres => ({
      ...pres.toObject(),
      patient_name: pres.patient_id?.name
    }));
    
    res.json(formattedPrescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prescriptions', authenticateToken, async (req, res) => {
  try {
    const { patient_id, therapist_name, therapy_ids, prescription_text, duration_days, frequency, special_instructions } = req.body;
    const doctor_name = req.user.username;
    
    const prescription = new Prescription({
      patient_id, doctor_name, therapist_name, therapy_ids, 
      prescription_text, duration_days, frequency, special_instructions
    });
    await prescription.save();
    
    const patient = await Patient.findById(patient_id);
    if (patient) {
      const today = new Date().toISOString().split('T')[0];
      const revenue = new DoctorRevenue({
        doctor_name,
        prescription_id: prescription._id,
        patient_name: patient.name,
        consultation_fee: 500,
        date: today
      });
      await revenue.save();
    }
    
    res.json({ id: prescription._id, message: 'Prescription sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/prescriptions/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await Prescription.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Prescription updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Therapist revenue routes
app.get('/api/therapist-revenue', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'therapist') {
      filter.therapist_name = req.user.username;
    }
    
    const revenue = await TherapistRevenue.find(filter).sort({ created_at: -1 });
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Doctor revenue routes
app.get('/api/doctor-revenue', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'doctor') {
      filter.doctor_name = req.user.username;
    }
    
    const revenue = await DoctorRevenue.find(filter).sort({ created_at: -1 });
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`AyurSutra Backend running on port ${PORT}`);
});