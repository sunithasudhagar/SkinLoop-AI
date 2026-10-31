import React, { useState } from 'react';
import { Product, UserProfile, ShelfProduct, SkinAnalysisRecord } from '../types';
import { SAMPLE_CATALOGUE } from '../data/catalogue';
import {
  Sun,
  Shield,
  Droplets,
  Bookmark,
  Heart,
  Plus,
  Check,
  Info,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SunscreenStoreViewProps {
  profile: UserProfile;
  latestAnalysis?: SkinAnalysisRecord;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToShelf: (product: ShelfProduct) => void;
  onNavigate: (view: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Skincare' },
  { id: 'sunscreen', label: 'Sunscreen (SPF 50+)' },
  { id: 'cleanser', label: 'Cleansers' },
  { id: 'moisturizer', label: 'Moisturizers' },
  { id: 'serum', label: 'Serums & Boosters' },
  { id: 'toner', label: 'Toners & Essences' },
];

export const SunscreenStoreView: React.FC<SunscreenStoreViewProps> = ({
  profile,
  latestAnalysis,
  favorites,
  onToggleFavorite,
  onAddToShelf,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('sunscreen');
  const [selectedFilterType, setSelectedFilterType] = useState<string>('all'); // all, mineral, chemical, hybrid, tinted
  const [selectedSpf, setSelectedSpf] = useState<string>('all'); // all, 50, 40
  const [selectedFinish, setSelectedFinish] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Skincare items
  const skincareCatalogue = SAMPLE_CATALOGUE.filter((p) =>
    ['sunscreen', 'cleanser', 'moisturizer', 'serum', 'toner'].includes(p.category)
  );

  const filteredItems = skincareCatalogue.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (item.price > maxPrice) return false;
    if (selectedFinish !== 'all' && item.finish !== selectedFinish) return false;

    if (selectedFilterType === 'tinted' && !item.isTintedSunscreen) return false;
    if (selectedFilterType === 'mineral' && !item.subcategory?.toLowerCase().includes('mineral')) return false;
    if (selectedFilterType === 'chemical' && !item.subcategory?.toLowerCase().includes('chemical') && !item.texture?.toLowerCase().includes('fluid')) return false;

    if (selectedSpf === '50' && (!item.spf || item.spf < 50)) return false;
    if (selectedSpf === '40' && (!item.spf || item.spf < 40)) return false;

    return true;
  });

  const handleQuickAddToShelf = (product: Product) => {
    const newShelfItem: ShelfProduct = {
      id: `shelf-add-${Date.now()}`,
      name: product.name,
      brand: product.brand,
      category: product.category,
      openedDate: new Date().toISOString().split('T')[0],
      verifiedIngredients: product.verifiedIngredients,
      purchasePrice: product.price,
      remainingPercent: 100,
      notes: `Added from Skincare Store. ${product.whyItFitsReason || ''}`,
    };
    onAddToShelf(newShelfItem);
    setAddedNotice(`"${product.name}" added to My Shelf!`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
          <span>Evidence-Based Skincare & SPF Discovery</span>
          <span>·</span>
          <span>Verified Formulations in INR (₹)</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Sunscreen & Skincare Essentials
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Broad-spectrum UV protection, lipid barrier cushions, and gentle humectant serums. SPF and PA claims are shown strictly from verified product specifications.
        </p>
      </div>

      {/* Clinical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 flex items-start gap-3 text-xs text-stone-700">
        <Shield className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-stone-900 font-semibold">Sunscreen Compatibility Notice:</strong> Sunscreen suitability is determined strictly by formulation properties, UV filter stability, finish, and skin barrier tolerance — never inferred solely from skin tone. All catalogue prices and shade descriptions are demo sample data.
        </p>
      </div>

      {/* Added Notification Toast */}
      {addedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{addedNotice}</span>
          </div>
          <button
            onClick={() => onNavigate('shelf')}
            className="font-bold underline hover:text-emerald-950"
          >
            View My Shelf
          </button>
        </div>
      )}

      {/* Categories & Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs pt-1 border-t border-stone-100">
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Formula Type</label>
            <select
              value={selectedFilterType}
              onChange={(e) => setSelectedFilterType(e.target.value)}
              className="w-full p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none"
            >
              <option value="all">All Formulas</option>
              <option value="mineral">100% Mineral Zinc Oxide</option>
              <option value="chemical">Invisible Chemical Fluid</option>
              <option value="tinted">Tinted Sunscreen Veil</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">SPF Rating</label>
            <select
              value={selectedSpf}
              onChange={(e) => setSelectedSpf(e.target.value)}
              className="w-full p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none"
            >
              <option value="all">All Ratings</option>
              <option value="50">SPF 50+ Broad Spectrum</option>
              <option value="40">SPF 40+ Protection</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Finish Preference</label>
            <select
              value={selectedFinish}
              onChange={(e) => setSelectedFinish(e.target.value)}
              className="w-full p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none"
            >
              <option value="all">All Finishes</option>
              <option value="natural">Natural</option>
              <option value="matte">Matte / Oil Control</option>
              <option value="dewy">Dewy Hydrating</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-600 font-semibold">Max Price</label>
              <span className="font-mono font-bold text-stone-900">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="200"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              className="w-full accent-stone-900 mt-2"
            />
          </div>

          <div className="flex items-end">
            <span className="text-stone-500 text-xs pb-2">
              Showing {filteredItems.length} matching products
            </span>
          </div>
        </div>
      </div>

      {/* Tinted Sunscreen Callout Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-950">
              Tinted Sunscreen vs Foundation:
            </span>
            <p className="text-amber-900 leading-relaxed text-[11px]">
              Tinted sunscreens use mineral iron oxides to provide sheer tone evening alongside visible blue-light protection. They do not replace high-coverage foundation, but serve as a lightweight daily alternative.
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedFilterType('tinted')}
          className="px-3 py-1.5 rounded-lg bg-amber-900 text-white font-semibold shrink-0 text-xs shadow-xs"
        >
          View Tinted SPF
        </button>
      </div>

      {/* Skincare Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
            <Sun className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-900">No Skincare Products Match Selected Filters</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            No formulas were found with your chosen category, SPF level, finish, or budget filter. Try resetting filters to browse all options.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedFilterType('all');
              setSelectedSpf('all');
              setSelectedFinish('all');
              setMaxPrice(1500);
            }}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-xs"
          >
            Reset Skincare Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((product) => {
          const isFav = favorites.includes(product.id);
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                      {product.brand} · {product.subcategory}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60 font-medium">
                      Demo Sample
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className={`p-1.5 rounded-md ${
                      isFav ? 'text-rose-600 bg-rose-50' : 'text-stone-400 hover:text-stone-700'
                    }`}
                    aria-label="Save product"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-mono font-bold text-stone-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      (est. ~₹{(product.price / 75).toFixed(1)}/use)
                    </span>
                    {product.spf && (
                      <span className="font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md">
                        SPF {product.spf} {product.paRating}
                      </span>
                    )}
                    {product.finish && (
                      <span className="text-stone-500 capitalize">· {product.finish}</span>
                    )}
                  </div>
                </div>

                {/* Reason why it fits user */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-700 space-y-1">
                  <span className="font-semibold text-stone-900 text-[11px] block">
                    Why this fits your skin:
                  </span>
                  <p className="text-[11px] leading-relaxed text-stone-600">
                    {product.whyItFitsReason}
                  </p>
                </div>

                {/* Tinted shades preview if available */}
                {product.isTintedSunscreen && product.shades && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-stone-600">
                      Tinted Shade Options:
                    </span>
                    <div className="flex items-center gap-2">
                      {product.shades.map((sh) => (
                        <div
                          key={sh.id}
                          className="flex items-center gap-1.5 px-2 py-1 bg-stone-50 border border-stone-200 rounded-md text-[10px]"
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: sh.hex }}
                          />
                          <span className="font-medium text-stone-700">{sh.shadeName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Ingredients */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Verified Ingredients
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {product.verifiedIngredients.map((ing) => (
                      <span
                        key={ing}
                        className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleQuickAddToShelf(product)}
                  className="flex-1 py-2 text-center text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>I Own This (My Shelf)</span>
                </button>
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className="px-3.5 py-2 text-center text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  {isFav ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
