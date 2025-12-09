import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';
import { Building2, Activity, FileText, BarChart3 } from 'lucide-react';
import { DecorativeGrid } from './Decorations';
import { useLangStore } from '../store/useLangStore';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-hb-paper/90 backdrop-blur-sm z-50 border-b border-hb-line h-24 flex items-center">
      <div className="container mx-auto px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="font-display font-semibold text-3xl tracking-tight">DIVIDATA</div>
          <span className="text-sm font-mono text-hb-gray tracking-widest uppercase">Public Sector ROI v1.0</span>
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useLangStore();
  
  const steps = [
    { path: '/', label: t.navStart, icon: Building2 },
    { path: '/analog-process', label: t.navAnalog, icon: Activity },
    { path: '/ewa-evaluation', label: t.navEvaluation, icon: FileText },
    { path: '/results', label: t.navResults, icon: BarChart3 },
  ];

  const currentIndex = steps.findIndex(step => step.path === currentPath);
  
  return (
    <aside className="w-64 flex-shrink-0 border-r border-hb-line hidden lg:block fixed left-0 top-24 bottom-0 bg-hb-paper/50 backdrop-blur-sm z-40 pl-8 pt-12">
      <div className="flex flex-col space-y-12">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <Link 
              to={step.path} 
              key={step.path} 
              className="flex flex-col items-start min-w-[120px] group"
            >
              <span className={clsx(
                "font-mono text-[10px] mb-2 transition-colors group-hover:text-hb-ink",
                isActive ? "text-hb-ink" : "text-hb-gray/40"
              )}>
                0{index + 1}
              </span>
              <span className={clsx(
                "text-sm font-display tracking-tight uppercase transition-colors duration-300 group-hover:text-hb-ink",
                isActive ? "text-hb-ink border-b border-hb-ink pb-1" : 
                isCompleted ? "text-hb-gray" :
                "text-hb-gray/30"
              )}>
                {step.label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showSidebar = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-hb-paper text-hb-ink flex flex-col font-sans relative">
      <DecorativeGrid />
      <Navbar />
      
      <div className="flex pt-24 min-h-screen">
        {showSidebar && <Sidebar />}
        <main className={clsx(
          "flex-grow ml-0 p-8 relative z-10 transition-all duration-300",
          showSidebar ? "lg:ml-64" : ""
        )}>
          <div className="max-w-6xl mx-auto pt-8">
            {children}
          </div>
        </main>
      </div>

      <footer className={clsx(
        "border-t border-hb-line py-12 text-center text-xs font-mono text-hb-gray uppercase tracking-widest bg-hb-paper relative z-10 transition-all duration-300",
        showSidebar ? "lg:ml-64" : ""
      )}>
        &copy; {new Date().getFullYear()} DiviData &bull; Measurable digitalization for municipalities
      </footer>
    </div>
  );
};
