const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

mongoose.connect(process.env.MONGO_URI);

const products = [
  {
    name: 'DJI Mavic 3 Pro Drone',
    shortDescription: 'Tri-camera system, 43-min flight, Hasselblad imaging',
    description: 'The DJI Mavic 3 Pro features a tri-camera system with Hasselblad Main Camera, delivering stunning aerial imagery. With 43 minutes of flight time and omnidirectional obstacle sensing, it\'s the ultimate professional drone for Dubai\'s skyline photography.',
    price: 3299, salePrice: 2899, category: 'Drones', brand: 'DJI',
    stock: 15, isFeatured: true, isBestSeller: true, isDeal: true, isNew: false,
    warranty: '1 Year', sku: 'DJI-M3P-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800', alt: 'DJI Mavic 3 Pro' },
      { url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800', alt: 'DJI drone flying' }
    ],
    features: ['Hasselblad L-Format Camera', '43-Min Max Flight Time', 'Omnidirectional Obstacle Sensing', 'O3+ Video Transmission', '4/3 CMOS Sensor', '5.1K Video'],
    specifications: [
      { group: 'Camera', key: 'Main Camera', value: 'Hasselblad L-Format 4/3 CMOS' },
      { group: 'Camera', key: 'Video Resolution', value: '5.1K/50fps' },
      { group: 'Flight', key: 'Max Flight Time', value: '43 minutes' },
      { group: 'Flight', key: 'Max Speed', value: '21 m/s' },
      { group: 'Connectivity', key: 'Video Transmission', value: 'O3+ (up to 15 km)' }
    ],
    tags: ['drone', 'dji', 'camera drone', 'aerial photography', '4k'],
    deliveryInfo: 'Free Express Delivery in Dubai (2-3 days)',
    metaTitle: 'DJI Mavic 3 Pro Drone - Buy in Dubai | PrimeGadgets',
  },
  {
    name: 'Apple AirPods Pro 2nd Gen',
    shortDescription: 'H2 chip, adaptive transparency, up to 30h battery',
    description: 'Apple AirPods Pro 2nd generation features the H2 chip for richer audio and up to 2x more Active Noise Cancellation. With Adaptive Transparency and Personalized Spatial Audio, experience music the way it was meant to be heard.',
    price: 999, salePrice: 849, category: 'AirBuds & Headphones', brand: 'Apple',
    stock: 45, isFeatured: true, isBestSeller: true, isDeal: true,
    warranty: '1 Year', sku: 'APL-APP2-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1588423771073-b8903febb85b?w=800', alt: 'AirPods Pro' },
      { url: 'https://images.unsplash.com/photo-1606741965509-717f015a7b37?w=800', alt: 'AirPods case' }
    ],
    features: ['H2 Chip', 'Active Noise Cancellation', 'Adaptive Transparency', 'Personalized Spatial Audio', 'MagSafe Charging Case', '30hr Total Battery'],
    specifications: [
      { group: 'Audio', key: 'Chip', value: 'Apple H2' },
      { group: 'Battery', key: 'AirPods', value: '6 hours (ANC on)' },
      { group: 'Battery', key: 'Total with Case', value: '30 hours' },
      { group: 'Connectivity', key: 'Bluetooth', value: '5.3' }
    ],
    tags: ['airpods', 'apple', 'wireless earbuds', 'noise cancelling'],
  },
  {
    name: 'Samsung Galaxy Watch Ultra',
    shortDescription: '47mm titanium, health monitoring, 60hr battery',
    description: 'The Samsung Galaxy Watch Ultra is built for extreme performance with a titanium case and advanced health monitoring. Track everything from sleep to heart rate with military-grade durability and a stunning AMOLED display.',
    price: 2199, salePrice: 1899, category: 'Smart Watches', brand: 'Samsung',
    stock: 22, isFeatured: true, isNew: true,
    warranty: '2 Years', sku: 'SAM-GWU-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', alt: 'Samsung Galaxy Watch' },
      { url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800', alt: 'smartwatch detail' }
    ],
    features: ['Titanium Frame', 'Advanced Health Monitoring', '60hr Battery Life', 'Water Resistant 100m', 'BioActive Sensor', 'Wear OS'],
    specifications: [
      { group: 'Display', key: 'Size', value: '1.47" Super AMOLED' },
      { group: 'Build', key: 'Case Material', value: 'Grade 4 Titanium' },
      { group: 'Battery', key: 'Life', value: 'Up to 60 hours' },
      { group: 'Water', key: 'Resistance', value: '10 ATM / MIL-STD-810' }
    ],
    tags: ['smartwatch', 'samsung', 'wearable', 'health tracking'],
  },
  {
    name: 'Meta Quest 3 VR Headset',
    shortDescription: 'Mixed reality, 120Hz display, 4K+ resolution',
    description: 'Step into the future with Meta Quest 3 — the most advanced mixed reality headset. Experience VR and MR with breakthrough pancake optics, 4K+ resolution, and 2x the graphics processing power of Quest 2.',
    price: 1799, salePrice: 0, category: 'VR & AR', brand: 'Meta',
    stock: 18, isFeatured: true, isNew: true,
    warranty: '1 Year', sku: 'META-Q3-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800', alt: 'VR headset' },
      { url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800', alt: 'VR experience' }
    ],
    features: ['Mixed Reality', '4K+ Resolution per eye', 'Snapdragon XR2 Gen 2', 'Pancake Optics', '2.2x GPU Performance', 'Hand Tracking'],
    specifications: [
      { group: 'Display', key: 'Resolution', value: '2064 x 2208 per eye' },
      { group: 'Display', key: 'Refresh Rate', value: 'Up to 120Hz' },
      { group: 'Processor', key: 'Chip', value: 'Snapdragon XR2 Gen 2' },
      { group: 'Storage', key: 'Options', value: '128GB / 512GB' }
    ],
    tags: ['vr', 'meta quest', 'virtual reality', 'mixed reality'],
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    shortDescription: 'Industry-leading ANC, 30hr battery, Hi-Res audio',
    description: 'Sony WH-1000XM5 headphones deliver industry-leading noise cancellation with 8 microphones and advanced processor V1. Experience exceptional sound quality with 30-hour battery life and quick charging.',
    price: 1499, salePrice: 1199, category: 'AirBuds & Headphones', brand: 'Sony',
    stock: 30, isFeatured: false, isBestSeller: true, isDeal: true,
    warranty: '1 Year', sku: 'SONY-XM5-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800', alt: 'Sony headphones' },
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'headphones detail' }
    ],
    features: ['8 Microphone ANC', '30hr Battery', '3min Quick Charge (3hr playback)', 'Hi-Res Audio', 'LDAC Support', 'Multipoint Connection'],
    specifications: [
      { group: 'Audio', key: 'Driver', value: '30mm dynamic' },
      { group: 'Battery', key: 'Life', value: '30 hours (ANC on)' },
      { group: 'Connectivity', key: 'Bluetooth', value: '5.2 with LDAC' },
      { group: 'Weight', key: 'Headphones', value: '250g' }
    ],
    tags: ['headphones', 'sony', 'noise cancelling', 'wireless'],
  },
  {
    name: 'GoPro HERO12 Black',
    shortDescription: '5.3K60 video, HyperSmooth 6.0, waterproof to 10m',
    description: 'HERO12 Black delivers the best image quality ever in a GoPro. Shoot 5.3K60 video, 27MP photos, and experience the best-ever HyperSmooth 6.0 video stabilization. It\'s waterproof to 10m without a housing.',
    price: 1899, salePrice: 1599, category: 'Cameras', brand: 'GoPro',
    stock: 25, isFeatured: true, isDeal: true,
    warranty: '1 Year', sku: 'GOPRO-H12-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800', alt: 'GoPro camera' },
      { url: 'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?w=800', alt: 'action camera' }
    ],
    features: ['5.3K60 Video', 'HyperSmooth 6.0', 'Max Lens Mod 2.0', 'Waterproof to 10m', 'HDR Video', '27MP Photos'],
    specifications: [
      { group: 'Video', key: 'Max Resolution', value: '5.3K/60fps' },
      { group: 'Photo', key: 'Max Resolution', value: '27MP' },
      { group: 'Stabilization', key: 'Type', value: 'HyperSmooth 6.0' },
      { group: 'Waterproofing', key: 'Depth', value: '10m (33ft)' }
    ],
    tags: ['gopro', 'action camera', '4k', 'waterproof'],
  },
  {
    name: 'Apple Vision Pro',
    shortDescription: 'Spatial computing, micro-OLED, EyeSight display',
    description: 'Apple Vision Pro is a revolutionary spatial computer that seamlessly blends digital content with your physical space. With an ultra-high-resolution display system, it\'s the most advanced personal electronics device ever created.',
    price: 14999, salePrice: 0, category: 'VR & AR', brand: 'Apple',
    stock: 8, isFeatured: true, isNew: true,
    warranty: '1 Year', sku: 'APL-AVP-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1679420437432-80cfba4b5c17?w=800', alt: 'Apple Vision Pro' },
      { url: 'https://images.unsplash.com/photo-1625401880939-fea7c32cc3e5?w=800', alt: 'spatial computing' }
    ],
    features: ['Spatial Computing', 'Micro-OLED Display', 'EyeSight™', 'M2 + R1 Chips', 'Optic ID', 'visionOS'],
    specifications: [
      { group: 'Display', key: 'Type', value: 'Micro-OLED 23M pixels' },
      { group: 'Processor', key: 'Chips', value: 'Apple M2 + R1' },
      { group: 'Input', key: 'Methods', value: 'Eyes, hands, voice' },
      { group: 'Storage', key: 'Options', value: '256GB / 512GB / 1TB' }
    ],
    tags: ['apple', 'vision pro', 'spatial computing', 'ar vr'],
  },
  {
    name: 'DJI Osmo Pocket 3',
    shortDescription: '1-inch CMOS, 4K/120fps, ActiveTrack 3.0',
    description: 'DJI Osmo Pocket 3 is equipped with the industry\'s first 1-inch CMOS sensor in a compact form, delivering cinematic 4K/120fps video. The 2-inch OLED touchscreen and ActiveTrack 3.0 make it perfect for vloggers.',
    price: 1599, salePrice: 1399, category: 'Cameras', brand: 'DJI',
    stock: 20, isFeatured: true, isNew: true,
    warranty: '1 Year', sku: 'DJI-OP3-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', alt: 'pocket camera' },
      { url: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800', alt: 'camera detail' }
    ],
    features: ['1-inch CMOS Sensor', '4K/120fps', 'ActiveTrack 3.0', '2" OLED Touchscreen', '166-min Battery', 'D-Log M'],
    specifications: [
      { group: 'Sensor', key: 'Type', value: '1-inch CMOS' },
      { group: 'Video', key: 'Max Resolution', value: '4K/120fps' },
      { group: 'Display', key: 'Screen', value: '2-inch OLED' },
      { group: 'Battery', key: 'Life', value: '166 minutes' }
    ],
    tags: ['dji', 'pocket camera', 'vlog', 'stabilizer'],
  },
  {
    name: 'Samsung 49" Odyssey OLED G9',
    shortDescription: 'OLED, 240Hz, 0.03ms, Dual QHD curved gaming monitor',
    description: 'Experience gaming like never before with the Samsung Odyssey OLED G9. A massive 49-inch DQHD OLED panel with 240Hz refresh rate and 0.03ms response time delivers pixel-perfect, tear-free gaming.',
    price: 5999, salePrice: 5299, category: 'Gaming', brand: 'Samsung',
    stock: 10, isFeatured: false, isBestSeller: true,
    warranty: '3 Years', sku: 'SAM-G9-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1593640408182-31c228b29df2?w=800', alt: 'gaming monitor' },
      { url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800', alt: 'curved monitor' }
    ],
    features: ['OLED Panel', '240Hz Refresh Rate', '0.03ms Response', '5120x1440 DQHD', 'G-Sync Compatible', 'Smart Hub'],
    specifications: [
      { group: 'Display', key: 'Size', value: '49 inches' },
      { group: 'Display', key: 'Resolution', value: '5120x1440 (DQHD)' },
      { group: 'Performance', key: 'Refresh Rate', value: '240Hz' },
      { group: 'Performance', key: 'Response Time', value: '0.03ms (GTG)' }
    ],
    tags: ['monitor', 'gaming', 'oled', 'samsung', 'ultrawide'],
  },
  {
    name: 'Razer DeathAdder V3 HyperSpeed',
    shortDescription: 'Wireless gaming mouse, Focus Pro 30K optical sensor',
    description: 'The Razer DeathAdder V3 HyperSpeed is the wireless evolution of the world\'s most popular gaming mouse. Featuring the 30K DPI Focus Pro optical sensor and Razer HyperSpeed wireless at an ultra-lightweight 63g.',
    price: 499, salePrice: 399, category: 'Gaming', brand: 'Razer',
    stock: 55, isFeatured: false, isBestSeller: true, isDeal: true,
    warranty: '2 Years', sku: 'RZR-DAV3-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800', alt: 'gaming mouse' },
      { url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800', alt: 'mouse detail' }
    ],
    features: ['Focus Pro 30K Optical Sensor', '63g Ultra-Lightweight', 'HyperSpeed Wireless', '300hr Battery', '9 Programmable Buttons', 'Razer Chroma RGB'],
    specifications: [
      { group: 'Sensor', key: 'DPI', value: '100-30,000 DPI' },
      { group: 'Build', key: 'Weight', value: '63g' },
      { group: 'Wireless', key: 'Technology', value: 'Razer HyperSpeed' },
      { group: 'Battery', key: 'Life', value: '300 hours' }
    ],
    tags: ['gaming mouse', 'razer', 'wireless', 'esports'],
  }
];

const users = [
  { name: 'PrimeGadgets Admin', email: 'admin@primegadgets.ae', password: 'admin@PG2024', role: 'admin' },
  { name: 'Ahmed Al Mansouri', email: 'ahmed@example.com', password: 'password123', role: 'user' },
];

const importData = async () => {
  try {
    await Order.deleteMany(); await Product.deleteMany(); await User.deleteMany();
    const createdUsers = await User.create(users);
    const admin = createdUsers[0]._id;
    await Product.create(products.map(p => ({ ...p, createdBy: admin })));
    console.log('✅ PrimeGadgets data seeded!'.green.bold);
    console.log('👤 Admin: admin@primegadgets.ae / admin@PG2024'.cyan);
    process.exit();
  } catch (err) { console.error(err); process.exit(1); }
};

const destroyData = async () => {
  try {
    await Order.deleteMany(); await Product.deleteMany(); await User.deleteMany();
    console.log('🗑️  Data destroyed'.red.bold);
    process.exit();
  } catch (err) { console.error(err); process.exit(1); }
};

process.argv[2] === '-d' ? destroyData() : importData();
