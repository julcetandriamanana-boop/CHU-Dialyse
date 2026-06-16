'use client';

import { useState, useEffect } from 'react';
import { getHeureMadagascar, formatDateLong, todayMadagascar } from '@/src/utils/date.utils';

interface Props {
  showDate?: boolean;
  showSeconds?: boolean;
  className?: string;
}

export default function MadagascarClock({ showDate = false, showSeconds = true, className = '' }: Props) {
  const [time, setTime] = useState('--:--:--');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(getHeureMadagascar());
      if (showDate) {
        setDate(formatDateLong(new Date().toISOString()));
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [showDate]);

  const displayTime = showSeconds ? time : time.substring(0, 5);

  return (
    <div className={`flex flex-col items-end ${className}`}>
      <span className="font-black tabular-nums">{displayTime}</span>
      {showDate && date && (
        <span className="text-[10px] opacity-70">{date}</span>
      )}
      <span className="text-[9px] opacity-50 font-semibold">EAT UTC+3</span>
    </div>
  );
}
