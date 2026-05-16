"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { initUpload, uploadChunk, finalizeUpload } from '@/app/actions';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  relatedId: number;
  category: 'UNIT' | 'INTEL' | 'OPS_DN' | 'OPS_LN';
  onSuccess?: () => void;
  className?: string;
}

const ALLOWED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav'
];

const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

export default function DocumentUploader({ relatedId, category, onSuccess, className }: DocumentUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [status, setStatus] = useState<{ [key: string]: 'pending' | 'uploading' | 'success' | 'error' }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`File type ${file.type} not allowed: ${file.name}`);
          return false;
        }
        return true;
      });
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFileChunked = async (file: File) => {
    const fileId = file.name + file.size;
    setStatus(prev => ({ ...prev, [fileId]: 'uploading' }));
    setProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      // 1. Init
      const initRes = await initUpload({ fileName: file.name, category });
      if (!initRes.success) throw new Error(initRes.error);

      const { uploadId, tempPath } = initRes;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      // 2. Upload Chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        const reader = new FileReader();
        const chunkBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(chunk);
        });

        const chunkRes = await uploadChunk({ uploadId: uploadId!, chunkBase64, tempPath: tempPath! });
        if (!chunkRes.success) throw new Error(chunkRes.error);

        const percent = Math.round(((i + 1) / totalChunks) * 100);
        setProgress(prev => ({ ...prev, [fileId]: percent }));
      }

      // 3. Finalize
      const finalRes = await finalizeUpload({
        uploadId: uploadId!,
        tempPath: tempPath!,
        relatedId,
        category,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

      if (!finalRes.success) throw new Error(finalRes.error);

      setStatus(prev => ({ ...prev, [fileId]: 'success' }));
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);
      setStatus(prev => ({ ...prev, [fileId]: 'error' }));
    }
  };

  const startUpload = async () => {
    setUploading(true);
    await Promise.all(files.map(file => {
      const fileId = file.name + file.size;
      if (status[fileId] === 'success') return Promise.resolve();
      return uploadFileChunked(file);
    }));
    setUploading(false);
    if (onSuccess) onSuccess();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-tactical-green/30 hover:border-tactical-green/60 bg-tactical-green/5 p-8 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
      >
        <div className="w-12 h-12 rounded-full bg-tactical-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="text-tactical-green" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-tactical-text">Klik atau seret file untuk upload</p>
          <p className="text-[10px] text-tactical-muted uppercase mt-1">PDF, DOC, XLS, PPT, MP4, MP3, WAV (Maks 100MB)</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          className="hidden" 
          accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.mp3,.wav"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => {
            const fileId = file.name + file.size;
            const currentStatus = status[fileId];
            const currentProgress = progress[fileId] || 0;

            return (
              <div key={idx} className="bg-black/40 border border-white/10 rounded p-3 flex items-center gap-4">
                <div className="p-2 bg-tactical-green/10 rounded">
                  <File size={16} className="text-tactical-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold text-white truncate">{file.name}</p>
                    <span className="text-[10px] font-mono text-tactical-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  
                  {currentStatus === 'uploading' && (
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-tactical-green transition-all duration-300" 
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>
                  )}

                  {currentStatus === 'success' && (
                    <p className="text-[10px] font-bold text-tactical-green flex items-center gap-1">
                      <CheckCircle size={10} /> Sukses Upload
                    </p>
                  )}

                  {currentStatus === 'error' && (
                    <p className="text-[10px] font-bold text-tactical-red flex items-center gap-1">
                      <AlertCircle size={10} /> Gagal Upload
                    </p>
                  )}
                </div>
                
                {!uploading && currentStatus !== 'success' && (
                  <button onClick={() => removeFile(idx)} className="text-tactical-muted hover:text-tactical-red transition-colors">
                    <X size={16} />
                  </button>
                )}
                {currentStatus === 'uploading' && (
                  <div className="text-[10px] font-mono text-tactical-green font-bold">{currentProgress}%</div>
                )}
              </div>
            );
          })}

          <button
            onClick={startUpload}
            disabled={uploading || files.every(f => status[f.name + f.size] === 'success')}
            className="w-full py-2.5 bg-tactical-green text-white rounded font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
          >
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" /> Mengupload...</>
            ) : (
              <><Upload size={16} /> Mulai Upload {files.length} File</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
