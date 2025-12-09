import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { ArrowRight } from 'lucide-react';
import { ScribbleCircle } from '../components/Decorations';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { municipalityName, setMunicipalityName, useCase, setUseCase } = useStore();
  const { t } = useLangStore();

  const handleStart = () => {
    navigate('/analog-process');
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
        {/* Left Column - Hero Text */}
        <div className="lg:col-span-7 pt-12 relative">
          <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tighter leading-[0.9] mb-12 whitespace-pre-line">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl font-light text-hb-gray max-w-md leading-relaxed">
            {t.heroSubtitle}
          </p>
          <ScribbleCircle className="-top-10 -left-10 opacity-10" />
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-5 pt-12">
          <div className="bg-white p-12 border border-hb-line relative">
            <div className="space-y-12">
              <div className="group">
                <label className="block text-xs font-mono uppercase tracking-widest text-hb-gray mb-4">
                  {t.municipalityLabel}
                </label>
                <input
                  type="text"
                  value={municipalityName}
                  onChange={(e) => setMunicipalityName(e.target.value)}
                  className="hb-input text-2xl font-display"
                  placeholder={t.municipalityPlaceholder}
                />
              </div>

              <div className="group">
                <label className="block text-xs font-mono uppercase tracking-widest text-hb-gray mb-4">
                  {t.useCaseLabel}
                </label>
                <div className="relative">
                  <select
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    className="hb-input text-lg font-display appearance-none bg-transparent cursor-pointer pr-8 text-ellipsis"
                  >
                    <option value="Elektronische Wohnsitzanmeldung (eWA)">Elektronische Wohnsitzanmeldung (eWA)</option>
                  </select>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-hb-gray">
                    ↓
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleStart}
                  className="w-full border border-hb-ink bg-hb-ink text-white hover:bg-white hover:text-hb-ink px-8 py-4 text-sm font-medium uppercase tracking-widest transition-all duration-300 flex items-center justify-between group"
                >
                  <span>{t.startMapping}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
