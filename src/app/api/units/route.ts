import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { unit_name, unit_type, location, coordinates, commander_id, members, logoBase64, logoName } = data;

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

    const [result] = await pool.query(
      'INSERT INTO units (unit_name, unit_type, logo_url, location, coordinates, status, commander_id) VALUES (?, ?, ?, ?, ?, "ACTIVE", ?)',
      [unit_name, unit_type, logoUrl, location, coordinates, commander_id || null]
    );
    
    const unitId = (result as any).insertId;
    
    if (commander_id) {
      await pool.query(
        'UPDATE personnel SET unit_id = ? WHERE id = ?',
        [unitId, commander_id]
      );
    }

    if (members && members.length > 0) {
      for (const m of members) {
        await pool.query(
          'UPDATE personnel SET unit_id = ?, unit_role = ? WHERE id = ?',
          [unitId, m.role, m.id]
        );
      }
    }
    
    return NextResponse.json({ success: true, unitId });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
