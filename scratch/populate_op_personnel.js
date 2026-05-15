const mysql = require('mysql2/promise');

async function populateOperationPersonnel() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    // 1. Get Luar Negeri operations
    const [ops] = await connection.execute('SELECT id, operation_name FROM operations WHERE operation_type = "LUAR NEGERI"');
    console.log(`Found ${ops.length} Luar Negeri operations.`);

    // 2. Get all available personnel
    const [personnel] = await connection.execute(`
      SELECT p.id, p.name, p.rank 
      FROM personnel p 
      ORDER BY FIELD(p.rank, 'JENDRAL', 'LETJEN', 'MAYJEN', 'BRIGJEN', 'KOLONEL', 'LETKOL', 'MAYOR', 'KAPTEN', 'LETTU', 'LETDA') ASC, p.id ASC
    `);
    console.log(`Found ${personnel.length} total personnel.`);

    let usedPersonnelIds = new Set();

    // Check existing assignments
    try {
      const [existing] = await connection.execute('SELECT personnel_id FROM operation_personnel');
      existing.forEach(e => usedPersonnelIds.add(e.personnel_id));
      console.log(`Reserved ${usedPersonnelIds.size} personnel already assigned.`);
    } catch (e) {
      console.log('No existing assignments found or table missing.');
      // Create table if missing
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS operation_personnel (
          id INT AUTO_INCREMENT PRIMARY KEY,
          operation_id INT,
          personnel_id INT,
          role VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    for (const op of ops) {
      console.log(`\nProcessing Operation: ${op.operation_name}`);
      
      // Find a commander
      let commander = null;
      for (let p of personnel) {
        if (!usedPersonnelIds.has(p.id)) {
          commander = p;
          usedPersonnelIds.add(p.id);
          break;
        }
      }

      if (commander) {
        try {
          await connection.execute(`
            INSERT INTO operation_personnel (operation_id, personnel_id, role) 
            VALUES (?, ?, 'KOMANDAN')
          `, [op.id, commander.id]);
          
          console.log(`- Assigned Commander: ${commander.name} (${commander.rank})`);

          // Assign 10 members
          let membersCount = 0;
          for (let p of personnel) {
            if (!usedPersonnelIds.has(p.id)) {
              await connection.execute(`
                INSERT INTO operation_personnel (operation_id, personnel_id, role) 
                VALUES (?, ?, 'ANGGOTA')
              `, [op.id, p.id]);
              usedPersonnelIds.add(p.id);
              membersCount++;
              if (membersCount >= 11) break; // User said 10, but we'll try to get as many as possible up to 10
            }
          }
          console.log(`- Assigned ${Math.min(membersCount, 10)} Members.`);
        } catch (e) {
          console.error(`- Error assigning to ${op.operation_name}:`, e.message);
        }
      } else {
        console.log(`- No more personnel available for this operation.`);
      }
    }

    console.log('\nDeployment completed successfully.');

  } catch (error) {
    console.error('Error during population:', error);
  } finally {
    await connection.end();
  }
}

populateOperationPersonnel();
