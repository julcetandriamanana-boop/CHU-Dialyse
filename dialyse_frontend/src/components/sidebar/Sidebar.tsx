"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useSidebarCounts } from "@/src/hooks/useSidebarCounts";
import MadagascarClock from "@/src/components/shared/MadagascarClock";

const badgeStyles: Record<string, string> = {
  red:    "bg-red-500 text-white",
  amber:  "bg-amber-400 text-amber-900",
  blue:   "bg-blue-400 text-white",
  green:  "bg-emerald-400 text-emerald-900",
  purple: "bg-purple-400 text-white",
  slate:  "bg-slate-400 text-white",
};

const sidebarVariants: Variants = {
  open:   { x: 0,       transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const itemVariants: Variants = {
  initial:  { opacity: 0, x: -16 },
  animate: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.25 },
  }),
};

/* ─── Logo CHU Andrainjato ─────────────────────────────────────────── */
function ChuLogo() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
      <path
        d="M38 8 Q30 18 28 30 Q25 44 28 56 Q31 66 38 70 Q44 74 49 67 Q55 57 54 44 Q56 31 51 19 Q46 8 40 7 Z"
        fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.3" strokeWidth="1"
      />
      <text x="5"  y="54" fontSize="38" fontWeight="900" fill="#1565c0" fontFamily="Arial Black, sans-serif">C</text>
      <text x="24" y="54" fontSize="38" fontWeight="900" fill="#e53935" fontFamily="Arial Black, sans-serif">H</text>
      <text x="48" y="54" fontSize="38" fontWeight="900" fill="#1565c0" fontFamily="Arial Black, sans-serif">U</text>
      <line x1="39" y1="14" x2="43" y2="64" stroke="#ff6f00" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Contenu interne de la sidebar ───────────────────────────────── */
function SidebarContent({ onLinkClick }: { onLinkClick: () => void }) {
  const pathname = usePathname();
  const counts   = useSidebarCounts(30000);
  let itemIndex  = 0;

  // Menus avec badges dynamiques basés sur les vrais compteurs
  const menus = [
    {
      section: "Principal",
      items: [
        { label: "Tableau de bord", href: "/dashboard",     icon: "dashboard",     badge: null,                          badgeType: null    },
        { label: "Notifications",   href: "/notifications", icon: "notifications", badge: counts.notifications || null,  badgeType: counts.notifications > 0 ? "red" : null },
      ],
    },
    {
      section: "Médical",
      items: [
        { label: "Rendez-vous",      href: "/rendez-vous",   icon: "event",           badge: counts.rendezvous || null,   badgeType: counts.rendezvous > 0 ? "blue" : null     },
        { label: "Dialyses",         href: "/dialyses",      icon: "monitor_heart",   badge: counts.dialyses || null,     badgeType: counts.dialyses > 0 ? "amber" : null      },
        { label: "Rapports",         href: "/rapports",      icon: "lab_profile",     badge: counts.rapports || null,     badgeType: counts.rapports > 0 ? "green" : null       },
        { label: "Archive",          href: "/archive",       icon: "archive",         badge: counts.archives || null,     badgeType: counts.archives > 0 ? "slate" : null       },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.06, rotate: -4 }}
          className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg flex-shrink-0 cursor-pointer overflow-hidden"
        >
          <ChuLogo />
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">CHU Andrainjato</p>
          <p className="text-[9px] text-white/45 uppercase tracking-widest mt-0.5">Centre Hospitalier Univ.</p>
        </div>
      </div>

      {/* ── Profil ── */}
      <motion.div
        whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        className="px-4 py-3 border-b border-white/10 flex items-center gap-3 cursor-pointer transition-colors"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs font-semibold text-white shadow-md">
            JA
          </div>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#00509e]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">Dr. Andrianjato</p>
          <p className="text-[10px] text-white/50 truncate">Néphrologue</p>
        </div>
        <span className="material-symbols-outlined text-white/30 text-base">more_vert</span>
      </motion.div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar space-y-4">
        {menus.map((group) => (
          <div key={group.section}>
            <p className="text-[9px] font-semibold text-white/35 uppercase tracking-widest px-3 pb-1">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((menu) => {
                const currentIndex = itemIndex++;
                const isActive = pathname === menu.href || pathname.startsWith(menu.href + "/");
                return (
                  <motion.a
                    key={menu.href}
                    href={menu.href}
                    onClick={onLinkClick}
                    custom={currentIndex}
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-white/18 text-white border border-white/20 shadow-sm"
                        : "text-white/65 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 rounded-xl bg-white/18 border border-white/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={`material-symbols-outlined relative z-10 text-[18px] transition-transform duration-150 group-hover:scale-110 ${
                      isActive ? "text-white" : "text-white/45 group-hover:text-white/80"
                    }`}>
                      {menu.icon}
                    </span>
                    <span className="relative z-10 flex-1">{menu.label}</span>
                    {menu.badge !== null && menu.badge > 0 && menu.badgeType && (
                      <motion.span
                        key={`badge-${menu.label}-${menu.badge}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className={`relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${badgeStyles[menu.badgeType]}`}
                      >
                        {menu.badge > 99 ? '99+' : menu.badge}
                      </motion.span>
                    )}
                  </motion.a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-white/10 space-y-2">
        {/* Horloge Madagascar temps réel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-white/40 text-sm">schedule</span>
            <span className="text-[9px] text-white/40 font-semibold uppercase">Madagascar</span>
          </div>
          <MadagascarClock
            showSeconds={true}
            className="text-[11px] text-white/60 font-black tabular-nums"
          />
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0"
          />
          <p className="text-[9px] text-white/40 font-medium">Système connecté</p>
          <p className="text-[9px] text-white/25 ml-auto">v2.6.0</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Composant principal ──────────────────────────────────────────── */
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLinkClick = () => { if (isMobile) setIsOpen(false); };

  return (
    <>
      {/* Bouton mobile */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#00509e] rounded-xl shadow-lg border border-white/20"
        aria-label="Menu"
      >
        <span className="material-symbols-outlined text-white text-xl">
          {isOpen ? "close" : "menu"}
        </span>
      </motion.button>

      {/* Overlay mobile */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              variants={sidebarVariants}
              initial="closed" animate="open" exit="closed"
              className="fixed left-0 top-0 h-screen z-40 w-64 lg:hidden"
              style={{ background: "linear-gradient(180deg, #003d7a 0%, #00509e 45%, #0066cc 100%)" }}
            >
              <SidebarContent onLinkClick={handleLinkClick} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:left-0 lg:top-0 lg:z-30"
        style={{ background: "linear-gradient(180deg, #003d7a 0%, #00509e 45%, #0066cc 100%)" }}
      >
        <SidebarContent onLinkClick={handleLinkClick} />
      </aside>
    </>
  );
}
