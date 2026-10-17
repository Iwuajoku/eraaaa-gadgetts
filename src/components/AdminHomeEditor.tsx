import React, { useState, useEffect } from 'react';
import {
  HomePageConfig,
  HomeCategoryCard,
  HomeTrustPillar,
  HomeFaqItem,
  Product,
  StoreSettings
} from '../types';
import { api } from '../lib/api';
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Sparkles,
  Shield,
  Truck,
  CheckCircle2,
  RotateCcw,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Eye,
  Check,
  RefreshCw,
  Sliders,
  ChevronDown,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
  Globe,
  Link2,
  Download,
  AlertCircle
} from 'lucide-react';

interface AdminHomeEditorProps {
  settings: StoreSettings;
  products: Product[];
  onSave: (updatedConfig: HomePageConfig) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onPreview: () => void;
}

const STOCK_IMAGE_PRESETS = [
  {
    name: 'Hero iPhone 17 Flagship',
    url: '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
    category: 'iPhone'
  },
  {
    name: 'MacBook Pro M4 Max Workstation',
    url: '/src/assets/images/showcase_macbook_pro_1790352903234.jpg',
    category: 'Mac'
  },
  {
    name: 'Samsung Galaxy S25 Ultra',
    url: '/src/assets/images/category_samsung_galaxy_1790352913709.jpg',
    category: 'Samsung'
  },
  {
    name: 'AirPods Max & Premium Gadgets',
    url: '/src/assets/images/accessories_airpods_gadgets_1790352927938.jpg',
    category: 'Accessories'
  },
  {
    name: 'iPhone Black Titanium Finish',
    url: '/src/assets/images/iphone_black_titanium_1790611902507.jpg',
    category: 'iPhone'
  },
  {
    name: 'iPhone Desert Titanium Finish',
    url: '/src/assets/images/iphone_desert_titanium_1790611888875.jpg',
    category: 'iPhone'
  },
  {
    name: 'iPhone White Titanium Finish',
    url: '/src/assets/images/iphone_white_titanium_1790611914496.jpg',
    category: 'iPhone'
  }
];

const AVAILABLE_ICONS = [
  'Smartphone',
  'Laptop',
  'Tablet',
  'Watch',
  'Headphones',
  'Sparkles',
  'Shield',
  'Truck',
  'CheckCircle2',
  'RotateCcw'
];

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  products?: Product[];
}

const ImageField: React.FC<ImageFieldProps> = ({
  label,
  value,
  onChange,
  helperText,
  products = []
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [showPresets, setShowPresets] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Keep internal text input aligned with external value
  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const handleApplyUrl = (targetUrl?: string) => {
    const raw = (targetUrl || urlInput).trim();
    if (!raw) return;
    onChange(raw);
    setUrlStatus('valid');
    setStatusMessage('✓ Image URL applied successfully!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleTestAndApplyUrl = () => {
    const target = urlInput.trim();
    if (!target) return;
    setUrlStatus('testing');
    setStatusMessage('Testing image URL connection...');

    const img = new Image();
    img.onload = () => {
      setUrlStatus('valid');
      setStatusMessage('✓ Image link verified and loaded successfully!');
      onChange(target);
      setTimeout(() => setStatusMessage(''), 4000);
    };
    img.onerror = () => {
      setUrlStatus('invalid');
      setStatusMessage('⚠ Direct load failed or CORS restricted. Click "Upload from URL" to permanently save it to store cloud!');
    };
    img.src = target;
  };

  const handleImportRemoteUrl = async () => {
    const target = urlInput.trim() || value;
    if (!target || (!target.startsWith('http://') && !target.startsWith('https://'))) {
      alert('Please enter a valid web image URL (starting with http:// or https://)');
      return;
    }

    setIsImporting(true);
    setStatusMessage('Downloading & permanently saving to store cloud media...');
    try {
      const permanentUrl = await api.uploadFromUrl(target, 'home_asset');
      onChange(permanentUrl);
      setUrlInput(permanentUrl);
      setUrlStatus('valid');
      setStatusMessage('✓ Successfully downloaded and permanently hosted on store cloud!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      console.warn('Import URL fallback:', err);
      onChange(target);
      setStatusMessage('Direct URL applied as fallback.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WEBP, or SVG).');
      return;
    }

    setIsUploading(true);
    setStatusMessage('Uploading and backing up to cloud storage...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        try {
          const finalUrl = await api.uploadImage(dataUrl, file.name.split('.')[0]);
          onChange(finalUrl);
          setUrlInput(finalUrl);
          setUrlStatus('valid');
          setStatusMessage('✓ Photo uploaded and backed up to cloud!');
          setTimeout(() => setStatusMessage(''), 4000);
        } catch (err) {
          onChange(dataUrl);
          setStatusMessage('Photo applied.');
        } finally {
          setIsUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const isExternalUrl = value?.startsWith('http://') || value?.startsWith('https://');
  const isCloudUpload = value?.startsWith('/uploads/');
  const isPreset = value?.startsWith('/src/assets/');

  return (
    <div className="space-y-3 p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/80">
      {/* Header & Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
          <span>{label}</span>
          {value && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isExternalUrl
                  ? 'bg-blue-100 text-blue-800'
                  : isCloudUpload
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-neutral-200 text-neutral-800'
              }`}
            >
              {isExternalUrl ? 'Web URL' : isCloudUpload ? 'Cloud Hosted' : 'Showroom Asset'}
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto px-2 py-1 rounded-lg hover:bg-neutral-200/60 transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
          <span>{showPresets ? 'Close Catalog Drawer' : 'Showroom Catalog Presets'}</span>
        </button>
      </div>

      {/* Main Visual Box + Input Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Visual Preview Box */}
        <div className="w-24 h-24 rounded-2xl border-2 border-neutral-200 bg-white p-2 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-2xs">
          {value ? (
            <img
              src={value}
              alt="Visual preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain mix-blend-multiply"
              onError={(e) => {
                // If it fails, give visual hint but don't overwrite settings state
                e.currentTarget.style.opacity = '0.3';
              }}
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-neutral-300" />
          )}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setUrlInput('');
                setUrlStatus('idle');
                setStatusMessage('');
              }}
              className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove current image"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Tab Controls for URL vs File Upload */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Paste Image URL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo File</span>
            </button>
          </div>

          {/* TAB 1: PASTE IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      const next = e.target.value;
                      setUrlInput(next);
                      const clean = next.trim();
                      if (
                        clean.startsWith('http://') ||
                        clean.startsWith('https://') ||
                        clean.startsWith('/uploads/') ||
                        clean.startsWith('/src/assets/') ||
                        clean.startsWith('data:image/')
                      ) {
                        onChange(clean);
                      }
                      setUrlStatus('idle');
                      setStatusMessage('');
                    }}
                    onBlur={() => {
                      const clean = urlInput.trim();
                      if (clean) {
                        onChange(clean);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTestAndApplyUrl();
                      }
                    }}
                    placeholder="https://... (paste direct image link)"
                    className="w-full p-2.5 pl-8 border border-neutral-300 rounded-xl text-xs bg-white text-neutral-900 focus:outline-none focus:border-neutral-950 shadow-2xs font-mono"
                  />
                  <Link2 className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyUrl()}
                    disabled={!urlInput.trim()}
                    className="px-3.5 py-2.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                    title="Apply image URL directly"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Link</span>
                  </button>

                  {(urlInput.trim().startsWith('http://') || urlInput.trim().startsWith('https://')) && (
                    <button
                      type="button"
                      onClick={handleImportRemoteUrl}
                      disabled={isImporting}
                      className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                      title="Download image and host permanently on store cloud media so it never breaks"
                    >
                      {isImporting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-white" />
                      )}
                      <span>{isImporting ? 'Saving to Cloud...' : 'Upload URL to Cloud'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status feedback */}
              {statusMessage && (
                <div
                  className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                    urlStatus === 'valid'
                      ? 'text-emerald-700'
                      : urlStatus === 'invalid'
                      ? 'text-rose-600'
                      : 'text-neutral-600'
                  }`}
                >
                  {urlStatus === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {urlStatus === 'invalid' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                  {urlStatus === 'testing' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-500" />}
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD PHOTO FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-2">
              <label className="p-3 bg-white border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl flex items-center justify-between cursor-pointer transition-colors group">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                    {isUploading ? (
                      <RefreshCw className="w-4 h-4 text-neutral-700 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-neutral-700" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      {isUploading ? 'Uploading & Cloud Backing...' : 'Choose photo from device'}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      PNG, JPG, WEBP, or SVG · Auto-backed to cloud Firestore
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-neutral-950 text-white rounded-lg text-xs font-bold shadow-2xs">
                  Browse
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {statusMessage && (
                <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          )}

          {helperText && <p className="text-[11px] text-neutral-500">{helperText}</p>}
        </div>
      </div>

      {/* Preset Drawer */}
      {showPresets && (
        <div className="p-4 bg-white border border-neutral-200 rounded-2xl space-y-3 mt-2 shadow-sm animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Certified High-Res Showroom Assets
              </span>
              <button
                type="button"
                onClick={() => setShowPresets(false)}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
              >
                Done
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STOCK_IMAGE_PRESETS.map((preset) => (
                <div
                  key={preset.url}
                  onClick={() => {
                    onChange(preset.url);
                    setUrlInput(preset.url);
                    setShowPresets(false);
                    setStatusMessage(`Applied preset: ${preset.name}`);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    value === preset.url
                      ? 'border-neutral-950 bg-neutral-900 text-white ring-2 ring-neutral-950'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-400 text-neutral-800'
                  }`}
                >
                  <div className="aspect-4/3 rounded-lg bg-white p-1.5 flex items-center justify-center mb-1.5 overflow-hidden border border-neutral-200/60">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <p className="text-[11px] font-semibold line-clamp-1">{preset.name}</p>
                  <span className="text-[10px] opacity-70 block">{preset.category}</span>
                </div>
              ))}
            </div>
          </div>

          {products.length > 0 && (
            <div className="pt-3 border-t border-neutral-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                Or Pick From Published Products
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
                {products
                  .filter((p) => p.images && p.images.length > 0)
                  .map((prod) => (
                    <button
                      type="button"
                      key={prod.id}
                      onClick={() => {
                        onChange(prod.images[0]);
                        setUrlInput(prod.images[0]);
                        setShowPresets(false);
                        setStatusMessage(`Applied photo from ${prod.name}`);
                      }}
                      className="p-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-400 text-center cursor-pointer transition-all"
                    >
                      <div className="aspect-square rounded-lg bg-white p-1 flex items-center justify-center mb-1 overflow-hidden">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-[10px] font-medium text-neutral-700 truncate">
                        {prod.name}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const AdminHomeEditor: React.FC<AdminHomeEditorProps> = ({
  settings,
  products,
  onSave,
  onResetDefaults,
  onPreview
}) => {
  // Local edit buffer
  const [config, setConfig] = useState<HomePageConfig>(() => {
    return JSON.parse(
      JSON.stringify(
        settings.homeConfig || {
          hero: {
            showHero: true,
            badge: 'Era Gadgets Flagship',
            headline: 'The technology you actually want.',
            subheadline:
              'Discover iPhones, MacBooks, Samsung devices and premium gadgets — carefully selected and ready for you in Nigeria.',
            primaryButtonText: 'Shop iPhone',
            primaryButtonCategory: 'iPhone',
            secondaryButtonText: 'Explore All Products',
            secondaryButtonCategory: 'all',
            heroImage: '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
            heroImageAlt: 'Era Gadgets Flagship iPhone',
            heroImageTag: 'Era Gadgets Flagship',
            heroImageTitle: 'iPhone 17 Pro · Aerospace Titanium',
            heroButtonText: 'Configure & Buy',
            heroProductSlug: 'iphone-17-pro'
          },
          categoriesSection: {
            showSection: true,
            title: 'Curated Collections',
            subtitle: 'Select a category to explore certified hardware.',
            categories: [
              {
                id: 'cat-iphone',
                name: 'iPhone',
                tagline: 'Latest titanium flagships & certified pristine models',
                image: '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
                iconName: 'Smartphone',
                enabled: true
              },
              {
                id: 'cat-mac',
                name: 'Mac',
                tagline: 'MacBook Pro & MacBook Air with Apple M-Series silicon',
                image: '/src/assets/images/showcase_macbook_pro_1790352903234.jpg',
                iconName: 'Laptop',
                enabled: true
              },
              {
                id: 'cat-samsung',
                name: 'Samsung',
                tagline: 'Galaxy S-Series Ultra & revolutionary foldables',
                image: '/src/assets/images/category_samsung_galaxy_1790352913709.jpg',
                iconName: 'Smartphone',
                enabled: true
              },
              {
                id: 'cat-accessories',
                name: 'Accessories',
                tagline: 'AirPods Max, MagSafe power, and studio sound',
                image: '/src/assets/images/accessories_airpods_gadgets_1790352927938.jpg',
                iconName: 'Headphones',
                enabled: true
              }
            ]
          },
          showcase1: {
            showShowcase: true,
            badge: 'Featured Device',
            stockStatus: 'In Stock (VI Showroom)',
            productSlug: 'iphone-17-pro',
            titleOverride: '',
            descriptionOverride: '',
            imageOverride: '',
            buyButtonText: 'Buy Now',
            detailsButtonText: 'View Details'
          },
          showcase2: {
            showShowcase: true,
            badge: 'Pro Workstation',
            headline: 'MacBook Pro. M4 Max powerhouse.',
            description:
              'Built for Nigerian software engineers, 3D artists, film colorists, and power users. Liquid Retina XDR screen, all-day 24-hour battery life, and up to 546GB/s memory bandwidth.',
            image: '/src/assets/images/showcase_macbook_pro_1790352903234.jpg',
            stat1Label: 'Peak Brightness',
            stat1Value: '1,600 nits',
            stat2Label: 'Battery Life',
            stat2Value: '24 Hours',
            stat3Label: 'Starting Price',
            stat3Value: '₦3,850,000',
            primaryButtonText: 'Configure M4 Max',
            primaryButtonSlug: 'macbook-pro-16-m4-max',
            secondaryButtonText: 'Explore Mac Lineup',
            secondaryButtonCategory: 'Mac'
          },
          bestSellers: {
            showSection: true,
            title: 'Popular in Nigeria',
            subtitle: 'Top requested phones and gadgets ready for dispatch today.',
            limit: 4
          },
          showcase3: {
            showShowcase: true,
            badge: 'Android Mastery',
            headline: 'Galaxy S25 Ultra. Titanium perfection.',
            description:
              'Armed with the 200MP Quad Telephoto sensor, anti-reflective Gorilla Armor glass, Snapdragon 8 Elite, and integrated Bluetooth S Pen. Genuine dual-SIM Nigerian-network verified.',
            image: '/src/assets/images/category_samsung_galaxy_1790352913709.jpg',
            pricePrefix: 'Starting from',
            priceValue: '₦2,350,000',
            primaryButtonText: 'View Galaxy S25 Ultra',
            primaryButtonSlug: 'samsung-galaxy-s25-ultra',
            secondaryButtonText: 'All Samsung Phones',
            secondaryButtonCategory: 'Samsung'
          },
          trust: {
            showSection: true,
            title: 'Why shop with Era Gadgets?',
            subtitle: 'Buying high-end electronics in Nigeria should be transparent, safe, and effortless.',
            pillars: [
              {
                id: 'trust-1',
                icon: 'CheckCircle2',
                title: '100% Genuine & Verified',
                description:
                  'Every unit comes with verifiable serial numbers directly checked against Apple or Samsung servers. No refurbished parts disguised as new, no clone screens.'
              },
              {
                id: 'trust-2',
                icon: 'Shield',
                title: 'Transparent Fixed Pricing',
                description:
                  'No daily price hikes or chaotic computer village bargaining. What you see on Era Gadgets is the exact price, inclusive of clear invoice documentation.'
              },
              {
                id: 'trust-3',
                icon: 'Truck',
                title: 'Fast Insured Delivery',
                description:
                  'Express same-day courier dispatch in Lagos, and priority tracked air express to Abuja, Port Harcourt, Kano, and across Nigeria with door-to-door transit protection.'
              }
            ]
          },
          faq: {
            showSection: true,
            title: 'Frequently Asked Questions',
            subtitle: 'Everything you need to know about purchasing with Era Gadgets.',
            items: [
              {
                id: 'faq-1',
                q: 'Are your devices genuinely original and authentic?',
                a: 'Yes, without exception. Every Brand New unit is 100% factory sealed with valid manufacturer serial numbers and original warranties. Our UK/US used devices undergo a rigorous 36-point diagnostic inspection verifying genuine OLED screens, True Tone, Face ID/Touch ID, and pristine original battery health.'
              },
              {
                id: 'faq-2',
                q: 'How fast is delivery across Lagos and other Nigerian states?',
                a: 'Orders within Lagos are dispatched same-day with delivery completed in 2 to 4 hours. Orders to Abuja, Port Harcourt, Ibadan, and other states are shipped via priority courier services (DHL / GIG Logistics) with tracking delivered within 24 to 48 hours.'
              },
              {
                id: 'faq-3',
                q: 'What payment options do you accept?',
                a: 'We support secure online payments via Paystack and Flutterwave, direct bank transfers to our verified corporate bank accounts, and in-person card payments at our Victoria Island showroom.'
              },
              {
                id: 'faq-4',
                q: 'Can I physically inspect a device before taking delivery?',
                a: 'Absolutely. Customers are always welcome at our Victoria Island showroom in Lagos to inspect devices, test Face ID, cameras, and displays in person before completing purchase.'
              },
              {
                id: 'faq-5',
                q: 'What is your warranty policy?',
                a: 'Brand New devices include the full 1-Year official manufacturer warranty. UK Used devices sold by Era Gadgets include a 90-day diagnostic replacement guarantee against technical defects.'
              }
            ]
          },
          newsletter: {
            showSection: true,
            headline: 'Be first to know when new shipments arrive.',
            subheadline:
              'Get instant private alerts on newly cleared iPhone batches, MacBook M4 restocks, and exclusive deals.',
            buttonText: 'Join VIP Drops',
            placeholderText: 'Enter your email address'
          }
        }
      )
    );
  });

  const [activeSection, setActiveSection] = useState<
    | 'hero'
    | 'categories'
    | 'showcase1'
    | 'showcase2'
    | 'bestsellers'
    | 'showcase3'
    | 'trust'
    | 'faq'
    | 'newsletter'
  >('hero');

  // Synchronize internal form buffer whenever settings prop changes (e.g. after load or save or reset)
  React.useEffect(() => {
    if (settings?.homeConfig) {
      setConfig(JSON.parse(JSON.stringify(settings.homeConfig)));
    }
  }, [settings?.homeConfig]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await onSave(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save homepage settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await onResetDefaults();
      setShowResetConfirm(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to reset homepage settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Category card management
  const handleUpdateCategory = (index: number, updates: Partial<HomeCategoryCard>) => {
    const list = [...config.categoriesSection.categories];
    list[index] = { ...list[index], ...updates };
    setConfig({
      ...config,
      categoriesSection: { ...config.categoriesSection, categories: list }
    });
  };

  const handleAddCategory = () => {
    const newCat: HomeCategoryCard = {
      id: `cat-${Date.now()}`,
      name: 'New Collection',
      tagline: 'Curated models and accessories',
      image: '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
      iconName: 'Smartphone',
      enabled: true
    };
    setConfig({
      ...config,
      categoriesSection: {
        ...config.categoriesSection,
        categories: [...config.categoriesSection.categories, newCat]
      }
    });
  };

  const handleDeleteCategory = (index: number) => {
    const list = config.categoriesSection.categories.filter((_, i) => i !== index);
    setConfig({
      ...config,
      categoriesSection: { ...config.categoriesSection, categories: list }
    });
  };

  // Trust pillar management
  const handleUpdatePillar = (index: number, updates: Partial<HomeTrustPillar>) => {
    const list = [...config.trust.pillars];
    list[index] = { ...list[index], ...updates };
    setConfig({
      ...config,
      trust: { ...config.trust, pillars: list }
    });
  };

  const handleAddPillar = () => {
    const newPillar: HomeTrustPillar = {
      id: `trust-${Date.now()}`,
      icon: 'Shield',
      title: 'Certified Reliability',
      description: 'Tested and proven by our certified engineers in Lagos.'
    };
    setConfig({
      ...config,
      trust: { ...config.trust, pillars: [...config.trust.pillars, newPillar] }
    });
  };

  const handleDeletePillar = (index: number) => {
    const list = config.trust.pillars.filter((_, i) => i !== index);
    setConfig({
      ...config,
      trust: { ...config.trust, pillars: list }
    });
  };

  // FAQ management
  const handleUpdateFaq = (index: number, updates: Partial<HomeFaqItem>) => {
    const list = [...config.faq.items];
    list[index] = { ...list[index], ...updates };
    setConfig({
      ...config,
      faq: { ...config.faq, items: list }
    });
  };

  const handleAddFaq = () => {
    const newItem: HomeFaqItem = {
      id: `faq-${Date.now()}`,
      q: 'Do you offer pickup at your Lagos showroom?',
      a: 'Yes, you can select Showroom Pickup at checkout and inspect your unit before paying.'
    };
    setConfig({
      ...config,
      faq: { ...config.faq, items: [...config.faq.items, newItem] }
    });
  };

  const handleDeleteFaq = (index: number) => {
    const list = config.faq.items.filter((_, i) => i !== index);
    setConfig({
      ...config,
      faq: { ...config.faq, items: list }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-neutral-900" />
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">
              Homepage & Visuals Manager
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Customize every headline, image, badge, spotlight product, and content section shown on the Era Gadgets homepage.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPreview}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Homepage</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved Live!' : 'Save Homepage'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>All homepage changes and images have been saved and applied to the store.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
          {saveError}
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex overflow-x-auto gap-1.5 pb-2 border-b border-neutral-200 text-xs no-scrollbar">
        {[
          { id: 'hero', label: '1. Hero Banner', icon: Layers },
          { id: 'categories', label: '2. Curated Categories', icon: Smartphone },
          { id: 'showcase1', label: '3. Spotlight (Flagship)', icon: Sparkles },
          { id: 'showcase2', label: '4. Showcase (MacBook Pro)', icon: Laptop },
          { id: 'bestsellers', label: '5. Best Sellers Grid', icon: Eye },
          { id: 'showcase3', label: '6. Showcase (Galaxy S25)', icon: Smartphone },
          { id: 'trust', label: '7. Trust & Guarantee', icon: Shield },
          { id: 'faq', label: '8. FAQ Accordion', icon: Info },
          { id: 'newsletter', label: '9. VIP Drops', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: HERO BANNER */}
      {activeSection === 'hero' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-950">Hero Banner Configuration</h3>
              <p className="text-xs text-neutral-500">
                The primary banner greeting visitors when they land on Era Gadgets.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-neutral-700">Display Hero Section</span>
              <input
                type="checkbox"
                checked={config.hero.showHero}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, showHero: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-neutral-950 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Hero Badge Text
                </label>
                <input
                  type="text"
                  value={config.hero.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, badge: e.target.value }
                    })
                  }
                  placeholder="e.g. Era Gadgets Flagship"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={config.hero.headline}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, headline: e.target.value }
                    })
                  }
                  placeholder="e.g. The technology you actually want."
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Subheadline / Description
                </label>
                <textarea
                  rows={2}
                  value={config.hero.subheadline}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, subheadline: e.target.value }
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
              <div className="space-y-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Primary Action Button
                </span>
                <div>
                  <label className="text-xs text-neutral-600 block mb-1">Button Label</label>
                  <input
                    type="text"
                    value={config.hero.primaryButtonText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, primaryButtonText: e.target.value }
                      })
                    }
                    className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-600 block mb-1">Target Category Filter</label>
                  <select
                    value={config.hero.primaryButtonCategory}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, primaryButtonCategory: e.target.value }
                      })
                    }
                    className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                  >
                    <option value="all">All Products</option>
                    <option value="iPhone">iPhone</option>
                    <option value="Mac">Mac</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Secondary Action Button
                </span>
                <div>
                  <label className="text-xs text-neutral-600 block mb-1">Button Label</label>
                  <input
                    type="text"
                    value={config.hero.secondaryButtonText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, secondaryButtonText: e.target.value }
                      })
                    }
                    className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-600 block mb-1">Target Category Filter</label>
                  <select
                    value={config.hero.secondaryButtonCategory}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, secondaryButtonCategory: e.target.value }
                      })
                    }
                    className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                  >
                    <option value="all">All Products</option>
                    <option value="iPhone">iPhone</option>
                    <option value="Mac">Mac</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Visual Media Stage */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Hero Image & Interactive Stage
              </h4>

              <ImageField
                label="Hero Image Photo"
                value={config.hero.heroImage}
                onChange={(url) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, heroImage: url }
                  })
                }
                helperText="Appears prominently in the 16:9 hero card. Transparent PNG or studio shot recommended."
                products={products}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Image Tag (Bottom Left)
                  </label>
                  <input
                    type="text"
                    value={config.hero.heroImageTag}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, heroImageTag: e.target.value }
                      })
                    }
                    placeholder="Era Gadgets Flagship"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Image Title Label (Bottom Left)
                  </label>
                  <input
                    type="text"
                    value={config.hero.heroImageTitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, heroImageTitle: e.target.value }
                      })
                    }
                    placeholder="iPhone 17 Pro · Aerospace Titanium"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Corner Button Text
                  </label>
                  <input
                    type="text"
                    value={config.hero.heroButtonText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, heroButtonText: e.target.value }
                      })
                    }
                    placeholder="Configure & Buy"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Linked Product Shortcut
                  </label>
                  <select
                    value={config.hero.heroProductSlug}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, heroProductSlug: e.target.value }
                      })
                    }
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                  >
                    <option value="">No Direct Product (Opens iPhone Category)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name} ({p.condition})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CURATED CATEGORIES */}
      {activeSection === 'categories' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-950">Curated Categories Grid</h3>
              <p className="text-xs text-neutral-500">
                Interactive tiles allowing customers to jump to certified hardware lineups.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-neutral-700">Display Section</span>
              <input
                type="checkbox"
                checked={config.categoriesSection.showSection}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    categoriesSection: {
                      ...config.categoriesSection,
                      showSection: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 accent-neutral-950 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Section Title
              </label>
              <input
                type="text"
                value={config.categoriesSection.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    categoriesSection: {
                      ...config.categoriesSection,
                      title: e.target.value
                    }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={config.categoriesSection.subtitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    categoriesSection: {
                      ...config.categoriesSection,
                      subtitle: e.target.value
                    }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Category Cards ({config.categoriesSection.categories.length})
              </span>
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.categoriesSection.categories.map((cat, index) => (
                <div
                  key={cat.id || index}
                  className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">Card #{index + 1}</span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cat.enabled}
                          onChange={(e) =>
                            handleUpdateCategory(index, { enabled: e.target.checked })
                          }
                          className="w-3.5 h-3.5 accent-neutral-950 rounded cursor-pointer"
                        />
                        <span>Active</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(index)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => handleUpdateCategory(index, { name: e.target.value })}
                        className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                        Icon
                      </label>
                      <select
                        value={cat.iconName}
                        onChange={(e) =>
                          handleUpdateCategory(index, { iconName: e.target.value })
                        }
                        className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                      >
                        {AVAILABLE_ICONS.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={cat.tagline}
                      onChange={(e) => handleUpdateCategory(index, { tagline: e.target.value })}
                      className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                    />
                  </div>

                  <ImageField
                    label="Card Image Photo"
                    value={cat.image}
                    onChange={(url) => handleUpdateCategory(index, { image: url })}
                    products={products}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHOWCASE 1 (Flagship Spotlight) */}
      {activeSection === 'showcase1' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-950">
                Flagship Spotlight (Showcase 1)
              </h3>
              <p className="text-xs text-neutral-500">
                Large editorial feature box displaying a chosen flagship device with live specs, finishes, and direct buy buttons.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-neutral-700">Display Showcase 1</span>
              <input
                type="checkbox"
                checked={config.showcase1.showShowcase}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    showcase1: { ...config.showcase1, showShowcase: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-neutral-950 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Badge Text
              </label>
              <input
                type="text"
                value={config.showcase1.badge}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    showcase1: { ...config.showcase1, badge: e.target.value }
                  })
                }
                placeholder="Featured Device"
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Stock Status Pill
              </label>
              <input
                type="text"
                value={config.showcase1.stockStatus}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    showcase1: { ...config.showcase1, stockStatus: e.target.value }
                  })
                }
                placeholder="In Stock (VI Showroom)"
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-medium text-emerald-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Featured Product to Spotlight
              </label>
              <select
                value={config.showcase1.productSlug}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    showcase1: { ...config.showcase1, productSlug: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name} — {p.brand} ({p.condition})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Title Override (Optional)
              </label>
              <input
                type="text"
                value={config.showcase1.titleOverride || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    showcase1: { ...config.showcase1, titleOverride: e.target.value }
                  })
                }
                placeholder="Leave blank to use the product's actual title"
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Buy Button Text
              </label>
              <input
                type="text"
                value={config.showcase1.buyButtonText}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    showcase1: { ...config.showcase1, buyButtonText: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Description Override (Optional)
              </label>
              <textarea
                rows={2}
                value={config.showcase1.descriptionOverride || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    showcase1: { ...config.showcase1, descriptionOverride: e.target.value }
                  })
                }
                placeholder="Leave blank to use the product's actual description"
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageField
                label="Custom Image Override (Optional)"
                value={config.showcase1.imageOverride || ''}
                onChange={(url) =>
                  setConfig({
                    ...config,
                    showcase1: { ...config.showcase1, imageOverride: url }
                  })
                }
                helperText="Leave empty to use the selected product's default hero photo."
                products={products}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SHOWCASE 2 (MacBook Pro Workstation) */}
      {activeSection === 'showcase2' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-950">
                Pro Workstation Showcase 2 (MacBook Pro)
              </h3>
              <p className="text-xs text-neutral-500">
                The dark-mode high-performance computer showcase spotlighting Pro hardware.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-neutral-700">Display Showcase 2</span>
              <input
                type="checkbox"
                checked={config.showcase2.showShowcase}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    showcase2: { ...config.showcase2, showShowcase: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-neutral-950 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={config.showcase2.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase2: { ...config.showcase2, badge: e.target.value }
                    })
                  }
                  placeholder="Pro Workstation"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={config.showcase2.headline}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase2: { ...config.showcase2, headline: e.target.value }
                    })
                  }
                  placeholder="MacBook Pro. M4 Max powerhouse."
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={config.showcase2.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase2: { ...config.showcase2, description: e.target.value }
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <ImageField
              label="Workstation Photo"
              value={config.showcase2.image}
              onChange={(url) =>
                setConfig({
                  ...config,
                  showcase2: { ...config.showcase2, image: url }
                })
              }
              products={products}
            />

            {/* Performance Stats */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-3">
                Key Performance Metrics (3 Stats)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Stat #1</span>
                  <input
                    type="text"
                    value={config.showcase2.stat1Label}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showcase2: { ...config.showcase2, stat1Label: e.target.value }
                      })
                    }
                    placeholder="Peak Brightness"
                    className="w-full p-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={config.showcase2.stat1Value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showcase2: { ...config.showcase2, stat1Value: e.target.value }
                      })
                    }
                    placeholder="1,600 nits"
                    className="w-full p-2 border border-neutral-300 rounded-lg text-xs font-bold bg-white"
                  />
                </div>

                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Stat #2</span>
                  <input
                    type="text"
                    value={config.showcase2.stat2Label}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showcase2: { ...config.showcase2, stat2Label: e.target.value }
                      })
                    }
                    placeholder="Battery Life"
                    className="w-full p-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={config.showcase2.stat2Value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showcase2: { ...config.showcase2, stat2Value: e.target.value }
                      })
                    }
                    placeholder="24 Hours"
                    className="w-full p-2 border border-neutral-300 rounded-lg text-xs font-bold bg-white"
                  />
                </div>

                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Stat #3</span>
                  <input
                    type="text"
                    value={config.showcase2.stat3Label}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showcase2: { ...config.showcase2, stat3Label: e.target.value }
                      })
                    }
                    placeholder="Starting Price"
                    className="w-full p-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={config.showcase2.stat3Value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showcase2: { ...config.showcase2, stat3Value: e.target.value }
                      })
                    }
                    placeholder="₦3,850,000"
                    className="w-full p-2 border border-neutral-300 rounded-lg text-xs font-bold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={config.showcase2.primaryButtonText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase2: { ...config.showcase2, primaryButtonText: e.target.value }
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Linked Product
                </label>
                <select
                  value={config.showcase2.primaryButtonSlug}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase2: { ...config.showcase2, primaryButtonSlug: e.target.value }
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} ({p.condition})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BEST SELLERS */}
      {activeSection === 'bestsellers' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-950">
                Best Sellers & Popular Grid
              </h3>
              <p className="text-xs text-neutral-500">
                Displays top requested gadgets ready for immediate dispatch across Nigeria.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-neutral-700">Display Section</span>
              <input
                type="checkbox"
                checked={config.bestSellers.showSection}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    bestSellers: { ...config.bestSellers, showSection: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-neutral-950 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={config.bestSellers.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    bestSellers: { ...config.bestSellers, title: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Subtitle Description
              </label>
              <input
                type="text"
                value={config.bestSellers.subtitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    bestSellers: { ...config.bestSellers, subtitle: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Number of Products to Display
              </label>
              <input
                type="number"
                min={2}
                max={16}
                value={config.bestSellers.limit}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    bestSellers: { ...config.bestSellers, limit: Number(e.target.value) || 4 }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SHOWCASE 3 (Galaxy S25 Ultra) */}
      {activeSection === 'showcase3' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-950">
                Android Mastery Showcase 3 (Galaxy S25 Ultra)
              </h3>
              <p className="text-xs text-neutral-500">
                Editorial showcase for high-end Android flagships and foldables.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-neutral-700">Display Showcase 3</span>
              <input
                type="checkbox"
                checked={config.showcase3.showShowcase}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    showcase3: { ...config.showcase3, showShowcase: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-neutral-950 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={config.showcase3.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase3: { ...config.showcase3, badge: e.target.value }
                    })
                  }
                  placeholder="Android Mastery"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={config.showcase3.headline}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase3: { ...config.showcase3, headline: e.target.value }
                    })
                  }
                  placeholder="Galaxy S25 Ultra. Titanium perfection."
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={config.showcase3.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase3: { ...config.showcase3, description: e.target.value }
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <ImageField
              label="Device Photo"
              value={config.showcase3.image}
              onChange={(url) =>
                setConfig({
                  ...config,
                  showcase3: { ...config.showcase3, image: url }
                })
              }
              products={products}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Price Prefix
                </label>
                <input
                  type="text"
                  value={config.showcase3.pricePrefix}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase3: { ...config.showcase3, pricePrefix: e.target.value }
                    })
                  }
                  placeholder="Starting from"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Displayed Price String
                </label>
                <input
                  type="text"
                  value={config.showcase3.priceValue}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase3: { ...config.showcase3, priceValue: e.target.value }
                    })
                  }
                  placeholder="₦2,350,000"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={config.showcase3.primaryButtonText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase3: { ...config.showcase3, primaryButtonText: e.target.value }
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Target Product
                </label>
                <select
                  value={config.showcase3.primaryButtonSlug}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showcase3: { ...config.showcase3, primaryButtonSlug: e.target.value }
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} ({p.condition})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TRUST PILLARS */}
      {activeSection === 'trust' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-950">
                Why Era Gadgets (Trust Pillars)
              </h3>
              <p className="text-xs text-neutral-500">
                Reassure prospective customers regarding serial verification, fixed pricing, and insured delivery.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-neutral-700">Display Section</span>
              <input
                type="checkbox"
                checked={config.trust.showSection}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    trust: { ...config.trust, showSection: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-neutral-950 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Section Title
              </label>
              <input
                type="text"
                value={config.trust.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    trust: { ...config.trust, title: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={config.trust.subtitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    trust: { ...config.trust, subtitle: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Pillars List */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Trust Cards ({config.trust.pillars.length})
              </span>
              <button
                type="button"
                onClick={handleAddPillar}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pillar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.trust.pillars.map((pillar, index) => (
                <div
                  key={pillar.id || index}
                  className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">Pillar #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePillar(index)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Icon
                    </label>
                    <select
                      value={pillar.icon}
                      onChange={(e) => handleUpdatePillar(index, { icon: e.target.value })}
                      className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                    >
                      {AVAILABLE_ICONS.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Pillar Title
                    </label>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => handleUpdatePillar(index, { title: e.target.value })}
                      className="w-full p-2 border border-neutral-300 rounded-xl text-xs font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={pillar.description}
                      onChange={(e) =>
                        handleUpdatePillar(index, { description: e.target.value })
                      }
                      className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: FAQ */}
      {activeSection === 'faq' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-950">FAQ Accordion Section</h3>
              <p className="text-xs text-neutral-500">
                Answer common questions regarding warranties, inspections, delivery, and payment.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-neutral-700">Display FAQ</span>
              <input
                type="checkbox"
                checked={config.faq.showSection}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    faq: { ...config.faq, showSection: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-neutral-950 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Section Title
              </label>
              <input
                type="text"
                value={config.faq.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    faq: { ...config.faq, title: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={config.faq.subtitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    faq: { ...config.faq, subtitle: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                FAQ Items ({config.faq.items.length})
              </span>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.faq.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">Q#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(index)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={item.q}
                      onChange={(e) => handleUpdateFaq(index, { q: e.target.value })}
                      className="w-full p-2 border border-neutral-300 rounded-xl text-xs font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Answer
                    </label>
                    <textarea
                      rows={2}
                      value={item.a}
                      onChange={(e) => handleUpdateFaq(index, { a: e.target.value })}
                      className="w-full p-2 border border-neutral-300 rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: VIP NEWSLETTER */}
      {activeSection === 'newsletter' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-950">
                VIP Newsletter / Restock Drops
              </h3>
              <p className="text-xs text-neutral-500">
                Call to action for customer email leads to receive private shipment restock notifications.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-neutral-700">Display Newsletter</span>
              <input
                type="checkbox"
                checked={config.newsletter.showSection}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    newsletter: { ...config.newsletter, showSection: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-neutral-950 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Headline
              </label>
              <input
                type="text"
                value={config.newsletter.headline}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    newsletter: { ...config.newsletter, headline: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Subheadline
              </label>
              <textarea
                rows={2}
                value={config.newsletter.subheadline}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    newsletter: { ...config.newsletter, subheadline: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={config.newsletter.buttonText}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    newsletter: { ...config.newsletter, buttonText: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Placeholder Text
              </label>
              <input
                type="text"
                value={config.newsletter.placeholderText}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    newsletter: { ...config.newsletter, placeholderText: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-100">
            <h3 className="text-base font-bold text-neutral-950">
              Reset Homepage to Factory Defaults?
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              This will reset all homepage headlines, badges, showcase selections, and image links back to the original Era Gadgets setup. Any custom text you entered will be replaced.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Yes, Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
