"use client";
import React, { useEffect, useState } from "react";
import "./HeaderCIO.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function page() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [data, setData] = useState<[]>([]);
  const [dataReport, setDataReport] = useState<[]>([]);
  const [modelReport, setModelReport] = useState<boolean>(false);
  const [member, setMember] = useState<[]>([]);

  useEffect(() => {
    const datafecth = async () => {
      const res = await fetch(`../api/GET/Detail_Car`);
      const response = await res.json();
      setData(response);
    };

    datafecth();

    const interval = setInterval(() => {
      datafecth();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const datafecth = async () => {
      const res = await fetch(`../api/POST/Member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
        }),
      });
      const response = await res.json();

      setMember(response);
    };

    datafecth();
  }, []);

  const ReportCar = (value: number) => {
    const res = data.find((item) => (item.ID === value));

    console.log(res);
    

    setDataReport(res);
    setModelReport(true);
  };

  const SubmitApprove = async (Name: string, ID: number) => {
    const res = await fetch(`../api/UPDATE/Update_Detail_Car`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Name: Name,
        ID: ID,
      }),
    });

    if (res.ok) {
      const res = await fetch(`../api/GET/Detail_Car`);
      const response = await res.json();

      setData(response);
    } else {
      console.log("error");
    }
  };

  return (
    <div className="background-CIO">
      <div className="container">
        {modelReport && (
          <div className="model" onClick={() => setModelReport(false)}>
            <div
              className="model-content p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h4 className="fw-bold">ใบผ่านเข้า-ออกยายพาหนะ</h4>
              </div>
              <div>
                <h4 className="fw-bold">ฝ่ายจัดส่งและติดตั้ง</h4>
              </div>
              <h4 className="fw-bold"> </h4>
              <div className="border-bottom"></div>
              <div className="mt-2 mx-2">
                <span className="fw-bold">วันที่ : </span>
                {dataReport.Out_Time.split("T")[0].split("Z")[0]}
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
                {dataReport.Out_Time.split("T")[0]}{" "}
                {dataReport.Out_Time.split("T")[1].split(".")[0]}
              </div>
              <div className="mt-2 mx-2">
                <span className="fw-bold">เวลารถเข้าโรงงาน : </span>
                {dataReport.In_Time?.split("T")[0].split("Z")[0]}{" "}
                {dataReport.In_Time?.split("T")[1].split(".")[0]}
              </div>
              <div className="mt-4 mx-2">
                <span className="fw-bold">ผู้อนุมัติ : </span>
                {dataReport.UserApprove}
              </div>
            </div>
          </div>
        )}
        <div className="border-data">
          <div className="p-3">
            <table className="border border-white table-hover table-bordered w-100">
              <thead>
                <tr className="text-center">
                  <th className="text-white">โครงการ</th>
                  <th className="text-white">ป้ายทะเบียน</th>
                  <th className="text-white">ผู้ขับ</th>
                  <th className="text-white">รถออกเวลา/ไมค์</th>
                  <th className="text-white">รถเข้าเวลา/ไมค์</th>
                  <th className="text-white">หมายเหตุ</th>
                  <th className="text-white"></th>
                  <th className="text-white"></th>
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
                      <div>{item.Out_Time.split("T")[0].split("Z")[0]}</div>
                      <div>({item.Number_Mile_Out.toLocaleString()})</div>
                    </td>
                    <td className="text-center text-white">
                      <div>
                        {item.In_Time
                          ? item.In_Time.split("T")[0].split("Z")[0]
                          : ""}
                      </div>
                      <div>
                        {item.Number_Mile_In
                          ? item.Number_Mile_In.toLocaleString()
                          : ""}
                      </div>
                    </td>
                    <td>{item.Other}</td>
                    <td className="text-center text-white">
                      {item.Status === 0 ? (
                        <button
                          className="btn btn-warning"
                          onClick={() =>
                            SubmitApprove(member[0]?.Name, item.ID)
                          }
                        >
                          Appove
                        </button>
                      ) : (
                        <span className="text-success-new fs-5 fw-bold">
                          Appove
                        </span>
                      )}
                    </td>
                    <td>
                      {item.Status === 0 ? (
                        ""
                      ) : (
                        <Image
                          src={"/Icon/paper.png"}
                          width={25}
                          height={25}
                          alt="paper"
                          className="cursor-pointer"
                          onClick={() => ReportCar(item.ID)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
