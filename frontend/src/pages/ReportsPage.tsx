import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet, Download, FileText, Calendar, Filter,
  CheckCircle2, Printer, Eye, BarChart3, TrendingUp, AlertCircle
} from "lucide-react";
import { api } from "../api/client";

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<string>("executive");
  const [period, setPeriod] = useState<string>("30d");
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchReport = () => {
    setLoading(true);
    api.generateReport({
      report_type: reportType,
      period: period
    })
      .then(setReportData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, period]);

  const handleDownload = async (format: "csv" | "pdf") => {
    setDownloading(format);
    try {
      const res = await fetch(`/api/reports/export-${format}?report_type=${reportType}&period=${period}`);
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `returvex_${reportType}_${period}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download report");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DFE6EF]">
        <div>
          <h1 className="text-xl font-bold text-[#24344D] tracking-tight">Reports</h1>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => handleDownload("csv")}
            disabled={downloading !== null}
            className="btn-secondary flex items-center space-x-1.5 text-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#3567C8]" />
            <span>{downloading === "csv" ? "Exporting CSV..." : "Download CSV"}</span>
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={downloading !== null}
            className="btn-primary flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{downloading === "pdf" ? "Creating PDF..." : "Generate PDF Report"}</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Bar */}
      <div className="returvex-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Report Type Selector */}
          <div>
            <label className="block font-medium text-[#26364B] mb-1">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="field-input text-xs cursor-pointer"
            >
              <option value="executive">Executive Summary Report</option>
              <option value="product">Product Return Risk & SKU Register</option>
              <option value="financial">Financial Impact & Recovery Accounting</option>
              <option value="regional">Regional State-Wise Return Analysis</option>
            </select>
          </div>

          {/* Period Selector */}
          <div>
            <label className="block font-medium text-[#26364B] mb-1">Audit Time Horizon</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="field-input text-xs cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days (Standard)</option>
              <option value="90d">Last 90 Days (Quarterly)</option>
              <option value="12m">Last 12 Months (Annual)</option>
            </select>
          </div>

          {/* Refresh Action */}
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="btn-secondary w-full py-2 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#3567C8]" />
              <span>{loading ? "Refreshing..." : "Refresh Report Data"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Report Preview Canvas */}
      <div className="returvex-card p-6 space-y-5 bg-white border border-[#DFE6EF]">
        {loading || !reportData ? (
          <div className="p-12 text-center text-xs text-[#718096]">
            Generating report data...
          </div>
        ) : (
          <>
            {/* Report Header Banner */}
            <div className="border-b border-[#DFE6EF] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <span className="text-[10px] font-bold text-[#3567C8] uppercase tracking-wider">
                  RETURVEX INTELLIGENCE REPORT
                </span>
                <h2 className="text-lg font-bold text-[#24344D] mt-0.5">{reportData.title}</h2>
                <p className="text-[11px] text-[#718096]">
                  Generated: {reportData.generated_at} • Time Horizon: {reportData.period.toUpperCase()}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded bg-[#F0FDF4] text-[#16A34A] text-xs font-semibold border border-[#BBF7D0]">
                Verified Database Calculations
              </span>
            </div>

            {/* 1. EXECUTIVE SUMMARY VIEW */}
            {reportType === "executive" && reportData.summary_kpis && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="font-semibold text-[#24344D] uppercase text-xs tracking-wider mb-2">
                    Performance Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(reportData.summary_kpis).map(([k, v]) => (
                      <div key={k} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                        <span className="text-[10px] text-[#718096] uppercase font-semibold">
                          {k.replace(/_/g, " ")}
                        </span>
                        <p className="text-base font-bold font-mono text-[#24344D] mt-1">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Reasons */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#24344D] uppercase text-xs tracking-wider">
                      Top Return Reasons
                    </h3>
                    <div className="border border-[#DFE6EF] rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FAFC] border-b border-[#DFE6EF] text-[#718096]">
                          <tr>
                            <th className="py-2 px-3">Reason</th>
                            <th className="py-2 px-3">Volume</th>
                            <th className="py-2 px-3">Share %</th>
                            <th className="py-2 px-3">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE6EF]">
                          {reportData.top_reasons?.map((r: any) => (
                            <tr key={r.reason}>
                              <td className="py-2 px-3 font-medium text-[#24344D]">{r.reason}</td>
                              <td className="py-2 px-3 font-mono">{r.count}</td>
                              <td className="py-2 px-3 font-mono">{r.share}</td>
                              <td className="py-2 px-3 font-mono text-[#8978C6]">{r.cost}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Regions */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#24344D] uppercase text-xs tracking-wider">
                      Regional State Impact
                    </h3>
                    <div className="border border-[#DFE6EF] rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FAFC] border-b border-[#DFE6EF] text-[#718096]">
                          <tr>
                            <th className="py-2 px-3">State</th>
                            <th className="py-2 px-3">Orders</th>
                            <th className="py-2 px-3">Returns</th>
                            <th className="py-2 px-3">Return Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE6EF]">
                          {reportData.top_regions?.map((reg: any) => (
                            <tr key={reg.state}>
                              <td className="py-2 px-3 font-medium text-[#24344D]">{reg.state}</td>
                              <td className="py-2 px-3 font-mono">{reg.orders}</td>
                              <td className="py-2 px-3 font-mono">{reg.returns}</td>
                              <td className="py-2 px-3 font-mono font-semibold text-[#3567C8]">{reg.return_rate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCT REGISTER VIEW */}
            {reportType === "product" && reportData.products && (
              <div className="overflow-x-auto border border-[#DFE6EF] rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8FAFC] border-b border-[#DFE6EF] text-[#718096]">
                    <tr>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Orders</th>
                      <th className="py-2 px-3">Returns</th>
                      <th className="py-2 px-3">Rate</th>
                      <th className="py-2 px-3">Return Cost</th>
                      <th className="py-2 px-3">Risk Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE6EF]">
                    {reportData.products.slice(0, 25).map((p: any) => (
                      <tr key={p.code}>
                        <td className="py-2 px-3 font-mono text-[#3567C8]">{p.code}</td>
                        <td className="py-2 px-3 font-medium text-[#24344D]">{p.name}</td>
                        <td className="py-2 px-3 text-[#718096]">{p.category}</td>
                        <td className="py-2 px-3 font-mono">{p.price}</td>
                        <td className="py-2 px-3 font-mono">{p.orders}</td>
                        <td className="py-2 px-3 font-mono">{p.returns}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-[#E47D68]">{p.return_rate}</td>
                        <td className="py-2 px-3 font-mono text-[#8978C6]">{p.financial_cost}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            p.risk_tier === "Critical" ? "bg-red-50 text-red-600 border border-red-200" :
                            p.risk_tier === "High" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                            "bg-blue-50 text-blue-600 border border-blue-200"
                          }`}>
                            {p.risk_tier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. FINANCIAL IMPACT & RECOVERY VIEW */}
            {reportType === "financial" && reportData.kpis && (
              <div className="space-y-5 text-xs">
                {/* Financial KPI Summary */}
                <div>
                  <h3 className="font-semibold text-[#24344D] uppercase text-xs tracking-wider mb-2">
                    Financial Ledger Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                      <span className="text-[10px] text-[#718096] uppercase font-semibold">Gross Refund</span>
                      <p className="text-base font-bold font-mono text-[#24344D] mt-1">₹{Number(reportData.kpis.gross_refund_amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                      <span className="text-[10px] text-[#718096] uppercase font-semibold">Logistics Cost</span>
                      <p className="text-base font-bold font-mono text-[#24344D] mt-1">₹{Number(reportData.kpis.reverse_logistics_cost || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                      <span className="text-[10px] text-[#718096] uppercase font-semibold">Restocking</span>
                      <p className="text-base font-bold font-mono text-[#24344D] mt-1">₹{Number(reportData.kpis.restocking_cost || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                      <span className="text-[10px] text-[#718096] uppercase font-semibold">Write-Off</span>
                      <p className="text-base font-bold font-mono text-[#24344D] mt-1">₹{Number(reportData.kpis.write_off_cost || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                      <span className="text-[10px] text-[#718096] uppercase font-semibold">Salvage Recovery</span>
                      <p className="text-base font-bold font-mono text-[#10B981] mt-1">₹{Number(reportData.kpis.recoverable_value || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
                      <span className="text-[10px] text-[#1E40AF] uppercase font-semibold">Net Return Cost</span>
                      <p className="text-base font-bold font-mono text-[#1E40AF] mt-1">₹{Number(reportData.kpis.net_financial_loss || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Category & Reason Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#24344D] uppercase text-xs tracking-wider">
                      Loss Breakdown by Category
                    </h3>
                    <div className="border border-[#DFE6EF] rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FAFC] border-b border-[#DFE6EF] text-[#718096]">
                          <tr>
                            <th className="py-2 px-3">Category</th>
                            <th className="py-2 px-3">Returns</th>
                            <th className="py-2 px-3">Refund</th>
                            <th className="py-2 px-3">Net Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE6EF]">
                          {reportData.by_category?.slice(0, 8).map((c: any) => (
                            <tr key={c.category}>
                              <td className="py-2 px-3 font-medium text-[#24344D]">{c.category}</td>
                              <td className="py-2 px-3 font-mono">{c.returns_count}</td>
                              <td className="py-2 px-3 font-mono">₹{Number(c.refund_amount).toLocaleString()}</td>
                              <td className="py-2 px-3 font-mono font-semibold text-[#8978C6]">₹{Number(c.net_loss).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Reason Breakdown */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#24344D] uppercase text-xs tracking-wider">
                      Loss Breakdown by Reason
                    </h3>
                    <div className="border border-[#DFE6EF] rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FAFC] border-b border-[#DFE6EF] text-[#718096]">
                          <tr>
                            <th className="py-2 px-3">Reason</th>
                            <th className="py-2 px-3">Returns</th>
                            <th className="py-2 px-3">Refund</th>
                            <th className="py-2 px-3">Net Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE6EF]">
                          {reportData.by_reason?.map((r: any) => (
                            <tr key={r.reason}>
                              <td className="py-2 px-3 font-medium text-[#24344D]">{r.reason}</td>
                              <td className="py-2 px-3 font-mono">{r.returns_count}</td>
                              <td className="py-2 px-3 font-mono">₹{Number(r.refund_amount).toLocaleString()}</td>
                              <td className="py-2 px-3 font-mono font-semibold text-[#8978C6]">₹{Number(r.net_loss).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. REGIONAL STATE-WISE RETURN VIEW */}
            {reportType === "regional" && reportData.regions && (
              <div className="space-y-5 text-xs">
                {/* State metrics overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold">States Analyzed</span>
                    <p className="text-base font-bold font-mono text-[#24344D] mt-1">{reportData.regions.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold">Total Regional Orders</span>
                    <p className="text-base font-bold font-mono text-[#24344D] mt-1">
                      {reportData.regions.reduce((acc: number, r: any) => acc + (r.orders || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold">Total Regional Returns</span>
                    <p className="text-base font-bold font-mono text-[#E47D68] mt-1">
                      {reportData.regions.reduce((acc: number, r: any) => acc + (r.returns || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold">Highest Return Rate</span>
                    <p className="text-base font-bold font-mono text-[#3567C8] mt-1">
                      {reportData.regions[0] ? `${reportData.regions[0].state} (${reportData.regions[0].return_rate})` : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Regional Table */}
                <div className="overflow-x-auto border border-[#DFE6EF] rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F8FAFC] border-b border-[#DFE6EF] text-[#718096]">
                      <tr>
                        <th className="py-2 px-3">State</th>
                        <th className="py-2 px-3">Region</th>
                        <th className="py-2 px-3">Total Orders</th>
                        <th className="py-2 px-3">Returned Orders</th>
                        <th className="py-2 px-3">Return Rate</th>
                        <th className="py-2 px-3">Financial Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE6EF]">
                      {reportData.regions.map((reg: any) => (
                        <tr key={reg.state} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-semibold text-[#24344D]">{reg.state}</td>
                          <td className="py-2.5 px-3 text-[#718096]">{reg.region}</td>
                          <td className="py-2.5 px-3 font-mono">{reg.orders?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono">{reg.returns?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#3567C8]">{reg.return_rate}</td>
                          <td className="py-2.5 px-3 font-mono text-[#8978C6]">{reg.impact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-[#DFE6EF] flex justify-between items-center text-[10px] text-[#91A0B5]">
              <span>RETURVEX Enterprise Intelligence Station</span>
              <span>CSV & PDF Export Ready</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
