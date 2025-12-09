import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { BPMNEditor } from '../components/BPMNEditor';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { FigLabel } from '../components/Decorations';

export const AnalogProcess: React.FC = () => {
  const navigate = useNavigate();
  const { 
    bpmnXml, setBpmnXml, 
    stepDurations, setStepDuration,
    salaryGroup, setSalaryGroup,
    monthlyVolume, setMonthlyVolume
  } = useStore();
  const { t } = useLangStore();

  const [currentStep, setCurrentStep] = useState(1);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]); 

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/ewa-evaluation');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
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
                <FigLabel>{t.figure20}</FigLabel>
                <h2 className="text-3xl font-light mb-2">{t.mapProcessTitle}</h2>
                <p className="text-hb-gray font-light">{t.mapProcessDesc}</p>
              </div>
              <div className="rounded-none overflow-hidden border border-hb-line shadow-2xl shadow-black/5">
                 {/* Wrapper for the white editor to make it look like a page */}
                <BPMNEditor xml={bpmnXml} onSave={setBpmnXml} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-4xl animate-fade-in">
              <div className="mb-8">
                <FigLabel>{t.figure21}</FigLabel>
                <h2 className="text-3xl font-light mb-2">{t.stepDurationsTitle}</h2>
                <p className="text-hb-gray font-light">{t.stepDurationsDesc}</p>
              </div>
              
              <div className="hb-card overflow-hidden p-0">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="hb-table-header px-6 pt-6">{t.stepNameHeader}</th>
                      <th className="hb-table-header px-6 pt-6 text-right">{t.suggestedHeader}</th>
                      <th className="hb-table-header px-6 pt-6 text-right">{t.estimateHeader}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hb-line">
                    {stepDurations.map((step) => (
                      <tr key={step.id} className="hover:bg-hb-paper transition-colors">
                        <td className="hb-table-cell px-6 font-medium">{step.name}</td>
                        <td className="hb-table-cell px-6 text-right text-hb-gray">{step.suggested}</td>
                        <td className="hb-table-cell px-6 text-right">
                          <input
                            type="number"
                            min="0"
                            value={step.actual}
                            onChange={(e) => setStepDuration(step.id, parseFloat(e.target.value) || 0)}
                            className="bg-transparent border-b border-hb-line w-20 text-right focus:border-hb-ink focus:outline-none py-1 transition-colors"
                          />
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-hb-paper font-semibold">
                      <td className="hb-table-cell px-6">{t.totalDuration}</td>
                      <td className="hb-table-cell px-6 text-right">{stepDurations.reduce((acc, s) => acc + s.suggested, 0)} min</td>
                      <td className="hb-table-cell px-6 text-right text-hb-ink">{stepDurations.reduce((acc, s) => acc + s.actual, 0)} min</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-2xl animate-fade-in">
               <div className="mb-8">
                <FigLabel>{t.figure22}</FigLabel>
                <h2 className="text-3xl font-light mb-2">{t.parametersTitle}</h2>
                <p className="text-hb-gray font-light">{t.parametersDesc}</p>
              </div>
              
              <div className="hb-card space-y-12">
                <div>
                  <label className="block text-xs font-medium text-hb-gray uppercase tracking-wider mb-6">
                    {t.tariffGroup}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['TVöD EG 5', 'TVöD EG 6', 'TVöD EG 7', 'TVöD EG 8'].map((group) => (
                      <label key={group} className={clsx(
                        "flex items-center p-4 border cursor-pointer transition-all duration-200",
                        salaryGroup === group 
                          ? "border-hb-ink bg-hb-paper" 
                          : "border-hb-line hover:border-hb-gray"
                      )}>
                        <input
                          type="radio"
                          name="salaryGroup"
                          checked={salaryGroup === group}
                          onChange={() => setSalaryGroup(group)}
                          className="hidden"
                        />
                        <div className={clsx(
                          "w-4 h-4 rounded-full border mr-3 flex items-center justify-center",
                           salaryGroup === group ? "border-hb-ink" : "border-hb-gray"
                        )}>
                          {salaryGroup === group && <div className="w-2 h-2 rounded-full bg-hb-ink" />}
                        </div>
                        <span className="text-sm font-light">{group}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-hb-gray uppercase tracking-wider mb-4">
                    {t.monthlyVolume}
                  </label>
                  <div className="relative max-w-xs group">
                    <input
                      type="number"
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVolume(parseInt(e.target.value) || 0)}
                      className="hb-input text-3xl font-light py-4"
                      placeholder="e.g. 500"
                    />
                    <span className="absolute right-0 bottom-4 text-sm text-hb-gray">{t.casesPerMonth}</span>
                  </div>
                </div>
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
