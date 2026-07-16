import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

const config: sql.config = {
  user: "sa",
  password: "P@55w0rd",
  server: "192.168.199.20",
  database: "PTKDB",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function POST(request: NextRequest) {
  const pool = await sql.connect(config);
  const data = await request.json();

  try {
    const filterCar = await pool
      .request()
      .input("SONumber", sql.VarChar, `%${data}%`)
      .query(`SELECT * FROM PTKDB.dbo.hPrintRequest WHERE DocNo LIKE @SONumber`);

    return NextResponse.json(filterCar.recordset, { status: 200 });
  } catch (error) {
    console.error(error);
  }
}
