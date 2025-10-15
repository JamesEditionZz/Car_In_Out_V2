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

  const updateresult = await pool.request().query(`SELECT * FROM Detail_Log`);

  const updateresponse = updateresult.recordset;

  for (const row of updateresponse) {
    const Checkupdate = await pool
      .request()
      .input(`Out_Time`, sql.DateTime, row.Out_Time)
      .input(`In_Time`, sql.DateTime, row.In_Time)
      .query(
        `SELECT * FROM Report_Detail WHERE Out_Time = @Out_Time AND In_Time = @In_Time`
      );

    if (Checkupdate.recordset.length === 0) {
      await pool
        .request()
        .input(`Car_Registration`, sql.VarChar, row.Car_Registration)
        .input(`Out_Time`, sql.DateTime, row.Out_Time)
        .input(`Number_Mile_Out`, sql.Int, row.Number_Mile_Out)
        .input(`In_Time`, sql.DateTime, row.In_Time)
        .input(`Number_Mile_In`, sql.Int, row.Number_Mile_In)
        .input(`Name`, sql.VarChar, row.Name)
        .query(
          `INSERT INTO Report_Detail (Car_Registration, Out_Time, Number_Mile_Out, In_Time, Number_Mile_In, Name) VALUES (@Car_Registration, @Out_Time, @Number_Mile_Out, @In_Time, @Number_Mile_In, @Name)`
        );
    }
  }

  const result = await pool.request().query(`SELECT * FROM Report_Detail`);

  return NextResponse.json(result.recordset); // ✅ ส่งเฉพาะข้อมูล
}
