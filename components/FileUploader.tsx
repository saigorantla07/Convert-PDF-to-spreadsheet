import React from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isProcessing }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <label 
        className={`
          flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-xl cursor-pointer 
          transition-all duration-300
          ${isProcessing 
            ? 'border-slate-300 bg-slate-50 cursor-not-allowed' 
            : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          ) : (
            <Upload className="w-12 h-12 text-blue-500 mb-4" />
          )}
          <p className="mb-2 text-sm text-slate-600 font-medium">
            {isProcessing ? 'Processing...' : 'Click to upload textbook PDF'}
          </p>
          <p className="text-xs text-slate-400">
            PDF files only
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="application/pdf"
          disabled={isProcessing}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};