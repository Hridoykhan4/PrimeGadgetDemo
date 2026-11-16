// Site-wide content from the dashboard: branding, contact, delivery fees, banners, home sections, categories.
import { create } from 'zustand';
import api from '../utils/api';

export const DEFAULT_SETTINGS = {
  brand: { name: 'PrimeGadgets', tagline: 'Everyday essentials at low prices, delivered fast in the UAE', primaryColor: '#0066ff' },
  contact: { whatsapp: '971581234567', email: 'support@primegadgets.ae', address: 'Delivering across the UAE' },
  social: {},
  promo: { enabled: true, items: ['Free delivery over AED 200', 'Cash on delivery across the UAE'], showTrackLink: true },
  commerce: { currency: 'AED', freeShippingMin: 200, shippingFee: 15, vatRate: 5, codEnabled: true, cardEnabled: true },
  seo: {},
  footer: {},
};

const merge = (s = {}) => {
  const out = { ...DEFAULT_SETTINGS };
  Object.keys(DEFAULT_SETTINGS).forEach((k) => { out[k] = { ...DEFAULT_SETTINGS[k], ...(s[k] || {}) }; });
  return out;
};

// Cached copy so the header/brand render instantly on repeat visits
const readCache = () => { try { return JSON.parse(localStorage.getItem('pg-site') || 'null'); } catch { return null; } };

export const useSiteStore = create((set, get) => {
  const cached = readCache();
  return {
    settings: merge(cached?.settings),
    banners: cached?.banners || { hero: [], side: [] },
    sections: cached?.sections || [],
    categories: cached?.categories || [],
    loaded: false,
    loading: false,
    load: async (force = false) => {
      if ((get().loaded || get().loading) && !force) return;
      set({ loading: true });
      try {
        const { data } = await api.get('/storefront');
        const next = { settings: merge(data.settings), banners: data.banners, sections: data.sections, categories: data.categories };
        set({ ...next, loaded: true, loading: false });
        try { localStorage.setItem('pg-site', JSON.stringify({ settings: data.settings, banners: data.banners, sections: data.sections, categories: data.categories })); } catch {}
        applyBranding(next.settings);
      } catch {
        set({ loading: false });
      }
    },
  };
});

export const useSettings = () => useSiteStore((s) => s.settings);
export const useWhatsApp = () => useSiteStore((s) => String(s.settings.contact?.whatsapp || '').replace(/\D/g, '')) || '971581234567';
export const useCommerce = () => useSiteStore((s) => s.settings.commerce);

// Primary colour, favicon and default title from the dashboard
export function applyBranding(settings) {
  if (typeof document === 'undefined' || !settings) return;
  const c = settings.brand?.primaryColor;
  let el = document.getElementById('pg-brand-vars');
  if (!el) { el = document.createElement('style'); el.id = 'pg-brand-vars'; document.head.appendChild(el); }
  el.textContent = c && /^#[0-9a-f]{3,8}$/i.test(c)
    ? `:root:not([data-theme="dark"]){--blue:${c};--blue-dark:color-mix(in srgb,${c} 82%,black);--blue-light:color-mix(in srgb,${c} 75%,white);--blue-glow:color-mix(in srgb,${c} 25%,transparent);}
[data-theme="dark"]{--blue:color-mix(in srgb,${c} 78%,white);--blue-dark:${c};--blue-light:color-mix(in srgb,${c} 60%,white);--blue-glow:color-mix(in srgb,${c} 30%,transparent);}`
    : '';
  if (settings.brand?.faviconUrl) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = settings.brand.faviconUrl;
  }
}

// Apply cached branding immediately on boot (before the network request finishes)
applyBranding(useSiteStore.getState().settings);
