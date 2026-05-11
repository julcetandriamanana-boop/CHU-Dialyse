"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "danger" | "warning" | "success";
  trend?: { value: number; label: string };
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
}: StatsCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-[#bb1b21] text-white shadow-lg shadow-red-500/25";
      case "warning":
        return "bg-amber-50 text-amber-700";
      case "success":
        return "bg-emerald-50 text-emerald-700";
      default:
        return "bg-white text-[#00478d] border border-[#727783]/15";
    }
  };

  const getTitleClasses = () => {
    return variant === "danger"
      ? "text-white/80"
      : "text-[#51606e]";
  };

  const getSubtitleClasses = () => {
    return variant === "danger"
      ? "text-white/60"
      : "text-[#727783]";
  };

  const getTrendClasses = () => {
    if (!trend) return "";
    const isPositive = trend.value > 0;
    return isPositive
      ? "bg-emerald-100 text-emerald-700"
      : "bg-red-100 text-red-700";
  };

  return (
    <div className={`p-5 rounded-xl flex flex-col gap-1 shadow-sm ${getVariantClasses()}`}>
      <div className="flex items-start justify-between">
        <h3 className={`text-xs uppercase tracking-widest ${getTitleClasses()}`}>
          {title}
        </h3>
        {Icon && (
          <Icon className="text-3xl opacity-60" />
        )}
      </div>

      <div className="text-3xl font-black">
        {value}
      </div>

      {trend && (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendClasses()}`}>
          {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
        </div>
      )}

      {subtitle && (
        <p className={`text-[11px] ${getSubtitleClasses()}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}