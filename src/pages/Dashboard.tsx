import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useStore } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { ArrowRight, LogOut, Plus, Folder, Trash2, Copy, X } from 'lucide-react';
import { listProjects, createProject, loadProject, deleteProject, copyProject, getDefaultBpmn } from '../lib/projectService';
import type { ProjectSummary } from '../lib/projectService';
import { ROUTES } from '../lib/routes';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userId, stadtname, signOut } = useAuthStore();
  const store = useStore();
  const { t, language } = useLangStore();
  const locale = language === 'de' ? 'de-DE' : 'en-US';

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('eWA');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    listProjects(userId)
      .then(data => setProjects(data))
      .catch(err => console.error('Failed to load projects', err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleStartEwa = () => {
    setNewProjectName('eWA');
    setShowNameDialog(true);
  };

  const handleCreateProject = async () => {
    if (!userId || !newProjectName.trim()) return;
    setCreating(true);
    try {
      const row = await createProject({
        userId,
        stadtname,
        useCase: 'eWA',
        projectName: newProjectName.trim(),
      });
      store.reset();
      store.setMunicipalityName(stadtname);
      store.setUseCase('Elektronische Wohnsitzanmeldung (eWA)');
      store.setCurrentProjectId(row.id);
      store.setProjectName(row.project_name);

      // Load user's custom default BPMN for this use case (if any)
      try {
        const customBpmn = await getDefaultBpmn(userId, 'Elektronische Wohnsitzanmeldung (eWA)');
        if (customBpmn) {
          store.setBpmnXml(customBpmn);
        }
      } catch {
        // Ignore — fall back to initialBpmn.ts default
      }

      navigate(ROUTES.ANALOG_PROCESS);
    } catch (err) {
      console.error('Failed to create project', err);
      setCreating(false);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const data = await loadProject(projectId);
      if (data) {
        store.loadProject(data);
        navigate(ROUTES.ANALOG_PROCESS);
      }
    } catch (err) {
      console.error('Failed to load project', err);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!confirm(t.dashboardDeleteConfirm)) return;
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const handleCopyProject = async (e: React.MouseEvent, project: ProjectSummary) => {
    e.stopPropagation();
    try {
      const newName = `${project.project_name} (Kopie)`;
      const copy = await copyProject(project.id, newName);
      setProjects(prev => [{
        id: copy.id,
        project_name: copy.project_name,
        use_case: copy.use_case,
        created_at: copy.created_at,
        updated_at: copy.updated_at,
        roi: copy.roi,
        cost_saving_per_case: copy.cost_saving_per_case,
      }, ...prev]);
    } catch (err) {
      console.error('Failed to copy project', err);
    }
  };

  const handleSignOut = async () => {
    store.reset();
    await signOut();
    navigate(ROUTES.AUTH);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-light text-hb-ink mb-2">
              {t.dashboardWelcome}, {stadtname}
            </h1>
            <p className="text-hb-gray font-light text-lg">
              {t.dashboardSubtitle}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="hb-btn-secondary flex items-center text-hb-gray hover:text-hb-ink"
          >
            <LogOut size={16} className="mr-2" />
            {t.authSignOutAction}
          </button>
        </div>

        {/* Section 1: New Use Case */}
        <div className="mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-hb-gray mb-6">
            {t.dashboardNewUseCase}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={handleStartEwa}
              className="hb-card text-left hover:border-hb-ink transition-colors duration-200 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 border border-hb-line flex items-center justify-center">
                  <Plus size={20} className="text-hb-gray group-hover:text-hb-ink transition-colors" />
                </div>
                <ArrowRight size={16} className="text-hb-gray group-hover:text-hb-ink group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-display font-medium text-hb-ink mb-2">eWA</h3>
              <p className="text-sm text-hb-gray font-light leading-relaxed">
                {t.dashboardEwaDesc}
              </p>
            </button>

            <div className="hb-card opacity-40 cursor-not-allowed">
              <div className="w-10 h-10 border border-hb-line flex items-center justify-center mb-6">
                <Plus size={20} className="text-hb-gray" />
              </div>
              <h3 className="text-lg font-display font-medium text-hb-gray mb-2">{t.dashboardComingSoon}</h3>
              <p className="text-sm text-hb-gray font-light">{t.dashboardMoreUseCases}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Existing Projects */}
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-hb-gray mb-6">
            {t.dashboardYourProjects}
          </h2>
          {loading ? (
            <p className="text-hb-gray font-light text-sm">{t.dashboardLoading}</p>
          ) : projects.length === 0 ? (
            <div className="hb-card">
              <p className="text-hb-gray font-light text-sm">{t.dashboardNoProjects}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => handleLoadProject(project.id)}
                  className="hb-card flex items-center justify-between hover:border-hb-ink transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <Folder size={20} className="text-hb-gray" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-hb-ink">{project.project_name}</h4>
                        {project.id === store.currentProjectId && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-hb-gray bg-hb-paper border border-hb-line px-2 py-0.5">aktuell</span>
                        )}
                      </div>
                      <p className="text-xs text-hb-gray">{project.use_case}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {project.roi != null && (
                      <span className="text-sm font-mono text-hb-gray">
                        ROI: {project.roi.toFixed(1)}%
                      </span>
                    )}
                    <span className="text-xs text-hb-gray font-mono">
                      {new Date(project.updated_at).toLocaleDateString(locale)}
                    </span>
                    <button
                      onClick={(e) => handleCopyProject(e, project)}
                      className="text-hb-gray/40 hover:text-hb-ink transition-colors p-1"
                      title={t.dashboardCopySuccess}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="text-hb-gray/40 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Name Dialog */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-hb-line p-8 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-medium">{t.dashboardNewProject}</h3>
              <button onClick={() => setShowNameDialog(false)}>
                <X size={18} className="text-hb-gray hover:text-hb-ink" />
              </button>
            </div>
            <label className="text-xs font-mono uppercase tracking-widest text-hb-gray mb-2 block">
              {t.dashboardProjectName}
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder={t.projectNamePlaceholder}
              className="hb-input w-full mb-6"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <button
              onClick={handleCreateProject}
              disabled={creating || !newProjectName.trim()}
              className="hb-btn-primary w-full flex items-center justify-center disabled:opacity-50"
            >
              {creating ? t.dashboardCreating : t.dashboardStartProject}
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};
