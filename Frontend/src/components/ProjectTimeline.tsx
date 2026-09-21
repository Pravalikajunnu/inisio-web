import React, { useState } from 'react';
import { AuthUser, ProjectTimelineStage, TimelineAuditLog, TimelineStageStatus } from '../types';
import { LeadRecord, updateLeadRecord } from '../utils/leadStore';
import {
  DEFAULT_TIMELINE_STAGES,
  computeProjectTimeline,
  revertStageToInProgress,
  updateStageStatus,
  canUserUpdateTimeline,
  formatTimelineDate
} from '../utils/timelineManager';
import {
  ClipboardList,
  Gauge,
  FileText,
  Landmark,
  ShieldCheck,
  IndianRupee,
  Check,
  CheckCircle2,
  Clock,
  RotateCcw,
  History,
  User,
  AlertTriangle,
  ChevronRight,
  Activity,
  Layers,
  X,
  HelpCircle
} from 'lucide-react';

interface ProjectTimelineProps {
  project: Partial<LeadRecord>;
  user: AuthUser;
  onTimelineUpdated?: (updatedStages: ProjectTimelineStage[], leadRecord: LeadRecord) => void;
  onOpenDocUpload?: () => void;
  onRequestCADrafting?: () => void;
  className?: string;
  showAuditTrailButton?: boolean;
}

const STAGE_ICON_MAP: Record<string, React.ElementType> = {
  ClipboardList,
  Gauge,
  FileText,
  Landmark,
  ShieldCheck,
  IndianRupee
};

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  project,
  user,
  onTimelineUpdated,
  onOpenDocUpload,
  onRequestCADrafting,
  className = '',
  showAuditTrailButton = true
}) => {
  const isAuthorized = canUserUpdateTimeline(user);
  const stages = computeProjectTimeline(project);

  // Rollback confirmation dialog state
  const [rollbackStage, setRollbackStage] = useState<ProjectTimelineStage | null>(null);
  const [rollbackReason, setRollbackReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Status picker modal/dropdown
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    stage: ProjectTimelineStage;
    newStatus: TimelineStageStatus;
  } | null>(null);

  // Audit history modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const completedCount = stages.filter((s) => s.status === 'Completed').length;
  const activeStage = stages.find((s) => s.status === 'In Progress') || stages[0];
  const activeStageIndex = activeStage ? activeStage.id : 1;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  const handleRevertConfirm = () => {
    if (!rollbackStage || !project.id) return;
    setIsProcessing(true);

    try {
      const { updatedStages, auditLog, leadFieldUpdates } = revertStageToInProgress(
        stages,
        rollbackStage.id,
        user,
        project.id,
        rollbackReason.trim() || `Stage reverted to In Progress by ${user.name || user.email}`
      );

      const existingLogs = Array.isArray(project.timelineAuditLogs) ? project.timelineAuditLogs : [];
      const updatedLogs = [auditLog, ...existingLogs];

      const fullUpdates: Partial<LeadRecord> = {
        ...leadFieldUpdates,
        timelineStages: updatedStages,
        timelineAuditLogs: updatedLogs
      };

      const updatedRecord = updateLeadRecord(project.id, fullUpdates, user.name || user.email);

      if (updatedRecord && onTimelineUpdated) {
        onTimelineUpdated(updatedStages, updatedRecord);
      }

      setRollbackStage(null);
      setRollbackReason('');
    } catch (err) {
      console.error('Failed to revert stage:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChangeConfirm = (
    stage: ProjectTimelineStage,
    newStatus: TimelineStageStatus,
    reason?: string
  ) => {
    if (!project.id) return;
    setIsProcessing(true);

    try {
      const { updatedStages, auditLog, leadFieldUpdates } = updateStageStatus(
        stages,
        stage.id,
        newStatus,
        user,
        project.id,
        reason || `Stage status changed to ${newStatus} by ${user.name || user.email}`
      );

      const existingLogs = Array.isArray(project.timelineAuditLogs) ? project.timelineAuditLogs : [];
      const updatedLogs = [auditLog, ...existingLogs];

      const fullUpdates: Partial<LeadRecord> = {
        ...leadFieldUpdates,
        timelineStages: updatedStages,
        timelineAuditLogs: updatedLogs
      };

      const updatedRecord = updateLeadRecord(project.id, fullUpdates, user.name || user.email);

      if (updatedRecord && onTimelineUpdated) {
        onTimelineUpdated(updatedStages, updatedRecord);
      }

      setStatusChangeTarget(null);
    } catch (err) {
      console.error('Failed to update stage status:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const auditLogs = (project.timelineAuditLogs || []) as TimelineAuditLog[];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 font-manrope">
                Project Syndication Journey
              </h2>
              {isAuthorized ? (
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Admin / CA Edit Enabled</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">
                  Real-time Tracker
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live progression of financial underwriting, appraisal, and institutional sanction.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Stage {activeStageIndex}: {activeStage?.name || 'In Progress'}</span>
          </span>

          {showAuditTrailButton && auditLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAuditModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View Stage History Logs"
            >
              <History className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Timeline Logs ({auditLogs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Progress Line */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-zinc-600">Overall Completion</span>
          <span className="text-blue-700 font-bold">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Stage Cards List */}
      <div className="space-y-3.5">
        {stages.map((st) => {
          const IconComp = STAGE_ICON_MAP[st.iconName || 'ClipboardList'] || ClipboardList;
          const isCompleted = st.status === 'Completed';
          const isInProgress = st.status === 'In Progress';
          const isPending = st.status === 'Pending';

          return (
            <div
              key={st.id}
              className={`p-4 sm:p-4.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
                  : isInProgress
                  ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-zinc-50/70 border-zinc-200 text-zinc-400'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                {/* Stage Number Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isInProgress
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-zinc-200 text-zinc-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.id}
                </div>

                {/* Content & Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className={`text-sm font-bold font-manrope ${isPending ? 'text-zinc-600' : 'text-zinc-900'}`}>
                      {st.name}
                    </h3>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    )}
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>In Progress</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-200/60 px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    {st.description}
                  </p>

                  {/* Completion / Update Timestamp & User Info */}
                  <div className="mt-1.5 flex items-center flex-wrap gap-3 text-[11px]">
                    {isCompleted && st.completedAt && (
                      <div className="text-emerald-800 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        <span>Completed: {st.completedAt}</span>
                      </div>
                    )}

                    {st.updatedBy && (
                      <div className="text-zinc-500 flex items-center gap-1">
                        <User className="w-3 h-3 text-zinc-400" />
                        <span>Updated by: <strong className="text-zinc-700">{st.updatedBy}</strong></span>
                        {st.updatedAt && (
                          <span className="text-zinc-400">({formatTimelineDate(st.updatedAt)})</span>
                        )}
                      </div>
                    )}

                    {isInProgress && project?.status && (
                      <div className="text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        <Activity className="w-3 h-3 text-blue-600" />
                        <span>Active State: {project.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Contextual Action Buttons for Stage 3 */}
                  {isInProgress && st.id === 3 && (
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      {onOpenDocUpload && (
                        <button
                          type="button"
                          onClick={onOpenDocUpload}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                        >
                          Upload DPR/CMA
                        </button>
                      )}
                      {onRequestCADrafting && (
                        <button
                          type="button"
                          onClick={onRequestCADrafting}
                          className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Get help from Inisio CA
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Indicator & Admin Rollback / Edit Controls */}
              <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                {/* Regular User Status Badge */}
                {!isAuthorized && (
                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Completed</span>
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>In Progress</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 text-zinc-400 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Admin/CA/Prosync Interactive Stage Management Controls */}
                {isAuthorized && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Revert / Move Back to In Progress Button */}
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => setRollbackStage(st)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:border-amber-300"
                        title={`Move '${st.name}' back to In Progress`}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Move back to In Progress</span>
                      </button>
                    )}

                    {/* Quick Stage Status Selector for Admin/CA */}
                    <div className="relative">
                      <select
                        value={st.status}
                        onChange={(e) => {
                          const newStat = e.target.value as TimelineStageStatus;
                          if (newStat === 'In Progress' && st.status === 'Completed') {
                            setRollbackStage(st);
                          } else {
                            handleStatusChangeConfirm(st, newStat);
                          }
                        }}
                        className={`text-xs font-semibold rounded-xl px-3 py-1.5 border appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-500'
                            : isInProgress
                            ? 'bg-blue-50 text-blue-800 border-blue-300 focus:ring-blue-500'
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200 focus:ring-zinc-400'
                        }`}
                      >
                        <option value="Completed">Completed (✅)</option>
                        <option value="In Progress">In Progress (🔵)</option>
                        <option value="Pending">Pending (⚪)</option>
                      </select>
                      <ChevronRight className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-zinc-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Move Back to In Progress Confirmation */}
      {rollbackStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-zinc-900 font-manrope">
                  Move Stage Back to In Progress?
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  You are about to revert <strong className="text-zinc-800 font-semibold">{rollbackStage.name}</strong> back to <strong className="text-blue-600 font-semibold">In Progress</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRollbackStage(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cascade Preview Box */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5 text-xs text-amber-950">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Automatic Stage Adjustments:</span>
              </span>
              <ul className="space-y-1.5 pl-5 list-disc text-[11px] text-amber-900 leading-relaxed">
                <li>
                  <strong className="text-zinc-900">{rollbackStage.name}</strong> will become <span className="font-semibold text-blue-700">🔵 In Progress</span>.
                </li>
                {stages
                  .filter((s) => s.id > rollbackStage.id)
                  .map((s) => (
                    <li key={s.id}>
                      <strong>{s.name}</strong> will return to <span className="font-semibold text-zinc-600">⚪ Pending</span>.
                    </li>
                  ))}
                {stages.filter((s) => s.id < rollbackStage.id).length > 0 && (
                  <li>
                    Prior stages ({stages.filter((s) => s.id < rollbackStage.id).map(s => s.name).join(', ')}) will remain <span className="font-semibold text-emerald-700">✅ Completed</span>.
                  </li>
                )}
              </ul>
            </div>

            {/* Rollback Reason Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-800">
                Reason for Reverting Stage (Optional Note for Audit Trail)
              </label>
              <input
                type="text"
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                placeholder="e.g. Additional documentation required, financial restructuring, or revised bank query..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-zinc-900"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setRollbackStage(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevertConfirm}
                disabled={isProcessing}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Updating...' : 'Confirm & Set to In Progress'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Timeline Audit History */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 font-manrope">
                    Stage Timeline Audit Trail
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Chronological record of status changes and rollbacks.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  No manual timeline updates recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 font-manrope">
                        {log.stageName}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        log.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-600 flex items-center justify-between pt-1">
                      <span>Updated by: <strong className="text-zinc-800">{log.updatedBy}</strong></span>
                      <span className="text-zinc-400">{formatTimelineDate(log.updatedAt)}</span>
                    </div>

                    {log.reason && (
                      <p className="text-[11px] text-zinc-500 italic bg-white p-2 rounded-lg border border-zinc-100 mt-1">
                        Note: "{log.reason}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
