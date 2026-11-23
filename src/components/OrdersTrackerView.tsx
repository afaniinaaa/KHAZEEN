import React, { useState, useEffect } from "react";
import { Language, TrackedOrder } from "../types";
import { UI_COPY, formatSar } from "../lib/i18n";
import { Search, CheckCircle2, Clock, FileText } from "lucide-react";

interface OrdersTrackerViewProps {
  language: Language;
  initialLookupId?: string;
}

export default function OrdersTrackerView({
  language,
  initialLookupId,
}: OrdersTrackerViewProps) {
  const t = UI_COPY[language];
  const isRtl = language === "ar";

  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [lookupInput, setLookupInput] = useState(initialLookupId || "MKN-104820");
  const [focusedOrder, setFocusedOrder] = useState<TrackedOrder | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const loadOrdersList = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch {
      // Keep current list on transient error
    } finally {
      setLoadingOrders(false);
    }
  };

  const lookupOrder = async (orderId: string) => {
    const clean = orderId.trim().toUpperCase();
    if (!clean) return;
    setLookupError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFocusedOrder(null);
        setLookupError(data.error || "Order not found");
      } else {
        setFocusedOrder(data.order);
      }
    } catch {
      setLookupError("Unable to reach tracking service.");
    }
  };

  useEffect(() => {
    loadOrdersList();
  }, []);

  useEffect(() => {
    const id = initialLookupId || "MKN-104820";
    setLookupInput(id);
    lookupOrder(id);
  }, [initialLookupId]);

  const statusDisplay = (status: TrackedOrder["status"]) => {
    switch (status) {
      case "completed":
        return {
          label: t.statusCompleted,
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />,
          cls: "text-emerald-800",
        };
      case "in_progress":
        return {
          label: t.statusInProgress,
          icon: <Clock className="h-4 w-4 text-amber-700 shrink-0" />,
          cls: "text-amber-800",
        };
      default:
        return {
          label: t.statusReceived,
          icon: <FileText className="h-4 w-4 text-slate-700 shrink-0" />,
          cls: "text-slate-800",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t.trackerTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t.trackerSubtitle}</p>
      </div>

      {/* Order Lookup Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookupOrder(lookupInput);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={lookupInput}
            onChange={(e) => setLookupInput(e.target.value)}
            placeholder={t.trackPlaceholder}
            className="h-11 flex-1 rounded-lg border border-slate-300 px-4 font-mono text-sm text-slate-900 focus:border-[#0F4C5C] focus:outline-hidden"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0F4C5C] hover:bg-[#0B3B47] px-5 text-sm font-semibold text-white cursor-pointer whitespace-nowrap"
          >
            <Search className="h-4 w-4" />
            <span>{t.trackButton}</span>
          </button>
        </form>

        {lookupError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {lookupError}
          </div>
        )}

        {focusedOrder && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {focusedOrder.orderId}
                </span>
                <span className="text-xs text-slate-500">
                  {focusedOrder.customerName} · {focusedOrder.city}
                </span>
              </div>

              {(() => {
                const st = statusDisplay(focusedOrder.status);
                return (
                  <div className={`inline-flex items-center gap-1.5 text-sm font-semibold ${st.cls}`}>
                    {st.icon}
                    <span>{st.label}</span>
                  </div>
                );
              })()}
            </div>

            <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
              {focusedOrder.items.map((item, idx) => (
                <div
                  key={`${item.serviceId}-${idx}`}
                  className="py-2.5 flex items-center justify-between gap-4 text-sm"
                >
                  <div>
                    <span className="font-medium text-slate-900">
                      {isRtl ? item.serviceNameAr : item.serviceNameEn}
                    </span>
                    {item.selectedOptionLabel && (
                      <span className="block text-xs text-slate-500">
                        {item.selectedOptionLabel}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-semibold text-slate-900 tabular-nums">
                    {item.quantity} × {formatSar(item.unitPriceSar, language)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-slate-900">
              <span>{t.basketSubtotal}</span>
              <span className="font-mono tabular-nums">
                {formatSar(focusedOrder.totalSar, language)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* High-Density Orders Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className={`px-4 py-3 ${isRtl ? "text-right" : "text-left"}`}>
                  {t.tableOrderId}
                </th>
                <th className={`px-4 py-3 ${isRtl ? "text-right" : "text-left"}`}>
                  {t.tableCustomer}
                </th>
                <th className={`px-4 py-3 ${isRtl ? "text-right" : "text-left"}`}>
                  {t.tableServices}
                </th>
                <th className={`px-4 py-3 ${isRtl ? "text-right" : "text-left"}`}>
                  {t.tableCity}
                </th>
                <th className={`px-4 py-3 ${isRtl ? "text-left" : "text-right"}`}>
                  {t.tableTotal}
                </th>
                <th className={`px-4 py-3 ${isRtl ? "text-right" : "text-left"}`}>
                  {t.tableStatus}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingOrders ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                    ...
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const st = statusDisplay(ord.status);
                  return (
                    <tr
                      key={ord.orderId}
                      onClick={() => {
                        setLookupInput(ord.orderId);
                        setFocusedOrder(ord);
                      }}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0F4C5C] tabular-nums whitespace-nowrap">
                        {ord.orderId}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 whitespace-nowrap">
                        {ord.customerName}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                        {ord.items
                          .map((i) => (isRtl ? i.serviceNameAr : i.serviceNameEn))
                          .join("، ")}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {ord.city}
                      </td>
                      <td
                        className={`px-4 py-3 font-mono text-xs font-bold text-slate-900 tabular-nums whitespace-nowrap ${
                          isRtl ? "text-left" : "text-right"
                        }`}
                      >
                        {formatSar(ord.totalSar, language)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${st.cls}`}>
                          {st.icon}
                          <span>{st.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
