"use server";

import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'kps_secure_key_1234567890123456';
const ENCRYPTION_KEY_32 = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0')).slice(0, 32);
const IV_LENGTH = 16;

function encryptMessage(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY_32, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptMessage(text: string) {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // Fallback if not encrypted in our format
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY_32, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return text; // Fallback to original text if decryption fails
  }
}

// 1. Dashboard Statistics
export async function getDashboardStats() {
  try {
    const [personnelCount] = await pool.query('SELECT COUNT(*) as total FROM personnel');
    const [unitCount] = await pool.query('SELECT COUNT(*) as total FROM units');
    const [activeOps] = await pool.query('SELECT COUNT(*) as total FROM operations WHERE status = "ONGOING"');
    const [intelReports] = await pool.query('SELECT COUNT(*) as total FROM intel_reports');
    const [lowStock] = await pool.query('SELECT COUNT(*) as total FROM logistics WHERE quantity < min_stock_level');

    // Fetch personnel distribution by unit
    const [unitDist] = await pool.query(`
      SELECT u.unit_name as name, COUNT(p.id) as value 
      FROM units u 
      LEFT JOIN personnel p ON u.id = p.unit_id 
      GROUP BY u.id, u.unit_name
    `);

    return {
      personnel: (personnelCount as any)[0]?.total || 0,
      units: (unitCount as any)[0]?.total || 0,
      operations: (activeOps as any)[0]?.total || 0,
      intel: (intelReports as any)[0]?.total || 0,
      logisticsAlert: (lowStock as any)[0]?.total || 0,
      unitDistribution: (unitDist as any[]) || []
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return {
      personnel: 0,
      units: 0,
      operations: 0,
      intel: 0,
      logisticsAlert: 0,
      unitDistribution: []
    };
  }
}


// 2. Personnel Data
export async function getPersonnel() {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.unit_name,
      COALESCE(odn.name, oln.name) as current_op_name,
      COALESCE(odn.name, oln.name) as satgas_name,
      poa.op_id as current_op_id,
      poa.op_type as current_op_type,
      (SELECT u2.unit_name FROM units u2 WHERE u2.commander_id = p.id LIMIT 1) as commanded_unit_name
      FROM personnel p 
      LEFT JOIN units u ON p.unit_id = u.id
      LEFT JOIN personnel_ops_assignments poa ON p.id = poa.personnel_id
      LEFT JOIN ops_dalamnegri odn ON poa.op_id = odn.id AND poa.op_type = 'DALAM_NEGERI'
      LEFT JOIN ops_luarnegri oln ON poa.op_id = oln.id AND poa.op_type = 'LUAR_NEGERI'
      ORDER BY p.id DESC
    `);
    return rows as any[];
  } catch (error) {
    console.error("Get Personnel Error:", error);
    return [];
  }
}


export async function getPersonnelById(id: number) {
  try {
    if (isNaN(id)) return null;
    const [rows] = await pool.query(`
      SELECT p.*, u.unit_name,
             COALESCE(odn.name, oln.name) as current_op_name,
             COALESCE(odn.name, oln.name) as satgas_name,
             poa.op_id as current_op_id,
             poa.op_type as current_op_type
      FROM personnel p 
      LEFT JOIN units u ON p.unit_id = u.id
      LEFT JOIN personnel_ops_assignments poa ON p.id = poa.personnel_id
      LEFT JOIN ops_dalamnegri odn ON poa.op_id = odn.id AND poa.op_type = 'DALAM_NEGERI'
      LEFT JOIN ops_luarnegri oln ON poa.op_id = oln.id AND poa.op_type = 'LUAR_NEGERI'
      WHERE p.id = ?
      LIMIT 1
    `, [id]);
    const personnel = rows as any[];
    return personnel.length > 0 ? personnel[0] : null;
  } catch (error) {
    console.error("Get Personnel By ID Error:", error);
    return null;
  }
}

export async function getPersonnelUnitHistory(id: number) {
  try {
    if (isNaN(id)) return [];
    const [rows] = await pool.query(`
      SELECT h.*, u.unit_name, u.unit_type
      FROM personnel_unit_history h
      JOIN units u ON h.unit_id = u.id
      WHERE h.personnel_id = ?
      ORDER BY h.start_date DESC
    `, [id]);
    return rows as any[];
  } catch (error) {
    console.error("Get Personnel Unit History Error:", error);
    return [];
  }
}

export async function getPersonnelOperationHistory(id: number) {
  if (isNaN(id)) return [];
  const [rows] = await pool.query(`
    SELECT h.*, o.operation_name as mission_name, o.operation_type as mission_type, o.status as mission_status
    FROM personnel_operation_history h
    JOIN operations o ON h.operation_id = o.id
    WHERE h.personnel_id = ?
    ORDER BY h.start_date DESC
  `, [id]);
  return rows as any[];
}

// 3. Extended Personnel Actions
export async function getPersonnelEducation(id: number) {
  try {
    const [rows] = await pool.query('SELECT * FROM personnel_education WHERE personnel_id = ? ORDER BY year DESC', [id]);
    return rows as any[];
  } catch (error) { return []; }
}

export async function getPersonnelMilEducation(id: number) {
  try {
    const [rows] = await pool.query('SELECT * FROM personnel_mil_education WHERE personnel_id = ? ORDER BY year DESC', [id]);
    return rows as any[];
  } catch (error) { return []; }
}

export async function getPersonnelAwards(id: number) {
  try {
    const [rows] = await pool.query('SELECT * FROM personnel_awards WHERE personnel_id = ? ORDER BY year DESC', [id]);
    return rows as any[];
  } catch (error) { return []; }
}

export async function getPersonnelLanguages(id: number) {
  try {
    const [rows] = await pool.query('SELECT * FROM personnel_languages WHERE personnel_id = ?', [id]);
    return rows as any[];
  } catch (error) { return []; }
}

export async function getPersonnelAssignments(id: number) {
  try {
    const [rows] = await pool.query('SELECT * FROM personnel_assignments WHERE personnel_id = ? ORDER BY year DESC', [id]);
    return rows as any[];
  } catch (error) { return []; }
}

// 4. Filter Options
export async function getFilterOptions() {
  try {
    const [units] = await pool.query('SELECT id, unit_name as name FROM units ORDER BY unit_name ASC');
    const [opsDN] = await pool.query('SELECT id, name, "DALAM_NEGERI" as type FROM ops_dalamnegri ORDER BY name ASC');
    const [opsLN] = await pool.query('SELECT id, name, "LUAR_NEGERI" as type FROM ops_luarnegri ORDER BY name ASC');
    
    return {
      units: units as any[],
      operations: [...(opsDN as any[]), ...(opsLN as any[])]
    };
  } catch (error) {
    console.error("Get Filter Options Error:", error);
    return { units: [], operations: [] };
  }
}

// 4. Logistics Data
export async function getLogistics() {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, u.unit_name as unit_location, u.coordinates
      FROM logistics l
      LEFT JOIN units u ON l.unit_id = u.id
      ORDER BY l.id DESC
    `);
    return rows as any[];
  } catch (error) {
    console.error("Get Logistics Error:", error);
    return [];
  }
}



export async function getLogisticsByUnit(unitId: number) {
  const [rows] = await pool.query('SELECT * FROM logistics WHERE unit_id = ? ORDER BY item_name ASC', [unitId]);
  return rows as any[];
}

export async function addLogistics(data: any) {
  try {
    const { item_name, category, quantity, unit, min_stock_level, condition_status, unit_id, image_url } = data;
    const [result]: any = await pool.query(
      'INSERT INTO logistics (item_name, category, quantity, unit, min_stock_level, condition_status, unit_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [item_name, category, quantity, unit, min_stock_level, condition_status, unit_id || null, image_url || null]
    );
    return { success: true, id: result.insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function migrateLogisticsCategories() {
  try {
    console.log('Starting logistics category migration...');
    await pool.query("UPDATE logistics SET category = 'Senjata Jenis' WHERE category = 'Senjata' OR category = 'SENJATA'");
    await pool.query("UPDATE logistics SET category = 'Rantis' WHERE category = 'Kendaraan' OR category = 'KENDARAAN'");
    await pool.query("UPDATE logistics SET category = 'Alkapsus' WHERE category = 'Perlengkapan' OR category = 'PERLENGKAPAN' OR category = 'ALAT'");
    await pool.query("UPDATE logistics SET category = 'Handak' WHERE category = 'Amunisi' OR category = 'AMUNISI' OR category = 'Bahan Peledak'");
    console.log('Migration completed successfully.');
    return { success: true };
  } catch (error: any) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteLogistics(id: number) {
  try {
    await pool.query('DELETE FROM logistics WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. Operations Data
export async function getOperations() {
  try {
    const [rows] = await pool.query('SELECT * FROM operations ORDER BY start_date DESC');
    return rows as any[];
  } catch (error) {
    console.error("Get Operations Error:", error);
    return [];
  }
}

// 5. Intel Reports
export async function getIntelReports() {
  try {
    const [rows] = await pool.query(`
      SELECT ir.*, 
             CASE 
               WHEN ir.operation_type = 'DALAM_NEGERI' THEN od.name 
               WHEN ir.operation_type = 'LUAR_NEGERI' THEN ol.name 
               ELSE 'OPERASI UMUM'
             END as operation_name
      FROM intel_reports ir
      LEFT JOIN ops_dalamnegri od ON ir.operation_id = od.id AND ir.operation_type = 'DALAM_NEGERI'
      LEFT JOIN ops_luarnegri ol ON ir.operation_id = ol.id AND ir.operation_type = 'LUAR_NEGERI'
      ORDER BY ir.created_at DESC
    `);
    return rows as any[];
  } catch (error) {
    console.error("Get Intel Reports Error:", error);
    return [];
  }
}

export async function getOperationIntel(opId: number, opType: string) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM intel_reports WHERE operation_id = ? AND operation_type = ? ORDER BY created_at DESC', 
      [opId, opType]
    );
    return rows as any[];
  } catch (error) {
    console.error("Get Operation Intel Error:", error);
    return [];
  }
}

export async function addIntelReport(data: any) {
  try {
    const { title, threat_level, content, location_tag, coordinates, address, is_classified, operation_id, operation_type, reporter_id, lapsus, laporan_periodik, prediksi_ancaman } = data;
    const [result]: any = await pool.query(
      'INSERT INTO intel_reports (title, threat_level, content, location_tag, coordinates, address, is_classified, operation_id, operation_type, reporter_id, lapsus, laporan_periodik, prediksi_ancaman) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, threat_level, content, location_tag, coordinates, address, is_classified ? 1 : 0, operation_id || null, operation_type || null, reporter_id || null, lapsus || null, laporan_periodik || null, prediksi_ancaman || null]
    );
    return { success: true, id: result.insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteIntelReport(id: number) {
  try {
    await pool.query('DELETE FROM intel_reports WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateIntelReport(id: number, data: any) {
  try {
    const { title, threat_level, content, location_tag, coordinates, is_classified, lapsus, laporan_periodik, prediksi_ancaman } = data;
    await pool.query(
      'UPDATE intel_reports SET title = ?, threat_level = ?, content = ?, location_tag = ?, coordinates = ?, is_classified = ?, lapsus = ?, laporan_periodik = ?, prediksi_ancaman = ? WHERE id = ?',
      [title, threat_level, content, location_tag, coordinates, is_classified ? 1 : 0, lapsus || null, laporan_periodik || null, prediksi_ancaman || null, id]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 6. Units Data
export async function getUnits() {
  try {
    const [rows] = await pool.query(`
      SELECT u.*, 
      (SELECT COUNT(*) FROM personnel p WHERE p.unit_id = u.id) as strength,
      (SELECT COUNT(*) FROM logistics l WHERE l.unit_id = u.id) as logistics_count,
      (SELECT SUM(quantity) FROM logistics l WHERE l.unit_id = u.id AND l.category = 'Weaponry') as weaponry_count,
      p.name as commander_name,
      p.rank as commander_rank,
      p.nrp as commander_nrp
      FROM units u
      LEFT JOIN personnel p ON u.commander_id = p.id
      GROUP BY u.id, p.name, p.rank, p.nrp
    `);
    return rows as any[];
  } catch (error) {
    console.error("Get Units Error:", error);
    return [];
  }
}

export async function getUnitById(id: number) {
  if (isNaN(id)) return null;
  const [rows] = await pool.query(`
    SELECT u.*, p.name as commander_name, p.rank as commander_rank, p.nrp as commander_nrp
    FROM units u
    LEFT JOIN personnel p ON u.commander_id = p.id
    WHERE u.id = ?
    LIMIT 1
  `, [id]);
  const units = rows as any[];
  return units.length > 0 ? units[0] : null;
}

export async function getUnitMembers(unitId: number) {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.rank, p.nrp, p.specialization, p.status, p.unit_role
      FROM personnel p
      LEFT JOIN units u ON u.id = ?
      WHERE p.unit_id = ? AND (u.commander_id IS NULL OR p.id != u.commander_id)
      ORDER BY FIELD(p.rank, 'Kolonel', 'Letkol', 'Mayor', 'Kapten', 'Lettu', 'Letda', 'Peltu', 'Pelda', 'Serma', 'Serka', 'Sertu', 'Serda', 'Kopda', 'Koptu', 'Praka', 'Pratu', 'Prada') ASC, p.name ASC
    `, [unitId, unitId]);
    return rows as any[];
  } catch (error) {
    console.error("Get Unit Members Error:", error);
    return [];
  }
}

export async function getUnitActivities(unitId: number) {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT 
        COALESCE(dn.id, ln.id) as id,
        COALESCE(dn.name, ln.name) as name,
        COALESCE(dn.type, ln.type) as type,
        COALESCE(dn.status, ln.status) as status,
        COALESCE(dn.location, ln.location) as location,
        COALESCE(dn.created_at, ln.created_at) as created_at,
        poa.op_type as category
      FROM personnel p
      JOIN personnel_ops_assignments poa ON p.id = poa.personnel_id
      LEFT JOIN ops_dalamnegri dn ON poa.op_id = dn.id AND poa.op_type = 'DALAM_NEGERI'
      LEFT JOIN ops_luarnegri ln ON poa.op_id = ln.id AND poa.op_type = 'LUAR_NEGERI'
      WHERE p.unit_id = ?
    `, [unitId]);
    return rows as any[];
  } catch (error) {
    console.error("Get Unit Activities Error:", error);
    return [];
  }
}


interface AddUnitData {
  unit_name: string;
  unit_type: string;
  location: string;
  coordinates: string;
  commander_id?: string;
  members?: {id: number, role: string}[];
  logoBase64?: string | null;
  logoName?: string | null;
}

interface UpdateUnitData extends AddUnitData {
  id: number;
}

// 7. Add Unit
// ... existing addUnit ...

// 9. Update Unit
export async function updateUnit(data: UpdateUnitData) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Processing updateUnit:", data.id);
    const { id, unit_name, unit_type, location, coordinates, commander_id, members, logoBase64, logoName } = data;

    await connection.beginTransaction();

    let logoUrl = null;
    if (logoBase64 && logoName) {
      const base64Data = logoBase64.split(',')[1] || logoBase64;
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `${Date.now()}-${logoName.replace(/\s+/g, "_")}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "kesatuan");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);
      logoUrl = `/uploads/kesatuan/${fileName}`;
    }

    if (logoUrl) {
      await connection.query(
        'UPDATE units SET unit_name = ?, unit_type = ?, logo_url = ?, location = ?, coordinates = ?, commander_id = ? WHERE id = ?',
        [unit_name, unit_type, logoUrl, location, coordinates, commander_id || null, id]
      );
    } else {
      await connection.query(
        'UPDATE units SET unit_name = ?, unit_type = ?, location = ?, coordinates = ?, commander_id = ? WHERE id = ?',
        [unit_name, unit_type, location, coordinates, commander_id || null, id]
      );
    }

    // Clear existing assignments for this unit first
    await connection.query('UPDATE personnel SET unit_id = NULL, unit_role = NULL WHERE unit_id = ?', [id]);
    
    // Assign Commander
    if (commander_id) {
      await connection.query('UPDATE personnel SET unit_id = ?, unit_role = "KOMANDAN" WHERE id = ?', [id, commander_id]);
    }

    // Assign Members
    if (members && members.length > 0) {
      for (const m of members) {
        if (commander_id && m.id.toString() === commander_id.toString()) continue;
        await connection.query('UPDATE personnel SET unit_id = ?, unit_role = ? WHERE id = ?', [id, m.role, m.id]);
      }
    }
    
    await connection.commit();
    return { success: true };
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Error in updateUnit:", error);
    return { success: false, error: error.message };
  } finally {
    if (connection) connection.release();
  }
}
export async function addUnit(data: AddUnitData) {
  try {
    console.log("Processing addUnit (JSON mode)...");
    const { unit_name, unit_type, location, coordinates, commander_id, members, logoBase64, logoName } = data;

    console.log("Unit Data:", { unit_name, unit_type, location, coordinates, commander_id });

    let logoUrl = null;
    if (logoBase64 && logoName) {
      console.log("Uploading logo from base64:", logoName);
      // Remove data:image/...;base64, prefix
      const base64Data = logoBase64.split(',')[1] || logoBase64;
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${Date.now()}-${logoName.replace(/\s+/g, "_")}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "kesatuan");
      
      // Ensure directory exists
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);
      logoUrl = `/uploads/kesatuan/${fileName}`;
      console.log("Logo saved at:", logoUrl);
    }

    const [result] = await pool.query(
      'INSERT INTO units (unit_name, unit_type, logo_url, location, coordinates, status, commander_id) VALUES (?, ?, ?, ?, ?, "ACTIVE", ?)',
      [unit_name, unit_type, logoUrl, location, coordinates, commander_id || null]
    );
    
    const unitId = (result as any).insertId;
    console.log("Unit inserted with ID:", unitId);
    
    if (commander_id) {
      console.log("Updating commander:", commander_id);
      await pool.query(
        'UPDATE personnel SET unit_id = ? WHERE id = ?',
        [unitId, commander_id]
      );
    }

    if (members && members.length > 0) {
      console.log("Updating members:", members);
      for (const m of members) {
        await pool.query(
          'UPDATE personnel SET unit_id = ?, unit_role = ? WHERE id = ?',
          [unitId, m.role, m.id]
        );
      }
    }
    
    return { success: true, unitId };
  } catch (error: any) {
    console.error("Error in addUnit:", error);
    return { success: false, error: error.message };
  }
}

export async function addOperationLogistics(operationId: number, operationType: string, logistics: any[]) {
  try {
    for (const item of logistics) {
      await pool.query(
        'INSERT INTO operation_logistics (operation_id, operation_type, item_name, quantity, unit) VALUES (?, ?, ?, ?, ?)',
        [operationId, operationType, item.item_name, item.quantity, item.unit || 'pcs']
      );
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 8. Delete Unit
export async function deleteUnit(unitId: number) {
  try {
    console.log("Deleting unit:", unitId);
    
    // First, set unit_id to NULL for any personnel assigned to this unit
    await pool.query('UPDATE personnel SET unit_id = NULL WHERE unit_id = ?', [unitId]);
    
    // Then delete the unit
    await pool.query('DELETE FROM units WHERE id = ?', [unitId]);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting unit:", error);
    return { success: false, error: error.message };
  }
}

export interface AddPersonnelData {
  name: string;
  nrp: string;
  rank: string;
  unit_id: number | null;
  specialization: string;
  status: string;
  joined_date: string;
  photoBase64?: string | null;
  photoName?: string | null;
  address?: string;
  gps_coordinates?: string;
  phone_number?: string;
  emergency_contact?: string;
  email?: string;
}

// 10. Add Personnel
export async function addPersonnel(data: AddPersonnelData) {
  try {
    console.log("Processing addPersonnel:", data.name);
    const { name, nrp, rank, unit_id, specialization, status, joined_date, photoBase64, photoName, address, gps_coordinates, phone_number, emergency_contact, email } = data;

    let photoUrl = null;
    if (photoBase64 && photoName) {
      const base64Data = photoBase64.split(',')[1] || photoBase64;
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `${Date.now()}-${photoName.replace(/\s+/g, "_")}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "personnel");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);
      photoUrl = `/uploads/personnel/${fileName}`;
    }

    const [result] = await pool.query(
      'INSERT INTO personnel (nrp, name, rank, unit_id, specialization, status, joined_date, photo_url, address, gps_coordinates, phone_number, emergency_contact, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nrp, name, rank, unit_id, specialization, status, joined_date, photoUrl, address, gps_coordinates, phone_number, emergency_contact, email]
    );
    
    return { success: true, id: (result as any).insertId };
  } catch (error: any) {
    console.error("Error in addPersonnel:", error);
    return { success: false, error: error.message };
  }
}

// 11. Update Personnel
export async function updatePersonnel(id: number, data: AddPersonnelData) {
  try {
    const { name, nrp, rank, unit_id, specialization, status, joined_date, photoBase64, photoName, address, gps_coordinates, phone_number, emergency_contact, email } = data;
    
    let photoUrl = null;
    if (photoBase64 && photoName) {
      const base64Data = photoBase64.split(',')[1] || photoBase64;
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `${Date.now()}-${photoName.replace(/\s+/g, "_")}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "personnel");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);
      photoUrl = `/uploads/personnel/${fileName}`;
    }

    if (photoUrl) {
      await pool.query(
        'UPDATE personnel SET nrp = ?, name = ?, rank = ?, unit_id = ?, specialization = ?, status = ?, joined_date = ?, photo_url = ?, address = ?, gps_coordinates = ?, phone_number = ?, emergency_contact = ?, email = ? WHERE id = ?',
        [nrp, name, rank, unit_id, specialization, status, joined_date, photoUrl, address, gps_coordinates, phone_number, emergency_contact, email, id]
      );
    } else {
      await pool.query(
        'UPDATE personnel SET nrp = ?, name = ?, rank = ?, unit_id = ?, specialization = ?, status = ?, joined_date = ?, address = ?, gps_coordinates = ?, phone_number = ?, emergency_contact = ?, email = ? WHERE id = ?',
        [nrp, name, rank, unit_id, specialization, status, joined_date, address, gps_coordinates, phone_number, emergency_contact, email, id]
      );
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error in updatePersonnel:", error);
    return { success: false, error: error.message };
  }
}

// 12. Delete Personnel
export async function deletePersonnel(id: number) {
  try {
    // If they are a commander, set commander_id to NULL in units
    await pool.query('UPDATE units SET commander_id = NULL WHERE commander_id = ?', [id]);
    
    // Delete their history
    await pool.query('DELETE FROM personnel_unit_history WHERE personnel_id = ?', [id]);
    await pool.query('DELETE FROM personnel_operation_history WHERE personnel_id = ?', [id]);
    
    // Delete the person
    await pool.query('DELETE FROM personnel WHERE id = ?', [id]);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error in deletePersonnel:", error);
    return { success: false, error: error.message };
  }
}
// 13. Operations Tables (New)
export async function getOpsDalamNegeri() {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, 
             (SELECT COUNT(*) FROM personnel_ops_assignments WHERE op_id = o.id AND op_type = 'DALAM_NEGERI') as actual_personnel,
             (SELECT p.name FROM personnel_ops_assignments a JOIN personnel p ON a.personnel_id = p.id WHERE a.op_id = o.id AND a.op_type = 'DALAM_NEGERI' AND a.role = 'KOMANDAN' LIMIT 1) as commander_name,
             (SELECT p.rank FROM personnel_ops_assignments a JOIN personnel p ON a.personnel_id = p.id WHERE a.op_id = o.id AND a.op_type = 'DALAM_NEGERI' AND a.role = 'KOMANDAN' LIMIT 1) as commander_rank
      FROM ops_dalamnegri o
      ORDER BY o.id ASC
    `);
    return rows as any[];
  } catch (error) {
    console.error("Get Ops Dalam Negeri Error:", error);
    return [];
  }
}

export async function getOpsLuarNegeri() {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, 
             (SELECT COUNT(*) FROM personnel_ops_assignments WHERE op_id = o.id AND op_type = 'LUAR_NEGERI') as actual_personnel,
             (SELECT p.name FROM personnel_ops_assignments a JOIN personnel p ON a.personnel_id = p.id WHERE a.op_id = o.id AND a.op_type = 'LUAR_NEGERI' AND a.role = 'KOMANDAN' LIMIT 1) as commander_name,
             (SELECT p.rank FROM personnel_ops_assignments a JOIN personnel p ON a.personnel_id = p.id WHERE a.op_id = o.id AND a.op_type = 'LUAR_NEGERI' AND a.role = 'KOMANDAN' LIMIT 1) as commander_rank
      FROM ops_luarnegri o
      ORDER BY o.id ASC
    `);
    return rows as any[];
  } catch (error) {
    console.error("Get Ops Luar Negeri Error:", error);
    return [];
  }
}

export async function addOpDalamNegeri(data: any) {
  try {
    const { name, location, coordinates, personnel, status, readiness, type, mission_objectives } = data;
    const [result]: any = await pool.query(
      'INSERT INTO ops_dalamnegri (name, location, coordinates, personnel, status, readiness, type, mission_objectives) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, location, coordinates, personnel, status, readiness, type, mission_objectives]
    );
    return { success: true, id: result.insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addOpLuarNegeri(data: any) {
  try {
    const { name, location, coordinates, personnel, status, readiness, type, mission_objectives } = data;
    const [result]: any = await pool.query(
      'INSERT INTO ops_luarnegri (name, location, coordinates, personnel, status, readiness, type, mission_objectives) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, location, coordinates, personnel, status, readiness, type, mission_objectives]
    );
    return { success: true, id: result.insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOpDalamNegeri(id: number, data: any) {
  try {
    const { name, location, coordinates, personnel, status, readiness, type, mission_objectives } = data;
    await pool.query(
      'UPDATE ops_dalamnegri SET name = ?, location = ?, coordinates = ?, personnel = ?, status = ?, readiness = ?, type = ?, mission_objectives = ? WHERE id = ?',
      [name, location, coordinates, personnel, status, readiness, type, mission_objectives, id]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteOpDalamNegeri(id: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Return all assets to stock
    const [assets]: any = await connection.query('SELECT asset_name, quantity FROM operation_assets WHERE operation_id = ? AND operation_type = "DALAM_NEGERI"', [id]);
    for (const asset of assets) {
      await connection.query('UPDATE logistics SET quantity = quantity + ? WHERE item_name = ? AND unit_id IS NULL', [asset.quantity, asset.asset_name]);
    }
    await connection.query('DELETE FROM operation_assets WHERE operation_id = ? AND operation_type = "DALAM_NEGERI"', [id]);

    // 2. Reset personnel status
    const [assignments]: any = await connection.query('SELECT personnel_id FROM personnel_ops_assignments WHERE op_id = ? AND op_type = "DALAM_NEGERI"', [id]);
    for (const assign of assignments) {
      await connection.query('UPDATE personnel SET status = "READY" WHERE id = ?', [assign.personnel_id]);
    }
    await connection.query('DELETE FROM personnel_ops_assignments WHERE op_id = ? AND op_type = "DALAM_NEGERI"', [id]);

    // 3. Delete the operation
    await connection.query('DELETE FROM ops_dalamnegri WHERE id = ?', [id]);

    await connection.commit();
    return { success: true };
  } catch (error: any) {
    await connection.rollback();
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

export async function updateOpLuarNegeri(id: number, data: any) {
  try {
    const { name, location, coordinates, personnel, status, readiness, type, mission_objectives } = data;
    await pool.query(
      'UPDATE ops_luarnegri SET name = ?, location = ?, coordinates = ?, personnel = ?, status = ?, readiness = ?, type = ?, mission_objectives = ? WHERE id = ?',
      [name, location, coordinates, personnel, status, readiness, type, mission_objectives, id]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteOpLuarNegeri(id: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Return all assets to stock
    const [assets]: any = await connection.query('SELECT asset_name, quantity FROM operation_assets WHERE operation_id = ? AND operation_type = "LUAR_NEGERI"', [id]);
    for (const asset of assets) {
      await connection.query('UPDATE logistics SET quantity = quantity + ? WHERE item_name = ? AND unit_id IS NULL', [asset.quantity, asset.asset_name]);
    }
    await connection.query('DELETE FROM operation_assets WHERE operation_id = ? AND operation_type = "LUAR_NEGERI"', [id]);

    // 2. Reset personnel status
    const [assignments]: any = await connection.query('SELECT personnel_id FROM personnel_ops_assignments WHERE op_id = ? AND op_type = "LUAR_NEGERI"', [id]);
    for (const assign of assignments) {
      await connection.query('UPDATE personnel SET status = "READY" WHERE id = ?', [assign.personnel_id]);
    }
    await connection.query('DELETE FROM personnel_ops_assignments WHERE op_id = ? AND op_type = "LUAR_NEGERI"', [id]);

    // 3. Delete the operation
    await connection.query('DELETE FROM ops_luarnegri WHERE id = ?', [id]);

    await connection.commit();
    return { success: true };
  } catch (error: any) {
    await connection.rollback();
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

export async function searchPersonnel(query: string) {
  const [rows] = await pool.query(
    'SELECT id, name, rank, specialization, nrp FROM personnel WHERE name LIKE ? OR nrp LIKE ? LIMIT 10',
    [`%${query}%`, `%${query}%`]
  );
  return rows as any[];
}

export async function getPersonnelAssignment(personnelId: number) {
  const [rows]: any = await pool.query(`
    SELECT a.*, 
           COALESCE(od.name, ol.name) as op_name,
           COALESCE(od.location, ol.location) as op_location
    FROM personnel_ops_assignments a
    LEFT JOIN ops_dalamnegri od ON a.op_type = 'DALAM_NEGERI' AND a.op_id = od.id
    LEFT JOIN ops_luarnegri ol ON a.op_type = 'LUAR_NEGERI' AND a.op_id = ol.id
    WHERE a.personnel_id = ?
  `, [personnelId]);
  return rows[0] || null;
}

export async function assignPersonnelToOp(data: {
  personnelId: number;
  opType: 'DALAM_NEGERI' | 'LUAR_NEGERI';
  opId: number;
  role: string;
  moveIfAssigned: boolean;
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check existing assignment
    const [existing]: any = await connection.query(
      'SELECT * FROM personnel_ops_assignments WHERE personnel_id = ?',
      [data.personnelId]
    );

    if (existing.length > 0) {
      if (!data.moveIfAssigned) {
        await connection.release();
        return { success: false, isAlreadyAssigned: true };
      }

      // Move logic: Create history for old assignment
      const [oldOp]: any = await connection.query(
        data.opType === 'DALAM_NEGERI' 
          ? 'SELECT * FROM ops_dalamnegri WHERE id = ?' 
          : 'SELECT * FROM ops_luarnegri WHERE id = ?',
        [existing[0].op_id]
      );

      const [person]: any = await connection.query('SELECT specialization FROM personnel WHERE id = ?', [data.personnelId]);

      const startDate = new Date(existing[0].assigned_at);
      const endDate = new Date();
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      await connection.query(`
        INSERT INTO personnel_ops_history 
        (personnel_id, op_type_text, op_name, op_location, op_role, specialization, start_date, end_date, total_days)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.personnelId,
        existing[0].op_type === 'DALAM_NEGERI' ? 'Dalam Negri' : 'Luar Negri',
        oldOp[0]?.name || 'Unknown',
        oldOp[0]?.location || 'Unknown',
        existing[0].role,
        person[0]?.specialization || 'N/A',
        startDate,
        endDate,
        diffDays
      ]);

      // Remove old assignment
      await connection.query('DELETE FROM personnel_ops_assignments WHERE id = ?', [existing[0].id]);
    }

    // Create new assignment
    await connection.query(
      'INSERT INTO personnel_ops_assignments (personnel_id, op_type, op_id, role) VALUES (?, ?, ?, ?)',
      [data.personnelId, data.opType, data.opId, data.role]
    );

    // Update personnel status
    await connection.query('UPDATE personnel SET status = "ON_MISSION" WHERE id = ?', [data.personnelId]);

    await connection.commit();
    return { success: true };
  } catch (error: any) {
    await connection.rollback();
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}
export async function getOpAssignments(opId: number, opType: 'DALAM_NEGERI' | 'LUAR_NEGERI') {
  const [rows] = await pool.query(`
    SELECT a.role, p.id, p.name, p.rank, p.nrp, p.specialization, p.phone_number, p.photo_url
    FROM personnel_ops_assignments a
    JOIN personnel p ON a.personnel_id = p.id
    WHERE a.op_id = ? AND a.op_type = ?
  `, [opId, opType]);
  return rows as any[];
}

export async function getPersonnelOpsHistory(personnelId: number) {
  const [rows] = await pool.query(
    'SELECT * FROM personnel_ops_history WHERE personnel_id = ? ORDER BY end_date DESC',
    [personnelId]
  );
  return rows as any[];
}

// 14. Chat System
export async function getChatContacts(currentUserId: number, unitId?: number, opId?: number) {
  let query = `
    SELECT DISTINCT p.id, p.name, p.rank, p.photo_url,
      (SELECT message_text FROM messages WHERE (sender_id = p.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = p.id) ORDER BY created_at DESC LIMIT 1) as lastMessage,
      (SELECT created_at FROM messages WHERE (sender_id = p.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = p.id) ORDER BY created_at DESC LIMIT 1) as time,
      (SELECT COUNT(*) FROM messages WHERE sender_id = p.id AND receiver_id = ? AND status != 'read') as unread
    FROM personnel p
  `;
  
  if (opId) {
    query += ` JOIN personnel_ops_assignments poa ON p.id = poa.personnel_id `;
  }

  query += ` WHERE p.id != ? `;
  
  const params: any[] = [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId];
  
  if (unitId) {
    query += ` AND p.unit_id = ? `;
    params.push(unitId);
  }

  if (opId) {
    query += ` AND poa.op_id = ? `;
    params.push(opId);
  }
  
  query += ` ORDER BY time DESC, p.name ASC `;

  const [rows] = await pool.query(query, params);
  
  const contacts = rows as any[];
  contacts.forEach(c => {
    if (c.lastMessage) {
      c.lastMessage = decryptMessage(c.lastMessage);
    }
  });

  return contacts;
}

export async function getChatMessages(user1Id: number, user2Id: number) {
  const [rows] = await pool.query(`
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `, [user1Id, user2Id, user2Id, user1Id]);
  
  // Mark as read if user1 (the fetcher) is the receiver
  await pool.query(`
    UPDATE messages SET status = 'read' WHERE sender_id = ? AND receiver_id = ? AND status != 'read'
  `, [user2Id, user1Id]);

  const messages = rows as any[];
  messages.forEach(m => {
    if (m.message_text) {
      m.message_text = decryptMessage(m.message_text);
    }
  });

  return messages;
}

export async function sendChatMessage(senderId: number, receiverId: number, text: string) {
  try {
    const encryptedText = encryptMessage(text);
    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)',
      [senderId, receiverId, encryptedText]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 15. Notifications System
export async function getNotifications(userId: number) {
  const [rows] = await pool.query(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `, [userId]);
  return rows as any[];
}

export async function markNotificationRead(notificationId: number) {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 16. Operational Assets
export async function getOperationAssets(opId: number, opType: string) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM operation_assets WHERE operation_id = ? AND operation_type = ? ORDER BY asset_name ASC',
      [opId, opType]
    );
    return rows as any[];
  } catch (error) {
    console.error("Get Operation Assets Error:", error);
    return [];
  }
}

export async function addOperationAsset(data: {
  operation_id: number;
  operation_type: string;
  asset_name: string;
  asset_type: 'ALUTSISTA' | 'SENJATA';
  quantity: number;
  condition_status: string;
  description: string;
}) {
  try {
    const { operation_id, operation_type, asset_name, asset_type, quantity, condition_status, description } = data;
    
    // 1. Check if enough stock exists in master logistics (where unit_id is NULL)
    const [logistics]: any = await pool.query('SELECT id, quantity, category FROM logistics WHERE item_name = ? AND unit_id IS NULL LIMIT 1', [asset_name]);
    if (logistics.length === 0 || logistics[0].quantity < quantity) {
      return { success: false, error: "Stok logistik tidak mencukupi atau tidak ditemukan." };
    }

    const logId = logistics[0].id;
    const category = logistics[0].category;

    // 2. Subtract from logistics
    await pool.query('UPDATE logistics SET quantity = quantity - ? WHERE id = ?', [quantity, logId]);

    // 3. Insert into operation_assets
    await pool.query(
      'INSERT INTO operation_assets (operation_id, operation_type, asset_name, asset_type, category, quantity, condition_status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [operation_id, operation_type, asset_name, asset_type, category, quantity, condition_status, description]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteOperationAsset(id: number) {
  try {
    // 1. Get the asset info before deleting to restore stock
    const [assets]: any = await pool.query('SELECT asset_name, quantity FROM operation_assets WHERE id = ?', [id]);
    if (assets.length > 0) {
      const { asset_name, quantity } = assets[0];
      // Restore to logistics (where unit_id is NULL)
      await pool.query('UPDATE logistics SET quantity = quantity + ? WHERE item_name = ? AND unit_id IS NULL', [quantity, asset_name]);
    }

    // 2. Delete from operation_assets
    await pool.query('DELETE FROM operation_assets WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOperationAsset(id: number, data: { quantity: number, condition_status: string, description?: string }) {
  try {
    // 1. Get current quantity to calculate diff
    const [current]: any = await pool.query('SELECT asset_name, quantity FROM operation_assets WHERE id = ?', [id]);
    if (current.length === 0) return { success: false, error: "Asset not found" };
    
    const diff = data.quantity - current[0].quantity;
    const assetName = current[0].asset_name;

    if (diff !== 0) {
      // If increasing operational quantity, subtract from logistics. If decreasing, add back.
      // Check if enough stock for increase
      if (diff > 0) {
        const [logistics]: any = await pool.query('SELECT quantity FROM logistics WHERE item_name = ? AND unit_id IS NULL', [assetName]);
        if (logistics.length === 0 || logistics[0].quantity < diff) {
          return { success: false, error: "Stok tidak mencukupi untuk penambahan." };
        }
      }
      await pool.query('UPDATE logistics SET quantity = quantity - ? WHERE item_name = ? AND unit_id IS NULL', [diff, assetName]);
    }

    // 2. Update operation_assets
    await pool.query(
      'UPDATE operation_assets SET quantity = ?, condition_status = ?, description = ? WHERE id = ?',
      [data.quantity, data.condition_status, data.description || '', id]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOperationAssetsTotal() {
  try {
    const [rows]: any = await pool.query('SELECT SUM(quantity) as total FROM operation_assets');
    return rows[0].total || 0;
  } catch (error) {
    return 0;
  }
}



export async function getLogisticsDistribution(itemName: string) {
  try {
    // 1. In Units (Kesatuan)
    const [unitsRows]: any = await pool.query(
      'SELECT SUM(quantity) as total FROM logistics WHERE item_name = ? AND unit_id IS NOT NULL',
      [itemName]
    );
    const count_kesatuan = unitsRows[0].total || 0;

    // 2. In Operations (Dalam Negeri)
    const [dnRows]: any = await pool.query(
      'SELECT SUM(quantity) as total FROM operation_assets WHERE asset_name = ? AND operation_type = "DALAM_NEGERI"',
      [itemName]
    );
    const count_ops_dn = dnRows[0].total || 0;

    // 3. In Operations (Luar Negeri)
    const [lnRows]: any = await pool.query(
      'SELECT SUM(quantity) as total FROM operation_assets WHERE asset_name = ? AND operation_type = "LUAR_NEGERI"',
      [itemName]
    );
    const count_ops_ln = lnRows[0].total || 0;

    return {
      kesatuan: count_kesatuan,
      ops_dn: count_ops_dn,
      ops_ln: count_ops_ln
    };
  } catch (error) {
    console.error("Distribution Error:", error);
    return { kesatuan: 0, ops_dn: 0, ops_ln: 0 };
  }
}

export async function getLogisticsDistributionDetails(itemName: string) {
  try {
    // 1. In Units (Kesatuan)
    const [units]: any = await pool.query(`
      SELECT u.id, u.unit_name as name, u.coordinates, l.quantity, 'UNIT' as type
      FROM units u
      JOIN logistics l ON u.id = l.unit_id
      WHERE l.item_name = ? AND l.quantity > 0
    `, [itemName]);

    // 2. In Operations (Dalam Negeri)
    const [ops_dn]: any = await pool.query(`
      SELECT o.id, o.name, o.coordinates, oa.quantity, 'DALAM_NEGERI' as type
      FROM ops_dalamnegri o
      JOIN operation_assets oa ON o.id = oa.operation_id AND oa.operation_type = 'DALAM_NEGERI'
      WHERE oa.asset_name = ? AND oa.quantity > 0
    `, [itemName]);

    // 3. In Operations (Luar Negeri)
    const [ops_ln]: any = await pool.query(`
      SELECT o.id, o.name, o.coordinates, oa.quantity, 'LUAR_NEGERI' as type
      FROM ops_luarnegri o
      JOIN operation_assets oa ON o.id = oa.operation_id AND oa.operation_type = 'LUAR_NEGERI'
      WHERE oa.asset_name = ? AND oa.quantity > 0
    `, [itemName]);

    return {
      units: units || [],
      ops_dn: ops_dn || [],
      ops_ln: ops_ln || []
    };
  } catch (error) {
    console.error("Distribution Details Error:", error);
    return { units: [], ops_dn: [], ops_ln: [] };
  }
}

export async function getAllLogisticsLocations() {
  try {
    // 1. Units with any logistics
    const [units]: any = await pool.query(`
      SELECT u.id, u.unit_name as name, u.coordinates, 'UNIT' as type,
             GROUP_CONCAT(CONCAT(l.item_name, ' (', l.quantity, ' ', l.unit, ')') SEPARATOR '\n') as items_summary
      FROM units u
      JOIN logistics l ON u.id = l.unit_id
      WHERE l.quantity > 0 AND u.coordinates IS NOT NULL
      GROUP BY u.id
    `);

    // 2. Operations (Dalam Negeri) with any assets
    const [ops_dn]: any = await pool.query(`
      SELECT o.id, o.name, o.coordinates, 'DALAM_NEGERI' as type,
             GROUP_CONCAT(CONCAT(oa.asset_name, ' (', oa.quantity, ' ', oa.unit, ')') SEPARATOR '\n') as items_summary
      FROM ops_dalamnegri o
      JOIN operation_assets oa ON o.id = oa.operation_id AND oa.operation_type = 'DALAM_NEGERI'
      WHERE oa.quantity > 0 AND o.coordinates IS NOT NULL
      GROUP BY o.id
    `);

    // 3. Operations (Luar Negeri) with any assets
    const [ops_ln]: any = await pool.query(`
      SELECT o.id, o.name, o.coordinates, 'LUAR_NEGERI' as type,
             GROUP_CONCAT(CONCAT(oa.asset_name, ' (', oa.quantity, ' ', oa.unit, ')') SEPARATOR '\n') as items_summary
      FROM ops_luarnegri o
      JOIN operation_assets oa ON o.id = oa.operation_id AND oa.operation_type = 'LUAR_NEGERI'
      WHERE oa.quantity > 0 AND o.coordinates IS NOT NULL
      GROUP BY o.id
    `);

    return {
      units: units || [],
      ops_dn: ops_dn || [],
      ops_ln: ops_ln || []
    };
  } catch (error) {
    console.error("All Distribution Locations Error:", error);
    return { units: [], ops_dn: [], ops_ln: [] };
  }
}

// 12. Situational Monitoring (IPOLEKSOSBUDHANKAM)
export async function getSituationalMonitoring() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM situational_monitoring 
      ORDER BY FIELD(category, 'IDEOLOGI', 'POLITIK', 'EKONOMI', 'SOSIAL', 'BUDAYA', 'MILITER', 'KEAMANAN')
    `);
    return rows as any[];
  } catch (error) {
    console.error("Get Situational Monitoring Error:", error);
    return [];
  }
}

