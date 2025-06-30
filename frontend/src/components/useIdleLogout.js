import { useEffect, useRef, useState } from "react";
import SessionEndWarning from "./SessionEndWarning";

const useIdleLogout = (timeout = 5 * 60 * 1000) => { // 5 min

  const timeoutId = useRef(null);

  const resetTimer = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      SessionEndWarning(true);
    }, timeout);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'click'];

    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer(); // Start the initial timer

    return () => {
      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(timeoutId.current);
    };
  }, []);
};
