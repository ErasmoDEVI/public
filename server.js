const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/sas_barbearia';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose models
const Schema = mongoose.Schema;
const BarberSchema = new Schema({ name: String, phone: String, pin: String });
const ServiceSchema = new Schema({ name: String, price: Number });
const BookingSchema = new Schema({
  barberId: { type: Schema.Types.ObjectId, ref: 'Barber' },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  name: String, phone: String, date: String, time: String, createdAt: Date
});
const AdminSchema = new Schema({ username: String, passwordHash: String });

const Barber = mongoose.model('Barber', BarberSchema);
const Service = mongoose.model('Service', ServiceSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const Admin = mongoose.model('Admin', AdminSchema);

// Connect to MongoDB
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

// Public API
app.get('/api/barbers', async (req,res) => {
  const barbers = await Barber.find().lean();
  res.json(barbers);
});
app.get('/api/services', async (req,res) => {
  const services = await Service.find().lean();
  res.json(services);
});
app.get('/api/available', async (req,res) => {
  const { barberId, date } = req.query;
  if(!barberId || !date) return res.status(400).json({ error: 'barberId and date required' });
  // generate slots 09:00-18:00
  const allSlots = [];
  for(let h=9; h<18; h++){
    allSlots.push((h<10?'0'+h:h)+':00');
    allSlots.push((h<10?'0'+h:h)+':30');
  }
  // fetch bookings
  const bookings = await Booking.find({ barberId, date }).lean();
  const taken = bookings.map(b => b.time);
  const available = allSlots.filter(s => !taken.includes(s));
  res.json({ date, barberId, available });
});

app.post('/api/book', async (req,res) => {
  const { name, phone, barberId, serviceId, date, time } = req.body;
  if(!name || !phone || !barberId || !serviceId || !date || !time) return res.status(400).json({ error: 'missing fields' });
  const booking = new Booking({ name, phone, barberId, serviceId, date, time, createdAt: new Date() });
  await booking.save();
  res.json({ success: true, booking });
});

// Auth
app.post('/api/auth/login', async (req,res) => {
  const { username, password } = req.body;
  // simple: admin credentials stored in env (for starter) or in Admin collection
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
  if(username === ADMIN_USER && password === ADMIN_PASS){
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'No token' });
  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({ error: 'Bad format' });
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch(err){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/admin/bookings', authMiddleware, async (req,res) => {
  const bookings = await Booking.find().populate('barberId').populate('serviceId').lean();
  res.json({ bookings });
});

app.post('/api/admin/cancel', authMiddleware, async (req,res) => {
  const { id } = req.body;
  await Booking.deleteOne({ _id: id });
  res.json({ success: true });
});

// Fallback to index
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname,'public','index.html'));
});

app.listen(PORT, ()=> console.log('Server running on port', PORT));
