"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ArrowRight, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const NotificationMenu: React.FC = () => {
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 stroke-[2]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
          
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-emerald-700" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.link) {
                      setIsOpen(false);
                      router.push(n.link);
                    }
                  }}
                  className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors border ${
                    !n.isRead
                      ? "bg-emerald-50/80 border-emerald-200 font-semibold"
                      : "bg-slate-50 border-slate-100 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              <span>View All Notifications</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
};
