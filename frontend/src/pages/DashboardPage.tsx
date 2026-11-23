import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Package, RotateCcw,
  DollarSign, Shield, BarChart2, Tag, Trophy, MapPin,
  ChevronRight, Headphones, Watch, Footprints, Briefcase, Search, Filter
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { api } from "../api/client";
import {
  DashboardSummary, TrendPoint, ReasonBreakdown, TopProductSummary,
  RegionalReturnPoint
} from "../types";
import { IndiaMap } from "../components/IndiaMap";

interface DashboardPageProps {
  period: string;
  searchQuery: string;
}

// Sparkline SVG generator for KPI cards
const Sparkline: React.FC<{ color: string; points: number[] }> = ({ color, points }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 140;
  const height = 30;

  const pathD = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ period, searchQuery }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [reasons, setReasons] = useState<ReasonBreakdown[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductSummary[]>([]);
  const [regions, setRegions] = useState<RegionalReturnPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [trendPeriod, setTrendPeriod] = useState<string>("30d");
  const [trendLoading, setTrendLoading] = useState<boolean>(false);
  const [activeMapState, setActiveMapState] = useState<string | null>("Maharashtra");
  const [hoveredMapState, setHoveredMapState] = useState<string | null>(null);

  // Main KPI, Reason, Top Products, and Regional Data loader (period: 7d, 30d, 90d, 12m)
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getDashboardSummary(period),
      api.getReturnReasons(period),
      api.getTopProducts(period, 10),
      api.getRegionalAnalysis(period)
    ])
      .then(([sumRes, reasonRes, prodRes, regRes]) => {
        setSummary(sumRes);
        setReasons(reasonRes);
        setTopProducts(prodRes);
        setRegions(regRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  // Dedicated effect for Return Trends Period Buttons (7D, 30D, 90D, 1Y)
  useEffect(() => {
    const apiPeriod = trendPeriod.toLowerCase() === "1y" ? "12m" : trendPeriod.toLowerCase();
    setTrendLoading(true);
    api.getReturnTrends(apiPeriod)
      .then((data) => setTrends(data))
      .catch(console.error)
      .finally(() => setTrendLoading(false));
  }, [trendPeriod]);

  // Map backend TrendPoint (total_orders, returned_orders) to chart keys (orders, returns)
  const chartTrends = trends.map((t) => ({
    ...t,
    orders: t.total_orders,
    returns: t.returned_orders,
  }));

  // Format currency in Lakhs or standard
  const formatCostLakhs = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${(val / 1000).toFixed(1)}K`;
  };

  // Reasons color palette matching reference doughnut
  const DOUGHNUT_COLORS = [
    "#1E3A8A", // Dark blue (Size Issue)
    "#F97316", // Orange (Quality Issue)
    "#10B981", // Green (Damaged Product)
    "#94A3B8", // Grey (Wrong Item)
    "#6366F1", // Indigo
    "#EC4899", // Pink
    "#F59E0B"  // Amber
  ];

  // Helper icons for top returning products table
  const getProductIcon = (name: string, category: string) => {
    const lower = `${name} ${category}`.toLowerCase();
    if (lower.includes("headphone") || lower.includes("earbud")) {
      return <Headphones className="w-5 h-5 text-[#3B82F6]" />;
    }
    if (lower.includes("shoe") || lower.includes("footwear") || lower.includes("sneaker")) {
      return <Footprints className="w-5 h-5 text-[#8B5CF6]" />;
    }
    if (lower.includes("watch") || lower.includes("wearable")) {
      return <Watch className="w-5 h-5 text-[#EC4899]" />;
    }
    return <Briefcase className="w-5 h-5 text-[#10B981]" />;
  };

  // Filter top products by global search query if entered
  const filteredProducts = searchQuery.trim()
    ? topProducts.filter(
        (p) =>
          p.product_name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          p.product_code.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          p.category_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : topProducts;

  // Regional state breakdown list items derived dynamically from database
  const fallbackRegions: RegionalReturnPoint[] = [
    { state: "Maharashtra", region: "West", total_orders: 86, returned_orders: 21, return_rate: 24.4, financial_impact: 10397 },
    { state: "Delhi NCR", region: "North", total_orders: 65, returned_orders: 17, return_rate: 26.1, financial_impact: 10042 },
    { state: "Karnataka", region: "South", total_orders: 51, returned_orders: 13, return_rate: 25.5, financial_impact: 6445 },
    { state: "Tamil Nadu", region: "South", total_orders: 54, returned_orders: 18, return_rate: 33.3, financial_impact: 7687 },
    { state: "Odisha", region: "East", total_orders: 60, returned_orders: 26, return_rate: 43.3, financial_impact: 12981 }
  ];

  const stateBarList = (regions.length > 0 ? regions : fallbackRegions).slice(0, 5).map((r, i) => {
    const colors = ["#1E3A8A", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"];
    return {
      state: r.state,
      rate: r.return_rate,
      orders: r.total_orders,
      returns: r.returned_orders,
      color: colors[i % colors.length]
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      {/* Decorative Pastel Wave in top-right background matching reference image */}
      <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-l from-[#E0E7FF]/40 via-[#EDE9FE]/25 to-transparent rounded-bl-[100px] pointer-events-none -z-10" />

      {/* DASHBOARD HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#15243C] tracking-tight">
          Returns Intelligence Dashboard
        </h1>
        <p className="text-xs text-[#64748B] mt-1 font-medium">
          Understand return trends, identify root causes and predict return risks.
        </p>
      </div>

      {/* 4 PRIMARY ANALYTICAL KPI CARDS (Matching Reference Color Distribution & Shapes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Return Rate (Amber tint) */}
        <div className="p-4 rounded-xl border border-[#FDE68A]/60 bg-gradient-to-b from-[#FFFDF5] to-[#FEF9EE] shadow-2xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 ml-3.5">
              <div className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
                {summary ? `${summary.return_rate.value.toFixed(1)}%` : "6.8%"}
              </div>
              <div className="text-xs text-[#64748B] font-medium -mt-0.5">Return Rate</div>
            </div>
            <div className="flex items-center text-xs font-bold text-[#10B981] space-x-0.5">
              <span>&darr;</span>
              <span>{summary ? Math.abs(summary.return_rate.change_pct).toFixed(1) : "1.2"}%</span>
            </div>
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div className="text-[10px] text-[#94A3B8]">vs prior 30d</div>
            <Sparkline color="#10B981" points={[7.8, 7.5, 7.6, 7.3, 7.1, 7.2, 7.0, 6.8]} />
          </div>
        </div>

        {/* Card 2: Total Returns (Lavender tint) */}
        <div className="p-4 rounded-xl border border-[#E9D5FF]/60 bg-gradient-to-b from-[#FAF5FF] to-[#F3E8FF]/40 shadow-2xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-[#F3E8FF] border border-[#E9D5FF] flex items-center justify-center text-[#9333EA] shadow-2xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 ml-3.5">
              <div className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
                {summary ? summary.total_returns.value.toLocaleString() : "18,420"}
              </div>
              <div className="text-xs text-[#64748B] font-medium -mt-0.5">Total Returns</div>
            </div>
            <div className="flex items-center text-xs font-bold text-[#EF4444] space-x-0.5">
              <span>&uarr;</span>
              <span>{summary ? Math.abs(summary.total_returns.change_pct).toFixed(1) : "4.1"}%</span>
            </div>
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div className="text-[10px] text-[#94A3B8]">vs prior 30d</div>
            <Sparkline color="#EC4899" points={[16500, 16800, 17200, 17500, 17800, 18100, 18420]} />
          </div>
        </div>

        {/* Card 3: Return Cost (Mint tint) */}
        <div className="p-4 rounded-xl border border-[#A7F3D0]/60 bg-gradient-to-b from-[#F0FDF4] to-[#ECFDF5] shadow-2xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-[#D1FAE5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shadow-2xs">
              <span className="font-extrabold text-base font-sans">₹</span>
            </div>
            <div className="text-left flex-1 ml-3.5">
              <div className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
                {summary ? formatCostLakhs(summary.return_cost.value) : "₹24.7L"}
              </div>
              <div className="text-xs text-[#64748B] font-medium -mt-0.5">Return Cost</div>
            </div>
            <div className="flex items-center text-xs font-bold text-[#10B981] space-x-0.5">
              <span>&darr;</span>
              <span>{summary ? Math.abs(summary.return_cost.change_pct).toFixed(1) : "8.7"}%</span>
            </div>
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div className="text-[10px] text-[#94A3B8]">vs prior 30d</div>
            <Sparkline color="#10B981" points={[28.5, 27.8, 27.0, 26.2, 25.4, 25.0, 24.7]} />
          </div>
        </div>

        {/* Card 4: Return Risk (Peach tint) */}
        <div className="p-4 rounded-xl border border-[#FED7AA]/60 bg-gradient-to-b from-[#FFF7ED] to-[#FFEDD5]/40 shadow-2xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-[#FFEDD5] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 ml-3.5">
              <div className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
                {summary ? `${summary.return_risk.value.toFixed(1)}%` : "2.3%"}
              </div>
              <div className="text-xs text-[#64748B] font-medium -mt-0.5">Return Risk (Predicted)</div>
            </div>
            <div className="flex items-center text-xs font-bold text-[#EF4444] space-x-0.5">
              <span>&uarr;</span>
              <span>{summary ? Math.abs(summary.return_risk.change_pct).toFixed(1) : "0.4"}%</span>
            </div>
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div className="text-[10px] text-[#94A3B8]">forward projection</div>
            <Sparkline color="#F97316" points={[2.1, 2.0, 2.2, 2.3, 2.4, 2.2, 2.3]} />
          </div>
        </div>
      </div>

      {/* MID SECTION: RETURN TRENDS (AREA) & RETURN REASONS (DOUGHNUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Return Trends (8 cols) */}
        <div className="lg:col-span-8 returvex-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-md bg-[#EFF6FF] flex items-center justify-center text-[#2A62F8]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#1E293B]">Return Trends</h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Working Pill tabs: 7D, 30D, 90D, 1Y */}
              <div className="flex items-center bg-[#F1F5F9] rounded-lg p-0.5 text-xs font-medium">
                {["7D", "30D", "90D", "1Y"].map((t) => {
                  const targetPeriod = t.toLowerCase() === "1y" ? "12m" : t.toLowerCase();
                  const isSelected =
                    trendPeriod === targetPeriod ||
                    (trendPeriod === "30d" && t === "30D") ||
                    (trendPeriod === "12m" && t === "1Y");
                  return (
                    <button
                      key={t}
                      onClick={() => setTrendPeriod(targetPeriod)}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white text-[#2A62F8] shadow-xs font-bold"
                          : "text-[#64748B] hover:text-[#1E293B]"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Legends: Blue dot Orders, Orange dot Returns */}
              <div className="flex items-center space-x-3 text-xs font-medium">
                <span className="flex items-center space-x-1.5 text-[#1E293B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <span>Orders</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[#1E293B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                  <span>Returns</span>
                </span>
              </div>
            </div>
          </div>

          {/* Area Chart matching reference curves */}
          <div className="h-64 w-full pt-1 relative">
            {trendLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-2xs flex items-center justify-center z-10 text-xs text-[#2A62F8] font-semibold">
                Updating trend horizon...
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const oVal = payload.find((p: any) => p.dataKey === "orders")?.value ?? payload[0]?.value ?? 0;
                      const rVal = payload.find((p: any) => p.dataKey === "returns")?.value ?? payload[1]?.value ?? 0;
                      const d = new Date(label);
                      const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      return (
                        <div className="bg-white/95 backdrop-blur-xs border border-[#DFE6EF] shadow-md rounded-lg p-2.5 text-xs">
                          <p className="font-semibold text-[11px] text-[#64748B] mb-1">{formattedDate}</p>
                          <p className="font-medium text-[#2563EB]">
                            Orders: <span className="font-bold">{Number(oVal).toLocaleString()}</span>
                          </p>
                          <p className="font-medium text-[#F97316]">
                            Returns: <span className="font-bold">{Number(rVal).toLocaleString()}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#orderGrad)"
                  dot={{ r: 2.5, fill: "#2563EB", strokeWidth: 1.5, stroke: "#FFFFFF" }}
                  activeDot={{ r: 5, fill: "#2563EB" }}
                />
                <Area
                  type="monotone"
                  dataKey="returns"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#returnGrad)"
                  dot={{ r: 2.5, fill: "#F97316", strokeWidth: 1.5, stroke: "#FFFFFF" }}
                  activeDot={{ r: 5, fill: "#F97316" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Return Reasons Doughnut (4 cols) */}
        <div className="lg:col-span-4 returvex-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 pb-1 border-b border-[#E8EEF5]">
            <div className="w-7 h-7 rounded-md bg-[#EFF6FF] flex items-center justify-center text-[#2A62F8]">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#1E293B]">Return Reasons</h2>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Doughnut with Centered Overlay Text */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reasons}
                    dataKey="count"
                    nameKey="reason"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {reasons.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DOUGHNUT_COLORS[index % DOUGHNUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} items`, name]}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#DFE6EF",
                      borderRadius: "6px",
                      fontSize: "11px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Overlay matching reference '18.4K Total Returns' */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-[#1E293B] tracking-tight">
                  {summary ? `${(summary.total_returns.value / 1000).toFixed(1)}K` : "18.4K"}
                </span>
                <span className="text-[10px] text-[#64748B] font-medium leading-none mt-0.5">
                  Total Returns
                </span>
              </div>
            </div>

            {/* Ranked Reasons Legend */}
            <div className="flex-1 space-y-2 text-xs">
              {reasons.slice(0, 4).map((r, i) => (
                <div key={r.reason} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: DOUGHNUT_COLORS[i % DOUGHNUT_COLORS.length] }}
                    />
                    <span className="text-[#334155] font-medium truncate max-w-[90px]" title={r.reason}>
                      {r.reason}
                    </span>
                  </div>
                  <span className="font-bold text-[#1E293B] font-mono">
                    {r.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9] text-right">
            <Link to="/root-causes" className="text-xs font-semibold text-[#2A62F8] hover:underline flex items-center justify-end">
              <span>Explore Root Causes</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: TOP RETURNING PRODUCTS & REGION-WISE ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Returning Products (6 cols) */}
        <div className="lg:col-span-6 returvex-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF5]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-md bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Top Returning Products</h2>
                {searchQuery.trim() && (
                  <p className="text-[10px] text-[#2A62F8] font-semibold">
                    Filtering for &ldquo;{searchQuery}&rdquo; ({filteredProducts.length} results)
                  </p>
                )}
              </div>
            </div>
            <Link to="/products" className="text-xs font-semibold text-[#2A62F8] hover:underline flex items-center">
              View All &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[#64748B] border-b border-[#E8EEF5] font-medium">
                  <th className="py-2 px-2">Product</th>
                  <th className="py-2 px-2">Category</th>
                  <th className="py-2 px-2 text-right">Return Rate</th>
                  <th className="py-2 px-2 text-right">Return Count</th>
                  <th className="py-2 px-2 text-right">Return Cost</th>
                  <th className="py-2 px-2 text-center">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredProducts.length > 0 ? (
                  filteredProducts.slice(0, 4).map((p) => {
                    const isHigh = p.return_rate >= 25.0;
                    return (
                      <tr key={p.id} className="hover:bg-[#F8FAFD] transition-colors">
                        <td className="py-2.5 px-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-md bg-[#F1F5F9] flex items-center justify-center shrink-0">
                              {getProductIcon(p.product_name, p.category_name)}
                            </div>
                            <span className="font-semibold text-[#1E293B] truncate max-w-[130px]" title={p.product_name}>
                              {p.product_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[#64748B]">{p.category_name}</td>
                        <td className="py-2.5 px-2 font-mono font-bold text-[#1E293B] text-right">
                          {p.return_rate.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[#64748B] text-right">
                          {p.return_count.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 font-mono font-semibold text-[#1E293B] text-right">
                          ₹{p.financial_impact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isHigh
                                ? "bg-[#FEE2E2] text-[#EF4444]"
                                : "bg-[#FEF3C7] text-[#D97706]"
                            }`}
                          >
                            {isHigh ? "High" : "Medium"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#64748B]">
                      No returning products matching &ldquo;{searchQuery}&rdquo;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Region-wise Analysis with Full Interactive India Map (6 cols) */}
        <div className="lg:col-span-6 returvex-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF5]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-md bg-[#EFF6FF] flex items-center justify-center text-[#2A62F8]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Region-wise Analysis</h2>
                {activeMapState && (
                  <p className="text-[10px] text-[#2A62F8] font-semibold">
                    Focused: {activeMapState} &bull; Click to reset
                  </p>
                )}
              </div>
            </div>
            <Link to="/reports" className="text-xs font-semibold text-[#2A62F8] hover:underline flex items-center">
              View Details &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Full Interactive India Vector Map */}
            <div className="h-56 w-full flex items-center justify-center">
              <IndiaMap
                regions={regions}
                activeState={activeMapState}
                hoveredState={hoveredMapState}
                onHoverState={setHoveredMapState}
                onSelectState={setActiveMapState}
              />
            </div>

            {/* Interactive Dynamic State List */}
            <div className="space-y-2.5 text-xs">
              {stateBarList.map((item) => {
                const isSelected = activeMapState?.toLowerCase() === item.state.toLowerCase();
                const isHovered = hoveredMapState?.toLowerCase() === item.state.toLowerCase();
                return (
                  <div
                    key={item.state}
                    onMouseEnter={() => setHoveredMapState(item.state)}
                    onMouseLeave={() => setHoveredMapState(null)}
                    onClick={() => setActiveMapState(isSelected ? null : item.state)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      isSelected || isHovered
                        ? "bg-[#EFF6FF] border border-[#BFDBFE] shadow-2xs"
                        : "hover:bg-[#F8FAFD]"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className={`font-semibold ${isSelected || isHovered ? "text-[#1E3A8A]" : "text-[#334155]"}`}>
                        {item.state}
                      </span>
                      <span className="font-bold text-[#1E293B] font-mono">{item.rate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, item.rate * 2.5)}%`,
                          backgroundColor: isSelected || isHovered ? "#1E3A8A" : item.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
