"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from '@/src/store/hook';
import ContactPage from '@/src/components/landing/ContactPage';

import { isTokenExpired } from '@/src/utils/jwt';

export default function ContactRoute() {
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);
  const hasUser = !!(user && user.accessToken && !isTokenExpired(user.accessToken));

  useEffect(() => {
    if (!hasUser) {
      router.replace('/');
    }
  }, [hasUser, router]);

  if (!hasUser) {
    return null;
  }

  return <ContactPage />;
}
