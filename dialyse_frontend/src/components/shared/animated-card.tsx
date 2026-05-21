"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function AnimatedCard({
  children,
  className = "",
  hover = true,
  padding = "md",
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
            }
          : {}
      }
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-gray-100
        shadow-sm transition-shadow duration-300
        ${hover ? "cursor-pointer" : ""}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {hover && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
