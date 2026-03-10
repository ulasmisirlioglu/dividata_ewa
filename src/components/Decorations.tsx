import React from 'react';
import clsx from 'clsx';

export const ScribbleCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={clsx("absolute w-32 h-32 pointer-events-none text-hb-accent", className)} fill="none" stroke="currentColor" strokeWidth="0.5">
    <path d="M50,10 C20,10 10,40 10,50 C10,70 30,90 50,90 C80,90 90,60 90,50 C90,30 70,10 50,10 Z M48,12 C75,12 88,40 88,50" strokeDasharray="4 2" />
  </svg>
);
