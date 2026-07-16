import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { GET as getPriceOil } from "@/app/api/GET/Price_Oil/route";

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
    const newDate = new Date();
    const thaiDate = new Date(newDate.getTime() + 7 * 60 * 60 * 1000);

    if (data.numberIn != "") {
      const result = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.carRegister)
        .input("In_Time", sql.DateTime, thaiDate)
        .input("Number_Mile_In", sql.Float, data.numberIn)
        .query(
          "UPDATE dbo.Detail_Car SET In_Time = @In_Time, Number_Mile_In = @Number_Mile_In WHERE Car_Registration = @Car_Registration",
        );

        console.log(result);
        

      const updateLog = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.carRegister)
        .input("Number_Mile_Out", sql.Float, data.numberOut)
        .query(
          `SELECT * FROM dbo.Detail_Car WHERE Car_Registration = @Car_Registration AND Number_Mile_Out = @Number_Mile_Out`,
        );

      const responseupdate = updateLog.recordset;

      console.log(responseupdate);

      if (responseupdate.length > 0) {
        await pool
          .request()
          .input("Project", sql.VarChar, responseupdate[0].Project)
          .input(
            "Car_Registration",
            sql.VarChar,
            responseupdate[0].Car_Registration,
          )
          .input("Out_Time", sql.DateTime, responseupdate[0].Out_Time)
          .input(
            "Number_Mile_Out",
            sql.Float,
            responseupdate[0].Number_Mile_Out,
          )
          .input("In_Time", sql.DateTime, responseupdate[0].In_Time)
          .input("Number_Mile_In", sql.Float, responseupdate[0].Number_Mile_In)
          .input("Name", sql.VarChar, responseupdate[0].Name)
          .input("Other", sql.VarChar, responseupdate[0].Other)
          .input("UserApprove", sql.VarChar, responseupdate[0].UserApprove)
          .input("Number_User", sql.Float, responseupdate[0].Number_User)
          .query(
            `INSERT INTO dbo.Detail_Log (Project, Car_Registration, Out_Time, Number_Mile_Out, In_Time, Number_Mile_In, Name, Other, UserApprove, Number_User)
                VALUES (@Project, @Car_Registration, @Out_Time, @Number_Mile_Out, @In_Time, @Number_Mile_In, @Name, @Other, @UserApprove, @Number_User)`,
          );

        await pool
          .request()
          .input("Car_Registration", sql.VarChar, data.carRegister)
          .input("Number_Mile_Out", sql.Float, data.numberOut)
          .query(
            `DELETE Detail_Car WHERE Car_Registration = @Car_Registration AND Number_Mile_Out = @Number_Mile_Out`,
          );
      }

      return NextResponse.json({
        success: true,
        action: "IN",
        result: result.recordset,
      });
    }

    if (data.numberOut != "") {
      const name = data.namePerson.replaceAll(/,\s*/g, "|");

      const CheckCar_Regis = await pool
        .request()
        .input("Car_Registration", sql.VarChar, `%${data.carRegister}%`)
        .query(
          "SELECT * FROM dbo.Detail_Car WHERE Car_Registration LIKE @Car_Registration AND Number_Mile_In IS NULL",
        );

      const CheckUser = await pool
        .request()
        .input("Number_ID", sql.VarChar, name)
        .query("SELECT * FROM dbo.User_Car WHERE Number_ID = @Number_ID");

      const response = CheckUser.recordset;

      const CheckCar = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.carRegister)
        .query(
          "SELECT * FROM dbo.TRegis_Car WHERE Name_Car = @Car_Registration",
        );

      const responseCar = CheckCar.recordset;

      if (CheckCar_Regis.recordset.length === 0) {
        const result = await pool
          .request()
          .input("Project", sql.VarChar, data.Project)
          .input("Car_Registration", sql.VarChar, data.carRegister)
          .input("Out_Time", sql.DateTime, thaiDate)
          .input("Number_Mile_Out", sql.Float, data.numberOut)
          .input("Name", sql.VarChar, response[0].Username)
          .input("Other", sql.VarChar, data.other)
          .input("Status", sql.Float, 0)
          .input("Number_User", sql.Float, response[0].Number_ID)
          .input("User_Approve", sql.VarChar, responseCar[0].User_Approve)
          .query(
            `INSERT INTO dbo.Detail_Car (Project, Car_Registration, Out_Time, Number_Mile_Out, Name, Other, UserApprove, Status, Number_User) 
            VALUES (@Project, @Car_Registration, @Out_Time, @Number_Mile_Out, @Name, @Other, @User_Approve, @Status, @Number_User)`,
          );

        return NextResponse.json({
          success: true,
          action: "OUT",
          result: result.recordset,
        });
      }

      return NextResponse.json(
        { success: false, message: "Car already checked IN without OUT" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid payload" },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
