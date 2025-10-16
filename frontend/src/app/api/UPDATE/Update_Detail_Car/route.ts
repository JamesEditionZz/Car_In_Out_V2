import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

const config: sql.config = {
  user: "sa",
  password: "P@55w0rd",
  server: "192.168.199.20",
  database: "dbScan_IN_OUT",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function POST(res: NextRequest) {
  try {
    const data = await res.json();
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("ID", sql.Int, data.ID)
      .input("Name", sql.VarChar, data.Name)
      .query("UPDATE Detail_Car SET UserApprove = @Name, Status = 1 WHERE ID = @ID");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
  }
}
