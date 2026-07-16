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
      .input("Car_Registration", sql.VarChar, data.Car_Registration)
      .input("Mile_Out", sql.Int, data.Mile_Out)
      .query(
        `SELECT * FROM dbo.Detail_Car WHERE Number_Mile_Out = @Mile_Out AND Car_Registration = @Car_Registration`
      );

    const checkresult = result.recordset;

    if (checkresult.length > 0) {
      const New_NameProject =
        checkresult[0].Project.trim() + " | " + data.Project.trim();

      await pool
        .request()
        .input("ID", sql.Int, data.ID)
        .input("New_NameProject", sql.VarChar, New_NameProject)
        .query(
          `Update dbo.Detail_Car SET Project = @New_NameProject WHERE ID = @ID`
        );
    } else {
      const result = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.Car_Registration)
        .input("Mile_Out", sql.Int, data.Mile_Out)
        .query(
          `SELECT * FROM dbo.Detail_Log WHERE Number_Mile_Out = @Mile_Out AND Car_Registration = @Car_Registration`
        );

      const checkresult = result.recordset;

      const New_NameProject =
        checkresult[0].Project.trim() + " | " + data.Project.trim();

      await pool
        .request()
        .input("ID", sql.Int, data.ID)
        .input("New_NameProject", sql.VarChar, New_NameProject)
        .query(
          `Update dbo.Detail_Log SET Project = @New_NameProject WHERE ID = @ID`
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
  }
}
