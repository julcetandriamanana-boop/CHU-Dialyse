"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const menus = [
  { label: "Tableau de bord", href: "/dashboard", icon: "dashboard" },
  { label: "Demandes d'avis", href: "/demandes-avis", icon: "clinical_notes" },
  { label: "Dialyses", href: "/dialyses", icon: "monitor_heart" },
  { label: "Rendez-vous", href: "/rendez-vous", icon: "event" },
  { label: "Rapports", href: "/rapports", icon: "lab_profile" },
  { label: "Archive", href: "/archive", icon: "archive" },
];

const sidebarVariants: Variants = {
  open: { 
    x: 0, 
    transition: { type: "spring" as const, stiffness: 300, damping: 30 } 
  },
  closed: { 
    x: "-100%", 
    transition: { type: "spring" as const, stiffness: 300, damping: 30 } 
  },
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: index * 0.05, duration: 0.3 },
  }),
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarContent = (
    <>
      {/* Logo CHU */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-gray-100"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-white text-2xl">local_hospital</span>
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">CHU</h1>
            <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Andrainjato · Dialyse</p>
          </div>
        </div>
      </motion.div>

      {/* Profil utilisateur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ backgroundColor: '#f8fafc' }}
        className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/30 to-white cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-white"
            >
              <span className="material-symbols-outlined text-white text-2xl">person</span>
            </motion.div>
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">Dr. Andrianjato</p>
            <p className="text-[11px] text-gray-500 truncate font-medium">Néphrologue</p>
            <p className="text-[10px] text-gray-400 truncate">andrianjato@chu.mg</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menus.map((menu, index) => {
          const isActive = pathname === menu.href || pathname.startsWith(menu.href + "/");
          return (
            <motion.a
              key={menu.href}
              href={menu.href}
              onClick={handleLinkClick}
              custom={index}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-500/25"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`material-symbols-outlined relative z-10 text-xl transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"
              }`}>
                {menu.icon}
              </span>
              <span className="relative z-10">{menu.label}</span>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 z-10 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </motion.div>
              )}
            </motion.a>
          );
        })}
      </nav>

      {/* Pied de sidebar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 border-t border-gray-100"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <motion.span 
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-emerald-500 rounded-full" 
          />
          <p className="text-[10px] text-gray-400 font-medium">Système connecté</p>
        </div>
        <p className="text-[9px] text-gray-300 text-center">v2.4.1 · CHU Dialyse</p>
      </motion.div>
    </>
  );

  return (
    <>
      {/* Bouton menu mobile */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
        aria-label="Menu"
      >
        <span className="material-symbols-outlined text-gray-700 text-xl">
          {isOpen ? "close" : "menu"}
        </span>
      </motion.button>

      {/* Version mobile : sidebar fixe en overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed left-0 top-0 h-screen z-40 w-72 flex flex-col bg-white border-r border-gray-100 shadow-2xl"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Version desktop : sidebar fixe toujours visible */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:left-0 lg:top-0 lg:bg-white lg:border-r lg:border-gray-100 lg:z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
