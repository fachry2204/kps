const mysql = require('mysql2/promise');

async function seedOps() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    const [personnel] = await connection.query('SELECT id FROM personnel');
    const [opsD] = await connection.query('SELECT id FROM ops_dalamnegri');
    const [opsL] = await connection.query('SELECT id FROM ops_luarnegri');

    const personnelIds = personnel.map(p => p.id);
    
    // Clear existing ops assignments
    await connection.query('DELETE FROM personnel_ops_assignments');

    let pIndex = 0;

    // Assign to Ops Dalam Negeri
    for (const op of opsD) {
        if (pIndex >= personnelIds.length) break;
        const commanderId = personnelIds[pIndex++];
        await connection.query('INSERT INTO personnel_ops_assignments (personnel_id, op_type, op_id, role) VALUES (?, "DALAM_NEGERI", ?, "KOMANDAN")', [commanderId, op.id]);
        
        for (let j = 0; j < 5; j++) {
            if (pIndex >= personnelIds.length) break;
            const memberId = personnelIds[pIndex++];
            await connection.query('INSERT INTO personnel_ops_assignments (personnel_id, op_type, op_id, role) VALUES (?, "DALAM_NEGERI", ?, "ANGGOTA")', [memberId, op.id]);
        }
    }

    // Assign to Ops Luar Negeri
    for (const op of opsL) {
        if (pIndex >= personnelIds.length) break;
        const commanderId = personnelIds[pIndex++];
        await connection.query('INSERT INTO personnel_ops_assignments (personnel_id, op_type, op_id, role) VALUES (?, "LUAR_NEGERI", ?, "KOMANDAN")', [commanderId, op.id]);
        
        for (let j = 0; j < 8; j++) {
            if (pIndex >= personnelIds.length) break;
            const memberId = personnelIds[pIndex++];
            await connection.query('INSERT INTO personnel_ops_assignments (personnel_id, op_type, op_id, role) VALUES (?, "LUAR_NEGERI", ?, "ANGGOTA")', [memberId, op.id]);
        }
    }

    console.log("Operations assignments complete!");

  } catch (e) {
    console.error("Ops seeding failed:", e);
  } finally {
    await connection.end();
  }
}

seedOps();
