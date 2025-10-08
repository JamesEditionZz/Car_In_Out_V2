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

// กำหนด type ให้ data ชัดเจน แทน any
type RecordCarData = {
  date: string;
  time: string;
  carRegister: string;
  numberOut?: number | "";
  numberIn?: number | "";
  namePerson: string;
  Project?: string;
  other?: string;
};

export async function POST(request: NextRequest) {
  const pool = await sql.connect(config);
  const data: RecordCarData = await request.json();

  try {
    const [d, m, y] = data.date.split("/");
    const [hh, mm, ss] = data.time.split(":");

    const year = Number(y) - 543;
    const month = Number(m).toString().padStart(2, "0");
    const day = Number(d).toString().padStart(2, "0");
    const hour = Number(hh).toString().padStart(2, "0");
    const minute = Number(mm).toString().padStart(2, "0");
    const second = Number(ss).toString().padStart(2, "0");

    const thaiTimeWithOffset = `${year}-${month}-${day} ${hour}:${minute}:${second} +07:00`;

    if (data.numberIn != "") {
      const result = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.carRegister)
        .input("In_Time", sql.DateTimeOffset, thaiTimeWithOffset)
        .input("Number_Mile_In", sql.Float, data.numberIn)
        .query(
          "UPDATE Detail_Car SET In_Time = @In_Time, Number_Mile_In = @Number_Mile_In WHERE Car_Registration = @Car_Registration"
        );

      return NextResponse.json({ success: true, action: "IN", result: result.recordset });
    }

    if (data.numberOut != "") {
      const name = data.namePerson.replaceAll(/,\s*/g, "|");

      const CheckCar_Regis = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.carRegister)
        .query(
          "SELECT * FROM Detail_Car WHERE Car_Registration = @Car_Registration AND Number_Mile_In IS NULL"
        );

      if (CheckCar_Regis.recordset.length === 0) {
        const result = await pool
          .request()
          .input("Project", sql.VarChar, data.Project)
          .input("Car_Registration", sql.VarChar, data.carRegister)
          .input("Out_Time", sql.DateTimeOffset, thaiTimeWithOffset)
          .input("Number_Mile_Out", sql.Float, data.numberOut)
          .input("Name", sql.VarChar, name)
          .input("Other", sql.VarChar, data.other)
          .input("Status", sql.Float, 0)
          .query(
            "INSERT INTO Detail_Car (Project, Car_Registration, Out_Time, Number_Mile_Out, Name, Other, Status) VALUES (@Project, @Car_Registration, @Out_Time, @Number_Mile_Out, @Name, @Other, @Status)"
          );

        return NextResponse.json({ success: true, action: "OUT", result: result.recordset });
      }

      return NextResponse.json({ success: false, message: "Car already checked IN without OUT" }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
