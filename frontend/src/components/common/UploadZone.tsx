import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle, FileUp, Sparkles } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  helperText?: string;
  compact?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  multiple = false,
  maxSizeMB = 10,
  acceptedFormats = ['.pdf', '.docx', '.doc', '.txt', '.png', '.jpg'],
  helperText = 'PDF, DOCX, TXT or PNG/JPG up to 10MB',
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!acceptedFormats.includes(extension)) {
        setErrorMessage(
          `Invalid file format for "${file.name}". Allowed extensions: ${acceptedFormats.join(', ')}`
        );
        return;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `"${file.name}" exceeds the ${maxSizeMB}MB file size limit.`
        );
        return;
      }

      if (file.size === 0) {
        setErrorMessage(`"${file.name}" is an empty file (0 bytes).`);
        return;
      }

      validFiles.push(file);
      if (!multiple) break;
    }

    if (validFiles.length > 0) onFilesSelected(validFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`upload-zone relative cursor-pointer rounded-2xl transition-all duration-200 text-center flex flex-col items-center justify-center group ${
          compact ? 'p-5' : 'p-8'
        } ${isDragging ? 'dragging shadow-[0_0_30px_rgba(98,216,255,0.25)]' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
        />

        {/* Luminous Upload Icon */}
        <div
          className={`rounded-2xl border flex items-center justify-center mb-3 transition-all ${
            isDragging
              ? 'bg-[#438AFF]/30 border-[#62D8FF] shadow-[0_0_20px_rgba(98,216,255,0.4)]'
              : 'bg-white/[0.06] border-white/15 group-hover:border-[#438AFF]/50 group-hover:bg-[#438AFF]/15'
          } ${compact ? 'w-10 h-10' : 'w-14 h-14'}`}
        >
          {isDragging ? (
            <FileUp className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} text-[#62D8FF]`} strokeWidth={2} />
          ) : (
            <UploadCloud className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} text-[#438AFF] group-hover:text-[#62D8FF] transition-colors`} strokeWidth={2} />
          )}
        </div>

        <p className={`font-bold text-white tracking-tight ${compact ? 'text-xs' : 'text-sm'}`}>
          {isDragging
            ? 'Release to upload documents'
            : multiple
            ? 'Drop enterprise documents here or browse'
            : 'Drop candidate resume or document here'}
        </p>

        <p className="mt-1 text-xs text-[#94A3B8]">{helperText}</p>

        {!compact && (
          <div className="mt-3.5 flex flex-wrap justify-center items-center gap-1.5">
            {acceptedFormats.slice(0, 4).map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-bold text-[#62D8FF]"
              >
                {fmt.replace('.', '').toUpperCase()}
              </span>
            ))}
            <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 ml-1 font-semibold">
              <Sparkles className="w-2.5 h-2.5 text-[#62D8FF]" /> Max 10MB
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-start gap-2.5 text-xs text-red-200 bg-red-950/50 p-3 rounded-xl border border-red-500/40 backdrop-blur-md animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
