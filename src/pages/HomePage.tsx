import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { formatNaira } from '../lib/utils';
import {
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Settings as SettingsIcon
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Sparkles,
  Shield,
  Truck,
  CheckCircle2,
  RotateCcw
};

export const HomePage: React.FC = () => {
  const {
    products,
    settings,
    setCurrentView,
    setCurrentCategoryFilter,
    openProduct,
    addToCart,
    isAdmin,
    setAdminActiveTab
  } = useStore();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Home section dynamic configuration from backend settings
  const homeConfig = settings?.homeConfig;

  // 1. HERO CONFIG
  const hero = {
    showHero: homeConfig?.hero?.showHero ?? true,
    badge: homeConfig?.hero?.badge || 'Era Gadgets Flagship',
    headline: homeConfig?.hero?.headline || 'The technology you actually want.',
    subheadline:
      homeConfig?.hero?.subheadline ||
      'Discover iPhones, MacBooks, Samsung devices and premium gadgets — carefully selected and ready for you in Nigeria.',
    primaryButtonText: homeConfig?.hero?.primaryButtonText || 'Shop iPhone',
    primaryButtonCategory: homeConfig?.hero?.primaryButtonCategory || 'iPhone',
    secondaryButtonText: homeConfig?.hero?.secondaryButtonText || 'Explore All Products',
    secondaryButtonCategory: homeConfig?.hero?.secondaryButtonCategory || 'all',
    heroImage:
      homeConfig?.hero?.heroImage || '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
    heroImageAlt: homeConfig?.hero?.heroImageAlt || 'Era Gadgets Flagship iPhone',
    heroImageTag: homeConfig?.hero?.heroImageTag || 'Era Gadgets Flagship',
    heroImageTitle: homeConfig?.hero?.heroImageTitle || 'iPhone 17 Pro · Aerospace Titanium',
    heroButtonText: homeConfig?.hero?.heroButtonText || 'Configure & Buy',
    heroProductSlug: homeConfig?.hero?.heroProductSlug || 'iphone-17-pro'
  };

  // 2. CATEGORIES CONFIG
  const categoriesSection = {
    showSection: homeConfig?.categoriesSection?.showSection ?? true,
    title: homeConfig?.categoriesSection?.title || 'Curated Collections',
    subtitle: homeConfig?.categoriesSection?.subtitle || 'Select a category to explore certified hardware.',
    categories: (
      homeConfig?.categoriesSection?.categories || [
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
    ).filter((c) => c.enabled !== false)
  };

  // 3. SHOWCASE 1 (Flagship Spotlight)
  const showcase1 = {
    showShowcase: homeConfig?.showcase1?.showShowcase ?? true,
    badge: homeConfig?.showcase1?.badge || 'Featured Device',
    stockStatus: homeConfig?.showcase1?.stockStatus || 'In Stock (VI Showroom)',
    productSlug: homeConfig?.showcase1?.productSlug || 'iphone-17-pro',
    titleOverride: homeConfig?.showcase1?.titleOverride || '',
    descriptionOverride: homeConfig?.showcase1?.descriptionOverride || '',
    imageOverride: homeConfig?.showcase1?.imageOverride || '',
    buyButtonText: homeConfig?.showcase1?.buyButtonText || 'Buy Now',
    detailsButtonText: homeConfig?.showcase1?.detailsButtonText || 'View Details'
  };

  const showcase1Product =
    products.find((p) => p.slug === showcase1.productSlug || p.id === showcase1.productSlug) ||
    products[0];

  // 4. SHOWCASE 2 (Pro Workstation / MacBook Pro)
  const showcase2 = {
    showShowcase: homeConfig?.showcase2?.showShowcase ?? true,
    badge: homeConfig?.showcase2?.badge || 'Pro Workstation',
    headline: homeConfig?.showcase2?.headline || 'MacBook Pro. M4 Max powerhouse.',
    description:
      homeConfig?.showcase2?.description ||
      'Built for Nigerian software engineers, 3D artists, film colorists, and power users. Liquid Retina XDR screen, all-day 24-hour battery life, and up to 546GB/s memory bandwidth.',
    image:
      homeConfig?.showcase2?.image || '/src/assets/images/showcase_macbook_pro_1790352903234.jpg',
    stat1Label: homeConfig?.showcase2?.stat1Label || 'Peak Brightness',
    stat1Value: homeConfig?.showcase2?.stat1Value || '1,600 nits',
    stat2Label: homeConfig?.showcase2?.stat2Label || 'Battery Life',
    stat2Value: homeConfig?.showcase2?.stat2Value || '24 Hours',
    stat3Label: homeConfig?.showcase2?.stat3Label || 'Starting Price',
    stat3Value: homeConfig?.showcase2?.stat3Value || '₦3,850,000',
    primaryButtonText: homeConfig?.showcase2?.primaryButtonText || 'Configure M4 Max',
    primaryButtonSlug: homeConfig?.showcase2?.primaryButtonSlug || 'macbook-pro-16-m4-max',
    secondaryButtonText: homeConfig?.showcase2?.secondaryButtonText || 'Explore Mac Lineup',
    secondaryButtonCategory: homeConfig?.showcase2?.secondaryButtonCategory || 'Mac'
  };

  // 5. BEST SELLERS
  const bestSellersSection = {
    showSection: homeConfig?.bestSellers?.showSection ?? true,
    title: homeConfig?.bestSellers?.title || 'Popular in Nigeria',
    subtitle:
      homeConfig?.bestSellers?.subtitle ||
      'Top requested phones and gadgets ready for dispatch today.',
    limit: homeConfig?.bestSellers?.limit || 4
  };

  const bestSellersList = products
    .filter((p) => p.featured || p.badge === 'Best Seller' || p.status === 'Published')
    .slice(0, bestSellersSection.limit);

  // 6. SHOWCASE 3 (Android Mastery / Galaxy)
  const showcase3 = {
    showShowcase: homeConfig?.showcase3?.showShowcase ?? true,
    badge: homeConfig?.showcase3?.badge || 'Android Mastery',
    headline: homeConfig?.showcase3?.headline || 'Galaxy S25 Ultra. Titanium perfection.',
    description:
      homeConfig?.showcase3?.description ||
      'Armed with the 200MP Quad Telephoto sensor, anti-reflective Gorilla Armor glass, Snapdragon 8 Elite, and integrated Bluetooth S Pen. Genuine dual-SIM Nigerian-network verified.',
    image:
      homeConfig?.showcase3?.image || '/src/assets/images/category_samsung_galaxy_1790352913709.jpg',
    pricePrefix: homeConfig?.showcase3?.pricePrefix || 'Starting from',
    priceValue: homeConfig?.showcase3?.priceValue || '₦2,350,000',
    primaryButtonText: homeConfig?.showcase3?.primaryButtonText || 'View Galaxy S25 Ultra',
    primaryButtonSlug: homeConfig?.showcase3?.primaryButtonSlug || 'samsung-galaxy-s25-ultra',
    secondaryButtonText: homeConfig?.showcase3?.secondaryButtonText || 'All Samsung Phones',
    secondaryButtonCategory: homeConfig?.showcase3?.secondaryButtonCategory || 'Samsung'
  };

  // 7. TRUST PILLARS
  const trustSection = {
    showSection: homeConfig?.trust?.showSection ?? true,
    title: homeConfig?.trust?.title || 'Why shop with Era Gadgets?',
    subtitle:
      homeConfig?.trust?.subtitle ||
      'Buying high-end electronics in Nigeria should be transparent, safe, and effortless.',
    pillars: homeConfig?.trust?.pillars || [
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
  };

  // 8. FAQS
  const faqSection = {
    showSection: homeConfig?.faq?.showSection ?? true,
    title: homeConfig?.faq?.title || 'Frequently Asked Questions',
    subtitle:
      homeConfig?.faq?.subtitle ||
      'Everything you need to know about purchasing with Era Gadgets.',
    items: homeConfig?.faq?.items || [
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
        a: 'We support secure online payments via Paystack and Flutterwave (debit cards, USSD, Apple Pay where available), direct bank transfers to our verified corporate bank accounts, and in-person card payments at our Victoria Island showroom.'
      },
      {
        id: 'faq-4',
        q: 'Can I physically inspect a device before taking delivery?',
        a: 'Absolutely. Customers are always welcome at our Victoria Island showroom in Lagos to inspect devices, test Face ID, cameras, and displays in person before completing purchase.'
      },
      {
        id: 'faq-5',
        q: 'What is your warranty policy?',
        a: 'Brand New devices include the full 1-Year official manufacturer warranty (Apple Care / Samsung Care). UK Used devices sold by Era Gadgets include a 90-day diagnostic replacement guarantee against technical defects.'
      }
    ]
  };

  // 9. VIP NEWSLETTER
  const newsletterSection = {
    showSection: homeConfig?.newsletter?.showSection ?? true,
    headline: homeConfig?.newsletter?.headline || 'Be first to know when new shipments arrive.',
    subheadline:
      homeConfig?.newsletter?.subheadline ||
      'Get instant private alerts on newly cleared iPhone batches, MacBook M4 restocks, and exclusive deals.',
    buttonText: homeConfig?.newsletter?.buttonText || 'Join VIP Drops',
    placeholderText: homeConfig?.newsletter?.placeholderText || 'Enter your email address'
  };

  const handleCategoryClick = (categoryName: string) => {
    setCurrentCategoryFilter(categoryName);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-20 sm:space-y-32 pb-24 relative">
      {/* Admin Fast Edit Bar */}
      {isAdmin && (
        <aside aria-label="Admin controls" className="fixed top-20 right-6 z-30">
          <button
            onClick={() => {
              setAdminActiveTab('homepage');
              setCurrentView('admin');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950/90 hover:bg-neutral-900 text-amber-400 text-xs font-bold rounded-full shadow-lg backdrop-blur-md border border-amber-400/20 transition-all hover:scale-105 cursor-pointer"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Customize Homepage & Images</span>
          </button>
        </aside>
      )}

      {/* 1. HERO SECTION */}
      {hero.showHero && (
        <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-[#FBFBFB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              {hero.badge && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-[11px] font-bold tracking-wider uppercase text-neutral-700 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{hero.badge}</span>
                </div>
              )}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-950 text-balance leading-[1.08]">
                {hero.headline}
              </h1>
              <p className="text-base sm:text-xl text-neutral-600 font-normal max-w-2xl mx-auto leading-relaxed text-balance">
                {hero.subheadline}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => handleCategoryClick(hero.primaryButtonCategory)}
                  className="px-6 py-3 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                >
                  {hero.primaryButtonText}
                </button>
                <button
                  onClick={() => {
                    setCurrentCategoryFilter(hero.secondaryButtonCategory);
                    setCurrentView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  {hero.secondaryButtonText}
                </button>
              </div>
            </div>

            {/* Hero Visual Stage */}
            <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
              <div className="relative aspect-16/9 rounded-3xl overflow-hidden bg-gradient-to-b from-[#F2F2F2] to-[#EAEAEA] border border-neutral-200/70 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.06)] flex items-center justify-center p-4 sm:p-10">
                <img
                  src={hero.heroImage}
                  alt={hero.heroImageAlt}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/src/assets/images/hero_iphone_flagship_1790352890898.jpg';
                  }}
                  className="w-full h-full object-contain scale-100 hover:scale-102 transition-transform duration-700 ease-out"
                />
                <div className="absolute bottom-5 sm:bottom-8 left-6 sm:left-10 text-left">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500">
                    {hero.heroImageTag}
                  </span>
                  <p className="text-sm sm:text-lg font-bold text-neutral-950">
                    {hero.heroImageTitle}
                  </p>
                </div>
                <div className="absolute bottom-5 sm:bottom-8 right-6 sm:right-10 text-right">
                  <button
                    onClick={() => {
                      if (hero.heroProductSlug) {
                        openProduct(hero.heroProductSlug);
                      } else {
                        handleCategoryClick('iPhone');
                      }
                    }}
                    className="px-4 py-2 bg-white/90 hover:bg-white text-neutral-900 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md transition-colors cursor-pointer"
                  >
                    {hero.heroButtonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. EDITORIAL FEATURED SHOWCASE 1 */}
      {showcase1.showShowcase && showcase1Product && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-neutral-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-center">
              {/* Product Visual */}
              <div className="lg:col-span-7 bg-[#F7F7F6] rounded-2xl p-6 sm:p-10 flex items-center justify-center aspect-4/3 relative overflow-hidden group">
                <img
                  src={showcase1.imageOverride || showcase1Product.images[0] || hero.heroImage}
                  alt={showcase1.titleOverride || showcase1Product.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = showcase1Product.images[0] || '/src/assets/images/hero_iphone_flagship_1790352890898.jpg';
                  }}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-semibold text-neutral-800 bg-white/90 px-3 py-1 rounded-full shadow-2xs backdrop-blur-md">
                    {showcase1.badge}
                  </span>
                </div>
              </div>

              {/* Product Information */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
                    <span>{showcase1Product.brand}</span>
                    <span>·</span>
                    <span>{showcase1Product.condition}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium">{showcase1.stockStatus}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
                    {showcase1.titleOverride || showcase1Product.name}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                    {showcase1.descriptionOverride || showcase1Product.shortDescription || showcase1Product.description}
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-neutral-100">
                  {/* Price */}
                  <div>
                    <span className="text-xs text-neutral-500">Starting from</span>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-950 tabular-nums">
                      {formatNaira(showcase1Product.basePrice)}
                    </div>
                  </div>

                  {/* Colors */}
                  {showcase1Product.variants && showcase1Product.variants.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-neutral-700">Available Finishes</span>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {showcase1Product.variants.slice(0, 4).map((v) => (
                          <div
                            key={v.id}
                            title={`${v.color?.name || ''} (${v.storage || ''})`}
                            className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-100 pr-2.5 text-xs text-neutral-700"
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/20"
                              style={{ backgroundColor: v.color?.hex || '#111' }}
                            />
                            <span className="text-[11px] font-medium">{v.color?.name || 'Standard'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Storage Options */}
                  {showcase1Product.variants && (
                    <div>
                      <span className="text-xs font-semibold text-neutral-700">Capacities</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.from(new Set(showcase1Product.variants.map((v) => v.storage).filter(Boolean))).map(
                          (storage) => (
                            <span
                              key={storage}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-neutral-100 text-neutral-800"
                            >
                              {storage}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (showcase1Product.variants[0]) {
                        addToCart(showcase1Product, showcase1Product.variants[0]);
                      }
                    }}
                    className="flex-1 py-3 px-6 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors text-center shadow-xs cursor-pointer"
                  >
                    {showcase1.buyButtonText}
                  </button>
                  <button
                    onClick={() => openProduct(showcase1Product.slug)}
                    className="flex-1 py-3 px-6 rounded-full bg-neutral-100 text-neutral-900 text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-colors text-center cursor-pointer"
                  >
                    {showcase1.detailsButtonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. CATEGORY SHOWCASE TILES */}
      {categoriesSection.showSection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
                {categoriesSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {categoriesSection.subtitle}
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentCategoryFilter('all');
                setCurrentView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm font-semibold text-neutral-950 hover:text-neutral-600 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categoriesSection.categories.map((cat) => {
              const Icon = ICON_MAP[cat.iconName] || Smartphone;
              const productCount = products.filter(
                (p) => p.category.toLowerCase() === cat.name.toLowerCase()
              ).length;

              return (
                <div
                  key={cat.id || cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group cursor-pointer rounded-2xl bg-white p-5 border border-neutral-100 hover:border-neutral-200 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="aspect-4/3 rounded-xl bg-[#F8F8F7] p-4 flex items-center justify-center overflow-hidden mb-4">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = '/src/assets/images/hero_iphone_flagship_1790352890898.jpg';
                      }}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                      <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                        <Icon className="w-3.5 h-3.5" />
                        {cat.name}
                      </span>
                      <span>{productCount} models</span>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-1">{cat.tagline}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. MACBOOK PRO WORKSTATION EDITORIAL SPOTLIGHT */}
      {showcase2.showShowcase && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-14 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
                  {showcase2.badge}
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                  {showcase2.headline}
                </h2>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-light">
                  {showcase2.description}
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800 text-left">
                  <div>
                    <span className="text-[11px] text-neutral-500">{showcase2.stat1Label}</span>
                    <p className="text-base sm:text-xl font-bold text-white tabular-nums">
                      {showcase2.stat1Value}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500">{showcase2.stat2Label}</span>
                    <p className="text-base sm:text-xl font-bold text-white tabular-nums">
                      {showcase2.stat2Value}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500">{showcase2.stat3Label}</span>
                    <p className="text-base sm:text-xl font-bold text-white tabular-nums">
                      {showcase2.stat3Value}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (showcase2.primaryButtonSlug) {
                        openProduct(showcase2.primaryButtonSlug);
                      } else {
                        handleCategoryClick(showcase2.secondaryButtonCategory);
                      }
                    }}
                    className="px-6 py-3 rounded-full bg-white text-neutral-950 text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    {showcase2.primaryButtonText}
                  </button>
                  <button
                    onClick={() => handleCategoryClick(showcase2.secondaryButtonCategory)}
                    className="px-6 py-3 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors border border-neutral-800 cursor-pointer"
                  >
                    {showcase2.secondaryButtonText}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-4/3 flex items-center justify-center p-4">
                <img
                  src={showcase2.image}
                  alt={showcase2.headline}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/src/assets/images/showcase_macbook_pro_1790352903234.jpg';
                  }}
                  className="w-full h-full object-contain rounded-xl hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. BEST SELLERS CURATED GRID */}
      {bestSellersSection.showSection && bestSellersList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
                {bestSellersSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {bestSellersSection.subtitle}
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentCategoryFilter('all');
                setCurrentView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm font-semibold text-neutral-950 hover:text-neutral-600 flex items-center gap-1 cursor-pointer"
            >
              <span>Browse Full Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bestSellersList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. SAMSUNG GALAXY SHOWCASE 3 */}
      {showcase3.showShowcase && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F6F6F5] rounded-3xl p-6 sm:p-12 border border-neutral-200/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-center">
              <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-4/3 flex items-center justify-center p-4">
                <img
                  src={showcase3.image}
                  alt={showcase3.headline}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/src/assets/images/category_samsung_galaxy_1790352913709.jpg';
                  }}
                  className="w-full h-full object-contain mix-blend-multiply hover:scale-102 transition-transform duration-500"
                />
              </div>

              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
                  {showcase3.badge}
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
                  {showcase3.headline}
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
                  {showcase3.description}
                </p>

                <div className="pt-2">
                  <div className="text-xs text-neutral-500">{showcase3.pricePrefix}</div>
                  <div className="text-2xl sm:text-3xl font-bold text-neutral-950 tabular-nums">
                    {showcase3.priceValue}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (showcase3.primaryButtonSlug) {
                        openProduct(showcase3.primaryButtonSlug);
                      } else {
                        handleCategoryClick(showcase3.secondaryButtonCategory);
                      }
                    }}
                    className="px-6 py-3 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    {showcase3.primaryButtonText}
                  </button>
                  <button
                    onClick={() => handleCategoryClick(showcase3.secondaryButtonCategory)}
                    className="px-6 py-3 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 text-xs sm:text-sm font-semibold transition-colors border border-neutral-200 cursor-pointer"
                  >
                    {showcase3.secondaryButtonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. WHY ERA GADGETS (TRUST SECTION) */}
      {trustSection.showSection && (
        <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              {trustSection.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
              {trustSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {trustSection.pillars.map((pillar) => {
              const Icon = ICON_MAP[pillar.icon] || CheckCircle2;
              return (
                <div
                  key={pillar.id || pillar.title}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-100 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-950">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. FAQ ACCORDION */}
      {faqSection.showSection && (
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              {faqSection.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              {faqSection.subtitle}
            </p>
          </div>

          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {faqSection.items.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={faq.id || index} className="py-4 sm:py-5">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-neutral-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-neutral-900' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed pr-6">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 9. VIP DROP NOTIFICATIONS */}
      {newsletterSection.showSection && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F8F8F7] rounded-3xl p-8 sm:p-12 text-center border border-neutral-200/60 space-y-4">
            <Sparkles className="w-6 h-6 mx-auto text-neutral-800" />
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
              {newsletterSection.headline}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              {newsletterSection.subheadline}
            </p>

            {newsletterSubmitted ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl inline-block">
                Thank you! You are on our priority VIP announcement list.
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={newsletterSection.placeholderText}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-neutral-900"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {newsletterSection.buttonText}
                </button>
              </form>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
