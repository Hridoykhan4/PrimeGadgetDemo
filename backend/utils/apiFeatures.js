class APIFeatures {
  constructor(query, queryStr) { this.query = query; this.queryStr = queryStr; }

  search() {
    // Partial, case-insensitive match on every word (so "pop" finds "Popcorn")
    const kw = String(this.queryStr.keyword || '').trim().slice(0, 80);
    if (kw) {
      const words = kw.split(/\s+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      this.query = this.query.find({
        $and: words.map((w) => ({ $or: [
          { name: { $regex: w, $options: 'i' } }, { category: { $regex: w, $options: 'i' } },
          { brand: { $regex: w, $options: 'i' } }, { tags: { $regex: w, $options: 'i' } },
        ] })),
      });
    }
    return this;
  }

  filter() {
    const q = { ...this.queryStr };
    ['keyword', 'page', 'limit', 'sort', 'fields', 'status', 'q'].forEach(f => delete q[f]);
    // Only allow simple filters (no operators injected from the query string except gt/gte/lt/lte)
    Object.keys(q).forEach((k) => { if (k.startsWith('$')) delete q[k]; });
    const qStr = JSON.stringify(q).replace(/\b(gt|gte|lt|lte)\b/g, m => `$${m}`);
    this.query = this.query.find(JSON.parse(qStr));
    return this;
  }

  sort() {
    const sortBy = this.queryStr.sort ? this.queryStr.sort.split(',').join(' ') : '-createdAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate(perPage = 12) {
    const page = Math.max(1, parseInt(this.queryStr.page) || 1);
    const limit = Math.min(100, parseInt(this.queryStr.limit) || perPage);
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
