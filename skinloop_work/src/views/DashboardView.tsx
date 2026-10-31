import React from 'react';
import {
  UserProfile,
  RoutineStep,
  SkinAnalysisRecord,
  ShelfProduct,
  Product,
} from '../types';
import { RecommendationEngine } from '../services/recommendations';
import {
  ScanFace,
  Sparkles,
  Palette,
  Sun,
  CalendarCheck,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  Archive,
  Droplets,
  ShieldCheck,
  Clock,
  Heart,
  ShoppingBag,
  FlaskConical,
  ShoppingCart,
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  routine: RoutineStep[];
  onToggleRoutineStep: (stepId: string) => void;
  latestAnalysis?: SkinAnalysisRecord;
  shelf: ShelfProduct[];
  favorites: Product[];
  onNavigate: (view: string) => void;
  onOpenOnboarding: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  routine,
  onToggleRoutineStep,
  latestAnalysis,
  shelf,
  favorites,
  onNavigate,
  onOpenOnboarding,
}) => {
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  const morningSteps = routine.filter((s) => s.routineType === 'morning');
  const eveningSteps = routine.filter((s) => s.routineType === 'evening');

  const morningDoneCount = morningSteps.filter((s) => s.completedToday).length;
  const eveningDoneCount = eveningSteps.filter((s) => s.completedToday).length;
  const totalCompleted = morningDoneCount + eveningDoneCount;
  const totalSteps = routine.length;
  const completionPct = totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 0;

  // Calculate shelf value saved
  const shelfTotalValue = shelf.reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0);

  // Personalized recommendations with shelf awareness
  const recommendedMatches = React.useMemo(() => {
    return RecommendationEngine.getRecommendations(profile, shelf).slice(0, 4);
  }, [profile, shelf]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. Greeting & Hero Welcome Spotlight */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 p-6 md:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-200 tracking-wider uppercase">
            <span>SkinLoop AI Beauty Companion</span>
            <span>·</span>
            <span>{profile.skinType} Skin Profile</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight text-balance">
            {timeGreeting}, {profile.name.split(' ')[0]}.
          </h1>

          <p className="text-stone-300 text-sm md:text-base leading-relaxed">
            Understand your skin. Find your look. Shop smarter. Track daily barrier hydration and preview your personalized shades.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('analysis')}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-stone-950 font-semibold text-xs rounded-lg hover:bg-white transition-all shadow-xs"
            >
              <ScanFace className="w-4 h-4 text-rose-800" />
              <span>{latestAnalysis ? 'Retake Skin Analysis' : 'Start Skin Analysis'}</span>
            </button>
            <button
              onClick={() => onNavigate('companion')}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-800/80 hover:bg-stone-750 text-stone-200 text-xs font-medium rounded-lg border border-stone-700/60 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask Beauty Companion</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle ambient backdrop */}
        <div
          aria-hidden="true"
          className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute right-32 top-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"
        />
      </section>

      {/* Flagship Innovation Spotlight */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
              Flagship Innovation
            </span>
            <h2 className="text-base font-serif font-bold text-stone-900">Scientific Routine & Purchase Defense</h2>
          </div>
          <span className="text-xs text-stone-500 hidden sm:inline">Single-variable experiments & pre-purchase simulator</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Skin Experiment Lab */}
          <div
            onClick={() => onNavigate('experiments')}
            className="p-5 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white via-rose-50/40 to-white shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  Flagship
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-sm group-hover:text-rose-900 transition-colors">
                Skin Experiment Lab
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Isolate one skincare product or step for 14, 21, or 28 days. Log 6 daily barrier markers and get AI observational synthesis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs font-semibold text-rose-800">
              <span>Start an Experiment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Skin Trigger Detective */}
          <div
            onClick={() => onNavigate('triggers')}
            className="p-5 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-white shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                  Cross-Analysis
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-sm group-hover:text-indigo-900 transition-colors">
                Skin Trigger Detective
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Discover correlations across your journal notes, Open-Meteo climate, humidity, sleep, and routine consistency.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs font-semibold text-indigo-800">
              <span>Explore Skin Signals</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Smart Purchase Simulator */}
          <div
            onClick={() => onNavigate('simulator')}
            className="p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/40 to-white shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Smart Defense
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-sm group-hover:text-emerald-900 transition-colors">
                Purchase Simulator
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Pre-screen cosmetics before spending money. Flags shelf duplicates, routine clashes, sensitivities, and calculates ₹/day.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>Simulate a Purchase</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Action Hub */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-stone-900">Beauty & Skincare Tools</h2>
          <span className="text-xs text-stone-500">Connected Intelligence</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <button
            onClick={() => onNavigate('analysis')}
            className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs text-left transition-all flex flex-col justify-between group"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-900 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <ScanFace className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Skin Analysis</div>
              <div className="text-[10px] text-stone-500 mt-0.5">YouCam AI</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('ingredients')}
            className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs text-left transition-all flex flex-col justify-between group"
          >
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-900 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Ingredient Check</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Conflict Rules</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('weather')}
            className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs text-left transition-all flex flex-col justify-between group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Sun className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Weather & UV</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Live Sensors</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('sunscreen-guide')}
            className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs text-left transition-all flex flex-col justify-between group"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-900 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Droplets className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">AR Sunscreen</div>
              <div className="text-[10px] text-stone-500 mt-0.5">8-Zone Guide</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('foundation')}
            className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs text-left transition-all flex flex-col justify-between group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Foundation</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Shade Match</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('makeup')}
            className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs text-left transition-all flex flex-col justify-between group"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-900 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Makeup Studio</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Virtual Try-On</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('routine')}
            className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs text-left transition-all flex flex-col justify-between group col-span-2 sm:col-span-1"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">My Routine</div>
              <div className="text-[10px] text-stone-500 mt-0.5">AM & PM Regimen</div>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Grid: Today's Routine Checklist + Latest Skin Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Today's Routine (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">Today's Skincare Routine</h2>
              <p className="text-xs text-stone-500">
                {totalCompleted} of {totalSteps} steps completed ({completionPct}%)
              </p>
            </div>
            <button
              onClick={() => onNavigate('routine')}
              className="text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center gap-1"
            >
              <span>Edit Steps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-stone-900 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>

          {/* Morning Routine Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 uppercase tracking-wider">
              <span>Morning Routine</span>
              <span>{morningDoneCount}/{morningSteps.length} done</span>
            </div>
            <div className="space-y-1.5">
              {morningSteps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => onToggleRoutineStep(step.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    step.completedToday
                      ? 'border-emerald-200/80 bg-emerald-50/40 text-stone-700'
                      : 'border-stone-200/70 bg-stone-50/50 hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-stone-400 hover:text-stone-700"
                    aria-label={`Mark ${step.stepName} complete`}
                  >
                    {step.completedToday ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-300 shrink-0" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-stone-900 flex items-center justify-between">
                      <span className={step.completedToday ? 'line-through text-stone-400' : ''}>
                        {step.stepName}
                      </span>
                      {step.reminderTime && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {step.reminderTime}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{step.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evening Routine Block */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 uppercase tracking-wider">
              <span>Evening Routine</span>
              <span>{eveningDoneCount}/{eveningSteps.length} done</span>
            </div>
            <div className="space-y-1.5">
              {eveningSteps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => onToggleRoutineStep(step.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    step.completedToday
                      ? 'border-emerald-200/80 bg-emerald-50/40 text-stone-700'
                      : 'border-stone-200/70 bg-stone-50/50 hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-stone-400 hover:text-stone-700"
                    aria-label={`Mark ${step.stepName} complete`}
                  >
                    {step.completedToday ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-300 shrink-0" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-stone-900 flex items-center justify-between">
                      <span className={step.completedToday ? 'line-through text-stone-400' : ''}>
                        {step.stepName}
                      </span>
                      {step.reminderTime && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {step.reminderTime}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{step.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Latest Skin Analysis & My Shelf Highlights (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Analysis Card */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ScanFace className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-serif font-bold text-stone-900">Latest Skin Analysis</h3>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">
                {latestAnalysis ? new Date(latestAnalysis.timestamp).toLocaleDateString() : 'Pending'}
              </span>
            </div>

            {latestAnalysis ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: latestAnalysis.skinTone.hex }}
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          {latestAnalysis.skinTone.undertone} Undertone
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {latestAnalysis.skinTone.shadeFamily} · {latestAnalysis.skinTone.fitzpatrickType}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium bg-stone-200/80 text-stone-700 px-2 py-0.5 rounded-full">
                      {latestAnalysis.source === 'youcam_live' ? 'YouCam Live' : 'Test Mode'}
                    </span>
                  </div>

                  {/* 3 Key Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-stone-200/60">
                    <div>
                      <div className="text-base font-bold text-stone-900 font-mono tabular-nums">
                        {latestAnalysis.metrics.hydration}%
                      </div>
                      <div className="text-[10px] text-stone-500">Hydration</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-stone-900 font-mono tabular-nums">
                        {latestAnalysis.metrics.textureSmoothness}%
                      </div>
                      <div className="text-[10px] text-stone-500">Smoothness</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-stone-900 font-mono tabular-nums">
                        {latestAnalysis.metrics.oilBalance}%
                      </div>
                      <div className="text-[10px] text-stone-500">Oil Balance</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                  {latestAnalysis.nonMedicalSummary}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigate('analysis')}
                    className="flex-1 py-2 text-center text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  >
                    View Full Metrics
                  </button>
                  <button
                    onClick={() => onNavigate('foundation')}
                    className="flex-1 py-2 text-center text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    Find Match
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-stone-500">No skin scan recorded yet.</p>
                <button
                  onClick={() => onNavigate('analysis')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg"
                >
                  Take Your First Scan
                </button>
              </div>
            )}
          </section>

          {/* My Shelf & Budget Summary Card */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-serif font-bold text-stone-900">My Shelf & Savings</h3>
              </div>
              <button
                onClick={() => onNavigate('shelf')}
                className="text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                <div className="text-lg font-bold text-stone-900 font-mono tabular-nums">
                  {shelf.length}
                </div>
                <div className="text-[11px] text-stone-500">Owned Products</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                <div className="text-lg font-bold text-emerald-900 font-mono tabular-nums">
                  ₹{shelfTotalValue.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-700">Estimated Shelf Value</div>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Your routines automatically draw from products on My Shelf first to prevent redundant purchases.
            </p>
          </section>
        </div>
      </div>

      {/* 4. Personalized Recommendations Section (My Shelf Aware) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Recommendation Engine</span>
            </div>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Personalized Recommendations (My Shelf Priority)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('store')}
            className="text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-stone-500 max-w-2xl">
          Filtered strictly to your {profile.skinType} skin type, {profile.undertone || 'Warm'} undertone, and {profile.sensitivities?.join(', ') || 'sensitive'} tolerance. When a suitable product is already in your shelf inventory, it is highlighted first to avoid redundant spending.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedMatches.map((match) => {
            const prod = match.product;
            return (
              <div
                key={prod.id}
                className={`p-4 rounded-2xl border bg-white flex flex-col justify-between space-y-3 transition-all hover:shadow-sm ${
                  match.alreadyOnShelf
                    ? 'border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50/20'
                    : 'border-stone-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      {prod.brand}
                    </span>
                    {match.alreadyOnShelf ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Already in Shelf
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-mono">
                        {match.matchScore}% Match
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-xs text-stone-900 leading-snug line-clamp-2">
                    {prod.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-stone-900">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-sans text-stone-500 capitalize">
                      · {prod.category}
                    </span>
                  </div>

                  <ul className="space-y-1 pt-1">
                    {match.matchReasons.slice(0, 2).map((reason, idx) => (
                      <li key={idx} className="text-[11px] text-stone-600 flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span className="line-clamp-1">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigate(prod.category === 'foundation' ? 'foundation' : prod.category === 'sunscreen' ? 'store' : 'makeup')}
                    className="flex-1 py-1.5 text-center text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
