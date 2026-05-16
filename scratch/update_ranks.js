const mysql = require('mysql2/promise');

async function updateRanks() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'kpsdata'
    });

    try {
        console.log('--- Updating Commander Ranks to BRIGADIR JENDERAL ---');
        
        // 1. Get commanders from personnel_ops_assignments
        const [opsCommanders] = await connection.execute(
            'SELECT DISTINCT personnel_id FROM personnel_ops_assignments WHERE role = "KOMANDAN"'
        );
        
        // 2. Get commanders from units table
        const [unitCommanders] = await connection.execute(
            'SELECT DISTINCT commander_id as personnel_id FROM units WHERE commander_id IS NOT NULL'
        );

        // 3. Get personnel with unit_role = "KOMANDAN"
        const [roleCommanders] = await connection.execute(
            'SELECT id as personnel_id FROM personnel WHERE unit_role = "KOMANDAN"'
        );
        
        const commanderIds = [...new Set([
            ...opsCommanders.map(c => c.personnel_id), 
            ...unitCommanders.map(c => c.personnel_id),
            ...roleCommanders.map(c => c.personnel_id)
        ])];
        
        if (commanderIds.length > 0) {
            const placeholders = commanderIds.map(() => '?').join(',');
            await connection.execute(
                `UPDATE personnel SET rank = "BRIGADIR JENDERAL" WHERE id IN (${placeholders})`,
                commanderIds
            );
            console.log(`Updated ${commanderIds.length} commanders to BRIGADIR JENDERAL.`);
        } else {
            console.log('No commanders found to update.');
        }

        console.log('\n--- Removing JENDERAL ranks from Members ---');
        
        // 4. Get all personnel who have a Jenderal rank but IS NOT in the commander list
        // Filter out those who are NOT commanders
        const [jenderalMembers] = await connection.execute(
            `SELECT id, name, rank FROM personnel 
             WHERE rank LIKE "%JENDERAL%" 
             AND id NOT IN (
                SELECT DISTINCT personnel_id FROM personnel_ops_assignments WHERE role = "KOMANDAN"
                UNION
                SELECT DISTINCT commander_id FROM units WHERE commander_id IS NOT NULL
                UNION
                SELECT DISTINCT id FROM personnel WHERE unit_role = "KOMANDAN"
             )`
        );

        if (jenderalMembers.length > 0) {
            const jenderalMemberIds = jenderalMembers.map(m => m.id);
            const placeholders = jenderalMemberIds.map(() => '?').join(',');
            
            // Demote to KOLONEL or MAYOR. Let's use MAYOR for members.
            await connection.execute(
                `UPDATE personnel SET rank = "MAYOR" WHERE id IN (${placeholders})`,
                jenderalMemberIds
            );
            console.log(`Demoted ${jenderalMembers.length} personnel from JENDERAL ranks to MAYOR because they are not commanders.`);
        } else {
            console.log('No members with JENDERAL ranks found.');
        }

        console.log('\nRank update complete.');

    } catch (error) {
        console.error('Error updating ranks:', error);
    } finally {
        await connection.end();
    }
}

updateRanks();
