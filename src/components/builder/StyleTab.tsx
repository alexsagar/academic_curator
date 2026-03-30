"use client";

import type { PortfolioStyles } from "@/lib/portfolio";

interface StyleTabProps {
  data: PortfolioStyles;
  onChange: (data: PortfolioStyles) => void;
}

export default function StyleTab({ data, onChange }: StyleTabProps) {
  const colors = {
    primary: data.primaryColor || "#006591",
    surface: data.surfaceColor || "#f7f9fb",
    text: data.textColor || "#191c1e",
  };

  const handleColorChange = (key: string, color: string) => {
    onChange({ ...data, [`${key}Color`]: color });
  };

  const fonts: PortfolioStyles["fontFamily"][] = [
    "Inter",
    "Manrope",
    "Roboto",
    "Playfair Display",
    "Merriweather",
  ];
  const spacingOptions: Array<{ label: string; value: PortfolioStyles["spacing"] }> = [
    { label: "Compact", value: "compact" },
    { label: "Comfortable", value: "comfortable" },
    { label: "Spacious", value: "spacious" },
  ];

  return (
    <div className="space-y-8">
      {/* Colors */}
      <div>
        <h3 className="text-sm font-headline font-bold mb-4 text-on-surface">Brand Colors</h3>
        <div className="space-y-4">
          {(["primary", "surface", "text"] as const).map((key) => (
            <div key={key} className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 capitalize">
                {key} Color
              </label>
              <div 
                className="flex items-center gap-3 p-2 border border-outline-variant/30 rounded-md bg-surface-container-lowest focus-within:border-primary transition-colors overflow-hidden"
              >
                <input 
                  type="color"
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent" 
                />
                <span className="text-xs font-mono text-on-surface">{colors[key]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="border-t border-outline-variant/20 pt-6">
        <h3 className="text-sm font-headline font-bold mb-4 text-on-surface">Typography</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Font Family</label>
            <select 
              value={data.fontFamily || "Inter"}
              onChange={(e) => onChange({ ...data, fontFamily: e.target.value as PortfolioStyles["fontFamily"] })}
              className="w-full text-sm py-2 px-3 bg-surface-container-lowest border border-outline-variant/30 rounded-md focus:border-primary outline-none appearance-none"
            >
              {fonts.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Base Size</label>
            <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-md px-3 py-2">
              <input 
                type="range" 
                min="12" max="20" 
                value={parseInt(data.fontSize || "16")}
                onChange={(e) => onChange({ ...data, fontSize: `${e.target.value}px` })}
                className="flex-1 accent-primary"
              />
              <span className="text-xs font-mono text-on-surface-variant w-8">{data.fontSize || "16px"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="border-t border-outline-variant/20 pt-6">
        <h3 className="text-sm font-headline font-bold mb-4 text-on-surface">Spacing</h3>
        <div className="flex gap-2">
          {spacingOptions.map((spacing) => (
            <button
              key={spacing.value}
              onClick={() => onChange({ ...data, spacing: spacing.value })}
              className={`flex-1 py-2 rounded border text-xs font-semibold transition-all ${
                (data.spacing || "comfortable") === spacing.value
                  ? "bg-primary/5 text-primary border-primary"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-low"
              }`}
            >
              {spacing.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
