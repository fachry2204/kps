"use client";

import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Calendar, Clock, File } from 'lucide-react';
import { getDocuments, deleteDocument } from '@/app/actions';
import { format } from 'date-fns';

interface DocumentListProps {
  relatedId: number;
  category: 'UNIT' | 'INTEL' | 'OPS_DN' | 'OPS_LN';
  refreshTrigger?: number;
}

export default function DocumentList({ relatedId, category, refreshTrigger = 0 }: DocumentListProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    const docs = await getDocuments(relatedId, category);
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [relatedId, category, refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      const res = await deleteDocument(id);
      if (res.success) {
        fetchDocs();
      } else {
        alert('Gagal menghapus dokumen: ' + res.error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-tactical-muted animate-pulse">Memuat dokumen...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-10 bg-black/20 border border-dashed border-white/10 rounded-lg">
        <File size={32} className="mx-auto text-tactical-muted opacity-20 mb-2" />
        <p className="text-xs text-tactical-muted uppercase font-bold">Belum ada dokumen terlampir</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {documents.map((doc) => (
        <div key={doc.id} className="group relative bg-tactical-bg/50 border border-white/10 rounded-lg p-4 hover:border-tactical-green/40 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-tactical-green/10 rounded-lg group-hover:bg-tactical-green/20 transition-colors">
              <FileText className="text-tactical-green" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate mb-1">{doc.original_name}</h4>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-tactical-muted uppercase font-mono">
                <span className="flex items-center gap-1"><Calendar size={10} /> {format(new Date(doc.uploaded_at), 'dd MMM yyyy')}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {format(new Date(doc.uploaded_at), 'HH:mm')}</span>
                <span className="bg-white/5 px-1.5 py-0.5 rounded">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a 
                href={doc.upload_path} 
                download={doc.original_name}
                className="p-2 text-tactical-muted hover:text-tactical-green hover:bg-tactical-green/10 rounded transition-all"
                title="Download"
              >
                <Download size={18} />
              </a>
              <button 
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-tactical-muted hover:text-tactical-red hover:bg-tactical-red/10 rounded transition-all"
                title="Hapus"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
