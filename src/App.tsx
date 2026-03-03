import { Routes, Route } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AnalogProcess } from './pages/AnalogProcess';
import { Evaluation } from './pages/Evaluation';
import { ProcessParameters } from './pages/ProcessParameters';
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
        <Route path="/process-parameters" element={
          <ProtectedRoute><ProcessParameters /></ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute><Results /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;
