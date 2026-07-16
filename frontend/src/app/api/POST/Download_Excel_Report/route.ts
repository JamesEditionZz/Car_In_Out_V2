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

interface DetailLog {
  Project: string;
  Name: string;
  Car_Registration: string;
  Out_Time: string | Date;
  Number_Mile_Out: number | null;
  In_Time: string | Date;
  Number_Mile_In: number | null;
  Other: string | null;
  Status: string;
  Approve: string | null;
}

export async function POST(req: NextRequest) {
  let pool: sql.ConnectionPool | undefined;
  try {
    const data = await req.json();

    pool = await sql.connect(config);
    let result: sql.IResult<DetailLog>;

    if (data.type_report == 1) {
      // ตั้งให้เป็น StartDate: 00:00:00 และ EndDate: 23:59:59.999 เพื่อใช้ BETWEEN ได้เต็มประสิทธิภาพ
      const startDate = new Date(`${data.date_report1}T00:00:00`);
      const endDate = new Date(`${data.date_report2}T23:59:59.999`);

      result = await pool
        .request()
        .input("StartDate", sql.DateTime, startDate)
        .input("EndDate", sql.DateTime, endDate)
        .query(
          `SELECT * FROM dbo.Detail_Car WHERE OUT_Time BETWEEN @StartDate AND @EndDate
           UNION ALL
           SELECT * FROM dbo.Detail_Log WHERE OUT_Time BETWEEN @StartDate AND @EndDate`,
        );
        
    } else if (data.type_report == 2) {
    const [year, month] = data.date_report1.split("-");

      result = await pool
        .request()
        .input("Year", sql.Int, parseInt(year))
        .input("Month", sql.Int, parseInt(month))
        .query(
          `SELECT * FROM dbo.Detail_Log WHERE MONTH(OUT_Time) = @Month AND YEAR(OUT_Time) = @Year
           UNION ALL
           SELECT * FROM dbo.Detail_Car WHERE MONTH(OUT_Time) = @Month AND YEAR(OUT_Time) = @Year
          `
        );
    } else {
      result = await pool
        .request()
        .input("Year", sql.Int, data.date_report1)
        .query(`
          SELECT * FROM dbo.Detail_Log WHERE YEAR(OUT_Time) = @Year
           UNION ALL
          SELECT * FROM dbo.Detail_Car WHERE YEAR(OUT_Time) = @Year
          `);
    }

    const rows = result.recordset;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    worksheet.columns = [
      { header: "ลำดับ", key: "index", width: 10 },
      { header: "โครงการ", key: "Project", width: 100 },
      { header: "ชื่อ", key: "Name", width: 20 },
      { header: "ทะเบียนรถ", key: "CarNo", width: 20 },
      { header: "วันที่ออก", key: "OUT_Date", width: 20 },
      { header: "เวลาออก", key: "OUT_Time", width: 25 },
      { header: "เลขไมค์ออก", key: "Mile_Out", width: 25 },
      { header: "วันที่เข้า", key: "IN_Date", width: 25 },
      { header: "เวลาเข้า", key: "IN_Time", width: 25 },
      { header: "เลขไมค์เข้า", key: "Mile_In", width: 25 },
      { header: "หมายเหตุ", key: "Other", width: 15 },
      { header: "สถานะ", key: "Status", width: 15 },
      { header: "Approve", key: "Approve", width: 15 },
    ];

    rows.forEach((item, i) => {
      worksheet.addRow({
        index: i + 1,
        Project: item.Project,
        Name: item.Name,
        CarNo: item.Car_Registration,
        OUT_Date: item.Out_Time,
        OUT_Time: String(item.Out_Time).split(" ")[4],
        Mile_Out: item.Number_Mile_Out,
        IN_Date: item.In_Time,
        IN_Time: String(item.In_Time).split(" ")[4],
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
      } catch {
        // ignore close errors
      }
    }
  }
}
