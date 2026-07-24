
import { NextResponse } from 'next/server';
import { Pool } from 'pg';


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

export async function GET() {
  try {
    const client = await pool.connect();
    
   
    const result = await client.query(`
      SELECT p.*, u.name as seller_name, sp.profile_image 
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN seller_profiles sp ON u.id = sp.seller_id
    `);
    
    client.release();
    
    // Return the data as JSON
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}