import React, { useEffect, useRef } from 'react';
// @ts-ignore
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

interface BPMNEditorProps {
  xml: string;
  onSave: (xml: string) => void;
}

export const BPMNEditor: React.FC<BPMNEditorProps> = ({ xml, onSave }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new BpmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: document
      }
    });

    modelerRef.current = modeler;

    try {
      modeler.importXML(xml).then(({ warnings }: any) => {
        if (warnings.length) {
          console.warn('BPMN Import Warnings', warnings);
        }
      });
    } catch (err) {
      console.error('BPMN Import Error', err);
    }

    return () => {
      modeler.destroy();
    };
  }, []); 

  const handleSave = async () => {
    if (!modelerRef.current) return;
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      onSave(xml);
    } catch (err) {
      console.error('Failed to save BPMN', err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-hb-line relative">
      <div className="flex-grow bg-white" ref={containerRef} />
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={handleSave}
          className="bg-white border border-hb-line text-hb-ink hover:border-hb-ink px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors shadow-sm"
        >
          Save Model
        </button>
      </div>
      <div className="bg-hb-paper p-2 text-[10px] font-mono text-center text-hb-gray/50 border-t border-hb-line uppercase tracking-widest">
        BPMN 2.0 Standard Notation
      </div>
    </div>
  );
};
