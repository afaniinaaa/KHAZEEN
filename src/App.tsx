import React, { useState, useEffect, useMemo } from "react";
import {
  BasketItem,
  Language,
  MakanakService,
  ServiceCategoryId,
  TrackedOrder,
  WorkspaceView,
} from "./types";
import { UI_COPY } from "./lib/i18n";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import CatalogWorkspace from "./components/CatalogWorkspace";
import RequirementsPlanner from "./components/RequirementsPlanner";
import OrdersTrackerView from "./components/OrdersTrackerView";
import BasketDrawer from "./components/BasketDrawer";
import { Search } from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<Language>("ar");
  const [activeView, setActiveView] = useState<WorkspaceView>("catalog");
  const [services, setServices] = useState<MakanakService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [basketOpen, setBasketOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState<string | undefined>(
    undefined
  );

  const t = UI_COPY[language];
  const isRtl = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [language, isRtl]);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (data.success && Array.isArray(data.services)) {
          setServices(data.services);
        } else {
          setLoadError("Failed to load services.");
        }
      } catch {
        setLoadError("Unable to connect to Makanak server.");
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const serviceCounts = useMemo(() => {
    const counts: Record<ServiceCategoryId, number> = {
      all: services.length,
      government: 0,
      "vehicles-finance": 0,
      "education-career": 0,
      "digital-personal": 0,
    };
    for (const s of services) {
      counts[s.category] = (counts[s.category] || 0) + 1;
    }
    return counts;
  }, [services]);

  const handleAddToBasket = (
    service: MakanakService,
    selectedOptionLabel: string | undefined,
    unitPriceSar: number,
    notes: string,
    openDrawer: boolean
  ) => {
    setBasket((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.service.id === service.id &&
          item.selectedOptionLabel === selectedOptionLabel &&
          (item.notes || "") === notes.trim()
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          service,
          quantity: 1,
          selectedOptionLabel,
          unitPriceSar,
          notes: notes.trim() || undefined,
        },
      ];
    });
    if (openDrawer) setBasketOpen(true);
  };

  const handleAddBundleToBasket = (bundle: MakanakService[]) => {
    bundle.forEach((svc) => {
      const defaultOpt = svc.options?.[0];
      const optLabel = defaultOpt
        ? isRtl
          ? defaultOpt.labelAr
          : defaultOpt.labelEn
        : undefined;
      handleAddToBasket(
        svc,
        optLabel,
        svc.priceSar + (defaultOpt?.priceDelta || 0),
        "",
        false
      );
    });
    setBasketOpen(true);
  };

  const handleUpdateQuantity = (index: number, nextQty: number) => {
    setBasket((prev) =>
      nextQty <= 0
        ? prev.filter((_, i) => i !== index)
        : prev.map((item, i) =>
            i === index ? { ...item, quantity: nextQty } : item
          )
    );
  };

  const handleRemoveItem = (index: number) => {
    setBasket((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOrderCreated = (_order: TrackedOrder) => {
    setBasket([]);
  };

  const handleJumpToTrack = (orderId: string) => {
    setBasketOpen(false);
    setTrackOrderId(orderId);
    setActiveView("tracker");
  };

  const basketCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  const viewTitle =
    activeView === "catalog"
      ? t.navCatalog
      : activeView === "planner"
        ? t.navPlanner
        : t.navTracker;

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen flex bg-slate-50 text-slate-900 font-sans"
    >
      {/* Left/Right Desktop Workspace Sidebar */}
      <WorkspaceSidebar
        language={language}
        onLanguageChange={setLanguage}
        activeView={activeView}
        onViewChange={setActiveView}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        serviceCounts={serviceCounts}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="font-bold text-slate-900 lg:hidden whitespace-nowrap">
              {t.brandName}
            </span>
            <span className="text-slate-400 lg:hidden">/</span>
            <span className="hidden lg:inline text-slate-500 whitespace-nowrap">
              {t.breadcrumbPrefix}
            </span>
            <span className="hidden lg:inline text-slate-300">/</span>
            <span className="font-semibold text-slate-900 truncate">
              {viewTitle}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeView === "catalog" && (
              <div className="relative hidden sm:block w-64 md:w-72">
                <Search
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${
                    isRtl ? "right-3" : "left-3"
                  }`}
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={`h-9 w-full rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0F4C5C] focus:bg-white focus:outline-hidden ${
                    isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                  }`}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setBasketOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0F4C5C] hover:bg-[#0B3B47] px-3.5 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{t.basketCta}</span>
              <span className="font-mono text-xs tabular-nums text-slate-200">
                ({basketCount})
              </span>
            </button>
          </div>
        </header>

        {/* Mobile Compact Switcher (< lg) */}
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            {(["catalog", "planner", "tracker"] as WorkspaceView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setActiveView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                  activeView === v
                    ? "bg-[#0F4C5C] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {v === "catalog"
                  ? t.navCatalog
                  : v === "planner"
                    ? t.navPlanner
                    : t.navTracker}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {language === "ar" ? "EN" : "عربي"}
          </button>
        </div>

        {/* Workspace Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="py-20 text-center text-sm text-slate-500">
              {language === "ar"
                ? "جاري تحميل الخدمات..."
                : "Loading services..."}
            </div>
          ) : loadError ? (
            <div className="py-16 text-center text-sm font-semibold text-red-700">
              {loadError}
            </div>
          ) : (
            <>
              {activeView === "catalog" && (
                <CatalogWorkspace
                  services={services}
                  language={language}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery("")}
                  onAddToBasket={handleAddToBasket}
                />
              )}

              {activeView === "planner" && (
                <RequirementsPlanner
                  services={services}
                  language={language}
                  onAddBundleToBasket={handleAddBundleToBasket}
                />
              )}

              {activeView === "tracker" && (
                <OrdersTrackerView
                  language={language}
                  initialLookupId={trackOrderId}
                />
              )}
            </>
          )}
        </main>
      </div>

      <BasketDrawer
        isOpen={basketOpen}
        language={language}
        items={basket}
        onClose={() => setBasketOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderCreated={handleOrderCreated}
        onJumpToTrack={handleJumpToTrack}
      />
    </div>
  );
}
