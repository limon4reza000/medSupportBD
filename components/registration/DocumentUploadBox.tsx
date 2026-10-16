"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Camera,
  FileText,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  FileCheck,
} from "lucide-react";
import { IRegistrationDocument } from "@/types/domain";

interface DocumentUploadBoxProps {
  label: string;
  type: IRegistrationDocument["type"];
  isRequired?: boolean;
  hint?: string;
  currentDoc?: IRegistrationDocument;
  onDocumentChange: (doc: IRegistrationDocument | null) => void;
}

export const DocumentUploadBox: React.FC<DocumentUploadBoxProps> = ({
  label,
  type,
  isRequired = false,
  hint = "Upload scan or photo (PDF, JPG, PNG up to 5MB)",
  currentDoc,
  onDocumentChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleFileProcess = (file: File) => {
    setError(null);

    // Size validation: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB limit. Please compress or choose a smaller file.");
      return;
    }

    // Type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported format. Please upload JPG, PNG, WebP, or PDF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newDoc: IRegistrationDocument = {
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      };
      onDocumentChange(newDoc);
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDocumentChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700">
          {label} {isRequired && <span className="text-rose-500">*</span>}
        </label>
        {currentDoc && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            <CheckCircle2 className="w-3 h-3" />
            Uploaded
          </span>
        )}
      </div>

      {/* Hidden file & camera inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {currentDoc ? (
        // Uploaded Preview Card
        <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
              {currentDoc.mimeType === "application/pdf" ? (
                <FileText className="w-5 h-5" />
              ) : (
                <FileCheck className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentDoc.fileName}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {formatFileSize(currentDoc.fileSize)} • Validated
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {currentDoc.dataUrl && currentDoc.mimeType.startsWith("image/") && (
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-[#4F46E5] hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                title="Preview image"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
              title="Remove document"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Drop / Upload Buttons Box
        <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 transition-all space-y-2.5 text-center">
          <p className="text-[11px] text-slate-500">{hint}</p>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-400 text-xs font-bold text-slate-800 hover:text-[#4F46E5] flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Browse File</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-400 text-xs font-bold text-slate-800 hover:text-[#4F46E5] flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-[#FB923C]" />
              <span>Camera Capture</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-600 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && currentDoc?.dataUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 truncate">
                {currentDoc.fileName}
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center max-h-[60vh]">
              <img
                src={currentDoc.dataUrl}
                alt={currentDoc.fileName}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
