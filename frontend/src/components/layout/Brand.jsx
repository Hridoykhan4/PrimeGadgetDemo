import React from 'react';
import { FiZap } from 'react-icons/fi';
import { useSiteStore } from '../../store/site.js';
import { useThemeStore } from '../../store/index.js';

// Logo uploaded in Admin → Branding; falls back to icon + brand name.
export default function Brand({ size = 36, showName = true, className = '' }) {
  const brand = useSiteStore((s) => s.settings.brand);
  const theme = useThemeStore((s) => s.theme);
  const logo = theme === 'dark' && brand.logoDarkUrl ? brand.logoDarkUrl : brand.logoUrl;
  const name = brand.name || 'PrimeGadgets';

  if (logo) {
    return <img src={logo} alt={name} className={`brand-logo ${className}`} style={{ height: size, width: 'auto', maxWidth: size * 5, objectFit: 'contain', display: 'block' }} />;
  }
  // Split "PrimeGadgets" → Prime|Gadgets for a two-weight wordmark
  const m = name.match(/^([A-Z][a-z]+)([A-Z].*)$/);
  return (
    <span className={`brand-default ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <span className="brand-mark" style={{ width: size, height: size }}><FiZap aria-hidden="true" /></span>
      {showName && (
        <span className="brand-text">{m ? <><strong>{m[1]}</strong>{m[2]}</> : <strong>{name}</strong>}</span>
      )}
    </span>
  );
}
