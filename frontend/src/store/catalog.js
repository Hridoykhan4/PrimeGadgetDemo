// Shared catalog data: categories that actually have products (with counts), fetched once.
import { create } from 'zustand';
import api from '../utils/api';

export const useCatalogStore = create((set, get) => ({
  categories: [],
  loaded: false,
  loading: false,
  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/products/categories');
      const cats = (data.categories || []).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
      set({ categories: cats, loaded: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

// Recently viewed products (device-local)
const RV_KEY = 'pg-recent';
export const recentlyViewed = {
  get() { try { return JSON.parse(localStorage.getItem(RV_KEY) || '[]'); } catch { return []; } },
  push(p) {
    if (!p?._id) return;
    const slim = { _id: p._id, name: p.name, price: p.price, salePrice: p.salePrice, stock: p.stock, images: p.images?.slice(0, 1), category: p.category, ratings: p.ratings, numReviews: p.numReviews };
    const list = [slim, ...this.get().filter((x) => x._id !== p._id)].slice(0, 16);
    try { localStorage.setItem(RV_KEY, JSON.stringify(list)); } catch {}
  },
};
