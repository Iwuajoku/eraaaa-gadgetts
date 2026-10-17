import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { formatNaira } from '../lib/utils';
import { YouMightAlsoLike } from './YouMightAlsoLike';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    settings,
    setCurrentView
  } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 3500000;
  const progressToFreeDelivery = Math.min(100, Math.round((cartTotal / freeDeliveryThreshold) * 100));
  const amountNeeded = Math.max(0, freeDeliveryThreshold - cartTotal);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col justify-between h-full">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-semibold text-neutral-950">Review Your Bag</h2>
              <span className="text-xs text-neutral-500 font-medium">
                ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery notification */}
          <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-100">
            {amountNeeded > 0 ? (
              <p className="text-xs text-neutral-600">
                Add <span className="font-semibold text-neutral-900">{formatNaira(amountNeeded)}</span> more for free nationwide delivery.
              </p>
            ) : (
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> You've unlocked Complimentary Nationwide Express Delivery!
              </p>
            )}
            <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-neutral-900 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeDelivery}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="space-y-6">
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                    <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Your bag is empty</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Browse our certified iPhones, MacBooks, and premium companion accessories.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCurrentView('shop');
                    }}
                    className="mt-2 px-5 py-2 text-xs font-semibold bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition-colors inline-block cursor-pointer"
                  >
                    Explore Store
                  </button>
                </div>

                {/* Recommendations in Empty Cart */}
                <div className="-mx-5 -mb-5">
                  <YouMightAlsoLike
                    variant="cart"
                    title="Trending Gadgets & Accessories"
                    subtitle="Tap + Add to start building your order"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex gap-3.5 p-3 sm:p-3.5 rounded-xl bg-[#FAFAFA] border border-neutral-100"
                    >
                      <div className="w-16 h-16 bg-white rounded-lg border border-neutral-200/60 p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-neutral-900 truncate">
                            {item.productName}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                          {item.storage && item.storage !== 'None' && item.storage !== 'Default' && (
                            <span>{item.storage}</span>
                          )}
                          {item.color && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-2 h-2 rounded-full border border-black/20"
                                  style={{ backgroundColor: item.color.hex }}
                                />
                                {item.color.name}
                              </span>
                            </>
                          )}
                          <span>·</span>
                          <span className="text-neutral-700">{item.condition}</span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-neutral-200 rounded-lg bg-white shadow-2xs">
                            <button
                              onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                              className="px-2.5 py-1 text-neutral-600 hover:text-neutral-950 active:scale-95 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-neutral-900 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              className="px-2.5 py-1 text-neutral-600 hover:text-neutral-950 disabled:opacity-30 active:scale-95 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-extrabold text-neutral-950 tabular-nums">
                            {formatNaira(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive You Might Also Like Add-on Section */}
                <div className="-mx-5 pt-1">
                  <YouMightAlsoLike
                    variant="cart"
                    title="You Might Also Like"
                    subtitle="1-click add essentials to your bag"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-100 bg-[#FAFAFA] space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span>Subtotal</span>
                <span className="text-sm font-bold text-neutral-950 tabular-nums">
                  {formatNaira(cartTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Estimated Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <button
                onClick={handleCheckoutClick}
                disabled={Boolean(settings?.storeMaintenanceMode)}
                className="w-full py-3.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 disabled:bg-neutral-400 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-neutral-400">
                Guaranteed genuine devices with 100% money-back verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
