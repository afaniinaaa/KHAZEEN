import React, { useState, useEffect } from "react";
import { BasketItem, Language, TrackedOrder } from "../types";
import { CITIES_LIST, UI_COPY, formatSar } from "../lib/i18n";
import ServiceIcon from "./ServiceIcon";
import { X, Minus, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface BasketDrawerProps {
  isOpen: boolean;
  language: Language;
  items: BasketItem[];
  onClose: () => void;
  onUpdateQuantity: (index: number, nextQty: number) => void;
  onRemoveItem: (index: number) => void;
  onOrderCreated: (order: TrackedOrder) => void;
  onJumpToTrack: (orderId: string) => void;
}

export default function BasketDrawer({
  isOpen,
  language,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOrderCreated,
  onJumpToTrack,
}: BasketDrawerProps) {
  const t = UI_COPY[language];
  const isRtl = language === "ar";
  const cities = CITIES_LIST[language];

  const [step, setStep] = useState<"basket" | "form" | "confirmed">("basket");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState(cities[0]);
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "phone">("whatsapp");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<TrackedOrder | null>(null);

  useEffect(() => {
    setCity(CITIES_LIST[language][0]);
  }, [language]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotalSar = items.reduce(
    (sum, item) => sum + item.unitPriceSar * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError(
        isRtl ? "يرجى كتابة الاسم الكامل" : "Please enter your full name."
      );
      return;
    }

    const cleanMobile = mobile.replace(/\s+/g, "");
    if (!/^(05\d{8}|\+?9665\d{8}|\d{9,14})$/.test(cleanMobile)) {
      setFormError(
        isRtl
          ? "يرجى إدخال رقم جوال صحيح"
          : "Please enter a valid mobile number."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          mobile: cleanMobile,
          city,
          contactMethod,
          notes: notes.trim() || undefined,
          items: items.map((item) => ({
            serviceId: item.service.id,
            serviceNameAr: item.service.nameAr,
            serviceNameEn: item.service.nameEn,
            quantity: item.quantity,
            unitPriceSar: item.unitPriceSar,
            selectedOptionLabel: item.selectedOptionLabel,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(
          data.error ||
            (isRtl ? "تعذر إرسال الطلب حالياً" : "Failed to submit request.")
        );
      } else {
        setConfirmedOrder(data.order);
        setStep("confirmed");
        onOrderCreated(data.order);
      }
    } catch {
      setFormError(
        isRtl ? "تعذر الاتصال بالخادم" : "Network error while submitting order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-slate-950/50 ${
        isRtl ? "justify-start" : "justify-end"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t.basketTitle}
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl border-slate-200 border-s">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 h-16 bg-slate-50">
          <h2 className="text-base font-bold text-slate-900">{t.basketTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "basket" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const title = isRtl ? item.service.nameAr : item.service.nameEn;
                  return (
                    <div key={`${item.service.id}-${idx}`} className="py-4 flex items-start gap-3.5">
                      <ServiceIcon
                        iconKey={item.service.iconKey}
                        accentHex={item.service.accentHex}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {title}
                        </h3>
                        {item.selectedOptionLabel && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.selectedOptionLabel}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {item.notes}
                          </p>
                        )}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                            {formatSar(item.unitPriceSar * item.quantity, language)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                                aria-label="Decrease"
                                className="h-8 w-8 flex items-center justify-center text-slate-700 hover:text-slate-950 cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="px-2 font-mono text-xs font-semibold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                                aria-label="Increase"
                                className="h-8 w-8 flex items-center justify-center text-slate-700 hover:text-slate-950 cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(idx)}
                              aria-label="Remove"
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <h3 className="text-base font-bold text-slate-900">
                    {t.basketEmptyTitle}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
                    {t.basketEmptyDesc}
                  </p>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-200 p-6 bg-slate-50 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.basketNoteGov}
                </p>
                <div className="flex items-center justify-between text-base font-bold text-slate-900">
                  <span>{t.basketSubtotal}</span>
                  <span className="font-mono tabular-nums">{formatSar(subtotalSar, language)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full h-11 rounded-lg bg-[#0F4C5C] hover:bg-[#0B3B47] text-sm font-semibold text-white transition-colors cursor-pointer"
                >
                  {t.basketProceed}
                </button>
              </div>
            )}
          </>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto p-6">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {t.checkoutTitle}
              </h3>

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.checkoutName}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.checkoutNamePh}
                  className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-[#0F4C5C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.checkoutMobile}
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={t.checkoutMobilePh}
                  className="h-11 w-full rounded-lg border border-slate-300 px-3.5 font-mono text-sm text-slate-900 focus:border-[#0F4C5C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.checkoutCity}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-[#0F4C5C] focus:outline-hidden"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.checkoutContactPref}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setContactMethod("whatsapp")}
                    className={`h-10 rounded-lg border text-xs font-semibold cursor-pointer ${
                      contactMethod === "whatsapp"
                        ? "border-[#0F4C5C] bg-[#0F4C5C]/5 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {t.contactWhatsapp}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod("phone")}
                    className={`h-10 rounded-lg border text-xs font-semibold cursor-pointer ${
                      contactMethod === "phone"
                        ? "border-[#0F4C5C] bg-[#0F4C5C]/5 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {t.contactPhone}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.checkoutNotes}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.checkoutNotesPh}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0F4C5C] focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                <span>{t.basketSubtotal}</span>
                <span className="font-mono tabular-nums">{formatSar(subtotalSar, language)}</span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep("basket")}
                  className="h-11 px-4 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {t.checkoutBack}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 rounded-lg bg-[#0F4C5C] hover:bg-[#0B3B47] disabled:bg-slate-400 text-sm font-semibold text-white cursor-pointer"
                >
                  {submitting ? t.checkoutSubmitting : t.checkoutSubmit}
                </button>
              </div>
            </div>
          </form>
        )}

        {step === "confirmed" && confirmedOrder && (
          <div className="flex-1 flex flex-col justify-between p-6 text-center">
            <div className="my-auto space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {t.orderConfirmedTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {t.orderConfirmedDesc}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <span className="text-xs text-slate-500 block">
                  {t.orderTrackingCode}
                </span>
                <span className="font-mono text-xl font-bold text-[#0F4C5C] tabular-nums">
                  {confirmedOrder.orderId}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const id = confirmedOrder.orderId;
                  setStep("basket");
                  setConfirmedOrder(null);
                  onJumpToTrack(id);
                }}
                className="w-full h-11 rounded-lg bg-[#0F4C5C] hover:bg-[#0B3B47] text-sm font-semibold text-white cursor-pointer"
              >
                {t.orderTrackNowBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("basket");
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="w-full h-11 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 cursor-pointer"
              >
                {t.orderCloseBtn}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
