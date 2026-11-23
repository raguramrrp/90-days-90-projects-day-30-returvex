import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Package, RotateCcw,
  DollarSign, Shield, BarChart2, Tag, Trophy, MapPin,
  ChevronRight, Headphones, Watch, Footprints, Briefcase
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

export const DashboardPage: React.FC<DashboardPageProps> = ({ period }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [reasons, setReasons] = useState<ReasonBreakdown[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductSummary[]>([]);
  const [regions, setRegions] = useState<RegionalReturnPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [trendPeriod, setTrendPeriod] = useState<string>("30d");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getDashboardSummary(period),
      api.getReturnTrends(period),
      api.getReturnReasons(period),
      api.getTopProducts(period, 5),
      api.getRegionalAnalysis(period)
    ])
      .then(([sumRes, trendRes, reasonRes, prodRes, regRes]) => {
        setSummary(sumRes);
        setTrends(trendRes);
        setReasons(reasonRes);
        setTopProducts(prodRes);
        setRegions(regRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

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
              <span>1.2%</span>
            </div>
          </div>
          <div className="flex justify-end -mb-1">
            <Sparkline color="#10B981" points={[10, 8, 12, 9, 14, 11, 7, 5, 8, 6]} />
          </div>
        </div>

        {/* Card 2: Total Returns (Lavender tint) */}
        <div className="p-4 rounded-xl border border-[#DDD6FE]/60 bg-gradient-to-b from-[#FAF8FF] to-[#F5F3FF] shadow-2xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] shadow-2xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 ml-3.5">
              <div className="text-2xl font-extrabold text-[#1E293B] tracking-tight font-mono">
                {summary ? Math.round(summary.total_returns.value).toLocaleString() : "18,420"}
              </div>
              <div className="text-xs text-[#64748B] font-medium -mt-0.5">Total Returns</div>
            </div>
            <div className="flex items-center text-xs font-bold text-[#F43F5E] space-x-0.5">
              <span>&uarr;</span>
              <span>4.1%</span>
            </div>
          </div>
          <div className="flex justify-end -mb-1">
            <Sparkline color="#8B5CF6" points={[6, 9, 7, 12, 10, 15, 12, 16, 14, 18]} />
          </div>
        </div>

        {/* Card 3: Return Cost (Mint tint) */}
        <div className="p-4 rounded-xl border border-[#A7F3D0]/60 bg-gradient-to-b from-[#F0FDF4] to-[#ECFDF5] shadow-2xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-[#D1FAE5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shadow-2xs">
              <span className="font-extrabold text-base">₹</span>
            </div>
            <div className="text-left flex-1 ml-3.5">
              <div className="text-2xl font-extrabold text-[#1E293B] tracking-tight font-mono">
                {summary ? formatCostLakhs(summary.net_loss) : "₹24.7L"}
              </div>
              <div className="text-xs text-[#64748B] font-medium -mt-0.5">Return Cost</div>
            </div>
            <div className="flex items-center text-xs font-bold text-[#10B981] space-x-0.5">
              <span>&darr;</span>
              <span>8.7%</span>
            </div>
          </div>
          <div className="flex justify-end -mb-1">
            <Sparkline color="#10B981" points={[15, 14, 16, 12, 11, 13, 9, 8, 10, 7]} />
          </div>
        </div>

        {/* Card 4: Return Risk Predicted (Peach tint) */}
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
            <div className="flex items-center text-xs font-bold text-[#F43F5E] space-x-0.5">
              <span>&uarr;</span>
              <span>0.4%</span>
            </div>
          </div>
          <div className="flex justify-end -mb-1">
            <Sparkline color="#F97316" points={[4, 6, 5, 8, 7, 9, 8, 10, 9, 11]} />
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: RETURN TRENDS & RETURN REASONS DOUGHNUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Return Trends (7 cols) */}
        <div className="lg:col-span-7 returvex-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-md bg-[#EFF6FF] flex items-center justify-center text-[#2A62F8]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#1E293B]">Return Trends</h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Pill tabs matching reference: 7D, 30D (active), 90D, 1Y */}
              <div className="flex items-center bg-[#F1F5F9] rounded-lg p-0.5 text-xs font-medium">
                {["7D", "30D", "90D", "1Y"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrendPeriod(t.toLowerCase())}
                    className={`px-2.5 py-0.5 rounded-md transition-all ${
                      trendPeriod === t.toLowerCase() || (trendPeriod === "30d" && t === "30D")
                        ? "bg-white text-[#2A62F8] shadow-2xs font-semibold"
                        : "text-[#64748B] hover:text-[#1E293B]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
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
          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return isNaN(d.getTime()) ? val : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = new Date(label);
                      const formattedDate = isNaN(d.getTime())
                        ? label
                        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      const oVal = payload[0]?.value || 0;
                      const rVal = payload[1]?.value || 0;
                      return (
                        <div className="bg-white border border-[#E2E8F0] shadow-md rounded-lg p-2.5 text-xs text-[#1E293B]">
                          <p className="font-semibold text-[11px] text-[#64748B] mb-1">{formattedDate}</p>
                          <p className="font-medium text-[#2563EB]">
                            Orders: <span className="font-bold">{oVal.toLocaleString()}</span>
                          </p>
                          <p className="font-medium text-[#F97316]">
                            Returns: <span className="font-bold">{rVal.toLocaleString()}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total_orders"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#orderGrad)"
                  dot={{ r: 2.5, fill: "#2563EB" }}
                  activeDot={{ r: 5, stroke: "#FFFFFF", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="returned_orders"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#returnGrad)"
                  dot={{ r: 2.5, fill: "#F97316" }}
                  activeDot={{ r: 5, stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Return Reasons Doughnut (5 cols) */}
        <div className="lg:col-span-5 returvex-card p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#E8EEF5]">
            <div className="w-7 h-7 rounded-md bg-[#EFF6FF] flex items-center justify-center text-[#2A62F8]">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#1E293B]">Return Reasons</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            {/* Doughnut with center text matching reference */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reasons}
                    dataKey="count"
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {reasons.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DOUGHNUT_COLORS[index % DOUGHNUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#DFE6EF",
                      borderRadius: "6px",
                      fontSize: "11px"
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} returns (${item.payload.percentage}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Overlay text matching '18.4K Total Returns' */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-bold text-[#1E293B] font-mono">
                  {summary ? `${(summary.total_returns.value / 1000).toFixed(1)}K` : "18.4K"}
                </span>
                <span className="text-[10px] text-[#64748B] font-medium leading-none">Total Returns</span>
              </div>
            </div>

            {/* Legend List on Right matching reference */}
            <div className="space-y-2 flex-1 w-full text-xs">
              {reasons.slice(0, 4).map((r, i) => (
                <div key={r.reason} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: DOUGHNUT_COLORS[i % DOUGHNUT_COLORS.length] }}
                    />
                    <span className="text-[#334155] font-medium truncate">{r.reason}</span>
                  </div>
                  <span className="font-bold text-[#1E293B] font-mono ml-2">{r.percentage}%</span>
                </div>
              ))}
            </div>
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
              <h2 className="text-sm font-bold text-[#1E293B]">Top Returning Products</h2>
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
                {topProducts.slice(0, 4).map((p) => {
                  const isHigh = p.return_rate >= 20.0;
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
                        {formatCostLakhs(p.financial_impact)}
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
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Region-wise Analysis with India Map (6 cols) */}
        <div className="lg:col-span-6 returvex-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF5]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-md bg-[#EFF6FF] flex items-center justify-center text-[#2A62F8]">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#1E293B]">Region-wise Analysis</h2>
            </div>
            <Link to="/reports" className="text-xs font-semibold text-[#2A62F8] hover:underline flex items-center">
              View Details &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Authentic India Vector Map */}
            <div className="h-48 w-full flex items-center justify-center">
              <IndiaMap activeState="Maharashtra" />
            </div>

            {/* Horizontal Bar List matching reference */}
            <div className="space-y-3 text-xs">
              {[
                { state: "Maharashtra", rate: 12.4, color: "#1E3A8A" },
                { state: "Delhi NCR", rate: 10.8, color: "#2563EB" },
                { state: "Karnataka", rate: 9.7, color: "#3B82F6" },
                { state: "Tamil Nadu", rate: 8.9, color: "#60A5FA" },
                { state: "Others", rate: 6.1, color: "#93C5FD" }
              ].map((item) => (
                <div key={item.state} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-medium text-[#334155]">{item.state}</span>
                    <span className="font-bold text-[#1E293B] font-mono">{item.rate}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.rate * 6}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
