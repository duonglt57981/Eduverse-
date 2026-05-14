"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "../../store/hook";
import { login, register, clearError } from "../../store/auth/AuthSlice";
import styles from "./auth.module.css";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  const [loginForm, setLoginForm] = useState({ userName: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    userName: "", hoTen: "", email: "", password: "",
  });

  // ← Clear error khi chuyển giữa login/register
  useEffect(() => {
    dispatch(clearError());
  }, [isRegister]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login(loginForm));
    if (login.fulfilled.match(result)) router.push("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(register(registerForm));
    if (register.fulfilled.match(result)) {
      setIsRegister(false);
      setShowPass(false);
      setLoginForm({ userName: registerForm.userName, password: "" });
    }
  };

  return (
    <div className={`${styles.page} ${isRegister ? styles.active : ""}`}>
      <div className={styles.container}>

        {/* ── LOGIN FORM ── */}
        <div className={`${styles.formBox} ${styles.login}`}>
          <form onSubmit={handleLogin}>
            <h1>Login</h1>

            {/* Hiện error + successMessage */}
            {!isRegister && error && (
              <div className={styles.error}>{error}</div>
            )}
            {!isRegister && successMessage && (
              <div className={styles.success}>{successMessage}</div>
            )}

            <div className={styles.inputBox}>
              <input
                type="text"
                placeholder="Username"
                value={loginForm.userName}
                onChange={(e) => setLoginForm({ ...loginForm, userName: e.target.value })}
                required
              />
              <i className="ti ti-user" aria-hidden="true" />
            </div>

            <div className={styles.inputBox}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <button type="button" className={styles.passToggle}
                onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                <i className={`ti ti-eye${showPass ? "-off" : ""}`} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.forgotLink}>
              <a href="/auth/forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Login"}
            </button>

            <p>or login with social platforms</p>
            <div className={styles.socialIcons}>
              <a href="#"><i className="ti ti-brand-google" /></a>
              <a href="#"><i className="ti ti-brand-facebook" /></a>
              <a href="#"><i className="ti ti-brand-github" /></a>
              <a href="#"><i className="ti ti-brand-linkedin" /></a>
            </div>
          </form>
        </div>

        {/* ── REGISTER FORM ── */}
        <div className={`${styles.formBox} ${styles.register}`}>
          <form onSubmit={handleRegister}>
            <h1>Registration</h1>

            {isRegister && error && (
              <div className={styles.error}>{error}</div>
            )}
            {isRegister && successMessage && (
              <div className={styles.success}>{successMessage}</div>
            )}

            <div className={styles.inputBox}>
              <input type="text" placeholder="Username"
                value={registerForm.userName}
                onChange={(e) => setRegisterForm({ ...registerForm, userName: e.target.value })}
                required />
              <i className="ti ti-user" aria-hidden="true" />
            </div>

            <div className={styles.inputBox}>
              <input type="text" placeholder="Họ tên"
                value={registerForm.hoTen}
                onChange={(e) => setRegisterForm({ ...registerForm, hoTen: e.target.value })}
                required />
              <i className="ti ti-id-badge" aria-hidden="true" />
            </div>

            <div className={styles.inputBox}>
              <input type="email" placeholder="Email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required />
              <i className="ti ti-mail" aria-hidden="true" />
            </div>

            <div className={styles.inputBox}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required />
              <button type="button" className={styles.passToggle}
                onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                <i className={`ti ti-eye${showPass ? "-off" : ""}`} aria-hidden="true" />
              </button>
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? "Đang tạo tài khoản..." : "Register"}
            </button>

            <p>or register with social platforms</p>
            <div className={styles.socialIcons}>
              <a href="#"><i className="ti ti-brand-google" /></a>
              <a href="#"><i className="ti ti-brand-facebook" /></a>
              <a href="#"><i className="ti ti-brand-github" /></a>
              <a href="#"><i className="ti ti-brand-linkedin" /></a>
            </div>
          </form>
        </div>

        {/* ── TOGGLE PANEL ── */}
        <div className={styles.toggleBox}>
          <div className={`${styles.togglePanel} ${styles.toggleLeft}`}>
            <Image src="/auth/img/Eduverse-logo.png" alt="EduVerse"
              width={200} height={67} className={styles.logo} />
            <h1>Hello, Welcome!</h1>
            <p>Dont have an account?</p>
            <button type="button"
              className={`${styles.btn} ${styles.toggleBtn}`}
              onClick={() => setIsRegister(true)}>
              Register
            </button>
          </div>

          <div className={`${styles.togglePanel} ${styles.toggleRight}`}>
            <Image src="/auth/img/Eduverse-logo.png" alt="EduVerse"
              width={200} height={67} className={styles.logo} />
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button type="button"
              className={`${styles.btn} ${styles.toggleBtn}`}
              onClick={() => setIsRegister(false)}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}