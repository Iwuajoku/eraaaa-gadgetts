import React from 'react';
import { X, ExternalLink, Bell, ShoppingBag, CreditCard, AlertTriangle, MessageSquare } from 'lucide-react';

export interface ClassicNotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  orderId?: string;
  link?: string;
  timestamp?: string;
}

interface ClassicNotificationBannerProps {
  notification: ClassicNotificationItem | null;
  onDismiss: () => void;
  onOpenOrder?: (orderId: string) => void;
}

export const ClassicNotificationBanner: React.FC<ClassicNotificationBannerProps> = ({
  notification,
  onDismiss,
  onOpenOrder
}) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'payment_awaiting':
      case 'payment_verified':
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      case 'low_stock':
      case 'sold_out':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'enquiry':
      case 'lead':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] sm:w-full sm:max-w-md animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-neutral-950/95 backdrop-blur-md text-white border border-neutral-800/80 rounded-2xl p-4 shadow-2xl ring-1 ring-white/10 hover:border-neutral-700 transition-all">
        {/* App Header Bar (Classic iOS / Android Push Notification Style) */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60 mb-2.5">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Era Gadgets"
              className="w-4 h-4 rounded-full object-contain bg-white/10 p-0.5"
            />
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              Era Gadgets Storefront
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 font-medium">Just now</span>
            <button
              onClick={onDismiss}
              className="text-neutral-500 hover:text-white p-0.5 rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
              {notification.title}
            </h4>
            <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed line-clamp-2">
              {notification.message}
            </p>

            {/* Quick Action Button */}
            {notification.orderId && onOpenOrder && (
              <button
                type="button"
                onClick={() => {
                  onOpenOrder(notification.orderId!);
                  onDismiss();
                }}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-[11px] font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>View Order Details</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
