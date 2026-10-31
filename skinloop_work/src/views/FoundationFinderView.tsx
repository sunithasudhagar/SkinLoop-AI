import React, { useState } from 'react';
import {
  Product,
  ShadeOption,
  UserProfile,
  SkinAnalysisRecord,
  CandidateShade,
} from '../types';
import { SAMPLE_CATALOGUE } from '../data/catalogue';
import { StorageService } from '../services/storage';
import {
  Sparkles,
  Sliders,
  Bookmark,
  Check,
  Split,
  Eye,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
  Save,
  Trash2,
  Plus,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface FoundationFinderViewProps {
  profile: UserProfile;
  latestAnalysis?: SkinAnalysisRecord;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigate: (view: string) => void;
}

export const FoundationFinderView: React.FC<FoundationFinderViewProps> = ({
  profile,
  latestAnalysis,
  favorites,
  onToggleFavorite,
  onNavigate,
}) => {
  // Brand selection
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Undertone filter
  const [selectedUndertone, setSelectedUndertone] = useState<string>(
    profile.undertone || 'all'
  );

  // Coverage & finish filters
  const [selectedCoverage, setSelectedCoverage] = useState<'all' | 'sheer' | 'medium' | 'full'>(
    profile.desiredCoverage || 'all'
  );
  const [selectedFinish, setSelectedFinish] = useState<'all' | 'matte' | 'natural' | 'dewy' | 'satin'>(
    profile.desiredFinish || 'all'
  );

  // Max price filter in INR
  const [maxPrice, setMaxPrice] = useState<number>(3000);

  // Filter foundation and concealer products
  const foundationProducts = SAMPLE_CATALOGUE.filter(
    (p) => p.category === 'foundation' || p.category === 'concealer'
  );

  const brands = ['all', ...Array.from(new Set(foundationProducts.map((p) => p.brand)))];

  const filteredProducts = foundationProducts.filter((p) => {
    if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
    if (selectedCoverage !== 'all' && p.coverage !== selectedCoverage) return false;
    if (selectedFinish !== 'all' && p.finish !== selectedFinish) return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  const [selectedProductId, setSelectedProductId] = useState<string>(
    foundationProducts[0]?.id || ''
  );
  const activeProduct =
    filteredProducts.find((p) => p.id === selectedProductId) ||
    filteredProducts[0] ||
    foundationProducts[0];

  const [selectedShade, setSelectedShade] = useState<ShadeOption | null>(
    activeProduct?.shades && activeProduct.shades.length > 0 ? activeProduct.shades[0] : null
  );

  // Saved candidate shades state
  const [savedCandidates, setSavedCandidates] = useState<CandidateShade[]>(() =>
    StorageService.getCandidateShades()
  );
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Side-by-side comparison tray
  const [comparisonList, setComparisonList] = useState<
    { brand: string; productName: string; shade: ShadeOption }[]
  >([]);

  // Virtual Try-On simulator settings
  const [tryOnOpacity, setTryOnOpacity] = useState<number>(65);
  const [splitView, setSplitView] = useState<boolean>(true);
  const [splitRatio, setSplitRatio] = useState<number>(50);

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    if (product.shades && product.shades.length > 0) {
      setSelectedShade(product.shades[0]);
    }
  };

  const handleSaveCandidateShade = (shade: ShadeOption) => {
    const candidate: CandidateShade = {
      id: `cand-${activeProduct.id}-${shade.id}`,
      brand: activeProduct.brand,
      productName: activeProduct.name,
      shadeName: shade.shadeName,
      hex: shade.hex,
      undertone: shade.undertone,
      shadeFamily: shade.shadeFamily || 'Medium',
      description: shade.matchDescription,
      matchScorePercent: shade.matchScorePercent,
      tentativeNote: 'Tentative candidate shade saved for reference. YouCam camera matching will be integrated in a future release.',
      savedAt: new Date().toISOString(),
    };

    StorageService.addCandidateShade(candidate);
    setSavedCandidates(StorageService.getCandidateShades());
    setFeedbackNotice(`Saved "${shade.shadeName}" to candidate shades list.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleDeleteCandidateShade = (id: string) => {
    StorageService.deleteCandidateShade(id);
    setSavedCandidates(StorageService.getCandidateShades());
  };

  const handleToggleComparison = (shade: ShadeOption) => {
    const exists = comparisonList.some(
      (c) => c.productName === activeProduct.name && c.shade.id === shade.id
    );
    if (exists) {
      setComparisonList((prev) =>
        prev.filter((c) => !(c.productName === activeProduct.name && c.shade.id === shade.id))
      );
    } else {
      if (comparisonList.length >= 3) {
        setFeedbackNotice('You can compare up to 3 candidate shades at once.');
        setTimeout(() => setFeedbackNotice(null), 3000);
        return;
      }
      setComparisonList((prev) => [
        ...prev,
        { brand: activeProduct.brand, productName: activeProduct.name, shade },
      ]);
    }
  };

  // Filter available shades by undertone
  const displayedShades = (activeProduct.shades || []).filter((sh) => {
    if (selectedUndertone === 'all' || selectedUndertone === 'Unsure') return true;
    return sh.undertone.toLowerCase() === selectedUndertone.toLowerCase();
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
          <span>Foundation & Concealer Matching</span>
          <span>·</span>
          <span>Undertone Precision</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Foundation Shade Finder
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Browse demo foundation shades across trusted brands. Compare undertones, depth families, and save candidate shades for testing.
        </p>
      </div>

      {/* Mandatory YouCam & Demo Data Notice */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-xs text-amber-950 space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Notice on Shade Matching & YouCam Integration:</span>
        </div>
        <p className="text-[11px] text-amber-900/90 leading-relaxed">
          Accurate camera-based shade matching and real-time AR virtual try-on will be connected to the YouCam API in a future update. Camera skin-analysis is <strong>not</strong> integrated into this shade finder yet. All shades and prices shown here are <strong>sample demo catalogue records</strong>. Skin health scores never dictate your foundation shade.
        </p>
      </div>

      {feedbackNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Top Filter Bar: Brand, Undertone, Coverage, Finish & Budget */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Shade Search Filters
          </span>
          <span className="text-[11px] text-stone-500">
            {filteredProducts.length} formulas available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* Brand Selector */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Choose Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b === 'all' ? 'All Brands' : b}
                </option>
              ))}
            </select>
          </div>

          {/* Undertone Selector */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Undertone Preference
            </label>
            <select
              value={selectedUndertone}
              onChange={(e) => setSelectedUndertone(e.target.value)}
              className="w-full p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              <option value="all">All Undertones</option>
              <option value="Warm">Warm (Golden / Peachy)</option>
              <option value="Neutral">Neutral (Balanced)</option>
              <option value="Cool">Cool (Rosy / Pink)</option>
              <option value="Olive">Olive (Greenish / Muted)</option>
              <option value="Unsure">Unsure / Browse All</option>
            </select>
          </div>

          {/* Coverage */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Coverage</label>
            <select
              value={selectedCoverage}
              onChange={(e) => setSelectedCoverage(e.target.value as any)}
              className="w-full p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              <option value="all">All Coverages</option>
              <option value="sheer">Sheer / Skin Tint</option>
              <option value="medium">Medium Flexible</option>
              <option value="full">Full Coverage</option>
            </select>
          </div>

          {/* Finish */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Finish</label>
            <select
              value={selectedFinish}
              onChange={(e) => setSelectedFinish(e.target.value as any)}
              className="w-full p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              <option value="all">All Finishes</option>
              <option value="natural">Natural Satin</option>
              <option value="dewy">Dewy Glow</option>
              <option value="matte">Soft Matte</option>
              <option value="satin">Luminous Satin</option>
            </select>
          </div>

          {/* Max Price in INR */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-600 font-semibold">Max Price</label>
              <span className="font-mono text-stone-900 font-bold">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="400"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              className="w-full accent-stone-900 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Product & Candidate Shades vs Side-by-Side Comparison & Preview */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-900">No Foundation Formulas Match Your Filter</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            No formulas were found with your chosen brand, coverage, finish, or budget filter. Try resetting filters to browse all options.
          </p>
          <button
            onClick={() => {
              setSelectedBrand('all');
              setSelectedCoverage('all');
              setSelectedFinish('all');
              setSelectedUndertone('all');
              setMaxPrice(3000);
            }}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-xs"
          >
            Reset Search Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product & Candidate Shades (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Product Details */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                    {activeProduct.brand} · {activeProduct.subcategory}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                    Demo Sample
                  </span>
                </div>
                <h2 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                  {activeProduct.name}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-stone-600">
                  <span className="font-mono font-bold text-stone-900">
                    ₹{activeProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span>·</span>
                  <span className="capitalize">{activeProduct.coverage} coverage</span>
                  <span>·</span>
                  <span className="capitalize">{activeProduct.finish} finish</span>
                  {activeProduct.fragranceFree && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">Fragrance-free</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => onToggleFavorite(activeProduct.id)}
                className={`p-2 rounded-lg border transition-colors ${
                  favorites.includes(activeProduct.id)
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : 'border-stone-200 text-stone-400 hover:text-stone-700'
                }`}
                aria-label="Save to favorites"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {activeProduct.whyItFitsReason}
            </p>

            {/* Candidate Shades List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                    Available Demo Shades ({displayedShades.length})
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Select a shade to preview or compare
                  </span>
                </div>
                {selectedUndertone !== 'all' && (
                  <span className="text-[11px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md font-medium">
                    Filtered by: {selectedUndertone}
                  </span>
                )}
              </div>

              {displayedShades.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-stone-200 rounded-xl space-y-1 text-xs text-stone-500">
                  <p>No shades match "{selectedUndertone}" undertone for this specific formula.</p>
                  <button
                    onClick={() => setSelectedUndertone('all')}
                    className="text-stone-900 font-semibold hover:underline"
                  >
                    View All Shades
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedShades.map((shade) => {
                    const isSelected = selectedShade?.id === shade.id;
                    const inComparison = comparisonList.some(
                      (c) => c.productName === activeProduct.name && c.shade.id === shade.id
                    );
                    const isAlreadyCandidate = savedCandidates.some(
                      (c) => c.brand === activeProduct.brand && c.shadeName === shade.shadeName
                    );

                    return (
                      <div
                        key={shade.id}
                        className={`p-3.5 rounded-xl border text-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-stone-900 bg-stone-50/80 shadow-xs ring-1 ring-stone-900'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div
                          onClick={() => setSelectedShade(shade)}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div
                            className="w-9 h-9 rounded-full border border-black/10 shadow-xs shrink-0"
                            style={{ backgroundColor: shade.hex }}
                            title={shade.shadeName}
                          />
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-2">
                              <span>{shade.shadeName}</span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
                                {shade.undertone}
                              </span>
                              {shade.shadeFamily && (
                                <span className="text-[10px] text-stone-500 font-mono">
                                  ({shade.shadeFamily})
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                              {shade.matchDescription}
                            </p>
                          </div>
                        </div>

                        {/* Actions: Compare & Save Candidate */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                          <button
                            type="button"
                            onClick={() => handleToggleComparison(shade)}
                            className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium transition-colors ${
                              inComparison
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                            }`}
                          >
                            {inComparison ? 'In Comparison' : 'Compare'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveCandidateShade(shade)}
                            disabled={isAlreadyCandidate}
                            className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                              isAlreadyCandidate
                                ? 'bg-stone-100 text-stone-400 cursor-default'
                                : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                            }`}
                          >
                            <Save className="w-3 h-3" />
                            <span>{isAlreadyCandidate ? 'Saved' : 'Save Shade'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Verified Ingredients Highlights */}
            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Verified Formula Highlights
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeProduct.verifiedIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="text-[11px] bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Other Formulas in Catalogue */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Other Foundation & Concealer Formulas ({filteredProducts.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const isSelected = activeProduct.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold ${
                          isSelected ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {p.brand}
                      </span>
                      <span className="font-mono text-xs font-bold">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="font-bold text-xs mt-1 truncate">{p.name}</div>
                    <div
                      className={`text-[11px] mt-1 ${
                        isSelected ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {p.shades?.length || 0} candidate shades · {p.finish}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Side-by-Side Comparison Tray & Saved Candidate Shades (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Side-by-Side Shade Comparison Tray */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Side-by-Side Comparison
                </h3>
              </div>
              {comparisonList.length > 0 && (
                <button
                  onClick={() => setComparisonList([])}
                  className="text-xs text-stone-500 hover:text-stone-900"
                >
                  Clear All
                </button>
              )}
            </div>

            {comparisonList.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-xl space-y-2 text-xs text-stone-500">
                <Eye className="w-5 h-5 mx-auto text-stone-400" />
                <p>Click "Compare" on any candidate shade to view side-by-side undertone swatches.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {comparisonList.map((comp, idx) => (
                    <div
                      key={`${comp.productName}-${comp.shade.id}-${idx}`}
                      className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 flex flex-col items-center text-center space-y-1.5"
                    >
                      <div
                        className="w-10 h-10 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: comp.shade.hex }}
                      />
                      <span className="font-bold text-[11px] text-stone-900 line-clamp-1">
                        {comp.shade.shadeName}
                      </span>
                      <span className="text-[10px] text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                        {comp.shade.undertone}
                      </span>
                      <button
                        onClick={() =>
                          setComparisonList((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-[10px] text-rose-600 hover:underline pt-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-stone-100/70 rounded-xl text-[11px] text-stone-600 space-y-1">
                  <span className="font-bold text-stone-800 block">Undertone Assessment:</span>
                  <p>
                    Notice the shift between warm golden pigments versus neutral beige. Always check under natural daytime sunlight.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Saved Candidate Shades Drawer */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Saved Candidate Shades ({savedCandidates.length})
                </h3>
              </div>
            </div>

            {savedCandidates.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-4">
                No candidate shades saved yet. Click "Save Shade" on any shade to keep it for store reference.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {savedCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full border border-black/10 shadow-xs shrink-0"
                        style={{ backgroundColor: cand.hex }}
                      />
                      <div>
                        <div className="font-bold text-stone-900">
                          {cand.brand} · {cand.shadeName}
                        </div>
                        <span className="text-[10px] text-stone-500">
                          {cand.undertone} undertone · {cand.shadeFamily}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCandidateShade(cand.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-stone-100">
              <p className="text-[11px] text-stone-500 leading-relaxed">
                These candidate shades remain saved in your browser storage so you can easily reference them when shopping or consulting with an in-store beauty advisor.
              </p>
            </div>
          </div>

          {/* Quick Look Coordinator */}
          <div className="p-5 rounded-2xl bg-stone-900 text-white space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-300" />
              <h3 className="text-sm font-serif font-bold">Coordinate with a Makeup Look</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Match your chosen shade with complementary lip colors, blushes, and liners tailored for college, office, or weddings.
            </p>
            <button
              onClick={() => onNavigate('makeup')}
              className="w-full py-2 bg-white text-stone-900 hover:bg-stone-100 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Open Makeup Look Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
