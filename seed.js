const mongoose = require('mongoose');
require('dotenv').config();
const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/sas_barbearia';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

const Barber = mongoose.model('Barber', new mongoose.Schema({ name:String, phone:String, pin:String }));
const Service = mongoose.model('Service', new mongoose.Schema({ name:String, price:Number }));

async function seed(){
  await Barber.deleteMany({});
  await Service.deleteMany({});
  const b = await Barber.create({ name: 'João - Master', phone: '+5538999069064', pin: '1234' });
  await Service.create([{ name: 'Degrade', price: 30 }, { name: 'Barba', price: 15 }, { name: 'Social', price:25 }, { name: 'Combo', price:50 }]);
  console.log('Seed done. Barber id:', b._id.toString());
  process.exit(0);
}
seed().catch(err=>{ console.error(err); process.exit(1); });
