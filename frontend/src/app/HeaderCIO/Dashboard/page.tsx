import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Menu } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Bar.css";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const datafecth = async () => {
      const res = await fetch(`../../api/GET/Detail_Car`);
      const response = await res.json();

      setData(response);
    };
    datafecth();
  }, []);

  const chartData = [
    { month: "Jan", value: 45 },
    { month: "Feb", value: 52 },
    { month: "Mar", value: 38 },
    { month: "Apr", value: 65 },
    { month: "May", value: 58 },
    { month: "Jun", value: 70 },
    { month: "Jul", value: 48 },
    { month: "Aug", value: 62 },
    { month: "Sep", value: 55 },
    { month: "Oct", value: 68 },
    { month: "Nov", value: 45 },
    { month: "Dec", value: 52 },
  ];

  const CircularProgress = ({ value, color }) => {
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

  return (
    <div className="">
      <div className="container-fluid p-3 overflow-auto">
        <div className="d-flex justify-content-between align-items-center mb-2 border-2 border-bottom mx-2">
          <h1 className="text-white h4 mb-0">Dashboard</h1>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white h4">รถเข้าออก</span>
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-2">
            <div className="card card-custom p-2">
              <div className="position-relative d-flex align-items-center justify-content-center mt-5 mb-5">
                <CircularProgress value={10} color="url(#gradient1)" />
                <div
                  className="position-absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-white fs-2 fw-bold">10</span>
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
              <div className="text-center text-white-50 small mt-1">Day</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card card-custom p-2">
              <div className="position-relative d-flex align-items-center justify-content-center mt-5 mb-5">
                <CircularProgress value={197} color="url(#gradient2)" />
                <div
                  className="position-absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-white fs-2 fw-bold">57</span>
                </div>
                <svg width="0" height="0">
                  <defs>
                    <linearGradient
                      id="gradient2"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="text-center text-white-50 small mt-1">Week</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card card-custom p-2">
              <div className="position-relative d-flex align-items-center justify-content-center mt-5 mb-5">
                <CircularProgress value={352} color="url(#gradient3)" />
                <div
                  className="position-absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-white fs-2 fw-bold">352</span>
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
              <div className="text-center text-white-50 small mt-1">Month</div>
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
            <div className="card card-custom p-3 overflow-data-auto"></div>
          </div>
          <div className="col-md-3">
            <div className="card card-custom p-3 overflow-data-auto">
              
            </div>
          </div>
          <div className="col-md-6">
            <div className="card card-custom px-3 pt-2 overflow-data-auto">
              <div className="row border-bottom p-2">
                <div className="col-4 text-white">ชื่อโครงการ</div>
                <div className="col-4 text-white">ทะเบียนรถ</div>
                <div className="col-4 text-white">มูลค่า</div>
              </div>
              {data.map((item: any, index: number) => (
                <div className="row border-bottom border-1 border-white p-2" key={index}>
                  <div key={index} className="col-4 text-white">
                    {item.Project}
                  </div>
                  <div className="col-4 text-white">
                    {item.Car_Registration}
                  </div>
                  <div className="col-4 text-white">
                    {item.Car_Registration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
