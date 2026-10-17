import type { Product } from '../src/types.ts';

export const INITIAL_CATALOG: Product[] = [
  {
    id: 'iphone-18-pro-max',
    slug: 'iphone-18-pro-max',
    name: 'iPhone 18 Pro Max',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Brand New',
    shortDescription: 'Apple next-generation titanium flagship with 2nm silicon and telephoto optical leap.',
    description: 'Factory sealed genuine Apple iPhone 18 Pro Max. Aerospace grade Grade-5 titanium chassis, next-generation A-series Pro silicon, enhanced Dynamic Island, and all-day battery life. Verified with Apple servers and covered by 1-Year manufacturer warranty.',
    basePrice: 2850000,
    compareAtPrice: 3300000,
    costPrice: null,
    badge: 'New',
    status: 'Published',
    isSold: false,
    featured: true,
    images: [
      '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
      '/src/assets/images/iphone_black_titanium_1790611902507.jpg',
      '/src/assets/images/iphone_desert_titanium_1790611888875.jpg'
    ],
    specs: {
      Display: '6.9-inch Super Retina XDR OLED 120Hz ProMotion',
      Chipset: 'Apple Next-Gen Pro Silicon (Hardware Ray Tracing)',
      Camera: '48MP Quad Camera System · 5x Optical Periscope Zoom',
      Battery: 'Up to 33 hours video playback · Fast USB-C Charging',
      Material: 'Grade 5 Aerospace Titanium with Ceramic Shield'
    },
    colorOptions: [
      { name: 'Burgundy Titanium', hex: '#581825' },
      { name: 'Natural Titanium', hex: '#9C9589' },
      { name: 'Black Titanium', hex: '#262626' }
    ],
    storageOptions: [
      { capacity: '256GB', presetPrice: 2850000, compareAtPrice: 3300000 },
      { capacity: '512GB', presetPrice: 3250000, compareAtPrice: 3700000 },
      { capacity: '1TB', presetPrice: 3650000, compareAtPrice: 4100000 }
    ],
    variants: [
      {
        id: 'v-18pm-256-burgundy',
        storage: '256GB',
        color: { name: 'Burgundy Titanium', hex: '#581825' },
        sku: 'ERA-18PM-256-BUR',
        price: 2850000,
        stock: 6,
        lowStockThreshold: 2,
        isSold: false
      },
      {
        id: 'v-18pm-512-natural',
        storage: '512GB',
        color: { name: 'Natural Titanium', hex: '#9C9589' },
        sku: 'ERA-18PM-512-NAT',
        price: 3250000,
        stock: 4,
        lowStockThreshold: 1,
        isSold: false
      },
      {
        id: 'v-18pm-1tb-black',
        storage: '1TB',
        color: { name: 'Black Titanium', hex: '#262626' },
        sku: 'ERA-18PM-1TB-BLK',
        price: 3650000,
        stock: 3,
        lowStockThreshold: 1,
        isSold: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'iphone-17-pro',
    slug: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Brand New',
    shortDescription: 'Aerospace titanium, ultra-fluid ProMotion, and studio portrait master cameras.',
    description: 'Factory sealed genuine Apple iPhone 17 Pro. Compact pro ergonomics, lightweight brushed titanium, customizable Action Button, and full USB 3 transfer speeds.',
    basePrice: 2550000,
    compareAtPrice: 2950000,
    costPrice: null,
    badge: 'Best Seller',
    status: 'Published',
    isSold: false,
    featured: true,
    images: [
      '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
      '/src/assets/images/iphone_white_titanium_1790611914496.jpg'
    ],
    specs: {
      Display: '6.3-inch Super Retina XDR OLED with Always-On',
      Chipset: 'Apple A18 Pro 6-core GPU',
      Camera: '48MP Main · 48MP Ultra Wide · 12MP 5x Telephoto',
      Battery: 'Up to 27 hours video playback',
      Security: 'Face ID & Satellite SOS'
    },
    colorOptions: [
      { name: 'Natural Titanium', hex: '#9C9589' },
      { name: 'Desert Titanium', hex: '#B89B72' },
      { name: 'Black Titanium', hex: '#262626' }
    ],
    storageOptions: [
      { capacity: '256GB', presetPrice: 2550000, compareAtPrice: 2950000 },
      { capacity: '512GB', presetPrice: 2950000, compareAtPrice: 3350000 }
    ],
    variants: [
      {
        id: 'v-17p-256-nat',
        storage: '256GB',
        color: { name: 'Natural Titanium', hex: '#9C9589' },
        sku: 'ERA-17P-256-NAT',
        price: 2550000,
        stock: 8,
        lowStockThreshold: 2,
        isSold: false
      },
      {
        id: 'v-17p-512-desert',
        storage: '512GB',
        color: { name: 'Desert Titanium', hex: '#B89B72' },
        sku: 'ERA-17P-512-DES',
        price: 2950000,
        stock: 5,
        lowStockThreshold: 1,
        isSold: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'samsung-galaxy-s25-ultra',
    slug: 'samsung-galaxy-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    shortDescription: 'Titanium perfection with 200MP Quad Telephoto and integrated Bluetooth S Pen.',
    description: 'Factory sealed genuine Samsung Galaxy S25 Ultra. Armed with Qualcomm Snapdragon 8 Elite for Galaxy, anti-reflective Gorilla Armor glass, dual physical SIM Nigerian carrier verified, and 7 years of Android OS updates.',
    basePrice: 2350000,
    compareAtPrice: 2650000,
    costPrice: null,
    badge: 'New',
    status: 'Published',
    isSold: false,
    featured: true,
    images: [
      '/src/assets/images/category_samsung_galaxy_1790352913709.jpg'
    ],
    specs: {
      Display: '6.8-inch Dynamic AMOLED 2X QHD+ (2,600 nits)',
      Processor: 'Snapdragon 8 Elite for Galaxy',
      Camera: '200MP Main + 50MP 5x Periscope + 50MP Ultra Wide + 10MP 3x',
      Stylus: 'Integrated Bluetooth Low Energy S Pen',
      Battery: '5,000mAh with 45W Fast Charging'
    },
    colorOptions: [
      { name: 'Titanium Gray', hex: '#717378' },
      { name: 'Titanium Black', hex: '#232323' },
      { name: 'Titanium Silver', hex: '#D6D8DA' }
    ],
    storageOptions: [
      { capacity: '256GB', presetPrice: 2350000, compareAtPrice: 2650000 },
      { capacity: '512GB', presetPrice: 2650000, compareAtPrice: 2950000 }
    ],
    variants: [
      {
        id: 'v-s25u-256-gray',
        storage: '256GB',
        color: { name: 'Titanium Gray', hex: '#717378' },
        sku: 'ERA-S25U-256-GRY',
        price: 2350000,
        stock: 5,
        lowStockThreshold: 1,
        isSold: false
      },
      {
        id: 'v-s25u-512-black',
        storage: '512GB',
        color: { name: 'Titanium Black', hex: '#232323' },
        sku: 'ERA-S25U-512-BLK',
        price: 2650000,
        stock: 3,
        lowStockThreshold: 1,
        isSold: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'macbook-pro-16-m4-max',
    slug: 'macbook-pro-16-m4-max',
    name: 'MacBook Pro 16-inch (M4 Max)',
    brand: 'Apple',
    category: 'Mac',
    condition: 'Brand New',
    shortDescription: 'The pinnacle of mobile computing with M4 Max silicon and 120Hz Liquid Retina XDR.',
    description: 'Factory sealed Apple MacBook Pro 16-inch with M4 Max. Up to 16-core CPU, 40-core GPU, 128GB unified memory support, and 24-hour battery life. Engineered for Nigerian software engineers, 3D animators, and music producers.',
    basePrice: 4150000,
    compareAtPrice: 4600000,
    costPrice: null,
    badge: 'Limited',
    status: 'Published',
    isSold: false,
    featured: true,
    images: [
      '/src/assets/images/showcase_macbook_pro_1790352903234.jpg'
    ],
    specs: {
      Processor: 'Apple M4 Max (14-core CPU, 32-core GPU)',
      Memory: '36GB Unified Memory (300GB/s bandwidth)',
      Storage: '1TB Ultra-Fast PCIe SSD',
      Screen: '16.2-inch Liquid Retina XDR (1600 nits peak, 120Hz)',
      Ports: '3x Thunderbolt 5, HDMI 2.1, SDXC card slot, MagSafe 3'
    },
    colorOptions: [
      { name: 'Space Black', hex: '#1C1C1E' },
      { name: 'Silver', hex: '#E3E4E5' }
    ],
    storageOptions: [
      { capacity: '1TB SSD', presetPrice: 4150000, compareAtPrice: 4600000 }
    ],
    variants: [
      {
        id: 'v-mbp16-m4max-blk',
        storage: '1TB SSD',
        color: { name: 'Space Black', hex: '#1C1C1E' },
        sku: 'ERA-MBP16-M4M-BLK',
        price: 4150000,
        stock: 3,
        lowStockThreshold: 1,
        isSold: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'airpods-max-usb-c',
    slug: 'airpods-max-usb-c',
    name: 'AirPods Max (USB-C)',
    brand: 'Apple',
    category: 'Accessories',
    condition: 'Brand New',
    shortDescription: 'High-fidelity audio with active noise cancellation, transparency, and USB-C.',
    description: 'Factory sealed Apple AirPods Max with USB-C charging. Computational audio, custom acoustic design, personalized spatial audio with dynamic head tracking, and luxury anodized aluminum ear cups.',
    basePrice: 920000,
    compareAtPrice: 1050000,
    costPrice: null,
    badge: 'Sale',
    status: 'Published',
    isSold: false,
    featured: false,
    images: [
      '/src/assets/images/accessories_airpods_gadgets_1790352927938.jpg'
    ],
    specs: {
      Drivers: 'Apple-designed 40mm dynamic driver',
      Connectivity: 'Bluetooth 5.3 + USB-C lossless audio input',
      NoiseCancellation: 'Pro-grade Active Noise Cancellation with Transparency Mode',
      Battery: 'Up to 20 hours listening on a single charge with ANC'
    },
    colorOptions: [
      { name: 'Midnight', hex: '#1F242B' },
      { name: 'Starlight', hex: '#F0EBE3' }
    ],
    storageOptions: [
      { capacity: 'Standard', presetPrice: 920000, compareAtPrice: 1050000 }
    ],
    variants: [
      {
        id: 'v-apmax-midnight',
        storage: 'Standard',
        color: { name: 'Midnight', hex: '#1F242B' },
        sku: 'ERA-APMAX-MID',
        price: 920000,
        stock: 6,
        lowStockThreshold: 2,
        isSold: false
      },
      {
        id: 'v-apmax-starlight',
        storage: 'Standard',
        color: { name: 'Starlight', hex: '#F0EBE3' },
        sku: 'ERA-APMAX-STA',
        price: 920000,
        stock: 4,
        lowStockThreshold: 1,
        isSold: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
