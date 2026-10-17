import React, { useMemo, useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant } from '../types';
import { formatNaira, calculateDiscountPercentage } from '../lib/utils';
import {
  Sparkles,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Tag
} from 'lucide-react';

interface YouMightAlsoLikeProps {
  variant?: 'cart' | 'checkout' | 'full';
  title?: string;
  subtitle?: string;
  maxItems?: number;
  currentProductId?: string;
  currentProductCategory?: string;
  onItemAdded?: (product: Product) => void;
}

export const YouMightAlsoLike: React.FC<YouMightAlsoLikeProps> = ({
  variant = 'cart',
  title,
  subtitle,
  maxItems = 8,
  currentProductId,
  currentProductCategory,
  onItemAdded
}) => {
  const { products, cart, addToCart, updateCartQuantity, removeFromCart, openProduct, setIsCartOpen } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'accessories' | 'devices'>('all');

  // Determine what categories/brands are currently in the cart
  const cartProductIds = useMemo(() => new Set(cart.map((item) => item.productId)), [cart]);
  const hasCartApple = useMemo(() => {
    return cart.some(
      (item) =>
        item.productName.toLowerCase().includes('iphone') ||
        item.productName.toLowerCase().includes('apple')
    );
  }, [cart]);
  const hasCartSamsung = useMemo(() => {
    return cart.some(
      (item) =>
        item.productName.toLowerCase().includes('samsung') ||
        item.productName.toLowerCase().includes('galaxy')
    );
  }, [cart]);

  // Smart recommendation ranking
  const recommendations = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Filter out current product if on PDP
    const candidates = products.filter(
      (p) =>
        (!currentProductId || p.id !== currentProductId) &&
        !p.isSold &&
        p.variants.some((v) => !v.isSold && v.stock > 0)
    );

    // Scoring logic for smart cross-sell
    const scored = candidates.map((p) => {
      let score = 0;
      const isAlreadyInCart = cartProductIds.has(p.id);
      if (isAlreadyInCart) {
        score -= 100; // Deprioritize items already in the bag
      }

      const pName = p.name.toLowerCase();
      const pCat = p.category.toLowerCase();
      const isAccessory =
        pCat === 'accessories' ||
        pName.includes('adapter') ||
        pName.includes('case') ||
        pName.includes('glass') ||
        pName.includes('power bank') ||
        pName.includes('airpods');

      if (variant === 'full') {
        // On Product Detail Page, we want both companion accessories AND alternative phones
        if (currentProductCategory && p.category.toLowerCase() === currentProductCategory.toLowerCase()) {
          score += 70; // Same category alternative models
        }
        if (isAccessory) {
          score += 65; // Companion accessories
        }
        if (p.featured) score += 25;
      } else {
        // In Cart & Checkout: Accessories are top-priority cross-sells
        if (isAccessory) {
          score += 60;
          if (
            hasCartApple &&
            (pName.includes('apple') ||
              pName.includes('20w') ||
              pName.includes('magsafe') ||
              pName.includes('airpods'))
          ) {
            score += 45;
          }
          if (pName.includes('power bank') || pName.includes('tempered glass')) {
            score += 35;
          }
        } else {
          if (hasCartApple && p.category === 'iPhone') score += 20;
          if (hasCartSamsung && p.category === 'Samsung') score += 20;
          if (p.featured) score += 15;
        }
      }

      return { product: p, score, isAlreadyInCart, isAccessory };
    });

    let filtered = scored.filter((s) => !s.isAlreadyInCart);

    if (variant === 'full') {
      if (activeTab === 'accessories') {
        filtered = filtered.filter((s) => s.isAccessory);
      } else if (activeTab === 'devices') {
        filtered = filtered.filter((s) => !s.isAccessory);
      }
    }

    return filtered
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems)
      .map((s) => s.product);
  }, [
    products,
    cart,
    cartProductIds,
    hasCartApple,
    hasCartSamsung,
    maxItems,
    currentProductId,
    currentProductCategory,
    variant,
    activeTab
  ]);

  if (recommendations.length === 0) return null;

  const handleQuickAdd = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Pick first in-stock variant
    const availableVariant =
      product.variants.find((v) => !v.isSold && v.stock > 0) || product.variants[0];
    if (!availableVariant) return;

    addToCart(product, availableVariant, 1);
    setJustAddedId(product.id);

    // Tactile haptic feedback on mobile if supported
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(40);
      }
    } catch (_) {}

    setTimeout(() => {
      setJustAddedId((curr) => (curr === product.id ? null : curr));
    }, 2200);

    if (onItemAdded) {
      onItemAdded(product);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  // Titles according to context
  const sectionTitle =
    title ||
    (variant === 'checkout'
      ? 'Frequently Paired With Your Gadget'
      : variant === 'full'
      ? 'You Might Also Like · Recommended For You'
      : 'You Might Also Like');

  const sectionSubtitle =
    subtitle ||
    (variant === 'checkout'
      ? 'Essential genuine accessories & add-ons selected for your order'
      : variant === 'full'
      ? 'Explore matching accessories and popular flagship alternatives'
      : 'Customers frequently add these companion items to their bag');

  // --- CART DRAWER VARIANT (COMPACT & HORIZONTALLY SWIPEABLE) ---
  if (variant === 'cart') {
    return (
      <div className="border-t border-neutral-100 pt-3 pb-2 px-4 sm:px-5 bg-gradient-to-b from-neutral-50/70 to-neutral-50">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            <span className="text-xs font-bold text-neutral-900 tracking-tight">
              {sectionTitle}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={scrollLeft}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Swipeable Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recommendations.map((prod) => {
            const variantInCart = cart.find((c) => c.productId === prod.id);
            const isAdded = justAddedId === prod.id || Boolean(variantInCart);
            const discount = calculateDiscountPercentage(prod.basePrice, prod.compareAtPrice);
            const firstImage = prod.images?.[0] || prod.variants?.[0]?.image || '';

            return (
              <div
                key={prod.id}
                className="w-[190px] shrink-0 snap-start bg-white rounded-xl p-2.5 border border-neutral-200/80 hover:border-neutral-300 transition-all shadow-xs flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div
                    onClick={() => {
                      setIsCartOpen(false);
                      openProduct(prod.slug);
                    }}
                    className="relative w-full h-24 rounded-lg bg-[#F8F8F8] flex items-center justify-center p-2 mb-2 cursor-pointer overflow-hidden"
                  >
                    {discount && (
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded shadow-2xs">
                        -{discount}%
                      </span>
                    )}

                    {prod.badge && !discount && (
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-neutral-700 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded shadow-2xs">
                        {prod.badge}
                      </span>
                    )}

                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="text-[10px] text-neutral-400">Era Gadgets</div>
                    )}
                  </div>

                  {/* Title */}
                  <h4
                    onClick={() => {
                      setIsCartOpen(false);
                      openProduct(prod.slug);
                    }}
                    className="text-[11px] font-bold text-neutral-900 line-clamp-1 cursor-pointer hover:text-neutral-700"
                    title={prod.name}
                  >
                    {prod.name}
                  </h4>

                  {/* Price */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-extrabold text-neutral-950 tabular-nums">
                      {formatNaira(prod.basePrice)}
                    </span>
                    {prod.compareAtPrice && prod.compareAtPrice > prod.basePrice && (
                      <span className="text-[9px] text-neutral-400 line-through tabular-nums">
                        {formatNaira(prod.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 1-Tap Quick Add */}
                <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 truncate">{prod.condition}</span>

                  {variantInCart ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Added</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(prod, e)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 active:scale-95 text-white text-[10px] font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- FULL VIEW (FOR PRODUCT DETAIL PAGE & SHOP PAGE SHOWCASE) ---
  if (variant === 'full') {
    return (
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 sm:p-8 shadow-sm space-y-6 my-10">
        {/* Header with interactive tab switch */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Smart Catalog Recommendations</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-neutral-950 tracking-tight">
              {sectionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500">
              {sectionSubtitle}
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2">
            {/* Filter Pills */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-neutral-950 shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                All Picks
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('accessories')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'accessories'
                    ? 'bg-white text-neutral-950 shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Accessories
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('devices')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'devices'
                    ? 'bg-white text-neutral-950 shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Alternative Phones
              </button>
            </div>

            {/* Carousel navigation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={scrollLeft}
                className="w-9 h-9 rounded-full border border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="w-9 h-9 rounded-full border border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel / Grid */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory -mx-2 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recommendations.map((prod) => {
            const variantInCart = cart.find((c) => c.productId === prod.id);
            const discount = calculateDiscountPercentage(prod.basePrice, prod.compareAtPrice);
            const firstImage = prod.images?.[0] || prod.variants?.[0]?.image || '';

            return (
              <div
                key={prod.id}
                className="w-[230px] sm:w-[260px] shrink-0 snap-start bg-[#FAFAFA] hover:bg-white rounded-2xl p-4 border border-neutral-200/80 hover:border-neutral-300 transition-all duration-200 shadow-2xs hover:shadow-lg flex flex-col justify-between group"
              >
                <div>
                  {/* Image Stage */}
                  <div
                    onClick={() => openProduct(prod.slug)}
                    className="relative w-full h-40 rounded-xl bg-white border border-neutral-100 flex items-center justify-center p-3 mb-3 cursor-pointer overflow-hidden"
                  >
                    {discount && (
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded shadow-xs z-10">
                        Save {discount}%
                      </span>
                    )}

                    {prod.badge && !discount && (
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-bold text-neutral-800 bg-white/95 px-2 py-0.5 rounded shadow-xs border border-neutral-100 z-10">
                        {prod.badge}
                      </span>
                    )}

                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-300 ease-out"
                      />
                    ) : (
                      <div className="text-xs text-neutral-400">Era Gadgets</div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                      <span>{prod.brand}</span>
                      <span>·</span>
                      <span className="text-emerald-700">{prod.condition}</span>
                    </div>

                    <h4
                      onClick={() => openProduct(prod.slug)}
                      className="text-xs sm:text-sm font-bold text-neutral-950 line-clamp-2 cursor-pointer hover:text-neutral-700 leading-snug"
                      title={prod.name}
                    >
                      {prod.name}
                    </h4>

                    <p className="text-[11px] text-neutral-500 line-clamp-1 pt-0.5">
                      {prod.shortDescription || '100% Genuine Certified Gadget'}
                    </p>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-3 border-t border-neutral-200/70 mt-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-extrabold text-neutral-950 tabular-nums">
                      {formatNaira(prod.basePrice)}
                    </div>
                    {prod.compareAtPrice && prod.compareAtPrice > prod.basePrice && (
                      <div className="text-[10px] text-neutral-400 line-through tabular-nums">
                        {formatNaira(prod.compareAtPrice)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {variantInCart ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-300">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>In Bag</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(prod, e)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        title="Add to Bag"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openProduct(prod.slug)}
                      className="p-1.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-white transition-colors"
                      title="View Details"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All devices undergo full 40-point hardware diagnostic verification.</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700">
            ✨ Free Nationwide Delivery on all orders above ₦100,000
          </span>
        </div>
      </div>
    );
  }

  // --- CHECKOUT PAGE VARIANT (HIGH CONVERSION, SLEEK CARDS WITH RECALCULATION CUE) ---
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-neutral-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3.5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
            <span>Smart Recommendations</span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-950 tracking-tight">
            {sectionTitle}
          </h3>
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
            {sectionSubtitle}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={scrollLeft}
            className="p-1.5 rounded-full border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition-colors cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="p-1.5 rounded-full border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition-colors cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swipeable Grid on Mobile / Flex Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-2 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.map((prod) => {
          const variantInCart = cart.find((c) => c.productId === prod.id);
          const isAdded = justAddedId === prod.id || Boolean(variantInCart);
          const discount = calculateDiscountPercentage(prod.basePrice, prod.compareAtPrice);
          const firstImage = prod.images?.[0] || prod.variants?.[0]?.image || '';

          return (
            <div
              key={prod.id}
              className="w-[220px] sm:w-[240px] shrink-0 snap-start bg-[#FAFAFA] hover:bg-white rounded-2xl p-3.5 border border-neutral-200/70 hover:border-neutral-300 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                {/* Image Stage */}
                <div
                  onClick={() => openProduct(prod.slug)}
                  className="relative w-full h-32 rounded-xl bg-white border border-neutral-100 flex items-center justify-center p-3 mb-2.5 cursor-pointer overflow-hidden"
                >
                  {discount && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded shadow-xs">
                      Save {discount}%
                    </span>
                  )}

                  {prod.badge && !discount && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-neutral-800 bg-white/95 px-2 py-0.5 rounded shadow-xs border border-neutral-100">
                      {prod.badge}
                    </span>
                  )}

                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="text-xs text-neutral-400">Era Gadgets</div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase font-semibold">
                    <span>{prod.brand}</span>
                    <span>·</span>
                    <span className="text-emerald-700">{prod.condition}</span>
                  </div>

                  <h4
                    onClick={() => openProduct(prod.slug)}
                    className="text-xs font-bold text-neutral-950 line-clamp-2 cursor-pointer hover:text-neutral-700 leading-snug"
                    title={prod.name}
                  >
                    {prod.name}
                  </h4>

                  <p className="text-[11px] text-neutral-500 line-clamp-1 pt-0.5">
                    {prod.shortDescription || '100% Genuine Certified Gadget'}
                  </p>
                </div>
              </div>

              {/* Bottom Price & 1-Click Interactive Add */}
              <div className="pt-3 border-t border-neutral-200/60 mt-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-neutral-950 tabular-nums">
                    {formatNaira(prod.basePrice)}
                  </div>
                  {prod.compareAtPrice && prod.compareAtPrice > prod.basePrice && (
                    <div className="text-[10px] text-neutral-400 line-through tabular-nums">
                      {formatNaira(prod.compareAtPrice)}
                    </div>
                  )}
                </div>

                <div>
                  {variantInCart ? (
                    <div className="flex items-center gap-1 bg-emerald-100/80 text-emerald-900 border border-emerald-300 rounded-xl px-2.5 py-1 text-xs font-bold shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                      <span>Added</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(variantInCart.variantId, variantInCart.quantity + 1);
                        }}
                        className="ml-1 w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] hover:bg-emerald-800"
                        title="Add another"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(prod, e)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Adding accessories bundles directly into your delivery with no extra shipping fees!</span>
        </span>
        <span className="text-[10px] text-neutral-400 hidden sm:inline">Swipe to view more →</span>
      </div>
    </div>
  );
};
