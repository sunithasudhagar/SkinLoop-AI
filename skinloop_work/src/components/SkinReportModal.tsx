import React, { useRef } from 'react';
import {
  UserProfile,
  SkinAnalysisRecord,
  RoutineStep,
  ShelfProduct,
  JournalNote,
} from '../types';
import {
  Printer,
  Download,
  X,
  Shield,
  Calendar,
  Sparkles,
  Archive,
  Clock,
  Info,
} from 'lucide-react';

interface SkinReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  history: SkinAnalysisRecord[];
  routine: RoutineStep[];
  shelf: ShelfProduct[];
  journalNotes: JournalNote[];
}

export const SkinReportModal: React.FC<SkinReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  history,
  routine,
  shelf,
  journalNotes,
}) => {
  const reportRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const payload = {
      reportType: 'SkinLoop AI Comprehensive Dermatological & Beauty Dossier',
      generatedAt: new Date().toISOString(),
      userProfile: profile,
      analysisHistory: history,
      currentRoutine: routine,
      shelfInventory: shelf,
      journalNotes: journalNotes,
      disclaimer:
        'This dossier contains cosmetic analysis metrics and cosmetic routine recommendations. It is strictly non-medical and does not constitute clinical dermatology diagnosis.',
    };
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `skinloop_report_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const morningSteps = routine.filter((s) => s.routineType === 'morning');
  const eveningSteps = routine.filter((s) => s.routineType === 'evening');
  const latestScan = history[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:w-full print:max-w-none print:my-0 print:rounded-none">
        {/* Modal Controls Bar (Hidden during printing) */}
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-serif text-xs font-bold">
              SL
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-stone-900">
                SkinLoop AI Comprehensive Skin & Routine Dossier
              </h2>
              <p className="text-[11px] text-stone-500">
                Ready for printing or saving as a PDF document
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          ref={reportRef}
          className="p-8 sm:p-12 space-y-8 bg-[#FAF8F5] print:bg-white print:p-8 text-stone-900"
        >
          {/* Document Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-stone-900">
            <div>
              <div className="text-2xl font-serif font-bold tracking-tight text-stone-900">
                SkinLoop AI
              </div>
              <p className="text-xs text-stone-500 uppercase tracking-widest mt-0.5">
                Evidence-Based Beauty & Skincare Intelligence Dossier
              </p>
            </div>
            <div className="text-right text-xs space-y-0.5 font-mono">
              <div className="font-bold text-stone-900">Confidential Report</div>
              <div className="text-stone-500">
                Date: {new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-stone-400 text-[10px]">
                Report Ref: #{Date.now().toString().slice(-8)}
              </div>
            </div>
          </div>

          {/* Clinical Non-Medical Disclosure */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-100/60 text-[11px] text-stone-600 leading-relaxed flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-800">Non-Medical Regulatory Notice: </strong>
              All diagnostic parameters (Hydration, Texture Smoothness, Redness Calmness, Spots Clarity, Oil Balance) represent non-invasive cosmetic surface evaluations. This document does not constitute a prescription, clinical diagnosis, or dermatological treatment plan.
            </div>
          </div>

          {/* Section 1: User Profile & Tolerance Parameters */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1">
              01. Beauty & Skin Profile Baseline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 block uppercase">Client Name</span>
                <span className="font-bold text-stone-900">{profile.name}</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 block uppercase">Skin Classification</span>
                <span className="font-bold text-stone-900">{profile.skinType} Skin</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 block uppercase">Baseline Undertone</span>
                <span className="font-bold text-stone-900">{profile.undertone || 'Warm'} Undertone</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 block uppercase">Monthly Budget</span>
                <span className="font-bold font-mono text-stone-900">
                  ₹{profile.monthlyBudget.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white border border-stone-200 text-xs flex flex-wrap items-center gap-4">
              <div>
                <span className="text-stone-500 font-medium">Sensitivities: </span>
                <span className="font-bold text-rose-900">
                  {profile.sensitivities?.join(', ') || 'None registered'}
                </span>
              </div>
              <span className="text-stone-300">·</span>
              <div>
                <span className="text-stone-500 font-medium">Fragrance Policy: </span>
                <span className="font-bold capitalize">{profile.fragrancePreference}</span>
              </div>
              <span className="text-stone-300">·</span>
              <div>
                <span className="text-stone-500 font-medium">Core Goals: </span>
                <span className="font-semibold">{profile.skinGoals?.join(', ') || 'Balanced Hydration'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Skin Analysis Record History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                02. Skin Analysis Records ({history.length} Sessions)
              </h3>
              <span className="text-[10px] text-stone-400">
                Verified AI Vision Diagnostics
              </span>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No skin analysis sessions recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden bg-white">
                  <thead className="bg-stone-100 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Source</th>
                      <th className="p-2.5">Hydration</th>
                      <th className="p-2.5">Texture</th>
                      <th className="p-2.5">Calmness</th>
                      <th className="p-2.5">Spots</th>
                      <th className="p-2.5">Oil</th>
                      <th className="p-2.5">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {history.map((scan) => (
                      <tr key={scan.id} className="font-mono text-[11px]">
                        <td className="p-2.5 text-stone-900 font-bold font-sans">
                          {new Date(scan.timestamp).toLocaleDateString()}
                        </td>
                        <td className="p-2.5 font-sans">
                          {scan.source === 'youcam_live' ? 'High-Precision Scan' : 'Standard Assessment'}
                        </td>
                        <td className="p-2.5">{scan.metrics.hydration}%</td>
                        <td className="p-2.5">{scan.metrics.textureSmoothness}%</td>
                        <td className="p-2.5">{scan.metrics.rednessScore}%</td>
                        <td className="p-2.5">{scan.metrics.spotsClarity}%</td>
                        <td className="p-2.5">{scan.metrics.oilBalance}%</td>
                        <td className="p-2.5 font-sans max-w-xs truncate text-stone-600">
                          {scan.nonMedicalSummary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Daily Skincare Regimen (AM & PM) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1">
              03. Prescribed Daily Skincare Regimen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Morning */}
              <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5 text-xs">
                <span className="font-serif font-bold text-sm text-amber-900 block">
                  Morning Protection Sequence
                </span>
                <div className="space-y-2">
                  {morningSteps.map((step) => {
                    const shelfProd = shelf.find((p) => p.id === step.shelfProductId);
                    return (
                      <div key={step.id} className="p-2 bg-stone-50 rounded-lg space-y-0.5">
                        <div className="font-bold text-stone-900 flex items-center justify-between">
                          <span>
                            0{step.stepOrder}. {step.stepName}
                          </span>
                          {step.reminderTime && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              {step.reminderTime}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 leading-snug">{step.purpose}</p>
                        {shelfProd && (
                          <div className="text-[10px] text-emerald-800 font-semibold pt-0.5">
                            Using Shelf Bottle: {shelfProd.name} ({shelfProd.brand})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evening */}
              <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5 text-xs">
                <span className="font-serif font-bold text-sm text-purple-900 block">
                  Evening Recovery Sequence
                </span>
                <div className="space-y-2">
                  {eveningSteps.map((step) => {
                    const shelfProd = shelf.find((p) => p.id === step.shelfProductId);
                    return (
                      <div key={step.id} className="p-2 bg-stone-50 rounded-lg space-y-0.5">
                        <div className="font-bold text-stone-900 flex items-center justify-between">
                          <span>
                            0{step.stepOrder}. {step.stepName}
                          </span>
                          {step.reminderTime && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              {step.reminderTime}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 leading-snug">{step.purpose}</p>
                        {shelfProd && (
                          <div className="text-[10px] text-emerald-800 font-semibold pt-0.5">
                            Using Shelf Bottle: {shelfProd.name} ({shelfProd.brand})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: My Shelf Inventory */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1">
              04. Active My Shelf Inventory ({shelf.length} Products)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {shelf.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-white border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-stone-500">
                      {item.category}
                    </span>
                    <span className="font-mono text-[10px] text-stone-700">
                      {item.remainingPercent}% left
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs">{item.name}</h4>
                  <p className="text-[11px] text-stone-500">Brand: {item.brand}</p>
                  {item.verifiedIngredients.length > 0 && (
                    <p className="text-[10px] text-stone-400 line-clamp-1">
                      Actives: {item.verifiedIngredients.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Subjective Journal Observations */}
          {journalNotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1">
                05. Longitudinal Observation Notes ({journalNotes.length} Entries)
              </h3>
              <div className="space-y-2 text-xs">
                {journalNotes.slice(0, 4).map((note) => (
                  <div key={note.id} className="p-3 bg-white rounded-lg border border-stone-200 flex items-start gap-4">
                    <span className="font-mono font-bold text-stone-800 text-[11px] shrink-0">
                      {note.date}
                    </span>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-stone-900 block">
                        Skin State: {note.skinFeeling} ({note.routineCompletedPct}% completed)
                      </span>
                      <p className="text-stone-600 text-[11px]">{note.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Footer Signature */}
          <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-stone-400 font-mono">
            <div>Generated by SkinLoop AI · Advanced Dermatological Intelligence</div>
            <div>www.skinloop.ai · Privacy Protected · Client Copy</div>
          </div>
        </div>
      </div>
    </div>
  );
};
