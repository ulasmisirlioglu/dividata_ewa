import { Routes, Route } from 'react-router-dom';
import { Onboarding } from './pages/Onboarding';
import { AnalogProcess } from './pages/AnalogProcess';
import { Evaluation } from './pages/Evaluation';
import { Results } from './pages/Results';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/analog-process" element={<AnalogProcess />} />
      <Route path="/ewa-evaluation" element={<Evaluation />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}

export default App;

