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

    <bpmn:startEvent id="StartEvent_1" name="Bürger entscheidet sich zur WA">
      <bpmn:outgoing>Flow_0</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_Anreise" name="Anreise zum Amt">
      <bpmn:incoming>Flow_0</bpmn:incoming>
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:task>
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
    <bpmn:task id="Task_Rueckreise" name="Rückreise vom Amt">
      <bpmn:incoming>Flow_9</bpmn:incoming>
      <bpmn:outgoing>Flow_10</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Anmeldung abgeschlossen">
      <bpmn:incoming>Flow_10</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_0" sourceRef="StartEvent_1" targetRef="Task_Anreise" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_Anreise" targetRef="Task_1" />
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
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Task_8" targetRef="Task_Rueckreise" />
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Task_Rueckreise" targetRef="EndEvent_1" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">

      <!-- Pool -->
      <bpmndi:BPMNShape id="Participant_1_di" bpmnElement="Participant_1" isHorizontal="true">
        <dc:Bounds x="80" y="30" width="2260" height="360" />
      </bpmndi:BPMNShape>

      <!-- Start Event -->
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="242" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="118" y="285" width="104" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- Task_Anreise: Anreise zum Amt -->
      <bpmndi:BPMNShape id="Task_Anreise_di" bpmnElement="Task_Anreise">
        <dc:Bounds x="220" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T1: Anmeldeformular -->
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="410" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T2: Wartenummer -->
      <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2">
        <dc:Bounds x="600" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T3: Warten -->
      <bpmndi:BPMNShape id="Task_3_di" bpmnElement="Task_3">
        <dc:Bounds x="790" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T4: Identifikation -->
      <bpmndi:BPMNShape id="Task_4_di" bpmnElement="Task_4">
        <dc:Bounds x="980" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- Gateway -->
      <bpmndi:BPMNShape id="Gateway_1_di" bpmnElement="Gateway_1" isMarkerVisible="true">
        <dc:Bounds x="1175" y="235" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1156" y="292" width="88" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- Task Nachfordern (Nein branch – above main row) -->
      <bpmndi:BPMNShape id="Task_Nachfordern_di" bpmnElement="Task_Nachfordern">
        <dc:Bounds x="1125" y="60" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- End Abbruch -->
      <bpmndi:BPMNShape id="EndEvent_Abbruch_di" bpmnElement="EndEvent_Abbruch">
        <dc:Bounds x="1307" y="82" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1305" y="125" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- T5: Daten erfassen -->
      <bpmndi:BPMNShape id="Task_5_di" bpmnElement="Task_5">
        <dc:Bounds x="1275" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T6: Bescheinigung drucken -->
      <bpmndi:BPMNShape id="Task_6_di" bpmnElement="Task_6">
        <dc:Bounds x="1465" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T7: Gebühren -->
      <bpmndi:BPMNShape id="Task_7_di" bpmnElement="Task_7">
        <dc:Bounds x="1655" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- T8: Bescheinigung entgegennehmen -->
      <bpmndi:BPMNShape id="Task_8_di" bpmnElement="Task_8">
        <dc:Bounds x="1845" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- Task_Rueckreise: Rückreise vom Amt -->
      <bpmndi:BPMNShape id="Task_Rueckreise_di" bpmnElement="Task_Rueckreise">
        <dc:Bounds x="2035" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>

      <!-- End Event -->
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="2227" y="242" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2205" y="285" width="80" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- Flows – main row (horizontal) -->
      <bpmndi:BPMNEdge id="Flow_0_di" bpmnElement="Flow_0">
        <di:waypoint x="188" y="260" />
        <di:waypoint x="220" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="360" y="260" />
        <di:waypoint x="410" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="550" y="260" />
        <di:waypoint x="600" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="740" y="260" />
        <di:waypoint x="790" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="930" y="260" />
        <di:waypoint x="980" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="1120" y="260" />
        <di:waypoint x="1175" y="260" />
      </bpmndi:BPMNEdge>

      <!-- Flow Nein – goes up from gateway top to Task_Nachfordern bottom -->
      <bpmndi:BPMNEdge id="Flow_Nein_di" bpmnElement="Flow_Nein">
        <di:waypoint x="1200" y="235" />
        <di:waypoint x="1200" y="140" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1205" y="183" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>

      <!-- Flow Ja – continues right along main row -->
      <bpmndi:BPMNEdge id="Flow_Ja_di" bpmnElement="Flow_Ja">
        <di:waypoint x="1225" y="260" />
        <di:waypoint x="1275" y="260" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1242" y="242" width="12" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>

      <!-- Flow Abbruch – horizontal right to end event -->
      <bpmndi:BPMNEdge id="Flow_Abbruch_di" bpmnElement="Flow_Abbruch">
        <di:waypoint x="1265" y="100" />
        <di:waypoint x="1307" y="100" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="1415" y="260" />
        <di:waypoint x="1465" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="1605" y="260" />
        <di:waypoint x="1655" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_8_di" bpmnElement="Flow_8">
        <di:waypoint x="1795" y="260" />
        <di:waypoint x="1845" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_9_di" bpmnElement="Flow_9">
        <di:waypoint x="1985" y="260" />
        <di:waypoint x="2035" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_10_di" bpmnElement="Flow_10">
        <di:waypoint x="2175" y="260" />
        <di:waypoint x="2227" y="260" />
      </bpmndi:BPMNEdge>

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
