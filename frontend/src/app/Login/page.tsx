"use client";
import React, { useState } from "react";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [opacity, setOpacity] = useState<boolean>(false);
  const [modelFailed, setModelFailed] = useState<boolean>(false);

  const router = useRouter();

  const Submit = async () => {
    const res = await fetch(`../api/POST/Login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const response: { Status: number }[] = await res.json();

    if (response[0]) {
      if (response[0].Status === 99) {
        setOpacity(true);
        setTimeout(() => {
          router.push(`../HeaderCIO?username=${username}`);
        }, 500);
      } else {
        setOpacity(true);
        setTimeout(() => {
          router.push("../CIO");
        }, 500);
      }
    } else {
      setModelFailed(true);
    }
  };

  const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const res = await fetch(`../api/POST/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const response: { Status: number }[] = await res.json();

      if (response[0]) {
        if (response[0].Status === 99) {
          setOpacity(true);
          setTimeout(() => {
            router.push(`../HeaderCIO?username=${username}`);
          }, 500);
        } else {
          setOpacity(true);
          setTimeout(() => {
            router.push("../CIO");
          }, 500);
        }
      } else {
        setModelFailed(true);
      }
    }
  };

  return (
    <>
      {modelFailed && (
        <div className="model-alert-danger bg-danger">
          <div className="text-center text-white fs-5 fw-bold">
            Username หรือ Password ไม่ถูกต้อง
          </div>
        </div>
      )}
      <div
        className={`page-login opacity ${opacity ? "opacity-rollback" : ""}`}
      >
        <div className="fs-1 fw-bold text-center">SCAN IN OUT</div>
        <div className={`border-login mt-3`}>
          <div className="form-login">
            <div className="align-content-center">
              <div className="text-center">
                <input
                  className="form-control-input mt-5"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="text-center">
                <input
                  type="password"
                  className="form-control-input"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleEnter}
                />
              </div>
            </div>
            <div className="mt-3 text-center">
              <button className="btn-login" onClick={Submit}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
