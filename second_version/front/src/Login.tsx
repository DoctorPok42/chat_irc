import React, { useEffect, useState } from "react";
import emitEvent from "./tools/webSocketHandler";
import Cookies from "universal-cookie";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [isValide, setIsValide] = useState(false);
  const [loginType, setLoginType] = useState<"signin" | "signup">("signin");
  const [loginStep, setLoginStep] = useState<"phone" | "code">("phone");
  const [verifCode, setVerifCode] = useState<string>("");

  const cookies = new Cookies();
  const token = cookies.get("token");

  useEffect(() => {
    if (token) window.location.href = "/chats";
  }, [token]);

  useEffect(() => {
    if (loginStep === "code") return;
      const phoneRegex = new RegExp(/^(\d{2}\s){4}\d{2}$/);

      const phoneValue = document.querySelector("input[name=phone]") as HTMLInputElement;
      phoneValue.value = phoneValue.value.replace(/[^0-9]/g, "").replace(/(\d{2})(?=\d)/g, "$1 ");

      if (phoneRegex.test(phoneValue.value || phone)) {
        if (loginType === "signup" && username.length < 3) return setIsValide(false);
        setIsValide(true);
      } else {
        setIsValide(false);
      }
  }, [phone, loginStep, username]);

  const handleSubmit = async () => {
    const userPhone = phone.replace(/\s/g, "");
    emitEvent(loginType === "signin" ? "userLogin" : "userCreate", { phone: userPhone, ...username ? { username } : {}}, () => {
      setLoginStep("code")
      setIsValide(false);
    });
  }

  useEffect(() => {
    if (verifCode.length === 4) {
      setIsValide(true);
      setTimeout(() => {
        const validateBtn = document.getElementById("validateBtn") as HTMLInputElement;
      if (validateBtn) validateBtn.click();
      }, 1);
    } else {
      setIsValide(false);
    }
  }, [verifCode]);

  const handleSubmitCode = async () => {
    const userPhone = phone.replace(/\s/g, "");
    emitEvent("userLogin", { phone: userPhone, verifCode }, (data: any) => {
      cookies.set("token", data.token, { path: "/", maxAge: 60 * 60 * 24 });
      window.location.href = "/chats";
    });
  }

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
            <form>

              {loginStep === "phone" ?
                <>
                  <div className="inputBox">
                    <label>Phone number <span>*</span></label>
                    <input type="text" name="phone" required onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  {loginType === "signup" && <div className="inputBox">
                    <label>Username <span>*</span></label>
                    <input type="text" name="username" required onChange={(e) => setUsername(e.target.value)} />
                  </div>}

                  <div className="inputBox">
                    <input type="button" value="Get my code" style={{
                      backgroundColor: isValide ? "var(--green)" : "var(--white-dark)",
                      cursor: isValide ? "pointer" : "not-allowed"
                    }} disabled={!isValide} onClick={handleSubmit} />
                  </div>
                </>
                :
                <div className="secondLoginPart">
                  <div className="title">
                    Secret code received by SMS
                  </div>

                  <div className="inputCode">
                    {
                      Array.from({ length: 4 }, (_, i) => (
                        <input key={i} type="number" maxLength={1}
                        onInput={(e: any) => {
                          const nextInput = e.target.nextElementSibling;
                          if (e.target.value.length === 1 && nextInput) nextInput.focus();
                        }}
                        onChange={(e: any) => {
                          const inputs = document.querySelectorAll(".inputCode input") as any;
                          let code = "";
                          inputs.forEach((input: any) => {
                            code += input.value;
                          });
                          setVerifCode(code || "");
                        }}
                        />
                      ))
                    }
                  </div>

                  <div className="inputBox">
                    <input type="button" id="validateBtn" value="Validate code" style={{
                      backgroundColor: isValide ? "var(--green)" : "var(--white-dark)",
                      cursor: isValide ? "pointer" : "not-allowed"
                    }} disabled={!isValide} onClick={handleSubmitCode} />
                  </div>
                </div>
              }
            </form>
            {loginStep === "phone" && <div className="register">
              <p>
                {loginType === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setLoginType(loginType === "signin" ? "signup" : "signin")}>{loginType === "signin" ? "Sign up" : "Sign in"}</button>
              </p>
            </div>}
          </div>
        </div>
      </main>
    </>
  );
}
