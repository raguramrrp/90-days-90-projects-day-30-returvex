import React, { useState } from "react";
import { RegionalReturnPoint } from "../types";

export interface IndiaMapProps {
  regions?: RegionalReturnPoint[];
  activeState?: string | null;
  hoveredState?: string | null;
  onHoverState?: (stateName: string | null) => void;
  onSelectState?: (stateName: string | null) => void;
}

interface StatePathDefinition {
  id: string;
  name: string;
  dbKey: string;
  d: string;
  center: [number, number];
}

const STATE_PATHS: StatePathDefinition[] = [
  {
    id: "jk_ladakh",
    name: "Jammu & Kashmir / Ladakh",
    dbKey: "Jammu & Kashmir",
    d: "M 160,70 L 140,48 Q 155,18 185,12 Q 215,18 245,45 L 235,75 L 210,85 L 180,80 Z",
    center: [190, 45]
  },
  {
    id: "punjab_hp_uk",
    name: "Punjab & Northern Hills",
    dbKey: "Punjab",
    d: "M 160,70 L 180,80 L 210,85 L 235,110 L 210,122 L 175,115 L 145,100 Z",
    center: [185, 95]
  },
  {
    id: "haryana_delhi",
    name: "Delhi NCR & Haryana",
    dbKey: "Delhi",
    d: "M 145,100 L 175,115 L 185,130 L 165,145 L 140,125 Z",
    center: [165, 125]
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    dbKey: "Rajasthan",
    d: "M 140,125 L 165,145 L 160,180 L 125,205 L 80,185 Q 65,145 105,120 Z",
    center: [120, 160]
  },
  {
    id: "gujarat",
    name: "Gujarat",
    dbKey: "Gujarat",
    d: "M 80,185 L 125,205 L 105,225 L 85,248 L 55,255 Q 35,230 65,210 L 40,195 Z",
    center: [75, 220]
  },
  {
    id: "uttar_pradesh",
    name: "Uttar Pradesh",
    dbKey: "Uttar Pradesh",
    d: "M 175,115 L 210,122 L 235,110 Q 275,135 290,160 L 285,185 L 225,180 L 185,160 L 185,130 Z",
    center: [230, 150]
  },
  {
    id: "bihar",
    name: "Bihar",
    dbKey: "Bihar",
    d: "M 285,185 L 325,175 L 325,212 L 285,215 Z",
    center: [305, 195]
  },
  {
    id: "west_bengal",
    name: "West Bengal & Jharkhand",
    dbKey: "West Bengal",
    d: "M 325,175 L 330,150 L 340,205 L 335,240 L 305,230 L 285,215 L 325,212 Z",
    center: [320, 215]
  },
  {
    id: "odisha",
    name: "Odisha",
    dbKey: "Odisha",
    d: "M 305,230 L 280,265 L 255,295 L 225,280 L 240,245 L 285,215 Z",
    center: [265, 260]
  },
  {
    id: "northeast",
    name: "Assam & North East",
    dbKey: "Assam",
    d: "M 330,150 Q 370,120 395,140 Q 405,170 380,200 Q 345,215 340,180 Z",
    center: [365, 165]
  },
  {
    id: "madhya_pradesh",
    name: "Madhya Pradesh & Central",
    dbKey: "Madhya Pradesh",
    d: "M 165,145 L 185,160 L 225,180 L 240,245 L 225,280 L 170,265 L 140,240 L 125,205 L 160,180 Z",
    center: [185, 215]
  },
  {
    id: "maharashtra",
    name: "Maharashtra",
    dbKey: "Maharashtra",
    d: "M 85,248 L 140,240 L 170,265 L 195,285 L 140,315 L 105,320 L 90,275 Z",
    center: [130, 275]
  },
  {
    id: "goa",
    name: "Goa",
    dbKey: "Goa",
    d: "M 100,320 L 108,322 L 105,332 L 97,330 Z",
    center: [102, 326]
  },
  {
    id: "andhra_telangana",
    name: "Telangana & Andhra Pradesh",
    dbKey: "Telangana",
    d: "M 195,285 L 255,295 L 235,345 L 205,385 L 165,350 L 165,305 Z",
    center: [205, 335]
  },
  {
    id: "karnataka",
    name: "Karnataka",
    dbKey: "Karnataka",
    d: "M 105,320 L 140,315 L 165,305 L 165,350 L 155,395 L 120,375 L 108,340 Z",
    center: [135, 355]
  },
  {
    id: "kerala",
    name: "Kerala",
    dbKey: "Kerala",
    d: "M 120,375 L 140,410 L 155,445 L 145,455 L 130,415 Z",
    center: [135, 420]
  },
  {
    id: "tamil_nadu",
    name: "Tamil Nadu",
    dbKey: "Tamil Nadu",
    d: "M 205,385 L 195,420 L 175,455 L 145,455 L 155,445 L 140,410 L 155,395 Z",
    center: [175, 420]
  }
];

export const IndiaMap: React.FC<IndiaMapProps> = ({
  regions = [],
  activeState,
  hoveredState,
  onHoverState,
  onSelectState
}) => {
  const [internalHover, setInternalHover] = useState<string | null>(null);

  const effectiveHover = hoveredState !== undefined ? hoveredState : internalHover;

  // Helper to find regional statistics
  const getRegionData = (stateKey: string) => {
    return (
      regions.find(
        (r) =>
          r.state.toLowerCase() === stateKey.toLowerCase() ||
          r.state.toLowerCase().includes(stateKey.toLowerCase()) ||
          stateKey.toLowerCase().includes(r.state.toLowerCase())
      ) || null
    );
  };

  // Dynamic fill color based on return rate
  const getFillColor = (item: StatePathDefinition) => {
    const isSelected = activeState && (
      item.dbKey.toLowerCase() === activeState.toLowerCase() ||
      item.name.toLowerCase().includes(activeState.toLowerCase())
    );
    const isHovered = effectiveHover && (
      item.dbKey.toLowerCase() === effectiveHover.toLowerCase() ||
      item.name.toLowerCase().includes(effectiveHover.toLowerCase())
    );

    if (isSelected || isHovered) {
      return "#1E3A8A"; // Deep Navy for selected/hovered state (matching reference)
    }

    const reg = getRegionData(item.dbKey);
    if (!reg) {
      return "#E2E8F0"; // Slate default
    }

    const rate = reg.return_rate;
    if (rate >= 35.0) return "#2563EB"; // Vibrant Blue for high return
    if (rate >= 30.0) return "#3B82F6"; // Mid Blue
    if (rate >= 25.0) return "#60A5FA"; // Soft Blue
    if (rate >= 20.0) return "#93C5FD"; // Light Blue
    return "#BFDBFE"; // Pastel Blue
  };

  // Get active hovered region data for interactive tooltip
  const hoveredRegionData = effectiveHover
    ? STATE_PATHS.find(
        (p) =>
          p.dbKey.toLowerCase() === effectiveHover.toLowerCase() ||
          p.name.toLowerCase().includes(effectiveHover.toLowerCase())
      )
    : null;

  const hoveredStats = hoveredRegionData ? getRegionData(hoveredRegionData.dbKey) : null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-1 select-none">
      <svg
        viewBox="0 0 430 475"
        className="w-full h-full max-h-64 object-contain filter drop-shadow-sm transition-all duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* State / Regional Boundary Polygons */}
        <g filter="url(#mapShadow)">
          {STATE_PATHS.map((item) => {
            const isHovered = effectiveHover && (
              item.dbKey.toLowerCase() === effectiveHover.toLowerCase() ||
              item.name.toLowerCase().includes(effectiveHover.toLowerCase())
            );
            const isSelected = activeState && (
              item.dbKey.toLowerCase() === activeState.toLowerCase() ||
              item.name.toLowerCase().includes(activeState.toLowerCase())
            );

            return (
              <path
                key={item.id}
                d={item.d}
                fill={getFillColor(item)}
                stroke="#FFFFFF"
                strokeWidth={isHovered || isSelected ? "2.2" : "1.2"}
                strokeLinejoin="round"
                className="cursor-pointer transition-all duration-200 hover:brightness-105"
                onMouseEnter={() => {
                  setInternalHover(item.dbKey);
                  onHoverState?.(item.dbKey);
                }}
                onMouseLeave={() => {
                  setInternalHover(null);
                  onHoverState?.(null);
                }}
                onClick={() => {
                  const newState = isSelected ? null : item.dbKey;
                  onSelectState?.(newState);
                }}
              >
                <title>{`${item.name}${getRegionData(item.dbKey) ? ` — Return Rate: ${getRegionData(item.dbKey)?.return_rate.toFixed(1)}%` : ""}`}</title>
              </path>
            );
          })}
        </g>

        {/* Prominent Capital Dot for Delhi NCR */}
        <circle
          cx="175"
          cy="123"
          r="4.5"
          fill="#EF4444"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          className="pointer-events-none animate-pulse"
        />
        <text
          x="183"
          y="126"
          fontSize="9"
          fill="#1E293B"
          fontWeight="bold"
          className="pointer-events-none select-none font-sans"
        >
          Delhi
        </text>

        {/* Maharashtra Label indicator matching reference image */}
        <circle
          cx="130"
          cy="275"
          r="3"
          fill="#FFFFFF"
          className="pointer-events-none"
        />
      </svg>

      {/* Interactive Tooltip Card on Hover */}
      {hoveredRegionData && (
        <div className="absolute top-2 left-2 z-20 bg-white/95 backdrop-blur-xs border border-[#DFE6EF] shadow-md rounded-lg p-2.5 text-xs pointer-events-none transition-all duration-200 min-w-[150px]">
          <div className="font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-1 mb-1.5 flex items-center justify-between">
            <span>{hoveredRegionData.name}</span>
            <span className="w-2 h-2 rounded-full bg-[#1E3A8A]"></span>
          </div>
          {hoveredStats ? (
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Return Rate:</span>
                <span className="font-bold text-[#2563EB] font-mono">
                  {hoveredStats.return_rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Orders / Returns:</span>
                <span className="font-medium text-[#1E293B] font-mono">
                  {hoveredStats.total_orders} / {hoveredStats.returned_orders}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Return Impact:</span>
                <span className="font-semibold text-[#8978C6] font-mono">
                  ₹{hoveredStats.financial_impact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-[#94A3B8]">Telemetry data aggregated in national pool</div>
          )}
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="mt-1 flex items-center justify-center space-x-2 text-[9px] text-[#64748B] font-medium">
        <span>Low (&lt;25%)</span>
        <div className="flex items-center space-x-0.5">
          <span className="w-2.5 h-2 rounded-xs bg-[#BFDBFE]"></span>
          <span className="w-2.5 h-2 rounded-xs bg-[#60A5FA]"></span>
          <span className="w-2.5 h-2 rounded-xs bg-[#2563EB]"></span>
          <span className="w-2.5 h-2 rounded-xs bg-[#1E3A8A]"></span>
        </div>
        <span>High (&gt;35%)</span>
      </div>
    </div>
  );
};
