import {
  FiCoffee, FiScissors, FiGift, FiTool, FiSmartphone, FiHome, FiSend, FiWatch, FiHeadphones, FiEye, FiCamera,
  FiTarget, FiCpu, FiMonitor, FiGrid, FiTruck, FiDollarSign, FiCreditCard, FiMessageCircle, FiShield, FiZap,
  FiTrendingUp, FiStar, FiHeart, FiTag, FiPackage, FiSun, FiMoon, FiDroplet, FiMusic, FiBook, FiFeather,
  FiShoppingBag, FiAward, FiClock, FiThumbsUp, FiUmbrella, FiWind, FiBattery, FiSpeaker, FiTv, FiPercent,
} from 'react-icons/fi';

// Icon names the dashboard can choose from (stored as strings in the database)
export const ICONS = {
  grid: FiGrid, coffee: FiCoffee, scissors: FiScissors, gift: FiGift, tool: FiTool, smartphone: FiSmartphone,
  home: FiHome, send: FiSend, watch: FiWatch, headphones: FiHeadphones, eye: FiEye, camera: FiCamera,
  target: FiTarget, cpu: FiCpu, monitor: FiMonitor, truck: FiTruck, dollar: FiDollarSign, card: FiCreditCard,
  message: FiMessageCircle, shield: FiShield, zap: FiZap, trending: FiTrendingUp, star: FiStar, heart: FiHeart,
  tag: FiTag, package: FiPackage, sun: FiSun, moon: FiMoon, droplet: FiDroplet, music: FiMusic, book: FiBook,
  feather: FiFeather, bag: FiShoppingBag, award: FiAward, clock: FiClock, thumbs: FiThumbsUp, umbrella: FiUmbrella,
  wind: FiWind, battery: FiBattery, speaker: FiSpeaker, tv: FiTv, percent: FiPercent,
};

const BY_NAME = {
  'Home & Kitchen': 'coffee', 'Beauty & Personal Care': 'scissors', 'Kids & Toys': 'gift', 'Tools & Outdoor': 'tool',
  Accessories: 'smartphone', 'Smart Home': 'home', Drones: 'send', 'Smart Watches': 'watch',
  'AirBuds & Headphones': 'headphones', 'VR & AR': 'eye', Cameras: 'camera', Gaming: 'target', 'AI Devices': 'cpu', Laptops: 'monitor',
};

export const Icon = ({ name, ...props }) => {
  const C = ICONS[name] || FiGrid;
  return <C aria-hidden="true" {...props} />;
};

// Category icon: uses the icon chosen in the dashboard, falls back to a sensible default
export const CategoryIcon = ({ name, icon, ...props }) => <Icon name={icon || BY_NAME[name] || 'grid'} {...props} />;

export const categoryHref = (name) => `/products?category=${encodeURIComponent(name)}`;
