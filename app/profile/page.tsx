"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function ProfilePage() {
  const { currentUser, currentPharmacy, updateUserAvatar, updateUserProfile } = useApp();
  const [isSaved, setIsSaved] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);

  // Default avatar preset list
  const presetAvatars = [
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1594824813566-7885a3964478?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80",
  ];

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadMessage({ text: "Please select a valid image file (JPG, PNG, WebP).", type: "error" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage({ text: "Image size must be under 5MB.", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateUserAvatar(result);
        setUploadMessage({ text: "Profile picture uploaded successfully!", type: "success" });
        setTimeout(() => setUploadMessage(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    // Default SVG fallback avatar data URL
    const defaultAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80";
    updateUserAvatar(defaultAvatar);
    setUploadMessage({ text: "Profile picture reset to default.", type: "success" });
    setTimeout(() => setUploadMessage(null), 3000);
  };

  const handleSelectPreset = (url: string) => {
    updateUserAvatar(url);
    setUploadMessage({ text: "Avatar updated from presets!", type: "success" });
    setTimeout(() => setUploadMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            <span>User & Profile Settings</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Manage your personal profile, profile image upload, and registered pharmacy credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: User Avatar & Upload Card */}
        <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
          
          {/* Avatar Upload Container matching user screenshot */}
          <div className="relative group cursor-pointer" onClick={triggerFileInput}>
            <div className="p-1.5 bg-[#a3e6cd]/25 border-[3px] border-[#a3e6cd] rounded-[28px] shadow-sm transition-all group-hover:border-[#34d399]">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-32 h-32 rounded-[22px] object-cover group-hover:opacity-90 transition-opacity"
              />
            </div>

            {/* Dark Green Camera Badge Button (Exact design from screenshot) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              aria-label="Upload photo"
              title="Click to upload profile photo"
              className="absolute -bottom-2 -right-2 p-2.5 bg-[#014232] hover:bg-[#025540] text-white rounded-2xl shadow-xl border-4 border-white transition-transform hover:scale-110 flex items-center justify-center"
            >
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {currentUser.role.replace("_", " ")}
            </span>
          </div>

          {/* Upload & Reset Buttons */}
          <div className="w-full pt-2 flex items-center justify-center gap-2">
            <button
              onClick={triggerFileInput}
              className="flex-1 px-3 py-2 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
            <button
              onClick={handleRemovePhoto}
              title="Reset Avatar"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upload Status Alert */}
          {uploadMessage && (
            <div
              className={`w-full p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                uploadMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                  : "bg-rose-50 text-rose-900 border border-rose-300"
              }`}
            >
              {uploadMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="truncate">{uploadMessage.text}</span>
            </div>
          )}

          {/* Quick Preset Avatars Picker */}
          <div className="w-full pt-3 border-t border-slate-100 text-left">
            <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Or Choose Quick Preset Avatar:</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {presetAvatars.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(url)}
                  className={`w-9 h-9 rounded-xl overflow-hidden ring-2 transition-all hover:scale-110 ${
                    currentUser.avatar === url ? "ring-emerald-600 scale-105" : "ring-transparent hover:ring-slate-300"
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full pt-3 border-t border-slate-100 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Security Status:</span>
              <strong className="text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 2FA Verified
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Login:</span>
              <span className="font-mono text-slate-700">Today, 08:30 AM</span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: User Information & Registered Pharmacy Credentials */}
        <div className="lg:col-span-2 premium-card p-6 space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Personal Information & Pharmacy Master Record</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {currentPharmacy.code}
            </span>
          </div>

          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Profile information successfully saved!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700">User Full Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">User Email Address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Pharmacy Trade Name:</label>
                <input
                  type="text"
                  defaultValue={currentPharmacy.tradeName}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Drug License Number:</label>
                <input
                  type="text"
                  defaultValue={currentPharmacy.drugLicenseNo}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Emergency Contact Phone:</label>
                <input
                  type="text"
                  defaultValue={currentPharmacy.phone}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Assigned Depot / Region:</label>
                <input
                  type="text"
                  defaultValue="Dhaka Central Depot (DEPOT-01)"
                  disabled
                  className="w-full mt-1 p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700">Physical Delivery Address:</label>
                <input
                  type="text"
                  defaultValue={`${currentPharmacy.address}, ${currentPharmacy.thana}, ${currentPharmacy.district}`}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
