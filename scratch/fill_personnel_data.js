const mysql = require('mysql2/promise');

async function populatePersonnel() {
    // Manually setting credentials from the .env I saw earlier
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'kpsdata',
    });

    try {
        console.log("Fetching personnel...");
        const [personnel] = await pool.query("SELECT * FROM personnel");
        console.log(`Found ${personnel.length} personnel records.`);

        for (const p of personnel) {
            console.log(`Processing ${p.name} (ID: ${p.id})...`);
            
            // Core Identity Data
            const birthPlaces = ["Jakarta", "Bandung", "Surabaya", "Semarang", "Yogyakarta", "Medan", "Palembang", "Makassar"];
            const religions = ["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDHA"];
            const ethnicities = ["JAWA", "SUNDA", "BATAK", "MINANG", "BUGIS", "MELAYU"];
            const bloodTypes = ["A", "B", "AB", "O"];
            const sourcePas = ["AKMIL", "SEPA PK", "SECAPA"];
            
            const birthPlace = birthPlaces[Math.floor(Math.random() * birthPlaces.length)];
            const religion = religions[Math.floor(Math.random() * religions.length)];
            const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)];
            const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
            const sourcePa = sourcePas[Math.floor(Math.random() * sourcePas.length)];
            
            const birthDate = `19${75 + Math.floor(Math.random() * 20)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`;
            const tmtTni = `20${Math.floor(Math.random() * 10) + 10}-01-01`;
            
            await pool.query(`
                UPDATE personnel SET 
                    birth_place = ?, 
                    birth_date = ?, 
                    religion = ?, 
                    ethnicity = ?, 
                    blood_type = ?, 
                    source_pa = ?,
                    tmt_tni = ?,
                    tmt_pa = ?,
                    category = ?,
                    tmt_category = ?,
                    position = ?,
                    tmt_position = ?,
                    address = ?
                WHERE id = ?
            `, [
                birthPlace, birthDate, religion, ethnicity, bloodType, sourcePa,
                tmtTni, tmtTni, "PARAKO", tmtTni, "DANTIM", tmtTni, 
                "Kesatrian Ahmad Yani, Cijantung, Jakarta Timur", p.id
            ]);

            // Add related data if missing
            // 1. Education
            const [edu] = await pool.query("SELECT id FROM personnel_education WHERE personnel_id = ?", [p.id]);
            if (edu.length === 0) {
                await pool.query("INSERT INTO personnel_education (personnel_id, edu_type, year, major, achievement) VALUES (?, ?, ?, ?, ?)", 
                    [p.id, "S1", "2015", "Hukum", "Cum Laude"]);
            }

            // 2. Military Education
            const [milEdu] = await pool.query("SELECT id FROM personnel_mil_education WHERE personnel_id = ?", [p.id]);
            if (milEdu.length === 0) {
                await pool.query("INSERT INTO personnel_mil_education (personnel_id, name, year, category, achievement) VALUES (?, ?, ?, ?, ?)", 
                    [p.id, "SESKOAD", "2020", "Pendidikan Lanjutan", "Lulusan Terbaik"]);
                await pool.query("INSERT INTO personnel_mil_education (personnel_id, name, year, category, achievement) VALUES (?, ?, ?, ?, ?)", 
                    [p.id, "KOMANDO 100", "2012", "Dik Spesialis", "Sangat Memuaskan"]);
            }

            // 3. Awards
            const [awards] = await pool.query("SELECT id FROM personnel_awards WHERE personnel_id = ?", [p.id]);
            if (awards.length === 0) {
                await pool.query("INSERT INTO personnel_awards (personnel_id, award_name, year, cert_number) VALUES (?, ?, ?, ?)", 
                    [p.id, "Satyalancana Kesetiaan VIII Tahun", "2020", "SK/123/VIII/2020"]);
                await pool.query("INSERT INTO personnel_awards (personnel_id, award_name, year, cert_number) VALUES (?, ?, ?, ?)", 
                    [p.id, "Satyalancana Dharma Nusa", "2018", "SK/456/DN/2018"]);
            }

            // 4. Languages
            const [langs] = await pool.query("SELECT id FROM personnel_languages WHERE personnel_id = ?", [p.id]);
            if (langs.length === 0) {
                await pool.query("INSERT INTO personnel_languages (personnel_id, language_name, proficiency, lang_type) VALUES (?, ?, ?, ?)", 
                    [p.id, "Inggris", "AKTIF", "ASING"]);
                await pool.query("INSERT INTO personnel_languages (personnel_id, language_name, proficiency, lang_type) VALUES (?, ?, ?, ?)", 
                    [p.id, "Jawa", "AKTIF", "DAERAH"]);
            }

            // 5. Assignments
            const [assignments] = await pool.query("SELECT id FROM personnel_assignments WHERE personnel_id = ?", [p.id]);
            if (assignments.length === 0) {
                await pool.query("INSERT INTO personnel_assignments (personnel_id, task_type, year, country, achievement) VALUES (?, ?, ?, ?, ?)", 
                    [p.id, "UNIFIL (Lebanon)", "2019", "Lebanon", "Outstanding Performance Medal"]);
            }
        }

        console.log("All personnel records updated successfully.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

populatePersonnel();
