const mysql = require('mysql2/promise');

async function distribute() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  try {
    const [units] = await connection.query('SELECT id FROM units');
    const [ops] = await connection.query('SELECT id FROM operations');
    const [items] = await connection.query('SELECT * FROM logistics WHERE unit_id IS NULL');

    console.log(`Distributing ${items.length} items across ${units.length} units and ${ops.length} operations...`);

    for (const item of items) {
      if (item.quantity <= 10) continue; // Skip low quantity items

      const unitTotalPortion = Math.floor(item.quantity * 0.30); // 30% for units
      const opTotalPortion = Math.floor(item.quantity * 0.20);   // 20% for operations
      
      const qtyPerUnit = Math.floor(unitTotalPortion / units.length);
      const qtyPerOp = Math.floor(opTotalPortion / ops.length);

      if (qtyPerUnit > 0) {
        for (const unit of units) {
          // Check if already exists for this unit? No, just add a new record
          await connection.execute(
            'INSERT INTO logistics (unit_id, item_name, category, quantity, unit, min_stock_level, condition_status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [unit.id, item.item_name, item.category, qtyPerUnit, item.unit, Math.floor(qtyPerUnit * 0.1), item.condition_status, item.image_url]
          );
        }
      }

      if (qtyPerOp > 0) {
        for (const op of ops) {
          // operation_logistics doesn't have a strict relation to logistics.id, just uses item_name
          // We need to know if it's DALAM_NEGERI or LUAR_NEGERI
          // For now we'll check the operations table or just default to DALAM_NEGERI
          const [opDetails] = await connection.query('SELECT operation_type FROM operations WHERE id = ?', [op.id]);
          const opType = (opDetails[0]?.operation_type === 'LUAR_NEGERI') ? 'LUAR_NEGERI' : 'DALAM_NEGERI';

          await connection.execute(
            'INSERT INTO operation_logistics (operation_id, operation_type, item_name, quantity, unit) VALUES (?, ?, ?, ?, ?)',
            [op.id, opType, item.item_name, qtyPerOp, item.unit]
          );
        }
      }

      // Update original item quantity
      const newMasterQty = item.quantity - (qtyPerUnit * units.length) - (qtyPerOp * ops.length);
      await connection.execute(
        'UPDATE logistics SET quantity = ? WHERE id = ?',
        [newMasterQty, item.id]
      );
    }

    console.log('Logistics distribution completed successfully.');
  } catch (err) {
    console.error('Failed to distribute:', err);
  } finally {
    await connection.end();
  }
}

distribute();
