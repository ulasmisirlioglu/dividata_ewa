import { Routes, Route } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AnalogProcess } from './pages/AnalogProcess';
import { Evaluation } from './pages/Evaluation';
import { DigitalizationCosts } from './pages/DigitalizationCosts';
import { Results } from './pages/Results';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/analog-process" element={
          <ProtectedRoute><AnalogProcess /></ProtectedRoute>
        } />
        <Route path="/ewa-evaluation" element={
          <ProtectedRoute><Evaluation /></ProtectedRoute>
        } />
        <Route path="/digitalization-costs" element={
          <ProtectedRoute><DigitalizationCosts /></ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute><Results /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;
