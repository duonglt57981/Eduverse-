'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import { resetPassword } from '../../../store/auth/AuthSlice';
import styles from '../auth.module.css';

export default function ResetPasswordPage() {
  const dispatch    = useDispatch();
  const router      = useRouter();
  const params      = useSearchParams();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = params.get('userId') || '';
    const token  = params.get('token') || '';
    const result = await dispatch(resetPassword({ userId, token, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => router.push('/auth'), 2000);
    }
  };

  return (
    <div className={styles.page}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#111', borderRadius: 16,
        border: '1px solid #232323', padding: '2.5rem'
      }}>
        <h1 style={{ color: '#fff', fontSize: 26, marginBottom: 8 }}>Đặt lại mật khẩu</h1>
        <p style={{ color: '#777', fontSize: 14, marginBottom: 24 }}>Nhập mật khẩu mới của bạn</p>

        {error && <div className={styles.error}>{error}</div>}
        {successMessage && (
          <div className={styles.error} style={{ color: '#9fe', background: '#0a2a1a', borderColor: '#1a5a3a' }}>
            {successMessage} — Đang chuyển hướng...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputBox}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
            <button type="button" className={styles.passToggle}
              onClick={() => setShowPass(!showPass)}>
              <i className={`ti ti-eye${showPass ? '-off' : ''}`} aria-hidden="true" />
            </button>
          </div>
          <button type="submit" className={styles.btn} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}