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

    console.log(data);

    const result = await pool
      .request()
      .input("Car_Registration", sql.VarChar, data.Car_Registration)
      .input("Mile_Out", sql.Int, data.Mile_Out)
      .query(
        "SELECT * FROM dbo.Detail_Car WHERE Number_Mile_Out = @Mile_Out AND Car_Registration = @Car_Registration"
      );

    const checkresult = result.recordset;

    if (checkresult && checkresult.length > 0) {
      await pool
        .request()
        .input("Project", sql.VarChar, data.value)
        .input("Car_Registration", sql.VarChar, data.Car_Registration)
        .input("Mile_Out", sql.Int, data.Mile_Out)
        .input("Other", sql.VarChar, null)
        .query(
          "Update dbo.Detail_Car SET Project = @Project, Other = @Other WHERE Car_Registration = @Car_Registration AND Number_Mile_Out = @Mile_Out"
        );
    } else {
      const result = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.Car_Registration)
        .input("Mile_Out", sql.Int, data.Mile_Out)
        .query(
          "SELECT * FROM dbo.Detail_Log WHERE Number_Mile_Out = @Mile_Out AND Car_Registration = @Car_Registration"
        );

      console.log(result.recordset);

      if (result.recordset.length > 0) {
        await pool
          .request()
          .input("Car_Registration", sql.VarChar, data.Car_Registration)
          .input("Mile_Out", sql.Int, data.Mile_Out)
          .input("Project", sql.VarChar, data.value)
          .input("Other", sql.VarChar, null)
          .query(
            "Update dbo.Detail_Log SET Project = @Project, Other = @Other WHERE Car_Registration = @Car_Registration AND Number_Mile_Out = @Mile_Out"
          );
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
  }
}
