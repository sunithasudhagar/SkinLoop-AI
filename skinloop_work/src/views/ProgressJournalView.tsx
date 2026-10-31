import React, { useState } from 'react';
import { SkinAnalysisRecord, JournalNote } from '../types';
import { GamificationService, AchievementBadge } from '../services/gamification';
import { StorageService } from '../services/storage';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Trash2,
  Plus,
  X,
  Split,
  Camera,
  Info,
  Clock,
  CheckCircle2,
  Download,
  Sparkles,
  Shield,
  Award,
  Flame,
} from 'lucide-react';

interface ProgressJournalViewProps {
  history: SkinAnalysisRecord[];
  journalNotes: JournalNote[];
  onAddNote: (note: JournalNote) => void;
  onDeleteAnalysis: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onNavigate: (view: string) => void;
  isDemoMode?: boolean;
  onLoadSampleData?: () => void;
  onClearSampleData?: () => void;
}

export const ProgressJournalView: React.FC<ProgressJournalViewProps> = ({
  history,
  journalNotes,
  onAddNote,
  onDeleteAnalysis,
  onDeleteNote,
  onNavigate,
  isDemoMode,
  onLoadSampleData,
  onClearSampleData,
}) => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<
    'hydration' | 'textureSmoothness' | 'rednessScore' | 'radiance'
  >('hydration');

  const [compareA, setCompareA] = useState<string>(history[1]?.id || history[0]?.id || '');
  const [compareB, setCompareB] = useState<string>(history[0]?.id || '');

  // New Note Form
  const [noteForm, setNoteForm] = useState({
    date: new Date().toISOString().split('T')[0],
    routineCompletedPct: 100,
    skinFeeling: 'Balanced & Comfortable' as const,
    notes: '',
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.notes.trim()) return;

    const newNote: JournalNote = {
      id: `note-${Date.now()}`,
      date: noteForm.date,
      routineCompletedPct: Number(noteForm.routineCompletedPct) || 100,
      skinFeeling: noteForm.skinFeeling,
      notes: noteForm.notes.trim(),
    };
    onAddNote(newNote);
    setIsNoteModalOpen(false);
    setNoteForm({
      date: new Date().toISOString().split('T')[0],
      routineCompletedPct: 100,
      skinFeeling: 'Balanced & Comfortable',
      notes: '',
    });
  };

  // Sort history chronologically for graph
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const metricLabelMap = {
    hydration: 'Hydration Score (%)',
    textureSmoothness: 'Texture Smoothness (%)',
    rednessScore: 'Redness Calmness (%)',
    radiance: 'Skin Radiance (%)',
  };

  const [deletingScanId, setDeletingScanId] = useState<string | null>(null);

  const recordA = history.find((h) => h.id === compareA) || history[1] || history[0];
  const recordB = history.find((h) => h.id === compareB) || history[0];

  const handleExportData = () => {
    const exportPayload = {
      appName: 'SkinLoop AI',
      exportedAt: new Date().toISOString(),
      totalScans: history.length,
      totalNotes: journalNotes.length,
      analysisHistory: history,
      journalNotes: journalNotes,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `skinloop_journal_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
            <span>Progress Tracking & Observations</span>
            <span>·</span>
            <span>Objective Longitudinal Data</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Skin Progress Journal
          </h1>
          <p className="text-stone-600 text-sm max-w-xl leading-relaxed">
            Review dated skin analysis scans, metric progression curves, and daily subjective skin comfort observations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <button
            onClick={handleExportData}
            disabled={history.length === 0 && journalNotes.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs"
            title="Download complete journal history as JSON"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Export Journal</span>
          </button>

          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily Note</span>
          </button>
        </div>
      </div>

      {/* Scientific Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-stone-200 bg-stone-100/70 text-xs text-stone-700 flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 text-stone-600 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-bold text-stone-900">Longitudinal Variation Note:</span>
          <span>
            {' '}Skin surface metrics can vary based on ambient indoor humidity, sleep, hydration, and camera lighting angles. Changes over time reflect general trends rather than direct proof that a single specific cosmetic product caused a given change.
          </span>
        </div>
      </div>

      {/* Demo Mode Alert Banner */}
      {isDemoMode && (
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-indigo-700 shrink-0" />
            <div className="leading-relaxed">
              <span className="font-bold">Evaluation Demo Records Active:</span> Currently displaying illustrative sample scans for dashboard and chart preview. These do not represent actual personal skin measurements.
            </div>
          </div>
          {onClearSampleData && (
            <button
              onClick={onClearSampleData}
              className="px-3 py-1.5 font-semibold text-xs text-stone-700 bg-white hover:bg-stone-50 border border-indigo-200 rounded-lg shadow-2xs transition-colors shrink-0 self-start sm:self-auto"
            >
              Clear Demo Records
            </button>
          )}
        </div>
      )}

      {/* Metric Progression Chart (Rendered only with real data) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h2 className="font-serif font-bold text-base text-stone-900">
              Metric Progression Curve
            </h2>
            <p className="text-xs text-stone-500">
              Plotting {sortedHistory.length} verified analysis records
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs">
            {(['hydration', 'textureSmoothness', 'rednessScore', 'radiance'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedMetric === m
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {m === 'textureSmoothness'
                  ? 'Smoothness'
                  : m === 'rednessScore'
                  ? 'Calmness'
                  : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {sortedHistory.length < 2 ? (
          <div className="py-12 text-center text-xs text-stone-500">
            Trend lines appear once you have at least two saved skin analysis sessions.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-56 w-full relative pt-4">
              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#E7E5E4" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="600" y2="70" stroke="#E7E5E4" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#E7E5E4" strokeDasharray="3 3" />
                <line x1="0" y1="170" x2="600" y2="170" stroke="#E7E5E4" strokeDasharray="3 3" />

                {/* Y-axis labels */}
                <text x="5" y="24" fontSize="10" fill="#A8A29E" fontFamily="monospace">100%</text>
                <text x="5" y="74" fontSize="10" fill="#A8A29E" fontFamily="monospace">75%</text>
                <text x="5" y="124" fontSize="10" fill="#A8A29E" fontFamily="monospace">50%</text>
                <text x="5" y="174" fontSize="10" fill="#A8A29E" fontFamily="monospace">25%</text>

                {/* Plot line coordinates */}
                {(() => {
                  const points = sortedHistory.map((item, idx) => {
                    const x = 50 + (idx / (sortedHistory.length - 1)) * 500;
                    const rawVal = item.metrics[selectedMetric];
                    const val = rawVal ?? 0;
                    // Map 0-100 to y=180 down to y=20
                    const y = 180 - (val / 100) * 160;
                    return { x, y, val: rawVal, date: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) };
                  });

                  const pathD = points.reduce(
                    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                    ''
                  );

                  return (
                    <>
                      {/* Gradient area under line */}
                      <path
                        d={`${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`}
                        fill="rgba(190, 24, 93, 0.06)"
                      />
                      {/* Stroke Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#BE185D"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Nodes */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#FAF8F5" stroke="#BE185D" strokeWidth="2.5" />
                          <text
                            x={p.x}
                            y={p.y - 10}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                            fill="#1C1917"
                          >
                            {p.val}%
                          </text>
                          <text
                            x={p.x}
                            y="195"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#78716C"
                          >
                            {p.date}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="text-right text-[11px] text-stone-500 font-mono">
              Current: {metricLabelMap[selectedMetric]}
            </div>
          </div>
        )}
      </div>

      {/* Gamification: Consistency Streak & Achievement Badges */}
      {(() => {
        const routine = StorageService.getRoutine();
        const shelf = StorageService.getShelf();
        const streakData = GamificationService.calculateStreak(routine, journalNotes);
        const badges = GamificationService.evaluateBadges({
          routine,
          shelf,
          history,
          journalNotes,
          streakDays: streakData.currentStreakDays,
          hasUsedIngredientChecker: true,
        });
        const unlockedCount = badges.filter((b) => b.isUnlocked).length;

        return (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>Routine Consistency & Achievements</span>
                </div>
                <h2 className="font-serif font-bold text-base text-stone-900">
                  Habit Streaks & Milestone Badges
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-stone-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>{streakData.currentStreakDays}-Day Streak</span>
                </span>
                <span className="text-xs font-mono text-stone-500">
                  {unlockedCount} of {badges.length} Badges Unlocked
                </span>
              </div>
            </div>

            {/* 7-Day Completion Dots Tracker */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800">Past 7 Days Consistency:</span>
                <span className="font-mono text-stone-500">{streakData.weeklyCompletionRatePct}% weekly average</span>
              </div>
              <div className="grid grid-cols-7 gap-2 pt-1">
                {streakData.dailyHistory.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center p-2 rounded-lg bg-white border border-stone-200 text-center space-y-1"
                  >
                    <span className="text-[10px] text-stone-400 font-semibold">{day.dayName}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        day.completedPct >= 80
                          ? 'bg-emerald-600 text-white'
                          : day.completedPct > 0
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      {day.completedPct > 0 ? `${day.completedPct}%` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Badges Showcase */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                Milestone Badges (Earned from Verified User Activity)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between space-y-2 transition-all ${
                      badge.isUnlocked
                        ? 'border-amber-200 bg-amber-50/30 shadow-2xs'
                        : 'border-stone-200/80 bg-stone-50/40 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Award
                          className={`w-4 h-4 ${
                            badge.isUnlocked ? 'text-amber-600' : 'text-stone-400'
                          }`}
                        />
                        <span
                          className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                            badge.isUnlocked
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-xs mt-1">
                        {badge.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 leading-snug">
                        {badge.description}
                      </p>
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-200/60">
                      {badge.progressText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Side-by-Side Session Comparison Tool */}
      {history.length >= 2 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">
                Side-by-Side Scan Comparison
              </h2>
              <p className="text-xs text-stone-500">
                Compare baseline scan against recent progress. Note lighting & camera consistency.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="p-1.5 border border-stone-200 rounded-md bg-stone-50"
              >
                {history.map((h) => (
                  <option key={h.id} value={h.id}>
                    Earlier ({new Date(h.timestamp).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <span className="text-stone-400">vs</span>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="p-1.5 border border-stone-200 rounded-md bg-stone-50"
              >
                {history.map((h) => (
                  <option key={h.id} value={h.id}>
                    Later ({new Date(h.timestamp).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {recordA && recordB && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card A */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 font-mono">
                    {new Date(recordA.timestamp).toLocaleDateString([], {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                    Baseline
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-stone-100">
                    <div className="text-stone-400 text-[10px]">Hydration</div>
                    <div className="font-mono font-bold text-stone-900">{recordA.metrics.hydration}%</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-100">
                    <div className="text-stone-400 text-[10px]">Texture</div>
                    <div className="font-mono font-bold text-stone-900">{recordA.metrics.textureSmoothness}%</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-100">
                    <div className="text-stone-400 text-[10px]">Calmness</div>
                    <div className="font-mono font-bold text-stone-900">{recordA.metrics.rednessScore}%</div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2">
                  {recordA.nonMedicalSummary}
                </p>
              </div>

              {/* Card B */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 font-mono">
                    {new Date(recordB.timestamp).toLocaleDateString([], {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                    Recent Scan
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-stone-100">
                    <div className="text-stone-400 text-[10px]">Hydration</div>
                    <div className="font-mono font-bold text-stone-900">
                      {recordB.metrics.hydration != null ? `${recordB.metrics.hydration}%` : 'Unavailable'}
                      {recordB.metrics.hydration != null && recordA.metrics.hydration != null && (
                        <span className="text-[10px] text-emerald-600 ml-1">
                          ({recordB.metrics.hydration - recordA.metrics.hydration >= 0 ? '+' : ''}
                          {recordB.metrics.hydration - recordA.metrics.hydration})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-100">
                    <div className="text-stone-400 text-[10px]">Texture</div>
                    <div className="font-mono font-bold text-stone-900">
                      {recordB.metrics.textureSmoothness != null ? `${recordB.metrics.textureSmoothness}%` : 'Unavailable'}
                      {recordB.metrics.textureSmoothness != null && recordA.metrics.textureSmoothness != null && (
                        <span className="text-[10px] text-emerald-600 ml-1">
                          ({recordB.metrics.textureSmoothness - recordA.metrics.textureSmoothness >= 0 ? '+' : ''}
                          {recordB.metrics.textureSmoothness - recordA.metrics.textureSmoothness})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-100">
                    <div className="text-stone-400 text-[10px]">Calmness</div>
                    <div className="font-mono font-bold text-stone-900">
                      {recordB.metrics.rednessScore != null ? `${recordB.metrics.rednessScore}%` : 'Unavailable'}
                      {recordB.metrics.rednessScore != null && recordA.metrics.rednessScore != null && (
                        <span className="text-[10px] text-emerald-600 ml-1">
                          ({recordB.metrics.rednessScore - recordA.metrics.rednessScore >= 0 ? '+' : ''}
                          {recordB.metrics.rednessScore - recordA.metrics.rednessScore})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2">
                  {recordB.nonMedicalSummary}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Skin Analysis Sessions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="font-serif font-bold text-base text-stone-900">
              Historical Skin Analysis Sessions
            </h2>
            <p className="text-xs text-stone-500">
              {history.length} Saved Scans
            </p>
          </div>
          <button
            onClick={() => onNavigate('analysis')}
            className="text-xs font-semibold text-rose-900 hover:text-rose-950 flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <p className="text-xs text-stone-500">
              No skin analysis sessions recorded yet. Real user accounts begin with zero preloaded scans.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={() => onNavigate('analysis')}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                <span>Run First Real Scan</span>
              </button>
              {onLoadSampleData && (
                <button
                  onClick={onLoadSampleData}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors"
                >
                  Load Sample Demo Records
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((scan) => (
              <div
                key={scan.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">
                      {new Date(scan.timestamp).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        scan.source === 'youcam_live'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {scan.source === 'youcam_live' ? 'Live Computer Vision' : 'Evaluation Sandbox Scan'}
                    </span>
                    {scan.overallScore !== undefined && (
                      <span className="text-[10px] font-mono font-bold bg-stone-200 text-stone-800 px-2 py-0.5 rounded-full">
                        Index: {scan.overallScore}/100
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600 font-mono">
                    <span>Hydration: <strong>{scan.metrics.hydration}%</strong></span>
                    <span>Texture: <strong>{scan.metrics.textureSmoothness}%</strong></span>
                    <span>Calmness: <strong>{scan.metrics.rednessScore}%</strong></span>
                    <span>Spots: <strong>{scan.metrics.spotsClarity}%</strong></span>
                    <span>Oil: <strong>{scan.metrics.oilBalance}%</strong></span>
                  </div>

                  <p className="text-[11px] text-stone-500 line-clamp-1">
                    {scan.nonMedicalSummary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {deletingScanId === scan.id ? (
                    <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1.5 rounded-lg text-rose-900">
                      <span className="text-[10px] font-semibold">Delete scan?</span>
                      <button
                        onClick={() => {
                          onDeleteAnalysis(scan.id);
                          setDeletingScanId(null);
                        }}
                        className="px-2 py-0.5 bg-rose-700 text-white font-bold rounded text-[10px] hover:bg-rose-800"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingScanId(null)}
                        className="px-2 py-0.5 bg-stone-200 text-stone-700 font-bold rounded text-[10px] hover:bg-stone-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingScanId(scan.id)}
                      className="p-2 text-stone-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete this analysis scan"
                      aria-label="Delete analysis scan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Notes Timeline */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h2 className="font-serif font-bold text-base text-stone-900">
            Daily Observations & Routine Log
          </h2>
          <span className="text-xs text-stone-500 font-mono">
            {journalNotes.length} Entries
          </span>
        </div>

        {journalNotes.length === 0 ? (
          <p className="text-xs text-stone-500 py-6 text-center">No observation notes logged yet.</p>
        ) : (
          <div className="space-y-3">
            {journalNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/40 text-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-stone-900">{note.date}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700">
                      {note.skinFeeling}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {note.routineCompletedPct}% Routine completed
                    </span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{note.notes}</p>
                </div>

                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-700 rounded transition-colors"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Daily Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Record Daily Observation
              </h3>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={noteForm.date}
                    onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Routine Completed (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={noteForm.routineCompletedPct}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, routineCompletedPct: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  How does your skin feel today?
                </label>
                <select
                  value={noteForm.skinFeeling}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, skinFeeling: e.target.value as any })
                  }
                  className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  <option value="Balanced & Comfortable">Balanced & Comfortable</option>
                  <option value="Dry & Tight">Dry & Tight</option>
                  <option value="Oily & Shiny">Oily & Shiny</option>
                  <option value="Sensitive & Flushed">Sensitive & Flushed</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Observation Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Tried the new ceramide cushion cream last night. Skin felt smooth this morning with zero dry flaking around the mouth."
                  value={noteForm.notes}
                  onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
