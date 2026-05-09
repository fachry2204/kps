import mysql from 'mysql2/promise';

async function seedHistory() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });
  
  try {
    // Check if there's at least one personnel
    const [personnel] = await connection.query('SELECT id FROM personnel LIMIT 3');
    const pList = personnel;
    
    if (pList.length > 0) {
      for (const p of pList) {
        // Seed Unit History
        await connection.query(\`
          INSERT INTO personnel_unit_history (personnel_id, unit_id, start_date, end_date) 
          VALUES (?, 1, '2015-05-10', '2018-08-15')
        \`, [p.id]);
        
        await connection.query(\`
          INSERT INTO personnel_unit_history (personnel_id, unit_id, start_date, end_date) 
          VALUES (?, 2, '2018-08-16', NULL)
        \`, [p.id]);

        // Seed Operation History
        await connection.query(\`
          INSERT INTO personnel_operation_history (personnel_id, operation_id, role, start_date, end_date) 
          VALUES (?, 1, 'Komandan Tim Penyerang', '2022-01-15', '2022-03-20')
        \`, [p.id]);
        
        await connection.query(\`
          INSERT INTO personnel_operation_history (personnel_id, operation_id, role, start_date, end_date) 
          VALUES (?, 2, 'Sniper Support', '2023-05-10', '2023-06-15')
        \`, [p.id]);
      }
      console.log('Seeded history data successfully');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    connection.end();
  }
}

seedHistory();
