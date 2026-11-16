import { motion } from 'framer-motion';
import { FiMessageCircle } from 'react-icons/fi';
import { useWhatsApp } from '../../store/site.js';
import './FloatingWhatsApp.css';

const WHATSAPP_MESSAGE = import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hi PrimeGadgets! I\'m interested in your products.';

export default function FloatingWhatsApp() {
  const WHATSAPP_NUMBER = useWhatsApp();
  const handleClick = () => {
    const encodedMsg = encodeURIComponent(WHATSAPP_MESSAGE);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`, '_blank');
  };

  return (
    <motion.div
      className="floating-whatsapp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, type: 'spring', stiffness: 200 }}
    >
      {/* Pulse Rings */}
      <div className="fw-pulse-ring" />

      {/* Glow Effect */}
      <div className="fw-glow" />

      {/* Main Button */}
      <motion.button
        className="fw-button"
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Chat on WhatsApp"
      >
        <FiMessageCircle size={24} />
      </motion.button>

      {/* Tooltip */}
      <motion.div
        className="fw-tooltip"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.3 }}
      >
        <span>Chat with us!</span>
        <div className="fw-tooltip-arrow" />
      </motion.div>
    </motion.div>
  );
}
