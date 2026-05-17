"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "../../../store/hook";
import { register } from "../../../store/auth/AuthSlice";
import styles from "./register.module.css";
import Link from "next/link";

function getStrength(password: string) {
  let score = 0;
  const hasMin = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password) && /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  if (hasMin) score++;
  if (hasUpper) score++;
  if (hasSpecial) score++;
  return { score, hasMin, hasUpper, hasSpecial };
}

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    userName: "",
    hoTen: "",
    phoneNumber: "",
    password: "",
  });
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeNews, setAgreeNews] = useState(true);

  const strength = useMemo(() => getStrength(form.password), [form.password]);

  const strengthLabel = ["", "Yếu", "Trung bình", "Mạnh"][strength.score] || "";
  const strengthColor =
    ["", "active", "medium", "strong"][strength.score] || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return alert("Vui lòng đồng ý với điều khoản dịch vụ");
    if (form.password !== confirmPass)
      return alert("Mật khẩu xác nhận không khớp");
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      router.push("/auth/login");
    }
  };

  return (
    <div className={styles.page}>
      {/* ── LEFT PANEL ── */}
      <div className={styles.left}>
        <div className={styles.leftHeader}>
          <div className={styles.logoWrap}>
            <div className={styles.logoIcon}>
              <i className="ti ti-school" aria-hidden="true" />
            </div>
            <span className={styles.logoText}>EduVerse</span>
          </div>
        </div>

        <div className={styles.leftContent}>
          <h1 className={styles.leftTitle}>
            Bắt đầu hành trình học tập cùng EduVerse
          </h1>
          <p className={styles.leftDesc}>
            Nền tảng giáo dục Ivy League kỹ thuật số, kết nối bạn với những kiến
            thức tinh hoa từ các chuyên gia hàng đầu thế giới.
          </p>

          <div className={styles.featuredCard}>
            <div className={styles.featuredIcon}>
              <i className="ti ti-trophy" aria-hidden="true" />
            </div>
            <div>
              <div className={styles.featuredCardTitle}>
                Thành tích xuất sắc
              </div>
              <div className={styles.featuredCardSub}>Khóa học AI nâng cao</div>
            </div>
          </div>

          <div className={styles.certBadge}>
            <i className="ti ti-rosette-discount-check" aria-hidden="true" />
            GLOBAL CERTIFICATION
          </div>

          <div className={styles.studentCard}>
            <div className={styles.studentAvatar}>
              <i className="ti ti-user" aria-hidden="true" />
              <span className={styles.onlineDot} />
            </div>
            <div>
              <div className={styles.studentName}>Học viên tiêu biểu</div>
              <div className={styles.studentSub}>Đã hoàn thành 15 khóa học</div>
            </div>
          </div>
        </div>

        <div className={styles.leftStats}>
          {[
            { num: "10K+", label: "Học viên" },
            { num: "500+", label: "Khóa học" },
            { num: "120+", label: "Giảng viên" },
          ].map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.right}>
        <div className={styles.rightHeader}>
          <Link href="/" className={styles.backLink}>
            <i className="ti ti-arrow-left" aria-hidden="true" />
            Quay lại trang chủ
          </Link>
        </div>

        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>Đăng ký tài khoản</h2>
          <p className={styles.formSubtitle}>
            Chào mừng bạn! Hãy điền thông tin để bắt đầu.
          </p>

          {error && <div className={styles.error}>{error}</div>}
          {successMessage && (
            <div className={styles.success}>{successMessage}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={form.hoTen}
                  onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  placeholder="Tên đăng nhập (username)"
                  value={form.userName}
                  onChange={(e) =>
                    setForm({ ...form, userName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.inputWrap}>
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.inputWrap}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle"
                >
                  <i
                    className={`ti ti-eye${showPass ? "-off" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {form.password && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthLabel}>
                    <span>Độ bảo mật</span>
                    <span>{strengthLabel}</span>
                  </div>
                  <div className={styles.strengthBar}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`${styles.strengthSeg} ${i < strength.score ? styles[strengthColor] : ""}`}
                      />
                    ))}
                  </div>
                  <div className={styles.strengthHints}>
                    <span
                      className={`${styles.hint} ${strength.hasMin ? styles.ok : ""}`}
                    >
                      <i
                        className={`ti ti-${strength.hasMin ? "check" : "x"}`}
                        aria-hidden="true"
                      />
                      Ít nhất 8 ký tự
                    </span>
                    <span
                      className={`${styles.hint} ${strength.hasUpper ? styles.ok : ""}`}
                    >
                      <i
                        className={`ti ti-${strength.hasUpper ? "check" : "circle"}`}
                        aria-hidden="true"
                      />
                      Chữ hoa & chữ số
                    </span>
                    <span
                      className={`${styles.hint} ${strength.hasSpecial ? styles.ok : ""}`}
                    >
                      <i
                        className={`ti ti-${strength.hasSpecial ? "check" : "circle"}`}
                        aria-hidden="true"
                      />
                      Ký tự đặc biệt
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.inputWrap}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                />
              </div>
            </div>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                Tôi đồng ý với <a href="/terms">Điều khoản dịch vụ</a> và{" "}
                <a href="/privacy">Chính sách bảo mật</a>.
              </span>
            </label>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={agreeNews}
                onChange={(e) => setAgreeNews(e.target.checked)}
              />
              <span>
                Đăng ký nhận thông báo về khóa học mới và ưu đãi đặc biệt qua
                email.
              </span>
            </label>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản →"}
            </button>
          </form>

          <div className={styles.divider}>
            <span>Hoặc tiếp tục với</span>
          </div>

          <div className={styles.socialRow}>
            {[
              "ti-brand-google",
              "ti-brand-facebook",
              "ti-brand-github",
              "ti-brand-linkedin",
            ].map((icon) => (
              <button key={icon} type="button" className={styles.socialBtn}>
                <i className={`ti ${icon}`} aria-hidden="true" />
              </button>
            ))}
          </div>

          <p className={styles.switchText}>
            Đã có tài khoản? <a href="/auth/login">Đăng nhập ngay</a>
          </p>

          <div className={styles.secureRow}>
            <span className={styles.secureBadge}>
              <i className="ti ti-lock" aria-hidden="true" /> SSL SECURE
            </span>
            <span className={styles.secureBadge}>
              <i className="ti ti-shield-check" aria-hidden="true" /> PRIVACY
              PROTECTED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
