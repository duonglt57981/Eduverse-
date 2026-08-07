"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from '@/src/store/hook';
import ContactPage from '@/src/components/landing/ContactPage';

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp !== "number") return false;
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

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
