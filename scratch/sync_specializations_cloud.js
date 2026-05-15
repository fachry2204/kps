const mysql = require('mysql2/promise');

async function updateSpecializations() {
  const pool = mysql.createPool({
    host: 'kps.garudaserver.cloud',
    user: 'kpsdata',
    password: 'Bangbens220488!',
    database: 'kpsdata'
  });

  const categories = [
    "PARAKO", "SANDHA", "GULTOR", "DEMOLISI", "BAKDUK", "BAHASA"
  ];

  try {
    console.log("--- CLOUD SPECIALIZATION UPDATE INITIATED ---");
    
    const [personnel] = await pool.query('SELECT id, name FROM personnel');
    console.log(`Found ${personnel.length} personnel to update.`);

    for (const person of personnel) {
      // Randomly pick 1 to 3 specializations
      const count = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...categories].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count).join(", ");

      await pool.query(
        'UPDATE personnel SET specialization = ? WHERE id = ?',
        [selected, person.id]
      );
      
      if (person.id % 50 === 0) {
        console.log(`Updated ${person.id} personnel...`);
      }
    }

    console.log("--- SPECIALIZATION UPDATE COMPLETE ---");
    process.exit(0);
  } catch (error) {
    console.error("UPDATE FAILURE:", error);
    process.exit(1);
  }
}

updateSpecializations();
