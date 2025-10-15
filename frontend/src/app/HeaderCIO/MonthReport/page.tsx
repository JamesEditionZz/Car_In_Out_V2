"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MonthReport.css";

// ✅ Component หลัก (เพิ่ม onClick)
interface BarChartProps {
  month: string;
  year: number;
}

const BarChart: React.FC<BarChartProps> = ({ month, year }) => {
  interface Data {
    ID: number;
    Car_Registration: string;
    Name: string;
    Out_Time: string;
    In_Time?: string;
    Number_Mile_Out: number;
    Number_Mile_In?: number;
  }

  const [dataDetailCar, setDataDetailCar] = useState<Data[]>();
  const [defualtData, setDefualtData] = useState<Data[]>();
  const [totalBath, setTotalBath] = useState<number>();
  const [lite, setLite] = useState<number>();
  const [liteRate, setLiteRate] = useState<number>();
  const [average, setAverage] = useState<number>();
  const [result, setResult] = useState<string>();

  useEffect(() => {
    const datafecth = async () => {
      const res = await fetch(`../../api/GET/Detail_Report`);
      const response = await res.json();

      setDataDetailCar(response);
      setDefualtData(response);
    };

    datafecth();
  }, []);

  // useEffect(() => {
  //   if (month !== "0" || year !== 0) {
  //     if (month != "0" && year === 0) {
  //       const data = dataDetailCar?.filter(
  //         (item) => item.Out_Time.split("-")[2] === month
  //       );
  //       setDataDetailCar(data);
  //     } else if (month === "0" && year !== 0) {
  //       const data = dataDetailCar?.filter(
  //         (item) => Number(item.Out_Time.split("T")[0].split("-")[2]) === year
  //       );
  //       setDataDetailCar(data);
  //     } else {
  //       const data = dataDetailCar?.filter(
  //         (item) =>
  //           item.Out_Time.split("-")[2] === month &&
  //           Number(item.Out_Time.split("T")[0].split("-")[2]) === year
  //       );
  //       setDataDetailCar(data);
  //     }
  //   }
  // }, []);

  // console.log(dataDetailCar);

  return (
    <div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th rowSpan={2} className="text-center align-content-center">
              ลำดับ
            </th>
            <th rowSpan={2} className="text-center align-content-center">
              ทะเบียนรถ
            </th>
            <th rowSpan={2} className="text-center align-content-center">
              ชื่อพนักงาน
            </th>
            <th className="text-center">ไมค์ออก</th>
            <th className="text-center">ไมค์เข้า</th>
            <th className="text-center">จำนวนกม.</th>
            <th className="text-center">รวมเงิน/บาท</th>
            <th className="text-center">จำนวนลิตร</th>
            <th className="text-center">อัตราสิ้นเปลือง</th>
            <th className="text-center">เกณฑ์เฉลี่ย</th>
            <th className="text-center">ผลการ</th>
          </tr>
          <tr>
            <th className="text-center">วันที่ </th>
            <th className="text-center">วันที่</th>
            <th className="text-center">ที่วิ่ง</th>
            <th className="text-center">บาท</th>
            <th className="text-center">รวม</th>
            <th className="text-center">กม/ลิตร เฉลี่ย</th>
            <th className="text-center">ใช้จริง</th>
            <th className="text-center">ประเมิน</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            if (!dataDetailCar || dataDetailCar.length === 0) return null; // ⛔ ถ้ายังไม่มีข้อมูล ไม่ต้อง render

            const grouped = dataDetailCar.reduce((acc, item) => {
              if (!acc[item.Car_Registration]) {
                acc[item.Car_Registration] = [];
              }
              acc[item.Car_Registration].push(item);
              return acc;
            }, {});

            const groupedArray = Object.entries(grouped);

            return groupedArray.map(([car, items], groupIndex) => (
              <React.Fragment key={groupIndex}>
                {items.map((item, i) => (
                  <tr key={`${car}-${i}`} className="border-b">
                    {/* ✅ ลำดับ */}
                    {i === 0 ? (
                      <td
                        rowSpan={items.length}
                        className="text-center align-top font-bold border p-1"
                      >
                        {groupIndex + 1}
                      </td>
                    ) : null}

                    {/* ✅ ทะเบียนรถ */}
                    {i === 0 ? (
                      <td
                        rowSpan={items.length}
                        className="text-center align-top font-bold border p-1"
                      >
                        {car}
                      </td>
                    ) : null}

                    {/* ✅ ชื่อคนขับ */}
                    {i === 0 ? (
                      <td
                        rowSpan={items.length}
                        className="text-center align-top border p-1"
                      >
                        {item?.Name ?? "-"}
                      </td>
                    ) : null}

                    {/* ✅ รายละเอียดระยะทาง */}
                    <td className="text-center border p-1">
                      <div>{item?.Out_Time.split("T")[0] ?? "-"}</div>
                      <div>{item?.Out_Time.split("T")[1].split(".")[0] ?? "-"}</div>
                      <div>{`(${item?.Number_Mile_Out ?? "-"})`}</div>
                    </td>
                    <td className="text-center border p-1">
                      <div>{item?.In_Time.split("T")[0] ?? "-"}</div>
                      <div>{item?.In_Time.split("T")[1].split(".")[0] ?? "-"}</div>
                      <div>{`(${item?.Number_Mile_In ?? "-"})`}</div>
                    </td>
                    <td className="text-center border p-1">
                      {item?.Number_Mile_In
                        ? Number(item.Number_Mile_In) -
                          Number(item.Number_Mile_Out)
                        : "-"}
                    </td>

                    {/* ✅ Input เต็มกรอบ */}
                    {["totalBath", "lite", "liteRate", "average", "result"].map(
                      (field, idx) => (
                        <td key={idx} className="p-0 border">
                          <input
                            type="text"
                            className="form-control border-0 rounded-0 w-100 h-100"
                            onChange={(e) => {
                              const val = e.target.value;
                              if (field === "totalBath") setTotalBath(val);
                              else if (field === "lite") setLite(val);
                              else if (field === "liteRate") setLiteRate(val);
                              else if (field === "average") setAverage(val);
                              else if (field === "result") setResult(val);
                            }}
                          />
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ));
          })()}
        </tbody>
      </table>
    </div>
  );
};

export default BarChart;
