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

const filterCarRegistration = async (Car: string) => {
  const pool = await sql.connect(config);

  const filterCar = await pool
    .request()
    .input("Car_Registration", sql.VarChar, `%${Car}%`)
    .query(
      `SELECT * FROM Detail_Oil WHERE Car_Registration LIKE @Car_Registration`
    );

  return filterCar.recordset;
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
          "UPDATE Detail_Car SET In_Time = @In_Time, Number_Mile_In = @Number_Mile_In WHERE Car_Registration = @Car_Registration"
        );

      const updateLog = await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.carRegister)
        .query(
          `SELECT * FROM Detail_Car WHERE Car_Registration = @Car_Registration`
        );

      const responseupdate = updateLog.recordset;

      await pool
        .request()
        .input("Project", sql.VarChar, responseupdate[0].Project)
        .input(
          "Car_Registration",
          sql.VarChar,
          responseupdate[0].Car_Registration
        )
        .input("Out_Time", sql.DateTime, responseupdate[0].Out_Time)
        .input("Number_Mile_Out", sql.Float, responseupdate[0].Number_Mile_Out)
        .input("In_Time", sql.DateTime, responseupdate[0].In_Time)
        .input("Number_Mile_In", sql.Float, responseupdate[0].Number_Mile_In)
        .input("Name", sql.VarChar, responseupdate[0].Name)
        .input("Other", sql.VarChar, responseupdate[0].Other)
        .input("UserApprove", sql.VarChar, responseupdate[0].UserApprove)
        .query(
          `INSERT INTO Detail_Log (Project, Car_Registration, Out_Time, Number_Mile_Out, In_Time, Number_Mile_In, Name, Other, UserApprove)
                VALUES (@Project, @Car_Registration, @Out_Time, @Number_Mile_Out, @In_Time, @Number_Mile_In, @Name, @Other, @UserApprove)`
        );
      const priceOilResponse = await getPriceOil();
      const responsedataOil = await priceOilResponse.json();
      const returnFilter = await filterCarRegistration(
        responseupdate[0].Car_Registration
      );

      let PriceOil = 0;

      if (returnFilter.length > 0 || returnFilter[0]?.Type_Oil === "NGV") {
        PriceOil = Number(responsedataOil.data[5].price);
      } else {
        PriceOil = Number(responsedataOil.data[6].price);
      }

      let TotalMile =
        responseupdate[0].Number_Mile_In - responseupdate[0].Number_Mile_Out;

      await pool
        .request()
        .input(
          "Car_Registration",
          sql.VarChar,
          responseupdate[0].Car_Registration
        )
        .input("Out_Time", sql.DateTime, responseupdate[0].Out_Time)
        .input("Number_Mile_Out", sql.Float, responseupdate[0].Number_Mile_Out)
        .input("In_Time", sql.DateTime, responseupdate[0].In_Time)
        .input("Number_Mile_In", sql.Float, responseupdate[0].Number_Mile_In)
        .input("Name", sql.VarChar, responseupdate[0].Name)
        .input("Price", sql.Float, PriceOil * TotalMile)
        .query(
          `INSERT INTO Report_Detail (Car_Registration, Out_Time, Number_Mile_Out, In_Time, Number_Mile_In, Name, Price)
                VALUES (@Car_Registration, @Out_Time, @Number_Mile_Out, @In_Time, @Number_Mile_In, @Name, @Price)`
        );

      await pool
        .request()
        .input("Car_Registration", sql.VarChar, data.carRegister)
        .query(`DELETE Detail_Car WHERE Car_Registration = @Car_Registration`);

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
        .input("Car_Registration", sql.VarChar, data.carRegister)
        .query(
          "SELECT * FROM Detail_Car WHERE Car_Registration = @Car_Registration AND Number_Mile_In IS NULL"
        );

      if (CheckCar_Regis.recordset.length === 0) {
        const result = await pool
          .request()
          .input("Project", sql.VarChar, data.Project)
          .input("Car_Registration", sql.VarChar, data.carRegister)
          .input("Out_Time", sql.DateTime, thaiDate)
          .input("Number_Mile_Out", sql.Float, data.numberOut)
          .input("Name", sql.VarChar, name)
          .input("Other", sql.VarChar, data.other)
          .input("Status", sql.Float, 0)
          .query(
            "INSERT INTO Detail_Car (Project, Car_Registration, Out_Time, Number_Mile_Out, Name, Other, Status) VALUES (@Project, @Car_Registration, @Out_Time, @Number_Mile_Out, @Name, @Other, @Status)"
          );

        return NextResponse.json({
          success: true,
          action: "OUT",
          result: result.recordset,
        });
      }

      return NextResponse.json(
        { success: false, message: "Car already checked IN without OUT" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid payload" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
