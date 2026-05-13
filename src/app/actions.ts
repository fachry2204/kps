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
    personnel: (personnelCount as any)[0].total,
    units: (unitCount as any)[0].total,
    operations: (activeOps as any)[0].total,
    intel: (intelReports as any)[0].total,
    logisticsAlert: (lowStock as any)[0].total,
    unitDistribution: unitDist as any[]
  };
}

// 2. Personnel Data
export async function getPersonnel() {
  const [rows] = await pool.query(`
    SELECT p.*, u.unit_name,
    (SELECT u2.unit_name FROM units u2 WHERE u2.commander_id = p.id LIMIT 1) as commanded_unit_name
    FROM personnel p 
    LEFT JOIN units u ON p.unit_id = u.id
    ORDER BY p.id DESC
  `);
  return rows as any[];
}

export async function getPersonnelById(id: number) {
  if (isNaN(id)) return null;
  const [rows] = await pool.query(`
    SELECT p.*, u.unit_name 
    FROM personnel p 
    LEFT JOIN units u ON p.unit_id = u.id
    WHERE p.id = ?
    LIMIT 1
  `, [id]);
  const personnel = rows as any[];
  return personnel.length > 0 ? personnel[0] : null;
}

export async function getPersonnelUnitHistory(id: number) {
  if (isNaN(id)) return [];
  const [rows] = await pool.query(`
    SELECT h.*, u.unit_name, u.unit_type
    FROM personnel_unit_history h
    JOIN units u ON h.unit_id = u.id
    WHERE h.personnel_id = ?
    ORDER BY h.start_date DESC
  `, [id]);
  return rows as any[];
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

// 3. Logistics Data
export async function getLogistics() {
  const [rows] = await pool.query('SELECT l.*, u.unit_name, u.location as unit_location FROM logistics l LEFT JOIN units u ON l.unit_id = u.id ORDER BY l.item_name ASC');
  return rows as any[];
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
  const [rows] = await pool.query('SELECT * FROM operations ORDER BY start_date DESC');
  return rows as any[];
}

// 5. Intel Reports
export async function getIntelReports() {
  const [rows] = await pool.query('SELECT * FROM intel_reports ORDER BY created_at DESC');
  return rows as any[];
}

export async function addIntelReport(data: any) {
  try {
    const { title, threat_level, content, location_tag, coordinates, is_classified } = data;
    const [result]: any = await pool.query(
      'INSERT INTO intel_reports (title, threat_level, content, location_tag, coordinates, is_classified) VALUES (?, ?, ?, ?, ?, ?)',
      [title, threat_level, content, location_tag, coordinates, is_classified ? 1 : 0]
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
    const { title, threat_level, content, location_tag, coordinates, is_classified } = data;
    await pool.query(
      'UPDATE intel_reports SET title = ?, threat_level = ?, content = ?, location_tag = ?, coordinates = ?, is_classified = ? WHERE id = ?',
      [title, threat_level, content, location_tag, coordinates, is_classified ? 1 : 0, id]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 6. Units Data
export async function getUnits() {
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
  const [rows] = await pool.query(`
    SELECT p.id, p.name, p.rank, p.nrp, p.specialization, p.status, p.unit_role
    FROM personnel p
    LEFT JOIN units u ON u.id = ?
    WHERE p.unit_id = ? AND (u.commander_id IS NULL OR p.id != u.commander_id)
    ORDER BY FIELD(p.rank, 'Kolonel', 'Letkol', 'Mayor', 'Kapten', 'Lettu', 'Letda', 'Peltu', 'Pelda', 'Serma', 'Serka', 'Sertu', 'Serda', 'Kopda', 'Koptu', 'Praka', 'Pratu', 'Prada') ASC, p.name ASC
  `, [unitId, unitId]);
  return rows as any[];
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
  const [rows] = await pool.query(`
    SELECT o.*, 
           (SELECT COUNT(*) FROM personnel_ops_assignments WHERE op_id = o.id AND op_type = 'DALAM_NEGERI') as actual_personnel
    FROM ops_dalamnegri o
    ORDER BY o.id ASC
  `);
  return rows as any[];
}

export async function getOpsLuarNegeri() {
  const [rows] = await pool.query(`
    SELECT o.*, 
           (SELECT COUNT(*) FROM personnel_ops_assignments WHERE op_id = o.id AND op_type = 'LUAR_NEGERI') as actual_personnel
    FROM ops_luarnegri o
    ORDER BY o.id ASC
  `);
  return rows as any[];
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
  try {
    await pool.query('DELETE FROM ops_dalamnegri WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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
  try {
    await pool.query('DELETE FROM ops_luarnegri WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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
    SELECT a.role, p.id, p.name, p.rank, p.nrp, p.specialization, p.photo_url
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
export async function getChatContacts(currentUserId: number) {
  const [rows] = await pool.query(`
    SELECT p.id, p.name, p.rank, p.photo_url,
      (SELECT message_text FROM messages WHERE (sender_id = p.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = p.id) ORDER BY created_at DESC LIMIT 1) as lastMessage,
      (SELECT created_at FROM messages WHERE (sender_id = p.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = p.id) ORDER BY created_at DESC LIMIT 1) as time,
      (SELECT COUNT(*) FROM messages WHERE sender_id = p.id AND receiver_id = ? AND status != 'read') as unread
    FROM personnel p
    WHERE p.id != ?
    ORDER BY time DESC, p.name ASC
  `, [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId]);
  
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

// 16. Logistics System


