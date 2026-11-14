import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard.jsx';
import './ProductRail.css';

// Horizontal product rail: native momentum scrolling + snap on touch,
// arrow buttons that only show when there is more to see, drag-to-scroll with a mouse.
export default function ProductRail({ products = [], label = 'Products' }) {
  const ref = useRef(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products, update]);

  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  // Mouse drag (touch uses native scrolling)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) { d.moved = true; ref.current.classList.add('dragging'); }
    ref.current.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    drag.current.down = false;
    ref.current?.classList.remove('dragging');
  };
  // Swallow the click that ends a drag so cards don't open accidentally
  const onClickCapture = (e) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; }
  };

  if (!products.length) return null;

  return (
    <div className="prail" role="region" aria-label={label}>
      <button type="button" className={`prail-btn prail-prev ${edges.start ? 'hidden' : ''}`} onClick={() => scroll(-1)} aria-label="Scroll left" tabIndex={edges.start ? -1 : 0}>
        <FiChevronLeft aria-hidden="true" />
      </button>
      <div
        className="prail-track"
        ref={ref}
        onScroll={update}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        {products.map((p, k) => (
          <div className="prail-item" key={p._id}><ProductCard product={p} index={k} /></div>
        ))}
      </div>
      <button type="button" className={`prail-btn prail-next ${edges.end ? 'hidden' : ''}`} onClick={() => scroll(1)} aria-label="Scroll right" tabIndex={edges.end ? -1 : 0}>
        <FiChevronRight aria-hidden="true" />
      </button>
      <div className={`prail-fade prail-fade-l ${edges.start ? 'hidden' : ''}`} aria-hidden="true" />
      <div className={`prail-fade prail-fade-r ${edges.end ? 'hidden' : ''}`} aria-hidden="true" />
    </div>
  );
}
