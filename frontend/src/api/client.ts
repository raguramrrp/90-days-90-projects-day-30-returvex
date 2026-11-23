import {
  DashboardSummary, TrendPoint, ReasonBreakdown, TopProductSummary,
  RegionalReturnPoint, InsightFeedItem, ProductListItem, ProductDetail,
  ReturnListItem, ReturnDetail, RootCauseOverview, PredictionResult,
  ModelPerformance, FinancialIntelligence
} from "../types";

const BASE_URL = "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) errorMsg = errData.detail;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboardSummary: (period = "30d", categoryId?: number, region?: string) => {
    const q = new URLSearchParams({ period });
    if (categoryId) q.append("category_id", categoryId.toString());
    if (region) q.append("region", region);
    return request<DashboardSummary>(`/dashboard/summary?${q.toString()}`);
  },

  getReturnTrends: (period = "30d", categoryId?: number, region?: string) => {
    const q = new URLSearchParams({ period });
    if (categoryId) q.append("category_id", categoryId.toString());
    if (region) q.append("region", region);
    return request<TrendPoint[]>(`/dashboard/trends?${q.toString()}`);
  },

  getReturnReasons: (period = "30d", categoryId?: number, region?: string) => {
    const q = new URLSearchParams({ period });
    if (categoryId) q.append("category_id", categoryId.toString());
    if (region) q.append("region", region);
    return request<ReasonBreakdown[]>(`/dashboard/reasons?${q.toString()}`);
  },

  getTopProducts: (period = "30d", limit = 5, categoryId?: number) => {
    const q = new URLSearchParams({ period, limit: limit.toString() });
    if (categoryId) q.append("category_id", categoryId.toString());
    return request<TopProductSummary[]>(`/dashboard/products?${q.toString()}`);
  },

  getRegionalAnalysis: (period = "30d", categoryId?: number) => {
    const q = new URLSearchParams({ period });
    if (categoryId) q.append("category_id", categoryId.toString());
    return request<RegionalReturnPoint[]>(`/dashboard/regions?${q.toString()}`);
  },

  getInsights: (period = "30d") => {
    return request<InsightFeedItem[]>(`/dashboard/insights?period=${period}`);
  },

  // Products
  getProducts: (params: Record<string, any>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.append(k, v.toString());
    });
    return request<{ items: ProductListItem[]; total: number; page: number; total_pages: number }>(`/products?${q.toString()}`);
  },

  getCategories: () => {
    return request<Array<{ id: number; name: string }>>("/products/categories");
  },

  getProductDetail: (id: number) => {
    return request<ProductDetail>(`/products/${id}`);
  },

  // Returns
  getReturns: (params: Record<string, any>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.append(k, v.toString());
    });
    return request<{ items: ReturnListItem[]; total: number; page: number; total_pages: number }>(`/returns?${q.toString()}`);
  },

  getReturnReasonsList: () => {
    return request<string[]>("/returns/reasons");
  },

  getReturnDetail: (id: number) => {
    return request<ReturnDetail>(`/returns/${id}`);
  },

  // Root Causes
  getRootCausesOverview: (period = "30d") => {
    return request<RootCauseOverview>(`/root-causes/overview?period=${period}`);
  },

  // Predictions
  predictReturn: (payload: any) => {
    return request<PredictionResult>("/predictions/predict", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getPredictionHistory: (riskTier?: string, page = 1) => {
    const q = new URLSearchParams({ page: page.toString() });
    if (riskTier && riskTier !== "all") q.append("risk_tier", riskTier);
    return request<{ items: any[]; total: number; page: number; total_pages: number }>(`/predictions/history?${q.toString()}`);
  },

  getModelPerformance: () => {
    return request<ModelPerformance>("/predictions/model-performance");
  },

  // Financial
  getFinancialOverview: (period = "30d", categoryId?: number) => {
    const q = new URLSearchParams({ period });
    if (categoryId) q.append("category_id", categoryId.toString());
    return request<FinancialIntelligence>(`/financial/overview?${q.toString()}`);
  },

  // Reports
  generateReport: (payload: any) => {
    return request<any>("/reports/generate", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  // Data Import
  uploadFileForPreview: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/import/preview", {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("File upload failed");
    return res.json();
  },

  validateImport: (payload: any) => {
    return request<any>("/import/validate", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  commitImport: (payload: any) => {
    return request<any>("/import/commit", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getImportHistory: () => {
    return request<any[]>("/import/history");
  },

  // Settings
  getSettings: () => {
    return request<any>("/settings");
  },

  updateSettings: (payload: any) => {
    return request<any>("/settings", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  reseedDatabase: () => {
    return request<any>("/settings/reseed", {
      method: "POST"
    });
  }
};
