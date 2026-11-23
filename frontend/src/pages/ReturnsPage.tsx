import React, { useState, useEffect } from "react";
import {
  Search, Filter, Download, X, RotateCcw, Package,
  User, MapPin, Calendar, DollarSign, Clock, ShieldCheck
} from "lucide-react";
import { api } from "../api/client";
import { ReturnListItem, ReturnDetail } from "../types";

export const ReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<ReturnListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter options
  const [reasonsList, setReasonsList] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);

  // Active filters
  const [search, setSearch] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("return_date");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Detail Drawer
  const [selectedReturnId, setSelectedReturnId] = useState<number | null>(null);
  const [returnDetail, setReturnDetail] = useState<ReturnDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  useEffect(() => {
    api.getReturnReasonsList().then(setReasonsList).catch(console.error);
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const fetchReturnsList = () => {
    setLoading(true);
    api.getReturns({
      search,
      return_reason: selectedReason !== "all" ? selectedReason : undefined,
      category_id: selectedCategory ? Number(selectedCategory) : undefined,
      return_status: selectedStatus !== "all" ? selectedStatus : undefined,
      shipping_state: selectedState !== "all" ? selectedState : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      page_size: 15
    })
      .then((res) => {
        setReturns(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReturnsList();
  }, [search, selectedReason, selectedCategory, selectedStatus, selectedState, sortBy, sortOrder, page]);

  const openReturnDetail = (id: number) => {
    setSelectedReturnId(id);
    setDetailLoading(true);
    api.getReturnDetail(id)
      .then(setReturnDetail)
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  };

  const closeDetail = () => {
    setSelectedReturnId(null);
    setReturnDetail(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DFE6EF]">
        <div>
          <h1 className="text-xl font-bold text-[#24344D] tracking-tight">Returns Operations Register</h1>
          <p className="text-xs text-[#718096]">
            Audit, track, and manage individual return authorizations, reasons, logistics fees, and refunds.
          </p>
        </div>

        <a
          href="/api/reports/export-csv?report_type=executive"
          download
          className="btn-secondary flex items-center space-x-1.5 self-start sm:self-auto text-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#3567C8]" />
          <span>Export Returns CSV</span>
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
              placeholder="Search Return ID, Order #, Customer, or Product..."
              className="field-input pl-9"
            />
          </div>

          {/* Reason */}
          <div>
            <select
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setPage(1);
              }}
              className="field-input text-xs"
            >
              <option value="all">All Return Reasons</option>
              {reasonsList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="field-input text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
              <option value="Inspected">Inspected</option>
            </select>
          </div>

          {/* Sort */}
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
              <option value="return_date-desc">Newest Returns First</option>
              <option value="return_date-asc">Oldest Returns First</option>
              <option value="refund_amount-desc">Refund: High to Low</option>
              <option value="refund_amount-asc">Refund: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Returns Register Table */}
      <div className="returvex-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-head">
                <th className="py-2.5 px-3">Return ID</th>
                <th className="py-2.5 px-3">Order Number</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Refund Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE6EF]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-[#718096]">
                    Loading returns register...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-[#718096]">
                    No return records found matching criteria.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openReturnDetail(r.id)}
                    className="hover:bg-[#F3F6FA] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-[#3567C8]">{r.return_number}</td>
                    <td className="py-2.5 px-3 font-mono text-[#718096]">{r.order_number}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#24344D]">{r.customer_name}</div>
                      <div className="text-[10px] text-[#91A0B5] font-mono">{r.customer_code}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#24344D]">{r.product_name}</td>
                    <td className="py-2.5 px-3 text-[#718096]">{r.category_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-[#26364B] bg-[#F1F5F9] px-2 py-0.5 rounded text-[11px]">
                        {r.return_reason}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#718096] whitespace-nowrap">
                      {new Date(r.return_date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-[#718096]">{r.shipping_state}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#24344D]">
                      ₹{r.refund_amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          r.return_status === "Completed"
                            ? "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]"
                            : "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                        }`}
                      >
                        {r.return_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button className="text-[#3567C8] hover:underline font-medium text-xs">
                        Audit &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#DFE6EF] flex items-center justify-between text-xs text-[#718096]">
          <span>
            Showing {returns.length} of {total} returns
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

      {/* RETURN DETAIL DRAWER */}
      {selectedReturnId && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-[#DFE6EF] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-[#DFE6EF] flex items-center justify-between bg-[#F8FAFC]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold text-[#3567C8] bg-[#EAF0F7] px-2 py-0.5 rounded">
                  {returnDetail?.return_number || "RET"}
                </span>
                <span className="text-xs text-[#718096]">
                  • Order: {returnDetail?.order_number}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#24344D] mt-1">Return Authorization Details</h2>
            </div>
            <button
              onClick={closeDetail}
              className="p-1 rounded-md text-[#718096] hover:text-[#24344D] hover:bg-[#DFE6EF]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {detailLoading || !returnDetail ? (
              <div className="p-8 text-center text-[#718096]">Loading return audit record...</div>
            ) : (
              <>
                {/* Reason & Status Banner */}
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#718096] uppercase font-semibold">Stated Return Reason</span>
                    <p className="text-sm font-bold text-[#24344D] mt-0.5">{returnDetail.return_reason}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#EAF0F7] text-[#3567C8] font-semibold text-xs uppercase">
                    {returnDetail.return_status}
                  </span>
                </div>

                {/* Product & Order Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-xs text-[#24344D] uppercase tracking-wider">
                    Product & Order Information
                  </h3>
                  <div className="p-3 rounded-lg bg-white border border-[#DFE6EF] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Product:</span>
                      <span className="font-semibold text-[#24344D] text-right">{returnDetail.product_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Category & Brand:</span>
                      <span className="text-[#26364B]">{returnDetail.category_name} • {returnDetail.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Order Date:</span>
                      <span className="text-[#26364B]">{new Date(returnDetail.order_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Payment Method:</span>
                      <span className="text-[#26364B] font-medium">{returnDetail.payment_method}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-xs text-[#24344D] uppercase tracking-wider">
                    Customer Profile & History
                  </h3>
                  <div className="p-3 rounded-lg bg-white border border-[#DFE6EF] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Customer Name:</span>
                      <span className="font-semibold text-[#24344D]">{returnDetail.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Customer Code & Segment:</span>
                      <span className="text-[#26364B]">{returnDetail.customer_code} • {returnDetail.customer_segment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Shipping Location:</span>
                      <span className="text-[#26364B]">{returnDetail.state} ({returnDetail.region} Region)</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#DFE6EF]">
                      <span className="text-[#718096]">Lifetime Customer Stats:</span>
                      <span className="font-semibold text-[#3567C8]">
                        {returnDetail.related_orders_count} Orders | {returnDetail.customer_prior_returns_count} Returns
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Ledger & Net Loss Accounting */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-xs text-[#24344D] uppercase tracking-wider">
                    Financial Loss Accounting
                  </h3>
                  <div className="p-3 rounded-lg bg-white border border-[#DFE6EF] space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Customer Refund Amount:</span>
                      <span className="font-mono font-semibold text-[#24344D]">₹{returnDetail.refund_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Reverse Logistics Freight:</span>
                      <span className="font-mono text-[#24344D]">₹{returnDetail.reverse_logistics_cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Restocking & Inspection:</span>
                      <span className="font-mono text-[#24344D]">₹{returnDetail.restocking_cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Product Degradation / Write-Off:</span>
                      <span className="font-mono text-[#E47D68]">₹{returnDetail.write_off_cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#58A88B]">
                      <span>Less: Recoverable Salvage Value:</span>
                      <span className="font-mono font-semibold">- ₹{returnDetail.recoverable_value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#DFE6EF] text-xs font-bold text-[#8978C6]">
                      <span>Estimated Net Company Loss:</span>
                      <span className="font-mono">₹{returnDetail.net_loss.toLocaleString()}</span>
                    </div>
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
