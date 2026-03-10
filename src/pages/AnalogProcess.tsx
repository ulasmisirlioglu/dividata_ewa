import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, parseBpmnXml } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { BPMNEditor } from '../components/BPMNEditor';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { ROUTES } from '../lib/routes';
import { setDefaultBpmn } from '../lib/projectService';
import clsx from 'clsx';


export const AnalogProcess: React.FC = () => {
  const navigate = useNavigate();
  const {
    bpmnXml, setBpmnXml,
    stepDurations, setStepDuration, setStepActor,
    salaryGroup, setSalaryGroup,
    hourlyRate, setHourlyRate,
  } = useStore();
  const { userId } = useAuthStore();
  const { t } = useLangStore();
  const useCase = useStore((s) => s.useCase);

  const [currentStep, setCurrentStep] = useState(1);
  const [defaultSaved, setDefaultSaved] = useState(false);

  const handleSetAsDefault = useCallback(async () => {
    if (!userId) return;
    try {
      await setDefaultBpmn(userId, useCase, bpmnXml);
      setDefaultSaved(true);
      setTimeout(() => setDefaultSaved(false), 2000);
    } catch (err) {
      console.error('Failed to set default BPMN', err);
    }
  }, [userId, useCase, bpmnXml]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]); 

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate(ROUTES.EVALUATION);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Step Tabs */}
        <div className="mb-10 flex space-x-8 border-b border-hummingbird-border pb-4">
          {[1, 2, 3].map((step) => (
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
              {step === 1 && `01. ${t.mapProcessTitle}`}
              {step === 2 && `02. ${t.stepDurationsTitle}`}
              {step === 3 && `03. ${t.parametersTitle}`}
            </button>
          ))}
        </div>

        <div className="min-h-[600px] flex flex-col">
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-3xl font-light mb-2">{t.mapProcessHeading}</h2>
                <p className="text-hb-gray font-light">{t.mapProcessDesc}</p>
              </div>
              <div className="rounded-none overflow-hidden border border-hb-line shadow-2xl shadow-black/5">
                 {/* Wrapper for the white editor to make it look like a page */}
                <BPMNEditor
                  xml={bpmnXml}
                  onSave={setBpmnXml}
                  onSetAsDefault={handleSetAsDefault}
                  setAsDefaultLabel={defaultSaved ? t.setAsDefaultSuccess : t.setAsDefault}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (() => {
            const { validTasks, excludedTasks } = parseBpmnXml(bpmnXml);
            const validIds = new Set(validTasks.map((t) => t.id));
            const filteredSteps = stepDurations.filter((s) => validIds.has(s.id));
            return (
            <div className="max-w-4xl animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-light mb-2">{t.stepDurationsHeading}</h2>
                <p className="text-hb-gray font-light">{t.stepDurationsDesc}</p>
              </div>

              <div className="hb-card overflow-hidden p-0">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="hb-table-header px-6 pt-6">{t.stepNameHeader}</th>
                      <th className="hb-table-header px-6 pt-6 text-center">{t.actorHeader}</th>
                      <th className="hb-table-header px-6 pt-6 text-right">{t.estimateHeader}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hb-line">
                    {filteredSteps.map((step) => (
                      <tr key={step.id} className="hover:bg-hb-paper transition-colors">
                        <td className="hb-table-cell px-6 font-medium">{step.name}</td>
                        <td className="hb-table-cell px-6">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => setStepActor(step.id, 'Mitarbeiter')}
                              className={clsx(
                                'px-3 py-1 text-xs rounded-l border border-hb-line transition-colors',
                                step.actor === 'Mitarbeiter'
                                  ? 'bg-hb-ink text-white border-hb-ink'
                                  : 'bg-transparent text-hb-gray hover:bg-hb-paper'
                              )}
                            >
                              {t.employeeLabel}
                            </button>
                            <button
                              onClick={() => setStepActor(step.id, 'Bürger')}
                              className={clsx(
                                'px-3 py-1 text-xs rounded-r border border-hb-line transition-colors',
                                step.actor === 'Bürger'
                                  ? 'bg-hb-ink text-white border-hb-ink'
                                  : 'bg-transparent text-hb-gray hover:bg-hb-paper'
                              )}
                            >
                              {t.citizenLabel}
                            </button>
                          </div>
                        </td>
                        <td className="hb-table-cell px-6 text-right">
                          <input
                            type="number"
                            min="0"
                            value={step.actual || ''}
                            onChange={(e) => setStepDuration(step.id, parseFloat(e.target.value) || 0)}
                            className="bg-transparent border-b border-hb-line w-20 text-right focus:border-hb-ink focus:outline-none py-1 transition-colors"
                          />
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-hb-paper font-semibold">
                      <td className="hb-table-cell px-6" colSpan={2}>{t.totalDuration}</td>
                      <td className="hb-table-cell px-6 text-right text-hb-ink whitespace-nowrap">
                        {filteredSteps.filter(s => s.actor === 'Mitarbeiter').reduce((acc, s) => acc + s.actual, 0)} {t.employeeMin} + {filteredSteps.filter(s => s.actor === 'Bürger').reduce((acc, s) => acc + s.actual, 0)} {t.citizenMin}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {excludedTasks.length > 0 && (
                <div className="flex items-start gap-2 mt-4 px-1 text-xs text-hb-gray">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {t.excludedTasksNote} <span className="font-medium">{excludedTasks.map(et => et.name).join(', ')}</span>
                  </span>
                </div>
              )}
            </div>
            );
          })()}

          {currentStep === 3 && (
            <div className="max-w-2xl animate-fade-in">
               <div className="mb-8">
                <h2 className="text-3xl font-light mb-2">{t.parametersTitle}</h2>
                <p className="text-hb-gray font-light">{t.parametersDesc}</p>
              </div>
              
              <div className="hb-card space-y-12">
                <div>
                  <label className="block text-xs font-medium text-hb-gray uppercase tracking-wider mb-6">
                    {t.tariffGroup}
                  </label>
                  <div className="flex items-center gap-6 p-4 border border-hb-line">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-light">TVöD EG</span>
                      <input
                        type="text"
                        value={salaryGroup}
                        onChange={(e) => setSalaryGroup(e.target.value)}
                        className="bg-transparent border-b border-hb-line w-16 text-center focus:border-hb-ink focus:outline-none text-sm transition-colors"
                        placeholder=""
                      />
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <span className="text-sm font-light">{t.hourlyWageLabel}</span>
                      <input
                        type="number"
                        min="0"
                        value={hourlyRate || ''}
                        onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                        className="bg-transparent border-b border-hb-line w-16 text-right focus:border-hb-ink focus:outline-none text-sm transition-colors"
                        placeholder=""
                      />
                      <span className="text-xs text-hb-gray">{t.eurPerHour}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Cost calculation */}
              {(() => {
                const mitarbeiterMin = stepDurations.filter(s => s.actor === 'Mitarbeiter').reduce((acc, s) => acc + s.actual, 0);
                const rate = hourlyRate || 0;
                const costPerProcess = (mitarbeiterMin / 60) * rate;
                return (
                  <div className="hb-card mt-6 p-6">
                    <label className="block text-xs font-medium text-hb-gray uppercase tracking-wider mb-4">
                      {t.costPerProcess}
                    </label>
                    <div className="flex items-end gap-8">
                      <div>
                        <span className="text-4xl font-light text-hb-ink">{costPerProcess.toFixed(2)}</span>
                        <span className="text-sm text-hb-gray ml-2">€</span>
                      </div>
                      <div className="text-xs text-hb-gray font-light pb-2">
                        = {mitarbeiterMin} {t.minUnit} &times; {rate} {t.formulaEurPer60}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-start bg-white border border-hb-line p-6 mt-6">
                <Info className="h-5 w-5 text-hb-ink mt-0.5 flex-shrink-0" />
                <p className="ml-4 text-sm text-hb-gray leading-relaxed font-light">
                  <span className="font-medium text-hb-ink block mb-1">{t.costInfoTitle}</span>
                  {t.costInfoDesc}
                </p>
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
            {currentStep === 3 ? t.continueEvaluation : t.nextStep}
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </Layout>
  );
};
