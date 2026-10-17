import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  Product,
  Order,
  Review,
  StoreSettings,
  HomePageConfig,
  CustomerCRM,
  Lead,
  AdminNotification,
  PaymentAuditLog,
  EmailLog,
  EmailConfig,
  PushSubscriptionRecord
} from '../src/types.ts';
import {
  sendOrderNotificationEmail,
  sendPaymentProofNotificationEmail,
  sendLowStockNotificationEmail,
  sendLeadNotificationEmail,
  getAdminNotificationRecipients
} from './mailer.ts';
import { firestoreDb } from '../src/lib/firebase.ts';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { INITIAL_CATALOG } from './initialCatalog.ts';

const DATA_FILE = path.resolve(process.cwd(), 'store_data.json');

const UPLOAD_DIRS = [
  path.resolve(process.cwd(), 'public/uploads'),
  path.resolve(process.cwd(), 'src/assets/uploads')
];
for (const dir of UPLOAD_DIRS) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
}

export const DEFAULT_HOME_CONFIG: HomePageConfig = {
  hero: {
    showHero: true,
    badge: 'Era Gadgets Flagship',
    headline: 'The technology you actually want.',
    subheadline: 'Discover iPhones, MacBooks, Samsung devices and premium gadgets — carefully selected and ready for you in Nigeria.',
    primaryButtonText: 'Shop iPhone',
    primaryButtonCategory: 'iPhone',
    secondaryButtonText: 'Explore All Products',
    secondaryButtonCategory: 'all',
    heroImage: '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
    heroImageAlt: 'Era Gadgets Flagship iPhone 17 Pro',
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
    description: 'Built for Nigerian software engineers, 3D artists, film colorists, and power users. Liquid Retina XDR screen, all-day 24-hour battery life, and up to 546GB/s memory bandwidth.',
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
    description: 'Armed with the 200MP Quad Telephoto sensor, anti-reflective Gorilla Armor glass, Snapdragon 8 Elite, and integrated Bluetooth S Pen. Genuine dual-SIM Nigerian-network verified.',
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
        description: 'Every unit comes with verifiable serial numbers directly checked against Apple or Samsung servers. No refurbished parts disguised as new, no clone screens.'
      },
      {
        id: 'trust-2',
        icon: 'Shield',
        title: 'Transparent Fixed Pricing',
        description: 'No daily price hikes or chaotic computer village bargaining. What you see on Era Gadgets is the exact price, inclusive of clear invoice documentation.'
      },
      {
        id: 'trust-3',
        icon: 'Truck',
        title: 'Fast Insured Delivery',
        description: 'Express same-day courier dispatch in Lagos, and priority tracked air express to Abuja, Port Harcourt, Kano, and across Nigeria with door-to-door transit protection.'
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
  },
  newsletter: {
    showSection: true,
    headline: 'Be first to know when new shipments arrive.',
    subheadline: 'Get instant private alerts on newly cleared iPhone batches, MacBook M4 restocks, and exclusive deals.',
    buttonText: 'Join VIP Drops',
    placeholderText: 'Enter your email address'
  }
};

const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'Era Gadgets',
  tagline: 'The technology you actually want.',
  phone: '+234 903 642 2181',
  whatsappNumber: '2349036422181',
  email: 'concierge@eragadgets.ng',
  orderNotificationEmail: 'iwuajokuchidera64@gmail.com',
  emailConfig: {
    orderNotificationEmail: 'iwuajokuchidera64@gmail.com',
    enabled: true,
    fromName: 'Era Gadgets Orders',
    fromEmail: 'orders@eragadgets.ng',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpSecure: false
  },
  address: 'Victoria Island Flagship Showroom, Lagos, Nigeria',
  openingHours: 'Mon – Sat: 9:00 AM – 7:30 PM WAT',
  currency: 'NGN',
  currencySymbol: '₦',
  deliveryFee: 5000,
  lagosDeliveryFee: 5000,
  outsideLagosDeliveryFee: 5000,
  pickupFee: 0,
  freeDeliveryThreshold: 3500000,
  showSoldProductsOnWebsite: true,
  storeMaintenanceMode: false,
  maintenanceMessage: "We're currently performing a scheduled inventory audit. Ordering will resume shortly.",
  invoicePrefix: 'INV-EG-',
  orderPrefix: 'EG-2026-',
  reservationMinutes: 60,
  homeConfig: DEFAULT_HOME_CONFIG,
  paymentMethods: {
    bankTransfer: {
      enabled: true,
      bankName: 'Kuda MFB',
      accountName: 'Chidera Kelvin',
      accountNumber: '2064248680',
      sortCode: '',
      instructions: 'Please transfer the exact amount shown to the Kuda MFB account above. Use your order number as reference.',
      notes: 'Payment verification takes 5 to 15 minutes during showroom operating hours.'
    },
    paystack: {
      enabled: false,
      publicKey: 'pk_test_eragadgets_live_prep',
      secretKey: 'sk_test_eragadgets_secret_key'
    },
    flutterwave: {
      enabled: false,
      publicKey: 'flw_pub_test_eragadgets'
    },
    cashOnDelivery: {
      enabled: false,
      notes: 'Available for verified repeat corporate clients within Victoria Island & Ikoyi only.'
    },
    payAtPickup: {
      enabled: false,
      notes: 'Inspect and test your gadget at our Victoria Island showroom before completing payment.'
    }
  },
  whatsappConfig: {
    ownerWhatsApp: '2349036422181',
    provider: 'link_fallback',
    autoNotifyOwnerOnOrder: true,
    autoNotifyCustomerOnStatus: true,
    templates: {
      newOrderOwner: `*NEW ERA GADGETS ORDER*
Order: {{order_number}}
Invoice: {{invoice_number}}
Customer: {{customer_name}}
Phone: {{customer_phone}}
WhatsApp: {{customer_whatsapp}}
Product: {{product_name}}
Storage: {{storage}}
Color: {{color}}
Condition: {{condition}}
Quantity: {{quantity}}
Order Total: {{total}}
Payment Method: {{payment_method}}
Payment Status: {{payment_status}}
Delivery: {{delivery_address}}
Invoice Link: {{invoice_link}}`,
      orderConfirmedCustomer: `Hello {{customer_name}}, your Era Gadgets order {{order_number}} (Invoice: {{invoice_number}}) has been confirmed! We are preparing your gadget for dispatch. Track your invoice here: {{invoice_link}}`,
      paymentVerifiedCustomer: `Hello {{customer_name}}, your payment of {{total}} for order {{order_number}} has been officially VERIFIED by our accounts team. Your official stamped invoice is available here: {{invoice_link}}`,
      readyForDeliveryCustomer: `Hello {{customer_name}}, order {{order_number}} is packed and ready for delivery to {{delivery_address}}. Our dispatch rider will contact you upon departure.`
    }
  },
  instagramUrl: 'https://instagram.com/eragadgets.ng',
  twitterUrl: 'https://twitter.com/eragadgetsng'
};

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  settings: StoreSettings;
  customers: CustomerCRM[];
  leads: Lead[];
  notifications: AdminNotification[];
  invoiceCounter: number;
  orderCounter: number;
  media?: Record<string, string>;
  emailLogs?: EmailLog[];
  pushSubscriptions?: PushSubscriptionRecord[];
}

class StoreDB {
  private data: DatabaseSchema;
  private lastMtimeMs: number = 0;
  private firestoreInitialized = false;

  constructor() {
    this.data = this.loadData();
    // Connect and synchronize with persistent cloud Firestore
    this.initFirestoreSync().catch((err) => {
      console.warn('[StoreDB] Firestore initial sync notice:', err?.message || err);
    });
  }

  private ensureFreshData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const stat = fs.statSync(DATA_FILE);
        if (stat.mtimeMs > this.lastMtimeMs) {
          const freshData = this.loadData();
          if (freshData) {
            this.data = freshData;
          }
        }
      }
    } catch (err) {
      console.error('[StoreDB] Error verifying data freshness:', err);
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const stat = fs.statSync(DATA_FILE);
        this.lastMtimeMs = stat.mtimeMs;
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const loadedSchema: DatabaseSchema = {
          products: (parsed.products || []).map((p: Product) => ({
            ...p,
            images: Array.isArray(p.images) ? p.images : []
          })),
          orders: parsed.orders || [],
          reviews: parsed.reviews || [],
          settings: {
            ...DEFAULT_SETTINGS,
            ...(parsed.settings || {}),
            homeConfig: {
              ...DEFAULT_HOME_CONFIG,
              ...(parsed.settings?.homeConfig || {}),
              hero: {
                ...DEFAULT_HOME_CONFIG.hero,
                ...(parsed.settings?.homeConfig?.hero || {})
              },
              categoriesSection: {
                ...DEFAULT_HOME_CONFIG.categoriesSection,
                ...(parsed.settings?.homeConfig?.categoriesSection || {})
              },
              showcase1: {
                ...DEFAULT_HOME_CONFIG.showcase1,
                ...(parsed.settings?.homeConfig?.showcase1 || {})
              },
              showcase2: {
                ...DEFAULT_HOME_CONFIG.showcase2,
                ...(parsed.settings?.homeConfig?.showcase2 || {})
              },
              bestSellers: {
                ...DEFAULT_HOME_CONFIG.bestSellers,
                ...(parsed.settings?.homeConfig?.bestSellers || {})
              },
              showcase3: {
                ...DEFAULT_HOME_CONFIG.showcase3,
                ...(parsed.settings?.homeConfig?.showcase3 || {})
              },
              trust: {
                ...DEFAULT_HOME_CONFIG.trust,
                ...(parsed.settings?.homeConfig?.trust || {})
              },
              faq: {
                ...DEFAULT_HOME_CONFIG.faq,
                ...(parsed.settings?.homeConfig?.faq || {})
              },
              newsletter: {
                ...DEFAULT_HOME_CONFIG.newsletter,
                ...(parsed.settings?.homeConfig?.newsletter || {})
              }
            },
            paymentMethods: {
              ...DEFAULT_SETTINGS.paymentMethods,
              ...(parsed.settings?.paymentMethods || {})
            },
            whatsappConfig: {
              ...DEFAULT_SETTINGS.whatsappConfig,
              ...(parsed.settings?.whatsappConfig || {})
            },
            emailConfig: {
              ...DEFAULT_SETTINGS.emailConfig,
              ...(parsed.settings?.emailConfig || {}),
              orderNotificationEmail:
                parsed.settings?.orderNotificationEmail ||
                parsed.settings?.emailConfig?.orderNotificationEmail ||
                DEFAULT_SETTINGS.orderNotificationEmail ||
                'iwuajokuchidera64@gmail.com'
            },
            orderNotificationEmail:
              parsed.settings?.orderNotificationEmail ||
              parsed.settings?.emailConfig?.orderNotificationEmail ||
              DEFAULT_SETTINGS.orderNotificationEmail ||
              'iwuajokuchidera64@gmail.com'
          },
          customers: parsed.customers || [],
          leads: parsed.leads || [],
          notifications: parsed.notifications || [],
          invoiceCounter: parsed.invoiceCounter || 100,
          orderCounter: parsed.orderCounter || 184,
          media: parsed.media || {},
          emailLogs: parsed.emailLogs || [],
          pushSubscriptions: parsed.pushSubscriptions || []
        };

        if (!parsed.settings?.homeConfig) {
          try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(loadedSchema, null, 2), 'utf-8');
            const newStat = fs.statSync(DATA_FILE);
            this.lastMtimeMs = newStat.mtimeMs;
          } catch (writeErr) {
            console.warn('[StoreDB] Note: could not write initial homeConfig to disk:', writeErr);
          }
        }

        return loadedSchema;
      }
    } catch (err) {
      console.error('Failed to load store_data.json, keeping current/defaults:', err);
      if (this.data) return this.data;
    }

    const initial: DatabaseSchema = {
      products: [],
      orders: [],
      reviews: [],
      settings: DEFAULT_SETTINGS,
      customers: [],
      leads: [],
      notifications: [],
      invoiceCounter: 100,
      orderCounter: 184
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
      if (fs.existsSync(DATA_FILE)) {
        const stat = fs.statSync(DATA_FILE);
        this.lastMtimeMs = stat.mtimeMs;
      }
    } catch (err) {
      console.error('Failed to write store_data.json:', err);
    }
  }

  private commit() {
    this.saveData(this.data);
  }

  private sanitize(obj: any): any {
    return JSON.parse(
      JSON.stringify(obj, (_k, v) => (v === undefined ? null : v))
    );
  }

  public processProductImages(images: string[], slugPrefix: string): string[] {
    if (!Array.isArray(images)) return [];
    return images.map((img, idx) => {
      if (typeof img === 'string' && img.startsWith('data:image/')) {
        try {
          const match = img.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
          if (match) {
            let ext = match[1].toLowerCase();
            if (ext === 'jpeg') ext = 'jpg';
            if (ext === 'svg+xml') ext = 'svg';
            const filename = `prod_${slugPrefix}_${idx}_${Date.now()}.${ext}`;
            const buffer = Buffer.from(match[2], 'base64');
            const targetDir = path.resolve(process.cwd(), 'public/uploads');
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            fs.writeFileSync(path.join(targetDir, filename), buffer);
            return `/uploads/${filename}`;
          }
        } catch (err) {
          console.warn('[StoreDB] Could not extract base64 image:', err);
        }
      }
      return img;
    });
  }

  private async initFirestoreSync() {
    try {
      console.log('[StoreDB] Connecting to persistent cloud Firestore database...');
      const productsRef = collection(firestoreDb, 'products');
      const snap = await getDocs(productsRef);

      if (snap.size > 0) {
        console.log(`[StoreDB] Loaded ${snap.size} products from persistent cloud Firestore.`);
        const firestoreProducts: Product[] = [];
        snap.forEach((d) => {
          firestoreProducts.push(d.data() as Product);
        });

        // Merge any products present in local database not yet saved to cloud Firestore
        const cloudIds = new Set(firestoreProducts.map((p) => p.id));
        for (const localP of this.data.products) {
          if (!cloudIds.has(localP.id)) {
            firestoreProducts.push(localP);
            this.saveProductToFirestore(localP).catch((err) => {
              console.warn(`[StoreDB] Notice syncing local product ${localP.id} to Firestore:`, err?.message);
            });
          }
        }

        this.data.products = firestoreProducts;
        this.commit();
      } else {
        console.log('[StoreDB] Cloud Firestore catalog is empty. Seeding certified catalogue to cloud...');
        if (!this.data.products || this.data.products.length < 2) {
          this.data.products = [...INITIAL_CATALOG];
          this.commit();
        }
        for (const p of this.data.products) {
          await this.saveProductToFirestore(p);
        }
        console.log(`[StoreDB] Successfully seeded ${this.data.products.length} products to cloud Firestore.`);
      }

      // Sync settings with Firestore
      try {
        const settingsDoc = await getDoc(doc(firestoreDb, 'settings', 'store_settings'));
        if (settingsDoc.exists()) {
          const cloudSettings = settingsDoc.data() as StoreSettings;
          const cloudTime = new Date((cloudSettings as any).updatedAt || 0).getTime();
          const localTime = new Date((this.data.settings as any).updatedAt || 0).getTime();

          // Only overwrite local settings if cloud settings are strictly newer
          if (cloudTime > localTime) {
            this.data.settings = {
              ...this.data.settings,
              ...cloudSettings,
              homeConfig: {
                ...(this.data.settings.homeConfig || DEFAULT_HOME_CONFIG),
                ...(cloudSettings.homeConfig || {}),
                hero: {
                  ...(this.data.settings.homeConfig?.hero || DEFAULT_HOME_CONFIG.hero),
                  ...(cloudSettings.homeConfig?.hero || {})
                },
                categoriesSection: {
                  ...(this.data.settings.homeConfig?.categoriesSection || DEFAULT_HOME_CONFIG.categoriesSection),
                  ...(cloudSettings.homeConfig?.categoriesSection || {})
                },
                showcase1: {
                  ...(this.data.settings.homeConfig?.showcase1 || DEFAULT_HOME_CONFIG.showcase1),
                  ...(cloudSettings.homeConfig?.showcase1 || {})
                },
                showcase2: {
                  ...(this.data.settings.homeConfig?.showcase2 || DEFAULT_HOME_CONFIG.showcase2),
                  ...(cloudSettings.homeConfig?.showcase2 || {})
                },
                bestSellers: {
                  ...(this.data.settings.homeConfig?.bestSellers || DEFAULT_HOME_CONFIG.bestSellers),
                  ...(cloudSettings.homeConfig?.bestSellers || {})
                },
                showcase3: {
                  ...(this.data.settings.homeConfig?.showcase3 || DEFAULT_HOME_CONFIG.showcase3),
                  ...(cloudSettings.homeConfig?.showcase3 || {})
                }
              }
            };
            this.commit();
          } else {
            // Local is newer or equal: persist local settings up to Firestore
            await this.saveSettingsToFirestore();
          }
        } else {
          await this.saveSettingsToFirestore();
        }
      } catch (settingsErr: any) {
        console.warn('[StoreDB] Settings cloud sync notice:', settingsErr.message);
      }

      // Sync orders with Firestore
      try {
        const ordersRef = collection(firestoreDb, 'orders');
        const ordersSnap = await getDocs(ordersRef);
        if (ordersSnap.size > 0) {
          const cloudOrders: Order[] = [];
          ordersSnap.forEach((d) => cloudOrders.push(d.data() as Order));
          this.data.orders = cloudOrders;
          this.commit();
        }
      } catch (ordersErr: any) {
        console.warn('[StoreDB] Orders cloud sync notice:', ordersErr.message);
      }

      // Ensure media on disk is synchronized from local media store
      try {
        if (!this.data.media) this.data.media = {};
        const mediaStorage = this.data.media;
        const uploadDir = path.resolve(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        for (const [filename, dataUrl] of Object.entries(mediaStorage)) {
          if (filename && dataUrl) {
            const targetPath = path.join(uploadDir, filename);
            if (!fs.existsSync(targetPath)) {
              const match = dataUrl.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
              if (match) {
                fs.writeFileSync(targetPath, Buffer.from(match[2], 'base64'));
              }
            }
          }
        }
      } catch (mediaErr: any) {
        console.warn('[StoreDB] Media cache sync notice:', mediaErr.message);
      }

      // Listen for real-time changes to products from cloud
      onSnapshot(productsRef, (snapshot) => {
        if (!snapshot.empty) {
          const updated: Product[] = [];
          snapshot.forEach((d) => updated.push(d.data() as Product));
          this.data.products = updated;
          this.commit();
        }
      });

      this.firestoreInitialized = true;
      console.log('[StoreDB] Cloud Firestore persistent sync established successfully.');
    } catch (err: any) {
      console.warn('[StoreDB] Cloud Firestore sync fallback:', err?.message || err);
    }
  }

  public async saveProductToFirestore(p: Product) {
    try {
      await setDoc(doc(firestoreDb, 'products', p.id), this.sanitize(p));
    } catch (err: any) {
      console.warn(`[StoreDB] Failed to persist product ${p.id} to Firestore:`, err.message);
    }
  }

  public async deleteProductFromFirestore(id: string) {
    try {
      await deleteDoc(doc(firestoreDb, 'products', id));
    } catch (err: any) {
      console.warn(`[StoreDB] Failed to delete product ${id} from Firestore:`, err.message);
    }
  }

  public async saveSettingsToFirestore() {
    try {
      await setDoc(doc(firestoreDb, 'settings', 'store_settings'), this.sanitize(this.data.settings));
    } catch (err: any) {
      console.warn('[StoreDB] Failed to persist settings to Firestore:', err.message);
    }
  }

  public async saveOrderToFirestore(order: Order) {
    try {
      await setDoc(doc(firestoreDb, 'orders', order.id), this.sanitize(order));
    } catch (err: any) {
      console.warn(`[StoreDB] Failed to persist order ${order.id} to Firestore:`, err.message);
    }
  }

  // --- PRODUCTS ---
  getProducts(options?: {
    category?: string;
    brand?: string;
    condition?: string;
    search?: string;
    status?: string;
    includeSoldOut?: boolean;
    featured?: boolean;
  }): Product[] {
    this.ensureFreshData();
    let list = [...this.data.products];

    if (!options?.status) {
      list = list.filter((p) => p.status === 'Published');
      if (!this.data.settings.showSoldProductsOnWebsite) {
        list = list.filter((p) => !p.isSold);
      }
    } else if (options.status !== 'all') {
      list = list.filter((p) => p.status === options.status);
    }

    if (options?.category && options.category !== 'all') {
      const catLower = options.category.toLowerCase();
      list = list.filter((p) => p.category.toLowerCase() === catLower);
    }

    if (options?.brand && options.brand !== 'all') {
      const brandLower = options.brand.toLowerCase();
      list = list.filter((p) => p.brand.toLowerCase() === brandLower);
    }

    if (options?.condition && options.condition !== 'all') {
      list = list.filter((p) => p.condition === options.condition);
    }

    if (options?.featured) {
      list = list.filter((p) => p.featured);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.variants.some(
            (v) =>
              v.storage?.toLowerCase().includes(q) ||
              v.sku?.toLowerCase().includes(q) ||
              v.color.name.toLowerCase().includes(q)
          )
      );
    }

    return list;
  }

  getProductByIdOrSlug(idOrSlug: string): Product | undefined {
    this.ensureFreshData();
    const raw = String(idOrSlug || '').trim();
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw).trim();
    } catch (_) {}
    const lowerRaw = raw.toLowerCase();
    const lowerDecoded = decoded.toLowerCase();

    return this.data.products.find(
      (p) =>
        p.id === raw ||
        p.slug === raw ||
        p.id === decoded ||
        p.slug === decoded ||
        (p.id && p.id.toLowerCase() === lowerRaw) ||
        (p.slug && p.slug.toLowerCase() === lowerRaw) ||
        (p.id && p.id.toLowerCase() === lowerDecoded) ||
        (p.slug && p.slug.toLowerCase() === lowerDecoded)
    );
  }

  createProduct(productData: Partial<Product>): Product {
    this.ensureFreshData();
    const slug = (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const uniqueSlug = this.generateUniqueSlug(slug);

    const newProduct: Product = {
      id: uniqueSlug,
      slug: uniqueSlug,
      name: productData.name || 'Unnamed Product',
      brand: productData.brand || 'Apple',
      category: productData.category || 'iPhone',
      condition: productData.condition || 'Brand New',
      shortDescription: productData.shortDescription || '',
      description: productData.description || '',
      basePrice: Number(productData.basePrice) || 0,
      compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
      costPrice: productData.costPrice ? Number(productData.costPrice) : null,
      badge: productData.badge || null,
      status: productData.status || 'Published',
      isSold: Boolean(productData.isSold),
      featured: Boolean(productData.featured),
      images:
        productData.images && productData.images.length > 0
          ? productData.images
          : [],
      specs: productData.specs || {},
      colorOptions: productData.colorOptions || [],
      storageOptions: productData.storageOptions || [],
      variants:
        productData.variants && productData.variants.length > 0
          ? productData.variants
          : [
              {
                id: `v-${uniqueSlug}-default`,
                storage: 'Default',
                color: { name: 'Standard', hex: '#111111' },
                sku: `ERA-${uniqueSlug.toUpperCase()}`,
                price: Number(productData.basePrice) || 0,
                stock: 5,
                lowStockThreshold: 1,
                isSold: false
              }
            ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    newProduct.images = this.processProductImages(newProduct.images, uniqueSlug);
    this.data.products.unshift(newProduct);
    this.commit();
    this.saveProductToFirestore(newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    this.ensureFreshData();
    const raw = String(id || '').trim();
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw).trim();
    } catch (_) {}
    const lowerRaw = raw.toLowerCase();
    const lowerDecoded = decoded.toLowerCase();

    const index = this.data.products.findIndex(
      (p) =>
        p.id === raw ||
        p.slug === raw ||
        p.id === decoded ||
        p.slug === decoded ||
        (p.id && p.id.toLowerCase() === lowerRaw) ||
        (p.slug && p.slug.toLowerCase() === lowerRaw) ||
        (p.id && p.id.toLowerCase() === lowerDecoded) ||
        (p.slug && p.slug.toLowerCase() === lowerDecoded)
    );
    if (index === -1) return null;

    const existing = this.data.products[index];
    const updated: Product = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.images) {
      updated.images = this.processProductImages(updated.images, updated.slug);
    }

    if (updated.variants && updated.variants.length > 0) {
      const activeVariant =
        updated.variants.find((v) => !v.isSold && v.stock > 0) || updated.variants[0];
      if (activeVariant && !updates.basePrice) {
        updated.basePrice = activeVariant.price;
      }
      const hasAnyStock = updated.variants.some((v) => !v.isSold && v.stock > 0);
      if (!hasAnyStock) {
        updated.isSold = true;
      }
    }

    this.data.products[index] = updated;
    this.commit();
    this.saveProductToFirestore(updated);
    return updated;
  }

  duplicateProduct(id: string): Product | null {
    this.ensureFreshData();
    const original = this.getProductByIdOrSlug(id);
    if (!original) return null;

    const baseSlug = `${original.slug}-copy`;
    const uniqueSlug = this.generateUniqueSlug(baseSlug);

    const duplicated: Product = {
      ...JSON.parse(JSON.stringify(original)),
      id: uniqueSlug,
      slug: uniqueSlug,
      name: `${original.name} (Copy)`,
      status: 'Draft',
      isSold: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: original.variants.map((v, i) => ({
        ...v,
        id: `v-${uniqueSlug}-${i}`,
        sku: `${v.sku}-COPY`,
        isSold: false
      }))
    };

    this.data.products.unshift(duplicated);
    this.commit();
    this.saveProductToFirestore(duplicated);
    return duplicated;
  }

  toggleProductSold(id: string, isSold?: boolean): Product | null {
    this.ensureFreshData();
    const product = this.getProductByIdOrSlug(id);
    if (!product) return null;

    const targetSoldState = isSold !== undefined ? isSold : !product.isSold;
    product.isSold = targetSoldState;
    product.variants = product.variants.map((v) => ({
      ...v,
      isSold: targetSoldState,
      stock: targetSoldState ? 0 : v.stock === 0 ? 3 : v.stock
    }));
    product.updatedAt = new Date().toISOString();

    this.commit();
    this.saveProductToFirestore(product);
    return product;
  }

  deleteProduct(idOrSlugOrName: string): boolean {
    this.ensureFreshData();
    if (!idOrSlugOrName) return false;
    const rawInput = String(idOrSlugOrName).trim();
    let clean = rawInput.toLowerCase();
    try {
      clean = decodeURIComponent(rawInput).trim().toLowerCase();
    } catch (_) {}

    const matched = this.data.products.find((p) => {
      const pId = (p.id || '').trim().toLowerCase();
      const pSlug = (p.slug || '').trim().toLowerCase();
      const pName = (p.name || '').trim().toLowerCase();
      return (
        p.id === rawInput ||
        p.slug === rawInput ||
        pId === clean ||
        pSlug === clean ||
        pName === clean
      );
    });

    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => {
      const pId = (p.id || '').trim().toLowerCase();
      const pSlug = (p.slug || '').trim().toLowerCase();
      const pName = (p.name || '').trim().toLowerCase();
      
      const isMatch =
        p.id === rawInput ||
        p.slug === rawInput ||
        pId === clean ||
        pSlug === clean ||
        pName === clean;

      return !isMatch;
    });

    if (this.data.products.length !== initialLen) {
      this.commit();
      if (matched) {
        this.deleteProductFromFirestore(matched.id);
      }
      console.log(`[StoreDB] Product deleted: "${rawInput}". Total remaining products: ${this.data.products.length}`);
      return true;
    }
    console.warn(`[StoreDB] Product not found for deletion: "${rawInput}"`);
    return false;
  }

  private generateUniqueSlug(baseSlug: string): string {
    let slug = baseSlug;
    let counter = 1;
    while (this.data.products.some((p) => p.slug === slug || p.id === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  // --- ORDERS, INVOICES & PAYMENTS ---
  getOrders(searchQuery?: string): Order[] {
    this.ensureFreshData();
    let list = [...this.data.orders];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.paymentReference.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrderById(idOrOrderNum: string): Order | undefined {
    this.ensureFreshData();
    return this.data.orders.find(
      (o) =>
        o.id === idOrOrderNum ||
        o.orderNumber === idOrOrderNum ||
        o.invoiceNumber === idOrOrderNum
    );
  }

  getOrderByAccessToken(accessToken: string): Order | undefined {
    this.ensureFreshData();
    return this.data.orders.find((o) => o.accessToken === accessToken);
  }

  createOrder(orderData: Partial<Order>): Order {
    this.ensureFreshData();
    const prefix = this.data.settings.orderPrefix || 'EG-2026-';
    this.data.orderCounter = (this.data.orderCounter || 184) + 1;
    const orderNumber = `${prefix}${String(this.data.orderCounter).padStart(6, '0')}`;

    const invPrefix = this.data.settings.invoicePrefix || 'INV-EG-';
    this.data.invoiceCounter = (this.data.invoiceCounter || 100) + 1;
    const invoiceNumber = `${invPrefix}${String(this.data.invoiceCounter).padStart(6, '0')}`;

    const accessToken = crypto.randomBytes(18).toString('hex');
    const paymentRef = orderData.paymentReference || `EG-REF-${Date.now()}`;

    const initialAudit: PaymentAuditLog = {
      id: `log-${Date.now()}-1`,
      orderId: `ord-${Date.now()}`,
      orderNumber,
      action: 'Order Placed',
      performedBy: orderData.customer?.fullName || 'Customer',
      details: `Order created via ${orderData.paymentMethod || 'bank_transfer'}. Payment status: ${orderData.paymentStatus || 'pending'}.`,
      amount: orderData.total,
      timestamp: new Date().toISOString()
    };

    const newOrder: Order = {
      id: initialAudit.orderId,
      orderNumber,
      invoiceNumber,
      accessToken,
      customer: orderData.customer || {
        fullName: 'Customer',
        email: 'customer@eragadgets.ng',
        phone: '+234 800 000 0000',
        whatsapp: '+234 800 000 0000',
        address: 'Lagos',
        city: 'Lagos',
        state: 'Lagos'
      },
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discount: orderData.discount || 0,
      deliveryOption: orderData.deliveryOption || 'lagos',
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'bank_transfer',
      paymentStatus: orderData.paymentStatus || 'pending',
      orderStatus: orderData.orderStatus || 'Pending',
      paymentReference: paymentRef,
      stockDeducted: false,
      auditLogs: [initialAudit],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.orders.unshift(newOrder);

    // Auto-upsert into Customer CRM
    this.upsertCustomer(newOrder.customer, newOrder.total);

    // Create Admin In-App Notification
    this.addNotification({
      type: 'order',
      title: `New Order ${newOrder.orderNumber}`,
      message: `${newOrder.customer.fullName} ordered ${newOrder.items.length} items (${newOrder.items[0]?.productName || 'Gadget'}) totaling ₦${newOrder.total.toLocaleString()}. Method: ${newOrder.paymentMethod}.`,
      orderId: newOrder.id
    });

    this.commit();
    this.saveOrderToFirestore(newOrder);

    // Asynchronously dispatch Email Notification with full order details to receiver
    sendOrderNotificationEmail(newOrder, this.data.settings)
      .then((mailRes) => {
        if (mailRes.log) {
          this.addEmailLog(mailRes.log);
        }
      })
      .catch((mailErr) => {
        console.error('[DB] Failed to process order notification email:', mailErr);
      });

    return newOrder;
  }

  addEmailLog(log: EmailLog) {
    this.ensureFreshData();
    if (!this.data.emailLogs) this.data.emailLogs = [];
    this.data.emailLogs.unshift(log);
    if (this.data.emailLogs.length > 100) {
      this.data.emailLogs = this.data.emailLogs.slice(0, 100);
    }
    this.commit();
  }

  getEmailLogs(): EmailLog[] {
    this.ensureFreshData();
    return this.data.emailLogs || [];
  }

  // Customer claims payment has been made (e.g. clicked "I've Made the Transfer")
  submitBankTransferPayment(
    orderIdOrNumber: string,
    proofData?: { dataUrl?: string; fileName?: string }
  ): Order | null {
    this.ensureFreshData();
    const order = this.data.orders.find(
      (o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber
    );
    if (!order) return null;

    order.paymentStatus = 'awaiting_verification';
    if (proofData?.dataUrl) {
      order.paymentProofUrl = proofData.dataUrl;
      order.paymentProofFileName = proofData.fileName;
      order.paymentProofUploadedAt = new Date().toISOString();
    }
    order.updatedAt = new Date().toISOString();

    const audit: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'Payment Claimed by Customer',
      performedBy: `${order.customer.fullName} (Customer)`,
      details: proofData?.fileName
        ? `Customer confirmed transfer and uploaded proof: ${proofData.fileName}`
        : `Customer confirmed bank transfer. Awaiting owner bank verification.`,
      amount: order.total,
      timestamp: new Date().toISOString()
    };
    order.auditLogs.push(audit);

    // Create high-priority Admin Notification
    this.addNotification({
      type: 'payment_awaiting',
      title: `Payment Awaiting Verification: ${order.orderNumber}`,
      message: `${order.customer.fullName} confirmed transfer of ₦${order.total.toLocaleString()} for ${order.orderNumber}. Please check your bank account and verify.`,
      orderId: order.id
    });

    // Alert all admins with access to admin panel via email
    sendPaymentProofNotificationEmail(order, this.data.settings, proofData?.fileName)
      .then((res) => {
        if (res.log) this.addEmailLog(res.log);
      })
      .catch((err) => console.error('[DB] Failed to process payment proof email alert:', err));

    this.commit();
    return order;
  }

  // Admin manually verifies payment
  verifyPaymentByAdmin(
    orderIdOrNumber: string,
    adminEmail: string
  ): { success: boolean; order?: Order; message?: string } {
    this.ensureFreshData();
    const order = this.data.orders.find(
      (o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber
    );
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.paymentStatus === 'verified') {
      return { success: true, order, message: 'Payment already verified' };
    }

    order.paymentStatus = 'verified';
    order.orderStatus = 'Confirmed';
    order.verifiedAt = new Date().toISOString();
    order.verifiedBy = adminEmail || 'Admin';
    order.updatedAt = new Date().toISOString();

    // Deduct stock upon formal payment verification
    if (!order.stockDeducted) {
      for (const item of order.items) {
        const prod = this.getProductByIdOrSlug(item.productId);
        if (prod) {
          const variant = prod.variants.find((v) => v.id === item.variantId);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
            if (variant.stock === 0) {
              variant.isSold = true;
              this.addNotification({
                type: 'sold_out',
                title: `Variant Sold Out: ${prod.name}`,
                message: `${variant.storage} ${variant.color.name} of ${prod.name} has reached 0 stock.`
              });
              sendLowStockNotificationEmail(prod.name, `${variant.storage || ''} ${variant.color.name}`.trim(), 0, this.data.settings)
                .then((r) => r.log && this.addEmailLog(r.log))
                .catch((e) => console.error('[DB] Failed sold out email alert:', e));
            } else if (variant.stock <= variant.lowStockThreshold) {
              this.addNotification({
                type: 'low_stock',
                title: `Low Stock: ${prod.name}`,
                message: `Only ${variant.stock} units remaining for ${variant.storage} ${variant.color.name}.`
              });
              sendLowStockNotificationEmail(prod.name, `${variant.storage || ''} ${variant.color.name}`.trim(), variant.stock, this.data.settings)
                .then((r) => r.log && this.addEmailLog(r.log))
                .catch((e) => console.error('[DB] Failed low stock email alert:', e));
            }
          }
          // Check if all variants are sold out
          const anyStockLeft = prod.variants.some((v) => !v.isSold && v.stock > 0);
          if (!anyStockLeft) {
            prod.isSold = true;
          }
        }
      }
      order.stockDeducted = true;
    }

    const audit: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'Payment Verified by Admin',
      performedBy: adminEmail || 'Administrator',
      details: `Funds of ₦${order.total.toLocaleString()} confirmed in corporate bank account. Order confirmed and inventory deducted.`,
      amount: order.total,
      timestamp: new Date().toISOString()
    };
    order.auditLogs.push(audit);

    this.addNotification({
      type: 'payment_verified',
      title: `Payment Verified for ${order.orderNumber}`,
      message: `₦${order.total.toLocaleString()} confirmed by ${adminEmail}. Invoice status set to PAID.`,
      orderId: order.id
    });

    this.commit();
    return { success: true, order };
  }

  updateOrderStatus(
    orderId: string,
    orderStatus: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus'],
    adminNote?: string
  ): Order | null {
    this.ensureFreshData();
    const order = this.data.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const prevOrder = order.orderStatus;
    const prevPayment = order.paymentStatus;

    order.orderStatus = orderStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();

    const audit: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'Order Status Changed',
      performedBy: 'Admin',
      details: `Status changed from ${prevOrder}/${prevPayment} to ${orderStatus}/${order.paymentStatus}.${adminNote ? ` Note: ${adminNote}` : ''}`,
      timestamp: new Date().toISOString()
    };
    order.auditLogs.push(audit);

    this.commit();
    return order;
  }

  // --- CUSTOMER CRM ---
  getCustomers(searchQuery?: string): CustomerCRM[] {
    this.ensureFreshData();
    let list = [...this.data.customers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.whatsapp.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  getCustomerById(id: string): CustomerCRM | undefined {
    this.ensureFreshData();
    return this.data.customers.find((c) => c.id === id);
  }

  updateCustomerNotes(id: string, notes: string, status?: CustomerCRM['status']): CustomerCRM | null {
    this.ensureFreshData();
    const customer = this.data.customers.find((c) => c.id === id);
    if (!customer) return null;
    customer.notes = notes;
    if (status) customer.status = status;
    customer.updatedAt = new Date().toISOString();
    this.commit();
    return customer;
  }

  private upsertCustomer(details: any, orderTotal = 0): CustomerCRM {
    const emailKey = details.email?.toLowerCase().trim();
    const phoneKey = details.phone?.replace(/[^0-9]/g, '');

    let existing = this.data.customers.find(
      (c) =>
        (emailKey && c.email.toLowerCase() === emailKey) ||
        (phoneKey && c.phone.replace(/[^0-9]/g, '') === phoneKey)
    );

    if (existing) {
      existing.fullName = details.fullName || existing.fullName;
      existing.phone = details.phone || existing.phone;
      existing.whatsapp = details.whatsapp || details.phone || existing.whatsapp;
      existing.address = details.address || existing.address;
      existing.city = details.city || existing.city;
      existing.state = details.state || existing.state;
      existing.totalOrders += 1;
      existing.totalSpent += orderTotal;
      existing.lastOrderDate = new Date().toISOString();
      if (existing.totalSpent >= 4000000) {
        existing.status = 'VIP';
      }
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const newCustomer: CustomerCRM = {
      id: `cust-${Date.now()}`,
      fullName: details.fullName || 'Customer',
      phone: details.phone || '',
      whatsapp: details.whatsapp || details.phone || '',
      email: details.email || '',
      address: details.address || '',
      city: details.city || '',
      state: details.state || 'Lagos',
      totalOrders: 1,
      totalSpent: orderTotal,
      lastOrderDate: new Date().toISOString(),
      status: orderTotal >= 4000000 ? 'VIP' : 'Active',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.customers.unshift(newCustomer);
    return newCustomer;
  }

  // --- LEADS & ENQUIRIES ---
  getLeads(searchQuery?: string): Lead[] {
    this.ensureFreshData();
    let list = [...this.data.leads];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.productInterest?.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createLead(leadData: Partial<Lead>): Lead {
    this.ensureFreshData();
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: leadData.name || 'Anonymous Prospect',
      phone: leadData.phone || '',
      whatsapp: leadData.whatsapp || leadData.phone || '',
      email: leadData.email || '',
      message: leadData.message || '',
      productInterest: leadData.productInterest || 'General Inquiry',
      variantDetails: leadData.variantDetails,
      source: leadData.source || 'Product Enquiry',
      status: 'New',
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.leads.unshift(newLead);

    this.addNotification({
      type: 'enquiry',
      title: `New Lead: ${newLead.name}`,
      message: `${newLead.source} for "${newLead.productInterest}". Phone: ${newLead.phone}`
    });

    sendLeadNotificationEmail(newLead, this.data.settings)
      .then((r) => r.log && this.addEmailLog(r.log))
      .catch((e) => console.error('[DB] Failed lead email alert:', e));

    this.commit();
    return newLead;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    this.ensureFreshData();
    const lead = this.data.leads.find((l) => l.id === id);
    if (!lead) return null;
    Object.assign(lead, updates);
    this.commit();
    return lead;
  }

  // --- NOTIFICATIONS ---
  getNotifications(): AdminNotification[] {
    this.ensureFreshData();
    return [...this.data.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  addNotification(
    notif: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>,
    extra?: { order?: Order }
  ): AdminNotification {
    const n: AdminNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...notif,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(n);
    // Keep max 50 notifications
    if (this.data.notifications.length > 50) {
      this.data.notifications.pop();
    }

    // Universal Real-Time Dispatch: Instantly streams to all open phones/laptops via SSE
    // and sends native Web Push to wake up background mobile devices
    import('./pushService.ts')
      .then(({ dispatchUniversalNotification }) => {
        dispatchUniversalNotification(n, extra).catch((err) => {
          console.debug('[UniversalNotification] Note:', err?.message || err);
        });
      })
      .catch(() => {});

    return n;
  }

  // --- DEVICE PUSH SUBSCRIPTIONS (Universal Mobile & Desktop Background Notifications) ---
  getPushSubscriptions(): PushSubscriptionRecord[] {
    this.ensureFreshData();
    return this.data.pushSubscriptions || [];
  }

  savePushSubscription(sub: PushSubscriptionRecord): void {
    this.ensureFreshData();
    if (!this.data.pushSubscriptions) {
      this.data.pushSubscriptions = [];
    }
    // De-duplicate if same endpoint
    this.data.pushSubscriptions = this.data.pushSubscriptions.filter(
      (s) => s.endpoint !== sub.endpoint
    );
    this.data.pushSubscriptions.push(sub);
    this.commit();
    console.log(`[StoreDB] Saved push subscription (${sub.deviceType || 'device'}). Total registered: ${this.data.pushSubscriptions.length}`);
  }

  removePushSubscription(endpoint: string): void {
    this.ensureFreshData();
    if (!this.data.pushSubscriptions) return;
    this.data.pushSubscriptions = this.data.pushSubscriptions.filter(
      (s) => s.endpoint !== endpoint
    );
    this.commit();
  }

  markNotificationRead(id: string): void {
    this.ensureFreshData();
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.read = true;
      this.commit();
    }
  }

  markAllNotificationsRead(): void {
    this.ensureFreshData();
    this.data.notifications.forEach((n) => (n.read = true));
    this.commit();
  }

  // --- REVIEWS ---
  getReviews(productId?: string, onlyApproved = true): Review[] {
    this.ensureFreshData();
    let revs = [...this.data.reviews];
    if (productId) {
      revs = revs.filter((r) => r.productId === productId);
    }
    if (onlyApproved) {
      revs = revs.filter((r) => r.approved);
    }
    return revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addReview(reviewData: Partial<Review>): Review {
    this.ensureFreshData();
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: reviewData.productId || 'iphone-17-pro',
      productName: reviewData.productName || 'Era Gadget',
      customerName: reviewData.customerName || 'Verified Buyer',
      rating: reviewData.rating || 5,
      comment: reviewData.comment || '',
      approved: false,
      featured: false,
      verified: true,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.unshift(newRev);
    this.commit();
    return newRev;
  }

  updateReview(id: string, updates: Partial<Review>): Review | null {
    this.ensureFreshData();
    const rev = this.data.reviews.find((r) => r.id === id);
    if (!rev) return null;
    Object.assign(rev, updates);
    this.commit();
    return rev;
  }

  deleteReview(id: string): boolean {
    this.ensureFreshData();
    const initialLen = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter((r) => r.id !== id);
    if (this.data.reviews.length !== initialLen) {
      this.commit();
      return true;
    }
    return false;
  }

  // --- SETTINGS ---
  getSettings(): StoreSettings {
    this.ensureFreshData();
    return { ...this.data.settings };
  }

  updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.ensureFreshData();
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      homeConfig: updates.homeConfig
        ? {
            ...this.data.settings.homeConfig,
            ...updates.homeConfig,
            hero: {
              ...(this.data.settings.homeConfig?.hero || DEFAULT_HOME_CONFIG.hero),
              ...(updates.homeConfig.hero || {})
            },
            categoriesSection: {
              ...(this.data.settings.homeConfig?.categoriesSection || DEFAULT_HOME_CONFIG.categoriesSection),
              ...(updates.homeConfig.categoriesSection || {})
            },
            showcase1: {
              ...(this.data.settings.homeConfig?.showcase1 || DEFAULT_HOME_CONFIG.showcase1),
              ...(updates.homeConfig.showcase1 || {})
            },
            showcase2: {
              ...(this.data.settings.homeConfig?.showcase2 || DEFAULT_HOME_CONFIG.showcase2),
              ...(updates.homeConfig.showcase2 || {})
            },
            bestSellers: {
              ...(this.data.settings.homeConfig?.bestSellers || DEFAULT_HOME_CONFIG.bestSellers),
              ...(updates.homeConfig.bestSellers || {})
            },
            showcase3: {
              ...(this.data.settings.homeConfig?.showcase3 || DEFAULT_HOME_CONFIG.showcase3),
              ...(updates.homeConfig.showcase3 || {})
            },
            trust: {
              ...(this.data.settings.homeConfig?.trust || DEFAULT_HOME_CONFIG.trust),
              ...(updates.homeConfig.trust || {})
            },
            faq: {
              ...(this.data.settings.homeConfig?.faq || DEFAULT_HOME_CONFIG.faq),
              ...(updates.homeConfig.faq || {})
            },
            newsletter: {
              ...(this.data.settings.homeConfig?.newsletter || DEFAULT_HOME_CONFIG.newsletter),
              ...(updates.homeConfig.newsletter || {})
            }
          }
        : this.data.settings.homeConfig,
      paymentMethods: {
        ...this.data.settings.paymentMethods,
        ...(updates.paymentMethods || {})
      },
      whatsappConfig: {
        ...this.data.settings.whatsappConfig,
        ...(updates.whatsappConfig || {})
      }
    };
    (this.data.settings as any).updatedAt = new Date().toISOString();
    this.commit();
    this.saveSettingsToFirestore();
    return this.data.settings;
  }

  resetHomeConfig(): StoreSettings {
    this.ensureFreshData();
    this.data.settings.homeConfig = JSON.parse(JSON.stringify(DEFAULT_HOME_CONFIG));
    (this.data.settings as any).updatedAt = new Date().toISOString();
    this.commit();
    this.saveSettingsToFirestore();
    return this.data.settings;
  }

  // --- MEDIA STORAGE ---
  saveMedia(filename: string, dataUrl: string): void {
    this.ensureFreshData();
    if (!this.data.media) {
      this.data.media = {};
    }
    this.data.media[filename] = dataUrl;
    this.commit();

    // Immediately write buffer to disk in public/uploads and src/assets/uploads
    try {
      const match = dataUrl.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
      if (match) {
        const buffer = Buffer.from(match[2], 'base64');
        const uploadDirs = [
          path.resolve(process.cwd(), 'public/uploads'),
          path.resolve(process.cwd(), 'src/assets/uploads')
        ];
        for (const dir of uploadDirs) {
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, filename), buffer);
        }
      }
    } catch (diskErr) {
      console.warn(`[StoreDB] saveMedia disk write notice for ${filename}:`, diskErr);
    }
  }

  getMedia(filename: string): string | undefined {
    this.ensureFreshData();
    return this.data.media?.[filename];
  }

  // --- ANALYTICS ---
  getAnalytics(): any {
    this.ensureFreshData();
    const totalOrders = this.data.orders.length;
    const verifiedOrders = this.data.orders.filter((o) => o.paymentStatus === 'verified');
    const awaitingVerificationOrders = this.data.orders.filter(
      (o) => o.paymentStatus === 'awaiting_verification'
    ).length;

    const totalRevenue = verifiedOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue =
      verifiedOrders.length > 0 ? Math.round(totalRevenue / verifiedOrders.length) : 0;

    let productsSoldCount = 0;
    for (const order of verifiedOrders) {
      for (const item of order.items) {
        productsSoldCount += item.quantity;
      }
    }

    const totalProducts = this.data.products.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let soldOutCount = 0;
    let inventoryValue = 0;

    const categoryMap: Record<string, { count: number; value: number }> = {};

    for (const p of this.data.products) {
      let productStock = 0;
      let isProductLow = false;

      for (const v of p.variants) {
        inventoryValue += v.price * v.stock;
        productStock += v.stock;
        if (!v.isSold && v.stock > 0 && v.stock <= v.lowStockThreshold) {
          isProductLow = true;
        }
      }

      if (p.isSold || productStock === 0) {
        soldOutCount++;
      } else if (isProductLow) {
        lowStockCount++;
      } else {
        inStockCount++;
      }

      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { count: 0, value: 0 };
      }
      categoryMap[p.category].count++;
      categoryMap[p.category].value += p.basePrice * (productStock || 1);
    }

    const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      count: stats.count,
      value: stats.value
    }));

    return {
      totalRevenue,
      totalOrders,
      awaitingVerificationOrders,
      verifiedOrders: verifiedOrders.length,
      averageOrderValue,
      productsSoldCount,
      totalProducts,
      inStockCount,
      lowStockCount,
      soldOutCount,
      totalCustomers: this.data.customers.length,
      totalLeads: this.data.leads.length,
      inventoryValue,
      categoryBreakdown,
      recentOrders: this.getOrders().slice(0, 5),
      recentLeads: this.getLeads().slice(0, 5)
    };
  }
}

export const db = new StoreDB();
