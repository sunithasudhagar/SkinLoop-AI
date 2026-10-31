import React, { useState } from 'react';
import { RoutineStep, ShelfProduct, Product } from '../types';
import { SAMPLE_CATALOGUE } from '../data/catalogue';
import {
  CalendarCheck,
  Sun,
  Moon,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  Archive,
  Info,
  Clock,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';

interface RoutineBuilderViewProps {
  routine: RoutineStep[];
  shelf: ShelfProduct[];
  onToggleStep: (stepId: string) => void;
  onSaveRoutine: (newRoutine: RoutineStep[]) => void;
  onNavigate: (view: string) => void;
}

export const RoutineBuilderView: React.FC<RoutineBuilderViewProps> = ({
  routine,
  shelf,
  onToggleStep,
  onSaveRoutine,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null);

  // Confirmation dialog for modifying saved routine
  const [pendingChangeAction, setPendingChangeAction] = useState<(() => void) | null>(null);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState<string | null>(null);

  const [stepFormData, setStepFormData] = useState({
    stepName: '',
    purpose: '',
    shelfProductId: '',
    reminderTime: '08:00',
  });

  const activeSteps = routine
    .filter((s) => s.routineType === activeTab)
    .sort((a, b) => a.stepOrder - b.stepOrder);

  const morningCount = routine.filter((s) => s.routineType === 'morning' && s.completedToday).length;
  const morningTotal = routine.filter((s) => s.routineType === 'morning').length;
  const eveningCount = routine.filter((s) => s.routineType === 'evening' && s.completedToday).length;
  const eveningTotal = routine.filter((s) => s.routineType === 'evening').length;

  const requestConfirmation = (message: string, action: () => void) => {
    setConfirmDialogMessage(message);
    setPendingChangeAction(() => action);
  };

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    requestConfirmation('Are you sure you want to reorder your routine steps?', () => {
      const currentList = [...activeSteps];
      const index = currentList.findIndex((s) => s.id === stepId);
      if (index < 0) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= currentList.length) return;

      // Swap orders
      const temp = currentList[index];
      currentList[index] = currentList[targetIndex];
      currentList[targetIndex] = temp;

      // Re-assign stepOrder
      const otherSteps = routine.filter((s) => s.routineType !== activeTab);
      const reorderedActive = currentList.map((step, idx) => ({
        ...step,
        stepOrder: idx + 1,
      }));

      onSaveRoutine([...otherSteps, ...reorderedActive]);
    });
  };

  const handleDeleteStep = (stepId: string) => {
    requestConfirmation('Are you sure you want to remove this step from your daily routine?', () => {
      const updated = routine.filter((s) => s.id !== stepId);
      onSaveRoutine(updated);
    });
  };

  const handleOpenAddModal = () => {
    setEditingStep(null);
    setStepFormData({
      stepName: '',
      purpose: '',
      shelfProductId: shelf.length > 0 ? shelf[0].id : '',
      reminderTime: activeTab === 'morning' ? '07:30' : '21:30',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (step: RoutineStep) => {
    setEditingStep(step);
    setStepFormData({
      stepName: step.stepName,
      purpose: step.purpose,
      shelfProductId: step.shelfProductId || '',
      reminderTime: step.reminderTime || (activeTab === 'morning' ? '07:30' : '21:30'),
    });
    setIsEditModalOpen(true);
  };

  const handleSaveStepModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepFormData.stepName.trim()) return;

    requestConfirmation(
      editingStep
        ? 'Update this step in your saved routine?'
        : 'Add this step to your saved routine?',
      () => {
        if (editingStep) {
          const updated = routine.map((s) =>
            s.id === editingStep.id
              ? {
                  ...s,
                  stepName: stepFormData.stepName.trim(),
                  purpose: stepFormData.purpose.trim(),
                  shelfProductId: stepFormData.shelfProductId || undefined,
                  reminderTime: stepFormData.reminderTime || undefined,
                }
              : s
          );
          onSaveRoutine(updated);
        } else {
          const newStep: RoutineStep = {
            id: `step-${Date.now()}`,
            routineType: activeTab,
            stepOrder: activeSteps.length + 1,
            stepName: stepFormData.stepName.trim(),
            purpose:
              stepFormData.purpose.trim() ||
              'Nourishes and supports epidermal skin barrier stability.',
            shelfProductId: stepFormData.shelfProductId || undefined,
            completedToday: false,
            reminderTime: stepFormData.reminderTime || undefined,
          };
          onSaveRoutine([...routine, newStep]);
        }
        setIsEditModalOpen(false);
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
            <span>Evidence-Based Regimen</span>
            <span>·</span>
            <span>AM & PM Consistency</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Personal Routine Builder
          </h1>
          <p className="text-stone-600 text-sm max-w-xl leading-relaxed">
            Customize and reorder your daily skincare steps. Routines draw directly from products in My Shelf to ensure you make the most of what you already own.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Step</span>
        </button>
      </div>

      {/* AM / PM Segmented Control & Status Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('morning')}
          className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeTab === 'morning'
              ? 'border-stone-900 bg-white shadow-xs ring-1 ring-stone-900'
              : 'border-stone-200 bg-stone-50 hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-base text-stone-900">Morning Routine</div>
              <div className="text-xs text-stone-500 mt-0.5">
                {morningCount} of {morningTotal} steps completed today
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-stone-900">
            {morningTotal > 0 ? Math.round((morningCount / morningTotal) * 100) : 0}%
          </span>
        </button>

        <button
          onClick={() => setActiveTab('evening')}
          className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeTab === 'evening'
              ? 'border-stone-900 bg-white shadow-xs ring-1 ring-stone-900'
              : 'border-stone-200 bg-stone-50 hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-base text-stone-900">Evening Routine</div>
              <div className="text-xs text-stone-500 mt-0.5">
                {eveningCount} of {eveningTotal} steps completed today
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-stone-900">
            {eveningTotal > 0 ? Math.round((eveningCount / eveningTotal) * 100) : 0}%
          </span>
        </button>
      </div>

      {/* Steps List */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="space-y-0.5">
            <h2 className="font-serif font-bold text-base text-stone-900 capitalize">
              {activeTab} Steps Sequence
            </h2>
            <p className="text-xs text-stone-500">
              Apply lighter textures first, sealing with barrier moisturizers and SPF.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {activeSteps.length} Steps
          </span>
        </div>

        {activeSteps.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-stone-500">No steps defined for your {activeTab} routine.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg"
            >
              Add First Step
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSteps.map((step, index) => {
              const linkedShelfItem = shelf.find((p) => p.id === step.shelfProductId);
              const linkedCatalogueItem = SAMPLE_CATALOGUE.find((p) => p.id === step.catalogueProductId);

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    step.completedToday
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-stone-200/80 bg-stone-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Completion Toggle button */}
                    <button
                      type="button"
                      onClick={() => onToggleStep(step.id)}
                      className="mt-0.5 text-stone-400 hover:text-stone-800 transition-colors shrink-0"
                      aria-label="Toggle completion"
                    >
                      {step.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-stone-400 font-bold">
                          0{step.stepOrder}.
                        </span>
                        <h3
                          className={`font-serif font-bold text-sm text-stone-900 truncate ${
                            step.completedToday ? 'line-through text-stone-400' : ''
                          }`}
                        >
                          {step.stepName}
                        </h3>
                        {step.reminderTime && (
                          <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1 bg-stone-100 px-1.5 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            {step.reminderTime}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {step.purpose}
                      </p>

                      {/* Linked product information */}
                      {linkedShelfItem ? (
                        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-900 font-medium">
                          <Archive className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Using from My Shelf:</span>
                          <strong className="text-stone-900">{linkedShelfItem.name}</strong>
                          <span className="text-stone-500">by {linkedShelfItem.brand}</span>
                        </div>
                      ) : linkedCatalogueItem ? (
                        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-stone-600">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Suggested Store Product:</span>
                          <strong className="text-stone-900">{linkedCatalogueItem.name}</strong>
                        </div>
                      ) : (
                        <div className="pt-1 text-[11px] text-stone-400 italic">
                          No specific bottle linked yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step Action buttons: Reorder, Edit, Delete */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveStep(step.id, 'up')}
                      className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-20 rounded"
                      aria-label="Move step up"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={index === activeSteps.length - 1}
                      onClick={() => handleMoveStep(step.id, 'down')}
                      className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-20 rounded"
                      aria-label="Move step down"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(step)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded"
                      aria-label="Edit step"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-700 rounded"
                      aria-label="Delete step"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal Required by Prompt */}
      {confirmDialogMessage && pendingChangeAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Confirm Routine Modification
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {confirmDialogMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setConfirmDialogMessage(null);
                  setPendingChangeAction(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  pendingChangeAction();
                  setConfirmDialogMessage(null);
                  setPendingChangeAction(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Step Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 p-6 max-w-md w-full space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {editingStep ? 'Edit Routine Step' : `Add ${activeTab} Step`}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStepModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Step Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broad-Spectrum SPF 50+, Barrier Serum"
                  value={stepFormData.stepName}
                  onChange={(e) => setStepFormData({ ...stepFormData, stepName: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Purpose / How to Apply
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pat onto damp skin before heavy moisturizers"
                  value={stepFormData.purpose}
                  onChange={(e) => setStepFormData({ ...stepFormData, purpose: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Link Product from My Shelf (Optional)
                </label>
                <select
                  value={stepFormData.shelfProductId}
                  onChange={(e) =>
                    setStepFormData({ ...stepFormData, shelfProductId: e.target.value })
                  }
                  className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  <option value="">-- No specific bottle linked --</option>
                  {shelf.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Prioritizing bottles already on your shelf prevents buying duplicates.
                </span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Daily Reminder Time
                </label>
                <input
                  type="time"
                  value={stepFormData.reminderTime}
                  onChange={(e) =>
                    setStepFormData({ ...stepFormData, reminderTime: e.target.value })
                  }
                  className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
                >
                  Save Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
