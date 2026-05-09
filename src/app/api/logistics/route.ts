import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "kpsdata",
};

const pool = mysql.createPool(dbConfig);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      item_name, 
      category, 
      quantity, 
      unit, 
      min_stock_level, 
      condition_status, 
      imageBase64, 
      imageName 
    } = data;

    let imageUrl = null;
    if (imageBase64 && imageName) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${Date.now()}-${imageName.replace(/\s+/g, "_")}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "logistics");
      
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/logistics/${fileName}`;
    }

    const [result] = await pool.query(
      'INSERT INTO logistics (item_name, category, quantity, unit, min_stock_level, condition_status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item_name, category, quantity, unit, min_stock_level, condition_status, imageUrl]
    );
    
    return NextResponse.json({ success: true, itemId: (result as any).insertId });
  } catch (error: any) {
    console.error("Failed to add logistics:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
