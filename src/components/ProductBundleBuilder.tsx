import React, { useState, useMemo } from 'react';
import { Product, ProductVariant } from '../types';
import { useStore } from '../context/StoreContext';
import { formatNaira, calculateDiscountPercentage } from '../lib/utils';
import {
  Sparkles,
  Check,
  Plus,
  ShieldCheck,
  Zap,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';

interface ProductBundleBuilderProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  currentPrice: number;
  currentCompareAt?: number | null;
  activeColorImage?: string | null;
}

export const ProductBundleBuilder: React.FC<ProductBundleBuilderProps> = ({
  product,
  selectedVariant,
  currentPrice,
  currentCompareAt,
  activeColorImage
}) => {
  const { products, addToCart, setIsCartOpen } = useStore();

  // Find companion accessories from the catalog
  const companionAccessories = useMemo(() => {
    if (!products) return [];

    const isApple =
      product.brand.toLowerCase().includes('apple') ||
      product.name.toLowerCase().includes('iphone');
    const isSamsung =
      product.brand.toLowerCase().includes('samsung') ||
      product.name.toLowerCase().includes('galaxy');

    // Filter available accessories in stock
    const accessories = products.filter(
      (p) =>
        p.id !== product.id &&
        !p.isSold &&
        (p.category === 'Accessories' ||
          p.name.toLowerCase().includes('adapter') ||
          p.name.toLowerCase().includes('case') ||
          p.name.toLowerCase().includes('glass') ||
          p.name.toLowerCase().includes('power bank') ||
          p.name.toLowerCase().includes('airpods'))
    );

    // Score & sort accessories for this specific device
    return accessories
      .map((acc) => {
        let score = 0;
        const nameLower = acc.name.toLowerCase();

        // 1. Fast Charger / Power Adapter is #1 essential for all modern smartphones
        if (nameLower.includes('adapter') || nameLower.includes('charger') || nameLower.includes('20w')) {
          score += 100;
          if (isApple && nameLower.includes('apple')) score += 30;
        }

        // 2. Protective Clear Case
        if (nameLower.includes('case') || nameLower.includes('magsafe')) {
          score += 90;
          if (isApple && nameLower.includes('magsafe')) score += 20;
        }

        // 3. Privacy Screen Protector
        if (nameLower.includes('glass') || nameLower.includes('screen') || nameLower.includes('privacy')) {
          score += 80;
        }

        // 4. Power Bank & Earbuds
        if (nameLower.includes('power bank') || nameLower.includes('powercore')) {
          score += 70;
        }
        if (nameLower.includes('airpods') || nameLower.includes('buds')) {
          score += isApple ? 65 : 40;
        }

        return { acc, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.acc);
  }, [products, product]);

  // Selected accessory IDs state - preselect top 2 high-converting items (e.g. 20W adapter & case)
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (companionAccessories.length > 0) {
      initial.add(companionAccessories[0].id);
    }
    if (companionAccessories.length > 1) {
      initial.add(companionAccessories[1].id);
    }
    return initial;
  });

  // Keep selection up to date if accessories load later
  React.useEffect(() => {
    if (selectedAccessoryIds.size === 0 && companionAccessories.length > 0) {
      const next = new Set<string>();
      next.add(companionAccessories[0].id);
      if (companionAccessories.length > 1) {
        next.add(companionAccessories[1].id);
      }
      setSelectedAccessoryIds(next);
    }
  }, [companionAccessories]);

  const toggleAccessory = (accId: string) => {
    setSelectedAccessoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(accId)) {
        next.delete(accId);
      } else {
        next.add(accId);
      }
      return next;
    });

    // Tactile haptic feedback on mobile
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch (_) {}
  };

  // Calculations
  const selectedAccessories = useMemo(() => {
    return companionAccessories.filter((acc) => selectedAccessoryIds.has(acc.id));
  }, [companionAccessories, selectedAccessoryIds]);

  const accessoriesTotal = useMemo(() => {
    return selectedAccessories.reduce((sum, item) => sum + item.basePrice, 0);
  }, [selectedAccessories]);

  // Special bundle bonus incentive: Save ₦5,000 when grabbing 2 or more accessories!
  const bundleDiscount = useMemo(() => {
    if (selectedAccessories.length >= 2) return 5000;
    if (selectedAccessories.length === 1) return 2000;
    return 0;
  }, [selectedAccessories.length]);

  const bundleTotal = Math.max(0, currentPrice + accessoriesTotal - bundleDiscount);

  const [isAddingBundle, setIsAddingBundle] = useState(false);
  const [bundleAddedSuccess, setBundleAddedSuccess] = useState(false);

  const handleAddBundleToBag = () => {
    if (!selectedVariant || product.isSold || selectedVariant.stock === 0) return;

    setIsAddingBundle(true);

    // 1. Add Main Device
    const cartVariant: ProductVariant = {
      ...selectedVariant,
      price: currentPrice,
      compareAtPrice: currentCompareAt,
      image: activeColorImage || selectedVariant.image || product.images?.[0] || ''
    };
    addToCart(product, cartVariant, 1);

    // 2. Add each selected accessory
    selectedAccessories.forEach((acc) => {
      const accVariant =
        acc.variants.find((v) => !v.isSold && v.stock > 0) || acc.variants[0];
      if (accVariant) {
        addToCart(acc, accVariant, 1);
      }
    });

    // Audio chime / haptic
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([40, 60, 80]);
      }
    } catch (_) {}

    setBundleAddedSuccess(true);
    setTimeout(() => {
      setIsAddingBundle(false);
      setBundleAddedSuccess(false);
      setIsCartOpen(true);
    }, 600);
  };

  if (companionAccessories.length === 0) return null;

  return (
    <div className="rounded-2xl sm:rounded-3xl border-2 border-neutral-900/10 bg-gradient-to-b from-neutral-50/90 via-white to-neutral-50/50 p-4 sm:p-6 shadow-sm space-y-4 my-6 transition-all">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/80 pb-3.5">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-emerald-700 fill-emerald-600" />
            <span>Frequently Bought Together</span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-950 tracking-tight">
            Complete Your Setup & Protect Your Investment
          </h3>
          <p className="text-[11px] sm:text-xs text-neutral-500">
            Smartphones ship without chargers. Select companion essentials to bundle into 1 package.
          </p>
        </div>

        {bundleDiscount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-extrabold self-start sm:self-auto shrink-0 shadow-2xs">
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Bundle & Save {formatNaira(bundleDiscount)}!</span>
          </div>
        )}
      </div>

      {/* Main interactive items list */}
      <div className="space-y-2.5">
        {/* Main Phone (Fixed anchor) */}
        <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-5 h-5 rounded-md bg-neutral-950 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F6F6F6] p-1.5 shrink-0 flex items-center justify-center border border-neutral-100">
              <img
                src={activeColorImage || selectedVariant?.image || product.images?.[0] || ''}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Main Device
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  {product.condition}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-950 truncate">
                {product.name}
              </h4>
              <p className="text-[11px] text-neutral-500">
                {selectedVariant?.storage && selectedVariant.storage !== 'None'
                  ? `${selectedVariant.storage} · `
                  : ''}
                {selectedVariant?.color?.name || 'Selected Spec'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs sm:text-sm font-black text-neutral-950 tabular-nums">
              {formatNaira(currentPrice)}
            </span>
          </div>
        </div>

        {/* Companion Accessories Checkboxes */}
        <div className="space-y-2">
          {companionAccessories.map((acc, index) => {
            const isChecked = selectedAccessoryIds.has(acc.id);
            const firstImg = acc.images?.[0] || acc.variants?.[0]?.image || '';
            const discount = calculateDiscountPercentage(acc.basePrice, acc.compareAtPrice);

            return (
              <label
                key={acc.id}
                onClick={() => toggleAccessory(acc.id)}
                className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none ${
                  isChecked
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-md ring-1 ring-neutral-950'
                    : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200/80 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'border-2 border-neutral-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center border border-neutral-200/60 shadow-2xs">
                    {firstImg ? (
                      <img
                        src={firstImg}
                        alt={acc.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <div className="text-[9px] text-neutral-400">Era</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold ${
                          isChecked ? 'text-neutral-400' : 'text-neutral-500'
                        }`}
                      >
                        {index === 0
                          ? '⚡ Must-Have Charger'
                          : index === 1
                          ? '🛡️ Recommended Protection'
                          : index === 2
                          ? '💎 Privacy Screen Guard'
                          : '🎧 High-End Audio'}
                      </span>
                      {discount && (
                        <span className="text-[9px] font-extrabold text-rose-500 bg-rose-100/90 px-1.5 py-0.2 rounded">
                          Save {discount}%
                        </span>
                      )}
                    </div>
                    <h5
                      className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                        isChecked ? 'text-white' : 'text-neutral-950'
                      }`}
                    >
                      {acc.name}
                    </h5>
                    <p
                      className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${
                        isChecked ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      {acc.shortDescription || '100% Authentic Guaranteed'}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-extrabold tabular-nums ${
                      isChecked ? 'text-emerald-400' : 'text-neutral-950'
                    }`}
                  >
                    +{formatNaira(acc.basePrice)}
                  </div>
                  {acc.compareAtPrice && acc.compareAtPrice > acc.basePrice && (
                    <div
                      className={`text-[10px] line-through tabular-nums ${
                        isChecked ? 'text-neutral-500' : 'text-neutral-400'
                      }`}
                    >
                      {formatNaira(acc.compareAtPrice)}
                    </div>
                  )}
                  <span
                    className={`text-[10px] font-semibold block mt-0.5 ${
                      isChecked ? 'text-emerald-300' : 'text-neutral-400'
                    }`}
                  >
                    {isChecked ? 'Included' : 'Tap to add'}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Interactive Bundle Calculation & 1-Tap Checkout Button */}
      <div className="pt-3 border-t border-neutral-200/80 bg-neutral-100/70 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-2xl sm:rounded-b-3xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="text-neutral-600 block text-xs">
              Setup summary: <strong className="text-neutral-950">1 Phone</strong> +{' '}
              <strong className="text-neutral-950">
                {selectedAccessories.length} {selectedAccessories.length === 1 ? 'Accessory' : 'Accessories'}
              </strong>
            </span>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span>Phone: {formatNaira(currentPrice)}</span>
              <span>+</span>
              <span>Accessories: {formatNaira(accessoriesTotal)}</span>
              {bundleDiscount > 0 && (
                <>
                  <span>-</span>
                  <span className="text-emerald-700 font-bold">Discount: {formatNaira(bundleDiscount)}</span>
                </>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Combined Setup Price
            </span>
            <span className="text-base sm:text-xl font-black text-neutral-950 tabular-nums">
              {formatNaira(bundleTotal)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddBundleToBag}
          disabled={isAddingBundle || product.isSold || Boolean(selectedVariant && selectedVariant.stock === 0)}
          className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-extrabold active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer"
        >
          {bundleAddedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Everything Added to Bag! Opening...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>
                Add Phone + {selectedAccessories.length} {selectedAccessories.length === 1 ? 'Accessory' : 'Accessories'} to Bag
                {bundleDiscount > 0 ? ` (Save ${formatNaira(bundleDiscount)})` : ''}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guaranteed compatible with {product.name}</span>
          </div>
          <span className="text-emerald-700 font-bold">✨ Unlocks Free Nationwide Shipping</span>
        </div>
      </div>
    </div>
  );
};
