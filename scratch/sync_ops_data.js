const mysql = require('mysql2/promise');

async function syncOperationsAndPersonnel() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    console.log('Starting operational data synchronization...');

    // 1. Ensure schema is ready
    const [columns] = await connection.execute('SHOW COLUMNS FROM operations');
    const colNames = columns.map(c => c.Field);

    const neededCols = [
      { name: 'commander_name', type: 'VARCHAR(255)' },
      { name: 'commander_rank', type: 'VARCHAR(100)' },
      { name: 'commander_id', type: 'INT' },
      { name: 'actual_personnel', type: 'INT DEFAULT 0' }
    ];

    for (const col of neededCols) {
      if (!colNames.includes(col.name)) {
        console.log(`- Adding missing column: ${col.name}`);
        await connection.execute(`ALTER TABLE operations ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    // 2. Clear existing junction assignments to start fresh as requested
    await connection.execute('DELETE FROM operation_personnel');
    console.log('- Cleared existing operation_personnel assignments.');

    // 3. Get all operations (Both Dalam and Luar Negeri)
    const [ops] = await connection.execute('SELECT id, operation_name, operation_type FROM operations');
    console.log(`- Found ${ops.length} operations to populate.`);

    // 4. Get all available personnel
    const [personnel] = await connection.execute(`
      SELECT id, name, rank 
      FROM personnel 
      ORDER BY FIELD(rank, 'JENDRAL', 'LETJEN', 'MAYJEN', 'BRIGJEN', 'KOLONEL', 'LETKOL', 'MAYOR', 'KAPTEN', 'LETTU', 'LETDA') ASC, id ASC
    `);
    console.log(`- Found ${personnel.length} total personnel.`);

    let usedPersonnelIds = new Set();

    for (const op of ops) {
      console.log(`\nProcessing: ${op.operation_name} (${op.operation_type})`);
      
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
        // Update operations table header for UI cards
        await connection.execute(`
          UPDATE operations 
          SET commander_id = ?, commander_name = ?, commander_rank = ?, actual_personnel = 11
          WHERE id = ?
        `, [commander.id, commander.name, commander.rank, op.id]);

        // Insert into junction table
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
            if (membersCount >= 10) break;
          }
        }
        console.log(`- Assigned ${membersCount} Members.`);
      } else {
        console.log(`- ALERT: No more personnel available for this mission.`);
      }
    }

    console.log('\nDeployment synchronization completed successfully.');

  } catch (error) {
    console.error('Critical Error during sync:', error);
  } finally {
    await connection.end();
  }
}

syncOperationsAndPersonnel();
