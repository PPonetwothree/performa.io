import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useFilter } from '../../context/FilterContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { refreshData } = useFilter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Only .csv files are supported.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const res = await api.uploadDataset(file);
      setSuccess(res.message || 'Dataset uploaded successfully!');
      await refreshData();
      setTimeout(() => {
        onClose();
        setFile(null);
        setSuccess(null);
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Failed to upload CSV dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Upload Retail Transaction CSV
            </h3>
            <p className="text-xs text-slate-400">
              Performa.io automatically maps column aliases and cleans data.
            </p>
          </div>
        </div>

        {/* Schema Requirement Card */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs mb-4 space-y-1.5">
          <div className="font-semibold text-slate-300">
            Supported Fields & Aliases:
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
            <strong className="text-emerald-400">Required:</strong> Order ID, Order Date, Sales, Quantity, Profit.<br />
            <strong className="text-slate-300">Recommended:</strong> Customer, Segment, Region, State, City, Category, Sub-Category, Product, Discount.
          </div>
        </div>

        {/* File Dropzone Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            file
              ? 'border-emerald-500/50 bg-emerald-950/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-emerald-400" />
              <div className="text-xs font-bold text-white truncate max-w-[280px]">
                {file.name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <div className="text-xs font-semibold text-slate-300">
                Click to browse or drop CSV file here
              </div>
              <div className="text-[11px] text-slate-400">
                Maximum file size: 50MB
              </div>
            </div>
          )}
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Success Feedback */}
        {success && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              !file || isUploading
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
            }`}
          >
            {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isUploading ? 'Validating & Processing...' : 'Upload & Ingest Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
