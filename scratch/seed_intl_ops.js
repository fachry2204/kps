const mysql = require('mysql2/promise');

async function seed() {
    const db = await mysql.createConnection('mysql://root:@localhost/kpsdata');
    
    const operations = [
        {
            name: 'SATGAS TNI YONMEK KONGA XXIII-5',
            type: 'LUAR NEGERI',
            status: 'ONGOING',
            priority: 'HIGH',
            location: 'Lebanon',
            description: 'United Nations Interim Force in Lebanon (UNIFIL) Mechanized Infantry Battalion.'
        },
        {
            name: 'SATGAS TNI UNIFIL',
            type: 'LUAR NEGERI',
            status: 'ONGOING',
            priority: 'HIGH',
            location: 'Lebanon',
            description: 'Maritime Task Force (MTF) UNIFIL - KRI mission.'
        },
        {
            name: 'MILSTAFF UNMISS JUBA',
            type: 'LUAR NEGERI',
            status: 'ONGOING',
            priority: 'MEDIUM',
            location: 'South Sudan (Juba)',
            description: 'Military Staff Officers for UNMISS mission in Juba.'
        },
        {
            name: 'SATGAS INDO RDB MONUSCO',
            type: 'LUAR NEGERI',
            status: 'ONGOING',
            priority: 'CRITICAL',
            location: 'Congo (Goma)',
            description: 'Rapid Deployment Battalion (RDB) Monusco mission.'
        },
        {
            name: 'SATGAS KIZI TNI KONGA',
            type: 'LUAR NEGERI',
            status: 'ONGOING',
            priority: 'HIGH',
            location: 'Central African Republic',
            description: 'Indonesian Engineering Company (KIZI) mission.'
        }
    ];

    for (const op of operations) {
        await db.query(
            'INSERT INTO operations (operation_name, operation_type, status, priority, location, description, start_date) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [op.name, op.type, op.status, op.priority, op.location, op.description]
        );
        console.log(`Inserted: ${op.name}`);
    }

    await db.end();
}

seed().catch(console.error);
