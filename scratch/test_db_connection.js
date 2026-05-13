const mysql = require('mysql2/promise');

async function testConnection() {
    const user = 'kpsdata';
    const password = 'Bangbens220488!';
    const database = 'kpsdata';
    const host = 'kps.garudaserver.cloud';

    console.log(`Testing connection and tables on: ${host}...`);
    try {
        const connection = await mysql.createConnection({
            host: host,
            user: user,
            password: password,
            database: database,
            connectTimeout: 10000 
        });
        
        const tables = [
            'personnel', 'units', 'operations', 'intel_reports', 'logistics', 
            'notifications', 'messages', 'personnel_ops_assignments', 
            'ops_dalamnegri', 'ops_luarnegri', 'personnel_ops_history'
        ];
        
        for (const table of tables) {
            try {
                await connection.execute(`SELECT 1 FROM ${table} LIMIT 1`);
                console.log(`   Table '${table}': ✅ EXISTS`);
            } catch (err) {
                console.error(`   Table '${table}': ❌ MISSING - ${err.message}`);
            }
        }
        
        await connection.end();
    } catch (error) {
        console.error(`❌ FAILED: ${error.message}`);
    }
}

testConnection();
