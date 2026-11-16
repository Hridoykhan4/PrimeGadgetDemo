import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi';
import { useSearchModalStore } from './uiStore.js';
import api from '../../utils/api.js';
import { useCatalogStore } from '../../store/catalog.js';
import { CategoryIcon, categoryHref } from '../../utils/categories.jsx';
import { fmtAED } from '../../store/index.js';
import './SearchModal.css';

let popularCache = null;

export default function SearchModal() {
  const { isOpen, close } = useSearchModalStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [catMatches, setCatMatches] = useState([]);
  const [popular, setPopular] = useState(popularCache || []);
  const { categories, load: loadCats } = useCatalogStore();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pg-search-history') || '[]'); } catch { return []; }
  });
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadCats();
      if (!popularCache) {
        api.get('/products', { params: { sort: '-isBestSeller,-createdAt', limit: 6 } })
          .then(({ data }) => { popularCache = data.products; setPopular(data.products); }).catch(() => {});
      }
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSuggestions([]);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); setCatMatches([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products/search/suggestions?q=${encodeURIComponent(query)}`);
        setSuggestions(data.suggestions || []);
        setCatMatches(data.categories || []);
      } catch { setSuggestions([]); setCatMatches([]); }
      setLoading(false);
    }, 280);
  }, [query]);

  const handleSearch = (term) => {
    const q = (term || query).trim();
    if (!q) return;
    const updated = [q, ...history.filter(h => h !== q)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('pg-search-history', JSON.stringify(updated));
    close();
    navigate(`/products?keyword=${encodeURIComponent(q)}`);
  };

  const handleSuggestionClick = (product) => {
    close();
    navigate(`/products/${product._id}`);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pg-search-history');
  };

  const finalPrice = (p) => (p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            className="search-modal"
            initial={{ opacity: 0, y: -40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="search-header">
              <span className="search-label">
                <span className="search-label-line" />
                SEARCH PRODUCTS
              </span>
              <button className="search-close-btn" onClick={close}><FiX /></button>
            </div>

            {/* Input */}
            <div className="search-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder="Search kitchen, beauty, toys, tools…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                autoComplete="off"
              />
              <button
                className="search-submit-btn"
                onClick={() => handleSearch()}
                disabled={!query.trim()}
              >
                {loading
                  ? <div className="spinner spinner-sm" />
                  : <FiSearch />
                }
              </button>
              {query && (
                <button className="search-clear-btn" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Quick category pills */}
            <div className="search-quick-cats">
              {categories.slice(0, 6).map(c => (
                <button
                  key={c.name}
                  className="quick-cat-pill"
                  onClick={() => { close(); navigate(categoryHref(c.name)); }}
                >
                  <CategoryIcon name={c.name} icon={c.icon} /> {c.name} <span className="qc-count">{c.count}</span>
                </button>
              ))}
            </div>

            {/* Suggestions */}
            <AnimatePresence mode="wait">
              {suggestions.length > 0 ? (
                <motion.div
                  key="suggestions"
                  className="search-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {catMatches.length > 0 && (
                    <>
                      <p className="search-results-label">Categories</p>
                      <div className="search-cat-matches">
                        {catMatches.map(c => (
                          <button key={c.name} className="quick-cat-pill" onClick={() => { close(); navigate(`/products?category=${encodeURIComponent(c.name)}&keyword=${encodeURIComponent(query)}`); }}>
                            <CategoryIcon name={c.name} icon={c.icon} /> “{query}” in {c.name} <span className="qc-count">{c.count}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <p className="search-results-label">Products</p>
                  {suggestions.map((p, i) => (
                    <motion.button
                      key={p._id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(p)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="suggestion-image">
                        <img src={p.images?.[0]?.url} alt={p.name} loading="lazy" />
                      </div>
                      <div className="suggestion-info">
                        <span className="suggestion-name">{p.name}</span>
                        <span className="suggestion-cat">{p.category}</span>
                      </div>
                      <div className="suggestion-price">
                        <span className="price-current">AED {fmtAED(finalPrice(p))}</span>
                      </div>
                      <FiArrowRight className="suggestion-arrow" />
                    </motion.button>
                  ))}
                  <button className="view-all-results-btn" onClick={() => handleSearch(query)}>
                    View all results for "<strong>{query}</strong>"
                    <FiArrowRight />
                  </button>
                </motion.div>
              ) : query.length >= 2 && !loading ? (
                <motion.div key="no-results" className="search-no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p>No products found for "<strong>{query}</strong>"</p>
                  <p className="body-sm text-muted">Try a shorter word, or browse a category below</p>
                  <div className="search-quick-cats" style={{ justifyContent: 'center', marginTop: 12 }}>
                    {categories.slice(0, 6).map(c => (
                      <button key={c.name} className="quick-cat-pill" onClick={() => { close(); navigate(categoryHref(c.name)); }}>
                        <CategoryIcon name={c.name} icon={c.icon} /> {c.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="default" className="search-default" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Trending */}
                  <div className="search-section">
                    <div className="search-section-title"><FiTrendingUp size={14} /> Popular right now</div>
                    <div className="search-popular">
                      {popular.map(p => (
                        <button key={p._id} className="suggestion-item" onClick={() => handleSuggestionClick(p)}>
                          <div className="suggestion-image"><img src={p.images?.[0]?.url} alt="" loading="lazy" /></div>
                          <div className="suggestion-info">
                            <span className="suggestion-name">{p.name}</span>
                            <span className="suggestion-cat">{p.category}</span>
                          </div>
                          <div className="suggestion-price"><span className="price-current">AED {fmtAED(finalPrice(p))}</span></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* History */}
                  {history.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">
                        <FiClock size={14} /> Recent Searches
                        <button className="clear-history-btn" onClick={clearHistory}>Clear</button>
                      </div>
                      <div className="search-history">
                        {history.map(h => (
                          <button key={h} className="history-item" onClick={() => handleSearch(h)}>
                            <FiClock size={13} /> {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
