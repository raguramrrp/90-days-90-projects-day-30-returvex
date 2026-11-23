import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  RotateCcw,
  SearchCheck,
  BrainCircuit,
  BadgePercent,
  FileSpreadsheet,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart2
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Returns", path: "/returns", icon: RotateCcw },
    { name: "Root Causes", path: "/root-causes", icon: SearchCheck },
    { name: "Prediction", path: "/predictions", icon: BrainCircuit },
    { name: "Financial", path: "/financial", icon: BadgePercent },
    { name: "Reports", path: "/reports", icon: FileSpreadsheet },
    { name: "Data Mgmt", path: "/data-management", icon: Database },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`bg-white border-r border-[#E8EEF5] text-[#475569] flex flex-col justify-between transition-all duration-200 select-none z-20 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div>
        {/* Toggle bar */}
        <div className="h-4 flex items-center justify-end px-3 pt-3">
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#EBF2FE] text-[#2A62F8] font-semibold"
                      : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFD]"
                  }`
                }
                title={collapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar on left edge */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2A62F8] rounded-r-md" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#2A62F8]" : "text-[#64748B]"}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo Card matching reference image: 'Reduce Returns / Boost Profitability' */}
      {!collapsed ? (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-[#EBF2FE] via-[#EFF6FF] to-[#EDE9FE] border border-[#DBEAFE] text-center relative overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/80 shadow-xs mx-auto flex items-center justify-center mb-1.5 text-[#2A62F8]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-[#1E293B]">Reduce Returns</p>
          <p className="text-[10px] text-[#64748B]">Boost Profitability</p>
        </div>
      ) : (
        <div className="p-2 text-center text-[#94A3B8] border-t border-[#E8EEF5]">
          <BarChart2 className="w-4 h-4 mx-auto text-[#2A62F8]" />
        </div>
      )}
    </aside>
  );
};
