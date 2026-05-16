const mysql = require('mysql2/promise');

async function assignMembers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'kpsdata'
    });

    try {
        console.log('--- Ensuring 12 Members per Operation ---');
        
        // 1. Get all operations
        const [dalamNegeri] = await connection.execute('SELECT id FROM ops_dalamnegri');
        const [luarNegeri] = await connection.execute('SELECT id FROM ops_luarnegri');
        
        const allOps = [
            ...dalamNegeri.map(o => ({ id: o.id, type: 'DALAM_NEGERI' })),
            ...luarNegeri.map(o => ({ id: o.id, type: 'LUAR_NEGERI' }))
        ];

        for (const op of allOps) {
            // Check current member count
            const [currentMembers] = await connection.execute(
                'SELECT personnel_id FROM personnel_ops_assignments WHERE op_id = ? AND op_type = ? AND role = "ANGGOTA"',
                [op.id, op.type]
            );

            const count = currentMembers.length;
            if (count < 12) {
                const needed = 12 - count;
                console.log(`Op ${op.id} (${op.type}) needs ${needed} more members.`);
                
                // 2. Get personnel who are NOT in ANY operation yet
                const [availablePersonnel] = await connection.execute(
                    `SELECT id FROM personnel 
                     WHERE id NOT IN (SELECT personnel_id FROM personnel_ops_assignments)
                     AND unit_role != "KOMANDAN"
                     AND id NOT IN (SELECT commander_id FROM units WHERE commander_id IS NOT NULL)
                     LIMIT ?`,
                    [needed]
                );

                if (availablePersonnel.length > 0) {
                    for (const p of availablePersonnel) {
                        await connection.execute(
                            'INSERT INTO personnel_ops_assignments (op_id, op_type, personnel_id, role) VALUES (?, ?, ?, "ANGGOTA")',
                            [op.id, op.type, p.id]
                        );
                    }
                    console.log(`Assigned ${availablePersonnel.length} new members to Op ${op.id}.`);
                } else {
                    console.log('No more available personnel to assign.');
                }
            } else {
                console.log(`Op ${op.id} (${op.type}) already has ${count} members.`);
            }
        }

        console.log('\nAssignment complete.');

    } catch (error) {
        console.error('Error assigning members:', error);
    } finally {
        await connection.end();
    }
}

assignMembers();
