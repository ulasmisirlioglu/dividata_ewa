import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useStore } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { ArrowRight, LogOut, FolderOpen, Plus } from 'lucide-react';
import { FigLabel } from '../components/Decorations';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stadtname, signOut } = useAuthStore();
  const { setMunicipalityName, setUseCase } = useStore();
  const { t } = useLangStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });
    setProjects((data as Project[]) || []);
    setLoadingProjects(false);
  };

  const handleStartEwa = () => {
    setMunicipalityName(stadtname);
    setUseCase('Elektronische Wohnsitzanmeldung (eWA)');
    navigate('/analog-process');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <FigLabel>{t.dashboardLabel}</FigLabel>
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
            {/* eWA Card */}
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

            {/* Placeholder for future use cases */}
            <div className="hb-card opacity-40 cursor-not-allowed">
              <div className="w-10 h-10 border border-hb-line flex items-center justify-center mb-6">
                <Plus size={20} className="text-hb-gray" />
              </div>
              <h3 className="text-lg font-display font-medium text-hb-gray mb-2">{t.dashboardComingSoon}</h3>
              <p className="text-sm text-hb-gray font-light">{t.dashboardMoreUseCases}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Previous Projects */}
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-hb-gray mb-6">
            {t.dashboardPreviousProjects}
          </h2>
          <div className="hb-card">
            {loadingProjects ? (
              <p className="text-hb-gray font-light text-sm">{t.dashboardLoading}</p>
            ) : projects.length === 0 ? (
              <div className="flex items-center text-hb-gray">
                <FolderOpen size={20} className="mr-3 opacity-40" />
                <p className="font-light text-sm">{t.dashboardNoProjects}</p>
              </div>
            ) : (
              <div className="divide-y divide-hb-line">
                {projects.map((project) => (
                  <div key={project.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-hb-ink">{project.municipality_name}</p>
                      <p className="text-xs text-hb-gray font-light">{project.use_case}</p>
                    </div>
                    <span className="text-xs font-mono text-hb-gray">
                      {new Date(project.updated_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
