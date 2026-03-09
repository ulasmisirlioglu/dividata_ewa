import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { ROUTES } from '../lib/routes';


export const DigitalizationCosts: React.FC = () => {
  const navigate = useNavigate();
  const { digitalizationCosts, setDigitalizationCosts, stepDurations, digitalSteps, hourlyRate } = useStore();
  const { t, language } = useLangStore();
  const locale = language === 'de' ? 'de-DE' : 'en-US';

  const handleNext = () => {
    navigate(ROUTES.RESULTS);
  };

  const handleBack = () => {
    navigate(ROUTES.EVALUATION);
  };

  // Calculate digital Mitarbeiterkosten pro Prozess
  const digitalMitarbeiterMin = digitalSteps.reduce((acc, s) => {
    const step = stepDurations.find(sd => sd.id === s.id);
    if (!step || step.actor !== 'Mitarbeiter') return acc;
    const analogDuration = step.actual;
    const digRate = s.digitalizationPercent / 100;
    return acc + (s.digitalDuration * digRate) + (analogDuration * (1 - digRate));
  }, 0);
  const digitalPersonnelCostPerProcess = (digitalMitarbeiterMin / 60) * hourlyRate;

  const totalAnnual = digitalizationCosts.licenseCostYear + digitalizationCosts.maintenanceCostYear + digitalizationCosts.otherCostYear + digitalPersonnelCostPerProcess;
  const totalOneTime = digitalizationCosts.implementationCost + digitalizationCosts.trainingCost;

  const costFields = [
    { key: 'licenseCostYear' as const, label: t.licenseCostYear, type: t.annualLabel },
    { key: 'maintenanceCostYear' as const, label: t.maintenanceCostYear, type: t.annualLabel },
    { key: 'otherCostYear' as const, label: t.otherCostYear, type: t.annualLabel },
    { key: 'implementationCost' as const, label: t.implementationCost, type: t.oneTimeLabel },
    { key: 'trainingCost' as const, label: t.trainingCost, type: t.oneTimeLabel },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-10">
          <h1 className="text-4xl font-light mb-4">{t.costsTitle}</h1>
          <p className="text-hb-gray text-lg font-light max-w-3xl leading-relaxed">
            {t.costsDesc}
          </p>
        </div>

        {/* Pre-calculated digital personnel cost */}
        <div className="hb-card p-6 mb-6 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-medium text-hb-gray uppercase tracking-wider">
              {t.digitalPersonnelCost}
            </label>
            <span className="text-[10px] font-mono text-hb-gray/60 uppercase tracking-wider border border-hb-line px-2 py-0.5">
              {t.preCalculated}
            </span>
          </div>
          <div className="flex items-end gap-8">
            <div>
              <span className="text-4xl font-light text-hb-ink">{digitalPersonnelCostPerProcess.toFixed(2)}</span>
              <span className="text-sm text-hb-gray ml-2">{t.eurPerProcess}</span>
            </div>
            <div className="text-xs text-hb-gray font-light pb-2">
              = {digitalMitarbeiterMin.toFixed(1)} {t.minUnit} &times; {hourlyRate} {t.formulaEurPer60}
            </div>
          </div>
        </div>

        <div className="flex items-start bg-white border border-hb-line p-6 mb-8 max-w-2xl">
          <Info className="h-5 w-5 text-hb-ink mt-0.5 flex-shrink-0" />
          <p className="ml-4 text-sm text-hb-gray leading-relaxed font-light">
            {t.digitalPersonnelCostInfo}
          </p>
        </div>

        <div className="hb-card p-0 overflow-hidden mb-8 shadow-xl shadow-black/5">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="hb-table-header px-6 pt-6 text-left">{t.costPositionHeader}</th>
                <th className="hb-table-header px-6 pt-6 text-right">{t.costTypeHeader}</th>
                <th className="hb-table-header px-6 pt-6 text-right">{t.costAmountHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hb-line">
              {/* Digital personnel cost - read-only, pre-calculated */}
              <tr className="hover:bg-hb-paper transition-colors">
                <td className="hb-table-cell px-6 font-medium">{t.digitalPersonnelCost}</td>
                <td className="hb-table-cell px-6 text-right">
                  <span className="text-xs font-mono text-hb-gray uppercase tracking-wider">
                    {t.perProcessLabel}
                  </span>
                </td>
                <td className="hb-table-cell px-6 text-right">
                  <div className="flex items-center justify-end">
                    <span className="py-1 mr-2">{digitalPersonnelCostPerProcess.toFixed(2)}</span>
                    <span className="text-hb-gray text-xs">€</span>
                  </div>
                </td>
              </tr>
              {costFields.map((field) => (
                <tr key={field.key} className="hover:bg-hb-paper transition-colors">
                  <td className="hb-table-cell px-6 font-medium">{field.label}</td>
                  <td className="hb-table-cell px-6 text-right">
                    <span className="text-xs font-mono text-hb-gray uppercase tracking-wider">
                      {field.type}
                    </span>
                  </td>
                  <td className="hb-table-cell px-6 text-right">
                    <div className="flex items-center justify-end">
                      <input
                        type="number"
                        min="0"
                        value={digitalizationCosts[field.key]}
                        onChange={(e) => setDigitalizationCosts({ [field.key]: parseFloat(e.target.value) || 0 })}
                        className="w-28 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 mr-2 transition-colors"
                      />
                      <span className="text-hb-gray text-xs">€</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-hb-paper">
                <td className="hb-table-cell px-6 font-medium">{t.totalAnnualCosts}</td>
                <td className="hb-table-cell px-6 text-right">
                  <span className="text-xs font-mono text-hb-gray uppercase tracking-wider">{t.annualLabel}</span>
                </td>
                <td className="hb-table-cell px-6 text-right text-hb-ink text-lg font-medium">
                  {totalAnnual.toLocaleString(locale)} €
                </td>
              </tr>
              <tr className="bg-hb-paper border-t border-hb-line">
                <td className="hb-table-cell px-6 font-medium">{t.totalOneTimeCosts}</td>
                <td className="hb-table-cell px-6 text-right">
                  <span className="text-xs font-mono text-hb-gray uppercase tracking-wider">{t.oneTimeLabel}</span>
                </td>
                <td className="hb-table-cell px-6 text-right text-hb-ink text-lg font-medium">
                  {totalOneTime.toLocaleString(locale)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-start bg-white border border-hb-line p-6 mb-10 max-w-2xl">
          <Info className="h-5 w-5 text-hb-ink mt-0.5 flex-shrink-0" />
          <p className="ml-4 text-sm text-hb-gray leading-relaxed font-light">
            <span className="font-medium text-hb-ink block mb-1">{t.costsInfoTitle}</span>
            {t.costsInfoDesc}
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
            {t.continueTo}
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </div>
    </Layout>
  );
};
