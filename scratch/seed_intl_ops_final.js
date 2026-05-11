const mysql = require('mysql2/promise');

async function seed() {
    const db = await mysql.createConnection('mysql://root:@localhost/kpsdata');
    
    const operations = [
        {
            name: 'SATGAS TNI YONMEK KONGA XXIII-5',
            location: 'Lebanon',
            personnel: 850,
            status: 'ONGOING',
            readiness: 95,
            type: 'Peacekeeping (UNIFIL)'
        },
        {
            name: 'SATGAS TNI UNIFIL',
            location: 'Lebanon',
            personnel: 200,
            status: 'ONGOING',
            readiness: 90,
            type: 'Maritime Task Force'
        },
        {
            name: 'MILSTAFF UNMISS JUBA',
            location: 'South Sudan',
            personnel: 50,
            status: 'ONGOING',
            readiness: 85,
            type: 'Military Staff'
        },
        {
            name: 'SATGAS INDO RDB MONUSCO',
            location: 'Congo',
            personnel: 450,
            status: 'ONGOING',
            readiness: 92,
            type: 'Rapid Deployment'
        },
        {
            name: 'SATGAS KIZI TNI KONGA',
            location: 'Central African Republic',
            personnel: 150,
            status: 'ONGOING',
            readiness: 88,
            type: 'Engineering Mission'
        }
    ];

    for (const op of operations) {
        await db.query(
            'INSERT INTO ops_luarnegri (name, location, personnel, status, readiness, type) VALUES (?, ?, ?, ?, ?, ?)',
            [op.name, op.location, op.personnel, op.status, op.readiness, op.type]
        );
        console.log(`Inserted into ops_luarnegri: ${op.name}`);
    }

    await db.end();
}

seed().catch(console.error);
