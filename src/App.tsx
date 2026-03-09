import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AnalogProcess } from './pages/AnalogProcess';
import { Evaluation } from './pages/Evaluation';
import { ProcessParameters } from './pages/ProcessParameters';
import { Results } from './pages/Results';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAutoSave } from './hooks/useAutoSave';
import { useStore } from './store/useStore';
import { loadProject } from './lib/projectService';
import { ROUTES } from './lib/routes';

function App() {
  useAutoSave();

  // Restore project from DB on app startup (page refresh)
  useEffect(() => {
    const storedProjectId = localStorage.getItem('dividata_project_id');
    const { currentProjectId } = useStore.getState();
    if (storedProjectId && !currentProjectId) {
      loadProject(storedProjectId)
        .then(data => {
          if (data) useStore.getState().loadProject(data);
        })
        .catch(() => {
          localStorage.removeItem('dividata_project_id');
        });
    }
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path={ROUTES.AUTH} element={<Auth />} />
        <Route path={ROUTES.DASHBOARD} element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path={ROUTES.ANALOG_PROCESS} element={
          <ProtectedRoute><AnalogProcess /></ProtectedRoute>
        } />
        <Route path={ROUTES.EVALUATION} element={
          <ProtectedRoute><Evaluation /></ProtectedRoute>
        } />
        <Route path={ROUTES.PROCESS_PARAMETERS} element={
          <ProtectedRoute><ProcessParameters /></ProtectedRoute>
        } />
        <Route path={ROUTES.RESULTS} element={
          <ProtectedRoute><Results /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;
