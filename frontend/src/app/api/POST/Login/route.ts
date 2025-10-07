import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log(data.username);

  const pool = await sql.connect(config);
  const result = await pool
    .request()
    .input("Username", sql.VarChar, data.username)
    .input("Password", sql.VarChar, data.password)
    .query(
      "SELECT * FROM Member WHERE Username = @Username AND Password = @Password"
    );

  console.log(result.recordset);

  return NextResponse.json(result.recordset);
}
