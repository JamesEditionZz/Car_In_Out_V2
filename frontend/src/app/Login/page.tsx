"use client";
import React, { useState } from "react";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";

export default function page() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  const Submit = async () => {
    const res = await fetch(`../api/POST/Login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const response = await res.json();

    if (response[0].Status === 99) {
      router.push("../HeaderCIO");
    } else {
      router.push("../CIO");
    }
  };

  const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const res = await fetch(`../api/POST/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const response = await res.json();

      if (response[0].Status === 99) {
        router.push(`../HeaderCIO?username=${username}`);
      } else {
        router.push("../CIO");
      }
    }
  };

  return (
    <div className="page-login">
      <div className="fs-1 fw-bold text-center">SCAN IN OUT</div>
      <div className="border-login mt-3">
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
                onKeyDown={(e) =>
                  handleEnter(e as React.KeyboardEvent<HTMLInputElement>)
                }
              />
            </div>
          </div>
          <div className="mt-3 text-center">
            <button className="btn-login" onClick={() => Submit()}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
