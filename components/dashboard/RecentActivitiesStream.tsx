"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
  X,
  FileText,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "ORDER" | "PURCHASE" | "PAYMENT";
  referenceId: string;
  entityName: string;
  amount: number | null;
  status: string;
  timestamp: string;
}

interface RecentActivitiesStreamProps {
  activities?: ActivityItem[];
  isMasked?: boolean;
  onActivityClick?: (item: ActivityItem) => void;
}

export function RecentActivitiesStream({
  activities = [],
  isMasked = false,
  onActivityClick,
}: RecentActivitiesStreamProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null);

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return {
          label: "Purchase",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <ShoppingBag className="w-3.5 h-3.5" />,
        };
      case "PAYMENT":
        return {
          label: "Payment",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <CreditCard className="w-3.5 h-3.5" />,
        };
      case "ORDER":
      default:
        return {
          label: "Order",
          bg: "bg-teal-50",
          text: "text-teal-700",
          border: "border-teal-200",
          icon: <Truck className="w-3.5 h-3.5" />,
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DISPATCHED":
      case "IN_TRANSIT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PACKED":
      case "ALLOCATED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3" data-testid="recent-activities-section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Recent Activities
          </h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center space-x-1 transition-colors"
        >
          <span>View All ({activities.length})</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* List */}
      {activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No recent transactions or orders recorded in this period.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.slice(0, 5).map((act) => {
            const badge = getTypeBadge(act.type);
            const statusClass = getStatusBadge(act.status);

            return (
              <div
                key={act.id}
                onClick={() => {
                  setSelectedItem(act);
                  if (onActivityClick) onActivityClick(act);
                }}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg px-1.5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg ${badge.bg} ${badge.text} flex items-center justify-center shrink-0 border ${badge.border}`}
                  >
                    {badge.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                        {act.referenceId}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {act.entityName}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900">
                    {act.amount !== null
                      ? isMasked
                        ? "••••••"
                        : `৳${act.amount.toLocaleString()}`
                      : "-"}
                  </div>
                  <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${statusClass}`}
                    >
                      {act.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatTime(act.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "View All" Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Full Transaction & Activity Log
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {activities.map((act) => {
                const badge = getTypeBadge(act.type);
                const statusClass = getStatusBadge(act.status);

                return (
                  <div
                    key={`modal-${act.id}`}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg ${badge.bg} ${badge.text} flex items-center justify-center shrink-0 border ${badge.border}`}
                      >
                        {badge.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">
                            {act.referenceId}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                          <span
                            className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${statusClass}`}
                          >
                            {act.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{act.entityName}</p>
                        <p className="text-[10px] text-slate-400">{formatTime(act.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {act.amount !== null
                          ? isMasked
                            ? "••••••"
                            : `৳${act.amount.toLocaleString()}`
                          : "-"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

