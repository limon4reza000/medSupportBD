"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Tag,
  CreditCard,
  Package,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filtered = notifications.filter((n) => {
    if (selectedCategory === "ALL") return true;
    return n.type === selectedCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <Package className="w-5 h-5 text-blue-700" />;
      case "CREDIT":
        return <CreditCard className="w-5 h-5 text-emerald-700" />;
      case "OFFER":
        return <Tag className="w-5 h-5 text-amber-700" />;
      case "AI":
        return <Sparkles className="w-5 h-5 text-teal-700" />;
      default:
        return <Bell className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-400" />
            <span>Real-Time Supply Chain Notification Center</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Server-Sent Events (SSE) feed for order packing, dispatch timelines, credit updates, and AI warnings.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs (Pure White Card) */}
      <div className="premium-card p-4 flex items-center gap-1.5 overflow-x-auto">
        {["ALL", "ORDER", "CREDIT", "OFFER", "AI"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? "bg-[#025540] text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {cat === "ALL" ? "All Updates" : `${cat} Alerts`}
          </button>
        ))}
      </div>

      {/* Notifications List (Pure White Cards) */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="premium-card p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <div className="text-xs font-bold text-slate-700">No notifications in this category</div>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.link) router.push(n.link);
              }}
              className={`premium-card p-5 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                !n.isRead ? "border-emerald-300 bg-emerald-50/20" : ""
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    )}
                    <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>

              {n.link && (
                <div className="shrink-0 pt-1">
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
