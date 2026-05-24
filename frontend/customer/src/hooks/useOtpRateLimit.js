/**
 * useOtpRateLimit
 *
 * Shared hook for OTP resend rate limiting.
 * Rules:
 *   - Max 3 resend attempts per session key.
 *   - After the 3rd attempt a 3-minute (180 s) lockout starts.
 *   - State is persisted in sessionStorage so a page refresh keeps the lockout.
 *
 * @param {string} storageKey  - Unique key per flow, e.g. "otp_rl_customer_login"
 */

import { useState, useEffect, useRef, useCallback } from "react";

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 180; // 3 minutes

export function useOtpRateLimit(storageKey) {
  // ── Helpers ──────────────────────────────────────────────────────────────
  const readState = () => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return { attempts: 0, lockedUntil: null };
      return JSON.parse(raw);
    } catch {
      return { attempts: 0, lockedUntil: null };
    }
  };

  const writeState = (state) => {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  };

  // ── State ─────────────────────────────────────────────────────────────────
  const [attempts, setAttempts] = useState(() => readState().attempts);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const isLocked = secondsLeft > 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attempts);

  // ── Countdown ticker ──────────────────────────────────────────────────────
  const startCountdown = useCallback((until) => {
    const tick = () => {
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsLeft(0);
        clearInterval(timerRef.current);
        // Reset attempts after lockout expires
        const fresh = { attempts: 0, lockedUntil: null };
        writeState(fresh);
        setAttempts(0);
      } else {
        setSecondsLeft(remaining);
      }
    };
    tick(); // run immediately
    timerRef.current = setInterval(tick, 1000);
  }, [storageKey]);

  // ── On mount: restore any active lockout ──────────────────────────────────
  useEffect(() => {
    const saved = readState();
    setAttempts(saved.attempts);
    if (saved.lockedUntil && Date.now() < saved.lockedUntil) {
      startCountdown(saved.lockedUntil);
    }
    return () => clearInterval(timerRef.current);
  }, [storageKey]);

  // ── recordAttempt: call this right before firing the resend API ───────────
  const recordAttempt = useCallback(() => {
    const saved = readState();
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

  // ── reset: call this when the user successfully verifies (clean slate) ────
  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    sessionStorage.removeItem(storageKey);
    setAttempts(0);
    setSecondsLeft(0);
  }, [storageKey]);

  // ── Format mm:ss ──────────────────────────────────────────────────────────
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
