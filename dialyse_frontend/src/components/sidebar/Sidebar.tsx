"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Activity,
  Calendar,
  BarChart3,
  Archive,
  Menu,
  X,
  Hospital,
} from "lucide-react";
import SidebarItem from "@/src/components/sidebar-item/SidebarItem";

const menus = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Demandes d'avis", href: "/demandes-avis", icon: FileText },
  { label: "Dialyses à effectuer", href: "/dialyses", icon: Activity },
  { label: "Rendez-vous", href: "/rendez-vous", icon: Calendar },
  { label: "Rapports", href: "/rapports", icon: BarChart3 },
  { label: "Archive", href: "/archive", icon: Archive },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hospital className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">CHU</h1>
              <p className="text-sm text-gray-600">ANDRAINJATO</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menus.map((menu) => (
            <div key={menu.href} onClick={handleLinkClick}>
              <SidebarItem
                icon={menu.icon}
                label={menu.label}
                href={menu.href}
                isActive={pathname === menu.href}
              />
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
