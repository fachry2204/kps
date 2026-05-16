const mysql = require('mysql2/promise');

async function updateImages() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  try {
    console.log('Updating logistics images based on categories...');

    // 1. Senjata Jenis
    await connection.execute(
      'UPDATE logistics SET image_url = ? WHERE category = ?',
      ['/uploads/logistics/ss2_v1.png', 'Senjata Jenis']
    );

    // 2. Rantis
    await connection.execute(
      'UPDATE logistics SET image_url = ? WHERE category = ?',
      ['/uploads/logistics/p6_atav.png', 'Rantis']
    );

    // 3. Alkapsus
    await connection.execute(
      'UPDATE logistics SET image_url = ? WHERE category = ?',
      ['/uploads/logistics/helmet.png', 'Alkapsus']
    );

    // 4. Optik
    await connection.execute(
      'UPDATE logistics SET image_url = ? WHERE category = ?',
      ['/uploads/logistics/nvg.png', 'Optik']
    );

    // 5. Handak
    await connection.execute(
      'UPDATE logistics SET image_url = ? WHERE category = ?',
      ['/uploads/logistics/c4.png', 'Handak']
    );

    // 6. Specific for Ammunition (if name contains Munisi)
    await connection.execute(
      "UPDATE logistics SET image_url = ? WHERE item_name LIKE 'Munisi%'",
      ['/uploads/logistics/ammo_556.png']
    );

    console.log('Database updated successfully.');
  } catch (err) {
    console.error('Failed to update images:', err);
  } finally {
    await connection.end();
  }
}

updateImages();
