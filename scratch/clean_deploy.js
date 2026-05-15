const mysql = require('mysql2/promise');

async function deployForce() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata',
    waitForConnections: true,
    connectionLimit: 10
  });

  try {
    console.log("--- STRATEGIC REDEPLOYMENT INITIATED ---");

    // 1. Reset all assignments and statuses
    await pool.query('DELETE FROM personnel_ops_assignments');
    await pool.query('UPDATE personnel SET status = "ACTIVE"');
    console.log("Cleared existing assignments and reset personnel status.");

    // 2. Get all operations
    const [opsDN] = await pool.query('SELECT id, name FROM ops_dalamnegri');
    const [opsLN] = await pool.query('SELECT id, name FROM ops_luarnegri');
    const allOps = [
      ...opsDN.map(op => ({ ...op, type: 'DALAM_NEGERI' })),
      ...opsLN.map(op => ({ ...op, type: 'LUAR_NEGERI' }))
    ];

    // 3. Get all available personnel
    const [allPersonnel] = await pool.query('SELECT id, name, rank FROM personnel');
    
    // Define Perwira ranks for commanders
    const perwiraRanks = ['Jendral', 'Letjen', 'Mayjen', 'Brigjen', 'Kolonel', 'Letkol', 'Mayor', 'Kapten', 'Lettu', 'Letda'];
    
    // Separate into pool of candidates
    let perwiraPool = allPersonnel
      .filter(p => perwiraRanks.includes(p.rank))
      .sort(() => Math.random() - 0.5); // Randomize officers

    let memberPool = allPersonnel
      .sort(() => Math.random() - 0.5); // Randomize general pool

    const usedIds = new Set();

    console.log(`Starting deployment for ${allOps.length} missions using ${allPersonnel.length} personnel...`);

    for (const op of allOps) {
      // Find 1 Commander (from Perwira)
      let commander = null;
      for (let i = 0; i < perwiraPool.length; i++) {
        if (!usedIds.has(perwiraPool[i].id)) {
          commander = perwiraPool[i];
          usedIds.add(commander.id);
          break;
        }
      }

      if (commander) {
        await pool.query(
          'INSERT INTO personnel_ops_assignments (personnel_id, op_id, op_type, role) VALUES (?, ?, ?, ?)',
          [commander.id, op.id, op.type, 'KOMANDAN']
        );
      }

      // Find 10 Members
      let assignedCount = 0;
      for (let i = 0; i < memberPool.length; i++) {
        if (assignedCount >= 10) break;
        if (!usedIds.has(memberPool[i].id)) {
          const member = memberPool[i];
          usedIds.add(member.id);
          await pool.query(
            'INSERT INTO personnel_ops_assignments (personnel_id, op_id, op_type, role) VALUES (?, ?, ?, ?)',
            [member.id, op.id, op.type, 'ANGGOTA']
          );
          assignedCount++;
        }
      }

      // Update statuses for this op
      await pool.query(
        'UPDATE personnel p JOIN personnel_ops_assignments a ON p.id = a.personnel_id SET p.status = "ON_MISSION" WHERE a.op_id = ? AND a.op_type = ?',
        [op.id, op.type]
      );

      console.log(`[DEPLOYED] ${op.name}: 1 Commander, ${assignedCount} Members.`);
    }

    console.log("\n--- MISSION SUCCESS: ALL FORCES DEPLOYED ---");
    process.exit(0);
  } catch (error) {
    console.error("DEPLOYMENT FAILURE:", error);
    process.exit(1);
  }
}

deployForce();
