import {
  FiCoffee, FiScissors, FiGift, FiTool, FiSmartphone, FiHome, FiSend, FiWatch,
  FiHeadphones, FiEye, FiCamera, FiTarget, FiCpu, FiMonitor, FiGrid,
} from 'react-icons/fi';

export const CATEGORY_ICONS = {
  'Home & Kitchen': FiCoffee,
  'Beauty & Personal Care': FiScissors,
  'Kids & Toys': FiGift,
  'Tools & Outdoor': FiTool,
  Accessories: FiSmartphone,
  'Smart Home': FiHome,
  Drones: FiSend,
  'Smart Watches': FiWatch,
  'AirBuds & Headphones': FiHeadphones,
  'VR & AR': FiEye,
  Cameras: FiCamera,
  Gaming: FiTarget,
  'AI Devices': FiCpu,
  Laptops: FiMonitor,
};

export const CategoryIcon = ({ name, ...props }) => {
  const Icon = CATEGORY_ICONS[name] || FiGrid;
  return <Icon aria-hidden="true" {...props} />;
};

export const categoryHref = (name) => `/products?category=${encodeURIComponent(name)}`;
