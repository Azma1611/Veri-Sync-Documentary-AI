import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle, FileUp } from 'lucide-react';

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
  acceptedFormats = ['.pdf', '.docx', '.doc'],
  helperText = 'PDF or DOCX up to 10MB',
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
          `Invalid format "${file.name}". Accepted: ${acceptedFormats.join(', ')}`
        );
        return;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `"${file.name}" exceeds the ${maxSizeMB}MB limit.`
        );
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
        className={`upload-zone relative cursor-pointer rounded-2xl transition-all duration-200 text-center flex flex-col items-center justify-center ${
          compact ? 'p-6' : 'p-8'
        } ${isDragging ? 'dragging' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
        />

        {/* Animated upload icon */}
        <div className={`rounded-2xl ${isDragging ? 'bg-indigo-100' : 'bg-white/80'} border border-indigo-100 shadow-sm flex items-center justify-center mb-3 transition-all ${
          compact ? 'w-10 h-10' : 'w-12 h-12'
        }`}>
          {isDragging
            ? <FileUp className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-[#4338CA]`} strokeWidth={1.5} />
            : <UploadCloud className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-[#4338CA]`} strokeWidth={1.5} />
          }
        </div>

        <p className={`font-semibold text-[#172554] ${compact ? 'text-xs' : 'text-sm'}`}>
          {isDragging
            ? 'Drop to upload'
            : (multiple ? 'Drop files here or click to browse' : 'Drop file here or click to browse')
          }
        </p>

        <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>

        {!compact && (
          <div className="mt-3 flex items-center gap-1.5">
            {acceptedFormats.map((fmt) => (
              <span key={fmt} className="px-2 py-0.5 rounded-full bg-white/80 border border-indigo-100 text-[10px] font-semibold text-[#4338CA]">
                {fmt.replace('.', '').toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-2 flex items-start gap-2 text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
