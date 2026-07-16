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
      .input("Car_Registration", sql.VarChar, data.car)
      .input("outDate", sql.VarChar, data.out_time)
      .input("Name", sql.VarChar, data.name)
      .input("MileOut", sql.Int, data.MileOut)
      .query(
        `SELECT *
          FROM Detail_Car
          WHERE Car_Registration = @Car_Registration
          AND CAST(Out_Time AS DATE) = @outDate
          AND Name = @Name`,
      );

    if (result?.recordset?.length > 0) {
      const respose = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.car)
        .input("outDate", sql.VarChar, data.out_time)
        .input("Name", sql.VarChar, data.name)
        .input("MileOut", sql.Int, data.MileOut)
        .query(
          "Update Detail_Car SET Number_Mile_Out = @MileOut WHERE Car_Registration = @Car_Registration AND CAST(Out_Time AS DATE) = @outDate AND Name = @Name",
          // "SELECT * FROM Detail_Car WHERE Car_Registration = @Car_Registration AND Out_Time = @out_time AND Name = @Name",
        );

        console.log(respose);
        
    } else {
      const respose = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.car)
        .input("out_time", sql.VarChar, data.out_time)
        .input("Name", sql.VarChar, data.name)
        .input("MileOut", sql.Int, data.MileOut)
        .query(
          "Update Detail_Log SET Number_Mile_Out = @MileOut WHERE Car_Registration = @Car_Registration AND Out_Time = @out_time AND Name = @Name",
        );

      console.log(respose, "log");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
  }
}
