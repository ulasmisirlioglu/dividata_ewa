import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { FigLabel } from '../components/Decorations';
import clsx from 'clsx';

export const Evaluation: React.FC = () => {
  const navigate = useNavigate();
  const { digitalSteps, setDigitalStep, stepDurations, digitalizationCosts, setDigitalizationCosts, salaryGroup, salaryRates } = useStore();
  const { t } = useLangStore();

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/process-parameters');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/analog-process');
    }
  };

  const getAnalogDuration = (id: string) => {
    const step = stepDurations.find(s => s.id === id);
    return step ? step.actual : 0;
  };

  const getActor = (id: string) => {
    const step = stepDurations.find(s => s.id === id);
    return step ? step.actor : '';
  };

  // Calculate digital Mitarbeiterkosten pro Prozess
  const hourlyRate = salaryRates[salaryGroup] || 0;
  const digitalMitarbeiterMin = digitalSteps.reduce((acc, s) => {
    const step = stepDurations.find(sd => sd.id === s.id);
    if (!step || step.actor !== 'Mitarbeiter') return acc;
    const analogDuration = step.actual;
    const digRate = s.digitalizationPercent / 100;
    return acc + (s.digitalDuration * digRate) + (analogDuration * (1 - digRate));
  }, 0);
  const digitalPersonnelCostPerProcess = (digitalMitarbeiterMin / 60) * hourlyRate;

  const totalAnnual = digitalizationCosts.licenseCostYear + digitalizationCosts.maintenanceCostYear + digitalizationCosts.otherCostYear;
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
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Step Tabs */}
        <div className="mb-10 flex space-x-8 border-b border-hummingbird-border pb-4">
          {[1, 2].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={clsx(
                "text-sm font-medium pb-4 -mb-4 transition-all duration-300",
                currentStep === step
                  ? "text-hb-ink border-b border-hb-ink"
                  : "text-hb-gray hover:text-hb-ink"
              )}
            >
              {step === 1 && `01. ${t.evalTitle}`}
              {step === 2 && `02. ${t.costsTitle}`}
            </button>
          ))}
        </div>

        <div className="min-h-[600px] flex flex-col">
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="mb-10">
                <FigLabel>{t.figure30}</FigLabel>
                <h1 className="text-4xl font-light mb-4">{t.evalTitle}</h1>
                <p className="text-hb-gray text-lg font-light max-w-3xl leading-relaxed">
                  {t.evalDesc}
                </p>
              </div>

              <div className="flex items-start bg-white border border-hb-line p-6 mb-8 max-w-3xl">
                <Info className="h-5 w-5 text-hb-ink mt-0.5 flex-shrink-0" />
                <div className="ml-4 text-sm text-hb-gray leading-relaxed font-light space-y-2">
                  <p>
                    <span className="font-medium text-hb-ink">{t.actorHeader} &amp; {t.analogTimeHeader}:</span>{' '}
                    {t.evalInfoActorTime}
                  </p>
                  <p>
                    <span className="font-medium text-hb-ink">{t.digitalReplacementHeader}:</span>{' '}
                    {t.evalInfoReplacement}
                  </p>
                  <p>
                    <span className="font-medium text-hb-ink">{t.digitalTimeHeader}:</span>{' '}
                    {t.digitalTimeInfo}
                  </p>
                </div>
              </div>

              <div className="hb-card p-0 overflow-hidden mb-8 shadow-xl shadow-black/5">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="hb-table-header px-6 pt-6">{t.analogStepHeader}</th>
                      <th className="hb-table-header px-6 pt-6 text-center">{t.actorHeader}</th>
                      <th className="hb-table-header px-6 pt-6 text-right">{t.analogTimeHeader}</th>
                      <th className="hb-table-header px-6 pt-6">{t.digitalReplacementHeader} <span className="font-normal text-hb-gray">(optional)</span></th>
                      <th className="hb-table-header px-6 pt-6 text-right">{t.digitalTimeHeader}</th>
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
                          <td className="hb-table-cell px-6 text-center">
                            <span className="text-xs text-hb-gray">{getActor(step.id)}</span>
                          </td>
                          <td className="hb-table-cell px-6 text-right text-hb-gray">
                            {analogTime} min
                          </td>
                          <td className="hb-table-cell px-6 text-hb-gray">
                            <input
                              type="text"
                              value={step.digitalReplacement}
                              onChange={(e) => setDigitalStep(step.id, { digitalReplacement: e.target.value })}
                              className="bg-transparent border-b border-transparent hover:border-hb-line focus:border-hb-ink focus:outline-none w-full py-1 transition-all"
                            />
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
                      <td className="hb-table-cell px-6 font-medium text-hb-gray uppercase tracking-wider text-xs" rowSpan={2}>{t.weightedAvg}</td>
                      <td className="hb-table-cell" rowSpan={2}></td>
                      <td className="hb-table-cell px-6 text-right text-hb-ink text-xs font-medium uppercase tracking-wider">{t.totalAnalog}</td>
                      <td className="hb-table-cell" rowSpan={2}></td>
                      <td className="hb-table-cell px-6 text-right text-hb-ink text-xs font-medium uppercase tracking-wider">{t.totalDigital}</td>
                    </tr>
                    <tr className="bg-hb-paper border-t border-hb-line/50">
                      <td className="hb-table-cell px-6 text-right text-hb-ink whitespace-nowrap">
                        {stepDurations.filter(s => s.actor === 'Mitarbeiter').reduce((acc, s) => acc + s.actual, 0)} Mitarbeiter-Min.<br/>
                        + {stepDurations.filter(s => s.actor === 'Bürger').reduce((acc, s) => acc + s.actual, 0)} Bürger-Min.
                      </td>
                      <td className="hb-table-cell px-6 text-right text-hb-ink font-medium whitespace-nowrap">
                        {digitalSteps.filter(s => getActor(s.id) === 'Mitarbeiter').reduce((acc, s) => acc + s.digitalDuration, 0)} Mitarbeiter-Min.<br/>
                        + {digitalSteps.filter(s => getActor(s.id) === 'Bürger').reduce((acc, s) => acc + s.digitalDuration, 0)} Bürger-Min.
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-4xl animate-fade-in">
              <div className="mb-10">
                <FigLabel>{t.figure35}</FigLabel>
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
                    <span className="text-sm text-hb-gray ml-2">€ / Prozess</span>
                  </div>
                  <div className="text-xs text-hb-gray font-light pb-2">
                    = {digitalMitarbeiterMin.toFixed(1)} Min. &times; {hourlyRate} € / 60
                  </div>
                </div>
              </div>

              <div className="flex items-start bg-white border border-hb-line p-6 mb-8 max-w-3xl">
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
                    <tr className="bg-hb-paper/50">
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
                              value={digitalizationCosts[field.key] || ''}
                              onChange={(e) => setDigitalizationCosts({ [field.key]: parseFloat(e.target.value) || 0 })}
                              placeholder="0"
                              className="w-28 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 mr-2 transition-colors placeholder:text-hb-gray/40"
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
                        {totalAnnual.toLocaleString('de-DE')} € + {t.digitalPersonnelCost}
                      </td>
                    </tr>
                    <tr className="bg-hb-paper border-t border-hb-line">
                      <td className="hb-table-cell px-6 font-medium">{t.totalOneTimeCosts}</td>
                      <td className="hb-table-cell px-6 text-right">
                        <span className="text-xs font-mono text-hb-gray uppercase tracking-wider">{t.oneTimeLabel}</span>
                      </td>
                      <td className="hb-table-cell px-6 text-right text-hb-ink text-lg font-medium">
                        {totalOneTime.toLocaleString('de-DE')} €
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-between pt-6 border-t border-hb-line/50">
          <button
            onClick={handleBack}
            className="hb-btn-secondary flex items-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t.back}
          </button>
          <button
            onClick={handleNext}
            className="hb-btn-primary flex items-center group"
          >
            {currentStep === 2 ? t.continueTo : t.nextStep}
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </Layout>
  );
};
