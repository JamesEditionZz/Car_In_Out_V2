"use client";
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CIO.css";
import { useSearchParams } from "next/navigation";

// กำหนด type ของข้อมูลจาก API (ป้องกัน any)
interface CarDetail {
  Project: string;
  Car_Registration: string;
  Name: string;
  Number_Mile_Out: number | null;
  Number_Mile_In: number | null;
  Out_Time: string;
  In_Time: string | null;
  Status: number;
  Number_User: number | string | null;
  Other: string | null;
}

interface Member {
  Number_ID: number;
  Username: string;
  Nameber_Car: string;
}

interface Regis_Car {
  ID: number;
  Name_Car: string;
}

export default function Page() {
  const [allDataDetail, setAllDataDetail] = useState<any[]>([]);
  const [backUpallDataDetail, setBackUpAllDataDetail] = useState<any[]>([]);
  const [data_Oil, setData_Oil] = useState<CarDetail[]>([]);
  const [data, setData] = useState<CarDetail[]>([]);
  const [logdata, setLogData] = useState<CarDetail[]>([]);
  const [project, setProject] = useState<string>("");
  const [Name_Person, setName_Person] = useState<string | number>("");
  const [other, setOther] = useState<string>("");
  const [time, setTime] = useState<Date>(new Date());
  const [Car_Register, setCar_Register] = useState<string>("");
  const [NumberOut, setNumberOut] = useState<number>(0);
  const [NumberIn, setNumberIn] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>(
    [],
  );
  const [editTimeIn, setEditTimeIn] = useState<any>(0);
  const [valueCarEdit, setValueCarEdit] = useState<any>(0);
  const [valueEditIn, setValueEditIn] = useState<number | string>(0);
  const [TrueMileIn, setTrueMileIn] = useState<boolean>(false);

  const [editTimeOut, setEditTimeOut] = useState<any>(0);
  const [valueCarEditOut, setValueCarEditOut] = useState<any>(0);
  const [valueEditOut, setValueEditOut] = useState<number | string>(0);
  const [TrueMileOut, setTrueMileOut] = useState<boolean>(false);

  const [fullName, setFullName] = useState<string | number>("");
  const [name_Car, setName_Car] = useState<Regis_Car[]>([]);
  const [backupName_Car, setBackupName_Car] = useState<Regis_Car[]>([]);

  const [showInputIn, setShowInputIn] = useState<boolean>(false);
  const [showInputOut, setShowInputOut] = useState<boolean>(false);
  const [regisName, setRegisName] = useState<string>("");

  const [modelFilterCar, setModelFilterCar] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const user = searchParams.get("username");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("../api/GET/Price_Oil");
      const response = await res.json();
      setData_Oil(response);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("../api/GET/Regis_Car");
      const response = await res.json();
      setName_Car(response);
      setBackupName_Car(response);
    };

    fetchData();
  }, []);

  // focus ช่องแรกตอนเริ่ม
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("../api/GET/Detail_Car");
      const response: CarDetail[] = await res.json();

      setData(response);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("../api/GET/Detail_Join_Log");
      const response: CarDetail[] = await res.json();
      setLogData(response);
    };

    fetchData();
  }, []);

  const handleRegis_Car_Blur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleRegis_Car_Value(e.currentTarget.value);
  };

  const handleRegis_Car_Value = (value: string) => {
    let newValue = "";

    if (Number(value)) {
      const filter = name_Car.find((item) => item.ID === Number(value));
      newValue = filter?.Name_Car || "";

      if (newValue === "") {
        alert("ไม่มีทะเบียนรถในระบบ");
        return;
      }
    } else {
      const filter = name_Car.find((item) => item.Name_Car === value);
      newValue = filter?.Name_Car || "";
    }

    setCar_Register(newValue);

    if (newValue !== "") {
      handlefilter(newValue);
      inputRefs.current[4]?.focus();
    }
  };

  // กด Enter ที่ช่องทะเบียน
  const handlefilter = (value: string) => {
    const filter = data.filter((item) => item.Car_Registration === value);

    if (filter.length > 0) {
      const row = filter[0];

      if (row.Number_Mile_Out && row.Number_Mile_In) {
        inputRefs.current[1]?.focus();
      } else {
        setName_Person(row.Number_User ?? "");
        setProject(row.Project);
        setNumberOut(row.Number_Mile_Out || 0);
        setFullName(row.Name || 0);
        setTrueMileIn(true);
        inputRefs.current[4]?.focus();
      }
    } else {
      const fetchData = async () => {
        const res = await fetch("../api/POST/Detail_Join_Log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        const response: CarDetail[] = await res.json();

        setLogData(response);
        setNumberOut(response[0]?.Number_Mile_In ?? 0);
      };

      fetchData();

      inputRefs.current[1]?.focus();
    }
  };

  // ฟังก์ชันเลื่อน focus
  const handleKeyDown = async (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      if (NumberOut === 0) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      } else if (NumberOut != 0 && NumberIn === 0) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      } else {
        Submit();
      }
    }
  };

  // ป้องกัน focus หลุด
  const handleBlur = (index: number) => {
    setTimeout(() => {
      const active = document.activeElement as HTMLElement;
      const isInsideForm = inputRefs.current.includes(
        active as HTMLInputElement,
      );
      if (!isInsideForm) {
        inputRefs.current[index]?.focus();
      }
    }, 0);
  };

  const Submit = async () => {
    if (NumberIn > 0 && NumberIn <= NumberOut) {
      alert("ระบุเลขไมค์ไม่ถูกต้อง");
      setNumberIn(0);
      inputRefs.current[4]?.focus();
      return;
    }

    const NamePerson = [Name_Person]
      .map((name) => String(name).trim())
      .filter((name) => name !== "")
      .join(", ");
    const baseEntry = {
      date: time.toLocaleDateString("th-TH"),
      carRegister: Car_Register,
      namePerson: NamePerson,
      numberOut: NumberOut > 0 ? NumberOut : "",
      numberIn: NumberIn > 0 ? NumberIn : "",
    };

    const newEntry =
      NumberIn > 0
        ? { ...baseEntry, Other: other }
        : { ...baseEntry, Project: "" };

    const res = await fetch("../api/POST/Record_Car", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    });

    if (res.ok) {
      const response = await fetch("../api/GET/Detail_Car");
      const data: CarDetail[] = await response.json();
      setData(data);
    }

    setProject("");
    setCar_Register("");
    setName_Person("");
    setNumberOut(0);
    setNumberIn(0);
    setTrueMileIn(false);
    setOther("");
    setFullName("");
    inputRefs.current[0]?.focus();
  };

  const fName = async (numberperson: string) => {
    setFullName("");

    const res = await fetch("../api/GET/User_Car");
    const response: Member[] = await res.json();

    const filter = response.filter(
      (item) => item.Number_ID == Number(numberperson),
    );

    setFullName(filter[0]?.Username);
  };

  useEffect(() => {
    const combined = [...data, ...logdata];
    setAllDataDetail(combined);
    setBackUpAllDataDetail(combined);
  }, [data, logdata]);

  const ActiveInputMileIn = (
    Car: any,
    NumberCarIn: any,
    NumberCarOut: any,
    OutTime: any,
    Name: string,
  ) => {
    setShowInputOut(false);

    setEditTimeIn(OutTime);
    setValueCarEdit(Car);
    setValueEditIn(NumberCarIn);
    setRegisName(Name);
    setValueEditOut(NumberCarOut);
    setShowInputIn(true);
  };

  const ActiveInputMileOut = (
    Car: any,
    NumberCar: any,
    OutTime: any,
    Name: string,
  ) => {
    setShowInputIn(false);

    setEditTimeOut(OutTime);
    setValueCarEditOut(Car);
    setValueEditOut(NumberCar);
    setRegisName(Name);
    setShowInputOut(true);
  };

  const SubmitEditMileIn = async () => {
    try {
      await fetch(`../api/UPDATE/Update_Mile_In`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car: valueCarEdit,
          out_time: editTimeIn,
          name: regisName,
          MileOut: valueEditOut,
          MileIn: valueEditIn,
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      const res = await fetch("../api/GET/Detail_Car");
      const response: CarDetail[] = await res.json();

      setData(response);

      const res2 = await fetch("../api/GET/Detail_Join_Log");
      const response2: CarDetail[] = await res2.json();
      setLogData(response2);

      setShowInputIn(false);
    }
  };

  const SubmitEditMileOut = async () => {
    try {
      await fetch(`../api/UPDATE/Update_Mile_Out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car: valueCarEditOut,
          out_time: editTimeOut,
          name: regisName,
          MileOut: valueEditOut,
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      const res = await fetch("../api/GET/Detail_Car");
      const response: CarDetail[] = await res.json();

      setData(response);

      const res2 = await fetch("../api/GET/Detail_Join_Log");
      const response2: CarDetail[] = await res2.json();
      setLogData(response2);

      setShowInputOut(false);
    }
  };

  const filterRegisCar = () => {
    if (modelFilterCar) {
      setModelFilterCar(false);
    } else {
      setModelFilterCar(true);
    }
  };

  const FilterCar = (value: any) => {
    if (value) {
      const arrayCar = name_Car.filter((item) => item.Name_Car.includes(value));
      setName_Car(arrayCar);
    } else {
      setName_Car(backupName_Car);
    }
  };

  const SelectCarSeeDetail = (value: string) => {
    const ArrayFilter = backUpallDataDetail.filter((item) =>
      item.Car_Registration.includes(value),
    );

    setAllDataDetail(ArrayFilter);
  };

  return (
    <div className="background-CIO mt-3">
      <div className="d-flex justify-content-between">
        <div>
          <h2 className="mx-5 text-white opacity">SCAN IN-OUT</h2>
        </div>
        <div className="mx-5">
          <button className="btn btn-warning" onClick={() => history.back()}>
            Sign Out
          </button>
        </div>
      </div>
      {user?.toUpperCase() === "EDITOR" ? (
        <div className="form-input opacity">
          <div className="row mx-2 mt-2 mb-2 rounded-4 bg-dark overflow-auto">
            <div className="col-12">
              <div className="bg-dark overflow-auto">
                <table className="table table-bordered table-hover table-dark">
                  <thead>
                    <tr>
                      <th className="text-center">โครงการ</th>
                      <th className="text-center">
                        ป้ายทะเบียน{" "}
                        <span
                          className="arrow-down"
                          onClick={() => filterRegisCar()}
                        ></span>
                        {modelFilterCar && (
                          <div className="model-content-Car">
                            <input
                              className="form-control mb-1"
                              onChange={(e) => FilterCar(e.target.value)}
                            />
                            {name_Car.map((item, index) => (
                              <div key={index} className="text-start">
                                <div className="select-cursor-point p-1">
                                  <span
                                    className="mx-1 select-cursor-pointer"
                                    onClick={() =>
                                      SelectCarSeeDetail(item.Name_Car)
                                    }
                                  >
                                    {item.Name_Car}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </th>
                      <th className="text-center">ชื่อพนักงาน</th>
                      <th className="text-center">เวลาออก</th>
                      <th className="text-center">ไมค์ออก</th>
                      <th className="text-center">เวลาเข้า</th>
                      <th className="text-center">ไมค์เข้า</th>
                      <th className="text-center">หมายเหตุ</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDataDetail.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center align-content-center">
                          {item.Project?.length > 30
                            ? item.Project?.slice(0, 30) + "...."
                            : item.Project}
                        </td>
                        <td className="text-center align-content-center">
                          {item.Car_Registration}
                        </td>
                        <td className="align-content-center text-center">
                          {item.Name}
                        </td>
                        <td className="text-center align-content-center">
                          <div>
                            {item.Out_Time.split("T")[0]}{" "}
                            {
                              item.Out_Time.split("T")[1]
                                .split("Z")[0]
                                .split(".")[0]
                            }
                          </div>
                        </td>
                        <td>
                          <div className="text-center">
                            {item.Number_Mile_Out ? (
                              <>
                                {showInputOut &&
                                editTimeOut === item.Out_Time &&
                                valueCarEditOut === item.Car_Registration ? (
                                  <input
                                    className="form-control"
                                    value={valueEditOut}
                                    onChange={(e) =>
                                      setValueEditOut(e.target.value)
                                    }
                                    autoFocus
                                  />
                                ) : (
                                  item.Number_Mile_Out
                                )}
                                {showInputOut &&
                                editTimeOut === item.Out_Time &&
                                valueCarEditOut === item.Car_Registration ? (
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => SubmitEditMileOut()}
                                  >
                                    บันทึก
                                  </button>
                                ) : (
                                  <span
                                    className="text-warning cursor-pointer"
                                    onClick={() =>
                                      ActiveInputMileOut(
                                        item.Car_Registration,
                                        item.Number_Mile_Out,
                                        item.Out_Time,
                                        item.Name,
                                      )
                                    }
                                  >
                                    &#9998;
                                  </span>
                                )}
                              </>
                            ) : (
                              ""
                            )}
                          </div>
                        </td>
                        <td className="text-center align-content-center">
                          <div>
                            {item.In_Time
                              ? `${item.In_Time.split("T")[0]} ${
                                  item.In_Time.split("T")[1]
                                    .split("Z")[0]
                                    .split(".")[0]
                                }`
                              : ""}
                          </div>
                        </td>
                        <td>
                          <div className="text-center">
                            {item.Number_Mile_In ? (
                              <>
                                {showInputIn &&
                                editTimeIn === item.Out_Time &&
                                valueCarEdit === item.Car_Registration ? (
                                  <input
                                    className="form-control"
                                    value={valueEditIn}
                                    onChange={(e) =>
                                      setValueEditIn(e.target.value)
                                    }
                                    autoFocus
                                  />
                                ) : (
                                  item.Number_Mile_In
                                )}
                                {showInputIn &&
                                editTimeIn === item.Out_Time &&
                                valueCarEdit === item.Car_Registration ? (
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => SubmitEditMileIn()}
                                  >
                                    บันทึก
                                  </button>
                                ) : (
                                  <span
                                    className="text-warning cursor-pointer"
                                    onClick={() =>
                                      ActiveInputMileIn(
                                        item.Car_Registration,
                                        item.Number_Mile_In,
                                        item.Number_Mile_Out,
                                        item.Out_Time,
                                        item.Name,
                                      )
                                    }
                                  >
                                    &#9998;
                                  </span>
                                )}
                              </>
                            ) : (
                              ""
                            )}
                          </div>
                        </td>
                        <td className="align-content-center text-center">
                          {item?.Other}
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
      ) : (
        <div className="form-input opacity">
          <div className="row mx-2 mt-2 mb-2 rounded-4 bg-dark overflow-auto">
            <div className="col-2 border-right bg-dark">
              <div className="fs-5 text-center p-4 border border-3 mt-2 rounded-4 mb-3">
                <div className="text-white fs-4">
                  {time.toLocaleDateString("th-TH")}
                </div>
                {/* <div className="text-white">
                {time.toLocaleTimeString("th-TH", { hour12: false })}
              </div> */}
              </div>
              <div className="mt-2">
                <label className="text-white">ป้ายทะเบียนรถ</label>
                <input
                  value={Car_Register}
                  ref={(el) => {
                    inputRefs.current[0] = el;
                  }}
                  className="form-control-input text-white"
                  onChange={(e) => setCar_Register(e.target.value)}
                  onBlur={(e) => {
                    (handleBlur(0), handleRegis_Car_Blur(e));
                  }}
                />
              </div>

              <div className="mt-3">
                <div className="text-white">รหัสพนักงาน</div>
                <input
                  type="number"
                  value={Name_Person}
                  ref={(el) => {
                    inputRefs.current[1] = el;
                  }}
                  className="form-control-input text-white"
                  onChange={(e) => {
                    setName_Person(e.target.value);
                    fName(e.target.value);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, NumberOut ? 3 : 2)}
                />
              </div>

              <div className="mt-3">
                <div className="text-white">ชื่อพนักงาน</div>
                <input
                  value={fullName || ""}
                  readOnly
                  className="form-control-input text-white"
                />
              </div>

              {/* <div className="mt-2">
              <div>
                <label className="text-white">โครงการ</label>
              </div>
              <input
                value={project ?? ""}
                ref={(el) => {
                  inputRefs.current[2] = el;
                }}
                className="form-control-input text-white"
                onChange={(e) => setProject(e.target.value)}
                onKeyDown={(e) => SubmitFinal(e)}
                // onBlur={() => handleBlur(0)}
              />
            </div> */}

              <div className="mt-3 ">
                <div>
                  <label className="text-white">เลขไมค์ออกโรงงาน</label>
                </div>
                <input
                  value={NumberOut}
                  ref={(el) => {
                    inputRefs.current[3] = el;
                  }}
                  disabled
                  type="number"
                  className="form-control-input text-white"
                  onChange={(e) => setNumberOut(Number(e.target.value))}
                />
              </div>

              <div className="mt-3">
                <label className="text-white">เลขไมค์เข้าโรงงาน</label>
                <input
                  value={NumberIn}
                  ref={(el) => {
                    inputRefs.current[4] = el;
                  }}
                  type="number"
                  className="form-control-input text-white"
                  onChange={(e) => setNumberIn(Number(e.target.value))}
                  onKeyDown={(e) => handleKeyDown(e, 4)}
                  disabled={!TrueMileIn}
                />
              </div>

              <div className="mt-3 ">
                <div>
                  <label className="text-white">หมายเหตุ</label>
                </div>
                <input
                  value={other}
                  ref={(el) => {
                    inputRefs.current[5] = el;
                  }}
                  className="form-control-input text-white"
                  onChange={(e) => setOther(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 5)}
                />
              </div>

              <div>
                <button
                  className="btn btn-primary p-3 w-100 mt-3"
                  onClick={Submit}
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
                      <th className="text-center">หมายเหตุ</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center align-content-center">
                          {item.Project?.length > 30
                            ? item.Project?.slice(0, 30) + "...."
                            : item.Project}
                        </td>
                        <td className="text-center align-content-center">
                          {item.Car_Registration}
                        </td>
                        <td className="align-content-center text-center">
                          {item.Name}
                        </td>
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
                        <td
                          className="text-center align-content-center"
                          width="20%"
                        >
                          <div>
                            {item.In_Time
                              ? `${item.In_Time.split("T")[0]} ${
                                  item.In_Time.split("T")[1]
                                    .split("Z")[0]
                                    .split(".")[0]
                                }`
                              : ""}
                          </div>
                          <div>
                            {item.Number_Mile_In
                              ? `(${item.Number_Mile_In})`
                              : ""}
                          </div>
                        </td>
                        <td className="align-content-center text-center">
                          {item?.Other}
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
      )}
    </div>
  );
}
