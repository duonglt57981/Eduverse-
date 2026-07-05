'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from '@/src/store/hook';
import { Box, Paper, Typography } from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Roles allowed to access this page. If empty, any authenticated user can access. */
  allowedRoles?: string[];
}

/**
 * AuthGuard — Client-side route protection component.
 * 
 * Wraps pages that require authentication and/or specific roles.
 * - If user is not logged in → redirects to /auth/login
 * - If user doesn't have the required role → shows 403 Forbidden page
 * 
 * Usage:
 *   <AuthGuard allowedRoles={['Admin']}>
 *     <AdminPage />
 *   </AuthGuard>
 */
export default function AuthGuard({ children, allowedRoles = [] }: AuthGuardProps) {
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);
  const roles = useSelector((s) => s.auth.roles) || [];
  const [checked, setChecked] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const getHomeRoute = () => {
    if (roles.includes('Admin')) return '/admin/dashboard';
    if (roles.includes('GiaoVien')) return '/instructor/dashboard';
    return '/student/dashboard';
  };

  useEffect(() => {
    // Not logged in → redirect to login
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Check role permission
    if (allowedRoles.length > 0) {
      const hasPermission = allowedRoles.some((role) => roles.includes(role));
      if (!hasPermission) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForbidden(true);
        setChecked(true);
        return;
      }
    }

    setChecked(true);
  }, [user, roles, allowedRoles, router]);

  // Show 403 Forbidden page
  if (forbidden) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: '#FFF8F6',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            px: 6,
            py: 5,
            borderRadius: '24px',
            border: '1px solid rgba(0,0,0,0.06)',
            textAlign: 'center',
            maxWidth: 440,
          }}
        >
          <Typography
            sx={{
              fontSize: 64,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            403
          </Typography>
          <Typography
            sx={{
              mt: 2,
              fontSize: 20,
              fontWeight: 800,
              color: '#1F2937',
            }}
          >
            Không có quyền truy cập
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: '#6B7280',
              lineHeight: 1.6,
            }}
          >
            Bạn không có quyền truy cập trang này.
            Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.
          </Typography>
          <Box
            component="button"
            onClick={() => router.push(getHomeRoute())}
            sx={{
              mt: 3,
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              border: 'none',
              background: 'linear-gradient(90deg, #8b1a1a 0%, #7f1d1d 55%, #6b1414 100%)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(127,29,29,0.2)',
              transition: 'all 200ms ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(127,29,29,0.3)',
              },
            }}
          >
            Về trang chủ
          </Box>
        </Paper>
      </Box>
    );
  }

  // Not yet checked → show nothing (avoid flash)
  if (!checked) return null;

  return <>{children}</>;
}
