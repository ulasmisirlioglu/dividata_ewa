import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { ArrowRight, ArrowLeft, Plus, X, Info, AlertCircle } from 'lucide-react';
import { FigLabel } from '../components/Decorations';

export const ProcessParameters: React.FC = () => {
  const navigate = useNavigate();
  const { processIntervals, setProcessInterval, addProcessInterval, removeProcessInterval } = useStore();
  const { t } = useLangStore();
  const [showWarning, setShowWarning] = useState(false);

  const handleNext = () => {
    const allFilled = processIntervals.every(i => i.volumen > 0 && i.digitalisierungsquote > 0);
    if (!allFilled) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    navigate('/results');
  };

  const handleBack = () => {
    navigate('/ewa-evaluation');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-10">
          <FigLabel>{t.figure40p}</FigLabel>
          <h1 className="text-4xl font-light mb-4">{t.paramsTitle}</h1>
          <p className="text-hb-gray text-lg font-light max-w-3xl leading-relaxed">
            {t.paramsDesc}
          </p>
        </div>

        <div className="flex items-start bg-white border border-hb-line p-6 mb-8 max-w-3xl">
          <Info className="h-5 w-5 text-hb-ink mt-0.5 flex-shrink-0" />
          <div className="ml-4 text-sm text-hb-gray leading-relaxed font-light space-y-2">
            <p>
              <span className="font-medium text-hb-ink">{t.paramsVolumenHeader}:</span>{' '}
              {t.paramsVolumenInfo}
            </p>
            <p>
              <span className="font-medium text-hb-ink">{t.paramsQuoteHeader}:</span>{' '}
              {t.paramsQuoteInfo}
            </p>
          </div>
        </div>

        <div className="hb-card p-0 overflow-hidden mb-8 shadow-xl shadow-black/5">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="hb-table-header px-6 pt-6 text-left w-1/4"></th>
                <th className="hb-table-header px-6 pt-6 text-left w-1/4">{t.paramsZeitraumHeader}</th>
                <th className="hb-table-header px-6 pt-6 text-right w-1/4">{t.paramsVolumenHeader}</th>
                <th className="hb-table-header px-6 pt-6 text-right w-1/4">{t.paramsQuoteHeader}</th>
                <th className="hb-table-header px-6 pt-6 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hb-line">
              {processIntervals.map((interval) => (
                <tr key={interval.id} className="hover:bg-hb-paper transition-colors">
                  <td className="hb-table-cell px-6 font-medium">
                    {interval.label}
                  </td>
                  <td className="hb-table-cell px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-hb-gray whitespace-nowrap">von</span>
                      <input
                        type="month"
                        value={interval.von}
                        onChange={(e) => setProcessInterval(interval.id, { von: e.target.value })}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                        className="bg-transparent border-b border-hb-line hover:border-hb-gray focus:border-hb-ink focus:outline-none py-1 transition-all text-sm cursor-pointer"
                      />
                      <span className="text-xs text-hb-gray whitespace-nowrap">bis</span>
                      <input
                        type="month"
                        value={interval.bis}
                        onChange={(e) => setProcessInterval(interval.id, { bis: e.target.value })}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                        className="bg-transparent border-b border-hb-line hover:border-hb-gray focus:border-hb-ink focus:outline-none py-1 transition-all text-sm cursor-pointer"
                      />
                    </div>
                  </td>
                  <td className="hb-table-cell px-6 text-right">
                    <input
                      type="number"
                      min="0"
                      value={interval.volumen || ''}
                      onChange={(e) => { setProcessInterval(interval.id, { volumen: parseFloat(e.target.value) || 0 }); setShowWarning(false); }}
                      placeholder="—"
                      className="w-20 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 transition-colors placeholder:text-hb-gray/40"
                    />
                  </td>
                  <td className="hb-table-cell px-6 text-right">
                    <div className="flex items-center justify-end">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={interval.digitalisierungsquote || ''}
                        onChange={(e) => { setProcessInterval(interval.id, { digitalisierungsquote: parseFloat(e.target.value) || 0 }); setShowWarning(false); }}
                        placeholder="—"
                        className="w-14 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 mr-2 transition-colors placeholder:text-hb-gray/40"
                      />
                      <span className="text-hb-gray text-xs">%</span>
                    </div>
                  </td>
                  <td className="hb-table-cell px-6 text-center">
                    <button
                      onClick={() => removeProcessInterval(interval.id)}
                      className="text-hb-gray/40 hover:text-hb-ink transition-colors p-1"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addProcessInterval}
            className="w-full flex items-center justify-center py-4 text-sm text-hb-gray hover:text-hb-ink hover:bg-hb-paper transition-all border-t border-hb-line"
          >
            <Plus size={16} className="mr-2" />
            {t.paramsAddInterval}
          </button>
        </div>

        {showWarning && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 mb-6 text-sm font-light">
            <AlertCircle size={16} className="flex-shrink-0" />
            {t.paramsValidationWarning}
          </div>
        )}

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
            {t.paramsContinue}
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </div>
    </Layout>
  );
};
