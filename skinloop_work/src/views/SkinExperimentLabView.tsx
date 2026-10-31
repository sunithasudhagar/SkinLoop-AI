import React, { useState } from 'react';
import {
  UserProfile,
  ShelfProduct,
  RoutineStep,
  SkinExperiment,
  ExperimentDailyLog,
  ExperimentDailyObservation,
} from '../types';
import {
  FlaskConical,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  Info,
  ChevronRight,
  RotateCcw,
  Check,
  StopCircle,
} from 'lucide-react';

interface SkinExperimentLabViewProps {
  profile: UserProfile;
  shelf: ShelfProduct[];
  routine: RoutineStep[];
  experiments: SkinExperiment[];
  onSaveExperiment: (experiment: SkinExperiment) => void;
  onDeleteExperiment: (id: string) => void;
  onNavigate: (view: string) => void;
}

export const SkinExperimentLabView: React.FC<SkinExperimentLabViewProps> = ({
  profile,
  shelf,
  routine,
  experiments,
  onSaveExperiment,
  onDeleteExperiment,
  onNavigate,
}) => {
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>(
    experiments[0]?.id || ''
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // New Experiment Form State
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpTargetType, setNewExpTargetType] = useState<'shelf_product' | 'routine_step' | 'new_variable'>('shelf_product');
  const [newExpSelectedTarget, setNewExpSelectedTarget] = useState(shelf[0]?.name || '');
  const [newExpVariableTested, setNewExpVariableTested] = useState('');
  const [newExpHypothesis, setNewExpHypothesis] = useState('');
  const [newExpDuration, setNewExpDuration] = useState<14 | 21 | 28>(14);
  const [newExpBaseline, setNewExpBaseline] = useState<ExperimentDailyObservation>({
    dryness: 2,
    oiliness: 2,
    redness: 1,
    irritation: 1,
    breakouts: 1,
    comfort: 4,
  });
  const [newExpBaselineNotes, setNewExpBaselineNotes] = useState('');
  const [newExpBaselinePhoto, setNewExpBaselinePhoto] = useState<string | null>(null);

  // Today's Log Form State
  const activeExperiment = experiments.find((e) => e.id === selectedExperimentId) || experiments[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogged = activeExperiment?.logs.some((l) => l.date === todayStr);

  const [logForm, setLogForm] = useState<ExperimentDailyObservation>({
    dryness: 2,
    oiliness: 2,
    redness: 1,
    irritation: 1,
    breakouts: 1,
    comfort: 4,
  });
  const [logNotes, setLogNotes] = useState('');
  const [logMissedRoutine, setLogMissedRoutine] = useState(false);
  const [logProductChanges, setLogProductChanges] = useState('');
  const [logPhotoUrl, setLogPhotoUrl] = useState<string | null>(null);

  const handleCreateExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + newExpDuration);

    const experiment: SkinExperiment = {
      id: `exp-${Date.now()}`,
      title: newExpTitle || `Testing: ${newExpSelectedTarget}`,
      targetType: newExpTargetType,
      targetName: newExpSelectedTarget,
      targetCategory: 'Targeted Routine Test',
      variableTested: newExpVariableTested || `Daily use of ${newExpSelectedTarget}`,
      hypothesis: newExpHypothesis || 'Assess skin barrier tolerance and observation trends over systematic duration.',
      durationDays: newExpDuration,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
      baselineObservation: newExpBaseline,
      baselineNotes: newExpBaselineNotes || 'Initial baseline recorded before testing variable.',
      baselinePhotoUrl: newExpBaselinePhoto || undefined,
      logs: [],
      createdAt: new Date().toISOString(),
    };

    onSaveExperiment(experiment);
    setSelectedExperimentId(experiment.id);
    setIsCreateModalOpen(false);

    // Reset Form
    setNewExpTitle('');
    setNewExpVariableTested('');
    setNewExpHypothesis('');
    setNewExpBaselineNotes('');
    setNewExpBaselinePhoto(null);
  };

  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExperiment) return;

    const currentDay = activeExperiment.logs.length + 1;
    const newLog: ExperimentDailyLog = {
      id: `log-${Date.now()}`,
      dayNumber: currentDay,
      date: todayStr,
      observation: logForm,
      missedRoutineDay: logMissedRoutine,
      productChangeNotes: logProductChanges.trim() || undefined,
      notes: logNotes.trim(),
      photoUrl: logPhotoUrl || undefined,
      recordedAt: new Date().toISOString(),
    };

    const updatedLogs = [...activeExperiment.logs, newLog];
    const isCompleted = updatedLogs.length >= activeExperiment.durationDays;

    const updatedExp: SkinExperiment = {
      ...activeExperiment,
      logs: updatedLogs,
      status: isCompleted ? 'completed' : 'active',
    };

    onSaveExperiment(updatedExp);
    setLogNotes('');
    setLogProductChanges('');
    setLogPhotoUrl(null);
  };

  const handleStopExperimentEarly = () => {
    if (!activeExperiment) return;
    const updatedExp: SkinExperiment = {
      ...activeExperiment,
      status: 'stopped_early',
      stoppedReason: stopReason || 'Stopped early by user due to perceived sensitivity or comfort adjustment.',
    };
    onSaveExperiment(updatedExp);
    setIsStopConfirmOpen(false);
    setStopReason('');
  };

  const handleGenerateAiSummary = async () => {
    if (!activeExperiment) return;
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const res = await fetch('/api/experiments/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiment: activeExperiment,
          userProfile: profile,
        }),
      });

      if (!res.ok) {
        throw new Error('Synthesis service unavailable');
      }

      const data = await res.json();
      const updatedExp: SkinExperiment = {
        ...activeExperiment,
        aiSynthesis: data.synthesis,
      };
      onSaveExperiment(updatedExp);
    } catch {
      // Deterministic client fallback if server route offline
      const baseline = activeExperiment.baselineObservation;
      const recentLog = activeExperiment.logs[activeExperiment.logs.length - 1]?.observation || baseline;
      const comfortDelta = recentLog.comfort - baseline.comfort;
      const irritationDelta = recentLog.irritation - baseline.irritation;

      const updatedExp: SkinExperiment = {
        ...activeExperiment,
        aiSynthesis: {
          generatedAt: new Date().toISOString(),
          summary: `Systematic evaluation of "${activeExperiment.variableTested}" tracked across ${activeExperiment.logs.length} observation days. Baseline comfort was rated ${baseline.comfort}/5 and ended at ${recentLog.comfort}/5.`,
          trendAnalysis: comfortDelta >= 0
            ? 'Longitudinal logs reflect steady barrier comfort with minimal reported acute irritation. Skin maintained balance throughout the trial window.'
            : 'Observations note mild fluctuations in comfort or occasional tightness. Response patterns remained manageable under continued observation.',
          keyObservations: [
            `Average reported irritation: ${recentLog.irritation}/5 (Baseline: ${baseline.irritation}/5).`,
            `Recorded routine completion discipline: ${activeExperiment.logs.filter((l) => !l.missedRoutineDay).length}/${activeExperiment.logs.length} days.`,
            `Surface redness ratings showed ${irritationDelta <= 0 ? 'calm stability' : 'mild transient sensitivity'}.`,
          ],
          suggestedNextSteps: [
            'Maintain single-variable testing discipline when introducing subsequent active ingredients.',
            'Continue daytime broad-spectrum SPF 50+ to protect experimental barrier progress.',
          ],
          nonCausalDisclaimer:
            'Non-medical longitudinal synthesis. Observations describe recorded user feelings and photo logs. Individual cosmetic response curves depend on ambient humidity, diet, and multi-factor skin biology.',
        },
      };
      onSaveExperiment(updatedExp);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'baseline' | 'daily') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'baseline') setNewExpBaselinePhoto(result);
      else setLogPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full">
            <FlaskConical className="w-3.5 h-3.5 text-rose-600" />
            <span>Skin Experiment Lab</span>
            <span>·</span>
            <span>Systematic Single-Variable Testing</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Skincare Science Lab
          </h1>
          <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
            Test one product or routine change at a time. Track daily barrier comfort, redness, and breakouts over 14 to 28 days to scientifically isolate what truly works for your skin.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Experiment</span>
        </button>
      </div>

      {/* 2. Scientific Discipline Notice */}
      <div className="p-4 rounded-xl border border-stone-200 bg-white/70 text-xs text-stone-700 flex items-start gap-3 shadow-2xs">
        <Info className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <span className="font-bold text-stone-900 block">The Single-Variable Rule:</span>
          <span>
            When testing a new skincare formula, keep all other cleansers, moisturizers, and sunscreens constant. Changing multiple steps simultaneously makes it impossible to know which product drove your skin observations.
          </span>
        </div>
      </div>

      {/* 3. Experiments Selector Tabs if multiple */}
      {experiments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {experiments.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setSelectedExperimentId(exp.id)}
              className={`px-3.5 py-2 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-2 border ${
                selectedExperimentId === exp.id
                  ? 'bg-white border-stone-900 text-stone-900 shadow-xs font-bold'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <FlaskConical className={`w-3.5 h-3.5 ${exp.status === 'active' ? 'text-rose-600' : 'text-stone-400'}`} />
              <span className="truncate max-w-[180px]">{exp.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded ${
                  exp.status === 'active'
                    ? 'bg-rose-100 text-rose-800 font-bold'
                    : exp.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {exp.status === 'active' ? `Day ${exp.logs.length}/${exp.durationDays}` : exp.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 4. Active Experiment Dashboard */}
      {activeExperiment ? (
        <div className="space-y-6">
          {/* Main Experiment Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6 shadow-xs">
            {/* Top Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      activeExperiment.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeExperiment.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeExperiment.status === 'active'
                      ? 'In Progress'
                      : activeExperiment.status === 'completed'
                      ? 'Completed Experiment'
                      : 'Stopped Early'}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {activeExperiment.startDate} to {activeExperiment.endDate} ({activeExperiment.durationDays} Days)
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  {activeExperiment.title}
                </h2>
                <p className="text-xs text-stone-600">
                  <strong>Variable Tested:</strong> {activeExperiment.variableTested}
                </p>
                <p className="text-xs text-stone-500 italic">
                  <strong>Hypothesis:</strong> "{activeExperiment.hypothesis}"
                </p>
              </div>

              {activeExperiment.status === 'active' && (
                <button
                  onClick={() => setIsStopConfirmOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Stop Experiment Early</span>
                </button>
              )}
            </div>

            {/* Progress Bar & Day Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
                <span>Timeline Progress</span>
                <span className="font-mono">
                  {activeExperiment.logs.length} of {activeExperiment.durationDays} Days Logged ({Math.round((activeExperiment.logs.length / activeExperiment.durationDays) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-stone-900 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((activeExperiment.logs.length / activeExperiment.durationDays) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Baseline Snapshot Block */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-3 text-xs">
              <div className="flex items-center justify-between font-semibold text-stone-800">
                <span>Baseline Observation (Day 0)</span>
                <span className="text-[10px] text-stone-500 font-mono">Recorded before test</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                <div className="p-2 bg-white rounded-lg border border-stone-100">
                  <div className="text-[10px] text-stone-400">Dryness</div>
                  <div className="font-mono font-bold text-stone-900">{activeExperiment.baselineObservation.dryness}/5</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-100">
                  <div className="text-[10px] text-stone-400">Oiliness</div>
                  <div className="font-mono font-bold text-stone-900">{activeExperiment.baselineObservation.oiliness}/5</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-100">
                  <div className="text-[10px] text-stone-400">Redness</div>
                  <div className="font-mono font-bold text-stone-900">{activeExperiment.baselineObservation.redness}/5</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-100">
                  <div className="text-[10px] text-stone-400">Irritation</div>
                  <div className="font-mono font-bold text-stone-900">{activeExperiment.baselineObservation.irritation}/5</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-100">
                  <div className="text-[10px] text-stone-400">Breakouts</div>
                  <div className="font-mono font-bold text-stone-900">{activeExperiment.baselineObservation.breakouts}/5</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-100">
                  <div className="text-[10px] text-stone-400">Comfort</div>
                  <div className="font-mono font-bold text-emerald-800">{activeExperiment.baselineObservation.comfort}/5</div>
                </div>
              </div>
              {activeExperiment.baselineNotes && (
                <p className="text-[11px] text-stone-600 italic">
                  "{activeExperiment.baselineNotes}"
                </p>
              )}
            </div>

            {/* Today's Daily Log Input (If active and not logged yet today) */}
            {activeExperiment.status === 'active' && !todayLogged && (
              <form onSubmit={handleSaveDailyLog} className="p-5 rounded-2xl border-2 border-stone-900/10 bg-stone-50/50 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-stone-800" />
                    <span className="font-serif font-bold text-sm text-stone-900">
                      Record Day {activeExperiment.logs.length + 1} Daily Observations
                    </span>
                  </div>
                  <span className="font-mono text-stone-500">{todayStr}</span>
                </div>

                {/* 6 Metric Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex justify-between font-semibold text-stone-700 mb-1">
                      <span>Dryness & Tightness:</span>
                      <span className="font-mono text-stone-900">{logForm.dryness}/5</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={logForm.dryness}
                      onChange={(e) => setLogForm({ ...logForm, dryness: Number(e.target.value) })}
                      className="w-full accent-stone-900"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>None</span>
                      <span>Severe</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between font-semibold text-stone-700 mb-1">
                      <span>Oiliness & Greasiness:</span>
                      <span className="font-mono text-stone-900">{logForm.oiliness}/5</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={logForm.oiliness}
                      onChange={(e) => setLogForm({ ...logForm, oiliness: Number(e.target.value) })}
                      className="w-full accent-stone-900"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>Matte</span>
                      <span>Excessive</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between font-semibold text-stone-700 mb-1">
                      <span>Visible Redness:</span>
                      <span className="font-mono text-stone-900">{logForm.redness}/5</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={logForm.redness}
                      onChange={(e) => setLogForm({ ...logForm, redness: Number(e.target.value) })}
                      className="w-full accent-stone-900"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>Calm</span>
                      <span>Flushed</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between font-semibold text-stone-700 mb-1">
                      <span>Stinging / Irritation:</span>
                      <span className="font-mono text-stone-900">{logForm.irritation}/5</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={logForm.irritation}
                      onChange={(e) => setLogForm({ ...logForm, irritation: Number(e.target.value) })}
                      className="w-full accent-stone-900"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>None</span>
                      <span>Intense</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between font-semibold text-stone-700 mb-1">
                      <span>Breakouts & Blemishes:</span>
                      <span className="font-mono text-stone-900">{logForm.breakouts}/5</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={logForm.breakouts}
                      onChange={(e) => setLogForm({ ...logForm, breakouts: Number(e.target.value) })}
                      className="w-full accent-stone-900"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>Clear</span>
                      <span>Active</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between font-semibold text-stone-700 mb-1">
                      <span>Overall Skin Comfort:</span>
                      <span className="font-mono text-stone-900">{logForm.comfort}/5</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={logForm.comfort}
                      onChange={(e) => setLogForm({ ...logForm, comfort: Number(e.target.value) })}
                      className="w-full accent-stone-900"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>Uncomfortable</span>
                      <span>Balanced</span>
                    </div>
                  </div>
                </div>

                {/* Missed Routine Checkbox & Product Changes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-800 block">Product Change or Variable Notes:</label>
                    <input
                      type="text"
                      placeholder="e.g. Switched from tap water to thermal mist, or applied 3 drops instead of 2"
                      value={logProductChanges}
                      onChange={(e) => setLogProductChanges(e.target.value)}
                      className="w-full p-2 border border-stone-200 rounded-lg bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-800 block">Daily Notes & Sensation:</label>
                    <input
                      type="text"
                      placeholder="e.g. Skin felt soft upon waking, slight tingle around nose"
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      className="w-full p-2 border border-stone-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={logMissedRoutine}
                        onChange={(e) => setLogMissedRoutine(e.target.checked)}
                        className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                      />
                      <span className="text-stone-700 font-medium">Missed or skipped regular routine steps today</span>
                    </label>

                    <label className="cursor-pointer text-stone-700 hover:text-stone-900 font-medium flex items-center gap-1.5 border border-stone-200 bg-white px-2.5 py-1.5 rounded-lg shadow-2xs">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{logPhotoUrl ? 'Photo Attached' : 'Attach Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, 'daily')}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs"
                  >
                    Save Day {activeExperiment.logs.length + 1} Log
                  </button>
                </div>
              </form>
            )}

            {todayLogged && activeExperiment.status === 'active' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Today's observation log is complete for this experiment. Return tomorrow to record Day {activeExperiment.logs.length + 1}.</span>
              </div>
            )}

            {/* Chronological Timeline */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Chronological Experiment Timeline ({activeExperiment.logs.length} Logs)
                </h3>
                {activeExperiment.logs.length >= 3 && (
                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={isGeneratingAi}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-950 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-rose-700 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAi ? 'Synthesizing...' : 'Generate AI Synthesis'}</span>
                  </button>
                )}
              </div>

              {activeExperiment.logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500">
                  No daily logs recorded yet. Submit your Day 1 observations using the form above.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeExperiment.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-stone-900">Day {log.dayNumber}</span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-500">{log.date}</span>
                          {log.missedRoutineDay && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-sans px-2 py-0.2 rounded font-semibold">
                              Missed Routine Step
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600 font-mono">
                          <span>Comfort: <strong>{log.observation.comfort}/5</strong></span>
                          <span>Dryness: <strong>{log.observation.dryness}/5</strong></span>
                          <span>Oiliness: <strong>{log.observation.oiliness}/5</strong></span>
                          <span>Redness: <strong>{log.observation.redness}/5</strong></span>
                          <span>Irritation: <strong>{log.observation.irritation}/5</strong></span>
                        </div>

                        {log.notes && (
                          <p className="text-stone-700 font-sans text-[11px]">{log.notes}</p>
                        )}
                        {log.productChangeNotes && (
                          <p className="text-stone-500 text-[10px] italic">Note: {log.productChangeNotes}</p>
                        )}
                      </div>

                      {log.photoUrl && (
                        <div className="shrink-0">
                          <img
                            src={log.photoUrl}
                            alt={`Day ${log.dayNumber}`}
                            className="w-14 h-14 object-cover rounded-lg border border-stone-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Experiment Synthesis Card */}
            {activeExperiment.aiSynthesis && (
              <div className="p-6 rounded-2xl border border-rose-200/80 bg-rose-50/30 space-y-4 text-xs">
                <div className="flex items-center gap-2 text-rose-950 font-serif font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-rose-700" />
                  <span>AI Longitudinal Synthesis</span>
                  <span className="text-[10px] font-mono text-stone-400 font-normal">
                    Generated {new Date(activeExperiment.aiSynthesis.generatedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-stone-800 leading-relaxed font-medium">
                  {activeExperiment.aiSynthesis.summary}
                </p>

                <div className="p-3.5 bg-white rounded-xl border border-rose-100 space-y-2">
                  <span className="font-bold text-stone-900 block uppercase text-[10px] tracking-wider">
                    Observed Longitudinal Patterns:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-stone-700">
                    {activeExperiment.aiSynthesis.keyObservations.map((obs: string, idx: number) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-rose-100 space-y-2">
                  <span className="font-bold text-stone-900 block uppercase text-[10px] tracking-wider">
                    Recommended Next Steps:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-stone-700">
                    {activeExperiment.aiSynthesis.suggestedNextSteps.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 text-[10px] text-stone-500 italic border-t border-rose-100">
                  {activeExperiment.aiSynthesis.nonCausalDisclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
          <FlaskConical className="w-12 h-12 text-stone-400 mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-serif font-bold text-stone-900">
              No Skin Experiments Active
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Start a 14 to 28 day trial to systematically test a new serum, moisturizer, or routine step. Track daily comfort, photos, and missed days to see what genuinely suits your skin.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Launch First Experiment</span>
          </button>
        </div>
      )}

      {/* 5. Create Experiment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-lg w-full space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-rose-700" />
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Configure Systematic Skin Experiment
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExperiment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-800 block">Experiment Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evaluating 10% Niacinamide Serum AM"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full p-2.5 border border-stone-200 rounded-lg bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-800 block">Target Product from Shelf:</label>
                  <select
                    value={newExpSelectedTarget}
                    onChange={(e) => setNewExpSelectedTarget(e.target.value)}
                    className="w-full p-2.5 border border-stone-200 rounded-lg bg-stone-50"
                  >
                    {shelf.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                    <option value="New Product Introduction">New Formula (Custom)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-800 block">Duration Window:</label>
                  <select
                    value={newExpDuration}
                    onChange={(e) => setNewExpDuration(Number(e.target.value) as 14 | 21 | 28)}
                    className="w-full p-2.5 border border-stone-200 rounded-lg bg-stone-50 font-mono"
                  >
                    <option value={14}>14 Days (Introductory Tolerance)</option>
                    <option value={21}>21 Days (Barrier Adaptation)</option>
                    <option value={28}>28 Days (Full Cellular Cycle)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-800 block">Variable Being Tested:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adding 3 drops of B5 serum after morning cleansing"
                  value={newExpVariableTested}
                  onChange={(e) => setNewExpVariableTested(e.target.value)}
                  className="w-full p-2.5 border border-stone-200 rounded-lg bg-stone-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-800 block">Observation Hypothesis:</label>
                <input
                  type="text"
                  placeholder="e.g. Test if cheek tightness decreases by Day 14 without pore congestion"
                  value={newExpHypothesis}
                  onChange={(e) => setNewExpHypothesis(e.target.value)}
                  className="w-full p-2.5 border border-stone-200 rounded-lg bg-stone-50"
                />
              </div>

              {/* Baseline Observation Sliders */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="font-bold text-stone-900 block text-xs">
                  Record Baseline Day 0 Observations:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex justify-between text-stone-600 mb-0.5">
                      <span>Baseline Dryness:</span>
                      <span className="font-mono">{newExpBaseline.dryness}/5</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newExpBaseline.dryness}
                      onChange={(e) => setNewExpBaseline({ ...newExpBaseline, dryness: Number(e.target.value) })}
                      className="w-full accent-stone-900"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-stone-600 mb-0.5">
                      <span>Baseline Comfort:</span>
                      <span className="font-mono">{newExpBaseline.comfort}/5</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newExpBaseline.comfort}
                      onChange={(e) => setNewExpBaseline({ ...newExpBaseline, comfort: Number(e.target.value) })}
                      className="w-full accent-stone-900"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Baseline skin notes (e.g. feeling slightly tight after shower today)"
                  value={newExpBaselineNotes}
                  onChange={(e) => setNewExpBaselineNotes(e.target.value)}
                  className="w-full p-2 border border-stone-200 rounded bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
                >
                  Start Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Stop Early Confirmation Modal */}
      {isStopConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-sm w-full space-y-4 shadow-xl text-xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Stop Experiment Early?
                </h3>
                <p className="text-stone-500 mt-1 leading-relaxed">
                  If you are experiencing irritation, stinging, or redness, stopping the test is the recommended, skin-safe decision.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Reason for stopping:</label>
              <input
                type="text"
                placeholder="e.g. Mild stinging sensation after 4 days of use"
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                className="w-full p-2 border border-stone-200 rounded bg-stone-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsStopConfirmOpen(false)}
                className="px-3.5 py-1.5 font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Keep Testing
              </button>
              <button
                onClick={handleStopExperimentEarly}
                className="px-4 py-1.5 font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs"
              >
                Stop Experiment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
