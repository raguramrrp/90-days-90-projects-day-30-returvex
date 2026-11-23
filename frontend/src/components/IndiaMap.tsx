import React from "react";

export const IndiaMap: React.FC<{ activeState?: string }> = ({ activeState = "Maharashtra" }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-2">
      <svg
        viewBox="0 0 350 400"
        className="w-full h-full max-h-56 object-contain filter drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified stylistic India Map silhouette with state regions */}
        {/* Northern Kashmir/Ladakh */}
        <path
          d="M130 30 Q145 10 160 25 Q175 40 180 60 Q170 75 150 70 Q135 65 130 30 Z"
          fill="#D6E4FC"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {/* Punjab, Haryana, Delhi NCR, Rajasthan */}
        <path
          d="M110 75 Q140 70 150 90 Q140 110 115 115 Q95 105 100 85 Z"
          fill="#BED7FB"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        <circle cx="140" cy="98" r="4" fill="#2A62F8" /> {/* Delhi NCR spot */}
        <path
          d="M75 110 Q115 105 125 140 Q95 160 70 145 Q65 125 75 110 Z"
          fill="#D6E4FC"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {/* Uttar Pradesh, Bihar, Gangetic Plain */}
        <path
          d="M130 95 Q195 90 215 125 Q180 150 145 140 Q130 120 130 95 Z"
          fill="#BED7FB"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {/* Gujarat */}
        <path
          d="M45 150 Q75 145 80 170 Q70 190 40 185 Q30 165 45 150 Z"
          fill="#D6E4FC"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {/* Madhya Pradesh / Central */}
        <path
          d="M85 160 Q150 145 175 175 Q150 205 105 195 Q85 180 85 160 Z"
          fill="#D6E4FC"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {/* Maharashtra (Active/Dark Highlighted Region matching reference!) */}
        <path
          d="M70 195 Q135 185 145 225 Q115 255 75 235 Q60 215 70 195 Z"
          fill="#1E3A8A"
          stroke="#FFFFFF"
          strokeWidth="1.4"
        >
          <title>Maharashtra (Highest Returns: 12.4%)</title>
        </path>
        {/* Eastern / West Bengal / Odisha */}
        <path
          d="M185 155 Q235 150 240 190 Q205 215 175 195 Q170 170 185 155 Z"
          fill="#BED7FB"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {/* Northeast (Assam corridor) */}
        <path
          d="M245 130 Q285 120 300 140 Q280 165 250 155 Z"
          fill="#D6E4FC"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {/* Karnataka & Telangana & Andhra */}
        <path
          d="M85 240 Q135 230 145 275 Q115 315 90 285 Q80 260 85 240 Z"
          fill="#3B82F6"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {/* Tamil Nadu & Kerala (Southern Tip) */}
        <path
          d="M95 295 Q135 285 130 350 Q110 375 95 340 Q90 315 95 295 Z"
          fill="#60A5FA"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};
