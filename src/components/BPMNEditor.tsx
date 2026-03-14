import React, { useEffect, useRef } from 'react';
// @ts-ignore
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import { Download, Star } from 'lucide-react';
import { useLangStore } from '../store/useLangStore';
import { createRoot, Root } from 'react-dom/client';
import { useStore, isMitarbeiter, isBuerger } from '../store/useStore';

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

/** Actor toggle overlay rendered below each bpmn:Task box */
const ActorOverlay: React.FC<{ taskId: string }> = ({ taskId }) => {
  const { stepDurations, toggleStepActor } = useStore();
  const { t } = useLangStore();
  const step = stepDurations.find(s => s.id === taskId);
  if (!step) return null;

  const mitActive = isMitarbeiter(step.actor);
  const bueActive = isBuerger(step.actor);

  const btnStyle = (active: boolean, isLeft: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '4px 2px',
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.055em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    background: active ? '#111111' : '#ffffff',
    color: active ? '#ffffff' : '#888888',
    border: 'none',
    borderRight: isLeft ? '1px solid #E0E0E0' : 'none',
    fontFamily: '"Inter", system-ui, sans-serif',
    lineHeight: 1,
    textAlign: 'center' as const,
    transition: 'background 0.12s, color 0.12s',
  });

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      border: '1.5px solid #CBCBCB',
      borderTop: 'none',
      borderRadius: '0 0 10px 10px',
      overflow: 'hidden',
      pointerEvents: 'all',
      background: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
    }}>
      <button onClick={(e) => { e.stopPropagation(); toggleStepActor(taskId, 'Mitarbeiter'); }} style={btnStyle(mitActive, true)}>
        {t.employeeLabel}
      </button>
      <button onClick={(e) => { e.stopPropagation(); toggleStepActor(taskId, 'Bürger'); }} style={btnStyle(bueActive, false)}>
        {t.citizenLabel}
      </button>
    </div>
  );
};

interface BPMNEditorProps {
  xml: string;
  onSave: (xml: string) => void;
  onSetAsDefault?: () => void;
  setAsDefaultLabel?: string;
}

export const BPMNEditor: React.FC<BPMNEditorProps> = ({ xml, onSave, onSetAsDefault, setAsDefaultLabel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<any>(null);
  const overlayRootsRef = useRef<Root[]>([]);

  const refreshOverlays = (modeler: any) => {
    const elementRegistry = modeler.get('elementRegistry');
    const overlaysService = modeler.get('overlays');
    overlaysService.clear();
    overlayRootsRef.current.forEach(r => r.unmount());
    overlayRootsRef.current = [];

    elementRegistry.filter((el: any) => el.type === 'bpmn:Task').forEach((element: any) => {
      const container = document.createElement('div');
      container.style.cssText = `width:${element.width}px; pointer-events:all; margin:0; padding:0;`;
      overlaysService.add(element.id, {
        position: { top: element.height, left: 0 },
        html: container,
      });
      const root = createRoot(container);
      root.render(<ActorOverlay taskId={element.id} />);
      overlayRootsRef.current.push(root);
    });
  };

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

    modeler.importXML(xml).then(({ warnings }: any) => {
      // Guard: if this modeler is no longer active (e.g. React Strict Mode
      // double-invoke, or component remounted), bail out so the stale callback
      // doesn't clear the overlay roots that the correct modeler already set up.
      if (modelerRef.current !== modeler) return;

      if (warnings.length) {
        console.warn('BPMN Import Warnings', warnings);
      }
      const canvas = modeler.get('canvas') as any;
      canvas.zoom('fit-viewport');
      const zoomLevel = canvas.zoom();
      canvas.zoom(zoomLevel * 0.85);

      // Add actor overlays below each task
      refreshOverlays(modeler);

      // Auto-save on every diagram change (name edit, move, add, delete, etc.)
      const eventBus = modeler.get('eventBus') as any;
      eventBus.on('commandStack.changed', async () => {
        try {
          const result = await modeler.saveXML({ format: true });
          onSave(result.xml!);
        } catch (e) {
          console.error('BPMN auto-save failed', e);
        }
        // Refresh overlays after diagram changes (new tasks, deletions)
        refreshOverlays(modeler);
      });
    }).catch((err: any) => {
      console.error('BPMN Import Error', err);
    });

    return () => {
      overlayRootsRef.current.forEach(r => r.unmount());
      overlayRootsRef.current = [];
      modelerRef.current = null; // clear ref so any in-flight .then() bails out above
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

  const handleDownloadPng = async () => {
    if (!modelerRef.current) return;
    try {
      const { svg } = await modelerRef.current.saveSVG();
      // Parse viewBox for exact diagram dimensions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
      const svgEl = svgDoc.querySelector('svg');
      const vb = svgEl?.getAttribute('viewBox')?.split(' ').map(Number) ?? [0, 0, 800, 300];
      const svgW = vb[2] || 800;
      const svgH = vb[3] || 300;
      const PAD = 40;
      const scale = 3;
      const canvasW = (svgW + PAD * 2) * scale;
      const canvasH = (svgH + PAD * 2) * scale;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = canvasW;
          c.height = canvasH;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasW, canvasH);
          ctx.drawImage(img, PAD * scale, PAD * scale, svgW * scale, svgH * scale);
          resolve(c.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'prozessmodell-bpmn.png';
      a.click();
    } catch (err) {
      console.error('BPMN PNG export failed', err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-hb-line relative">
      <div className="flex-grow bg-white" ref={containerRef} />
      {/* Actions — top right */}
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        {onSetAsDefault && (
          <button
            onClick={onSetAsDefault}
            className="flex items-center gap-2 bg-white border border-hb-line text-hb-ink hover:border-hb-ink px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors shadow-sm"
          >
            <Star size={14} />
            {setAsDefaultLabel ?? 'Default'}
          </button>
        )}
        <button
          onClick={handleDownloadPng}
          className="flex items-center gap-2 bg-white border border-hb-line text-hb-ink hover:border-hb-ink px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors shadow-sm"
        >
          <Download size={14} />
          PNG
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
