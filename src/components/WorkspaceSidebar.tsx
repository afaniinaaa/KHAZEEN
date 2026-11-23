import React from "react";
import { Language, ServiceCategoryId, WorkspaceView } from "../types";
import { CATEGORY_LABELS, UI_COPY } from "../lib/i18n";
import { LayoutGrid, ListChecks, ClipboardList } from "lucide-react";

interface WorkspaceSidebarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  selectedCategory: ServiceCategoryId;
  onSelectCategory: (cat: ServiceCategoryId) => void;
  serviceCounts: Record<ServiceCategoryId, number>;
}

const CATEGORIES: ServiceCategoryId[] = [
  "all",
  "government",
  "vehicles-finance",
  "education-career",
  "digital-personal",
];

export default function WorkspaceSidebar({
  language,
  onLanguageChange,
  activeView,
  onViewChange,
  selectedCategory,
  onSelectCategory,
  serviceCounts,
}: WorkspaceSidebarProps) {
  const t = UI_COPY[language];

  const navItems: { id: WorkspaceView; label: string; icon: React.ReactNode }[] = [
    {
      id: "catalog",
      label: t.navCatalog,
      icon: <LayoutGrid className="h-4 w-4 shrink-0" />,
    },
    {
      id: "planner",
      label: t.navPlanner,
      icon: <ListChecks className="h-4 w-4 shrink-0" />,
    },
    {
      id: "tracker",
      label: t.navTracker,
      icon: <ClipboardList className="h-4 w-4 shrink-0" />,
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-e border-slate-200 bg-white">
      <div className="p-5 space-y-7">
        {/* Brand Wordmark */}
        <div className="pb-4 border-b border-slate-100">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {t.brandName}
          </span>
        </div>

        {/* Workspace Navigation */}
        <nav className="space-y-1" aria-label="Workspace">
          {navItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-[#0F4C5C] text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Category Quick Filters */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400">
            {t.categoriesHeading}
          </div>
          <div className="space-y-0.5">
            {CATEGORIES.map((cat) => {
              const active = activeView === "catalog" && selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat);
                    if (activeView !== "catalog") onViewChange("catalog");
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{CATEGORY_LABELS[cat][language]}</span>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0">
                    {serviceCounts[cat] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Language Toggle */}
      <div className="p-4 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onLanguageChange("ar")}
            className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              language === "ar"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            العربية
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              language === "en"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            English
          </button>
        </div>
      </div>
    </aside>
  );
}
