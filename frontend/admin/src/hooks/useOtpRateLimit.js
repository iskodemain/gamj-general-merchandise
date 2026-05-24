/**
 * useOtpRateLimit  (admin copy)
 *
 * Max 3 resend attempts, then 3-minute lockout.
 * State persisted in sessionStorage so refresh keeps the lockout.
 *
 * @param {string} storageKey  e.g. "otp_rl_admin_login"
 */

import { useState, useEffect, useRef, useCallback } from "react";

const MAX_ATTEMPTS   = 3;
const LOCKOUT_SECONDS = 180; // 3 minutes

export function useOtpRateLimit(storageKey) {
  const readState = () => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return { attempts: 0, lockedUntil: null };
      return JSON.parse(raw);
    } catch {
      return { attempts: 0, lockedUntil: null };
    }
  };

  const writeState = (state) =>
    sessionStorage.setItem(storageKey, JSON.stringify(state));

  const [attempts,   setAttempts]   = useState(() => readState().attempts);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  const isLocked     = secondsLeft > 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attempts);

  const startCountdown = useCallback((until) => {
    const tick = () => {
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsLeft(0);
        clearInterval(timerRef.current);
        writeState({ attempts: 0, lockedUntil: null });
        setAttempts(0);
      } else {
        setSecondsLeft(remaining);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, [storageKey]);

  useEffect(() => {
    const saved = readState();
    setAttempts(saved.attempts);
    if (saved.lockedUntil && Date.now() < saved.lockedUntil) {
      startCountdown(saved.lockedUntil);
    }
    return () => clearInterval(timerRef.current);
  }, [storageKey]);

  const recordAttempt = useCallback(() => {
    const saved      = readState();
    const newAttempts = saved.attempts + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_SECONDS * 1000;
      writeState({ attempts: newAttempts, lockedUntil: until });
      setAttempts(newAttempts);
      clearInterval(timerRef.current);
      startCountdown(until);
    } else {
      writeState({ attempts: newAttempts, lockedUntil: null });
      setAttempts(newAttempts);
    }
  }, [storageKey, startCountdown]);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    sessionStorage.removeItem(storageKey);
    setAttempts(0);
    setSecondsLeft(0);
  }, [storageKey]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return {
    isLocked,
    attemptsLeft,
    secondsLeft,
    formattedTime: formatTime(secondsLeft),
    recordAttempt,
    reset,
    attempts,
    maxAttempts: MAX_ATTEMPTS,
  };
}
