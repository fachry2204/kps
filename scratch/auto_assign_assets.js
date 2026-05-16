const mysql = require('mysql2/promise');

async function run() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'kpsdata'
    });

    try {
        // 1. Get all operations
        const [opsDalam] = await connection.query('SELECT id FROM ops_dalamnegri');
        const [opsLuar] = await connection.query('SELECT id FROM ops_luarnegri');

        // 2. Get all available logistics (READY stock)
        const [logistics] = await connection.query('SELECT id, item_name, category, quantity FROM logistics WHERE unit_id IS NULL AND quantity > 0');

        // Group logistics by category
        const categories = {};
        logistics.forEach(item => {
            if (!categories[item.category]) categories[item.category] = [];
            categories[item.category].push(item);
        });

        const allOps = [
            ...opsDalam.map(o => ({ id: o.id, type: 'DALAM_NEGERI' })),
            ...opsLuar.map(o => ({ id: o.id, type: 'LUAR_NEGERI' }))
        ];

        console.log(`Starting distribution for ${allOps.length} operations...`);

        for (const op of allOps) {
            console.log(`Processing Op ${op.id} (${op.type})...`);
            
            // For each category, pick one random item
            for (const catName in categories) {
                const items = categories[catName];
                const item = items[Math.floor(Math.random() * items.length)];

                if (item.quantity <= 0) continue;

                // Determine quantity to add
                let addQty = 0;
                if (item.category === 'Senjata Jenis' && item.item_name.startsWith('Munisi')) {
                    addQty = Math.floor(Math.random() * 50) + 50; // 50-100 rounds
                } else if (item.category === 'Lain-Lain' && (item.item_name.includes('Sembako') || item.item_name.includes('Air'))) {
                    addQty = Math.floor(Math.random() * 5) + 5;
                } else if (item.category === 'Rantis') {
                    addQty = 1;
                } else {
                    addQty = Math.floor(Math.random() * 3) + 1; // 1-3 items
                }

                // Don't exceed available
                if (addQty > item.quantity) addQty = item.quantity;

                if (addQty > 0) {
                    // Perform transaction: Subtract from logistics, Add to operation_assets
                    await connection.beginTransaction();
                    try {
                        // Subtract
                        await connection.query('UPDATE logistics SET quantity = quantity - ? WHERE id = ?', [addQty, item.id]);
                        item.quantity -= addQty;

                        // Add
                        const assetType = (item.category === 'Senjata Jenis') ? 'SENJATA' : 'ALUTSISTA';
                        await connection.query(
                            'INSERT INTO operation_assets (operation_id, operation_type, asset_name, asset_type, quantity, condition_status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [op.id, op.type, item.item_name, assetType, addQty, 'EFEKTIF', 'Auto-distributed tactical supply']
                        );
                        await connection.commit();
                        // console.log(`  Added ${addQty} ${item.item_name} (${catName})`);
                    } catch (err) {
                        await connection.rollback();
                        console.error(`  Error adding ${item.item_name}:`, err.message);
                    }
                }
            }
        }

        console.log('Distribution complete.');

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await connection.end();
    }
}

run();
