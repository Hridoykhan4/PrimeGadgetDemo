// store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

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
        } catch {
          set({ user: null, token: null, initialLoading: false });
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, loading: false });
          toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);
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
          toast.success(`Welcome to PrimeGadgets, ${data.user.name.split(' ')[0]}! 🎉`);
          return data.user;
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Registration failed');
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },

      toggleWishlist: async (productId) => {
        const { user, token } = get();
        if (!token) { toast.error('Please login to add to wishlist'); return false; }
        try {
          const { data } = await api.put(`/auth/wishlist/${productId}`);
          set(state => ({ user: { ...state.user, wishlist: state.user.wishlist?.map ? data.wishlist : data.wishlist } }));
          return data.added;
        } catch { toast.error('Failed to update wishlist'); return false; }
      },

      isWishlisted: (productId) => {
        const { user } = get();
        return user?.wishlist?.some(id => (id._id || id) === productId) || false;
      },

      get isAuthenticated() { return !!get().token; },
      get isAdmin() { return get().user?.role === 'admin'; },
    }),
    { name: 'pg-auth', partialize: (s) => ({ token: s.token }) }
  )
);

// store/cartStore.js
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1, variant = null) => {
        const key = product._id + (variant ? JSON.stringify(variant) : '');
        set(state => {
          const existing = state.items.find(i => i.key === key);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.key === key ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i
              )
            };
          }
          return {
            items: [...state.items, {
              key, _id: product._id, name: product.name,
              image: product.images?.[0]?.url, price: product.salePrice > 0 ? product.salePrice : product.price,
              originalPrice: product.price, stock: product.stock, qty, variant, brand: product.brand,
              category: product.category, currency: product.currency || 'AED'
            }]
          };
        });
        toast.success(`${product.name.slice(0, 30)}... added to cart`, { icon: '🛒' });
      },

      removeItem: (key) => set(state => ({ items: state.items.filter(i => i.key !== key) })),

      updateQty: (key, qty) => {
        if (qty <= 0) { get().removeItem(key); return; }
        set(state => ({ items: state.items.map(i => i.key === key ? { ...i, qty: Math.min(qty, i.stock) } : i) }));
      },

      clearCart: () => set({ items: [] }),

      get count() { return get().items.reduce((s, i) => s + i.qty, 0); },
      get subtotal() { return get().items.reduce((s, i) => s + i.price * i.qty, 0); },
      get shipping() { const sub = get().subtotal; return sub >= 200 ? 0 : 15; },
      get tax() { return Math.round(get().subtotal * 0.05 * 100) / 100; },
      get total() { return get().subtotal + get().shipping + get().tax; },
      isInCart: (productId) => get().items.some(i => i._id === productId),
    }),
    { name: 'pg-cart' }
  )
);

// store/themeStore.js
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set(state => {
        const next = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        return { theme: next };
      }),
      initTheme: () => {
        const stored = localStorage.getItem('pg-theme');
        const t = stored ? JSON.parse(stored).state?.theme : 'light';
        document.documentElement.setAttribute('data-theme', t || 'light');
      }
    }),
    { name: 'pg-theme' }
  )
);
