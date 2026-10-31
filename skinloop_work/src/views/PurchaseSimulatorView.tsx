import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Layers, 
  DollarSign, 
  Package, 
  Search, 
  Tag, 
  ArrowRight, 
  Bookmark, 
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Archive,
  Clock,
  ChevronDown
} from 'lucide-react';
import { 
  UserProfile, 
  ShelfProduct, 
  RoutineStep, 
  PurchaseEvaluationResult, 
  SavedPurchaseSimulation,
  ProductCategory,
  Product
} from '../types';
import { SAMPLE_CATALOGUE } from '../data/catalogue';
import { PurchaseSimulatorService } from '../services/purchaseSimulator';

interface PurchaseSimulatorViewProps {
  userProfile: UserProfile;
  shelfProducts: ShelfProduct[];
  routineItems: RoutineStep[];
  savedSimulations: SavedPurchaseSimulation[];
  onSaveSimulation: (simulation: SavedPurchaseSimulation) => void;
  onDeleteSimulation: (id: string) => void;
  onNavigateToShelf: () => void;
  onNavigateToRoutine: () => void;
}

export const PurchaseSimulatorView: React.FC<PurchaseSimulatorViewProps> = ({
  userProfile,
  shelfProducts,
  routineItems,
  savedSimulations,
  onSaveSimulation,
  onDeleteSimulation,
  onNavigateToShelf,
  onNavigateToRoutine
}) => {
  // Mode: select from catalogue or custom entry
  const [inputMode, setInputMode] = useState<'catalogue' | 'custom'>('catalogue');
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<string>(SAMPLE_CATALOGUE[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom product inputs
  const [customBrand, setCustomBrand] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<ProductCategory>('Serum');
  const [customPrice, setCustomPrice] = useState<number>(899);
  const [customVolume, setCustomVolume] = useState<number>(30);
  const [customIngredients, setCustomIngredients] = useState<string>('Niacinamide, Zinc PCA, Hyaluronic Acid');

  // Simulation user notes
  const [simNotes, setSimNotes] = useState<string>('');
  const [decisionStatus, setDecisionStatus] = useState<SavedPurchaseSimulation['decisionStatus']>('wishlist');
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // Filter catalogue
  const filteredCatalogue = useMemo(() => {
    if (!searchQuery.trim()) return SAMPLE_CATALOGUE;
    const q = searchQuery.toLowerCase();
    return SAMPLE_CATALOGUE.filter((p: Product) => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Current prospective product
  const prospectiveProduct = useMemo(() => {
    if (inputMode === 'catalogue') {
      const match = SAMPLE_CATALOGUE.find((p: Product) => p.id === selectedCatalogueId) || SAMPLE_CATALOGUE[0];
      return {
        id: match.id,
        brand: match.brand,
        name: match.name,
        category: match.category as ProductCategory,
        priceInr: (match as any).priceInr ?? match.price ?? 1,
        volumeMl: (match as any).volumeMl ?? 30,
        ingredients: (match as any).ingredients ?? match.verifiedIngredients ?? []
      };
    } else {
      return {
        id: 'custom-' + Date.now(),
        brand: customBrand.trim() || 'Unknown Brand',
        name: customName.trim() || 'Untitled Skincare Item',
        category: customCategory,
        priceInr: Math.max(1, customPrice || 1),
        volumeMl: Math.max(1, customVolume || 30),
        ingredients: customIngredients.split(',').map(s => s.trim()).filter(Boolean)
      };
    }
  }, [inputMode, selectedCatalogueId, customBrand, customName, customCategory, customPrice, customVolume, customIngredients]);

  // Evaluation
  const evaluation: PurchaseEvaluationResult = useMemo(() => {
    return PurchaseSimulatorService.evaluatePurchase(
      prospectiveProduct,
      shelfProducts,
      routineItems,
      userProfile
    );
  }, [prospectiveProduct, shelfProducts, routineItems, userProfile]);

  const handleSaveCurrent = () => {
    const newSim: SavedPurchaseSimulation = {
      id: 'sim-' + Date.now(),
      product: prospectiveProduct,
      evaluation,
      savedAt: new Date().toISOString(),
      decisionStatus,
      notes: simNotes
    };
    onSaveSimulation(newSim);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  const getVerdictDisplay = (verdict: PurchaseEvaluationResult['verdict']) => {
    switch (verdict) {
      case 'recommended':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          label: 'Recommended Purchase',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />
        };
      case 'caution':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badge: 'bg-amber-600 text-white',
          label: 'Proceed With Caution',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />
        };
      case 'duplicate_warning':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-900',
          badge: 'bg-orange-600 text-white',
          label: 'Redundant Shelf Duplicate',
          icon: <Archive className="w-5 h-5 text-orange-600" />
        };
      case 'not_recommended':
      default:
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          badge: 'bg-rose-600 text-white',
          label: 'Not Recommended',
          icon: <XCircle className="w-5 h-5 text-rose-600" />
        };
    }
  };

  const verdictUi = getVerdictDisplay(evaluation.verdict);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide border border-emerald-400/30">
              <ShoppingCart className="w-3.5 h-3.5" />
              Pre-Purchase Routine & Inventory Defense
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Smart Beauty Purchase Simulator</h1>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Test any product before spending money. Detect shelf duplicates, avoid chemical conflicts with your active routine, calculate true cost-per-use, and protect your skin barrier.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={onNavigateToShelf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium transition cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              My Shelf ({shelfProducts.length})
            </button>
            <button
              onClick={onNavigateToRoutine}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-medium transition shadow cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Active Routine ({routineItems.length})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Select Product to Test
              </h2>

              {/* Mode Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setInputMode('catalogue')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    inputMode === 'catalogue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Catalogue
                </button>
                <button
                  onClick={() => setInputMode('custom')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    inputMode === 'custom' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {inputMode === 'catalogue' ? (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-700 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 35 Indian & global products..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Catalogue Product List */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredCatalogue.map((prod: Product) => (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedCatalogueId(prod.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 text-xs ${
                        selectedCatalogueId === prod.id
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-100'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-slate-700 block tracking-wider">
                          {prod.brand} • {prod.category}
                        </span>
                        <p className="font-semibold text-slate-900 truncate">{prod.name}</p>
                        <p className="text-slate-700 text-[11px] truncate mt-0.5">
                          {(prod.verifiedIngredients || []).slice(0, 3).join(', ')}...
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 block">₹{prod.price}</span>
                        <span className="text-[10px] text-slate-700">30 ml</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Custom Form */
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="e.g. Minimalist, Cetaphil, Cosrx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. 10% Vitamin C Serum"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category</label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as ProductCategory)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Cleanser">Cleanser</option>
                      <option value="Toner">Toner</option>
                      <option value="Serum">Serum</option>
                      <option value="Moisturizer">Moisturizer</option>
                      <option value="Sunscreen">Sunscreen</option>
                      <option value="Exfoliant">Exfoliant</option>
                      <option value="Mask">Mask</option>
                      <option value="Treatment">Treatment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Vol (ml/g)</label>
                    <input
                      type="number"
                      value={customVolume}
                      onChange={(e) => setCustomVolume(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ingredients (comma separated)
                  </label>
                  <textarea
                    rows={3}
                    value={customIngredients}
                    onChange={(e) => setCustomIngredients(e.target.value)}
                    placeholder="e.g. Salicylic Acid, Tea Tree Oil, Aloe Barbadensis Leaf Juice"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                  <p className="text-[11px] text-slate-700 mt-1">
                    Simulator uses these to test chemical interactions against your active routine steps.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Sensitivity Context Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Evaluator Profile Context
              </span>
              <span className="text-slate-700">Type: {userProfile.skinType}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {userProfile.sensitivities && userProfile.sensitivities.length > 0 ? (
                userProfile.sensitivities.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                    Sensitive: {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-700">No recorded personal ingredient sensitivities</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pre-Purchase Evaluation Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Verdict Card */}
          <div className={`rounded-2xl border p-6 shadow-sm ${verdictUi.bg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-700 block">
                  Simulator Verdict
                </span>
                <div className="flex items-center gap-2.5 mt-1">
                  {verdictUi.icon}
                  <h3 className="text-xl font-bold text-slate-900">{verdictUi.label}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${verdictUi.badge}`}>
                  Match Score: {evaluation.fitScore}%
                </span>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-800 mt-4 leading-relaxed">
              {evaluation.summary}
            </p>

            {/* Cost-per-use & economics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-black/10 text-xs">
              <div className="bg-white/70 p-3 rounded-xl border border-black/5">
                <span className="text-slate-700 block">Retail Price</span>
                <span className="text-base font-bold text-slate-900">₹{evaluation.costAnalysis.retailPriceInr}</span>
              </div>
              <div className="bg-white/70 p-3 rounded-xl border border-black/5">
                <span className="text-slate-700 block">Cost Per Day</span>
                <span className="text-base font-bold text-emerald-700">₹{evaluation.costAnalysis.costPerDayInr}</span>
              </div>
              <div className="bg-white/70 p-3 rounded-xl border border-black/5">
                <span className="text-slate-700 block">Est. Lifespan</span>
                <span className="text-base font-bold text-slate-900">{evaluation.costAnalysis.estimatedDaysOfUse} days</span>
              </div>
              <div className="bg-white/70 p-3 rounded-xl border border-black/5">
                <span className="text-slate-700 block">Budget Impact</span>
                <span className="text-base font-bold text-indigo-700">{evaluation.costAnalysis.budgetImpactPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Duplicate Shelf Defense */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Archive className="w-4 h-4 text-orange-500" />
              Shelf Redundancy & Inventory Check
            </h3>

            {evaluation.shelfDuplicate.hasDuplicate ? (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs space-y-3">
                <div className="flex items-start gap-2.5 text-orange-900">
                  <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">You already have products in this category on your shelf!</span>
                    <p className="mt-0.5 text-orange-800">{evaluation.shelfDuplicate.duplicateDetails}</p>
                  </div>
                </div>

                <div className="border-t border-orange-200 pt-2 flex items-center justify-between text-orange-900 font-semibold">
                  <span>Current Shelf Supply Remaining:</span>
                  <span className="bg-orange-200/60 px-2.5 py-0.5 rounded-full text-orange-950 font-bold">
                    ~{evaluation.shelfDuplicate.existingSupplyDaysRemaining} Days of Product Left
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No direct duplicates found on your shelf. This would fill an open slot in your routine.</span>
              </div>
            )}
          </div>

          {/* Routine Conflicts & Sensitivities */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Chemical Interactions With Active Routine
            </h3>

            {/* Sensitivities */}
            {evaluation.sensitivityAlerts.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Personal Sensitivity Alert
                </div>
                <ul className="list-disc list-inside space-y-1 text-rose-800">
                  {evaluation.sensitivityAlerts.map((alert, idx) => (
                    <li key={idx}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Routine Conflicts */}
            {evaluation.routineConflicts.length > 0 ? (
              <div className="space-y-2">
                {evaluation.routineConflicts.map((conflict, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span>Conflict: {conflict.prospectiveIngredient} + {conflict.routineIngredient}</span>
                      <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        {conflict.severity}
                      </span>
                    </div>
                    <p className="text-amber-800">{conflict.reason}</p>
                    <p className="text-[11px] text-amber-900 font-semibold mt-1">
                      Safe Usage: {conflict.resolution}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero chemical clashes detected against your currently active AM & PM routine steps.</span>
              </div>
            )}
          </div>

          {/* Alternatives & Better Shelf Matches */}
          {evaluation.alternatives.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Consider These Alternatives First
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evaluation.alternatives.map((alt, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{alt.name}</span>
                      <span className="text-emerald-700">₹{alt.priceInr}</span>
                    </div>
                    <span className="text-[10px] text-slate-700 uppercase font-semibold block">{alt.brand}</span>
                    <p className="text-slate-700">{alt.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Decision Tray */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold">Log Purchase Decision</h3>
                <p className="text-slate-400 text-xs">Record your verdict in your decision history to track intentionality.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={decisionStatus}
                  onChange={(e) => setDecisionStatus(e.target.value as SavedPurchaseSimulation['decisionStatus'])}
                  className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="wishlist">Add to Wishlist</option>
                  <option value="approved">Approved to Buy</option>
                  <option value="deferred">Deferred (Wait for Current Shelf to Empty)</option>
                  <option value="rejected">Rejected (Avoided Impulse Buy)</option>
                </select>

                <button
                  onClick={handleSaveCurrent}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isSavedRecently ? 'Saved!' : 'Save Decision'}
                </button>
              </div>
            </div>

            <input
              type="text"
              value={simNotes}
              onChange={(e) => setSimNotes(e.target.value)}
              placeholder="Add optional notes (e.g. 'Wait until Nykaa pink sale' or 'Finish Cosrx snail essence first')"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Saved Simulations & Decisions History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              Saved Purchase Decision History ({savedSimulations.length})
            </h2>
            <p className="text-xs text-slate-700">Track and review past evaluated items before placing cart orders.</p>
          </div>
        </div>

        {savedSimulations.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-700 text-xs">
            No saved purchase simulations yet. Run an evaluation above and save your decision!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSimulations.map((sim) => {
              const statusColors = {
                wishlist: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                deferred: 'bg-amber-100 text-amber-800 border-amber-200',
                rejected: 'bg-rose-100 text-rose-800 border-rose-200'
              }[sim.decisionStatus];

              return (
                <div key={sim.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition text-xs space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors}`}>
                        {sim.decisionStatus}
                      </span>
                      <button
                        onClick={() => onDeleteSimulation(sim.id)}
                        className="text-slate-700 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete simulation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-700">{sim.product.brand}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{sim.product.name}</h4>
                    </div>

                    <div className="flex items-center justify-between font-semibold text-slate-800 mt-2 pt-2 border-t border-slate-100">
                      <span>₹{sim.product.priceInr} ({sim.product.volumeMl}ml)</span>
                      <span className="text-emerald-700">₹{sim.evaluation.costAnalysis.costPerDayInr}/day</span>
                    </div>

                    {sim.notes && (
                      <p className="text-slate-700 italic bg-slate-50 p-2 rounded-lg mt-2">
                        "{sim.notes}"
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-700 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sim.savedAt).toLocaleDateString()}
                    </span>
                    <span className="capitalize font-semibold text-slate-700">
                      Verdict: {sim.evaluation.verdict.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
