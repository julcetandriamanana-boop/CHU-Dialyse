"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

const variantStyles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
  ghost: "text-gray-600 hover:bg-gray-100",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2.5",
};

export function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  onClick,
  disabled = false,
  className = "",
  type = "button",
  fullWidth = false,
}: AnimatedButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-colors duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {icon && iconPosition === "left" && (
        <motion.span
          className="material-symbols-outlined text-current"
          style={{ fontSize: size === "sm" ? "16px" : "20px" }}
          whileHover={{ rotate: 10 }}
        >
          {icon}
        </motion.span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <motion.span
          className="material-symbols-outlined text-current"
          style={{ fontSize: size === "sm" ? "16px" : "20px" }}
          whileHover={{ rotate: -10 }}
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  );
}
