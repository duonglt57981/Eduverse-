'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import { login } from '../../../store/auth/AuthSlice';
import styles from './login.module.css';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm]         = useState({ userName: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) router.push('/');
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
            Chào mừng bạn trở lại với tri thức đỉnh cao.
          </h1>
          <p className={styles.leftDesc}>
            Hành trình chinh phục sự nghiệp của bạn bắt đầu từ việc không ngừng học hỏi tại môi trường chuẩn quốc tế.
          </p>
          <div className={styles.classroomImg}>
            <Image
              src="/auth/img/classroom.jpg"
              alt="Classroom"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>

        <div className={styles.leftFeatures}>
          {[
            { icon: 'ti-award', label: 'Expert Mentors' },
            { icon: 'ti-book', label: 'Modern Curriculum' },
            { icon: 'ti-certificate', label: 'Global Certification' },
          ].map((f) => (
            <div key={f.label} className={styles.featureItem}>
              <i className={`ti ${f.icon}`} aria-hidden="true" />
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>Đăng nhập</h2>
          <p className={styles.formSubtitle}>Truy cập vào tài khoản EduVerse Premium của bạn</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Tên đăng nhập</label>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  placeholder="Nhập username của bạn"
                  value={form.userName}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                  required
                />
                <i className="ti ti-user" aria-hidden="true" />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Mật khẩu</label>
                <a href="/auth/forgot-password" className={styles.forgot}>Quên mật khẩu?</a>
              </div>
              <div className={styles.inputWrap}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                  <i className={`ti ti-eye${showPass ? '-off' : ''}`} aria-hidden="true" />
                </button>
              </div>
            </div>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
            </button>
          </form>

          <div className={styles.divider}><span>Hoặc tiếp tục với</span></div>

          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn}>
              <i className="ti ti-brand-google" aria-hidden="true" />
              Google
            </button>
            <button type="button" className={styles.socialBtn}>
              <i className="ti ti-brand-facebook" aria-hidden="true" />
              Facebook
            </button>
          </div>

          <p className={styles.switchText}>
            Chưa có tài khoản? <a href="/auth/register">Đăng ký ngay</a>
          </p>
        </div>

        <p className={styles.copyright}>© 2024 EduVerse Academy of Excellence. All rights reserved.</p>
      </div>
    </div>
  );
}
