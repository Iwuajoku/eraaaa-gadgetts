import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatNaira, generateGeneralWhatsAppUrl } from '../lib/utils';
import { InvoiceView } from '../components/InvoiceView';
import {
  CheckCircle2,
  Clock,
  Printer,
  ArrowRight,
  FileText,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { YouMightAlsoLike } from '../components/YouMightAlsoLike';

export const OrderConfirmationPage: React.FC = () => {
  const { completedOrder, setCurrentView, settings } = useStore();
  const [showFullInvoice, setShowFullInvoice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const bankConfig = {
    bankName: settings?.paymentMethods?.bankTransfer?.bankName || 'Kuda MFB',
    accountName: settings?.paymentMethods?.bankTransfer?.accountName || 'Chidera Kelvin',
    accountNumber: settings?.paymentMethods?.bankTransfer?.accountNumber || '2064248680',
    instructions: settings?.paymentMethods?.bankTransfer?.instructions || 'Please transfer the exact amount shown to the Kuda MFB account details provided above.'
  };

  const handleCopyAccount = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bankConfig.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  if (!completedOrder) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">No active order found</h2>
        <button
          onClick={() => setCurrentView('shop')}
          className="px-6 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-semibold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const isAwaitingVerification = completedOrder.paymentStatus === 'awaiting_verification';
  const isPaid = completedOrder.paymentStatus === 'verified';

  // Format owner whatsapp notification message
  const ownerWhatsapp = settings?.whatsappConfig?.ownerWhatsApp || settings?.whatsappNumber || '2349036422181';
  const firstItem = completedOrder.items[0];

  const whatsappMessage = `*NEW ERA GADGETS ORDER*
Order: ${completedOrder.orderNumber}
Invoice: ${completedOrder.invoiceNumber}
Customer: ${completedOrder.customer.fullName}
Phone: ${completedOrder.customer.phone}
WhatsApp: ${completedOrder.customer.whatsapp || completedOrder.customer.phone}
Product: ${firstItem?.productName || 'Gadget'}
Storage: ${firstItem?.storage || 'Standard'}
Color: ${firstItem?.colorName || 'Default'}
Condition: ${firstItem?.condition || 'Brand New'}
Quantity: ${firstItem?.quantity || 1}
Order Total: ${formatNaira(completedOrder.total)}
Payment Method: ${completedOrder.paymentMethod.replace(/_/g, ' ').toUpperCase()}
Payment Status: ${isAwaitingVerification ? 'Awaiting Verification' : completedOrder.paymentStatus}
Delivery: ${completedOrder.customer.address}, ${completedOrder.customer.city}, ${completedOrder.customer.state}
Invoice Token: ${completedOrder.accessToken}`;

  const whatsappNotificationUrl = generateGeneralWhatsAppUrl(ownerWhatsapp, whatsappMessage);

  const handleCopyInvoiceLink = () => {
    const url = `${window.location.origin}/?invoice_token=${completedOrder.accessToken}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // If user opened full invoice view
  if (showFullInvoice) {
    return (
      <div className="pt-24 sm:pt-28 pb-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <InvoiceView
          order={completedOrder}
          settings={settings}
          onBack={() => setShowFullInvoice(false)}
        />
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 pb-28 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Order Received Banner */}
      <div className="text-center space-y-3 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-100 shadow-sm">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
            isPaid
              ? 'bg-emerald-50 text-emerald-600'
              : isAwaitingVerification
              ? 'bg-amber-50 text-amber-600'
              : 'bg-neutral-100 text-neutral-800'
          }`}
        >
          {isPaid ? (
            <CheckCircle2 className="w-9 h-9" />
          ) : (
            <Clock className="w-9 h-9" />
          )}
        </div>

        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isPaid
              ? 'text-emerald-700'
              : isAwaitingVerification
              ? 'text-amber-700'
              : 'text-neutral-700'
          }`}
        >
          {isPaid
            ? 'Order Confirmed · Payment Verified'
            : isAwaitingVerification
            ? 'Payment Awaiting Verification'
            : 'Order Received'}
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950">
          Your order has been received successfully.
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
          {isAwaitingVerification ? (
            <span>
              We have logged your bank transfer confirmation for order{' '}
              <strong className="text-neutral-950">{completedOrder.orderNumber}</strong>. Our accounts desk will verify the funds with our bank and confirm your dispatch within minutes.
            </span>
          ) : (
            <span>
              Thank you for ordering with Era Gadgets. Order{' '}
              <strong className="text-neutral-950">{completedOrder.orderNumber}</strong> is currently being prepared.
            </span>
          )}
        </p>

        {/* Action Buttons: Invoice, WhatsApp, Copy Link */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setShowFullInvoice(true)}
            className="px-5 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-2xs"
          >
            <FileText className="w-4 h-4" />
            <span>View & Download Invoice</span>
          </button>

          <a
            href={whatsappNotificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Order Notification to Owner</span>
          </a>

          <button
            onClick={handleCopyInvoiceLink}
            className="px-4 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                <span>Copy Invoice Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official Kuda MFB Bank Details Box (Shown when payment is not yet verified) */}
      {!isPaid && (
        <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 border border-neutral-800">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
                Official Payment Account
              </span>
              <h3 className="text-sm font-bold text-white">Transfer to Kuda MFB</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-neutral-400 block">Exact Total</span>
              <span className="text-base sm:text-lg font-bold text-emerald-400 tabular-nums">
                {formatNaira(completedOrder.total)}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Account Number (NUBAN)
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-white">
                {bankConfig.accountNumber}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyAccount}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              {copiedAccount ? (
                <>
                  <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-neutral-950" />
                  <span>Copy Account Number</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Bank Name</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{bankConfig.bankName}</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Account Name</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{bankConfig.accountName}</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {bankConfig.instructions} Use <strong className="text-white">{completedOrder.orderNumber}</strong> as the payment narration.
          </p>
        </div>
      )}

      {/* 2. Key Order Metrics Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-sm space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-neutral-100">
          <div>
            <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Order Ref</span>
            <span className="text-sm font-bold text-neutral-950 font-mono">{completedOrder.orderNumber}</span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Invoice No</span>
            <span className="text-sm font-bold text-neutral-950 font-mono">{completedOrder.invoiceNumber}</span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Order Total</span>
            <span className="text-sm font-bold text-neutral-950 tabular-nums">
              {formatNaira(completedOrder.total)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Payment Status</span>
            <span
              className={`text-xs font-bold inline-flex items-center gap-1 ${
                isPaid
                  ? 'text-emerald-700'
                  : isAwaitingVerification
                  ? 'text-amber-700'
                  : 'text-neutral-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              {isPaid
                ? 'PAID (Verified)'
                : isAwaitingVerification
                ? 'Awaiting Verification'
                : 'Pending'}
            </span>
          </div>
        </div>

        {/* Customer & Delivery Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-600">
          <div>
            <h4 className="font-bold text-neutral-900 mb-1">Customer & Contact</h4>
            <p>{completedOrder.customer.fullName}</p>
            <p>Phone: {completedOrder.customer.phone}</p>
            {completedOrder.customer.whatsapp && <p>WhatsApp: {completedOrder.customer.whatsapp}</p>}
            <p>Email: {completedOrder.customer.email}</p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-1">Delivery Destination</h4>
            <p>{completedOrder.customer.address}</p>
            <p>
              {completedOrder.customer.city}, {completedOrder.customer.state}
            </p>
            {completedOrder.customer.notes && (
              <p className="text-neutral-500 italic mt-1">"{completedOrder.customer.notes}"</p>
            )}
          </div>
        </div>

        {/* Purchased Hardware */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Hardware Summary
          </h4>
          <div className="divide-y divide-neutral-100">
            {completedOrder.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-900">{item.productName}</span>
                  <span className="text-[11px] text-neutral-500 ml-1.5">
                    ({item.storage ? `${item.storage} · ` : ''}{item.colorName || item.condition}) × {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-neutral-950 tabular-nums">
                  {formatNaira(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit / Timeline */}
        {completedOrder.auditLogs && completedOrder.auditLogs.length > 0 && (
          <div className="pt-4 border-t border-neutral-100 space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Order Timeline & Verification Log
            </h4>
            <div className="space-y-1.5 text-[11px] text-neutral-500">
              {completedOrder.auditLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between">
                  <div>
                    <strong className="text-neutral-800">{log.action}:</strong> {log.details}
                  </div>
                  <span className="text-neutral-400 shrink-0 ml-3">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* You Might Also Like / Add to Shipment */}
      <div className="pt-2">
        <YouMightAlsoLike
          variant="checkout"
          title="Pair More With Your Order"
          subtitle="Add companion gadgets or chargers before your dispatch driver leaves"
        />
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => setCurrentView('shop')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-900 hover:text-neutral-600"
        >
          <span>Continue Shopping with Era Gadgets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
