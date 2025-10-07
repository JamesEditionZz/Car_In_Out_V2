"use client";
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [project, setProject] = useState<string>("");
  const [Name_Person, setName_Person] = useState<string>("");
  const [other, setOther] = useState<string>("");
  const [time, setTime] = useState<Date>(new Date());
  const [Car_Register, setCar_Register] = useState<string>("");
  const [NumberOut, setNumberOut] = useState<number>(0);
  const [NumberIn, setNumberIn] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [TrueMileIn, setTrueMileIn] = useState<boolean>(false);

  // เวลา
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    const datafecth = async () => {
      await fetch(`../api/UPDATE/Update_To_Log`);
    };

    datafecth();

    const interval = setInterval(() => {
      datafecth();
    }, 60 * 60 * 24);

    return () => clearInterval(interval);
  }, []);

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

  const handlefilter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const filter = data.filter(
        (item) => item.Car_Registration === Car_Register
      );

      if (filter.length > 0) {
        for (const row of filter) {
          if (row.Number_Mile_Out && row.Number_Mile_In) {
            e.preventDefault();
            const nextInput = inputRefs.current[0 + 1];
            if (nextInput) {
              nextInput.focus();
              3;
            }
          } else {
            setName_Person(row.Name);
            setProject(row.Project);
            setNumberOut(row.Number_Mile_Out);
            setTrueMileIn(true);
            const nextInput = inputRefs.current[4];
            if (nextInput) {
              nextInput.focus();
              3;
            }
          }
        }
      } else {
        e.preventDefault();
        const nextInput = inputRefs.current[0 + 1];
        if (nextInput) {
          nextInput.focus();
          3;
        }
      }
    }
  };

  // ฟังก์ชันเลื่อน focus
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleBlur = (index: number) => {
    // ให้ช่องแรกบังคับ focus ใหม่ ถ้าไม่ได้กำลังจะไป input อื่นใน form
    setTimeout(() => {
      const active = document.activeElement as HTMLElement;
      const isInsideForm = inputRefs.current.includes(
        active as HTMLInputElement
      );
      if (!isInsideForm && inputRefs.current[index]) {
        inputRefs.current[index]?.focus();
      }
    }, 0);
  };

  const Submit = async () => {
    if (NumberIn > 0) {
      if (NumberIn <= NumberOut) {
        alert("ระบุเลขไมค์ไม่ถูกต้อง");
        setNumberIn(0);
        const nextInput = inputRefs.current[7];
        if (nextInput) {
          nextInput.focus();
        }
        return;
      }

      const NamePerson = [Name_Person]
        .filter((name) => name.trim() !== "")
        .join(", ");

      const newEntry = {
        date: time.toLocaleDateString("th-TH"),
        time: time.toLocaleTimeString("th-TH", { hour12: false }),
        carRegister: Car_Register,
        namePerson: NamePerson,
        numberOut: NumberOut > 0 ? NumberOut : "",
        numberIn: NumberIn > 0 ? NumberIn : "",
        Other: other,
      };

      const res = await fetch("../api/POST/Record_Car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (res.ok) {
        const res = await fetch("../api/GET/Detail_Car");
        const data = await res.json();
        setData(data);
      }

      setProject("");
      setCar_Register("");
      setName_Person("");
      setNumberOut(0);
      setNumberIn(0);
      setTrueMileIn(false);

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } else if (NumberIn === 0) {
      const NamePerson = [Name_Person]
        .filter((name) => name.trim() !== "")
        .join(", ");

      const newEntry = {
        Project: project,
        date: time.toLocaleDateString("th-TH"),
        time: time.toLocaleTimeString("th-TH", { hour12: false }),
        carRegister: Car_Register,
        namePerson: NamePerson,
        numberOut: NumberOut > 0 ? NumberOut : "",
        numberIn: NumberIn > 0 ? NumberIn : "",
      };

      const res = await fetch("../api/POST/Record_Car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (res.ok) {
        const res = await fetch("../api/GET/Detail_Car");
        const data = await res.json();
        setData(data);
      }
    }
  };

  return (
    <div className="background-CIO">
      <h2 className="mx-5 text-white">SCAN IN-OUT</h2>
      <div className="form-input">
        <div className="row mx-4 mt-4 bg-dark">
          <div className="col-2 border-right bg-dark">
            <div className="fs-5 text-center p-2 border border-2 border mt-2 rounded-4">
              <div className="text-white">
                {time.toLocaleDateString("th-TH")}{" "}
              </div>
              <div className="text-white">
                {time.toLocaleTimeString("th-TH", { hour12: false })}
              </div>
            </div>
            <div className="mt-2">
              <label className="text-white">ป้ายทะเบียนรถ</label>
              <input
                value={Car_Register}
                ref={(el) => (inputRefs.current[0] = el)}
                className="form-control-input text-white"
                onChange={(e) => setCar_Register(e.target.value)}
                onKeyDown={handlefilter}
                onBlur={() => handleBlur(0)}
              />
            </div>
            <div className="mt-3">
              <div className="text-white">พนักงาน</div>
              <input
                value={Name_Person}
                ref={(el) => (inputRefs.current[1] = el)}
                className="form-control-input text-white"
                onChange={(e) => setName_Person(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 1)}
              />
            </div>
            <div className="mt-2">
              <label className="text-white">โครงการ</label>
              <input
                value={project}
                ref={(el) => (inputRefs.current[2] = el)}
                className="form-control-input text-white"
                onChange={(e) => setProject(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                onBlur={() => handleBlur(0)}
              />
            </div>
            <div>
              <label className="mt-3 text-white">เลขไมค์ออกโรงงาน</label>
              <input
                type="number"
                value={NumberOut}
                ref={(el) => (inputRefs.current[3] = el)}
                className="form-control-input text-white"
                onChange={(e) => setNumberOut(Number(e.target.value))}
                onKeyDown={(e) => handleKeyDown(e, 3)}
              />
            </div>
            <div>
              <label className="mt-3 text-white">เลขไมค์เข้าโรงงาน</label>
              <input
                type="number"
                value={NumberIn}
                ref={(el) => (inputRefs.current[4] = el)}
                className="form-control-input text-white"
                onChange={(e) => setNumberIn(Number(e.target.value))}
                onKeyDown={(e) => handleKeyDown(e, 4)}
                disabled={TrueMileIn ? false : true}
              />
            </div>
            <div>
              <label className="mt-3 text-white">หมายเหตุ</label>
              <textarea
                value={other}
                ref={(el) => (inputRefs.current[5] = el)}
                className="form-control-input text-white"
                onChange={(e) => setOther(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 5)}
              />
            </div>
            <div>
              <button
                className="btn btn-primary p-3 w-100 mt-3"
                onClick={() => Submit()}
              >
                บันทึก
              </button>
            </div>
          </div>
          <div className="col-10">
            <div className="bg-dark overflow-auto">
              <table className="table table-bordered table-hover table-dark">
                <thead>
                  <tr>
                    <th className="text-center">โครงการ</th>
                    <th className="text-center">ป้ายทะเบียน</th>
                    <th className="text-center">ชื่อพนักงาน</th>
                    <th className="text-center">ออก</th>
                    <th className="text-center">เข้า</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="cursor-pointer">
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center align-content-center">
                        {item.Project.length > 30
                          ? item.Project.slice(0, 30) + "...."
                          : item.Project}
                      </td>
                      <td className="text-center align-content-center">
                        {item.Car_Registration}
                      </td>
                      <td>{item.Name}</td>
                      <td className="text-center align-content-center">
                        <div>
                          {item.Out_Time.split("T")[0]}{" "}
                          {
                            item.Out_Time.split("T")[1]
                              .split("Z")[0]
                              .split(".")[0]
                          }
                        </div>
                        <div>({item.Number_Mile_Out})</div>
                      </td>
                      <td className="text-center align-content-center">
                        <div>
                          {item.In_Time ? item.In_Time.split("T")[0] : ""}{" "}
                          {item.In_Time
                            ? item.In_Time.split("T")[1]
                                .split("Z")[0]
                                .split(".")[0]
                            : ""}
                        </div>
                        <div>
                          {item.Number_Mile_In
                            ? `(${item.Number_Mile_In})`
                            : ""}
                        </div>
                      </td>
                      <td>
                        {item.Status === 0 ? (
                          <div className="text-warning text-center fs-5 fw-bold">
                            รอ Approve
                          </div>
                        ) : (
                          <div className="text-success text-center fs-5 fw-bold">
                            Approve
                          </div>
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
    </div>
  );
}
