const mysql = require('mysql2/promise');

async function check() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  try {
    const [ops] = await pool.query('SELECT id, name FROM ops_dalamnegri');
    console.log("--- DOMESTIC OPERATIONS ---");
    for (const op of ops) {
      const [assigns] = await pool.query(
        'SELECT count(*) as count FROM personnel_ops_assignments WHERE op_id = ? AND op_type = "DALAM_NEGERI"',
        [op.id]
      );
      console.log(`ID: ${op.id} | Name: ${op.name} | Assigned: ${assigns[0].count}`);
    }

    const [opsLN] = await pool.query('SELECT id, name FROM ops_luarnegri');
    console.log("\n--- INTERNATIONAL OPERATIONS ---");
    for (const op of opsLN) {
      const [assigns] = await pool.query(
        'SELECT count(*) as count FROM personnel_ops_assignments WHERE op_id = ? AND op_type = "LUAR_NEGERI"',
        [op.id]
      );
      console.log(`ID: ${op.id} | Name: ${op.name} | Assigned: ${assigns[0].count}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
