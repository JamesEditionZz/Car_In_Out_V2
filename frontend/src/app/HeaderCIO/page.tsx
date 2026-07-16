"use client";
import React, { useEffect, useState } from "react";
import "./HeaderCIO.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Bar from "./Dashboard/page";
import { useSearchParams } from "next/navigation";
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

  interface Project {
    ActiveStatus: true;
    CCC: true;
    CarNumber: null;
    Customer: string;
    CustomerCD: number;
    DocNo: number;
    DocNumber: string;
    DocType: string;
    EntryDate: string;
    LookUp: string;
    PO: number;
    PrintDate: string;
    PrintStatus: boolean;
    Project: string;
    SN: number;
    SO: number;
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
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  // const username = "";

  const [data, setData] = useState<CarDetail[]>([]);
  const [dataReport, setDataReport] = useState<CarDetail | null>(null);
  const [modelReport, setModelReport] = useState<boolean>(false);
  const [member, setMember] = useState<Member[]>([]);
  const [swiftPage, setSwiftPage] = useState<number>(0);
  const [pageReport, setPageReport] = useState<number>(0);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [docSO, setDocSO] = useState<Project[]>([]);
  const [select_ID, setSelect_ID] = useState<number>(0);
  const [model_Select, setModel_Select] = useState<boolean>(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  const [model_insertProject, setModel_InsertProject] =
    useState<boolean>(false);
  const [select_InsertID, setSelect_InsertID] = useState<number>(0);
  const [model_editProject, setModel_EditProject] = useState<boolean>(false);
  const [select_editID, setSelect_EditID] = useState<number>(0);
  const [model_Popup_Project, setModel_Popup_Project] =
    useState<boolean>(false);
  const [arrayProject, setArrayProject] = useState<CarDetail[]>([]);
  const [changeInput, setChangeInput] = useState<number>(0);
  const [showOther, setShowOther] = useState<boolean>(false);
  const [textOther, setTextOther] = useState<string>("");
  const [inputChangeOutMile, setInputChangOutMile] = useState<
    (number | string)[]
  >([]);

  const [valueMileOut, setValueMileOut] = useState<number>(0);
  const [inputChangeInMile, setInputChangInMile] = useState<
    (number | string)[]
  >([]);
  const [valueMileIn, setValueMileIn] = useState<number>(0);

  const dataDetail = async () => {
    const res = await fetch(`../api/GET/Detail_Join_Log`);
    const response = await res.json();
    setData(response);
  };

  useEffect(() => {
    const fetchData = async () => {
      dataDetail();
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

  const SubmitApprove = async (
    Name: string,
    ID: number,
    Car_Registration: string,
    Mile_Out: number,
  ) => {
    try {
      const res = await fetch(`../api/UPDATE/Update_Detail_Car`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name, ID, Car_Registration, Mile_Out }),
      });

      if (res.ok) {
        dataDetail();
      } else {
        console.error("Approve failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const ShowMenu = () => {
    if (showMenu) {
      setShowMenu(false);
    } else {
      setShowMenu(true);
    }
  };

  const filterSO_SN = async (value: string) => {
    const res = await fetch("../api/POST/filter_Project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });

    const response = await res.json();

    setDocSO(response);
  };

  const UpdateOther = async (
    ID: number,
    value: string,
    Car_Registration: string,
    Number_Mile_Out: number,
  ) => {
    console.log(ID, value, Car_Registration, Number_Mile_Out);

    if (value === "Other") {
      setSelect_ID(ID);
      setShowOther(true);
    } else {
      await fetch("../api/UPDATE/Update_Project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value,
          Car_Registration: Car_Registration,
          Mile_Out: Number_Mile_Out,
        }),
      });

      dataDetail();
      setModel_EditProject(false);
      setShowOther(false);
      setTextOther("");
    }
  };

  const Select_Project = async (
    ID: number,
    Car_Registration: string,
    Mile_Out: number,
    value: string,
  ) => {
    console.log(ID, value);

    const res = await fetch(`../api/POST/filter_Detail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ID: ID }),
    });

    if (res.ok) {
      await fetch("../api/UPDATE/Update_Project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ID,
          Car_Registration: Car_Registration,
          Mile_Out: Mile_Out,
          value: value,
        }),
      });

      dataDetail();
    }
  };

  const openModalAtMouse = (e: any, id: number) => {
    e.stopPropagation();
    setPopupPos({
      x: e.clientX,
      y: e.clientY,
    });
    setSelect_ID(id);
    setModel_Select(true);
  };

  const Edit_Project = (ID: number) => {
    setSelect_EditID(ID);
    setModel_EditProject(true);
  };

  const Add_Project = (ID: number) => {
    setSelect_InsertID(ID);
    setModel_InsertProject(true);
  };

  const Insert_Select_Project = async (
    ID: number,
    Car_Registration: string,
    Mile_Out: number,
    value: string,
  ) => {
    await fetch("../api/UPDATE/Update_Insert_Project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ID,
        Car_Registration: Car_Registration,
        Mile_Out: Mile_Out,
        Project: value,
      }),
    });

    dataDetail();
    setSelect_InsertID(0);
    setModel_InsertProject(false);
  };

  const openModalMouse = (
    index: number,
    e: any,
    project: string,
    car: string,
    mileOut: number,
  ) => {
    e.stopPropagation();

    setPopupPos({
      x: e.clientX,
      y: e.clientY,
    });
    const result = data.filter(
      (item) =>
        item.Project.includes(project) &&
        item.Car_Registration === car &&
        Number(item.Number_Mile_Out) === Number(mileOut),
    );
    setChangeInput(index);
    setArrayProject(result);
    setModel_Popup_Project(true);
  };

  const Submit_Project = () => {
    setModel_EditProject(false);
  };

  const Submit_Edit_Project = async (newProject: string) => {
    const updated = arrayProject.map((item) => {
      const parts = item.Project.split("|");

      parts[changeInput] = newProject.trim();

      return {
        ...item,
        Project: parts.join(" | "),
      };
    });

    await fetch("../api/UPDATE/Update_Project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Car_Registration: updated[0].Car_Registration,
        Mile_Out: updated[0].Number_Mile_Out,
        value: updated[0].Project,
      }),
    });

    dataDetail();
  };

  const Submit_Other = async (
    Project: string,
    Car_Registration: string,
    Number_Mile_Out: number,
  ) => {
    await fetch("../api/UPDATE/Update_Other", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Project: Project,
        Car_Registration: Car_Registration,
        Mile_Out: Number_Mile_Out,
        value: textOther,
      }),
    });

    dataDetail();
    setModel_EditProject(false);
    setShowOther(false);
    setTextOther("");
  };

  const OtherText = async (
    value: string,
    Car_Registration: string,
    Number_Mile_Out: number,
  ) => {
    const checknumber = Number(value);
    if (!checknumber) {
      await fetch("../api/UPDATE/Other_Car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Car_Registration: Car_Registration,
          Mile_Out: Number_Mile_Out,
          value: value,
        }),
      });
    }

    dataDetail();
  };

  const ChangeMileOut = (
    Row: number,
    Registration: string,
    MileOut: number,
  ) => {
    const newValue = [Row, Registration, MileOut];
    setValueMileOut(newValue[2]);
    setInputChangOutMile(newValue);
  };

  const updateOutMile = async (car: string, out_time: string, name: string) => {
    const returnCheck = await fetch("../api/UPDATE/Update_Mile_Out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        car: car,
        out_time: out_time,
        name: name,
        MileOut: valueMileOut,
      }),
    });

    if (returnCheck.ok) {
      setInputChangOutMile([]);
      dataDetail();
    }
  };

  const updateInMile = async (
    Row: number,
    Registration: string,
    MileOut: number,
    MileIn: number,
  ) => {
    const newValue = [Row, Registration, MileOut, MileIn];
    setValueMileIn(newValue[3]);
    setInputChangInMile(newValue);
  };
  const updateOutIn = async (car: string, out_time: string, name: string, MileOut: number) => {
    const returnCheck = await fetch("../api/UPDATE/Update_Mile_In", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        car: car,
        out_time: out_time,
        name: name,
        MileOut: MileOut,
        MileIn: valueMileIn,
      }),
    });
    if (returnCheck.ok) {
      setInputChangInMile([]);
      dataDetail();
    }
  };

  return (
    <div
      className="background-CIO"
      onClick={() => {
        (setModel_Select(false), setModel_Popup_Project(false));
      }}
    >
      <div className="container opacity">
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
        <div className="d-flex position-absolute position-customize">
          <button className="btn btn-warning" onClick={() => history.back()}>
            Log Out
          </button>
        </div>
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
              Dashboard
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
                    <th className="text-white">รถออกเวลา</th>
                    <th className="text-white">เลขไมค์ออก</th>
                    <th className="text-white">รถเข้าเวลา</th>
                    <th className="text-white">เลขไมค์เข้า</th>
                    <th className="text-white">หมายเหตุ</th>
                    <th className="text-white">สถานะ</th>
                    {/* <th className="text-white">รายงาน</th> */}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      {username?.toUpperCase() ===
                        item.UserApprove?.toUpperCase() ||
                      username?.toUpperCase() === "MGR"?.toUpperCase() ? (
                        <>
                          <td className="text-center">
                            {item.Project ? (
                              <>
                                {model_editProject ? (
                                  <>
                                    {model_editProject &&
                                    select_editID === item.ID ? (
                                      <>
                                        {item.UserApprove === "SCO" ? (
                                          <>
                                            <select
                                              className="form-select"
                                              onChange={(e) =>
                                                UpdateOther(
                                                  item.ID,
                                                  e.target.value,
                                                  item.Car_Registration,
                                                  item.Number_Mile_Out,
                                                )
                                              }
                                            >
                                              <option hidden>
                                                เลือกประเภทงาน
                                              </option>
                                              <option
                                                value={
                                                  "Project Coordination (SCO)"
                                                }
                                              >
                                                Project Coordination (SCO)
                                              </option>
                                              <option
                                                value={"Site Layout (SCO)"}
                                              >
                                                Site Layout (SCO)
                                              </option>
                                              <option value={"Other"}>
                                                อื่นๆ
                                              </option>
                                            </select>
                                          </>
                                        ) : item.UserApprove === "AFS" ? (
                                          <>
                                            <select
                                              className="form-select"
                                              onChange={(e) =>
                                                UpdateOther(
                                                  item.ID,
                                                  e.target.value,
                                                  item.Car_Registration,
                                                  item.Number_Mile_Out,
                                                )
                                              }
                                            >
                                              <option hidden>
                                                เลือกประเภทงาน
                                              </option>
                                              <option
                                                value={
                                                  "After-sales Service (AFS)"
                                                }
                                              >
                                                After-sales Service (AFS)
                                              </option>
                                              <option
                                                value={"Service Solutions (SS)"}
                                              >
                                                Service Solutions (SS)
                                              </option>
                                              <option value={"Other"}>
                                                อื่นๆ
                                              </option>
                                            </select>
                                          </>
                                        ) : (
                                          <>
                                            {item.Project.split("|").map(
                                              (PJ, PJindex) => (
                                                <div
                                                  key={PJindex}
                                                  className="mb-2"
                                                >
                                                  <input
                                                    className="form-control cursor-pointer"
                                                    readOnly
                                                    onClick={(e) =>
                                                      openModalMouse(
                                                        PJindex,
                                                        e,
                                                        PJ,
                                                        item.Car_Registration,
                                                        item.Number_Mile_Out,
                                                      )
                                                    }
                                                    value={PJ}
                                                    placeholder="เลือกโครงการ"
                                                  />
                                                  {model_Popup_Project && (
                                                    <div
                                                      className="model-select"
                                                      style={{
                                                        position: "fixed",
                                                        top: popupPos.y,
                                                        left: popupPos.x,
                                                        zIndex: 99999,
                                                      }}
                                                      onClick={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                    >
                                                      <div className="bg-white p-3 rounded shadow">
                                                        <input
                                                          className="form-control mb-2"
                                                          placeholder="ค้นหา SN SO ฯลฯ"
                                                          onChange={(e) =>
                                                            filterSO_SN(
                                                              e.target.value,
                                                            )
                                                          }
                                                          onKeyDown={(e) => {
                                                            if (
                                                              e.key === "Enter"
                                                            ) {
                                                              OtherText(
                                                                e.currentTarget
                                                                  .value,
                                                                item.Car_Registration,
                                                                item.Number_Mile_Out,
                                                              );
                                                            }
                                                          }}
                                                        />

                                                        {docSO.map(
                                                          (
                                                            itemproject,
                                                            index,
                                                          ) => (
                                                            <div
                                                              key={index}
                                                              className="p-2 cursor-select"
                                                              onClick={() =>
                                                                Submit_Edit_Project(
                                                                  itemproject.Project,
                                                                )
                                                              }
                                                            >
                                                              {
                                                                itemproject.Project
                                                              }
                                                            </div>
                                                          ),
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              ),
                                            )}
                                          </>
                                        )}
                                        {showOther &&
                                          item.ID === select_editID && (
                                            <>
                                              <input
                                                className="form-control"
                                                placeholder="ระบุหมายเหตุ"
                                                onChange={(e) =>
                                                  setTextOther(e.target.value)
                                                }
                                              />
                                              <span
                                                className="text-success fs-5 cursor-pointer"
                                                onClick={() =>
                                                  Submit_Other(
                                                    "อื่นๆ",
                                                    item.Car_Registration,
                                                    item.Number_Mile_Out,
                                                  )
                                                }
                                              >
                                                &#128190;
                                              </span>
                                            </>
                                          )}
                                      </>
                                    ) : (
                                      item.Project
                                    )}
                                  </>
                                ) : (
                                  item.Project
                                )}
                                {model_insertProject &&
                                  item.ID === select_InsertID && (
                                    <>
                                      <div onClick={(e) => e.stopPropagation()}>
                                        <input
                                          className="form-control cursor-pointer"
                                          readOnly
                                          onClick={(e) =>
                                            openModalAtMouse(e, item.ID)
                                          }
                                          placeholder="เลือกโครงการ"
                                        />
                                      </div>
                                      {model_Select &&
                                        select_ID === item.ID && (
                                          <div
                                            className="model-select"
                                            style={{
                                              position: "fixed",
                                              top: popupPos.y,
                                              left: popupPos.x,
                                              zIndex: 99999,
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="bg-white p-3 rounded shadow">
                                              <input
                                                className="form-control mb-2"
                                                placeholder="ค้นหา SN SO ฯลฯ"
                                                onChange={(e) =>
                                                  filterSO_SN(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    OtherText(
                                                      e.currentTarget.value,
                                                      item.Car_Registration,
                                                      item.Number_Mile_Out,
                                                    );
                                                  }
                                                }}
                                              />

                                              {docSO.map(
                                                (itemproject, index) => (
                                                  <div
                                                    key={index}
                                                    className="p-2 cursor-select"
                                                    onClick={() =>
                                                      Insert_Select_Project(
                                                        item.ID,
                                                        item.Car_Registration,
                                                        item.Number_Mile_Out,
                                                        itemproject.Project,
                                                      )
                                                    }
                                                  >
                                                    {itemproject.Project}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </>
                                  )}
                                <div className="text-white">
                                  {!model_editProject && (
                                    <>
                                      <span
                                        className="text-warning fs-5 cursor-pointer"
                                        onClick={() => Edit_Project(item.ID)}
                                      >
                                        &#128393;
                                      </span>
                                      <>
                                        {item.UserApprove === "AFS" ||
                                        item.UserApprove === "SCO" ? (
                                          <></>
                                        ) : (
                                          <span
                                            className="text-primary fs-5 cursor-pointer"
                                            onClick={() => Add_Project(item.ID)}
                                          >
                                            &#10133;
                                          </span>
                                        )}
                                      </>
                                    </>
                                  )}
                                  {model_editProject &&
                                    item.ID === select_editID && (
                                      <span
                                        className="text-success fs-5 cursor-pointer"
                                        onClick={() => Submit_Project()}
                                      >
                                        <>{showOther ? "" : <>&#128190;</>}</>
                                      </span>
                                    )}
                                </div>
                              </>
                            ) : item.UserApprove === "AFS" ? (
                              <>
                                <select
                                  className="form-select"
                                  onChange={(e) =>
                                    UpdateOther(
                                      item.ID,
                                      e.target.value,
                                      item.Car_Registration,
                                      item.Number_Mile_Out,
                                    )
                                  }
                                >
                                  <option hidden>เลือกประเภทงาน</option>
                                  <option value={"After-sales Service (AFS)"}>
                                    After-sales Service (AFS)
                                  </option>
                                  <option value={"Service Solutions (SS)"}>
                                    Service Solutions (SS)
                                  </option>
                                  <option value={"Other"}>อื่นๆ</option>
                                </select>
                                {showOther && item.ID === select_ID && (
                                  <>
                                    <input
                                      className="form-control"
                                      placeholder="ระบุหมายเหตุ"
                                      onChange={(e) =>
                                        setTextOther(e.target.value)
                                      }
                                    />
                                    <span
                                      className="text-success fs-5 cursor-pointer"
                                      onClick={() =>
                                        Submit_Other(
                                          "อื่นๆ",
                                          item.Car_Registration,
                                          item.Number_Mile_Out,
                                        )
                                      }
                                    >
                                      &#128190;
                                    </span>
                                  </>
                                )}
                              </>
                            ) : item.UserApprove === "SCO" ? (
                              <>
                                <select
                                  className="form-select"
                                  onChange={(e) =>
                                    UpdateOther(
                                      item.ID,
                                      e.target.value,
                                      item.Car_Registration,
                                      item.Number_Mile_Out,
                                    )
                                  }
                                >
                                  <option hidden>เลือกประเภทงาน</option>
                                  <option value={"Project Coordination (SCO)"}>
                                    Project Coordination (SCO)
                                  </option>
                                  <option value={"Site Layout (SCO)"}>
                                    Site Layout (SCO)
                                  </option>
                                  <option value={"Other"}>อื่นๆ</option>
                                </select>
                                {showOther && item.ID === select_ID && (
                                  <>
                                    <input
                                      className="form-control"
                                      placeholder="ระบุหมายเหตุ"
                                      onChange={(e) =>
                                        setTextOther(e.target.value)
                                      }
                                    />
                                    <span
                                      className="text-success fs-5 cursor-pointer"
                                      onClick={() =>
                                        Submit_Other(
                                          "อื่นๆ",
                                          item.Car_Registration,
                                          item.Number_Mile_Out,
                                        )
                                      }
                                    >
                                      &#128190;
                                    </span>
                                  </>
                                )}
                              </>
                            ) : (
                              <div onClick={(e) => e.stopPropagation()}>
                                <input
                                  className="form-control cursor-pointer"
                                  readOnly
                                  onClick={(e) => openModalAtMouse(e, item.ID)}
                                  placeholder="เลือกโครงการ"
                                />
                                {model_Select && select_ID === item.ID && (
                                  <div
                                    className="model-select"
                                    style={{
                                      position: "fixed",
                                      top: popupPos.y,
                                      left: popupPos.x,
                                      zIndex: 99999,
                                    }}
                                  >
                                    <div className="d-flex justify-content-around mt-2">
                                      {/* <div>
                                        <input
                                          className=""
                                          type="radio"
                                          name={`check1-${item.ID}`}
                                        />
                                        <span className="px-2">Project</span>
                                      </div>
                                      <div>
                                        <input
                                          className=""
                                          type="radio"
                                          name={`check1-${item.ID}`}
                                          onChange={(e) =>
                                            UpdateOther(
                                              item.ID,
                                              "Other",
                                              item.Car_Registration,
                                              item.Number_Mile_Out
                                            )
                                          }
                                        />
                                        <span className="px-2">อื่นๆ</span>
                                      </div> */}
                                    </div>
                                    <div className="bg-white px-3 pb-2 pt-2 rounded shadow">
                                      <>
                                        {showMenu && select_ID === item.ID ? (
                                          <>
                                            <input
                                              className="form-control"
                                              placeholder="ระบุหมายเหตุ"
                                              onChange={(e) =>
                                                setTextOther(e.target.value)
                                              }
                                            />
                                            <span
                                              className="text-success fs-5 cursor-pointer"
                                              onClick={() =>
                                                Submit_Other(
                                                  "อื่นๆ",
                                                  item.Car_Registration,
                                                  item.Number_Mile_Out,
                                                )
                                              }
                                            >
                                              &#128190;
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <input
                                              className="form-control mb-2"
                                              placeholder="ค้นหา SN SO ฯลฯ"
                                              onChange={(e) =>
                                                filterSO_SN(e.target.value)
                                              }
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  OtherText(
                                                    e.currentTarget.value,
                                                    item.Car_Registration,
                                                    item.Number_Mile_Out,
                                                  );
                                                }
                                              }}
                                            />

                                            {docSO.map((itemproject, index) => (
                                              <div
                                                key={index}
                                                className="p-2 cursor-select"
                                                onClick={() =>
                                                  Select_Project(
                                                    item.ID,
                                                    item.Car_Registration,
                                                    item.Number_Mile_Out,
                                                    itemproject.Project,
                                                  )
                                                }
                                              >
                                                {itemproject.Project}
                                              </div>
                                            ))}
                                          </>
                                        )}
                                      </>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="text-white text-center">
                              {item.Car_Registration}
                            </div>
                          </td>
                          <td>
                            <div className="text-white text-center">
                              {item.Name}
                            </div>
                          </td>
                          <td>
                            <div className="text-white text-center">
                              {item.Out_Time.split(".")[0].split("T")[0]}{" "}
                              {item.Out_Time.split("T")[1].split(".")[0]}
                            </div>
                          </td>
                          <td>
                            <div className="text-white text-center">
                              {inputChangeOutMile.length > 0 &&
                              index === inputChangeOutMile[0] ? (
                                <>
                                  <input
                                    className="form-control"
                                    value={valueMileOut}
                                    onChange={(e) =>
                                      setValueMileOut(e.target.value)
                                    }
                                  />
                                  <button
                                    className="btn btn-danger"
                                    onClick={() =>
                                      updateOutMile(
                                        item.Car_Registration,
                                        item.Out_Time,
                                        item.Name,
                                      )
                                    }
                                  >
                                    บันทึก
                                  </button>
                                </>
                              ) : (
                                <>
                                  {item.Number_Mile_Out}{" "}
                                  <span
                                    className="text-warning cursor-pointer"
                                    onClick={() =>
                                      ChangeMileOut(
                                        index,
                                        item.Car_Registration,
                                        item.Number_Mile_Out,
                                      )
                                    }
                                  >
                                    &#9998;
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="text-white text-center">
                              {item.In_Time?.split(".")[0].split("T")[0]}{" "}
                              {item.In_Time?.split("T")[1].split(".")[0]}
                            </div>
                          </td>
                          <td>
                            <div className="text-white text-center">
                              <>
                                {item.Number_Mile_In ? (
                                  <>
                                    {inputChangeInMile.length > 0 &&
                                    index === inputChangeInMile[0] ? (
                                      <>
                                        <input
                                          className="form-control"
                                          value={valueMileIn}
                                          onChange={(e) =>
                                            setValueMileIn(e.target.value)
                                          }
                                        />
                                        <button
                                          className="btn btn-danger"
                                          onClick={() =>
                                            updateOutIn(
                                              item.Car_Registration,
                                              item.Out_Time,
                                              item.Name,
                                              item.Number_Mile_Out
                                            )
                                          }
                                        >
                                          บันทึก
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        {item.Number_Mile_In}
                                        <span
                                          className="text-warning cursor-pointer"
                                          onClick={() =>
                                            updateInMile(
                                              index,
                                              item.Car_Registration,
                                              item.Number_Mile_Out,
                                              item.Number_Mile_In,
                                            )
                                          }
                                        >
                                          &#9998;
                                        </span>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  ""
                                )}
                              </>
                            </div>
                          </td>
                          <td>
                            <div className="text-white text-center">
                              {item.Other}
                            </div>
                          </td>
                          <td>
                            <div className="text-white text-center">
                              {item.Status === 1 ? (
                                <div className="text-success-new fs-5 fw-bold">
                                  Approve
                                </div>
                              ) : (
                                <>
                                  {item.Project != "" && (
                                    <button
                                      className="btn btn-warning"
                                      onClick={() =>
                                        SubmitApprove(
                                          member?.[0]?.Name || "",
                                          item.ID,
                                          item.Car_Registration,
                                          item.Number_Mile_Out,
                                        )
                                      }
                                    >
                                      Approve
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </>
                      ) : (
                        <></>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border-dashboard">
            {pageReport === 0 && (
              <div>
                <Bar />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
