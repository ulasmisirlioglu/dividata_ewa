import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const MONTHS_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

interface MonthPickerProps {
  value: string; // "YYYY-MM" or ""
  onChange: (value: string) => void;
  min?: string; // "YYYY-MM"
  placeholder?: string;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange, min, placeholder = '---------- ----' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse current value or default to current date for picker display
  const now = new Date();
  const [displayYear, setDisplayYear] = useState(() => {
    if (value) return parseInt(value.split('-')[0]);
    return now.getFullYear();
  });

  const selectedYear = value ? parseInt(value.split('-')[0]) : null;
  const selectedMonth = value ? parseInt(value.split('-')[1]) : null;

  // Update displayYear when value changes externally
  useEffect(() => {
    if (value) {
      setDisplayYear(parseInt(value.split('-')[0]));
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const minYear = min ? parseInt(min.split('-')[0]) : null;
  const minMonth = min ? parseInt(min.split('-')[1]) : null;

  const isDisabled = (month: number) => {
    if (!minYear || !minMonth) return false;
    if (displayYear < minYear) return true;
    if (displayYear === minYear && month < minMonth) return true;
    return false;
  };

  const handleSelect = (month: number) => {
    if (isDisabled(month)) return;
    const val = `${displayYear}-${String(month).padStart(2, '0')}`;
    onChange(val);
    setOpen(false);
  };

  const formatDisplay = (val: string) => {
    if (!val) return placeholder;
    const [y, m] = val.split('-').map(Number);
    return `${MONTHS_DE[m - 1]} ${y}`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-transparent border-b border-hb-line hover:border-hb-gray focus:border-hb-ink focus:outline-none py-1 transition-all text-sm cursor-pointer whitespace-nowrap"
      >
        <span className={value ? 'text-hb-ink' : 'text-hb-gray/50'}>{formatDisplay(value)}</span>
        <Calendar size={14} className="text-hb-gray/50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-hb-line shadow-lg p-3 w-56 animate-fade-in">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setDisplayYear(displayYear - 1)}
              className="p-1 hover:bg-hb-paper rounded transition-colors text-hb-gray hover:text-hb-ink"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-hb-ink">{displayYear}</span>
            <button
              type="button"
              onClick={() => setDisplayYear(displayYear + 1)}
              className="p-1 hover:bg-hb-paper rounded transition-colors text-hb-gray hover:text-hb-ink"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS_DE.map((name, i) => {
              const month = i + 1;
              const disabled = isDisabled(month);
              const isSelected = selectedYear === displayYear && selectedMonth === month;
              return (
                <button
                  key={month}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(month)}
                  className={`
                    text-xs py-1.5 px-2 rounded transition-colors
                    ${disabled ? 'text-hb-gray/30 cursor-not-allowed' : 'hover:bg-hb-paper cursor-pointer'}
                    ${isSelected ? 'bg-hb-ink text-white hover:bg-hb-ink' : ''}
                  `}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
