import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiFilter, FiX, FiGrid, FiList, FiChevronDown, FiSearch, FiSliders } from 'react-icons/fi';
import api from '../utils/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import './Products.css';

const CATEGORIES = ['Drones','Smart Watches','AirBuds & Headphones','VR & AR','AI Devices','Cameras','Smart Home','Gaming','Laptops','Accessories','Home & Kitchen','Beauty & Personal Care','Kids & Toys','Tools & Outdoor'];
const SORTS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratings', label: 'Top Rated' },
  { value: '-totalSold', label: 'Best Selling' },
];
const PRICE_RANGES = [
  { label: 'Under AED 20', min: '', max: 20 },
  { label: 'AED 20–50', min: 20, max: 50 },
  { label: 'AED 50–100', min: 50, max: 100 },
  { label: 'AED 100–500', min: 100, max: 500 },
  { label: 'AED 500+', min: 500, max: '' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-totalSold',
    minPrice: searchParams.get('price[gte]') || '', maxPrice: searchParams.get('price[lte]') || '',
    minRating: '', inStock: false,
  });

  const PER_PAGE = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.keyword) p.set('keyword', filters.keyword);
      if (filters.category) p.set('category', filters.category);
      if (filters.minPrice) p.set('price[gte]', filters.minPrice);
      if (filters.maxPrice) p.set('price[lte]', filters.maxPrice);
      if (filters.minRating) p.set('ratings[gte]', filters.minRating);
      if (filters.inStock) p.set('stock[gt]', '0');
      p.set('sort', filters.sort);
      p.set('page', page);
      p.set('limit', PER_PAGE);
      const { data } = await api.get(`/products?${p}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch { setProducts([]); }
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    setFilters(f => ({
      ...f,
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') || '',
      sort: searchParams.get('sort') || f.sort,
      minPrice: searchParams.get('price[gte]') || '',
      maxPrice: searchParams.get('price[lte]') || '',
    }));
    setPage(1);
  }, [searchParams.get('keyword'), searchParams.get('category'), searchParams.get('sort'), searchParams.get('price[gte]'), searchParams.get('price[lte]')]);

  const updateFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };
  const clearFilters = () => {
    setFilters({ keyword: '', category: '', sort: '-totalSold', minPrice: '', maxPrice: '', minRating: '', inStock: false });
    setPage(1); setSearchParams({});
  };

  const activeCount = [filters.category, filters.minPrice || filters.maxPrice, filters.minRating, filters.inStock].filter(Boolean).length;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <Helmet>
        <title>{filters.category ? `${filters.category} — PrimeGadgets UAE` : 'Shop All Products — PrimeGadgets UAE'}</title>
      </Helmet>

      <div className="products-page page">
        {/* Page header */}
        <div className="products-page-header">
          <div className="container">
            <h1 className="heading">{filters.category || 'All Products'}</h1>
            <p className="text-muted body-sm">{total} products {filters.keyword && `for "${filters.keyword}"`}</p>
          </div>
        </div>

        <div className="container products-layout">
          {/* Sidebar */}
          <aside className={`filter-sidebar ${filterOpen ? 'open' : ''}`}>
            <div className="filter-head">
              <div className="flex items-center gap-8">
                <FiSliders />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Filters</span>
                {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
              </div>
              <div className="flex gap-8">
                {activeCount > 0 && <button className="clear-btn" onClick={clearFilters}>Clear</button>}
                <button className="filter-close" onClick={() => setFilterOpen(false)}><FiX /></button>
              </div>
            </div>

            {/* Search */}
            <div className="filter-section">
              <div className="input-wrap">
                <FiSearch className="input-icon-left" size={15} />
                <input className="input has-icon-left" placeholder="Search products..." value={filters.keyword}
                  onChange={e => updateFilter('keyword', e.target.value)} />
              </div>
            </div>

            {/* Category */}
            <div className="filter-section">
              <h4 className="filter-title">Category</h4>
              <div className="filter-opts">
                <button className={`filter-opt ${!filters.category ? 'active' : ''}`} onClick={() => updateFilter('category', '')}>
                  All Categories
                </button>
                {CATEGORIES.map(c => (
                  <button key={c} className={`filter-opt ${filters.category === c ? 'active' : ''}`} onClick={() => updateFilter('category', c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-section">
              <h4 className="filter-title">Price Range</h4>
              <div className="filter-opts">
                {PRICE_RANGES.map(r => (
                  <button
                    key={r.label}
                    className={`filter-opt ${filters.minPrice == r.min && filters.maxPrice == r.max ? 'active' : ''}`}
                    onClick={() => { updateFilter('minPrice', r.min); updateFilter('maxPrice', r.max); }}
                  >{r.label}</button>
                ))}
              </div>
              <div className="price-custom flex gap-8" style={{ marginTop: 10 }}>
                <input className="input" placeholder="Min" type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
                <input className="input" placeholder="Max" type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
              </div>
            </div>

            {/* Rating */}
            <div className="filter-section">
              <h4 className="filter-title">Min Rating</h4>
              <div className="filter-opts">
                {[4,3,2].map(r => (
                  <button key={r} className={`filter-opt ${filters.minRating == r ? 'active' : ''}`} onClick={() => updateFilter('minRating', r)}>
                    {'★'.repeat(r)}{'☆'.repeat(5-r)} & up
                  </button>
                ))}
              </div>
            </div>

            {/* In stock */}
            <div className="filter-section">
              <label className="toggle-label">
                <input type="checkbox" checked={filters.inStock} onChange={e => updateFilter('inStock', e.target.checked)} style={{ display: 'none' }} />
                <div className={`toggle-track ${filters.inStock ? 'on' : ''}`}><div className="toggle-thumb" /></div>
                In Stock Only
              </label>
            </div>
          </aside>

          {/* Main */}
          <main className="products-main">
            {/* Toolbar */}
            <div className="products-toolbar">
              <button className="btn btn-secondary btn-sm filter-toggle-btn" onClick={() => setFilterOpen(true)}>
                <FiFilter size={14} /> Filters {activeCount > 0 && `(${activeCount})`}
              </button>
              <span className="toolbar-info">{products.length} of {total}</span>
              <div className="toolbar-right">
                <select className="sort-select" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <div className="view-btns">
                  <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><FiGrid size={15} /></button>
                  <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><FiList size={15} /></button>
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid-4' : 'products-list-view'}>
                {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: viewMode === 'grid' ? 380 : 120 }} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <FiSearch style={{ width: 56, height: 56 }} />
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear All Filters</button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid-3' : 'products-list-view'}>
                {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <div className="page-nums">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => { if (i > 0 && arr[i-1] !== p-1) acc.push('...'); acc.push(p); return acc; }, [])
                    .map((p, i) => p === '...' ? <span key={`d${i}`} className="page-ellipsis">…</span> : (
                      <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    ))
                  }
                </div>
                <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </main>
        </div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div className="filter-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilterOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
