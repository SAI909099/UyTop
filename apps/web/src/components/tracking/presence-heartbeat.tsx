"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const VISITOR_SESSION_STORAGE_KEY = 'uytop_visitor_session_key';
const HEARTBEAT_INTERVAL_MS = 60_000;

function generateSessionKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateSessionKey() {
  const stored = window.localStorage.getItem(VISITOR_SESSION_STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const nextValue = generateSessionKey();
  window.localStorage.setItem(VISITOR_SESSION_STORAGE_KEY, nextValue);
  return nextValue;
}

export function PresenceHeartbeat() {
  const pathname = usePathname();
  const sessionKeyRef = useRef<string>('');

  useEffect(() => {
    sessionKeyRef.current = getOrCreateSessionKey();
  }, []);

  useEffect(() => {
    const sessionKey = sessionKeyRef.current || getOrCreateSessionKey();
    sessionKeyRef.current = sessionKey;

    async function sendHeartbeat() {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      await fetch('/api/presence/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          session_key: sessionKey,
          current_path: pathname || '/',
        }),
        keepalive: true,
      }).catch(() => null);
    }

    void sendHeartbeat();
    const intervalId = window.setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pathname]);

  return null;
}
