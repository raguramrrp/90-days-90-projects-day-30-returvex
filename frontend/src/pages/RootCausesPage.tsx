import React, { useState, useEffect } from "react";
import {
  SearchCheck, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Sparkles, CheckCircle2, Info, ArrowUpRight, ShieldAlert, BarChart3
} from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { api } from "../api/client";
import { RootCauseOverview } from "../types";

export const RootCausesPage: React.FC = () => {
  const [data, setData] = useState<RootCauseOverview | null>(null);
  const [period, setPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getRootCausesOverview(period)
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load root cause findings"))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DFE6EF]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-[#24344D] tracking-tight">Root Cause Intelligence</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF0F7] text-[#3567C8] uppercase">
              Signature Module
            </span>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center bg-[#F3F6FA] border border-[#DFE6EF] rounded-md p-0.5 self-start sm:self-auto">
          {["7d", "30d", "90d"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                period === p ? "bg-[#3567C8] text-white shadow-xs" : "text-[#718096] hover:text-[#26364B]"
              }`}
            >
              Last {p}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="p-12 text-center text-xs text-[#718096]">
          Conducting multidimensional variance analysis across database...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {error}
        </div>
      ) : data ? (
        <>
          {/* SECTION 1: PARETO 80/20 ANALYSIS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 returvex-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#DFE6EF]">
                <div>
                  <h2 className="text-sm font-semibold text-[#24344D]">Pareto 80/20 Analysis</h2>
                </div>
                <span className="text-[10px] text-[#3567C8] bg-[#EAF0F7] px-2 py-0.5 rounded font-medium">
                  Dominant: {data.dominant_reason}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={256} minHeight={256}>
                  <ComposedChart data={data.pareto_data} margin={{ top: 10, right: 20, bottom: 25, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="reason"
                      stroke="#94A3B8"
                      fontSize={10}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis yAxisId="left" stroke="#94A3B8" fontSize={10} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#E47D68"
                      fontSize={10}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#DFE6EF",
                        borderRadius: "6px",
                        fontSize: "11px"
                      }}
                      formatter={(val: any, name: any) => {
                        if (name === "cumulative_percentage") return [`${val}%`, "Cumulative Share"];
                        if (name === "count") return [val, "Returns Count"];
                        return [val, name];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="count" fill="#3567C8" radius={[4, 4, 0, 0]} barSize={26} isAnimationActive={false} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cumulative_percentage"
                      stroke="#E47D68"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#E47D68" }}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Return Reason Trends (Velocity) */}
            <div className="returvex-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#DFE6EF]">
                <h2 className="text-sm font-semibold text-[#24344D]">Return Reason Velocity</h2>
                <span className="text-[10px] text-[#718096]">vs Prior Window</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {data.reason_trends.map((t) => {
                  const isInc = t.trend_status === "Increasing";
                  const isDec = t.trend_status === "Decreasing";
                  return (
                    <div
                      key={t.reason}
                      className="p-2.5 rounded-lg border border-[#DFE6EF] bg-[#F8FAFC] flex items-center justify-between text-xs"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-[#24344D] truncate">{t.reason}</p>
                        <p className="text-[10px] text-[#718096]">
                          {t.recent_period_count} returns (prev: {t.prior_period_count})
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span
                          className={`flex items-center text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                            isInc
                              ? "bg-[#FEF2F2] text-[#DC2626]"
                              : isDec
                              ? "bg-[#F0FDF4] text-[#16A34A]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {isInc ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : isDec ? (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          ) : (
                            <Minus className="w-3 h-3 mr-1" />
                          )}
                          {t.pct_change > 0 ? "+" : ""}
                          {t.pct_change.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: EVIDENCE-BACKED INVESTIGATION FINDINGS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#DFE6EF]">
              <h2 className="text-base font-bold text-[#24344D]">Root Cause Diagnostics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.findings.map((f) => {
                const isCrit = f.severity === "Critical";
                const isHigh = f.severity === "High";
                return (
                  <div
                    key={f.finding_id}
                    className="returvex-card p-5 space-y-3.5 border-t-3"
                    style={{
                      borderTopColor: isCrit ? "#E47D68" : isHigh ? "#D5A64A" : "#3567C8"
                    }}
                  >
                    {/* Finding Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2 text-[10px] text-[#718096] mb-1">
                          <span className="font-mono font-semibold text-[#3567C8]">{f.finding_id}</span>
                          <span>•</span>
                          <span>{f.dimension}</span>
                          <span>•</span>
                          <span>{f.time_period}</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#24344D]">{f.title}</h3>
                        <p className="text-xs text-[#3567C8] font-medium mt-0.5">{f.affected_entity}</p>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          isCrit
                            ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]"
                            : isHigh
                            ? "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                            : "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>

                    {/* Metric comparison banner */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF] text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#718096] uppercase">Return Count</span>
                        <p className="font-mono font-bold text-[#24344D] text-sm mt-0.5">{f.return_count}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#718096] uppercase">Concentration</span>
                        <p className="font-mono font-bold text-[#E47D68] text-sm mt-0.5">{f.return_share_pct}%</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#718096] uppercase">Excess Ratio</span>
                        <p className="font-mono font-bold text-[#3567C8] text-sm mt-0.5">{f.excess_ratio}x</p>
                      </div>
                    </div>

                    {/* Verifiable Evidence */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#24344D]">
                        Evidence:
                      </span>
                      <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-2.5 rounded border border-[#DFE6EF]">
                        {f.evidence}
                      </p>
                    </div>

                    {/* Root Cause Note */}
                    <div className="p-2.5 rounded-lg bg-[#FFFDF5] border border-[#FCEECB] text-xs text-[#92400E]">
                      <div className="flex items-center space-x-1.5 font-semibold mb-0.5">
                        <Info className="w-3.5 h-3.5" />
                        <span>Root Cause:</span>
                      </div>
                      <p className="leading-relaxed">{f.correlation_vs_causation_note}</p>
                    </div>

                    {/* Actionable Recommendation */}
                    <div className="pt-2 border-t border-[#DFE6EF] flex items-start space-x-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#58A88B] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#24344D]">Recommended Action:</span>
                        <p className="text-[#475569] mt-0.5 text-xs">{f.recommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
