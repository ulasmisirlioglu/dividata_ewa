import React, { useEffect, useRef } from 'react';
// @ts-ignore
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import { useLangStore } from '../store/useLangStore';

// Custom palette provider — only essential tools
class CustomPaletteProvider {
  static $inject = ['palette', 'create', 'elementFactory', 'spaceTool', 'lassoTool', 'handTool', 'globalConnect', 'translate'];

  private _create: any;
  private _elementFactory: any;
  private _handTool: any;
  private _globalConnect: any;
  private _translate: any;

  constructor(palette: any, create: any, elementFactory: any, _spaceTool: any, _lassoTool: any, handTool: any, globalConnect: any, translate: any) {
    this._create = create;
    this._elementFactory = elementFactory;
    this._handTool = handTool;
    this._globalConnect = globalConnect;
    this._translate = translate;
    palette.registerProvider(this);
  }

  getPaletteEntries() {
    const { _create: create, _elementFactory: elementFactory, _handTool: handTool, _globalConnect: globalConnect, _translate: translate } = this;

    function createAction(type: string, group: string, className: string, title: string, options?: any) {
      function createListener(event: any) {
        const shape = elementFactory.createShape({ type, ...(options || {}) });
        create.start(event, shape);
      }
      return {
        group,
        className,
        title: translate(title),
        action: { dragstart: createListener, click: createListener }
      };
    }

    return {
      'hand-tool': {
        group: 'tools',
        className: 'bpmn-icon-hand-tool',
        title: translate('Activate the hand tool'),
        action: { click: (event: any) => handTool.activateHand(event) }
      },
      'global-connect-tool': {
        group: 'tools',
        className: 'bpmn-icon-connection-multi',
        title: translate('Activate the global connect tool'),
        action: { click: (event: any) => globalConnect.start(event) }
      },
      'tool-separator': { group: 'tools', separator: true },
      'create.task': createAction('bpmn:Task', 'activity', 'bpmn-icon-task', 'Create Task'),
      'create.exclusive-gateway': createAction('bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-xor', 'Create Gateway'),
      'create.start-event': createAction('bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none', 'Create StartEvent'),
      'create.end-event': createAction('bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none', 'Create EndEvent'),
    };
  }
}

const CustomPaletteModule = {
  __init__: ['customPaletteProvider'],
  customPaletteProvider: ['type', CustomPaletteProvider]
};

interface BPMNEditorProps {
  xml: string;
  onSave: (xml: string) => void;
}

export const BPMNEditor: React.FC<BPMNEditorProps> = ({ xml, onSave }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<any>(null);
  const { language } = useLangStore();
  const locale = language === 'de' ? 'de-DE' : 'en-US';

  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new BpmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: document
      },
      additionalModules: [
        CustomPaletteModule,
        // Disable default palette provider
        { paletteProvider: ['value', null] }
      ]
    });

    modelerRef.current = modeler;

    try {
      modeler.importXML(xml).then(({ warnings }: any) => {
        if (warnings.length) {
          console.warn('BPMN Import Warnings', warnings);
        }
        const canvas = modeler.get('canvas');
        canvas.zoom('fit-viewport');
        const zoomLevel = canvas.zoom();
        canvas.zoom(zoomLevel * 0.85);

        // Auto-save on every diagram change (name edit, move, add, delete, etc.)
        const eventBus = modeler.get('eventBus');
        eventBus.on('commandStack.changed', async () => {
          try {
            const result = await modeler.saveXML({ format: true });
            onSave(result.xml);
          } catch (e) {
            console.error('BPMN auto-save failed', e);
          }
        });
      });
    } catch (err) {
      console.error('BPMN Import Error', err);
    }

    return () => {
      modeler.destroy();
    };
  }, []);

  const handleZoomIn = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas');
    canvas.zoom(canvas.zoom() * 1.2);
  };

  const handleZoomOut = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas');
    canvas.zoom(canvas.zoom() / 1.2);
  };

  const handleDownloadPdf = async () => {
    if (!modelerRef.current) return;
    try {
      const canvas = modelerRef.current.get('canvas');
      const svg: string = canvas.getActiveLayer().innerHTML
        ? (await modelerRef.current.saveSVG()).svg
        : '';
      if (!svg) return;

      // Create off-screen canvas to render SVG
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions to fit A4 landscape with padding
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageW = 297;
        const pageH = 210;
        const pad = 15;
        const maxW = pageW - pad * 2;
        const maxH = pageH - pad * 2 - 20; // room for header

        const scale = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;

        // Header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(17, 17, 17);
        pdf.text('DiviData - Prozessmodell (BPMN)', pad, pad + 4);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(102, 102, 102);
        pdf.text(new Date().toLocaleDateString(locale), pageW - pad, pad + 4, { align: 'right' });

        // Render SVG to canvas then to PDF
        const c = document.createElement('canvas');
        const dpr = 3;
        c.width = img.width * dpr;
        c.height = img.height * dpr;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.scale(dpr, dpr);
        ctx.drawImage(img, 0, 0);

        const imgData = c.toDataURL('image/png');
        const xOff = pad + (maxW - w) / 2;
        const yOff = pad + 12 + (maxH - h) / 2;
        pdf.addImage(imgData, 'PNG', xOff, yOff, w, h);

        // Footer
        pdf.setFontSize(7);
        pdf.setTextColor(170, 170, 170);
        pdf.text('BPMN 2.0 Standard Notation  |  DiviData', pageW / 2, pageH - 8, { align: 'center' });

        pdf.save('prozessmodell-bpmn.pdf');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      console.error('BPMN PDF export failed', err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-hb-line relative">
      <div className="flex-grow bg-white" ref={containerRef} />
      {/* Download PDF — top right */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 bg-white border border-hb-line text-hb-ink hover:border-hb-ink px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors shadow-sm"
        >
          <Download size={14} />
          PDF
        </button>
      </div>
      {/* Zoom controls — left side, below palette */}
      <div className="absolute left-[14px] bottom-14 z-10 flex flex-col bg-white border border-hb-line shadow-sm">
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-[46px] h-[46px] flex items-center justify-center text-hb-gray hover:text-hb-ink hover:bg-hb-paper transition-colors text-lg font-light"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5.5" />
            <line x1="11" y1="11" x2="15" y2="15" />
            <line x1="4.5" y1="7" x2="9.5" y2="7" />
            <line x1="7" y1="4.5" x2="7" y2="9.5" />
          </svg>
        </button>
        <div className="border-t border-hb-line" />
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-[46px] h-[46px] flex items-center justify-center text-hb-gray hover:text-hb-ink hover:bg-hb-paper transition-colors text-lg font-light"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5.5" />
            <line x1="11" y1="11" x2="15" y2="15" />
            <line x1="4.5" y1="7" x2="9.5" y2="7" />
          </svg>
        </button>
      </div>
      <div className="bg-hb-paper p-2 text-[10px] font-mono text-center text-hb-gray/50 border-t border-hb-line uppercase tracking-widest">
        BPMN 2.0 Standard Notation
      </div>
    </div>
  );
};
