"use client";
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Bar.css";
import Image from "next/image";

interface CarDetail {
  Project: string;
  Car_Registration: string;
  Name: string;
  Number_Mile_Out: number | null;
  Number_Mile_In: number | null;
  Out_Time: string;
  In_Time: string | null;
  Status: number;
}

export default function Dashboard() {
  const [data, setData] = useState<CarDetail[]>([]);
  const [dataDashboard, setDataDashboard] = useState<CarDetail[]>([]);
  const [model_select_date, setModel_select_date] = useState<boolean>(false);
  const [select_value, setSelect_value] = useState<number>(0);
  const [value_date, setValueDate] = useState<string>("");

  useEffect(() => {
    const datafecth = async () => {
      const res = await fetch(`../../api/GET/Detail_Car`);
      const response = await res.json();

      setDataDashboard(response);
    };
    datafecth();
  }, []);

  useEffect(() => {
    const datafecth = async () => {
      const res = await fetch(`../../api/GET/Detail_Join_Log`);
      const response = await res.json();

      setData(response);
    };
    datafecth();
  }, []);

  const chartData = [
    { month: "ม.ค.", value: 0 },
    { month: "ก.พ.", value: 0 },
    { month: "มี.ค.", value: 0 },
    { month: "เม.ย.", value: 0 },
    { month: "พ.ค.", value: 0 },
    { month: "มิ.ย.", value: 0 },
    { month: "ก.ค.", value: 0 },
    { month: "ส.ค.", value: 0 },
    { month: "ก.ย.", value: 0 },
    { month: "ต.ค.", value: 0 },
    { month: "พ.ย.", value: 0 },
    { month: "ธ.ค.", value: 0 },
  ];

  data.map((item) => {
    const month = new Date(item.Out_Time).getMonth();
    chartData[month].value += 1;
  })

  console.log(chartData);
  

  const CircularProgress = ({
    value,
    color,
  }: {
    value: number;
    color: string;
  }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (value / 400) * circumference;

    return (
      <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="60"
          cy="60"
          r="45"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r="45"
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const timenine = new Date(`${formattedDate}T09:00:00`);

  const valueSelectDate = (value: number) => {
    setSelect_value(value);
  };

  const downloadExcel = async () => {
    const res = await fetch(`../../api/POST/Download_Excel_Report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type_report: select_value,
        date_report: value_date,
      }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `รายงานรถเข้าออก${value_date}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const number_Car_IN = data.filter((item) => {
    const inTime = item.In_Time?.split("T")[1].split(".")[0] || "";
    return inTime <= "14:00:00";
  }).length;

  const number_Car_Out = data.filter((item) => {
    const OutTime = item.Out_Time?.split("T")[1].split(".")[0] || "";
    return OutTime <= "09:00:00";
  }).length;

  const Time_Car_IN = data.filter((item) => {
    const inTime = item.In_Time?.split("T")[1].split(".")[0] || "";
    return inTime <= "17:30:00";
  }).length;

  const Time_Car_Out = data.filter((item) => {
    const OutTime = item.Out_Time?.split("T")[1].split(".")[0] || "";
    return OutTime <= "08:30:00";
  }).length;

  const successValueIn = Time_Car_IN;
  const dangerValueIn = data.length - Time_Car_IN;
  const totalIn = successValueIn + dangerValueIn;

  const successPercentIn = (successValueIn / totalIn) * 100;
  const dangerPercentIn = (dangerValueIn / totalIn) * 100;

  const successValueOut = Time_Car_Out;
  const dangerValueOut = data.length - Time_Car_Out;
  const totalOut = successValueOut + dangerValueOut;

  const successPercentOut = (successValueOut / totalOut) * 100;
  const dangerPercentOut = (dangerValueOut / totalOut) * 100;
  

  return (
    <div className="">
      {model_select_date && (
        <div className="model-download">
          <div className="model-download-content p-4">
            <select
              className="form-select"
              onChange={(e) =>
                valueSelectDate(e.target.value as unknown as number)
              }
            >
              <option className="" hidden>
                เลือกประเภทรายงาน
              </option>
              <option value={1}>รายวัน</option>
              <option value={2}>รายเดือน</option>
              <option value={3}>รายปี</option>
            </select>
            {select_value == 1 && (
              <input
                type="date"
                className="form-control mt-3"
                onChange={(e) => setValueDate(e.target.value)}
              />
            )}
            {select_value == 2 && (
              <input
                type="month"
                className="form-control mt-3"
                onChange={(e) => setValueDate(e.target.value)}
              />
            )}
            {select_value == 3 && (
              <input
                type="number"
                className="form-control mt-3"
                placeholder="ระบุปี เช่น 2025"
                onChange={(e) => setValueDate(e.target.value)}
              />
            )}
            <div className="d-flex justify-content-between gap-2 mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setModel_select_date(false), setSelect_value(0);
                }}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-primary"
                onClick={() => downloadExcel()}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container-fluid p-3 overflow-auto">
        <div className="d-flex justify-content-between align-items-center mb-2 border-2 border-bottom mx-2">
          <h1 className="text-white h4 mb-0">Dashboard</h1>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white h4">รถเข้าออก</span>
            <span
              className="cursor-pointer"
              onClick={() => setModel_select_date(true)}
            >
              <Image
                src={"/Icon/cloud-computing.png"}
                width="30"
                height="30"
                alt="download"
              />
            </span>
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-2">
            <div className="card card-custom p-2">
              <div className="position-relative d-flex align-items-center justify-content-center mt-5 mb-5">
                <CircularProgress
                  value={0 + dataDashboard.length}
                  color="url(#gradient1)"
                />
                <div
                  className="position-absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-white fs-2 fw-bold">
                    {dataDashboard.length}
                  </span>
                </div>
                <svg width="0" height="0">
                  <defs>
                    <linearGradient
                      id="gradient1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="text-center text-white-50 mt-1">รถที่ออก</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card card-custom p-2">
              <div className="position-relative d-flex align-items-center justify-content-center mt-5 mb-5">
                <CircularProgress
                  value={0 + number_Car_Out}
                  color="url(#gradient3)"
                />
                <div
                  className="position-absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-white fs-2 fw-bold">
                    {number_Car_Out}
                  </span>
                </div>
                <svg width="0" height="0">
                  <defs>
                    <linearGradient
                      id="gradient3"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="text-center text-white-50 mt-1">
                ออกก่อน 09.00
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card card-custom p-2">
              <div className="position-relative d-flex align-items-center justify-content-center mt-5 mb-5">
                <CircularProgress
                  value={0 + number_Car_IN}
                  color="url(#gradient3)"
                />
                <div
                  className="position-absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-white fs-2 fw-bold">
                    {number_Car_IN}
                  </span>
                </div>
                <svg width="0" height="0">
                  <defs>
                    <linearGradient
                      id="gradient3"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="text-center text-white-50 mt-1">
                เข้าก่อน 14.00
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card card-custom p-3">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                    label={{ position: "top", fill: "#94a3b8", fontSize: 11 }}
                  />
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-custom p-3 overflow-data-auto">
              <div className="text-center text-white h5">ออกก่อนเวลา 08.30</div>
              <div className="row align-items-end" style={{ height: `3000px` }}>
                <div className="col text-center bar-height">
                  <div
                    className="bar-success mx-auto"
                    style={{
                      height: `${successPercentOut}%`,
                      width: "60%",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #4ade80, #86efac)",
                      border: "1px solid #16a34a",
                      transition: "height 0.3s ease",
                    }}
                  ></div>
                  <div className="mt-2 text-white fw-bold">
                    {successPercentOut.toFixed(0)}%
                  </div>
                </div>

                <div className="col text-center bar-height">
                  <div
                    className="bar-danger mx-auto"
                    style={{
                      height: `${dangerPercentOut}%`,
                      width: "60%",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #ef4444, #fca5a5)",
                      border: "1px solid #b91c1c",
                      transition: "height 0.3s ease",
                    }}
                  ></div>
                  <div className="mt-2 text-white fw-bold">
                    {dangerPercentOut.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-custom p-3 overflow-data-auto">
              <div className="text-center text-white h5">เข้าก่อน 17.30</div>
              <div className="row align-items-end" style={{ height: `3000px` }}>
                <div className="col text-center bar-height">
                  <div
                    className="bar-success mx-auto"
                    style={{
                      height: `${successPercentIn}%`,
                      width: "60%",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #4ade80, #86efac)",
                      border: "1px solid #16a34a",
                      transition: "height 0.3s ease",
                    }}
                  ></div>
                  <div className="mt-2 text-white fw-bold">
                    {successPercentIn.toFixed(0)}%
                  </div>
                </div>

                <div className="col text-center bar-height">
                  <div
                    className="bar-danger mx-auto"
                    style={{
                      height: `${dangerPercentIn}%`,
                      width: "60%",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #ef4444, #fca5a5)",
                      border: "1px solid #b91c1c",
                      transition: "height 0.3s ease",
                    }}
                  ></div>
                  <div className="mt-2 text-white fw-bold">
                    {dangerPercentIn.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card card-custom px-3 pt-2 overflow-data-auto">
              <div className="row border-bottom p-2">
                <div className="col-3 text-white">ชื่อโครงการ</div>
                <div className="col-3 text-white">ทะเบียนรถ</div>
                <div className="col-3 text-white">เวลาออก</div>
                <div className="col-3 text-white">มูลค่า</div>
              </div>
              {dataDashboard.map((item, index) => {
                return (
                  <div
                    className="row border-bottom border-white p-2"
                    key={index}
                  >
                    <div key={index} className="col-3 text-white">
                      {item.Project.length >= 20
                        ? item.Project.slice(0, 20) + `...`
                        : item.Project}
                    </div>
                    <div className="col-3 text-white">
                      {item.Car_Registration}
                    </div>
                    <div className="col-3 text-white">
                      {item.Out_Time.split("T")[1].split(".")[0]}
                    </div>
                    <div className="col-3 text-white">
                      {item.Car_Registration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
