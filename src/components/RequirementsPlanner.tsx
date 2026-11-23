import React, { useState } from "react";
import { Language, MakanakService } from "../types";
import { UI_COPY, formatSar } from "../lib/i18n";
import ServiceIcon from "./ServiceIcon";
import { Check } from "lucide-react";

interface RequirementsPlannerProps {
  services: MakanakService[];
  language: Language;
  onAddBundleToBasket: (selectedServices: MakanakService[]) => void;
}

export default function RequirementsPlanner({
  services,
  language,
  onAddBundleToBasket,
}: RequirementsPlannerProps) {
  const t = UI_COPY[language];
  const isRtl = language === "ar";
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "absher",
    "citizen-account",
  ]);

  const toggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedServices = services.filter((s) => selectedIds.includes(s.id));
  const totalFee = selectedServices.reduce((sum, s) => sum + s.priceSar, 0);

  const uniqueRequirements = Array.from(
    new Set(
      selectedServices.flatMap((s) =>
        isRtl ? s.requirementsAr : s.requirementsEn
      )
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t.plannerTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t.plannerSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Selectable Services List */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((svc) => {
            const checked = selectedIds.includes(svc.id);
            const title = isRtl ? svc.nameAr : svc.nameEn;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => toggleService(svc.id)}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors cursor-pointer ${
                  checked
                    ? "border-[#0F4C5C] bg-white ring-1 ring-[#0F4C5C]/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ServiceIcon
                    iconKey={svc.iconKey}
                    accentHex={svc.accentHex}
                    size="sm"
                  />
                  <div className={`min-w-0 ${isRtl ? "text-right" : "text-left"}`}>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {title}
                    </div>
                    <div className="font-mono text-xs text-slate-500 tabular-nums mt-0.5">
                      {formatSar(svc.priceSar, language)}
                    </div>
                  </div>
                </div>

                <div
                  className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${
                    checked
                      ? "border-[#0F4C5C] bg-[#0F4C5C] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {checked && <Check className="h-3.5 w-3.5" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Aggregated Checklist & Cost Summary */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 sticky top-20 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-900">
              {t.plannerSelectedCount}
            </span>
            <span className="font-mono text-sm font-bold text-[#0F4C5C] tabular-nums">
              {selectedServices.length}
            </span>
          </div>

          {selectedServices.length > 0 ? (
            <>
              <div>
                <h2 className="text-xs font-semibold text-slate-900 mb-3">
                  {t.plannerUnifiedReqs}
                </h2>
                <ul className="space-y-2 max-h-72 overflow-y-auto">
                  {uniqueRequirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs sm:text-sm text-slate-700"
                    >
                      <Check className="h-4 w-4 text-[#0F4C5C] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {t.plannerTotalFee}
                  </span>
                  <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {formatSar(totalFee, language)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onAddBundleToBasket(selectedServices)}
                  className="w-full h-11 rounded-lg bg-[#0F4C5C] hover:bg-[#0B3B47] text-sm font-semibold text-white transition-colors cursor-pointer"
                >
                  {t.plannerAddBundle}
                </button>
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-xs sm:text-sm text-slate-500">
              {t.plannerEmptyHint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
