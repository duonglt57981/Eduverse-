/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';


import { useEffect, useRef } from 'react';
import { signalRClient } from '../libs/signalRHelper/signalrClient';

export function useSignalR(eventName: string, handler: (data: any) => void) {
  const handlerRef = useRef(handler);

  // luôn giữ handler mới nhất
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    let mounted = true;
    const connection = signalRClient.getConnection();

    const wrappedHandler = (data: any) => {
      handlerRef.current(data);
    };

    const start = async () => {
      await signalRClient.start();

      if (!mounted) return;

      connection.off(eventName);
      connection.on(eventName, wrappedHandler);
    };

    start();

    return () => {
      mounted = false;
      connection.off(eventName, wrappedHandler);
    };
  }, [eventName]);
}
