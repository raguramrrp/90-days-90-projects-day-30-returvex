import React, { useState } from "react";
import { Search, Download, Calendar, ChevronDown } from "lucide-react";

interface HeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedPeriod,
  onPeriodChange,
  searchQuery,
  onSearchChange
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const periodLabels: Record<string, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "12m": "Last 1 Year"
  };

  return (
    <header className="h-16 bg-white border-b border-[#E8EEF5] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* LEFT: RETURVEX Logo matching reference image */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          {/* Orange/Coral Shopping Bag Icon with folded look from reference image */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FA5252] flex items-center justify-center text-white shadow-xs">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-extrabold text-[17px] tracking-tight text-[#162744]">RETURVEX</span>
              <span className="text-[10px] text-[#94A3B8] font-bold">&reg;</span>
            </div>
            <p className="text-[10px] text-[#64748B] -mt-1 font-medium tracking-tight">Returns Intelligence</p>
          </div>
        </div>
      </div>

      {/* CENTER: Search Bar matching pill shape with 'Search anything...' */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search anything..."
            className="w-full bg-[#F3F6FA] border border-transparent hover:border-[#DFE6EF] focus:border-[#2A62F8] focus:bg-white rounded-full pl-10 pr-4 py-2 text-xs text-[#1A2840] placeholder-[#94A3B8] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* RIGHT: Live Data indicator, Date range dropdown, Export Report, User Avatar */}
      <div className="flex items-center space-x-3.5">
        {/* Live Data Badge */}
        <div className="flex items-center space-x-1.5 text-xs text-[#475569] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Live Data</span>
        </div>

        {/* Date Dropdown matching 'Last 30 Days ∨' */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border border-[#DFE6EF] bg-white hover:bg-[#F8FAFD] text-xs font-medium text-[#1E293B] shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
            <span>{periodLabels[selectedPeriod] || "Last 30 Days"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-[#DFE6EF] rounded-lg shadow-lg py-1 z-40 text-xs">
              {["7d", "30d", "90d", "12m"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onPeriodChange(p);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F1F5F9] transition-colors ${
                    selectedPeriod === p ? "text-[#2A62F8] font-semibold bg-[#EFF6FF]" : "text-[#334155]"
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Report Button matching dark button */}
        <a
          href={`/api/reports/export-pdf?period=${selectedPeriod}`}
          download
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#1B2A4A] hover:bg-[#121F38] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </a>

        {/* Avatar 'FA' matching reference */}
        <div className="w-8 h-8 rounded-full bg-[#E2E8F0] border border-[#CBD5E1] flex items-center justify-center text-xs font-bold text-[#1E293B]">
          FA
        </div>
      </div>
    </header>
  );
};
