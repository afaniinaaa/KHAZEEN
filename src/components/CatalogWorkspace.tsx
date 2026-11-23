import React, { useState, useEffect } from "react";
import { Language, MakanakService, ServiceCategoryId } from "../types";
import { CATEGORY_LABELS, UI_COPY, formatSar } from "../lib/i18n";
import ServiceIcon from "./ServiceIcon";
import { Check, Plus, X } from "lucide-react";

interface CatalogWorkspaceProps {
  services: MakanakService[];
  language: Language;
  selectedCategory: ServiceCategoryId;
  onSelectCategory: (cat: ServiceCategoryId) => void;
  searchQuery: string;
  onClearSearch: () => void;
  onAddToBasket: (
    service: MakanakService,
    selectedOptionLabel: string | undefined,
    unitPriceSar: number,
    notes: string,
    openDrawer: boolean
  ) => void;
}

const CATEGORIES: ServiceCategoryId[] = [
  "all",
  "government",
  "vehicles-finance",
  "education-career",
  "digital-personal",
];

export default function CatalogWorkspace({
  services,
  language,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  onAddToBasket,
}: CatalogWorkspaceProps) {
  const t = UI_COPY[language];
  const isRtl = language === "ar";

  const [inspectedId, setInspectedId] = useState<string>(services[0]?.id || "");
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [checkedReqs, setCheckedReqs] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState("");

  const q = searchQuery.trim().toLowerCase();
  const filteredServices = services.filter((svc) => {
    const catMatch = selectedCategory === "all" || svc.category === selectedCategory;
    if (!catMatch) return false;
    if (!q) return true;
    return (
      svc.nameAr.toLowerCase().includes(q) ||
      svc.nameEn.toLowerCase().includes(q) ||
      svc.summaryAr.toLowerCase().includes(q) ||
      svc.summaryEn.toLowerCase().includes(q)
    );
  });

  const inspectedService =
    services.find((s) => s.id === inspectedId) || filteredServices[0] || services[0] || null;

  useEffect(() => {
    if (!inspectedService && filteredServices[0]) {
      setInspectedId(filteredServices[0].id);
    }
  }, [filteredServices, inspectedService]);

  useEffect(() => {
    if (inspectedService?.options && inspectedService.options.length > 0) {
      setSelectedOptionId(inspectedService.options[0].id);
    } else {
      setSelectedOptionId("");
    }
    setCheckedReqs({});
    setNotes("");
  }, [inspectedService?.id]);

  const activeOption = inspectedService?.options?.find((o) => o.id === selectedOptionId);
  const unitPriceSar = inspectedService
    ? inspectedService.priceSar + (activeOption?.priceDelta || 0)
    : 0;
  const selectedOptionLabel = activeOption
    ? isRtl
      ? activeOption.labelAr
      : activeOption.labelEn
    : undefined;

  const handleCardSelect = (svc: MakanakService) => {
    setInspectedId(svc.id);
    if (window.innerWidth < 1280) {
      setMobileInspectorOpen(true);
    }
  };

  const renderInspectorContent = (svc: MakanakService) => {
    const title = isRtl ? svc.nameAr : svc.nameEn;
    const summary = isRtl ? svc.summaryAr : svc.summaryEn;
    const turnaround = isRtl ? svc.turnaroundAr : svc.turnaroundEn;
    const reqs = isRtl ? svc.requirementsAr : svc.requirementsEn;
    const steps = isRtl ? svc.stepsAr : svc.stepsEn;
    const catLabel = CATEGORY_LABELS[svc.category][language];

    return (
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
            <ServiceIcon iconKey={svc.iconKey} accentHex={svc.accentHex} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span>{catLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{turnaround}</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900 leading-snug">
                {title}
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>

          {/* Option Selector */}
          {svc.options && svc.options.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-900 mb-2">
                {t.modalSelectOption}
              </div>
              <div className="space-y-1.5">
                {svc.options.map((opt) => {
                  const selected = opt.id === selectedOptionId;
                  const label = isRtl ? opt.labelAr : opt.labelEn;
                  const price = svc.priceSar + opt.priceDelta;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`w-full flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? "border-[#0F4C5C] bg-[#0F4C5C]/5 text-slate-900 font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className={isRtl ? "text-right" : "text-left"}>{label}</span>
                      <span className="font-mono font-semibold tabular-nums shrink-0">
                        {formatSar(price, language)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Document Readiness Checklist */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-900 mb-1">
              {t.modalRequirements}
            </div>
            <p className="text-xs text-slate-500 mb-2.5">{t.inspectorChecklistTip}</p>
            <div className="space-y-2">
              {reqs.map((req, idx) => {
                const checked = !!checkedReqs[idx];
                return (
                  <label
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setCheckedReqs((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F4C5C] focus:ring-[#0F4C5C]"
                    />
                    <span className={checked ? "line-through text-slate-400" : ""}>
                      {req}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3-Step Execution */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-900 mb-2.5">
              {t.modalSteps}
            </div>
            <ol className="space-y-2">
              {steps.map((st, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <span className="font-mono text-[11px] font-semibold text-[#0F4C5C] tabular-nums mt-0.5">
                    0{idx + 1}
                  </span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Notes */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-900 mb-1.5">
              {t.modalNotesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.modalNotesPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F4C5C] focus:bg-white focus:outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Sticky Inspector Action Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[11px] text-slate-500">{t.basketSubtotal}</span>
            <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
              {formatSar(unitPriceSar, language)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onAddToBasket(svc, selectedOptionLabel, unitPriceSar, notes, false);
                setMobileInspectorOpen(false);
              }}
              className="h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3.5 text-xs font-semibold text-slate-800 cursor-pointer whitespace-nowrap"
            >
              {t.modalAddBasket}
            </button>
            <button
              type="button"
              onClick={() => {
                onAddToBasket(svc, selectedOptionLabel, unitPriceSar, notes, true);
                setMobileInspectorOpen(false);
              }}
              className="h-10 rounded-lg bg-[#0F4C5C] hover:bg-[#0B3B47] px-4 text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
            >
              {t.modalOrderNow}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mobile/Tablet Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1 lg:hidden">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600"
              }`}
            >
              {CATEGORY_LABELS[cat][language]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{CATEGORY_LABELS[selectedCategory][language]}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {filteredServices.length} {t.servicesCountSuffix}
          </span>
        </div>
      </div>

      {/* Master-Detail Split Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left/Main Grid of 16 Services */}
        <div className="xl:col-span-7">
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredServices.map((svc) => {
                const isSelected = inspectedService?.id === svc.id;
                const title = isRtl ? svc.nameAr : svc.nameEn;
                const summary = isRtl ? svc.summaryAr : svc.summaryEn;
                const turnaround = isRtl ? svc.turnaroundAr : svc.turnaroundEn;
                const catLabel = CATEGORY_LABELS[svc.category][language];

                return (
                  <article
                    key={svc.id}
                    onClick={() => handleCardSelect(svc)}
                    className={`rounded-xl border p-4 transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#0F4C5C] bg-white ring-1 ring-[#0F4C5C]/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <ServiceIcon
                          iconKey={svc.iconKey}
                          accentHex={svc.accentHex}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] text-slate-500 truncate">
                            {catLabel} · {turnaround}
                          </div>
                          <h3 className="mt-1 text-sm font-bold text-slate-900 leading-snug">
                            {title}
                          </h3>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {formatSar(svc.priceSar, language)}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const defaultOpt = svc.options?.[0];
                          const optLabel = defaultOpt
                            ? isRtl
                              ? defaultOpt.labelAr
                              : defaultOpt.labelEn
                            : undefined;
                          onAddToBasket(
                            svc,
                            optLabel,
                            svc.priceSar + (defaultOpt?.priceDelta || 0),
                            "",
                            true
                          );
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded-md bg-slate-100 hover:bg-[#0F4C5C] px-2.5 text-xs font-semibold text-slate-800 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{t.modalAddBasket}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <h3 className="text-sm font-bold text-slate-900">{t.noResultsTitle}</h3>
              <p className="mt-1.5 text-xs text-slate-500">{t.noResultsDesc}</p>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory("all");
                  onClearSearch();
                }}
                className="mt-4 h-9 rounded-lg bg-[#0F4C5C] px-4 text-xs font-semibold text-white cursor-pointer"
              >
                {t.resetFilters}
              </button>
            </div>
          )}
        </div>

        {/* Right Sticky Inspector Pane (Desktop >= xl) */}
        <div className="hidden xl:block xl:col-span-5 sticky top-20 rounded-xl border border-slate-200 bg-white p-6">
          {inspectedService ? (
            renderInspectorContent(inspectedService)
          ) : (
            <div className="py-16 text-center">
              <Check className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">
                {t.inspectorEmptyTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {t.inspectorEmptyDesc}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Inspector Sheet for < xl screens */}
      {mobileInspectorOpen && inspectedService && (
        <div
          className="fixed inset-0 z-50 xl:hidden flex items-center justify-center bg-slate-950/50 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setMobileInspectorOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[88vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setMobileInspectorOpen(false)}
              aria-label="Close"
              className={`absolute top-4 ${
                isRtl ? "left-4" : "right-4"
              } h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer`}
            >
              <X className="h-4 w-4" />
            </button>
            {renderInspectorContent(inspectedService)}
          </div>
        </div>
      )}
    </div>
  );
}
