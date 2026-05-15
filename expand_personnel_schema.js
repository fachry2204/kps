const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    console.log('Expanding personnel table and creating sub-tables...');

    // 1. Update Personnel table with Biodata fields
    await connection.execute(`
      ALTER TABLE personnel 
      ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100),
      ADD COLUMN IF NOT EXISTS birth_date DATE,
      ADD COLUMN IF NOT EXISTS tmt_tni DATE,
      ADD COLUMN IF NOT EXISTS category VARCHAR(50),
      ADD COLUMN IF NOT EXISTS tmt_category DATE,
      ADD COLUMN IF NOT EXISTS ethnicity VARCHAR(50),
      ADD COLUMN IF NOT EXISTS religion VARCHAR(50),
      ADD COLUMN IF NOT EXISTS blood_type VARCHAR(5),
      ADD COLUMN IF NOT EXISTS source_pa VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tmt_pa DATE,
      ADD COLUMN IF NOT EXISTS position VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tmt_position DATE;
    `);

    // 2. Education Table (Umum)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS personnel_education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_id INT NOT NULL,
        edu_type VARCHAR(100),
        year INT,
        major VARCHAR(255),
        achievement VARCHAR(255),
        FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE
      )
    `);

    // 3. Military Education Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS personnel_mil_education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_id INT NOT NULL,
        category ENUM('DIKMA', 'DIKTUK', 'DIKBANGUM') NOT NULL,
        name VARCHAR(255),
        year INT,
        achievement VARCHAR(255),
        FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE
      )
    `);

    // 4. Awards / Tanda Kehormatan
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS personnel_awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_id INT NOT NULL,
        award_name VARCHAR(255),
        cert_number VARCHAR(100),
        year INT,
        FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE
      )
    `);

    // 5. Languages
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS personnel_languages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_id INT NOT NULL,
        lang_type ENUM('DAERAH', 'ASING') NOT NULL,
        language_name VARCHAR(100),
        proficiency ENUM('AKTIF', 'PASIF') NOT NULL,
        FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE
      )
    `);

    // 6. International Assignments (Penugasan)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS personnel_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_id INT NOT NULL,
        task_type VARCHAR(255),
        year INT,
        country VARCHAR(100),
        achievement VARCHAR(255),
        FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE
      )
    `);

    // Update operation history with achievement field if not exists
    await connection.execute(`
      ALTER TABLE personnel_operation_history 
      ADD COLUMN IF NOT EXISTS achievement VARCHAR(255)
    `);

    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
