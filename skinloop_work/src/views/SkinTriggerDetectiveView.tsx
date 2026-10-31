import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  AlertTriangle, 
  CloudSun, 
  Moon, 
  Clock, 
  Layers, 
  ShieldAlert, 
  Info, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  Lightbulb, 
  Filter,
  RefreshCw,
  FlaskConical,
  Activity
} from 'lucide-react';
import { 
  SkinTriggerPattern, 
  DiaryEntry, 
  SkinExperiment, 
  RoutineItem, 
  UserProfile, 
  EnvironmentalData 
} from '../types';
import { TriggerDetectiveService } from '../services/triggerDetective';

interface SkinTriggerDetectiveViewProps {
  diaryEntries: DiaryEntry[];
  experiments: SkinExperiment[];
  routineItems: RoutineItem[];
  userProfile: UserProfile;
  envData: EnvironmentalData | null;
  onNavigateToExperiments: () => void;
  onNavigateToRoutine: () => void;
}

export const SkinTriggerDetectiveView: React.FC<SkinTriggerDetectiveViewProps> = ({
  diaryEntries,
  experiments,
  routineItems,
  userProfile,
  envData,
  onNavigateToExperiments,
  onNavigateToRoutine
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPattern, setSelectedPattern] = useState<SkinTriggerPattern | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Run detective analysis
  const patterns = useMemo(() => {
    return TriggerDetectiveService.detectPatterns(
      diaryEntries,
      experiments,
      routineItems,
      userProfile,
      envData
    );
  }, [diaryEntries, experiments, routineItems, userProfile, envData]);

  const filteredPatterns = useMemo(() => {
    if (selectedCategory === 'all') return patterns;
    return patterns.filter(p => p.category === selectedCategory);
  }, [patterns, selectedCategory]);

  const totalLogsScanned = diaryEntries.length + experiments.reduce((acc, exp) => acc + (exp.dailyLogs?.length || exp.logs?.length || 0), 0);

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  const getCategoryIcon = (category: SkinTriggerPattern['category']) => {
    switch (category) {
      case 'weather':
        return <CloudSun className="w-5 h-5 text-sky-500" />;
      case 'routine':
        return <Layers className="w-5 h-5 text-indigo-500" />;
      case 'product':
        return <FlaskConical className="w-5 h-5 text-purple-500" />;
      case 'sleep':
        return <Moon className="w-5 h-5 text-amber-500" />;
      default:
        return <Activity className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getConfidenceBadge = (confidence: SkinTriggerPattern['confidence']) => {
    switch (confidence) {
      case 'high':
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">High Co-occurrence</span>;
      case 'medium':
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">Moderate Pattern</span>;
      default:
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">Emerging Signal</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Observational Cross-Analysis Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Skin Trigger Detective</h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Uncovering recurring relationships between your environment, routine consistency, diary notes, and skin observations — without clinical guesswork.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleManualScan}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-sm font-medium transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning Data...' : 'Re-scan Logs'}
            </button>
            <button
              onClick={onNavigateToExperiments}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-sm font-medium transition shadow cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              Test in Experiment Lab
            </button>
          </div>
        </div>

        {/* Audit Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-800/60 text-xs sm:text-sm">
          <div>
            <span className="text-indigo-300 block">Total Data Points</span>
            <span className="text-xl font-bold text-white">{totalLogsScanned} Records</span>
          </div>
          <div>
            <span className="text-indigo-300 block">Active Experiments</span>
            <span className="text-xl font-bold text-white">{experiments.filter(e => e.status === 'active').length} Tracked</span>
          </div>
          <div>
            <span className="text-indigo-300 block">Identified Patterns</span>
            <span className="text-xl font-bold text-white">{patterns.length} Detected</span>
          </div>
          <div>
            <span className="text-indigo-300 block">Live Atmosphere</span>
            <span className="text-xl font-bold text-white">
              {envData?.humidityPct != null ? `${envData.humidityPct}% RH` : (envData as any)?.humidity != null ? `${(envData as any).humidity}% RH` : 'Location pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Non-Causal Scientific Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-sm">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Non-Causal Scientific Notice</p>
          <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
            The Skin Trigger Detective detects observational co-occurrences and statistical correlation across your personal daily logs, routine records, and environmental conditions. It does not establish direct medical causation or substitute for clinical dermatological evaluation.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>
          {[
            { id: 'all', label: 'All Patterns' },
            { id: 'weather', label: 'Atmospheric & Weather' },
            { id: 'routine', label: 'Routine Habits' },
            { id: 'product', label: 'Product Experiments' },
            { id: 'sleep', label: 'Sleep & Lifestyle' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-700">
          Showing {filteredPatterns.length} of {patterns.length} signals
        </span>
      </div>

      {/* Pattern Grid */}
      {filteredPatterns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Matching Patterns Yet</h3>
          <p className="text-slate-700 text-sm max-w-md mx-auto mb-6">
            Log at least 3 to 5 diary entries or start a routine experiment to give the detective data to cross-reference with climate and habits.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onNavigateToExperiments}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow transition cursor-pointer"
            >
              Launch First Experiment
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPatterns.map(pattern => (
            <div
              key={pattern.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between ${
                selectedPattern?.id === pattern.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
              }`}
              onClick={() => setSelectedPattern(pattern)}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getCategoryIcon(pattern.category)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                        {pattern.category} Signal
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{pattern.title}</h3>
                    </div>
                  </div>
                  {getConfidenceBadge(pattern.confidence)}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                  {pattern.description}
                </p>

                {/* Metrics pill row */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
                  <div>
                    <span className="text-slate-700 block">Associated Concern</span>
                    <span className="font-bold text-slate-800 capitalize">{pattern.affectedMetric}</span>
                  </div>
                  <div>
                    <span className="text-slate-700 block">Observed Co-occurrence</span>
                    <span className="font-bold text-indigo-700">
                      {pattern.coOccurrenceRate}% of recorded logs ({pattern.observationCount} logs)
                    </span>
                  </div>
                </div>

                {/* Actionable Recommendation */}
                <div className="flex items-start gap-2.5 text-xs text-indigo-950 bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
                  <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-indigo-900">Recommended Routine Adjustment:</span>
                    <p className="mt-0.5 text-indigo-800">{pattern.recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5" />
                  Updated {new Date(pattern.lastDetected || Date.now()).toLocaleDateString()}
                </span>
                <span className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View Data Evidence <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Inspector Modal / Drawer */}
      {selectedPattern && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  {getCategoryIcon(selectedPattern.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-semibold text-slate-700 tracking-wider">
                      {selectedPattern.category} Evidence
                    </span>
                    {getConfidenceBadge(selectedPattern.confidence)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedPattern.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedPattern(null)}
                className="text-slate-700 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Non-causal banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Evidence records below represent correlated timestamps where both trigger variables and elevated skin markers co-occurred.
              </span>
            </div>

            {/* Pattern Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Pattern Narrative</h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {selectedPattern.description}
              </p>
            </div>

            {/* Concrete Evidence Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Correlated Log Timestamps ({selectedPattern.evidence.length} entries)
              </h4>

              {selectedPattern.evidence.length === 0 ? (
                <p className="text-xs text-slate-700 italic">No historical log details recorded for this pattern.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedPattern.evidence.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-700" />
                          {item.date}
                        </span>
                        <span className="text-slate-700 font-normal">Context: {item.source}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div>
                          <span className="text-slate-700 font-medium">Trigger Factor: </span>
                          <span className="text-slate-900 font-semibold">{item.triggerFactor}</span>
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">Recorded Metric: </span>
                          <span className="text-amber-800 font-bold">{item.skinMetricValue}</span>
                        </div>
                      </div>
                      {item.notes && (
                        <p className="text-slate-700 italic border-t border-slate-100 pt-1">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Recommendations & Links */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedPattern(null);
                  onNavigateToRoutine();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Inspect Current Routine Steps
              </button>
              <button
                onClick={() => {
                  setSelectedPattern(null);
                  onNavigateToExperiments();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                Isolate Variable in Experiment Lab <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
