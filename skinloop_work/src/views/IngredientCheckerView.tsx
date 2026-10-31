import React, { useState } from 'react';
import { UserProfile, ShelfProduct } from '../types';
import {
  IngredientCheckerService,
  IngredientAnalysisReport,
  INGREDIENT_DICTIONARY,
  IngredientDetail,
} from '../services/ingredientChecker';
import {
  Search,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Upload,
  Sparkles,
  Info,
  RefreshCw,
  Copy,
  ArrowRight,
  BookOpen,
  Filter,
} from 'lucide-react';

interface IngredientCheckerViewProps {
  profile: UserProfile;
  shelf: ShelfProduct[];
  onNavigate: (view: string) => void;
}

const SAMPLE_PRESET_FORMULAS = [
  {
    name: 'Exfoliating + Retinoid Layering (High Conflict)',
    ingredients: 'Water, Glycolic Acid, Salicylic Acid, Retinol, Glycerin, Fragrance, Alcohol Denat',
  },
  {
    name: 'Barrier Restoration Cream (Harmonious)',
    ingredients: 'Water, Ceramide NP, Squalane, Hyaluronic Acid, Centella Asiatica, Panthenol, Glycerin',
  },
  {
    name: 'Brightening AM Serum (Vitamin C + Niacinamide)',
    ingredients: 'Water, L-Ascorbic Acid, Niacinamide, Ferulic Acid, Hyaluronic Acid, Tocopherol',
  },
];

export const IngredientCheckerView: React.FC<IngredientCheckerViewProps> = ({
  profile,
  shelf,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'dictionary'>('analyzer');
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Analysis Result
  const [analysisReport, setAnalysisReport] = useState<IngredientAnalysisReport | null>(() => {
    // Initial sample analysis
    const sample = 'Water, Retinol, Salicylic Acid, Fragrance, Hyaluronic Acid, Ceramide NP';
    const parsed = IngredientCheckerService.parseIngredientString(sample);
    return IngredientCheckerService.analyzeIngredients(parsed, profile.sensitivities);
  });

  const handleRunAnalysis = () => {
    if (!inputText.trim()) return;
    const parsed = IngredientCheckerService.parseIngredientString(inputText);
    const report = IngredientCheckerService.analyzeIngredients(parsed, profile.sensitivities);
    setAnalysisReport(report);
  };

  const handleSelectPreset = (formulaText: string) => {
    setInputText(formulaText);
    const parsed = IngredientCheckerService.parseIngredientString(formulaText);
    const report = IngredientCheckerService.analyzeIngredients(parsed, profile.sensitivities);
    setAnalysisReport(report);
  };

  const handleImageOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    setOcrError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/ingredients/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 }),
          });
          const data = await res.json();
          if (data.extractedText) {
            setInputText(data.extractedText);
            const parsed = IngredientCheckerService.parseIngredientString(data.extractedText);
            const report = IngredientCheckerService.analyzeIngredients(parsed, profile.sensitivities);
            setAnalysisReport(report);
          } else {
            setOcrError(data.message || 'Could not parse text from image label. Please paste the ingredient list manually.');
          }
        } catch (err: any) {
          setOcrError(`Label OCR request failed: ${err.message}. You can paste the ingredients directly.`);
        } finally {
          setIsOcrProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setIsOcrProcessing(false);
      setOcrError('Failed to read image file.');
    }
  };

  const searchResults = IngredientCheckerService.searchDictionary(searchQuery);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Biochemical Conflict Detection</span>
          <span>·</span>
          <span>Layering Sequence & Allergen Warnings</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Ingredient Safety & Conflict Checker
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Verify active ingredient compatibility, prevent chemical exfoliant stacking, detect personal allergens, and receive pH-aligned application sequence advice.
        </p>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 flex items-start gap-3 text-xs text-stone-700">
        <Info className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-stone-900 font-semibold">Cosmetic Safety Disclaimer:</strong> This tool evaluates biochemical interactions based on peer-reviewed cosmetic dermatology literature. It is not medical software and does not replace medical consultation with a certified dermatologist.
        </p>
      </div>

      {/* Tab Switcher: Formula Analyzer vs Ingredient Dictionary */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'analyzer'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Formula & Routine Analyzer</span>
        </button>
        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'dictionary'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Ingredient Science Dictionary</span>
        </button>
      </div>

      {activeTab === 'analyzer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Paste Ingredient List
                </span>
                <label className="text-xs text-rose-800 hover:text-rose-950 font-semibold cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>{isOcrProcessing ? 'Reading Label...' : 'Scan Label Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageOcrUpload}
                    disabled={isOcrProcessing}
                    className="hidden"
                  />
                </label>
              </div>

              {ocrError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{ocrError}</span>
                </div>
              )}

              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste ingredients separated by commas (e.g. Water, Glycolic Acid, Retinol, Fragrance, Hyaluronic Acid)..."
                className="w-full p-3 border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none font-mono"
              />

              <button
                onClick={handleRunAnalysis}
                disabled={!inputText.trim()}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                <span>Run Conflict & Safety Check</span>
              </button>

              {/* Presets */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Or Test Preset Combinations:
                </span>
                <div className="space-y-1.5">
                  {SAMPLE_PRESET_FORMULAS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(preset.ingredients)}
                      className="w-full text-left p-2.5 rounded-lg border border-stone-200/80 bg-stone-50/50 hover:bg-stone-100 transition-colors text-xs space-y-0.5"
                    >
                      <div className="font-semibold text-stone-800">{preset.name}</div>
                      <div className="text-[10px] text-stone-500 truncate font-mono">
                        {preset.ingredients}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User Allergies Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                Active Personal Sensitivities Check
              </span>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Analyzing against your registered sensitivities:{' '}
                <strong>{profile.sensitivities?.join(', ') || 'None specified'}</strong>.
              </p>
              <button
                onClick={() => onNavigate('settings')}
                className="text-[11px] font-semibold text-stone-800 hover:underline"
              >
                Edit Sensitivities in Profile Settings →
              </button>
            </div>
          </div>

          {/* Right Column: Analysis Report (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {analysisReport && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6 shadow-xs">
                {/* Overall Verdict Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    analysisReport.overallSafetyVerdict === 'high_risk_conflict'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : analysisReport.overallSafetyVerdict === 'caution_separate_am_pm'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  {analysisReport.overallSafetyVerdict === 'high_risk_conflict' ? (
                    <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  ) : analysisReport.overallSafetyVerdict === 'caution_separate_am_pm' ? (
                    <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-sm">
                      {analysisReport.overallSafetyVerdict === 'high_risk_conflict'
                        ? 'High-Risk Ingredient Conflict Detected'
                        : analysisReport.overallSafetyVerdict === 'caution_separate_am_pm'
                        ? 'Caution: Separate Active Ingredients into AM & PM'
                        : 'Harmonious & Compatible Formula'}
                    </h3>
                    <p className="text-xs leading-relaxed opacity-90">
                      {analysisReport.conflicts.length > 0
                        ? `${analysisReport.conflicts.length} active conflict(s) identified. Review explanations below to safeguard your moisture barrier.`
                        : 'No direct biochemical clashes detected. Safe to apply together within standard layering rules.'}
                    </p>
                  </div>
                </div>

                {/* Personal Sensitivity Alerts */}
                {analysisReport.sensitivityWarnings.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-900 block">
                      Personal Sensitivity Alerts ({analysisReport.sensitivityWarnings.length})
                    </span>
                    {analysisReport.sensitivityWarnings.map((warn, wIdx) => (
                      <div
                        key={wIdx}
                        className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 flex items-start gap-2"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conflict Warnings List */}
                {analysisReport.conflicts.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                      Active Chemical Conflicts & Rationale
                    </span>
                    {analysisReport.conflicts.map((conflict, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                conflict.severity === 'high' ? 'bg-rose-600' : 'bg-amber-600'
                              }`}
                            />
                            <span>{conflict.title}</span>
                          </h4>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-200/80 text-stone-700 font-semibold">
                            {conflict.severity} severity
                          </span>
                        </div>
                        <p className="text-stone-700 leading-relaxed text-[11px]">
                          <strong>The Science: </strong>
                          {conflict.explanation}
                        </p>
                        <div className="p-2.5 bg-white rounded-lg border border-stone-200 text-stone-800 text-[11px] leading-relaxed">
                          <strong>Dermatological Recommendation: </strong>
                          {conflict.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended Layering Sequence */}
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Ideal Layering Sequence (Thin to Thick / pH-Aligned)
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {analysisReport.layeringOrder.length} Steps
                    </span>
                  </div>
                  <div className="space-y-2">
                    {analysisReport.layeringOrder.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-3 rounded-xl border border-stone-200/80 bg-stone-50/40 text-xs flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5">
                          {step.stepNumber}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-stone-900">{step.stepName}</div>
                          <p className="text-[11px] text-stone-600 leading-snug">
                            {step.rationale}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Identified Actives Breakdown */}
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                    Recognized Actives ({analysisReport.recognizedIngredients.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisReport.recognizedIngredients.map((ing) => (
                      <span
                        key={ing.name}
                        className="text-[11px] bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md border border-stone-200/70"
                        title={ing.description}
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Ingredient Science Dictionary View */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">
                Cosmetic Ingredient Dictionary
              </h2>
              <p className="text-xs text-stone-500">
                Search verified active ingredients, pH profiles, and optimal usage timing.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search retinol, aha, cica..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-stone-900">{item.name}</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-200/80 text-stone-700 font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.functions.map((fn, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-[10px] bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-600"
                      >
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                  <span>
                    Optimal Time:{' '}
                    <strong className="text-stone-800 capitalize">
                      {item.bestTime || 'Anytime'}
                    </strong>
                  </span>
                  {item.pHOptimal && (
                    <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded">
                      pH: {item.pHOptimal}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
