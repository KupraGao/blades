"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_VISIBLE_MS = 1800;
const EXIT_MS = 220;

/**
 * Local session counter + visibility for floating Add-to-Cart feedback.
 * Does not touch cart business logic.
 */
export function useAddToCartFloatFeedback(
  visibleMs = DEFAULT_VISIBLE_MS,
) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  function notifyAdded() {
    clearTimers();
    setExiting(false);
    setVisible(true);
    setCount((current) => current + 1);

    hideTimerRef.current = setTimeout(() => {
      setExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setVisible(false);
        setExiting(false);
        setCount(0);
        exitTimerRef.current = null;
      }, EXIT_MS);
      hideTimerRef.current = null;
    }, visibleMs);
  }

  return {
    count,
    visible,
    exiting,
    notifyAdded,
  };
}
