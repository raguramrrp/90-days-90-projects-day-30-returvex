import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon, Database, Save, RotateCcw,
  CheckCircle2, AlertTriangle, ShieldCheck, Info
} from "lucide-react";
import { api } from "../api/client";

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    currency_symbol: "₹",
    reverse_logistics_fee: 120.0,
    restocking_percent: 0.05,
    write_off_percent: 0.15,
    recoverable_percent: 0.80,
    risk_threshold_low: 8.0,
    risk_threshold_moderate: 15.0,
    risk_threshold_high: 25.0
  });
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [reseedLoading, setReseedLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getSettings()
      .then((res) => {
        setSettings(res.settings);
        setDbInfo(res.database);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    api.updateSettings(settings)
      .then(() => {
        setStatusMsg("System settings updated successfully.");
      })
      .catch((err) => {
        setStatusMsg(`Failed to save: ${err.message}`);
      })
      .finally(() => setSaving(false));
  };

  const handleReseed = () => {
    if (!window.confirm("Are you sure you want to reset and reseed the synthetic database with reproducible seed 42? This will re-train the models.")) {
      return;
    }

    setReseedLoading(true);
    setStatusMsg(null);

    api.reseedDatabase()
      .then((res) => {
        setStatusMsg(res.message);
        // Refresh db stats
        api.getSettings().then((s) => {
          setSettings(s.settings);
          setDbInfo(s.database);
        });
      })
      .catch((err) => {
        setStatusMsg(`Reseed failed: ${err.message}`);
      })
      .finally(() => setReseedLoading(false));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="pb-2 border-b border-[#DFE6EF]">
        <h1 className="text-xl font-bold text-[#24344D] tracking-tight">Workstation Configuration & Settings</h1>
        <p className="text-xs text-[#718096]">
          Configure currency symbols, accounting parameters, risk classification thresholds, and database maintenance.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-[#F0FDF4] text-[#16A34A] text-xs font-medium rounded border border-[#BBF7D0] flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Configurable Settings (8 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-8 returvex-card p-6 space-y-6 text-xs">
          {/* Section 1: Financial & Currency Parameters */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#DFE6EF]">
              <h2 className="text-sm font-semibold text-[#24344D]">1. Financial Cost Model Defaults</h2>
              <p className="text-[11px] text-[#718096]">
                Variables utilized in Net Return Loss accounting formulas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#26364B] mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="field-input font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#26364B] mb-1">
                  Default Reverse Logistics Fee ({settings.currency_symbol})
                </label>
                <input
                  type="number"
                  step="5"
                  value={settings.reverse_logistics_fee}
                  onChange={(e) => setSettings({ ...settings, reverse_logistics_fee: Number(e.target.value) })}
                  className="field-input font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#26364B] mb-1">
                  Restocking Fee Factor (e.g. 0.05 = 5%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.5"
                  value={settings.restocking_percent}
                  onChange={(e) => setSettings({ ...settings, restocking_percent: Number(e.target.value) })}
                  className="field-input font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#26364B] mb-1">
                  Damage Write-Off Factor (e.g. 0.15 = 15%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1.0"
                  value={settings.write_off_percent}
                  onChange={(e) => setSettings({ ...settings, write_off_percent: Number(e.target.value) })}
                  className="field-input font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#26364B] mb-1">
                  Recoverable Resale Salvage Factor (e.g. 0.80 = 80%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1.0"
                  value={settings.recoverable_percent}
                  onChange={(e) => setSettings({ ...settings, recoverable_percent: Number(e.target.value) })}
                  className="field-input font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Risk Classification Thresholds */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#DFE6EF]">
              <h2 className="text-sm font-semibold text-[#24344D]">2. Return Rate Risk Thresholds</h2>
              <p className="text-[11px] text-[#718096]">
                Defines boundaries for classifying catalog SKUs into Low, Moderate, High, or Critical.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-[#26364B] mb-1">Low Risk Ceiling (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.risk_threshold_low}
                  onChange={(e) => setSettings({ ...settings, risk_threshold_low: Number(e.target.value) })}
                  className="field-input font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#26364B] mb-1">Moderate Risk Ceiling (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.risk_threshold_moderate}
                  onChange={(e) => setSettings({ ...settings, risk_threshold_moderate: Number(e.target.value) })}
                  className="field-input font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#26364B] mb-1">High Risk Ceiling (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.risk_threshold_high}
                  onChange={(e) => setSettings({ ...settings, risk_threshold_high: Number(e.target.value) })}
                  className="field-input font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-2 px-5 font-semibold flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving Changes..." : "Save System Configuration"}</span>
            </button>
          </div>
        </form>

        {/* Right Info: Database & Reseed (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Database Health Card */}
          <div className="returvex-card p-5 space-y-3.5 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#DFE6EF]">
              <Database className="w-4 h-4 text-[#3567C8]" />
              <h3 className="font-semibold text-sm text-[#24344D]">Database Architecture</h3>
            </div>

            {dbInfo ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#718096]">Active Engine:</span>
                  <span className="font-semibold text-[#24344D]">{dbInfo.engine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Operational Status:</span>
                  <span className="text-[#16A34A] font-semibold">{dbInfo.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Orders Recorded:</span>
                  <span className="font-mono font-medium">{dbInfo.total_orders?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Returns Recorded:</span>
                  <span className="font-mono font-medium">{dbInfo.total_returns?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Catalog Products:</span>
                  <span className="font-mono font-medium">{dbInfo.total_products?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Customer Profiles:</span>
                  <span className="font-mono font-medium">{dbInfo.total_customers?.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-[#718096]">Loading database health metrics...</p>
            )}
          </div>

          {/* Reset & Reseed Demonstration Dataset */}
          <div className="returvex-card p-5 space-y-3 text-xs border border-[#FCEECB] bg-[#FFFDF5]">
            <div className="flex items-center space-x-2 text-[#92400E] font-bold">
              <RotateCcw className="w-4 h-4 text-[#D5A64A]" />
              <span>Reset & Reseed Demo Data</span>
            </div>
            <p className="text-[#718096] text-[11px] leading-relaxed">
              Resets the database and generates a reproducible 5,000-order synthetic dataset with 100 products and re-trains the Random Forest and Logistic Regression models using fixed seed 42.
            </p>
            <button
              onClick={handleReseed}
              disabled={reseedLoading}
              className="w-full py-2 bg-white border border-[#D5A64A] text-[#92400E] rounded-md font-semibold hover:bg-[#FFFBEB] transition-colors"
            >
              {reseedLoading ? "Reseeding Database & Training ML..." : "Reset and Reseed (Seed: 42)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
