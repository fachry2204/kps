const mysql = require('mysql2/promise');

async function seedAll() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    const [personnel] = await connection.query('SELECT id FROM personnel');
    const [units] = await connection.query('SELECT id FROM units');
    
    const personnelIds = personnel.map(p => p.id);
    const unitIds = units.map(u => u.id);

    console.log(`Assigning ${personnelIds.length} personnel to ${unitIds.length} units...`);

    // Reset all assignments first
    await connection.query('UPDATE personnel SET unit_id = NULL, unit_role = NULL');
    await connection.query('UPDATE units SET commander_id = NULL');

    let pIndex = 0;

    // 1. Assign Commanders
    for (const unitId of unitIds) {
        if (pIndex >= personnelIds.length) break;
        const commanderId = personnelIds[pIndex++];
        await connection.query('UPDATE units SET commander_id = ? WHERE id = ?', [commanderId, unitId]);
        await connection.query('UPDATE personnel SET unit_id = ?, unit_role = "KOMANDAN" WHERE id = ?', [unitId, commanderId]);
    }

    // 2. Assign the rest as members
    while (pIndex < personnelIds.length) {
        const personnelId = personnelIds[pIndex];
        const unitId = unitIds[pIndex % unitIds.length];
        await connection.query('UPDATE personnel SET unit_id = ?, unit_role = "Anggota Personil" WHERE id = ?', [unitId, personnelId]);
        pIndex++;
    }

    console.log("Full personnel distribution complete!");

  } catch (e) {
    console.error("Seeding failed:", e);
  } finally {
    await connection.end();
  }
}

seedAll();
