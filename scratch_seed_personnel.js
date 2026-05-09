const mysql = require('mysql2/promise');

const ranks = [
  'Jenderal', 'Letnan Jenderal', 'Mayor Jenderal', 'Brigadir Jenderal',
  'Kolonel', 'Letkol', 'Mayor', 'Kapten', 'Lettu', 'Letda',
  'Peltu', 'Pelda', 'Serma', 'Serka', 'Sertu', 'Serda',
  'Kopka', 'Koptu', 'Kopda', 'Praka', 'Pratu', 'Prada'
];

const specializations = [
  'Infantry', 'Sniper', 'Demolition', 'Medic', 'Communications', 'Intelligence', 'Logistics', 'Paratrooper', 'CQB'
];

const statuses = ['ACTIVE', 'ON_MISSION', 'ON_LEAVE', 'TRAINING'];

const firstNames = ['Agus', 'Budi', 'Cahyo', 'Dedi', 'Eko', 'Fajar', 'Gatot', 'Hadi', 'Iwan', 'Joko', 'Kurniawan', 'Lukman', 'Maman', 'Nur', 'Oka', 'Putra', 'Qori', 'Rahmat', 'Satria', 'Teguh', 'Umar', 'Vicky', 'Wira', 'Yoga', 'Zainal'];
const lastNames = ['Setiawan', 'Santoso', 'Pratama', 'Saputra', 'Wijaya', 'Kusuma', 'Hidayat', 'Nugroho', 'Prasetyo', 'Lestari', 'Siregar', 'Simanjuntak', 'Hutapea', 'Sihombing', 'Tamba', 'Panjaitan', 'Sitorus'];

function generateRandomPerson() {
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  const name = firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)];
  // Generate random NRP (usually 10-14 digits)
  const nrp = '11' + Math.floor(10000000 + Math.random() * 90000000);
  const specialization = specializations[Math.floor(Math.random() * specializations.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const joined_date = new Date(Date.now() - Math.floor(Math.random() * 10 * 365 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const photo_url = `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`;
  
  // 50% chance to be assigned to a unit, but unit_id will be random from 1-11
  const unit_id = Math.random() > 0.5 ? Math.floor(Math.random() * 11) + 1 : null;

  return [name, nrp, rank, unit_id, specialization, status, joined_date, photo_url];
}

async function seedPersonnel() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  console.log('Generating 500 personnel...');
  const values = [];
  for (let i = 0; i < 500; i++) {
    values.push(generateRandomPerson());
  }

  console.log('Inserting into database...');
  const query = 'INSERT INTO personnel (name, nrp, rank, unit_id, specialization, status, joined_date, photo_url) VALUES ?';
  
  try {
    const [result] = await connection.query(query, [values]);
    console.log(`Inserted ${result.affectedRows} personnel records.`);
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    await connection.end();
    console.log('Done.');
  }
}

seedPersonnel();
