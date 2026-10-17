import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatNaira, generateGeneralWhatsAppUrl } from '../lib/utils';
import { api } from '../lib/api';
import { InvoiceView } from '../components/InvoiceView';
import { Order } from '../types';
import {
  ShieldCheck,
  Building2,
  MessageCircle,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Loader2,
  Copy,
  Check,
  Upload,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { YouMightAlsoLike } from '../components/YouMightAlsoLike';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartTotal,
    settings,
    clearCart,
    setCurrentView,
    setCompletedOrder
  } = useStore();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: 'Lagos',
    notes: ''
  });

  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  
  // Locked-in order state once customer clicks "Proceed & Lock In Order"
  const [lockedInOrder, setLockedInOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Copy feedback states
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Payment Proof Upload state
  const [proofFile, setProofFile] = useState<{ dataUrl: string; name: string } | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Fixed Delivery fee: ₦5000 fixed doorstep delivery or ₦0 showroom pickup
  const fixedDeliveryFee = settings?.deliveryFee ?? settings?.lagosDeliveryFee ?? 5000;
  const deliveryFee = deliveryOption === 'pickup' ? 0 : fixedDeliveryFee;
  const grandTotal = cartTotal + deliveryFee;

  // Official Bank Details specified by the owner
  const bankConfig = {
    bankName: settings?.paymentMethods?.bankTransfer?.bankName || 'Kuda MFB',
    accountName: settings?.paymentMethods?.bankTransfer?.accountName || 'Chidera Kelvin',
    accountNumber: settings?.paymentMethods?.bankTransfer?.accountNumber || '2064248680',
    instructions: settings?.paymentMethods?.bankTransfer?.instructions || 'Please transfer the exact amount shown to the Kuda MFB account details provided above.'
  };

  const nigerianStates = [
    'Lagos',
    'FCT Abuja',
    'Rivers (Port Harcourt)',
    'Oyo (Ibadan)',
    'Ogun',
    'Delta',
    'Edo',
    'Anambra',
    'Enugu',
    'Kano',
    'Kaduna',
    'Akwa Ibom',
    'Ondo',
    'Kwara',
    'Abia',
    'Other Nigerian State'
  ];

  const handleCopy = (text: string, type: 'account' | 'amount' | 'ref') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'account') {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2500);
      } else if (type === 'amount') {
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2500);
      } else {
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2500);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB. Please choose a smaller receipt file or screenshot.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofFile({
        dataUrl: reader.result as string,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  // Step 1: User fills info and clicks "Proceed & Lock In Order"
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.fullName || !form.phone || (deliveryOption !== 'pickup' && !form.address)) {
      setErrorMsg('Please complete all required customer information fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          ...form,
          address: deliveryOption === 'pickup' && !form.address ? (settings?.address || 'Victoria Island Showroom Pickup') : form.address,
          whatsapp: form.whatsapp || form.phone
        },
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          variantId: item.variantId,
          storage: item.storage,
          colorName: item.color?.name,
          condition: item.condition,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sku: item.variantId
        })),
        deliveryOption,
        paymentMethod: 'bank_transfer' as const
      };

      // Create order in backend - this locks in the order and generates official order number
      const newOrder = await api.createOrder(orderPayload);
      clearCart();
      setCompletedOrder(newOrder);
      setLockedInOrder(newOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to lock in order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: User confirms payment transfer on the locked-in screen
  const handleSubmitProof = async () => {
    if (!lockedInOrder) return;
    setIsSubmittingProof(true);
    try {
      const confirmed = await api.submitBankPayment(
        lockedInOrder.id,
        proofFile?.dataUrl,
        proofFile?.name
      );
      setProofSubmitted(true);
      setLockedInOrder(confirmed.order);
      setCompletedOrder(confirmed.order);
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment confirmation.');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // If viewing invoice
  if (showInvoice && lockedInOrder) {
    return (
      <div className="pt-24 sm:pt-28 pb-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <InvoiceView
          order={lockedInOrder}
          settings={settings}
          onBack={() => setShowInvoice(false)}
        />
      </div>
    );
  }

  // --- VIEW 2: ORDER LOCKED IN & ACCOUNT NUMBER REVEALED ---
  if (lockedInOrder) {
    const ownerWhatsapp = settings?.whatsappConfig?.ownerWhatsApp || settings?.whatsappNumber || '2349036422181';
    const isAwaitingVerification = lockedInOrder.paymentStatus === 'awaiting_verification' || proofSubmitted;
    const isPaid = lockedInOrder.paymentStatus === 'verified';

    const whatsappMessage = `*NEW ERA GADGETS PAYMENT CONFIRMATION*
Order Number: ${lockedInOrder.orderNumber}
Invoice: ${lockedInOrder.invoiceNumber}
Amount: ${formatNaira(lockedInOrder.total)}
Customer: ${lockedInOrder.customer.fullName}
Phone: ${lockedInOrder.customer.phone}
Bank: ${bankConfig.bankName}
Account Name: ${bankConfig.accountName}
Account Number: ${bankConfig.accountNumber}
Delivery: ${lockedInOrder.deliveryOption === 'pickup' ? 'Showroom Pickup (Victoria Island)' : `${lockedInOrder.customer.address}, ${lockedInOrder.customer.state}`}
Status: ${isAwaitingVerification ? 'Transfer Done - Awaiting Verification' : 'Order Locked In'}`;

    const whatsappNotificationUrl = generateGeneralWhatsAppUrl(ownerWhatsapp, whatsappMessage);

    return (
      <div className="pt-24 sm:pt-28 pb-28 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Locked-In Header */}
        <div className="text-center space-y-3 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Order Locked In & Reserved</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Order #{lockedInOrder.orderNumber} is Locked In
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Your gadget and pricing have been securely reserved. Please transfer the exact amount below to our official Kuda MFB account to finalize your order.
          </p>

          <div className="inline-flex items-center gap-1.5 text-xs text-neutral-500 pt-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Reserved for {settings?.reservationMinutes || 60} minutes</span>
          </div>
        </div>

        {/* PRIMARY BANK ACCOUNT CARD (KUDA MFB) */}
        <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden border border-neutral-800">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
                  Official Transfer Account
                </span>
                <span className="text-xs text-neutral-300">Verified Era Gadgets Account</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
                Amount to Transfer
              </span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                {formatNaira(lockedInOrder.total)}
              </span>
            </div>
          </div>

          {/* Account Details Presentation */}
          <div className="space-y-4">
            {/* Account Number Box (Prominent & High-Impact) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Account Number (NUBAN)
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-white selection:bg-emerald-500">
                  {bankConfig.accountNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(bankConfig.accountNumber, 'account')}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
              >
                {copiedAccount ? (
                  <>
                    <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-neutral-950" />
                    <span>Copy Account Number</span>
                  </>
                )}
              </button>
            </div>

            {/* Bank Name & Account Name Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Bank Name</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{bankConfig.bankName}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Account Name</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{bankConfig.accountName}</span>
              </div>
            </div>

            {/* Payment Reference Helper */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Transfer Narration / Ref</span>
                <span className="font-mono font-bold text-neutral-200 mt-0.5 block">{lockedInOrder.orderNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(lockedInOrder.orderNumber, 'ref')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? 'Copied' : 'Copy Ref'}</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">
              {bankConfig.instructions} Kindly use <strong className="text-white font-semibold">{lockedInOrder.orderNumber}</strong> or your name as the transfer narration for instant automated matching.
            </p>
          </div>

          {/* Payment Proof / Transfer Confirmation Section */}
          <div className="pt-5 border-t border-neutral-800 space-y-4">
            {isAwaitingVerification ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-200">
                    Payment Confirmation Logged (Awaiting Verification)
                  </p>
                  <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                    Our accounts team has received your transfer confirmation and is verifying with Kuda MFB. We will confirm dispatch within minutes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-neutral-400" />
                    Attach Transfer Receipt / Screenshot (Optional)
                  </span>
                  <span className="text-[10px] text-neutral-500">JPG, PNG, PDF</span>
                </div>

                {proofFile ? (
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate text-neutral-300">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{proofFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProofFile(null)}
                      className="text-neutral-500 hover:text-rose-400 text-xs ml-2 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="p-3 border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-neutral-900/50 hover:bg-neutral-900 transition-colors text-xs text-neutral-300">
                    <Upload className="w-4 h-4 text-neutral-400" />
                    <span>Upload Transfer Receipt or Screenshot</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                <button
                  type="button"
                  onClick={handleSubmitProof}
                  disabled={isSubmittingProof}
                  className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-neutral-400"
                >
                  {isSubmittingProof ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Confirmation...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>I've Made the Transfer ({formatNaira(lockedInOrder.total)})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: WhatsApp Notification & Invoice */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={whatsappNotificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Payment Proof via WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setShowInvoice(true)}
            className="px-5 py-3 rounded-full bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>View & Download Tax Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('shop')}
            className="px-5 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Hardware & Delivery Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-sm space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-neutral-100">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Order Ref</span>
              <span className="text-xs font-bold text-neutral-950 font-mono">{lockedInOrder.orderNumber}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Invoice No</span>
              <span className="text-xs font-bold text-neutral-950 font-mono">{lockedInOrder.invoiceNumber}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Method</span>
              <span className="text-xs font-bold text-neutral-950">
                {lockedInOrder.deliveryOption === 'pickup' ? 'Showroom Pickup' : 'Doorstep Delivery'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total</span>
              <span className="text-xs font-bold text-neutral-950 tabular-nums">
                {formatNaira(lockedInOrder.total)}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Reserved Items</h4>
            <div className="divide-y divide-neutral-100">
              {lockedInOrder.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-neutral-900">{item.productName}</span>
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
        </div>
      </div>
    );
  }

  // --- EMPTY CART CHECK (Only if no locked-in order) ---
  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Your bag is empty</h2>
        <p className="text-xs text-neutral-500">
          Add gadgets to your bag before proceeding to checkout.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="px-6 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-semibold hover:bg-neutral-800"
        >
          Explore Gadgets
        </button>
      </div>
    );
  }

  // --- VIEW 1: CHECKOUT FORM (Account number is NOT shown yet; locks in on proceed) ---
  return (
    <div className="pt-24 sm:pt-28 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('shop')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Customer Information & Delivery Form */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              Checkout & Delivery Details
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Provide your details and click proceed to lock in your device and view our official transfer account.
            </p>
          </div>

          {/* Mobile Collapsible Order Summary Accordion (Visible on Mobile / Tablets < lg) */}
          <div className="lg:hidden bg-neutral-950 text-white rounded-2xl p-4 shadow-md border border-neutral-800">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              className="w-full flex items-center justify-between text-xs cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold block text-white text-xs">
                    {mobileSummaryOpen ? 'Hide Order Items' : 'View Order Items'} ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Tap to {mobileSummaryOpen ? 'collapse' : 'view items & breakdown'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-emerald-400 tabular-nums">
                  {formatNaira(grandTotal)}
                </span>
                {mobileSummaryOpen ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </div>
            </button>

            {mobileSummaryOpen && (
              <div className="pt-3.5 mt-3.5 border-t border-neutral-800/80 space-y-3 animate-in fade-in duration-200">
                <div className="divide-y divide-neutral-800 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.variantId} className="py-2.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-bold text-white truncate">{item.productName}</h4>
                        <p className="text-[10px] text-neutral-400">
                          {item.storage && item.storage !== 'None' ? `${item.storage} · ` : ''}
                          {item.color?.name || item.condition}
                          <span className="ml-1 text-neutral-300 font-semibold">× {item.quantity}</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold text-white tabular-nums shrink-0">
                        {formatNaira(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-800 text-xs space-y-1.5 text-neutral-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white tabular-nums">{formatNaira(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery ({deliveryOption === 'pickup' ? 'Showroom Pickup' : 'Doorstep'})</span>
                    <span className="font-semibold text-white tabular-nums">
                      {deliveryFee === 0 ? 'FREE' : formatNaira(deliveryFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-white text-sm">
                    <span>Grand Total</span>
                    <span className="text-emerald-400 tabular-nums">{formatNaira(grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
            {/* 1. Customer Information */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-100 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-950">1. Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full p-3 sm:p-2.5 border border-neutral-300 rounded-xl text-base sm:text-xs focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08012345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-3 sm:p-2.5 border border-neutral-300 rounded-xl text-base sm:text-xs focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full p-3 sm:p-2.5 border border-neutral-300 rounded-xl text-base sm:text-xs focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-3 sm:p-2.5 border border-neutral-300 rounded-xl text-base sm:text-xs focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-all bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-950">2. Delivery Location</h3>
                {deliveryOption === 'pickup' && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Showroom Collection
                  </span>
                )}
              </div>

              {deliveryOption === 'pickup' ? (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-1">
                  <p className="font-bold text-neutral-900">Showroom Address for Pickup:</p>
                  <p>{settings?.address || 'Victoria Island, Lagos, Nigeria'}</p>
                  <p className="text-[11px] text-neutral-500">
                    Hours: {settings?.openingHours || 'Mon – Sat: 9:00 AM – 7:30 PM WAT'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        State *
                      </label>
                      <select
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full p-3 sm:p-2.5 border border-neutral-300 rounded-xl text-base sm:text-xs focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 bg-white transition-all cursor-pointer"
                      >
                        {nigerianStates.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        City / Town / LGA *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lekki Phase 1, Ikeja, Garki..."
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full p-3 sm:p-2.5 border border-neutral-300 rounded-xl text-base sm:text-xs focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Street Address / House Number *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Plot 14, Admiralty Way, Lekki Phase 1"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full p-3 sm:p-2.5 border border-neutral-300 rounded-xl text-base sm:text-xs focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 resize-none transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Delivery Notes / Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite standard chartered bank..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full p-3 sm:p-2.5 border border-neutral-300 rounded-xl text-base sm:text-xs focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-all bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Delivery Method Selection */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-100 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-950">3. Select Delivery Method</h3>
              <div className="space-y-2.5">
                <label
                  onClick={() => setDeliveryOption('delivery')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    deliveryOption === 'delivery'
                      ? 'border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryOption === 'delivery'}
                      onChange={() => setDeliveryOption('delivery')}
                      className="text-neutral-900 focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Doorstep Delivery</p>
                      <p className="text-[11px] text-neutral-500">Fast tracked delivery directly to your address nationwide</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 tabular-nums">
                    {formatNaira(fixedDeliveryFee)}
                  </span>
                </label>

                <label
                  onClick={() => setDeliveryOption('pickup')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    deliveryOption === 'pickup'
                      ? 'border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryOption === 'pickup'}
                      onChange={() => setDeliveryOption('pickup')}
                      className="text-neutral-900 focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Showroom Collection (Pick up)</p>
                      <p className="text-[11px] text-neutral-500">Inspect device in person & collect directly ({settings?.address || 'Victoria Island, Lagos'})</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">FREE</span>
                </label>
              </div>
            </div>

            {/* Interactive "You Might Also Like" Cross-Sell (High Conversion Boost!) */}
            <div className="pt-1">
              <YouMightAlsoLike
                variant="checkout"
                title="You Might Also Like · Complete Your Setup"
                subtitle="Add essential genuine accessories with 1 tap — recalculates your order instantly"
              />
            </div>

            {/* 4. Payment Method Selection (GATEWAYS REMOVED; BANK ACCOUNT DISPLAYED ONLY ONCE PROCEEDED) */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-950">4. Payment Method</h3>
                <span className="text-[10px] font-bold bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200">
                  Direct Bank Transfer
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-900/10 bg-neutral-50/80 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-neutral-950">Direct Bank Transfer</p>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                      Safe & Reserved
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Click <strong className="text-neutral-950">Proceed & Lock In Order</strong> below. Your device and price will be locked in immediately, and our official bank account details will be presented to complete your payment.
                  </p>
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Account details revealed immediately on proceed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action: Locks in the order and reveals the account details */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-neutral-950 text-white text-sm font-bold hover:bg-neutral-800 active:scale-95 disabled:bg-neutral-400 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Locking in Your Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Proceed & Lock In Order ({formatNaira(grandTotal)})</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-neutral-500">
                🔒 Clicking proceed securely reserves your item and displays the Kuda MFB account details for your transfer.
              </p>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-neutral-100 shadow-2xs space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-neutral-950 pb-3 border-b border-neutral-100">
              Order Summary ({cart.reduce((sum, i) => sum + i.quantity, 0)} Items)
            </h3>

            {/* Cart Items List */}
            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.variantId} className="py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-900 truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      {item.storage && item.storage !== 'None' ? `${item.storage} · ` : ''}
                      {item.color?.name || item.condition}
                      <span className="ml-1 text-neutral-700 font-medium">× {item.quantity}</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-950 tabular-nums shrink-0">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  {formatNaira(cartTotal)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  {deliveryFee === 0 ? 'FREE' : formatNaira(deliveryFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm font-bold text-neutral-950">
                <span>Grand Total</span>
                <span className="tabular-nums text-base">{formatNaira(grandTotal)}</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Diagnostic guarantee & 100% genuine gadget verification.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Checkout Bar (Thumb-Friendly on Phone) */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 z-40 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">Total to Pay</span>
            <span className="text-base font-black text-neutral-950 tabular-nums">{formatNaira(grandTotal)}</span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 active:scale-95 disabled:bg-neutral-400 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Locking in...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Proceed & Lock In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
