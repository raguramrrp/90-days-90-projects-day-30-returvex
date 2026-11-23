import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet, Download, FileText, Calendar, Filter,
  CheckCircle2, Printer, Eye
} from "lucide-react";
import { api } from "../api/client";

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<string>("executive");
  const [period, setPeriod] = useState<string>("30d");
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DFE6EF]">
        <div>
          <h1 className="text-xl font-bold text-[#24344D] tracking-tight">Enterprise Reporting Centre</h1>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <a
            href={`/api/reports/export-csv?report_type=${reportType}&period=${period}`}
            download
            className="btn-secondary flex items-center space-x-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#3567C8]" />
            <span>Download CSV</span>
          </a>
          <a
            href={`/api/reports/export-pdf?report_type=${reportType}&period=${period}`}
            download
            className="btn-primary flex items-center space-x-1.5 text-xs font-semibold"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate PDF Report</span>
          </a>
        </div>
      </div>

      {/* Report Configuration Bar */}
      <div className="returvex-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Report Type */}
          <div>
            <label className="block font-medium text-[#26364B] mb-1">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="field-input text-xs"
            >
              <option value="executive">Executive Summary Report</option>
              <option value="product">Product Return Risk & SKU Register</option>
              <option value="financial">Financial Impact & Recovery Accounting</option>
              <option value="regional">Regional State-Wise Return Analysis</option>
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block font-medium text-[#26364B] mb-1">Audit Time Horizon</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="field-input text-xs"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days (Standard)</option>
              <option value="90d">Last 90 Days (Quarterly)</option>
              <option value="12m">Last 12 Months (Annual)</option>
            </select>
          </div>

          {/* Status info */}
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="btn-secondary w-full py-2 flex items-center justify-center space-x-1.5"
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
            Compiling report tables and mathematical definitions...
          </div>
        ) : (
          <>
            {/* Report Header block */}
            <div className="border-b border-[#DFE6EF] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <span className="text-[10px] font-bold text-[#3567C8] uppercase tracking-wider">
                  RETURVEX INTELLIGENCE SYSTEM
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

            {/* Executive Summary View */}
            {reportType === "executive" && reportData.summary_kpis && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="font-semibold text-[#24344D] uppercase text-xs tracking-wider mb-2">
                    1. Performance Telemetry
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(reportData.summary_kpis).map(([k, v]) => (
                      <div key={k} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF]">
                        <span className="text-[10px] text-[#718096] uppercase font-semibold">
                          {k.replace("_", " ")}
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
                      2. Top Return Reasons
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
                      3. Regional State Impact
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

            {/* Product View */}
            {reportType === "product" && reportData.products && (
              <div className="overflow-x-auto border border-[#DFE6EF] rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8FAFC] border-b border-[#DFE6EF] text-[#718096]">
                    <tr>
                      <th className="py-2 px-3">Code</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Orders</th>
                      <th className="py-2 px-3">Returns</th>
                      <th className="py-2 px-3">Rate</th>
                      <th className="py-2 px-3">Cost</th>
                      <th className="py-2 px-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE6EF]">
                    {reportData.products.slice(0, 20).map((p: any) => (
                      <tr key={p.code}>
                        <td className="py-2 px-3 font-mono text-[#3567C8]">{p.code}</td>
                        <td className="py-2 px-3 font-medium text-[#24344D]">{p.name}</td>
                        <td className="py-2 px-3 text-[#718096]">{p.category}</td>
                        <td className="py-2 px-3 font-mono">{p.price}</td>
                        <td className="py-2 px-3 font-mono">{p.orders}</td>
                        <td className="py-2 px-3 font-mono">{p.returns}</td>
                        <td className="py-2 px-3 font-mono font-semibold">{p.return_rate}</td>
                        <td className="py-2 px-3 font-mono text-[#8978C6]">{p.financial_cost}</td>
                        <td className="py-2 px-3 uppercase text-[10px] font-bold">{p.risk_tier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-[#DFE6EF] flex justify-between items-center text-[10px] text-[#91A0B5]">
              <span>RETURVEX Enterprise Intelligence Station • Zero API Dependency</span>
              <span>ReportLab &bull; Exact Financial Ledger</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
