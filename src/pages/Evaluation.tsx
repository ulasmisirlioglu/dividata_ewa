import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { FigLabel } from '../components/Decorations';

export const Evaluation: React.FC = () => {
  const navigate = useNavigate();
  const { digitalSteps, setDigitalStep, stepDurations } = useStore();
  const { t } = useLangStore();

  const handleNext = () => {
    navigate('/results');
  };

  const handleBack = () => {
    navigate('/analog-process');
  };

  const getAnalogDuration = (id: string) => {
    const step = stepDurations.find(s => s.id === id);
    return step ? step.actual : 0;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-10">
          <FigLabel>{t.figure30}</FigLabel>
          <h1 className="text-4xl font-light mb-4">{t.evalTitle}</h1>
          <p className="text-hb-gray text-lg font-light max-w-3xl leading-relaxed">
            {t.evalDesc}
          </p>
        </div>

        <div className="hb-card p-0 overflow-hidden mb-8 shadow-xl shadow-black/5">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="hb-table-header px-6 pt-6 w-1/4">{t.analogStepHeader}</th>
                <th className="hb-table-header px-6 pt-6 w-1/4">{t.digitalReplacementHeader}</th>
                <th className="hb-table-header px-6 pt-6 w-1/6 text-right">{t.analogTimeHeader}</th>
                <th className="hb-table-header px-6 pt-6 w-1/6 text-right">{t.digitalizationHeader}</th>
                <th className="hb-table-header px-6 pt-6 w-1/6 text-right">{t.digitalTimeHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hb-line">
              {digitalSteps.map((step) => {
                const analogTime = getAnalogDuration(step.id);
                return (
                  <tr key={step.id} className="hover:bg-hb-paper transition-colors">
                    <td className="hb-table-cell px-6 font-medium">
                      {step.name}
                    </td>
                    <td className="hb-table-cell px-6 text-hb-gray">
                      <input 
                        type="text"
                        value={step.digitalReplacement}
                        onChange={(e) => setDigitalStep(step.id, { digitalReplacement: e.target.value })}
                        className="bg-transparent border-b border-transparent hover:border-hb-line focus:border-hb-ink focus:outline-none w-full py-1 transition-all"
                      />
                    </td>
                    <td className="hb-table-cell px-6 text-right text-hb-gray">
                      {analogTime} min
                    </td>
                    <td className="hb-table-cell px-6 text-right">
                      <div className="flex items-center justify-end">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={step.digitalizationPercent}
                          onChange={(e) => setDigitalStep(step.id, { digitalizationPercent: parseFloat(e.target.value) || 0 })}
                          className="w-12 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 mr-2 transition-colors"
                        />
                        <span className="text-hb-gray text-xs">%</span>
                      </div>
                    </td>
                    <td className="hb-table-cell px-6 text-right">
                      <input
                        type="number"
                        min="0"
                        value={step.digitalDuration}
                        onChange={(e) => setDigitalStep(step.id, { digitalDuration: parseFloat(e.target.value) || 0 })}
                        className="w-12 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 transition-colors"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
               <tr className="bg-hb-paper">
                 <td colSpan={2} className="hb-table-cell px-6 text-right font-medium text-hb-gray uppercase tracking-wider text-xs">{t.weightedAvg}</td>
                 <td className="hb-table-cell px-6 text-right text-hb-ink">
                   {stepDurations.reduce((acc, s) => acc + s.actual, 0)} min
                 </td>
                 <td colSpan={2} className="hb-table-cell px-6 text-right text-hb-ink text-lg font-medium">
                   {/* Simplified total logic display */}
                   {
                     digitalSteps.reduce((acc, s) => {
                        const analogTime = getAnalogDuration(s.id);
                        const digRate = s.digitalizationPercent / 100;
                        return acc + (s.digitalDuration * digRate) + (analogTime * (1 - digRate));
                     }, 0).toFixed(1)
                   } min
                 </td>
               </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-start bg-white border border-hb-line p-6 mb-10 max-w-2xl">
          <Info className="h-5 w-5 text-hb-ink mt-0.5 flex-shrink-0" />
          <p className="ml-4 text-sm text-hb-gray leading-relaxed font-light">
            <span className="font-medium text-hb-ink block mb-1">{t.assumptionTitle}</span>
            {t.assumptionDesc}
          </p>
        </div>

        <div className="flex justify-between border-t border-hb-line/50 pt-8">
          <button
            onClick={handleBack}
            className="hb-btn-secondary flex items-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t.back}
          </button>
          <button
            onClick={handleNext}
            className="hb-btn-primary flex items-center shadow-lg shadow-black/5"
          >
            {t.calculateRoi}
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </div>
    </Layout>
  );
};
