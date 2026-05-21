"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  variant?: "default" | "danger" | "warning" | "success" | "info";
  trend?: { value: number; label: string };
  index?: number;
}

const variantConfig = {
  default: {
    bg: "bg-white",
    text: "text-[#00478d]",
    border: "border border-gray-100",
    shadow: "shadow-sm hover:shadow-md",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    titleColor: "text-[#51606e]",
    subtitleColor: "text-[#727783]",
  },
  danger: {
    bg: "bg-gradient-to-br from-red-500 to-red-600",
    text: "text-white",
    border: "",
    shadow: "shadow-lg shadow-red-500/25",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    titleColor: "text-white/80",
    subtitleColor: "text-white/60",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border border-amber-200",
    shadow: "shadow-sm hover:shadow-md",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    titleColor: "text-amber-800",
    subtitleColor: "text-amber-600",
  },
  success: {
    bg: "bg-gradient-to-br from-emerald-50 to-green-50",
    text: "text-emerald-700",
    border: "border border-emerald-200",
    shadow: "shadow-sm hover:shadow-md",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-800",
    subtitleColor: "text-emerald-600",
  },
  info: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    text: "text-blue-700",
    border: "border border-blue-200",
    shadow: "shadow-sm hover:shadow-md",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
    subtitleColor: "text-blue-600",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  trend,
  index = 0,
}: StatsCardProps) {
  const config = variantConfig[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${config.bg} ${config.border} ${config.shadow} p-5 rounded-2xl flex flex-col gap-2 transition-shadow duration-300 cursor-pointer relative overflow-hidden`}
    >
      {/* Effet de brillance au survol */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />

      <div className="flex items-start justify-between relative z-10">
        <h3 className={`text-xs uppercase tracking-widest font-semibold ${config.titleColor}`}>
          {title}
        </h3>
        {icon && (
          <motion.span
            whileHover={{ rotate: 10, scale: 1.1 }}
            className={`material-symbols-outlined text-2xl ${config.iconColor} opacity-80`}
          >
            {icon}
          </motion.span>
        )}
      </div>

      <motion.div
        className={`text-3xl font-black ${config.text} relative z-10`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: index * 0.1 + 0.2,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        {value}
      </motion.div>

      {trend && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            trend.value > 0
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          } relative z-10`}
        >
          <span className="material-symbols-outlined text-sm">
            {trend.value > 0 ? "trending_up" : "trending_down"}
          </span>
          {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
        </motion.div>
      )}

      {subtitle && (
        <p className={`text-[11px] font-medium ${config.subtitleColor} relative z-10`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
