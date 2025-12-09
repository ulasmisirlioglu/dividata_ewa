import React from 'react';
import clsx from 'clsx';

export const FigLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={clsx("font-mono text-[10px] uppercase tracking-widest text-hb-gray block mb-2", className)}>
    {children}
  </span>
);

export const ScribbleCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={clsx("absolute w-32 h-32 pointer-events-none text-hb-accent", className)} fill="none" stroke="currentColor" strokeWidth="0.5">
    <path d="M50,10 C20,10 10,40 10,50 C10,70 30,90 50,90 C80,90 90,60 90,50 C90,30 70,10 50,10 Z M48,12 C75,12 88,40 88,50" strokeDasharray="4 2" />
  </svg>
);

export const DecorativeGrid: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="container mx-auto h-full border-l border-r border-hb-line/30 grid grid-cols-1 md:grid-cols-12 h-full">
      {/* Vertical Lines */}
      <div className="hidden md:block col-span-1 border-r border-hb-line/30 h-full" />
      <div className="hidden md:block col-span-3 border-r border-hb-line/30 h-full" />
      <div className="hidden md:block col-span-4 border-r border-hb-line/30 h-full" />
      <div className="hidden md:block col-span-3 border-r border-hb-line/30 h-full" />
      <div className="hidden md:block col-span-1 h-full" />
    </div>
  </div>
);

