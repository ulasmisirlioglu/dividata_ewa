import React from 'react';
import clsx from 'clsx';
import { useLangStore } from '../store/useLangStore';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLangStore();

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => setLanguage('de')}
        className={clsx(
          "text-xs font-mono uppercase tracking-widest px-2 py-1 transition-colors",
          language === 'de' ? "text-hb-ink font-medium border-b border-hb-ink" : "text-hb-gray hover:text-hb-ink"
        )}
      >
        DE
      </button>
      <span className="text-hb-line">|</span>
      <button
        onClick={() => setLanguage('en')}
        className={clsx(
          "text-xs font-mono uppercase tracking-widest px-2 py-1 transition-colors",
          language === 'en' ? "text-hb-ink font-medium border-b border-hb-ink" : "text-hb-gray hover:text-hb-ink"
        )}
      >
        EN
      </button>
    </div>
  );
};

