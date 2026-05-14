'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from '../../../store/hook';
import { forgotPassword } from '../../../store/auth/AuthSlice';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(forgotPassword(email));
  };

  return (
    <div className={styles.page}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#111', borderRadius: 16,
        border: '1px solid #232323', padding: '2.5rem'
      }}>
        <h1 style={{ color: '#fff', fontSize: 26, marginBottom: 8 }}>Quên mật khẩu</h1>
        <p style={{ color: '#777', fontSize: 14, marginBottom: 24 }}>
          Nhập email để nhận link đặt lại mật khẩu
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {successMessage && (
          <div className={styles.error} style={{ color: '#9fe', background: '#0a2a1a', borderColor: '#1a5a3a' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputBox}>
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <i className="ti ti-mail" aria-hidden="true" />
          </div>
          <button type="submit" className={styles.btn} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#555' }}>
          <a href="/auth" style={{ color: '#c0392b' }}>← Quay lại đăng nhập</a>
        </p>
      </div>
    </div>
  );
}