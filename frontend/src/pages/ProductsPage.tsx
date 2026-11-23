import React, { useState, useEffect } from "react";
import {
  Search, Filter, ArrowUpDown, Download, X, AlertTriangle,
  CheckCircle2, DollarSign, Package, TrendingUp, ChevronRight
} from "lucide-react";
import { api } from "../api/client";
import { ProductListItem, ProductDetail } from "../types";

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRisk, setSelectedRisk] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("return_rate");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Detail Drawer State
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const fetchProductsList = () => {
    setLoading(true);
    api.getProducts({
      search,
      category_id: selectedCategory ? Number(selectedCategory) : undefined,
      risk_tier: selectedRisk !== "all" ? selectedRisk : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      page_size: 15
    })
      .then((res) => {
        setProducts(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProductsList();
  }, [search, selectedCategory, selectedRisk, sortBy, sortOrder, page]);

  // Load product detail drawer
  const openProductDetail = (id: number) => {
    setSelectedProductId(id);
    setDetailLoading(true);
    api.getProductDetail(id)
      .then(setProductDetail)
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  };

  const closeDetail = () => {
    setSelectedProductId(null);
    setProductDetail(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DFE6EF]">
        <div>
          <h1 className="text-xl font-bold text-[#24344D] tracking-tight">Product Return Intelligence</h1>
        </div>

        <a
          href="/api/reports/export-csv?report_type=product"
          download
          className="btn-secondary flex items-center space-x-1.5 self-start sm:self-auto text-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#3567C8]" />
          <span>Export Catalog CSV</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="returvex-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-[#91A0B5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search product title, SKU code, or brand..."
              className="field-input pl-9"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="field-input text-xs"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Tier */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setPage(1);
              }}
              className="field-input text-xs"
            >
              <option value="all">All Risk Tiers</option>
              <option value="Low">Low Risk (&lt;8%)</option>
              <option value="Moderate">Moderate Risk (8-16%)</option>
              <option value="High">High Risk (16-26%)</option>
              <option value="Critical">Critical Risk (&gt;26%)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="field-input text-xs"
            >
              <option value="return_rate-desc">Return Rate: High to Low</option>
              <option value="return_rate-asc">Return Rate: Low to High</option>
              <option value="returns-desc">Returns Count: High to Low</option>
              <option value="financial_cost-desc">Return Cost: High to Low</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="orders-desc">Orders: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Register Table */}
      <div className="returvex-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-head">
                <th className="py-2.5 px-3">SKU Code</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">Selling Price</th>
                <th className="py-2.5 px-3">Orders</th>
                <th className="py-2.5 px-3">Returns</th>
                <th className="py-2.5 px-3">Return Rate</th>
                <th className="py-2.5 px-3">Return Cost</th>
                <th className="py-2.5 px-3">Risk Tier</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE6EF]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-[#718096]">
                    Loading product catalog telemetry...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-[#718096]">
                    No products found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isCrit = p.risk_tier === "Critical";
                  const isHigh = p.risk_tier === "High";
                  return (
                    <tr
                      key={p.id}
                      onClick={() => openProductDetail(p.id)}
                      className="hover:bg-[#F3F6FA] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-[#3567C8]">{p.product_code}</td>
                      <td className="py-2.5 px-3 font-medium text-[#24344D]">{p.product_name}</td>
                      <td className="py-2.5 px-3 text-[#718096]">{p.category_name}</td>
                      <td className="py-2.5 px-3 text-[#718096]">{p.brand}</td>
                      <td className="py-2.5 px-3 font-mono">₹{p.selling_price.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono">{p.orders_count}</td>
                      <td className="py-2.5 px-3 font-mono">{p.returns_count}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        <span className={isCrit ? "text-[#E47D68]" : isHigh ? "text-[#D5A64A]" : "text-[#24344D]"}>
                          {p.return_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#8978C6] font-medium">
                        ₹{p.financial_cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            isCrit
                              ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]"
                              : isHigh
                              ? "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                              : "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]"
                          }`}
                        >
                          {p.risk_tier}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button className="text-[#3567C8] hover:underline font-medium text-xs">
                          Analyze &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#DFE6EF] flex items-center justify-between text-xs text-[#718096]">
          <span>
            Showing {products.length} of {total} products
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-[#DFE6EF] rounded bg-white disabled:opacity-50 hover:bg-[#F3F6FA]"
            >
              Previous
            </button>
            <span className="font-medium text-[#24344D]">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-[#DFE6EF] rounded bg-white disabled:opacity-50 hover:bg-[#F3F6FA]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAIL DRAWER */}
      {selectedProductId && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-[#DFE6EF] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-[#DFE6EF] flex items-center justify-between bg-[#F8FAFC]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold text-[#3567C8] bg-[#EAF0F7] px-2 py-0.5 rounded">
                  {productDetail?.product_code || "SKU"}
                </span>
                <span className="text-xs text-[#718096]">• {productDetail?.brand}</span>
              </div>
              <h2 className="text-base font-bold text-[#24344D] mt-1">{productDetail?.product_name || "Product"}</h2>
            </div>
            <button
              onClick={closeDetail}
              className="p-1 rounded-md text-[#718096] hover:text-[#24344D] hover:bg-[#DFE6EF]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {detailLoading || !productDetail ? (
              <div className="p-8 text-center text-[#718096]">Loading SKU return analytics...</div>
            ) : (
              <>
                {/* 1. Benchmark & Variance KPI strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[#F3F6FA] border border-[#DFE6EF]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold">Product Return Rate</span>
                    <p className="text-lg font-bold text-[#24344D] font-mono mt-0.5">
                      {productDetail.return_rate.toFixed(1)}%
                    </p>
                    <span className="text-[10px] text-[#718096]">
                      {productDetail.total_returns} of {productDetail.total_orders} orders
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F3F6FA] border border-[#DFE6EF]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold">Category Benchmark</span>
                    <p className="text-lg font-bold text-[#718096] font-mono mt-0.5">
                      {productDetail.category_avg_return_rate.toFixed(1)}%
                    </p>
                    <span className="text-[10px] text-[#718096]">{productDetail.category_name}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F3F6FA] border border-[#DFE6EF]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold">Benchmark Variance</span>
                    <p
                      className={`text-lg font-bold font-mono mt-0.5 ${
                        productDetail.benchmark_variance_pct > 0 ? "text-[#E47D68]" : "text-[#58A88B]"
                      }`}
                    >
                      {productDetail.benchmark_variance_pct > 0 ? "+" : ""}
                      {productDetail.benchmark_variance_pct.toFixed(1)}%
                    </p>
                    <span className="text-[10px] text-[#718096]">
                      {productDetail.benchmark_variance_pct > 0 ? "Above Avg" : "Below Avg"}
                    </span>
                  </div>
                </div>

                {/* 2. Risk Classification Card */}
                <div className="p-3.5 rounded-lg border border-[#DFE6EF] bg-[#F8FAFC] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#24344D]">Risk Status: {productDetail.risk_tier}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-[#DFE6EF]">
                      Price: ₹{productDetail.selling_price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#718096] text-[11px] leading-relaxed">{productDetail.risk_explanation}</p>
                </div>

                {/* 3. Financial Impact Breakdown */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-xs text-[#24344D] uppercase tracking-wider">
                    Financial Impact Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded bg-white border border-[#DFE6EF] flex justify-between">
                      <span className="text-[#718096]">Gross Refunds:</span>
                      <span className="font-mono font-semibold text-[#24344D]">
                        ₹{productDetail.refund_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-white border border-[#DFE6EF] flex justify-between">
                      <span className="text-[#718096]">Reverse Shipping:</span>
                      <span className="font-mono font-semibold text-[#24344D]">
                        ₹{productDetail.reverse_logistics_cost.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-white border border-[#DFE6EF] flex justify-between col-span-2 bg-[#F1EEF9]/50">
                      <span className="text-[#8978C6] font-semibold">Total Net Return Loss:</span>
                      <span className="font-mono font-bold text-[#8978C6]">
                        ₹{productDetail.total_financial_loss.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Return Reasons Distribution */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-xs text-[#24344D] uppercase tracking-wider">
                    Reported Customer Reasons
                  </h3>
                  <div className="space-y-1.5">
                    {productDetail.reasons_breakdown.map((r) => (
                      <div key={r.reason} className="p-2 rounded bg-white border border-[#DFE6EF]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-[#24344D]">{r.reason}</span>
                          <span className="font-mono text-[#718096]">
                            {r.count} returns ({r.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#3567C8] h-full rounded-full"
                            style={{ width: `${r.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Recent Return Incidents */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-xs text-[#24344D] uppercase tracking-wider">
                    Recent Return Events
                  </h3>
                  <div className="overflow-x-auto border border-[#DFE6EF] rounded-md">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#F8FAFC] border-b border-[#DFE6EF] text-[#718096]">
                        <tr>
                          <th className="py-1.5 px-2">Return ID</th>
                          <th className="py-1.5 px-2">Date</th>
                          <th className="py-1.5 px-2">Reason</th>
                          <th className="py-1.5 px-2">State</th>
                          <th className="py-1.5 px-2 text-right">Refund</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFE6EF]">
                        {productDetail.recent_returns.map((rec) => (
                          <tr key={rec.return_number}>
                            <td className="py-1.5 px-2 font-mono text-[#3567C8]">{rec.return_number}</td>
                            <td className="py-1.5 px-2 text-[#718096]">{rec.return_date}</td>
                            <td className="py-1.5 px-2 font-medium">{rec.return_reason}</td>
                            <td className="py-1.5 px-2 text-[#718096]">{rec.state}</td>
                            <td className="py-1.5 px-2 font-mono text-right">₹{rec.refund_amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
