// store/index.js — auth, cart, wishlist, guest orders, theme
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const FREE_SHIPPING_MIN = 200;
export const SHIPPING_FEE = 15;
export const VAT_RATE = 0.05;
const round2 = (n) => Math.round(n * 100) / 100;

// Pure totals helper — always computed from the current items (never cached).
export function cartTotals(items) {
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = round2(items.reduce((s, i) => s + Number(i.price || 0) * i.qty, 0));
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const tax = round2(subtotal * VAT_RATE);
  const total = round2(subtotal + shipping + tax);
  const toFreeShipping = Math.max(0, round2(FREE_SHIPPING_MIN - subtotal));
  return { count, subtotal, shipping, tax, total, toFreeShipping };
}

export const fmtAED = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const unitPrice = (p) => (p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price);

// ── Auth ────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      initialLoading: true,

      setToken: (token) => set({ token }),

      fetchMe: async () => {
        const { token } = get();
        if (!token) { set({ initialLoading: false }); return; }
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, initialLoading: false });
          useWishlistStore.getState().syncFromServer(data.user?.wishlist);
        } catch {
          set({ user: null, token: null, initialLoading: false });
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, loading: false });
          toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
          useWishlistStore.getState().syncFromServer(data.user?.wishlist, true);
          return data.user;
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Login failed');
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          set({ user: data.user, token: data.token, loading: false });
          toast.success(`Welcome to PrimeGadgets, ${data.user.name.split(' ')[0]}`);
          useWishlistStore.getState().syncFromServer(data.user?.wishlist, true);
          return data.user;
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Registration failed');
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        toast.success('Signed out');
      },

      // Kept for older components: wishlist now works for everyone
      toggleWishlist: (product) => useWishlistStore.getState().toggle(product),
      isWishlisted: (productId) => useWishlistStore.getState().has(productId),
    }),
    { name: 'pg-auth', partialize: (s) => ({ token: s.token }) }
  )
);

// ── Wishlist (works without an account; syncs to the account when signed in) ──
const slim = (p) => ({
  _id: p._id, name: p.name, price: p.price, salePrice: p.salePrice, stock: p.stock,
  images: p.images?.slice(0, 1), category: p.category, brand: p.brand,
});

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      has: (id) => get().items.some((i) => i._id === id),
      toggle: (product) => {
        if (!product?._id) return false;
        const exists = get().has(product._id);
        set((s) => ({ items: exists ? s.items.filter((i) => i._id !== product._id) : [slim(product), ...s.items] }));
        toast.success(exists ? 'Removed from wishlist' : 'Saved to wishlist', { id: 'wish' });
        if (useAuthStore.getState().token) api.put(`/auth/wishlist/${product._id}`).catch(() => {});
        return !exists;
      },
      remove: (id) => {
        set((s) => ({ items: s.items.filter((i) => i._id !== id) }));
        if (useAuthStore.getState().token) api.put(`/auth/wishlist/${id}`).catch(() => {});
      },
      // Merge the account wishlist with what the visitor saved as a guest
      syncFromServer: (serverList = [], pushLocal = false) => {
        const server = (serverList || []).filter((p) => p && typeof p === 'object' && p._id).map(slim);
        const serverIds = new Set((serverList || []).map((p) => String(p?._id || p)));
        const local = get().items;
        if (pushLocal) local.filter((i) => !serverIds.has(i._id)).forEach((i) => api.put(`/auth/wishlist/${i._id}`).catch(() => {}));
        const merged = [...server];
        local.forEach((i) => { if (!merged.some((m) => m._id === i._id)) merged.push(i); });
        set({ items: merged });
      },
    }),
    { name: 'pg-wishlist' }
  )
);

// ── Cart ────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1, variant = null, { silent = false } = {}) => {
        if (!product?._id) return;
        if (product.stock <= 0) { toast.error('Sorry, this item is sold out'); return; }
        const key = product._id + (variant ? JSON.stringify(variant) : '');
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return { items: state.items.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, product.stock || 99) } : i)) };
          }
          return {
            items: [...state.items, {
              key, _id: product._id, name: product.name,
              image: product.images?.[0]?.url, price: unitPrice(product),
              originalPrice: product.price, stock: product.stock, qty: Math.min(qty, product.stock || 99), variant,
              brand: product.brand, category: product.category, currency: 'AED',
            }],
          };
        });
        if (!silent) toast.success('Added to cart', { id: 'cart-add' });
      },

      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      updateQty: (key, qty) => {
        if (qty <= 0) { get().removeItem(key); return; }
        set((state) => ({ items: state.items.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, i.stock || 99) } : i)) }));
      },

      clearCart: () => set({ items: [] }),
      isInCart: (productId) => get().items.some((i) => i._id === productId),
    }),
    { name: 'pg-cart', partialize: (s) => ({ items: s.items }) }
  )
);

// Reactive totals hook
export const useCartTotals = () => cartTotals(useCartStore((s) => s.items));

// ── Guest orders: remember order access keys on this device ──
export const useGuestOrdersStore = create(
  persist(
    (set, get) => ({
      orders: [], // { id, key, orderNumber, total, createdAt }
      add: (o) => set((s) => ({ orders: [o, ...s.orders.filter((x) => x.id !== o.id)].slice(0, 30) })),
      keyFor: (id) => get().orders.find((o) => o.id === id)?.key,
    }),
    { name: 'pg-guest-orders' }
  )
);

// ── Checkout details remembered for the next order ──
export const useCheckoutProfileStore = create(
  persist(
    (set) => ({
      profile: null,
      save: (profile) => set({ profile }),
    }),
    { name: 'pg-checkout-profile' }
  )
);

// ── Theme ───────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        return { theme: next };
      }),
      initTheme: () => {
        let t = 'light';
        try { t = JSON.parse(localStorage.getItem('pg-theme') || '{}').state?.theme || 'light'; } catch {}
        document.documentElement.setAttribute('data-theme', t);
      },
    }),
    { name: 'pg-theme' }
  )
);
