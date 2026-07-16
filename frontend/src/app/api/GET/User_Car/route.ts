import { NextResponse } from "next/server";
import sql from "mssql";

const config: sql.config = {
  user: "sa",
  password: "P@55w0rd",
  server: "192.168.199.20",
  database: "dbScan_IN_OUT",
  options: {
    encrypt: true, // ต้องเปิดถ้ามีการบังคับใช้ SSL
    trustServerCertificate: true, // ✅ ตัวนี้คือคำตอบของ error ที่คุณเจอ
  },
};

export async function GET() {
  const pool = await sql.connect(config);
  const result = await pool.request().query("SELECT * FROM dbo.User_Car");

  return NextResponse.json(result.recordset); // ✅ ส่งเฉพาะข้อมูล
}
