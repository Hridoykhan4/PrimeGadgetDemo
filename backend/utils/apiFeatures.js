class APIFeatures {
  constructor(query, queryStr) { this.query = query; this.queryStr = queryStr; }

  search() {
    if (this.queryStr.keyword) {
      this.query = this.query.find({ $text: { $search: this.queryStr.keyword } });
    }
    return this;
  }

  filter() {
    const q = { ...this.queryStr };
    ['keyword', 'page', 'limit', 'sort', 'fields'].forEach(f => delete q[f]);
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
