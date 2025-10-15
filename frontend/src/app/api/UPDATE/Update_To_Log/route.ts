import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const pool = await sql.connect(config);

    const dateToday = new Date();

    const result = await pool
      .request()
      .input("Timeupdate", sql.DateTime, dateToday)
      .query("SELECT * FROM Detail_Car WHERE In_Time < @Timeupdate");

    const result2 = await pool
      .request()
      .input("Timeupdate", sql.DateTime, dateToday)
      .query("SELECT * FROM Detail_Log");

    for (const row of result2.recordset) {
      const inTime = new Date(row.In_Time); // แปลงเวลาเป็น Date object
      const inMonth = inTime.getMonth() + 1; // เดือนจะเริ่มที่ 0, จึงต้อง +1
      const currentMonth = dateToday.getMonth() + 1;

      const result2 = await pool
        .request()
        .input("Timeupdate", sql.DateTime, dateToday)
        .query(`SELECT * FROM Report_Detail WHERE Car_Registration = ${row.Car_Registration} AND Out_Time = ${row.Out_Time}`);

      if (currentMonth === 1) {
        await pool
          .request()
          .input("ID", sql.Int, row.ID)
          .input("Car_Registration", sql.VarChar, row.Car_Registration)
          .input("Out_Time", sql.DateTime, row.Out_Time)
          .input("Number_Mile_Out", sql.Float, row.Number_Mile_Out)
          .input("In_Time", sql.DateTime, row.In_Time)
          .input("Number_Mile_In", sql.Float, row.Number_Mile_In)
          .input("Name", sql.VarChar, row.Name)
          .query(
            `INSERT INTO Report_Detail (Car_Registration, Out_Time, Number_Mile_Out, In_Time, Number_Mile_In, Name) 
          VALUES (@Car_Registration, @Out_Time, @Number_Mile_Out, @In_Time, @Number_Mile_In, @Name)`
          );
      } else if (inMonth < currentMonth) {
        console.log(row);
      }
    }

    for (const row of result.recordset) {
      await pool
        .request()
        .input("ID", sql.Int, row.ID)
        .input("Project", sql.VarChar, row.Project)
        .input("Car_Registration", sql.VarChar, row.Car_Registration)
        .input("Out_Time", sql.DateTime, row.Out_Time)
        .input("Number_Mile_Out", sql.Float, row.Number_Mile_Out)
        .input("In_Time", sql.DateTime, row.In_Time)
        .input("Number_Mile_In", sql.Float, row.Number_Mile_In)
        .input("Name", sql.VarChar, row.Name)
        .input("Other", sql.VarChar, row.Other)
        .input("UserApprove", sql.VarChar, row.UserApprove)
        .query(
          `INSERT INTO Detail_Log (Project, Car_Registration, Out_Time, Number_Mile_Out, In_Time, Number_Mile_In, Name, Other, UserApprove) 
          VALUES (@Project, @Car_Registration, @Out_Time, @Number_Mile_Out, @In_Time, @Number_Mile_In, @Name, @Other, @UserApprove)`
        );

      await pool
        .request()
        .input("ID", sql.Int, row.ID)
        .query(`DELETE Detail_Car WHERE ID = @ID`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
  }
}
