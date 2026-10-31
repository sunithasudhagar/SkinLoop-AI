import React, { useState, useRef } from 'react';
import { Product, UserProfile, YouCamApiConfig, SavedLook } from '../types';
import { SAMPLE_CATALOGUE, COORDINATED_LOOKS, CoordinatedLook } from '../data/catalogue';
import { StorageService } from '../services/storage';
import {
  Palette,
  Sparkles,
  Sliders,
  Bookmark,
  Check,
  Split,
  Eye,
  Info,
  Layers,
  ArrowRight,
  Heart,
  Upload,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Trash2,
  FolderHeart,
  X,
  Plus,
  ShoppingBag,
} from 'lucide-react';

interface MakeupStudioViewProps {
  profile: UserProfile;
  favorites: string[];
  youCamConfig: YouCamApiConfig;
  onToggleFavorite: (id: string) => void;
  onNavigate: (view: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'lipstick', label: 'Lipstick' },
  { id: 'lipgloss', label: 'Lip Gloss' },
  { id: 'blush', label: 'Blush' },
  { id: 'eyeliner', label: 'Eyeliner' },
  { id: 'kajal', label: 'Kajal' },
  { id: 'mascara', label: 'Mascara' },
  { id: 'eyeshadow', label: 'Eyeshadow' },
  { id: 'contour', label: 'Contour' },
  { id: 'primer', label: 'Primer' },
  { id: 'powder', label: 'Powder' },
];

const OCCASIONS = [
  { id: 'all', label: 'All Occasions' },
  { id: 'everyday', label: 'Everyday' },
  { id: 'college', label: 'College' },
  { id: 'office', label: 'Office' },
  { id: 'party', label: 'Party' },
  { id: 'wedding', label: 'Wedding' },
];

export const MakeupStudioView: React.FC<MakeupStudioViewProps> = ({
  profile,
  favorites,
  youCamConfig,
  onToggleFavorite,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('lipstick');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('everyday');
  const [selectedFinish, setSelectedFinish] = useState<string>('all');
  const [activeLook, setActiveLook] = useState<CoordinatedLook>(COORDINATED_LOOKS[0]);
  const [customProductIds, setCustomProductIds] = useState<string[]>(
    COORDINATED_LOOKS[0].recommendedProducts
  );
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>(() => StorageService.getSavedLooks());
  const [showSavedLooksModal, setShowSavedLooksModal] = useState<boolean>(false);
  const [replacingProductId, setReplacingProductId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // View mode: interactive canvas simulator vs real YouCam photo VTO
  const [studioMode, setStudioMode] = useState<'canvas' | 'youcam_photo'>('canvas');

  // Try-on simulation state
  const [previewLip, setPreviewLip] = useState<string>(COORDINATED_LOOKS[0].previewLipColor);
  const [previewBlush, setPreviewBlush] = useState<string>(COORDINATED_LOOKS[0].previewBlushColor);
  const [previewLiner, setPreviewLiner] = useState<string>(COORDINATED_LOOKS[0].previewLinerColor);
  const [tryOnIntensity, setTryOnIntensity] = useState<number>(75);
  const [isBeforeAfter, setIsBeforeAfter] = useState<boolean>(false);

  // Real YouCam Photo VTO state
  const [photoInput, setPhotoInput] = useState<string | null>(null);
  const [isApplyingVto, setIsApplyingVto] = useState<boolean>(false);
  const [vtoResultUrl, setVtoResultUrl] = useState<string | null>(null);
  const [vtoTaskId, setVtoTaskId] = useState<string | null>(null);
  const [vtoError, setVtoError] = useState<string | null>(null);
  const [vtoRequiresKey, setVtoRequiresKey] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter makeup items
  const makeupCatalogue = SAMPLE_CATALOGUE.filter((p) =>
    [
      'lipstick',
      'lipgloss',
      'blush',
      'eyeliner',
      'kajal',
      'mascara',
      'eyeshadow',
      'contour',
      'primer',
      'powder',
      'foundation',
      'concealer',
    ].includes(p.category)
  );

  const filteredItems = makeupCatalogue.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedOccasion !== 'all' && item.occasions && !item.occasions.includes(selectedOccasion))
      return false;
    if (selectedFinish !== 'all' && item.finish !== selectedFinish) return false;
    return true;
  });

  const currentLookProducts = customProductIds
    .map((id) => SAMPLE_CATALOGUE.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const lookTotalEstimatedPrice = currentLookProducts.reduce((sum, p) => sum + p.price, 0);

  const handleApplyLook = (look: CoordinatedLook) => {
    setActiveLook(look);
    setCustomProductIds(look.recommendedProducts);
    setPreviewLip(look.previewLipColor);
    setPreviewBlush(look.previewBlushColor);
    setPreviewLiner(look.previewLinerColor);
  };

  const handleResetLook = () => {
    setCustomProductIds(activeLook.recommendedProducts);
    setPreviewLip(activeLook.previewLipColor);
    setPreviewBlush(activeLook.previewBlushColor);
    setPreviewLiner(activeLook.previewLinerColor);
  };

  const handleReplaceProduct = (oldId: string, newId: string) => {
    setCustomProductIds((prev) => prev.map((id) => (id === oldId ? newId : id)));
    setReplacingProductId(null);
    const newProd = SAMPLE_CATALOGUE.find((p) => p.id === newId);
    if (newProd?.colorHex) {
      if (newProd.category === 'lipstick' || newProd.category === 'lipgloss') setPreviewLip(newProd.colorHex);
      if (newProd.category === 'blush') setPreviewBlush(newProd.colorHex);
      if (newProd.category === 'eyeliner' || newProd.category === 'kajal') setPreviewLiner(newProd.colorHex);
    }
  };

  const handleSaveLook = () => {
    const newSavedLook: SavedLook = {
      id: `look-saved-${Date.now()}`,
      name: `${activeLook.name} (Custom)`,
      occasion: (activeLook.occasion as any) || 'everyday',
      lookDescription: `Custom look with ${currentLookProducts.length} coordinated products.`,
      productIds: [...customProductIds],
      totalEstimatedPrice: lookTotalEstimatedPrice,
      currency: '₹',
      createdAt: new Date().toISOString(),
    };
    StorageService.saveLook(newSavedLook);
    setSavedLooks(StorageService.getSavedLooks());
    setSaveSuccessMsg(`Saved "${newSavedLook.name}" (₹${lookTotalEstimatedPrice.toLocaleString('en-IN')}) to My Saved Looks.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleDeleteSavedLook = (id: string) => {
    StorageService.deleteSavedLook(id);
    setSavedLooks(StorageService.getSavedLooks());
  };

  const handleLoadSavedLook = (look: SavedLook) => {
    setCustomProductIds(look.productIds);
    const prods = look.productIds
      .map((id) => SAMPLE_CATALOGUE.find((p) => p.id === id))
      .filter(Boolean) as Product[];
    const lip = prods.find((p) => p.category === 'lipstick' || p.category === 'lipgloss');
    if (lip?.colorHex) setPreviewLip(lip.colorHex);
    const blush = prods.find((p) => p.category === 'blush');
    if (blush?.colorHex) setPreviewBlush(blush.colorHex);
    const liner = prods.find((p) => p.category === 'eyeliner' || p.category === 'kajal');
    if (liner?.colorHex) setPreviewLiner(liner.colorHex);
    setShowSavedLooksModal(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setVtoError('Image exceeds the maximum allowed 10MB limit for YouCam processing.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setVtoError('Unsupported image format. Please upload a JPEG, PNG, or WebP photo.');
      return;
    }

    setVtoError(null);
    setVtoResultUrl(null);
    setVtoTaskId(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setPhotoInput(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteYouCamVto = async () => {
    if (!photoInput) {
      setVtoError('Please upload a face photo first to render virtual makeup.');
      return;
    }

    setIsApplyingVto(true);
    setVtoError(null);
    setVtoRequiresKey(false);

    try {
      const templateMap: Record<string, string> = {
        'look-everyday': 'all_rosy_chic',
        'look-campus': 'clean_campus',
        'look-office': 'executive_matte',
        'look-party': 'warm_sunset_glam',
        'look-wedding': 'all_rosy_chic',
      };
      const templateId = templateMap[activeLook.id] || 'all_rosy_chic';

      const res = await fetch('/api/youcam/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoInput,
          templateId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errorCode === 'YOUCAM_API_KEY_REQUIRED' || data.errorCode === 'YOUTHCAM_API_KEY_REQUIRED') {
          setVtoRequiresKey(true);
          setVtoError('Photo makeup rendering is in preview mode. Switch to the Face Canvas above to explore and customize every look in real time.');
        } else {
          setVtoError(data.message || 'Unable to render photo makeup at this moment.');
        }
        return;
      }

      if (data.status === 'success' && data.outputUrl) {
        setVtoResultUrl(data.outputUrl);
        setVtoTaskId(data.taskId);
      }
    } catch (err: any) {
      setVtoError(`Network error communicating with YouCam API: ${err.message}`);
    } finally {
      setIsApplyingVto(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
          <span>YouCam Virtual Try-On Studio</span>
          <span>·</span>
          <span>Color & Occasion Harmonizer</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Virtual Makeup Studio
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Explore coordinated makeup collections curated for your undertone and occasions. Preview lip, blush, and liner shades with real-time face canvas rendering.
        </p>
      </div>

      {/* Occasion / Coordinated Looks Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Coordinated Look Presets
          </span>
          <span className="text-[11px] text-stone-500">
            Harmonized by Undertone & Lighting
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COORDINATED_LOOKS.map((look) => {
            const isActive = activeLook.id === look.id;
            return (
              <button
                key={look.id}
                onClick={() => handleApplyLook(look)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300 text-stone-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isActive ? 'text-rose-200' : 'text-stone-500'
                      }`}
                    >
                      {look.occasion}
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-rose-200" />}
                  </div>
                  <h3 className="font-bold text-xs mt-1">{look.name}</h3>
                  <p
                    className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                      isActive ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    {look.description}
                  </p>
                </div>

                {/* Swatch palette preview */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/10">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: look.previewLipColor }}
                    title="Lip Shade"
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: look.previewBlushColor }}
                    title="Blush Shade"
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: look.previewLinerColor }}
                    title="Liner Tone"
                  />
                  <span className={`text-[10px] ml-auto ${isActive ? 'text-stone-300' : 'text-stone-400'}`}>
                    Apply Look
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Coordinated Look Kit & Product Customizer */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[11px] font-semibold uppercase tracking-wider">
                {activeLook.occasion} Edition
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                {currentLookProducts.length} coordinated items
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-stone-900 mt-1">
              {activeLook.name}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 max-w-2xl">
              {activeLook.toneRecommendation}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-right">
              <span className="block text-[10px] uppercase tracking-wider text-stone-500">
                Estimated Demo Total
              </span>
              <span className="text-base font-bold font-mono text-stone-900">
                ₹{lookTotalEstimatedPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handleSaveLook}
              className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Custom Look</span>
            </button>

            <button
              onClick={() => setShowSavedLooksModal(true)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <FolderHeart className="w-3.5 h-3.5 text-rose-600" />
              <span>My Saved Looks ({savedLooks.length})</span>
            </button>

            <button
              onClick={handleResetLook}
              title="Reset products to preset defaults"
              className="p-2 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Coordinated Products inside this Look */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Coordinated Kit Items (Click &quot;Swap Product&quot; to customize individual pieces)
            </span>
            <span className="text-[11px] text-stone-500">
              Demo sample catalogue prices
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentLookProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-stone-300 transition-all flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      {prod.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-900">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 mt-1 line-clamp-1">
                    {prod.name}
                  </h4>
                  <span className="text-[11px] text-stone-500">{prod.brand}</span>
                </div>

                <div className="pt-2 border-t border-stone-200/80 flex items-center gap-1.5">
                  <button
                    onClick={() => setReplacingProductId(prod.id)}
                    className="flex-1 py-1 px-2 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-rose-300" />
                    <span>Swap Product</span>
                  </button>
                  {prod.colorHex && (
                    <button
                      onClick={() => {
                        const hex = prod.colorHex;
                        if (!hex) return;
                        if (prod.category === 'lipstick' || prod.category === 'lipgloss') setPreviewLip(hex);
                        if (prod.category === 'blush') setPreviewBlush(hex);
                        if (prod.category === 'eyeliner' || prod.category === 'kajal') setPreviewLiner(hex);
                      }}
                      className="p-1 px-2 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 text-[11px] font-semibold"
                      title="Preview swatch on canvas"
                    >
                      Preview
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Replacement Modal */}
      {replacingProductId && (() => {
        const productBeingReplaced = SAMPLE_CATALOGUE.find((p) => p.id === replacingProductId);
        if (!productBeingReplaced) return null;
        const candidates = SAMPLE_CATALOGUE.filter((p) => {
          if (p.id === productBeingReplaced.id) return false;
          if (
            (productBeingReplaced.category === 'lipstick' || productBeingReplaced.category === 'lipgloss') &&
            (p.category === 'lipstick' || p.category === 'lipgloss')
          ) return true;
          if (
            (productBeingReplaced.category === 'eyeliner' || productBeingReplaced.category === 'kajal') &&
            (p.category === 'eyeliner' || p.category === 'kajal')
          ) return true;
          return p.category === productBeingReplaced.category;
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Replace Product in {activeLook.name}
                  </span>
                  <h3 className="text-base font-bold text-stone-900">
                    Replacing: {productBeingReplaced.name} ({productBeingReplaced.brand})
                  </h3>
                </div>
                <button
                  onClick={() => setReplacingProductId(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-600">
                Choose an alternative from the same category to substitute into your coordinated look kit:
              </p>

              <div className="space-y-2.5">
                {candidates.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-4 text-center">
                    No alternative items found in this category in the demo catalogue.
                  </p>
                ) : (
                  candidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50/50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                            {cand.brand}
                          </span>
                          {cand.finish && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200/80 text-stone-700 capitalize">
                              {cand.finish}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-stone-900">{cand.name}</h4>
                        <span className="text-xs font-mono font-bold text-stone-900">
                          ₹{cand.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleReplaceProduct(productBeingReplaced.id, cand.id)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Swap In
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Saved Looks Modal */}
      {showSavedLooksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                  Custom Look Archive
                </span>
                <h3 className="text-base font-bold text-stone-900">
                  My Saved Coordinated Looks
                </h3>
              </div>
              <button
                onClick={() => setShowSavedLooksModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedLooks.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <FolderHeart className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500 font-semibold">No saved looks yet.</p>
                <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                  Customize any preset above by swapping individual items and click &quot;Save Custom Look&quot; to keep your tailored combinations here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedLooks.map((look) => (
                  <div
                    key={look.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800">
                          {look.occasion}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {new Date(look.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">{look.name}</h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-stone-600 font-mono font-bold">
                          ₹{look.totalEstimatedPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-500">{look.productIds.length} products</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLoadSavedLook(look)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Load to Studio
                      </button>
                      <button
                        onClick={() => handleDeleteSavedLook(look.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Delete look"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Studio Viewport Split: Makeup Canvas on Left/Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Virtual Try-On Canvas & YouCam VTO (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            {/* Studio Mode Selector */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStudioMode('canvas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    studioMode === 'canvas'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Face Canvas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudioMode('youcam_photo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    studioMode === 'youcam_photo'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>YouCam Photo VTO</span>
                </button>
              </div>

              {studioMode === 'canvas' ? (
                <button
                  onClick={() => setIsBeforeAfter(!isBeforeAfter)}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  {isBeforeAfter ? 'Applied Look' : 'Bare Skin'}
                </button>
              ) : null}
            </div>

            {/* TAB 1: Interactive SVG Face Canvas */}
            {studioMode === 'canvas' && (
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full object-cover"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="400" height="400" fill="#F4EFEB" />
                    {/* Face base */}
                    <circle cx="200" cy="180" r="110" fill="#E4BF9F" />

                    {/* Blush Cheeks (interactive color & opacity) */}
                    {!isBeforeAfter && (
                      <g style={{ opacity: tryOnIntensity / 100 }}>
                        <circle cx="140" cy="195" r="28" fill={previewBlush} filter="blur(16px)" />
                        <circle cx="260" cy="195" r="28" fill={previewBlush} filter="blur(16px)" />
                      </g>
                    )}

                    {/* Eyes */}
                    <ellipse cx="160" cy="165" rx="10" ry="6" fill="#3D3531" />
                    <ellipse cx="240" cy="165" rx="10" ry="6" fill="#3D3531" />

                    {/* Eyebrows */}
                    <path d="M 145 150 Q 160 142 175 150" stroke="#2B2421" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M 225 150 Q 240 142 255 150" stroke="#2B2421" strokeWidth="3" fill="none" strokeLinecap="round" />

                    {/* Eyeliner / Kajal (interactive color) */}
                    {!isBeforeAfter && (
                      <g style={{ opacity: tryOnIntensity / 100 }}>
                        <path d="M 148 163 Q 160 158 172 163 Q 177 160 180 159" stroke={previewLiner} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d="M 228 163 Q 240 158 252 163 Q 257 160 260 159" stroke={previewLiner} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      </g>
                    )}

                    {/* Nose */}
                    <path d="M 195 185 L 195 205 Q 200 208 205 205" stroke="#C49B7E" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                    {/* Lips (interactive color & opacity) */}
                    <g>
                      <path
                        d="M 175 240 Q 200 252 225 240 Q 200 248 175 240 Z"
                        fill={isBeforeAfter ? '#B5676B' : previewLip}
                        style={{ opacity: isBeforeAfter ? 0.6 : tryOnIntensity / 100 }}
                      />
                      <path
                        d="M 175 240 Q 200 230 225 240"
                        stroke={isBeforeAfter ? '#8E464A' : previewLip}
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </g>
                  </svg>

                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                    {isBeforeAfter ? 'Bare Skin Reference' : activeLook.name}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span>Color Intensity</span>
                    <span className="font-mono text-stone-900">{tryOnIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={tryOnIntensity}
                    onChange={(e) => setTryOnIntensity(parseInt(e.target.value, 10))}
                    className="w-full accent-stone-900"
                  />
                </div>

                {/* Active Shades Bar */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                  <span className="font-bold text-stone-900">Active Look Swatches</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: previewLip }} />
                      <span className="text-stone-600">Lip:</span>
                      <span className="font-mono text-stone-900 font-semibold">{previewLip}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: previewBlush }} />
                      <span className="text-stone-600">Blush:</span>
                      <span className="font-mono text-stone-900 font-semibold">{previewBlush}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Real YouCam Photo Look-VTO */}
            {studioMode === 'youcam_photo' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {!photoInput ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square w-full rounded-xl border-2 border-dashed border-stone-300 hover:border-stone-500 bg-stone-50 hover:bg-stone-100/50 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors space-y-2"
                  >
                    <div className="p-3 rounded-full bg-stone-200 text-stone-700">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-stone-900 block">
                        Upload Selfie Photo
                      </span>
                      <span className="text-[11px] text-stone-500 block mt-0.5">
                        JPEG, PNG, or WebP up to 10MB
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400">
                      High-definition portrait shade simulation
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                      <img
                        src={vtoResultUrl || photoInput}
                        alt="Virtual Try-On Output"
                        className="w-full h-full object-cover"
                      />

                      {vtoResultUrl && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-stone-900/80 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-rose-300" />
                          <span>Virtual Look Applied</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 text-xs border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
                      >
                        Change Photo
                      </button>

                      <button
                        type="button"
                        onClick={handleExecuteYouCamVto}
                        disabled={isApplyingVto}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {isApplyingVto ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Applying Virtual Makeup...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                            <span>Apply {activeLook.name}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {vtoError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span className="font-semibold">{vtoError}</span>
                    </div>
                    {vtoRequiresKey && (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setStudioMode('canvas')}
                          className="px-3 py-1 bg-stone-900 text-white rounded-md text-[11px] font-semibold hover:bg-stone-800 flex items-center gap-1"
                        >
                          <span>Switch to Face Canvas</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="text-[11px] text-stone-500 leading-relaxed">
              Virtual look previews dynamically map lipstick, blush, and eyeshadow tones to match your skin lighting for realistic shade experimentation.
            </p>
          </div>
        </div>

        {/* Right Column: Product Catalogue & Filter Browser (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white font-semibold shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Occasion & Finish Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-semibold">Occasion:</span>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="px-2.5 py-1 border border-stone-200 rounded-md bg-white text-stone-800"
              >
                {OCCASIONS.map((occ) => (
                  <option key={occ.id} value={occ.id}>
                    {occ.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-semibold">Finish:</span>
              <select
                value={selectedFinish}
                onChange={(e) => setSelectedFinish(e.target.value)}
                className="px-2.5 py-1 border border-stone-200 rounded-md bg-white text-stone-800"
              >
                <option value="all">All Finishes</option>
                <option value="satin">Satin</option>
                <option value="dewy">Dewy</option>
                <option value="matte">Matte</option>
                <option value="natural">Natural</option>
              </select>
            </div>

            <span className="text-stone-400 ml-auto">
              {filteredItems.length} items
            </span>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((prod) => {
              const isFav = favorites.includes(prod.id);
              const isInLook = customProductIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 hover:border-stone-300 transition-all flex flex-col justify-between ${
                    isInLook ? 'border-stone-900/40 ring-1 ring-stone-900/10' : 'border-stone-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          {prod.brand} · {prod.subcategory || prod.category}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60 font-medium">
                          Demo Sample
                        </span>
                      </div>
                      <button
                        onClick={() => onToggleFavorite(prod.id)}
                        className={`p-1.5 rounded-md ${
                          isFav ? 'text-rose-600 bg-rose-50' : 'text-stone-400 hover:text-stone-700'
                        }`}
                        aria-label="Save product"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <h4 className="font-bold text-xs text-stone-900 leading-snug">
                      {prod.name}
                    </h4>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-stone-900">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      {prod.finish && (
                        <span className="text-[11px] font-sans text-stone-500 capitalize">
                          · {prod.finish}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-2">
                      {prod.whyItFitsReason}
                    </p>

                    {/* Shade swatches if available */}
                    {prod.shades && prod.shades.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-semibold text-stone-500">
                          Try Shade Swatches:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {prod.shades.map((sh) => (
                            <button
                              key={sh.id}
                              onClick={() => {
                                if (prod.category === 'lipstick' || prod.category === 'lipgloss') setPreviewLip(sh.hex);
                                if (prod.category === 'blush') setPreviewBlush(sh.hex);
                              }}
                              className="w-5 h-5 rounded-full border border-black/10 shadow-xs hover:scale-110 transition-transform"
                              style={{ backgroundColor: sh.hex }}
                              title={`${sh.shadeName} (${sh.undertone})`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        const hex = prod.colorHex;
                        if (!hex) return;
                        if (prod.category === 'lipstick' || prod.category === 'lipgloss') setPreviewLip(hex);
                        if (prod.category === 'blush') setPreviewBlush(hex);
                        if (prod.category === 'eyeliner' || prod.category === 'kajal') setPreviewLiner(hex);
                      }}
                      className="flex-1 py-1.5 text-center text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => {
                        if (isInLook) {
                          setCustomProductIds((prev) => prev.filter((id) => id !== prod.id));
                        } else {
                          setCustomProductIds((prev) => [...prev, prod.id]);
                        }
                      }}
                      className={`px-2.5 py-1.5 text-center text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        isInLook
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {isInLook ? 'In Kit' : '+ Add to Kit'}
                    </button>

                    <button
                      onClick={() => onToggleFavorite(prod.id)}
                      className="px-2.5 py-1.5 text-center text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {isFav ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
