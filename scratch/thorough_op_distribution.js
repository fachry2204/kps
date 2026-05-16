const mysql = require('mysql2/promise');

async function thoroughDistribute() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  try {
    const [ops] = await connection.query('SELECT id, operation_name, operation_type FROM operations');
    const [categories] = await connection.query('SELECT DISTINCT category FROM logistics WHERE category IS NOT NULL');
    
    console.log(`Starting thorough distribution for ${ops.length} operations across ${categories.length} categories into operation_assets...`);

    // First, clear existing operation_assets to avoid duplicates if re-running
    await connection.execute('DELETE FROM operation_assets');

    for (const op of ops) {
      console.log(`- Deploying assets to: ${op.operation_name}`);
      
      for (const catRow of categories) {
        let category = catRow.category;
        
        // Find an item in this category with enough stock
        const [items] = await connection.query(
          'SELECT * FROM logistics WHERE category = ? AND unit_id IS NULL AND quantity > 20 LIMIT 1',
          [category]
        );

        if (items.length > 0) {
          const item = items[0];
          const qtyToDeploy = Math.floor(Math.random() * 6) + 5; // 5 to 10 units
          
          const opType = op.operation_type === 'LUAR_NEGERI' ? 'LUAR_NEGERI' : 'DALAM_NEGERI';

          // 1. Add to operation_assets (This is what the Detail page uses)
          // Map category to the tab IDs used in UI if necessary, but UI uses category names in tabs too
          let assetType = category;
          if (category === 'Senjata Jenis') assetType = 'SENJATA'; // Map to 'SENJATA' for the tab filter in some cases? 
          // Actually, the tabs in UI are: SENJATA (SENJATA JENIS), ALKAPSUS, RANTIS, OPTIK, HANDAK, LAIN-LAIN
          if (category === 'Senjata Jenis') assetType = 'SENJATA';

          await connection.execute(
            'INSERT INTO operation_assets (operation_id, operation_type, asset_name, asset_type, quantity, condition_status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [op.id, opType, item.item_name, assetType, qtyToDeploy, 'READY', `Distributed from central logistics for ${op.operation_name}`]
          );

          // 2. Deduct from master logistics
          await connection.execute(
            'UPDATE logistics SET quantity = quantity - ? WHERE id = ?',
            [qtyToDeploy, item.id]
          );

          console.log(`  [OK] Assigned ${qtyToDeploy} of ${item.item_name} (${category}) as ${assetType}`);
        } else {
          console.log(`  [WARN] No sufficient stock for category: ${category}`);
        }
      }
    }

    console.log('Thorough distribution completed successfully.');
  } catch (err) {
    console.error('Failed distribution:', err);
  } finally {
    await connection.end();
  }
}

thoroughDistribute();
