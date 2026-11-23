import React, { useState, useEffect } from "react";
import {
  DollarSign, TrendingDown, ArrowUpRight, ShieldCheck,
  Package, RefreshCw, AlertCircle, FileText, Download
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { api } from "../api/client";
import { FinancialIntelligence } from "../types";

export const FinancialPage: React.FC = () => {
  const [data, setData] = useState<FinancialIntelligence | null>(null);
  const [period, setPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getFinancialOverview(period)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DFE6EF]">
        <div>
          <h1 className="text-xl font-bold text-[#24344D] tracking-tight">Financial Intelligence & Profit Recovery</h1>
          <p className="text-xs text-[#718096]">
            Analyze true return cost accounting: gross refunds, reverse logistics waste, write-offs, and salvage recovery.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Period */}
          <div className="flex items-center bg-[#F3F6FA] border border-[#DFE6EF] rounded-md p-0.5">
            {["7d", "30d", "90d", "12m"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  period === p ? "bg-[#3567C8] text-white shadow-xs" : "text-[#718096] hover:text-[#26364B]"
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <a
            href="/api/reports/export-csv?report_type=financial"
            download
            className="btn-secondary flex items-center space-x-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#3567C8]" />
            <span>Export Financial CSV</span>
          </a>
        </div>
      </div>

      {loading && !data ? (
        <div className="p-12 text-center text-xs text-[#718096]">
          Calculating financial cost formulas across returns ledger...
        </div>
      ) : data ? (
        <>
          {/* Formula Callout Banner */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-[#EAF0F7] border border-[#DFE6EF] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-mono text-[11px] font-bold text-[#3567C8] uppercase tracking-wide">
                Accounting Formula:
              </span>
              <p className="font-mono text-sm font-semibold text-[#24344D]">
                {data.formula_documentation.formula}
              </p>
              <p className="text-[#718096] text-[11px]">
                {data.formula_documentation.explanation}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-white text-[#3567C8] font-semibold text-[11px] border border-[#BAC7D8] self-start md:self-auto">
              Net Loss &ne; Gross Refunds
            </span>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Gross Refunds */}
            <div className="returvex-card p-3.5 border-t-2 border-t-[#24344D]">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Gross Refunds</span>
              <p className="text-lg font-bold font-mono text-[#24344D] mt-0.5">
                ₹{data.kpis.gross_refund_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-[#718096]">{data.kpis.returns_count} returns</span>
            </div>

            {/* 2. Reverse Logistics */}
            <div className="returvex-card p-3.5 border-t-2 border-t-[#3567C8]">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Reverse Freight</span>
              <p className="text-lg font-bold font-mono text-[#3567C8] mt-0.5">
                ₹{data.kpis.reverse_logistics_cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-[#718096]">Carrier charges</span>
            </div>

            {/* 3. Restocking Costs */}
            <div className="returvex-card p-3.5 border-t-2 border-t-[#8978C6]">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Restocking & QC</span>
              <p className="text-lg font-bold font-mono text-[#8978C6] mt-0.5">
                ₹{data.kpis.restocking_cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-[#718096]">Warehouse labour</span>
            </div>

            {/* 4. Write-Offs */}
            <div className="returvex-card p-3.5 border-t-2 border-t-[#E47D68]">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Damage Write-Offs</span>
              <p className="text-lg font-bold font-mono text-[#E47D68] mt-0.5">
                ₹{data.kpis.write_off_cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-[#718096]">Unsalvageable scrap</span>
            </div>

            {/* 5. Recoverable Value */}
            <div className="returvex-card p-3.5 border-t-2 border-t-[#58A88B]">
              <span className="text-[10px] text-[#58A88B] uppercase font-semibold">Recovered Value</span>
              <p className="text-lg font-bold font-mono text-[#58A88B] mt-0.5">
                ₹{data.kpis.recoverable_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-[#718096]">Restocked inventory</span>
            </div>

            {/* 6. Total Net Loss */}
            <div className="returvex-card p-3.5 border-t-2 border-t-[#DC2626] bg-[#FEF2F2]/30">
              <span className="text-[10px] text-[#DC2626] uppercase font-bold">Total Net Loss</span>
              <p className="text-lg font-bold font-mono text-[#DC2626] mt-0.5">
                ₹{data.kpis.net_financial_loss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-[#718096]">Avg: ₹{data.kpis.average_return_refund.toFixed(0)}</span>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="returvex-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE6EF]">
              <div>
                <h3 className="text-sm font-semibold text-[#24344D]">Monthly Financial Return Losses & Salvage Trend</h3>
                <p className="text-[11px] text-[#718096]">Comparison of Gross Refunds, Logistics Overhead, and Recovered Value over time</p>
              </div>
              <span className="text-[10px] text-[#718096] bg-[#F3F6FA] px-2 py-0.5 rounded">6-Month View</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_trend} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#DFE6EF",
                      borderRadius: "6px",
                      fontSize: "11px"
                    }}
                    formatter={(val: any, name: any) => [`₹${val.toLocaleString()}`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="refund_amount" name="Gross Refunds" fill="#24344D" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="logistics_cost" name="Logistics Waste" fill="#E47D68" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recoverable_value" name="Recovered Resale" fill="#58A88B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net_loss" name="Net Loss" fill="#8978C6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Financial Breakdown Table */}
          <div className="returvex-card overflow-hidden">
            <div className="p-4 border-b border-[#DFE6EF] bg-[#F8FAFC]">
              <h3 className="text-sm font-semibold text-[#24344D]">Category Profitability & Return Cost Table</h3>
              <p className="text-[11px] text-[#718096]">Detailed loss attribution across catalog sectors</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="table-head">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Returns Volume</th>
                    <th className="py-2.5 px-3">Gross Refunds</th>
                    <th className="py-2.5 px-3">Reverse Logistics</th>
                    <th className="py-2.5 px-3">Restocking Fee</th>
                    <th className="py-2.5 px-3">Damage Write-Off</th>
                    <th className="py-2.5 px-3 text-[#58A88B]">Salvage Recovered</th>
                    <th className="py-2.5 px-3 font-bold text-[#8978C6]">Net Return Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE6EF]">
                  {data.by_category.map((c) => (
                    <tr key={c.category} className="hover:bg-[#F3F6FA]">
                      <td className="py-2.5 px-3 font-semibold text-[#24344D]">{c.category}</td>
                      <td className="py-2.5 px-3 font-mono">{c.returns_count}</td>
                      <td className="py-2.5 px-3 font-mono">₹{c.refund_amount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono">₹{c.logistics_cost.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono">₹{c.restocking_cost.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-[#E47D68]">₹{c.write_off_cost.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-[#58A88B] font-medium">- ₹{c.recoverable_value.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#8978C6]">₹{c.net_loss.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
