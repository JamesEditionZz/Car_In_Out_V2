"use client";
import React, { useEffect, useState } from "react";
import "./HeaderCIO.css";
import "bootstrap/dist/css/bootstrap.min.css";
import DailyReport from "./DailyReport/page";
import MonthReport from "./MonthReport/page";
import Bar from "./Dashboard/page";
// import { useSearchParams } from "next/navigation";

export default function HeaderCIO() {
  interface CarDetail {
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

  interface Member {
    Name: string;
    [key: string]: unknown;
  }

  const arraymonth = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  // const searchParams = useSearchParams();
  // const username = searchParams.get("username");
  const username = "";

  const [data, setData] = useState<CarDetail[]>([]);
  const [dataReport, setDataReport] = useState<CarDetail | null>(null);
  const [modelReport, setModelReport] = useState<boolean>(false);
  const [member, setMember] = useState<Member[]>([]);
  const [swiftPage, setSwiftPage] = useState<number>(0);
  const [pageReport, setPageReport] = useState<number>(0);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [subPage, setSubPage] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`../api/GET/Detail_Join_Log`);
      const response = await res.json();
      setData(response);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMember = async () => {
      const res = await fetch(`../api/POST/Member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const response = await res.json();
      setMember(response);
    };

    fetchMember();
  }, []);

  const SubmitApprove = async (Name: string, ID: number) => {
    const res = await fetch(`../api/UPDATE/Update_Detail_Car`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name, ID }),
    });

    if (res.ok) {
      const refreshed = await fetch(`../api/GET/Detail_Car`);
      const response = await refreshed.json();
      setData(response);
    } else {
      console.error("Approve failed");
    }
  };

  const ShowMenu = () => {
    if (showMenu) {
      setShowMenu(false);
    } else {
      setShowMenu(true);
    }
  };

  return (
    <div className="background-CIO">
      <div className="container opacity">
        {/* Modal รายงาน */}
        {modelReport && dataReport && (
          <div className="model" onClick={() => setModelReport(false)}>
            <div
              className="model-content p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="fw-bold">ใบผ่านเข้า-ออกยานพาหนะ</h4>
              <h4 className="fw-bold">ฝ่ายจัดส่งและติดตั้ง</h4>
              <div className="border-bottom mb-2"></div>

              <div className="mt-2 mx-2">
                <span className="fw-bold">วันที่ : </span>
                {dataReport.Out_Time?.split("T")[0] || "-"}
              </div>
              <div className="mt-2 mx-2">
                <span className="fw-bold">รถหมายเลขทะเบียน : </span>
                {dataReport.Car_Registration}
              </div>
              <div className="mt-2 mx-2">
                <span className="fw-bold">ชื่อพนักงานขับรถ : </span>
                {dataReport.Name}
              </div>
              <div className="mt-2 mx-2">
                <span className="fw-bold">เวลารถออกจากโรงงาน : </span>
                {dataReport.Out_Time?.split("T")[0]}{" "}
                {dataReport.Out_Time?.split("T")[1]?.split(".")[0]}
              </div>
              <div className="mt-2 mx-2">
                <span className="fw-bold">เวลารถเข้าโรงงาน : </span>
                {dataReport.In_Time
                  ? `${dataReport.In_Time.split("T")[0]} ${
                      dataReport.In_Time.split("T")[1]?.split(".")[0]
                    }`
                  : "-"}
              </div>
              <div className="mt-4 mx-2">
                <span className="fw-bold">ผู้อนุมัติ : </span>
                {dataReport.UserApprove || "-"}
              </div>
              <div className="text-end">
                <button className="btn btn-danger">Print</button>
              </div>
            </div>
          </div>
        )}
        {showMenu ? (
          <h2
            className="position-absolute cursor-pointer start-0 mx-3 text-white"
            onClick={() => ShowMenu()}
          >
            &times;
          </h2>
        ) : (
          <div className="option-menu" onClick={() => ShowMenu()}>
            <div className="option-1"></div>
            <div className="option-2"></div>
            <div className="option-3"></div>
          </div>
        )}

        <div className="d-flex justify-content-around">
          <div
            className={`fw-bold fs-4 text-white ${
              swiftPage === 0 && "border-bottom border-3"
            }`}
          >
            <span className="cursor-pointer" onClick={() => setSwiftPage(0)}>
              Approve
            </span>
          </div>
          <div
            className={`fw-bold fs-4 text-white ${
              swiftPage === 1 && "border-bottom border-3"
            }`}
          >
            <span className="cursor-pointer" onClick={() => setSwiftPage(1)}>
              สรุป
            </span>
          </div>
        </div>
        {swiftPage === 0 ? (
          <div className="border-data table-container">
            <div className="p-3">
              <table className="border border-white table-bordered w-100">
                <thead>
                  <tr className="text-center">
                    <th className="text-white">โครงการ</th>
                    <th className="text-white">ป้ายทะเบียน</th>
                    <th className="text-white">ผู้ขับ</th>
                    <th className="text-white">รถออกเวลา/ไมค์</th>
                    <th className="text-white">รถเข้าเวลา/ไมค์</th>
                    <th className="text-white">หมายเหตุ</th>
                    <th className="text-white">สถานะ</th>
                    {/* <th className="text-white">รายงาน</th> */}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td className="text-white text-center">{item.Project}</td>
                      <td className="text-center text-white">
                        {item.Car_Registration}
                      </td>
                      <td className="text-center text-white">{item.Name}</td>
                      <td className="text-center text-white">
                        <div>{item.Out_Time?.split("T")[0]}</div>
                        <div>
                          ({item.Number_Mile_Out?.toLocaleString?.() || ""})
                        </div>
                      </td>
                      <td className="text-center text-white">
                        <div>{item.In_Time?.split("T")[0] || ""}</div>
                        <div>
                          {item.Number_Mile_In
                            ? `(${item.Number_Mile_In.toLocaleString()})`
                            : "-"}
                        </div>
                      </td>
                      <td className="text-white">{item.Other || ""}</td>
                      <td className="text-center text-white">
                        {item.Status === 0 ? (
                          <button
                            className="btn btn-warning"
                            onClick={() =>
                              SubmitApprove(member?.[0]?.Name || "", item.ID)
                            }
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-success-new fs-5 fw-bold">
                            Approved
                          </span>
                        )}
                      </td>
                      {/* <td className="text-center">
                      {item.Status === 1 && (
                        <Image
                          src={"/Icon/paper.png"}
                          width={25}
                          height={25}
                          alt="paper"
                          className="cursor-pointer"
                          onClick={() => ReportCar(item.ID)}
                        />
                      )}
                    </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border-dashboard">
            <>
              <div
                className={`${showMenu ? "show-menu-report" : "menu-report"}`}
              >
                <div className={`p-1 mt-2`}>
                  <span
                    className={`cursor-pointer ${subPage === 0 ? "border-bottom border-2" : ""}`}
                    onClick={() => {
                      setPageReport(0), setSubPage(0);
                    }}
                  >
                    Dashboard
                  </span>
                </div>
                <div className={`p-1`}>
                  <span
                    className={`cursor-pointer ${subPage === 1 ? "border-bottom border-2" : ""}`}
                    onClick={() => {
                      setPageReport(1), setSubPage(1);
                    }}
                  >
                    Summarize
                  </span>
                </div>
                <div className={`p-1`}>
                  <span
                    className={`cursor-pointer ${subPage === 2 ? "border-bottom border-2" : ""}`}
                    onClick={() => {
                      setPageReport(2), setSubPage(2);
                    }}
                  >
                    DailyReport
                  </span>
                </div>
                <div className={`p-1`}>
                  <span
                    className={`cursor-pointer ${subPage === 3 ? "border-bottom border-2" : ""}`}
                    onClick={() => {
                      setPageReport(3), setSubPage(3);
                    }}
                  >
                    MonthReport
                  </span>
                </div>
                {pageReport === 3 && (
                  <div className="mt-2 border-2 border-top animation-input">
                    <div className="mt-2 mx-2">
                      <select
                        className="form-select"
                        onChange={(e) => setMonth(e.target.value)}
                      >
                        <option value="0">เดือน</option>
                        {arraymonth.map((item, index) => (
                          <option key={index} value={index + 1}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="p-2">
                      <select
                        className="form-select"
                        onChange={(e) => setYear(e.target.value)}
                      >
                        <option value="0">ปี</option>
                        {[
                          ...new Set(
                            data?.map((item) => item.Out_Time.split("-")[0])
                          ),
                        ].map((year, index) => (
                          <option key={index}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </>
            {pageReport === 0 ? (
              <div>
                <Bar />
              </div>
            ) : pageReport === 1 ? (
              <></>
            ) : pageReport === 2 ? (
              <div>
                <DailyReport />
              </div>
            ) : (
              <div className="w-full-data">
                <MonthReport month={month} year={Number(year)} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
