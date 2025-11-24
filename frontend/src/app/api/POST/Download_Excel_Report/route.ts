import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import ExcelJS from "exceljs";

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

export async function POST(req: NextRequest) {
  let pool: sql.ConnectionPool | undefined;
  try {
    const data = await req.json();

    pool = await sql.connect(config);

    const [year, month] = data.date_report.split("-");

    let result: sql.IResult<any>;

    if (data.type_report == 1) {
      result = await pool
        .request()
        .input("Date", sql.Date, data.date_report)
        .query(
          "SELECT * FROM Detail_Log WHERE CAST(OUT_Time AS DATE) = @Date"
        );
    } else if (data.type_report == 2) {
      result = await pool
        .request()
        .input("Year", sql.Int, parseInt(year))
        .input("Month", sql.Int, parseInt(month))
        .query(
          "SELECT * FROM Detail_Log WHERE MONTH(OUT_Time) = @Month AND YEAR(OUT_Time) = @Year"
        );
    } else {
      result = await pool
        .request()
        .input("Year", sql.Int, data.date_report)
        .query("SELECT * FROM Detail_Log WHERE YEAR(OUT_Time) = @Year");
    }

    const rows = result.recordset;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    worksheet.columns = [
      { header: "ลำดับ", key: "index", width: 10 },
      { header: "โครงการ", key: "Project", width: 100 },
      { header: "ชื่อ", key: "Name", width: 20 },
      { header: "ทะเบียนรถ", key: "CarNo", width: 20 },
      { header: "ออกเวลา", key: "OUT_Time", width: 25 },
      { header: "เลขไมค์ออก", key: "Mile_Out", width: 25 },
      { header: "เข้าเวลา", key: "IN_Time", width: 25 },
      { header: "เลขไมค์เข้า", key: "Mile_In", width: 25 },
      { header: "หมายเหตุ", key: "Other", width: 15 },
      { header: "สถานะ", key: "Status", width: 15 },
      { header: "Approve", key: "Approve", width: 15 },
    ];

    rows.forEach((item: any, i: number) => {
      worksheet.addRow({
        index: i + 1,
        Project: item.Project,
        Name: item.Name,
        CarNo: item.Car_Registration,
        OUT_Time: item.Out_Time,
        Mile_Out: item.Number_Mile_Out,
        IN_Time: item.In_Time,
        Mile_In: item.Number_Mile_In,
        Other: item.Other,
        Status: item.Status,
        Approve: item.Approve,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="report.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Error generating Excel report:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (e) {
        // ignore close errors
      }
    }
  }
}
