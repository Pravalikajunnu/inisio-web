import React, { useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { fetchLeadsFromBackend, LeadRecord } from '../utils/leadStore';
import api from '../utils/apiClient';

interface DPRConsultantDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export const DPRConsultantDashboard: React.FC<DPRConsultantDashboardProps> = ({ user, onLogout }) => {
  const [projects, setProjects] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      setProjects(await fetchLeadsFromBackend());
    } catch {
      setProjects([]);
      setError('Unable to load assigned DPR projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.leads.update(id, { status });
      await loadProjects();
    } catch {
      setError('Unable to update project status.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">DPR Consultant Workspace</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Assigned project reports</h1>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>
          <button onClick={onLogout} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Log out</button>
        </header>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading assigned projects...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No DPR projects are assigned to you.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900">{project.projectName}</h2>
                    <p className="mt-1 text-xs text-slate-500">{project.fullName} · {project.industry}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">{project.status || 'New'}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div><span className="block text-slate-400">Project cost</span><strong>₹ {project.totalCostCr || 0} Cr</strong></div>
                  <div><span className="block text-slate-400">Probability</span><strong>{project.successProbability ?? 25}%</strong></div>
                </div>
                <select
                  value={project.status || 'In Appraisal'}
                  onChange={(event) => updateStatus(project.id, event.target.value)}
                  className="mt-5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <option>In Appraisal</option>
                  <option>DPR In Progress</option>
                  <option>DPR Completed</option>
                  <option>Clarification Needed</option>
                </select>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
