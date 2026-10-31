import React, { useState } from 'react';
import { ShelfProduct } from '../types';
import {
  Archive,
  Plus,
  Trash2,
  Edit2,
  Check,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface MyShelfViewProps {
  shelf: ShelfProduct[];
  onAddProduct: (product: ShelfProduct) => void;
  onUpdateProduct: (product: ShelfProduct) => void;
  onDeleteProduct: (id: string) => void;
  onNavigate: (view: string) => void;
}

export const MyShelfView: React.FC<MyShelfViewProps> = ({
  shelf,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onNavigate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShelfProduct | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'serum',
    purchasePrice: 699,
    remainingPercent: 80,
    openedDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    ingredientsInput: '',
    notes: '',
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      category: 'serum',
      purchasePrice: 699,
      remainingPercent: 80,
      openedDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      ingredientsInput: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: ShelfProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      purchasePrice: product.purchasePrice || 0,
      remainingPercent: product.remainingPercent,
      openedDate: product.openedDate || '',
      expiryDate: product.expiryDate || '',
      ingredientsInput: product.verifiedIngredients.join(', '),
      notes: product.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.brand.trim()) return;

    const parsedIngredients = formData.ingredientsInput
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (editingProduct) {
      const updated: ShelfProduct = {
        ...editingProduct,
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        purchasePrice: Number(formData.purchasePrice) || 0,
        remainingPercent: Number(formData.remainingPercent) || 50,
        openedDate: formData.openedDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        verifiedIngredients: parsedIngredients,
        notes: formData.notes.trim() || undefined,
      };
      onUpdateProduct(updated);
    } else {
      const created: ShelfProduct = {
        id: `shelf-${Date.now()}`,
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        purchasePrice: Number(formData.purchasePrice) || 0,
        remainingPercent: Number(formData.remainingPercent) || 100,
        openedDate: formData.openedDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        verifiedIngredients: parsedIngredients,
        notes: formData.notes.trim() || undefined,
      };
      onAddProduct(created);
    }

    setIsModalOpen(false);
  };

  const filteredShelf = shelf.filter((item) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  const totalShelfValue = shelf.reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
            <span>Product Inventory & Sustainability</span>
            <span>·</span>
            <span>Prevent Duplicate Purchases</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            My Shelf ({shelf.length} Products)
          </h1>
          <p className="text-stone-600 text-sm max-w-xl leading-relaxed">
            Log the skincare and makeup items you already own. SkinLoop AI prioritizes these products in your daily routine before recommending any new purchase.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Owned Product</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Active Inventory
          </span>
          <div className="text-2xl font-serif font-bold text-stone-900 font-mono tabular-nums">
            {shelf.length} Items
          </div>
          <p className="text-[11px] text-stone-500">
            Linked to your personalized AM & PM routines.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Inventory Value
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-900 font-mono tabular-nums">
            ₹{totalShelfValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-500">
            Total original investment in your current collection.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Routine Status
            </span>
            <div className="text-xs font-bold text-stone-900 mt-1">
              Active Routine Prioritizes Shelf First
            </div>
          </div>
          <button
            onClick={() => onNavigate('routine')}
            className="text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center gap-1 self-start"
          >
            <span>Review Routine Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'cleanser', 'serum', 'moisturizer', 'sunscreen', 'foundation', 'lipstick'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          )
        )}
      </div>

      {/* Product List */}
      {filteredShelf.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <Archive className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="text-sm font-serif font-bold text-stone-800">No products in this category</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Add bottles or jars you have in your bathroom cabinet so we can build your routine around them.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Add New Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShelf.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    {item.brand} · {item.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
                      aria-label="Edit product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-700 rounded-md transition-colors"
                      aria-label="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500">
                    {item.purchasePrice ? (
                      <span className="font-mono font-bold text-stone-900">
                        ₹{item.purchasePrice.toLocaleString('en-IN')}
                      </span>
                    ) : null}
                    {item.openedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Opened {item.openedDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remaining Amount Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>Remaining Fill</span>
                    <span className="font-mono font-semibold text-stone-900">
                      {item.remainingPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.remainingPercent > 40 ? 'bg-stone-900' : 'bg-amber-600'
                      }`}
                      style={{ width: `${item.remainingPercent}%` }}
                    />
                  </div>
                </div>

                {/* Ingredients tag list */}
                {item.verifiedIngredients.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      Noted Active Ingredients
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.verifiedIngredients.map((ing) => (
                        <span
                          key={ing}
                          className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.notes && (
                  <p className="text-[11px] text-stone-500 italic border-l-2 border-stone-200 pl-2">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Available in Routine
                </span>
                <button
                  onClick={() => onNavigate('routine')}
                  className="text-xs font-semibold text-stone-900 hover:underline"
                >
                  Link Step →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-start gap-3 text-stone-900">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-serif font-bold">Remove From My Shelf?</h3>
                <p className="text-xs text-stone-500 mt-1">
                  This will remove the product record and unlink it from any connected morning or evening routine steps.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 p-6 max-w-lg w-full space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {editingProduct ? 'Edit Shelf Product' : 'Add Owned Skincare or Makeup'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cerave, La Roche-Posay"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="cleanser">Cleanser</option>
                    <option value="serum">Serum / Essence</option>
                    <option value="moisturizer">Moisturizer / Cream</option>
                    <option value="sunscreen">Sunscreen (SPF)</option>
                    <option value="toner">Toner</option>
                    <option value="foundation">Foundation / Tint</option>
                    <option value="concealer">Concealer</option>
                    <option value="lipstick">Lipstick / Lip Balm</option>
                    <option value="blush">Blush</option>
                    <option value="eyeliner">Eyeliner</option>
                    <option value="mascara">Mascara</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydrating Cleanser with Ceramides"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Purchase Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="699"
                    value={formData.purchasePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Remaining Fill ({formData.remainingPercent}%)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={formData.remainingPercent}
                    onChange={(e) =>
                      setFormData({ ...formData, remainingPercent: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-stone-900 mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Known Active Ingredients (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ceramides, Hyaluronic Acid, Niacinamide"
                  value={formData.ingredientsInput}
                  onChange={(e) => setFormData({ ...formData, ingredientsInput: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Only enter verified ingredients from the bottle label. SkinLoop AI never invents ingredients from a brand name alone.
                </span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Personal Notes / Texture
                </label>
                <input
                  type="text"
                  placeholder="e.g. Light gel formula, used mostly on humid days"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Shelf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
