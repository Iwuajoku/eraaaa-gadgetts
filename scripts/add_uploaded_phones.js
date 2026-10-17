import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'store_data.json');
const raw = fs.readFileSync(DATA_FILE, 'utf-8');
const db = JSON.parse(raw);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Build map of existing phones
const existingSet = new Set();
db.products.forEach((p) => {
  existingSet.add(normalize(p.name));
  existingSet.add(p.id);
  if (p.slug) existingSet.add(p.slug);
  // Also common variations
  existingSet.add(normalize(p.name.replace(/galaxy/i, '')));
  existingSet.add(normalize(p.name.replace(/iphone/i, '')));
});

console.log(`Starting with ${db.products.length} existing products in catalog.`);

// List of all phones from the 7 uploaded price list images
const incomingPhones = [
  // --- IMAGE 1: NEW IPHONES ---
  {
    name: 'iPhone 17',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Brand New',
    badge: 'New Arrival',
    specs: {
      Display: 'Super Retina XDR OLED display',
      Processor: 'Apple A-series Pro Bionic Chip',
      Camera: 'Advanced Dual Camera System with Photonic Engine',
      Battery: 'All-Day Battery Life with Fast Charging',
      Warranty: '1 Year Warranty'
    },
    variants: [
      { storage: '256GB', price: 1350000 },
      { storage: '512GB', price: 1690000 }
    ]
  },

  // --- IMAGE 6 & 7: GRADE A+ FOREIGN USED IPHONES ---
  {
    name: 'iPhone 13 Pro',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Certified Pre-Owned',
    badge: 'Grade A+',
    specs: {
      Display: '6.1-inch Super Retina XDR with ProMotion 120Hz',
      Processor: 'A15 Bionic chip with 5-core GPU',
      Camera: 'Pro 12MP camera system with 3x optical zoom',
      Battery: 'Diagnostic Tested 85%+ Battery Health',
      Warranty: 'Tested with Era Gadgets Warranty'
    },
    variants: [
      { storage: '128GB', price: 520000 },
      { storage: '256GB', price: 560000 }
    ]
  },
  {
    name: 'iPhone 13 Pro Max',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Certified Pre-Owned',
    badge: 'Grade A+',
    specs: {
      Display: '6.7-inch Super Retina XDR with ProMotion 120Hz',
      Processor: 'A15 Bionic chip with 5-core GPU',
      Camera: 'Pro 12MP triple camera with LiDAR Scanner',
      Battery: 'Diagnostic Tested 85%+ Battery Health',
      Warranty: 'Tested with Era Gadgets Warranty'
    },
    variants: [
      { storage: '128GB', price: 620000 },
      { storage: '256GB', price: 650000 }
    ]
  },
  {
    name: 'iPhone 15 Plus',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Certified Pre-Owned',
    badge: 'Grade A+',
    specs: {
      Display: '6.7-inch Super Retina XDR with Dynamic Island',
      Processor: 'A16 Bionic chip',
      Camera: '48MP Main Camera with 2x Telephoto',
      Battery: 'Diagnostic Tested 85%+ Battery Health',
      Warranty: 'Tested with Era Gadgets Warranty'
    },
    variants: [
      { storage: '128GB', price: 720000 }
    ]
  },
  {
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Certified Pre-Owned',
    badge: 'Grade A+',
    specs: {
      Display: '6.1-inch Super Retina XDR with Titanium Design & ProMotion',
      Processor: 'A17 Pro chip with 6-core GPU',
      Camera: '48MP Pro camera system with 3x Telephoto',
      Battery: 'Diagnostic Tested 85%+ Battery Health',
      Warranty: 'Tested with Era Gadgets Warranty'
    },
    variants: [
      { storage: '128GB', price: 859000 },
      { storage: '256GB', price: 920000 },
      { storage: '512GB', price: 970000 }
    ]
  },
  {
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Certified Pre-Owned',
    badge: 'Grade A+',
    specs: {
      Display: '6.7-inch Super Retina XDR Grade 5 Titanium',
      Processor: 'A17 Pro chip with 6-core GPU',
      Camera: '48MP Pro camera system with 5x optical zoom',
      Battery: 'Diagnostic Tested 85%+ Battery Health',
      Warranty: 'Tested with Era Gadgets Warranty'
    },
    variants: [
      { storage: '256GB', price: 1000000 },
      { storage: '512GB', price: 1150000 }
    ]
  },
  {
    name: 'iPhone 16 Plus',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Certified Pre-Owned',
    badge: 'Grade A+',
    specs: {
      Display: '6.7-inch Super Retina XDR with Camera Control',
      Processor: 'A18 chip with Apple Intelligence',
      Camera: '48MP Fusion Camera with 2x Telephoto',
      Battery: 'Tested 90%+ Battery Health',
      Warranty: 'Tested with Era Gadgets Warranty'
    },
    variants: [
      { storage: '128GB', price: 930000 },
      { storage: '256GB', price: 1100000 }
    ]
  },
  {
    name: 'iPhone 16 Pro',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Certified Pre-Owned',
    badge: 'Grade A+',
    specs: {
      Display: '6.3-inch Super Retina XDR with Grade 5 Titanium',
      Processor: 'A18 Pro chip with Apple Intelligence',
      Camera: '48MP Fusion + 48MP Ultra Wide + 5x Telephoto',
      Battery: 'Tested 90%+ Battery Health',
      Warranty: 'Tested with Era Gadgets Warranty'
    },
    variants: [
      { storage: '128GB', price: 1070000 },
      { storage: '256GB', price: 1240000 }
    ]
  },
  {
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    category: 'iPhone',
    condition: 'Certified Pre-Owned',
    badge: 'Grade A+',
    specs: {
      Display: '6.9-inch Super Retina XDR Titanium with Camera Control',
      Processor: 'A18 Pro chip with Apple Intelligence',
      Camera: '48MP Fusion + 48MP Ultra Wide + 5x Telephoto',
      Battery: 'Tested 90%+ Battery Health',
      Warranty: 'Tested with Era Gadgets Warranty'
    },
    variants: [
      { storage: '256GB', price: 1400000 },
      { storage: '512GB', price: 1520000 }
    ]
  },

  // --- IMAGE 2: SAMSUNG FOLDABLE & S-SERIES ---
  {
    name: 'Galaxy Z Fold 7',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: 'Next Gen Foldable',
    specs: {
      Display: 'Dynamic AMOLED 2X 120Hz Foldable Display',
      Processor: 'Snapdragon 8 Elite / Gen Flagship for Galaxy',
      Camera: 'Pro-grade Triple Camera System with Galaxy AI',
      Battery: 'Dual Battery with Super Fast Charging',
      Warranty: 'International Warranty'
    },
    variants: [
      { storage: '256GB', price: 1700000 },
      { storage: '512GB', price: 1900000 },
      { storage: '1TB', price: 2000000 }
    ]
  },
  {
    name: 'Galaxy Z Flip 7',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: 'Next Gen Flip',
    specs: {
      Display: 'Full FlexWindow AMOLED + Dynamic AMOLED 2X 120Hz',
      Processor: 'Snapdragon 8 Elite / Gen Flagship for Galaxy',
      Camera: '50MP Dual Camera with FlexCam',
      Battery: 'All-Day Battery with Fast Wireless Charging',
      Warranty: 'International Warranty'
    },
    variants: [
      { storage: '256GB', price: 900000 },
      { storage: '512GB', price: 1000000 }
    ]
  },
  {
    name: 'Galaxy S25',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: 'Galaxy AI Flagship',
    specs: {
      Display: '6.2-inch Dynamic AMOLED 2X 120Hz',
      Processor: 'Snapdragon 8 Elite for Galaxy',
      Camera: '50MP Triple Camera with Galaxy AI',
      Battery: 'Long-lasting battery with Fast Charging',
      Warranty: 'International Warranty'
    },
    variants: [
      { storage: '256GB', price: 950000 },
      { storage: '512GB', price: 1180000 }
    ]
  },
  {
    name: 'Galaxy S25 Plus',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: 'Galaxy AI Flagship',
    specs: {
      Display: '6.7-inch Dynamic AMOLED 2X QHD+ 120Hz',
      Processor: 'Snapdragon 8 Elite for Galaxy',
      Camera: '50MP Pro Visual Engine with Galaxy AI',
      Battery: '4900mAh with 45W Fast Charging',
      Warranty: 'International Warranty'
    },
    variants: [
      { storage: '256GB', price: 1300000 },
      { storage: '512GB', price: 1450000 }
    ]
  },
  {
    name: 'Galaxy S26',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: 'Next Gen Flagship',
    specs: {
      Display: 'Dynamic AMOLED 2X 120Hz Pro HDR',
      Processor: 'Next Gen Galaxy AI Processor',
      Camera: 'Advanced Triple Camera System',
      Battery: 'Smart Battery Management',
      Warranty: 'International Warranty'
    },
    variants: [
      { storage: '256GB', price: 1170000 }
    ]
  },
  {
    name: 'Galaxy S26 Plus',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: 'Next Gen Flagship',
    specs: {
      Display: 'Large Dynamic AMOLED 2X QHD+ 120Hz',
      Processor: 'Next Gen Galaxy AI Processor',
      Camera: 'Pro Triple Camera with Super Zoom',
      Battery: '45W Ultra Fast Charging',
      Warranty: 'International Warranty'
    },
    variants: [
      { storage: '256GB', price: 1340000 },
      { storage: '512GB', price: 1900000 }
    ]
  },

  // --- IMAGE 5: SAMSUNG GALAXY A-SERIES (24 Months Warranty) ---
  {
    name: 'Galaxy A06',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: '6.7-inch PLS LCD Display',
      Processor: 'Octa-Core Processor',
      Camera: '50MP Dual Rear Camera',
      Battery: '5000mAh with 25W Fast Charging',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '64GB (4+64GB)', price: 146000 },
      { storage: '128GB (4+128GB)', price: 163000 }
    ]
  },
  {
    name: 'Galaxy A06 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: '6.7-inch 5G High-Speed Display',
      Processor: 'Octa-Core 5G Processor',
      Camera: '50MP Dual Rear Camera',
      Battery: '5000mAh Battery',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '64GB (4+64GB)', price: 147000 },
      { storage: '128GB (4+128GB)', price: 166000 }
    ]
  },
  {
    name: 'Galaxy A07',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: '6.7-inch Smooth Display',
      Processor: 'Octa-Core Processor',
      Camera: '50MP Clear Dual Camera',
      Battery: '5000mAh Battery',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '64GB (4+64GB)', price: 174000 },
      { storage: '128GB (4+128GB)', price: 198000 }
    ]
  },
  {
    name: 'Galaxy A07S',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: '6.7-inch High Refresh Screen',
      Processor: 'Octa-Core Performance Chip',
      Camera: '50MP AI Dual Camera',
      Battery: '5000mAh Battery',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '64GB (4+64GB)', price: 193000 },
      { storage: '128GB (4+128GB)', price: 237000 }
    ]
  },
  {
    name: 'Galaxy A08',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: '6.7-inch FHD+ Display',
      Processor: 'Fast Octa-Core Chipset',
      Camera: '50MP High-Resolution Camera',
      Battery: '5000mAh with 25W Fast Charge',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '64GB (4+64GB)', price: 216000 },
      { storage: '128GB (4+128GB)', price: 273000 }
    ]
  },
  {
    name: 'Galaxy A16 4G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: '6.7-inch Super AMOLED 90Hz',
      Processor: 'Octa-Core Processor',
      Camera: '50MP Triple Camera',
      Battery: '5000mAh with 25W Charging',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 206000 }
    ]
  },
  {
    name: 'Galaxy A16 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: '6.7-inch Super AMOLED 90Hz 5G',
      Processor: 'Exynos 1330 / Dimensity 6300 5G',
      Camera: '50MP Triple Camera System',
      Battery: '5000mAh with 25W Charging',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '256GB (4+256GB)', price: 420000 }
    ]
  },
  {
    name: 'Galaxy A17',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: 'Super AMOLED 90Hz Display',
      Processor: 'High Efficiency Octa-Core',
      Camera: '50MP OIS Triple Camera',
      Battery: '5000mAh All-Day Battery',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 247000 },
      { storage: '128GB (6+128GB)', price: 294000 },
      { storage: '256GB (8+256GB)', price: 420000 }
    ]
  },
  {
    name: 'Galaxy A17 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: 'Super AMOLED 5G Display',
      Processor: 'Fast 5G Octa-Core Chip',
      Camera: '50MP Triple Camera',
      Battery: '5000mAh Battery',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 294000 }
    ]
  },
  {
    name: 'Galaxy A25 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: '6.5-inch Super AMOLED 120Hz 1000 nits',
      Processor: 'Exynos 1280 5G Chipset',
      Camera: '50MP OIS Triple Camera',
      Battery: '5000mAh with 25W Fast Charge',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (6+128GB)', price: 381000 }
    ]
  },
  {
    name: 'Galaxy A26 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: 'Super AMOLED 120Hz 5G Display',
      Processor: 'High Speed 5G Octa-Core',
      Camera: '50MP OIS Triple Camera',
      Battery: '5000mAh Battery',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (6+128GB)', price: 370000 },
      { storage: '256GB (8+256GB)', price: 468000 }
    ]
  },
  {
    name: 'Galaxy A27 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: 'Super AMOLED 120Hz HDR',
      Processor: 'Enhanced 5G Gaming Processor',
      Camera: '50MP OIS Triple Camera',
      Battery: '5000mAh Battery',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (6+128GB)', price: 378000 },
      { storage: '256GB (8+256GB)', price: 499000 }
    ]
  },
  {
    name: 'Galaxy A36 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: 'Super AMOLED 120Hz with IP67 Water Resistance',
      Processor: 'Snapdragon / Exynos 5G Chipset',
      Camera: '50MP OIS Triple Camera',
      Battery: '5000mAh with 25W Charging',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (6+128GB)', price: 480000 },
      { storage: '256GB (8+256GB)', price: 557000 }
    ]
  },
  {
    name: 'Galaxy A37 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: 'Super AMOLED 120Hz Vision Booster',
      Processor: 'High Performance 5G Processor',
      Camera: '50MP OIS Triple Camera with Nightography',
      Battery: '5000mAh Battery',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (6+128GB)', price: 462000 },
      { storage: '256GB (8+256GB)', price: 573000 }
    ]
  },
  {
    name: 'Galaxy A56 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: '6.6-inch Super AMOLED 120Hz HDR10+ with Metal Frame',
      Processor: 'Exynos 1580 / Flagship 5G Processor',
      Camera: '50MP OIS + 12MP Ultra-Wide + Macro',
      Battery: '5000mAh with 45W Fast Charging Support',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (8+128GB)', price: 578000 },
      { storage: '256GB (8+256GB)', price: 641000 }
    ]
  },
  {
    name: 'Galaxy A57 5G',
    brand: 'Samsung',
    category: 'Samsung',
    condition: 'Brand New',
    badge: '24M Warranty',
    specs: {
      Display: 'Super AMOLED 120Hz Pro Display with Armor Aluminum',
      Processor: 'Top Tier 5G Flagship Chip',
      Camera: '50MP OIS Pro Grade Camera',
      Battery: '5000mAh with Fast Charging',
      Warranty: '24 Months Official Nigeria Warranty'
    },
    variants: [
      { storage: '128GB (8+128GB)', price: 557000 },
      { storage: '256GB (8+256GB)', price: 625000 }
    ]
  },

  // --- IMAGE 3: INFINIX SMARTPHONES ---
  {
    name: 'Infinix Smart 10 HD',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Budget Value',
    specs: {
      Display: '6.6-inch HD+ Punch-Hole Display',
      Processor: 'Quad-Core / Octa-Core Processor',
      Camera: '13MP Dual AI Camera',
      Battery: '5000mAh All-Day Battery',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '64GB (2+64GB)', price: 123000 }
    ]
  },
  {
    name: 'Infinix Smart 10',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Budget Value',
    specs: {
      Display: '6.6-inch HD+ 90Hz Display',
      Processor: 'Octa-Core Processor with Extended RAM',
      Camera: '13MP Dual Camera with Flash',
      Battery: '5000mAh Battery',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '64GB (3+64GB)', price: 126000 }
    ]
  },
  {
    name: 'Infinix Smart 10 Plus',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Budget Value',
    specs: {
      Display: '6.7-inch HD+ 90Hz Screen',
      Processor: 'Octa-Core Processor',
      Camera: '50MP AI Main Camera',
      Battery: '6000mAh Mega Battery',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 153000 }
    ]
  },
  {
    name: 'Infinix Smart 20',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'New Arrival',
    specs: {
      Display: '6.7-inch Dynamic Display 120Hz',
      Processor: 'Octa-Core Gaming Processor',
      Camera: '50MP Dual Camera',
      Battery: '5000mAh with Type-C Charging',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '64GB (4+64GB)', price: 163000 },
      { storage: '128GB (4+128GB)', price: 184000 }
    ]
  },
  {
    name: 'Infinix Smart 20 HD',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'New Arrival',
    specs: {
      Display: '6.6-inch HD+ Display',
      Processor: 'Octa-Core Processor',
      Camera: '13MP Dual Camera',
      Battery: '5000mAh Battery',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '64GB (3+64GB)', price: 153000 }
    ]
  },
  {
    name: 'Infinix Hot 60i',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Hot Series',
    specs: {
      Display: '6.7-inch 90Hz Punch-Hole Display',
      Processor: 'Helio G-Series Octa-Core',
      Camera: '50MP AI Rear Camera',
      Battery: '5000mAh with 18W Fast Charge',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 170000 }
    ]
  },
  {
    name: 'Infinix Hot 60 Pro',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Hot Series',
    specs: {
      Display: '6.78-inch FHD+ 120Hz AMOLED',
      Processor: 'MediaTek Helio G99 / G100 Chipset',
      Camera: '108MP Ultra-Clear Triple Camera',
      Battery: '5000mAh with 33W Fast Charging',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '128GB (8+128GB)', price: 244000 }
    ]
  },
  {
    name: 'Infinix Hot 70',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Hot Series',
    specs: {
      Display: '6.78-inch 120Hz Punch-Hole Display',
      Processor: 'High-Speed Octa-Core Processor',
      Camera: '50MP Dual Rear Camera',
      Battery: '5000mAh with Fast Charging',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 230000 },
      { storage: '256GB (6+256GB)', price: 306000 }
    ]
  },
  {
    name: 'Infinix Hot 70 Pro',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Hot Series',
    specs: {
      Display: '6.78-inch FHD+ AMOLED 120Hz',
      Processor: 'Gaming Octa-Core Chipset',
      Camera: '108MP OIS Camera with Night Mode',
      Battery: '5000mAh with 45W Fast Charging',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '128GB (6+128GB)', price: 399000 },
      { storage: '256GB (8+256GB)', price: 479000 }
    ]
  },
  {
    name: 'Infinix Note 60 Ultra',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Flagship Note',
    specs: {
      Display: '6.8-inch Curved 3D AMOLED 144Hz 1.5K',
      Processor: 'Dimensity High-End 5G Chipset',
      Camera: '200MP OIS Periscope Triple Camera',
      Battery: '5000mAh with 100W All-Round FastCharge',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '256GB (12+256GB)', price: 998000 },
      { storage: '512GB (12+512GB)', price: 1247000 }
    ]
  },
  {
    name: 'Infinix Note Edge',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Curved Display',
    specs: {
      Display: '6.78-inch 3D Curved AMOLED 120Hz',
      Processor: 'MediaTek Dimensity 5G Processor',
      Camera: '108MP OIS Ultra Clear Camera',
      Battery: '5000mAh with 45W Fast Charging',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '128GB (8+128GB)', price: 448000 },
      { storage: '256GB (8+256GB)', price: 497000 }
    ]
  },
  {
    name: 'Infinix Note 60 Pro',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Note Pro',
    specs: {
      Display: '6.78-inch AMOLED 120Hz JBL Tuned Audio',
      Processor: 'MediaTek Dimensity Octa-Core 5G',
      Camera: '108MP OIS Camera with 2K Video',
      Battery: '5000mAh with 70W FastCharge',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '256GB (8+256GB)', price: 597000 }
    ]
  },
  {
    name: 'Infinix Xpad 30 Pro',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Pro Tablet',
    specs: {
      Display: '11.0-inch 2.5K 120Hz Eye-Care Display',
      Processor: 'MediaTek Helio G99 Ultimate Octa-Core',
      Camera: '13MP Rear + 8MP Front Quad Speakers',
      Battery: '7000mAh Long-Life Battery with 33W Fast Charge',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '256GB (8+256GB)', price: 455000 }
    ]
  },
  {
    name: 'Infinix Xpad 30E',
    brand: 'Infinix',
    category: 'Infinix',
    condition: 'Brand New',
    badge: 'Tablet',
    specs: {
      Display: '11.0-inch FHD+ Bright Screen with Folax Voice Assistant',
      Processor: 'Octa-Core Processor',
      Camera: '8MP Camera with Stereo Speakers',
      Battery: '7000mAh Battery',
      Warranty: '1 Year Manufacturer Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 249000 },
      { storage: '256GB (8+256GB)', price: 377000 }
    ]
  },

  // --- IMAGE 4: XIAOMI / REDMI SMARTPHONES ---
  {
    name: 'Redmi A5',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Budget Value',
    specs: {
      Display: '6.52-inch HD+ Dot Drop Display',
      Processor: 'Quad-Core / Octa-Core Processor',
      Camera: '8MP AI Dual Camera',
      Battery: '5000mAh Battery',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '64GB (3+64GB)', price: 116000 },
      { storage: '64GB (4+64GB)', price: 119000 },
      { storage: '128GB (4+128GB)', price: 136000 }
    ]
  },
  {
    name: 'Redmi A7',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Budget Value',
    specs: {
      Display: '6.71-inch HD+ 90Hz Display',
      Processor: 'Octa-Core Processor',
      Camera: '13MP AI Dual Camera',
      Battery: '5000mAh with Type-C Charging',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '64GB (3+64GB)', price: 141000 }
    ]
  },
  {
    name: 'Redmi A7 Pro',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'New Arrival',
    specs: {
      Display: '6.71-inch 90Hz Smooth Display',
      Processor: 'High-Efficiency Octa-Core',
      Camera: '50MP Dual Rear Camera',
      Battery: '5000mAh Battery with Fast Charging',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '64GB (4+64GB)', price: 175000 },
      { storage: '128GB (4+128GB)', price: 184000 }
    ]
  },
  {
    name: 'Redmi 15C',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Popular',
    specs: {
      Display: '6.88-inch 120Hz Eye-Care Display',
      Processor: 'MediaTek Helio G81-Ultra Octa-Core',
      Camera: '50MP AI Dual Camera with Film Filters',
      Battery: '5160mAh with 18W Fast Charging',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 188000 },
      { storage: '128GB (6+128GB)', price: 202000 },
      { storage: '256GB (8+256GB)', price: 242000 }
    ]
  },
  {
    name: 'Redmi 15C 5G',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: '5G Speed',
    specs: {
      Display: '6.88-inch 120Hz 5G Display',
      Processor: 'MediaTek Dimensity 5G Octa-Core',
      Camera: '50MP AI Rear Camera',
      Battery: '5160mAh Battery with 18W Charging',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 195000 }
    ]
  },
  {
    name: 'Redmi 15',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Best Value',
    specs: {
      Display: '6.79-inch FHD+ 90Hz Display',
      Processor: 'Snapdragon 4 Gen 2 / Helio G91-Ultra',
      Camera: '108MP Super Clear Main Camera',
      Battery: '5030mAh with 33W Fast Charging',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '128GB (6+128GB)', price: 228000 },
      { storage: '256GB (8+256GB)', price: 276000 }
    ]
  },
  {
    name: 'Redmi Note 13 Pro+ 5G',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Pro 5G',
    specs: {
      Display: '6.67-inch Curved 1.5K 120Hz CrystalRes AMOLED',
      Processor: 'MediaTek Dimensity 7200-Ultra (4nm)',
      Camera: '200MP OIS Flagship Camera',
      Battery: '5000mAh with 120W HyperCharge',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '512GB (12+512GB)', price: 683000 }
    ]
  },
  {
    name: 'Redmi Note 15',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Note Series',
    specs: {
      Display: '6.67-inch FHD+ AMOLED 120Hz',
      Processor: 'Snapdragon Octa-Core Chipset',
      Camera: '108MP Triple Camera System',
      Battery: '5000mAh with 33W Turbo Charging',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '128GB (6+128GB)', price: 316000 },
      { storage: '256GB (8+256GB)', price: 352000 },
      { storage: '512GB (12+512GB)', price: 525000 }
    ]
  },
  {
    name: 'Redmi Note 15 Pro',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Note Pro',
    specs: {
      Display: '6.67-inch 1.5K 120Hz AMOLED HDR10+',
      Processor: 'MediaTek Dimensity / Snapdragon Pro Chip',
      Camera: '200MP OIS Camera with 4K Video',
      Battery: '5100mAh with 67W Turbo Charge',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '256GB (8+256GB)', price: 457000 }
    ]
  },
  {
    name: 'Redmi Note 15 Pro+ 5G',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Note Pro+ 5G',
    specs: {
      Display: '6.67-inch Curved 1.5K 120Hz AMOLED',
      Processor: 'Flagship 5G Processor',
      Camera: '200MP OIS Super Dynamic Sensor',
      Battery: '5000mAh with 120W HyperCharge',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '256GB (8+256GB)', price: 657000 },
      { storage: '512GB (12+512GB)', price: 732000 }
    ]
  },
  {
    name: 'Redmi 17',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'New Arrival',
    specs: {
      Display: '6.8-inch FHD+ 120Hz Display',
      Processor: 'High-Performance Octa-Core Chipset',
      Camera: '50MP Dual Rear Camera with AI',
      Battery: '5100mAh with 33W Fast Charge',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '128GB (4+128GB)', price: 217000 },
      { storage: '128GB (6+128GB)', price: 276000 },
      { storage: '256GB (6+256GB)', price: 307000 }
    ]
  },
  {
    name: 'Xiaomi 17T',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Leica Optics',
    specs: {
      Display: '6.67-inch 144Hz CrystalRes AMOLED 4000 nits',
      Processor: 'MediaTek Dimensity 8400-Ultra / 9300+',
      Camera: '50MP Leica Professional Triple Camera',
      Battery: '5000mAh with 67W HyperCharge',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '512GB (12+512GB)', price: 861000 }
    ]
  },
  {
    name: 'Xiaomi 17T Pro',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Leica Pro',
    specs: {
      Display: '6.67-inch 144Hz CrystalRes AMOLED Pro Display',
      Processor: 'MediaTek Dimensity 9400 / Flagship 4nm',
      Camera: '50MP Leica Triple System with 5x Telephoto',
      Battery: '5000mAh with 120W HyperCharge',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '1TB (12+1024GB)', price: 1224000 }
    ]
  },
  {
    name: 'Redmi Note 17',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'New Arrival',
    specs: {
      Display: '6.67-inch AMOLED 120Hz Display',
      Processor: 'Next Gen Octa-Core 5G Processor',
      Camera: '108MP Clear Camera',
      Battery: '5000mAh with 33W Turbo Charging',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '128GB (6+128GB)', price: 379000 },
      { storage: '256GB (8+256GB)', price: 429000 }
    ]
  },
  {
    name: 'Redmi Note 17 Pro 5G',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'New Arrival 5G',
    specs: {
      Display: '6.67-inch 1.5K 120Hz AMOLED Pro',
      Processor: 'Fast 5G Gaming Chipset',
      Camera: '200MP OIS Triple Camera System',
      Battery: '5100mAh with 67W Turbo Charge',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '256GB (8+256GB)', price: 558000 },
      { storage: '512GB (8+512GB)', price: 638000 }
    ]
  },
  {
    name: 'Redmi Note 17 Pro Max 5G',
    brand: 'Xiaomi',
    category: 'Xiaomi',
    condition: 'Brand New',
    badge: 'Flagship 5G',
    specs: {
      Display: '6.78-inch 1.5K 144Hz AMOLED Display',
      Processor: 'Flagship 5G Performance Processor',
      Camera: '200MP OIS Super Pixel Camera with 4K 60fps',
      Battery: '5200mAh with 120W HyperCharge',
      Warranty: '1 Year Xiaomi Warranty'
    },
    variants: [
      { storage: '256GB (8+256GB)', price: 699000 },
      { storage: '512GB (12+512GB)', price: 765000 }
    ]
  }
];

let addedCount = 0;
let skippedCount = 0;

for (const p of incomingPhones) {
  const norm = normalize(p.name);
  if (existingSet.has(norm)) {
    console.log(`[SKIP] Phone already exists: "${p.name}"`);
    skippedCount++;
    continue;
  }

  const id = slugify(p.name);
  if (existingSet.has(id)) {
    console.log(`[SKIP] Phone ID already exists: "${p.name}" (${id})`);
    skippedCount++;
    continue;
  }

  // Build storage options
  const storageOptions = p.variants.map((v) => ({
    capacity: v.storage,
    presetPrice: v.price,
    compareAtPrice: Math.round(v.price * 1.15)
  }));

  // Build variants
  const variants = p.variants.map((v, idx) => ({
    id: `v-${id}-${slugify(v.storage)}`,
    storage: v.storage,
    color: { name: 'Standard', hex: '#1C1917' },
    sku: `ERA-${id.toUpperCase().slice(0, 10)}-${slugify(v.storage).toUpperCase()}`,
    price: v.price,
    compareAtPrice: Math.round(v.price * 1.15),
    stock: 10,
    lowStockThreshold: 2,
    isSold: false,
    image: ''
  }));

  const basePrice = Math.min(...p.variants.map((v) => v.price));

  const newProduct = {
    id,
    slug: id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    condition: p.condition,
    basePrice,
    compareAtPrice: Math.round(basePrice * 1.15),
    costPrice: null,
    badge: p.badge || 'New Arrival',
    status: 'Published',
    isSold: false,
    featured: false,
    shortDescription: `${p.condition} ${p.name} available in Nigeria with warranty.`,
    description: `Genuine ${p.name} available at Era Gadgets. 100% verified authentic, tested and covered by warranty with fast nationwide delivery.`,
    images: [], // User explicitly instructed: "leave the product image out of it i'll get it myself"
    specs: p.specs,
    colorOptions: [{ name: 'Standard', hex: '#1C1917' }],
    storageOptions,
    variants,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products.push(newProduct);
  existingSet.add(norm);
  existingSet.add(id);
  addedCount++;
  console.log(`[ADD] Created product: "${p.name}" (${p.variants.length} storage options, from ₦${basePrice.toLocaleString()})`);
}

fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
console.log(`\nCOMPLETED: Added ${addedCount} new individual phone products. Skipped ${skippedCount} existing phones. Total catalog size: ${db.products.length}.`);
