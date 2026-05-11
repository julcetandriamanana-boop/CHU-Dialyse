import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
}

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  isActive,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 ${
        isActive ? "text-blue-600 bg-blue-100" : "text-gray-700"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`}
      />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
