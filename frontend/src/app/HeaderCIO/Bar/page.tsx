"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Bar.css";

// ✅ ลงทะเบียน modules ของ Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 🔹 ฟังก์ชันสุ่มสี (rgba)
const getRandomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.6)`;
};

const dataValues = [12, 19, 3, 5, 2, 3, 20, 15, 2, 1, 30, 5];
const randomColors = dataValues.map(() => getRandomColor());

// ✅ ข้อมูลกราฟ
const data = {
  labels: [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฏาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ],
  datasets: [
    {
      label: "รถเข้าออก",
      data: dataValues,
      backgroundColor: randomColors,
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderWidth: 1,
    },
  ],
};

// ✅ การตั้งค่า chart
const options = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" as const },
    title: { display: true, text: "กราฟรถเข้าออก" },
  },
  scales: {
    y: { beginAtZero: true },
  },
};

// ✅ Component หลัก (เพิ่ม onClick)
const BarChart: React.FC = () => {
  interface Data {
    ID: number;
    Project: string;
    Car_Registration: string;
    Name: string;
    Out_Time: string;
    In_Time?: string;
    Number_Mile_Out: number;
    Number_Mile_In?: number;
    Other?: string;
    Status: number;
    UserApprove?: string;
  }

  const [dataDetailCar, setDataDetailCar] = useState<Data[]>();

  useEffect(() => {
    const datafecth = async () => {
      const res = await fetch(`../../api/GET/Detail_Join_Log`);
      const response = await res.json();

      setDataDetailCar(response);
    };

    datafecth();
  }, []);

  return (
    <div className="border-fixed">
      <table>
        <thead>
          <tr>
            <th className="text-center">ทะเบียนรถ</th>
            <th className="text-center">เวลาออก</th>
            <th className="text-center">เวลาเข้า</th>
            <th className="text-center">08:30 AM</th>
            <th className="text-center">09:00 AM</th>
            <th className="text-center">14:00 AM</th>
            <th className="text-center">17:30 AM</th>
            <th className="text-center">เวลาใช้รถ</th>
          </tr>
        </thead>
        <tbody>
          {dataDetailCar?.map((item, index) => (
            <tr key={index} className="border-1 border-bottom">
              <td className="text-center">{item.Car_Registration}</td>
              <td className="text-center">
                <div>{item.Out_Time.split("T")[0]}</div>
                <div>{item.Out_Time.split("T")[1].split(".")[0]}</div>
              </td>
              <td className="text-center">
                {item.In_Time ? (
                  <>
                    <div>{item.In_Time.split("T")[0]}</div>
                    <div>{item.In_Time.split("T")[1].split(".")[0]}</div>
                  </>
                ) : (
                  <></>
                )}
              </td>
              <td className="text-center">
                {(() => {
                  const outtime = item.Out_Time;
                  let hour = Number(outtime.split("T")[1].split(":")[0]) - 8;
                  let minute = Number(outtime.split("T")[1].split(":")[1]) - 30;

                  if (minute < 0) {
                    hour -= 1;
                    minute += 60;
                  }

                  hour = hour < 0 ? hour + 24 : hour;

                  return (
                    <>{hour > 15 ? "ออกก่อน" : `ออกช้า ${hour}:${minute} ชม`}</>
                  );
                })()}
              </td>
              <td className="text-center">
                {(() => {
                  const outtime = item.Out_Time;
                  let hour = Number(outtime.split("T")[1].split(":")[0]) - 9;
                  let minute = Number(outtime.split("T")[1].split(":")[1]);

                  if (minute < 0) {
                    hour -= 1;
                    minute += 60;
                  }

                  hour = hour < 0 ? hour + 24 : hour;

                  return (
                    <>{hour > 14 ? "ออกก่อน" : `ออกช้า ${hour}:${minute} ชม`}</>
                  );
                })()}
              </td>
              <td className="text-center">
                {(() => {
                  const Intime = item.In_Time;
                  let hour = Number(Intime?.split("T")[1].split(":")[0]) - 14;
                  let minute = Number(Intime?.split("T")[1].split(":")[1]);

                  if (minute < 0) {
                    hour -= 1;
                    minute += 60;
                  }

                  return (
                    <>
                      {!isNaN(hour) && (
                        <>{hour >= 0 ? "ปกติ" : "เข้าก่อนเวลา"}</>
                      )}
                    </>
                  );
                })()}
              </td>
              <td className="text-center">
                {(() => {
                  const Intime = item.In_Time;
                  let hour = Number(Intime?.split("T")[1].split(":")[0]) - 17;
                  let minute = Number(Intime?.split("T")[1].split(":")[1]) - 30;

                  if (minute < 0) {
                    hour -= 1;
                    minute += 60;
                  }

                  return (
                    <>
                      {!isNaN(hour) && (
                        <>
                          {hour >= 0
                            ? `เข้าหลังเวลา ${hour}:${minute
                                .toString()
                                .padStart(2, "0")}`
                            : `เข้าก่อนเวลา`}
                        </>
                      )}
                    </>
                  );
                })()}
              </td>
              <td className="text-center">
                {(() => {
                  const Intime = item.In_Time;
                  const Outtime = item.Out_Time;

                  let hour = 0;
                  let minute = 0;
                  let day = 0;

                  if (Intime && Outtime) {
                    const intimeDate = new Date(Intime);
                    const outtimeDate = new Date(Outtime);

                    const diffMs = intimeDate.getTime() - outtimeDate.getTime();
                    hour = Math.floor(diffMs / (1000 * 60 * 60) / 24);
                    minute = Math.floor(
                      (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                    );
                    day = Math.floor(diffMs / (1000 * 60 * 60) / 24);

                    if (minute < 0) {
                      hour -= 1;
                      minute += 60;
                    }
                  }

                  return (
                    <>
                      {Intime && Outtime && !isNaN(hour) && (
                        <>
                          {hour >= 0
                            ? `เวลาใช้รถ ${
                                day > 0 ? `${day} วัน ` : ""
                              }${hour}:${minute.toString().padStart(2, "0")}`
                            : `ข้อมูลเวลาไม่ถูกต้อง`}
                        </>
                      )}
                    </>
                  );
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BarChart;
