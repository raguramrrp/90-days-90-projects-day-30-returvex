import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Calendar, ChevronDown, X, ArrowRight, Package } from "lucide-react";
import { api } from "../api/client";
import { ProductListItem } from "../types";

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
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const periodLabels: Record<string, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "12m": "Last 1 Year"
  };

  // Perform live search when searchQuery changes
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 1) {
      setSearchResults([]);
      setSearchTotal(0);
      return;
    }

    const timer = setTimeout(() => {
      setSearchLoading(true);
      api.getProducts({ search: trimmed, page_size: 5 })
        .then((res) => {
          setSearchResults(res.items);
          setSearchTotal(res.total);
        })
        .catch(console.error)
        .finally(() => setSearchLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle click outside search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchFocused(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (e.key === "Escape") {
      setSearchFocused(false);
    }
  };

  const handleSelectProduct = (productName: string) => {
    setSearchFocused(false);
    navigate(`/products?search=${encodeURIComponent(productName)}`);
  };

  return (
    <header className="h-16 bg-white border-b border-[#E8EEF5] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* LEFT: RETURVEX Logo matching reference image */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate("/")}>
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

      {/* CENTER: Live Global Search Bar */}
      <div ref={searchContainerRef} className="flex-1 max-w-md mx-8 hidden md:block relative">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setSearchFocused(true);
            }}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search anything..."
            className="w-full bg-[#F3F6FA] border border-transparent hover:border-[#DFE6EF] focus:border-[#2A62F8] focus:bg-white rounded-full pl-10 pr-9 py-2 text-xs text-[#1A2840] placeholder-[#94A3B8] focus:outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange("");
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown Popover */}
        {searchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-[#DFE6EF] rounded-xl shadow-xl overflow-hidden z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3.5 py-2 bg-[#F8FAFC] border-b border-[#DFE6EF] flex items-center justify-between text-[11px] text-[#64748B]">
              <span>
                {searchLoading ? "Searching catalog..." : `Matching Products (${searchTotal})`}
              </span>
              <span className="text-[10px] text-[#94A3B8]">Press Enter to view all</span>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-[#F1F5F9]">
              {searchResults.length > 0 ? (
                searchResults.map((p) => {
                  const isCrit = p.risk_tier === "Critical";
                  const isHigh = p.risk_tier === "High";
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p.product_name)}
                      className="px-3.5 py-2.5 hover:bg-[#F3F6FA] cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-[#EFF6FF] text-[#2A62F8] flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#1E293B] truncate">{p.product_name}</div>
                          <div className="text-[11px] text-[#64748B] flex items-center space-x-2">
                            <span className="font-mono text-[#2A62F8]">{p.product_code}</span>
                            <span>&bull;</span>
                            <span>{p.category_name}</span>
                            <span>&bull;</span>
                            <span className="font-medium text-[#1E293B]">₹{p.selling_price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right ml-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isCrit
                              ? "bg-[#FEF2F2] text-[#DC2626]"
                              : isHigh
                              ? "bg-[#FFFBEB] text-[#D97706]"
                              : "bg-[#F0FDF4] text-[#16A34A]"
                          }`}
                        >
                          {p.return_rate.toFixed(1)}% Ret
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : !searchLoading ? (
                <div className="px-4 py-6 text-center text-[#64748B]">
                  No products found matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : null}
            </div>

            {searchTotal > 0 && (
              <div
                onClick={() => {
                  setSearchFocused(false);
                  navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="px-3.5 py-2 bg-[#F8FAFC] border-t border-[#DFE6EF] hover:bg-[#EFF6FF] cursor-pointer transition-colors flex items-center justify-between text-[#2A62F8] font-semibold text-[11px]"
              >
                <span>View all {searchTotal} products in Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        )}
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
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F6FA] transition-colors ${
                    selectedPeriod === p ? "font-bold text-[#2A62F8] bg-[#EFF6FF]" : "text-[#26364B]"
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Report CTA */}
        <a
          href={`/api/reports/export-pdf?report_type=executive&period=${selectedPeriod}`}
          download
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          <span>Export Report</span>
        </a>

        {/* User Profile Avatar matching 'FA' in reference */}
        <div className="w-8 h-8 rounded-full bg-[#E2E8F0] border border-[#CBD5E1] flex items-center justify-center text-xs font-bold text-[#334155] shadow-2xs">
          FA
        </div>
      </div>
    </header>
  );
};
