const mysql = require('mysql2/promise');

async function syncAllOpsData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    console.log('Synchronizing all Operational Data (Domestic & International)...');

    const opsTables = ['ops_dalamnegri', 'ops_luarnegri'];
    
    // 1. Ensure columns exist in both tables
    for (const table of opsTables) {
      const [columns] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
      const colNames = columns.map(c => c.Field);

      const neededCols = [
        { name: 'commander_name', type: 'VARCHAR(255)' },
        { name: 'commander_rank', type: 'VARCHAR(100)' },
        { name: 'commander_id', type: 'INT' },
        { name: 'actual_personnel', type: 'INT DEFAULT 0' }
      ];

      for (const col of neededCols) {
        if (!colNames.includes(col.name)) {
          console.log(`- Adding column ${col.name} to ${table}`);
          await connection.execute(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type}`);
        }
      }
    }

    // 2. Clear existing junction assignments
    await connection.execute('DELETE FROM operation_personnel');
    console.log('- Reset personnel junction table.');

    // 3. Get all available personnel
    const [personnel] = await connection.execute(`
      SELECT id, name, rank 
      FROM personnel 
      ORDER BY FIELD(rank, 'JENDRAL', 'LETJEN', 'MAYJEN', 'BRIGJEN', 'KOLONEL', 'LETKOL', 'MAYOR', 'KAPTEN', 'LETTU', 'LETDA') ASC, id ASC
    `);
    console.log(`- Found ${personnel.length} total personnel pool.`);

    let usedPersonnelIds = new Set();

    for (const table of opsTables) {
      const [ops] = await connection.execute(`SELECT id, name FROM ${table}`);
      console.log(`\nProcessing ${table} (${ops.length} missions):`);

      for (const op of ops) {
        // Find commander
        let commander = null;
        for (let p of personnel) {
          if (!usedPersonnelIds.has(p.id)) {
            commander = p;
            usedPersonnelIds.add(p.id);
            break;
          }
        }

        if (commander) {
          // Update operation header
          await connection.execute(`
            UPDATE ${table} 
            SET commander_id = ?, commander_name = ?, commander_rank = ?, actual_personnel = 11
            WHERE id = ?
          `, [commander.id, commander.name, commander.rank, op.id]);

          // Link in junction table (operation_personnel)
          // We use a prefix or type to distinguish if needed, but ID is usually enough if it's unique across ops
          // If ID isn't unique across tables, we might need a type column in operation_personnel
          // For now, let's just use the current structure.
          await connection.execute(`
            INSERT INTO operation_personnel (operation_id, personnel_id, role) 
            VALUES (?, ?, 'KOMANDAN')
          `, [op.id, commander.id]);

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
          console.log(`  - [${op.name}] Assigned ${commander.name} + ${membersCount} Members.`);
        } else {
          console.log(`  - [${op.name}] ALERT: Personnel pool exhausted.`);
        }
      }
    }

    console.log('\nAll operational task forces have been established and synchronized.');

  } catch (error) {
    console.error('Operational Sync Failure:', error);
  } finally {
    await connection.end();
  }
}

syncAllOpsData();
