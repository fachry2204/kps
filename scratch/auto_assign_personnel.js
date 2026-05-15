const mysql = require('mysql2/promise');

async function syncOperations() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log("--- TACTICAL DEPLOYMENT INITIALIZED ---");

    // 1. Get all operations
    const [opsDN] = await pool.query('SELECT id, name FROM ops_dalamnegri');
    const [opsLN] = await pool.query('SELECT id, name FROM ops_luarnegri');
    
    const allOps = [
      ...opsDN.map(op => ({ ...op, type: 'DALAM_NEGERI' })),
      ...opsLN.map(op => ({ ...op, type: 'LUAR_NEGERI' }))
    ];

    console.log(`Found ${allOps.length} total operations.`);

    // 2. Get currently assigned personnel to avoid duplicates
    const [assignedRows] = await pool.query('SELECT personnel_id FROM personnel_ops_assignments');
    const assignedIds = new Set(assignedRows.map(r => r.personnel_id));
    console.log(`${assignedIds.size} personnel already deployed.`);

    // 3. Get all available personnel
    const [allPersonnel] = await pool.query('SELECT id, name, rank FROM personnel');
    
    // Sort to prioritize Perwira (Officers) for Commanders
    const perwiraRanks = ['Jendral', 'Letjen', 'Mayjen', 'Brigjen', 'Kolonel', 'Letkol', 'Mayor', 'Kapten', 'Lettu', 'Letda'];
    
    let availablePerwira = allPersonnel
      .filter(p => !assignedIds.has(p.id) && perwiraRanks.includes(p.rank))
      .sort((a, b) => perwiraRanks.indexOf(a.rank) - perwiraRanks.indexOf(b.rank));

    let availableMembers = allPersonnel
      .filter(p => !assignedIds.has(p.id))
      .sort(() => Math.random() - 0.5); // Randomize members

    console.log(`${availablePerwira.length} Officers and ${availableMembers.length} total personnel available.`);

    let count = 0;
    for (const op of allOps) {
      // Check if this op already has a commander
      const [existing] = await pool.query(
        'SELECT * FROM personnel_ops_assignments WHERE op_id = ? AND op_type = ?',
        [op.id, op.type]
      );

      if (existing.length > 0) {
        console.log(`Skipping ${op.name} - already has ${existing.length} personnel.`);
        continue;
      }

      // Assign 1 Commander
      if (availablePerwira.length > 0) {
        const commander = availablePerwira.shift();
        // Remove from members list if he was there
        availableMembers = availableMembers.filter(m => m.id !== commander.id);

        await pool.query(
          'INSERT INTO personnel_ops_assignments (personnel_id, op_id, op_type, role) VALUES (?, ?, ?, ?)',
          [commander.id, op.id, op.type, 'KOMANDAN']
        );
        console.log(`[${op.name}] Assigned Commander: ${commander.rank} ${commander.name}`);
      }

      // Assign 10 Members
      let membersAssigned = 0;
      while (membersAssigned < 10 && availableMembers.length > 0) {
        const member = availableMembers.shift();
        // Skip if this person was just assigned as commander
        if (assignedIds.has(member.id)) continue;

        await pool.query(
          'INSERT INTO personnel_ops_assignments (personnel_id, op_id, op_type, role) VALUES (?, ?, ?, ?)',
          [member.id, op.id, op.type, 'ANGGOTA']
        );
        membersAssigned++;
        count++;
      }
      
      // Update Personnel Status to ON_MISSION
      await pool.query(
        'UPDATE personnel p JOIN personnel_ops_assignments a ON p.id = a.personnel_id SET p.status = "ON_MISSION" WHERE a.op_id = ? AND a.op_type = ?',
        [op.id, op.type]
      );

      console.log(`[${op.name}] Assigned ${membersAssigned} Members.`);
    }

    console.log("--- DEPLOYMENT COMPLETE ---");
    process.exit(0);
  } catch (error) {
    console.error("DEPLOYMENT FAILED:", error);
    process.exit(1);
  }
}

syncOperations();
