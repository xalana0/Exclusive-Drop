'use client';

import { useState, useEffect } from "react";

// Componente que exibe um relógio digital.
export default function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="text-6xl font-bold text-green-500 bg-black p-8 rounded-xl border-4 border-green-500 font-mono">
        {formatTime(time)}
      </div>
    </div>
  );
}