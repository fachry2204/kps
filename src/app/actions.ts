"use server";

import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";

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
    SELECT p.*, u.unit_name 
    FROM personnel p 
    LEFT JOIN units u ON p.unit_id = u.id
    ORDER BY p.id DESC
  `);
  return rows as any[];
}

// 3. Logistics Data
export async function getLogistics() {
  const [rows] = await pool.query('SELECT * FROM logistics ORDER BY item_name ASC');
  return rows as any[];
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

// 6. Units Data
export async function getUnits() {
  const [rows] = await pool.query(`
    SELECT u.*, 
    (SELECT COUNT(*) FROM personnel p WHERE p.unit_id = u.id) as strength,
    p.name as commander_name
    FROM units u
    LEFT JOIN personnel p ON u.id = p.unit_id AND (p.rank LIKE '%Mayor%' OR p.rank LIKE '%Letkol%' OR p.rank LIKE '%Kolonel%')
    GROUP BY u.id
  `);
  return rows as any[];
}

export async function getUnitMembers(unitId: number) {
  const [rows] = await pool.query(`
    SELECT id, name, rank, nrp, specialization, status
    FROM personnel
    WHERE unit_id = ?
    ORDER BY FIELD(rank, 'Kolonel', 'Letkol', 'Mayor', 'Kapten', 'Lettu', 'Letda', 'Peltu', 'Pelda', 'Serma', 'Serka', 'Sertu', 'Serda', 'Kopda', 'Koptu', 'Praka', 'Pratu', 'Prada') ASC, name ASC
  `, [unitId]);
  return rows as any[];
}


interface AddUnitData {
  unit_name: string;
  unit_type: string;
  location: string;
  coordinates: string;
  commander_id?: string;
  logoBase64?: string | null;
  logoName?: string | null;
}

// 7. Add Unit
export async function addUnit(data: AddUnitData) {
  try {
    console.log("Processing addUnit (JSON mode)...");
    const { unit_name, unit_type, location, coordinates, commander_id, logoBase64, logoName } = data;

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
      'INSERT INTO units (unit_name, unit_type, logo_url, location, coordinates, status) VALUES (?, ?, ?, ?, ?, "ACTIVE")',
      [unit_name, unit_type, logoUrl, location, coordinates]
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
    
    return { success: true, unitId };
  } catch (error: any) {
    console.error("Error in addUnit:", error);
    return { success: false, error: error.message };
  }
}
