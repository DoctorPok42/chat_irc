import React, { useEffect, useState } from "react";
import emitEvent from "./tools/webSocketHandler";
import Cookies from "universal-cookie";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isValide, setIsValide] = useState(false);
  const [loginType, setLoginType] = useState<"signin" | "signup">("signin");

  const cookies = new Cookies();
  const token = cookies.get("token");

  useEffect(() => {
    if (token) window.location.href = "/chats";
  }, [token]);

  useEffect(() => {
      if (username.length >= 3 && password.length >= 6) setIsValide(true);
      else setIsValide(false);
  }, [loginType, username, password]);

  const handleSubmit = async () => {
    emitEvent(loginType === "signin" ? "login" : "register", { username, password }, (data: any) => {
      setIsValide(false);
    });
  };

  return (
    <>
      <head>
        <title>Login ~ WhatsUp</title>
        <meta name="description" content="WhatsUp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#5ad27d" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <main className="container">
        <div className="contentLogin">
          <div className="header">
            <div className="logo">
              <img src="/favicon.ico" alt="WhatsUp" width={160} height={160} />
            </div>
            <h1>WhatsUp</h1>

            <div className="subtitle">
              <h3>{loginType === "signin" ? "Sign in" : "Sign up"}</h3>
              <p>Your phone number is your WhatsUp ID</p>
            </div>
          </div>

          <div className="loginBox">
            <form id="loginForm">
              <div className="inputBox">
                <label form="loginForm">Username <span>*</span></label>
                <input type="text" name="username" required onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="inputBox">
                <label form="loginForm">Password <span>*</span></label>
                <input type="password" name="password" required onChange={(e) => setPassword(e.target.value)} />
              </div>

              <div className="inputBox">
                <input type="button" value={loginType === "signin" ? "Sign in" : "Sign up"} style={{
                  backgroundColor: isValide ? "var(--green)" : "var(--white-dark)",
                  cursor: isValide ? "pointer" : "not-allowed"
                }} disabled={!isValide} onClick={handleSubmit} />
              </div>
            </form>
            <div className="register">
              <p>
                {loginType === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setLoginType(loginType === "signin" ? "signup" : "signin")}>{loginType === "signin" ? "Sign up" : "Sign in"}</button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
