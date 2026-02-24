import React, { useEffect, useRef } from 'react';
// @ts-ignore
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

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
        // Zoom to fit after import
        const canvas = modeler.get('canvas');
        canvas.zoom('fit-viewport');
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
          Modell speichern
        </button>
      </div>
      <div className="bg-hb-paper p-2 text-[10px] font-mono text-center text-hb-gray/50 border-t border-hb-line uppercase tracking-widest">
        BPMN 2.0 Standard Notation
      </div>
    </div>
  );
};
