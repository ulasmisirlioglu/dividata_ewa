export const initialBpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">

  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="Analoge Wohnsitzanmeldung – Persönlicher Besuch im Bürgeramt" processRef="Process_1" />
  </bpmn:collaboration>

  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_Buerger" name="Bürger:in">
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Nachfordern</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_Abbruch</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_8</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Warte" name="Wartebereich">
        <bpmn:flowNodeRef>Task_2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_3</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sachbearbeiter" name="Sachbearbeiter:in">
        <bpmn:flowNodeRef>Task_4</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_5</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_6</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_7</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_1</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="StartEvent_1" name="Bürger betritt Bürgeramt">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Anmeldeformular ausfüllen (Papier)">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_2" name="Wartenummer ziehen">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_3" name="Warten bis Aufruf">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_4" name="Identifikation prüfen (Ausweis)">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_1" name="Unterlagen vollständig?">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_Nein</bpmn:outgoing>
      <bpmn:outgoing>Flow_Ja</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_Nachfordern" name="Unterlagen fehlen – erneut kommen">
      <bpmn:incoming>Flow_Nein</bpmn:incoming>
      <bpmn:outgoing>Flow_Abbruch</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_Abbruch" name="Abbruch">
      <bpmn:incoming>Flow_Abbruch</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:task id="Task_5" name="Daten erfassen (Fachverfahren)">
      <bpmn:incoming>Flow_Ja</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_6" name="Bescheinigung drucken">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_7" name="Gebühren kassieren">
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_8" name="Bescheinigung entgegennehmen">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Anmeldung abgeschlossen">
      <bpmn:incoming>Flow_9</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Task_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_2" targetRef="Task_3" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_3" targetRef="Task_4" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_4" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_Nein" name="Nein" sourceRef="Gateway_1" targetRef="Task_Nachfordern" />
    <bpmn:sequenceFlow id="Flow_Ja" name="Ja" sourceRef="Gateway_1" targetRef="Task_5" />
    <bpmn:sequenceFlow id="Flow_Abbruch" sourceRef="Task_Nachfordern" targetRef="EndEvent_Abbruch" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_5" targetRef="Task_6" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_6" targetRef="Task_7" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Task_7" targetRef="Task_8" />
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Task_8" targetRef="EndEvent_1" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">

      <bpmndi:BPMNShape id="Participant_1_di" bpmnElement="Participant_1" isHorizontal="true">
        <dc:Bounds x="130" y="50" width="1430" height="520" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Lane_Buerger_di" bpmnElement="Lane_Buerger" isHorizontal="true">
        <dc:Bounds x="160" y="50" width="1400" height="160" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Warte_di" bpmnElement="Lane_Warte" isHorizontal="true">
        <dc:Bounds x="160" y="210" width="1400" height="130" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sachbearbeiter_di" bpmnElement="Lane_Sachbearbeiter" isHorizontal="true">
        <dc:Bounds x="160" y="340" width="1400" height="230" />
      </bpmndi:BPMNShape>

      <!-- Start Event -->
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="212" y="112" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="190" y="155" width="80" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- T1: Anmeldeformular -->
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="300" y="90" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T2: Wartenummer -->
      <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2">
        <dc:Bounds x="390" y="235" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T3: Warten -->
      <bpmndi:BPMNShape id="Task_3_di" bpmnElement="Task_3">
        <dc:Bounds x="580" y="235" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T4: Identifikation -->
      <bpmndi:BPMNShape id="Task_4_di" bpmnElement="Task_4">
        <dc:Bounds x="680" y="400" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- Gateway -->
      <bpmndi:BPMNShape id="Gateway_1_di" bpmnElement="Gateway_1" isMarkerVisible="true">
        <dc:Bounds x="865" y="415" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="848" y="472" width="85" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- Task Nachfordern -->
      <bpmndi:BPMNShape id="Task_Nachfordern_di" bpmnElement="Task_Nachfordern">
        <dc:Bounds x="920" y="90" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- End Abbruch -->
      <bpmndi:BPMNShape id="EndEvent_Abbruch_di" bpmnElement="EndEvent_Abbruch">
        <dc:Bounds x="1112" y="112" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1110" y="155" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- T5: Daten erfassen -->
      <bpmndi:BPMNShape id="Task_5_di" bpmnElement="Task_5">
        <dc:Bounds x="960" y="400" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T6: Bescheinigung drucken -->
      <bpmndi:BPMNShape id="Task_6_di" bpmnElement="Task_6">
        <dc:Bounds x="1140" y="400" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T7: Gebuehren -->
      <bpmndi:BPMNShape id="Task_7_di" bpmnElement="Task_7">
        <dc:Bounds x="1320" y="400" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T8: Bescheinigung entgegennehmen -->
      <bpmndi:BPMNShape id="Task_8_di" bpmnElement="Task_8">
        <dc:Bounds x="1350" y="90" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- End Event -->
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="1402" y="502" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1380" y="545" width="80" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- Flows -->
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="248" y="130" />
        <di:waypoint x="300" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="170" />
        <di:waypoint x="370" y="275" />
        <di:waypoint x="390" y="275" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="530" y="275" />
        <di:waypoint x="580" y="275" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="720" y="315" />
        <di:waypoint x="720" y="400" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="820" y="440" />
        <di:waypoint x="865" y="440" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Nein_di" bpmnElement="Flow_Nein">
        <di:waypoint x="890" y="415" />
        <di:waypoint x="890" y="130" />
        <di:waypoint x="920" y="130" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="895" y="268" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Ja_di" bpmnElement="Flow_Ja">
        <di:waypoint x="915" y="440" />
        <di:waypoint x="960" y="440" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="930" y="422" width="12" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Abbruch_di" bpmnElement="Flow_Abbruch">
        <di:waypoint x="1060" y="130" />
        <di:waypoint x="1112" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="1100" y="440" />
        <di:waypoint x="1140" y="440" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="1280" y="440" />
        <di:waypoint x="1320" y="440" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_8_di" bpmnElement="Flow_8">
        <di:waypoint x="1390" y="400" />
        <di:waypoint x="1390" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_9_di" bpmnElement="Flow_9">
        <di:waypoint x="1490" y="130" />
        <di:waypoint x="1520" y="130" />
        <di:waypoint x="1520" y="520" />
        <di:waypoint x="1438" y="520" />
      </bpmndi:BPMNEdge>

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
