import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Search, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  HardDrive,
  FileUp,
  FileCheck,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';

export default function VaultPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    
    setIsUploading(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'pdf') return matchesSearch && doc.filename.endsWith('.pdf');
    if (filterType === 'docx') return matchesSearch && doc.filename.endsWith('.docx');
    if (filterType === 'txt') return matchesSearch && doc.filename.endsWith('.txt');
    return matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 h-full flex flex-col overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
      
      {/* ======================================================== */}
      {/* DEDICATED PROMINENT UPLOAD HERO ZONE                     */}
      {/* ======================================================== */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white/90 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border-3 transition-all duration-300 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden ${
          isDragging 
            ? 'border-red-500 bg-red-50/70 scale-[1.01] shadow-2xl' 
            : 'border-sky-300 hover:border-sky-400'
        }`}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-tr from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-400/40 text-white mb-4 border-2 border-white">
          <FileUp className="w-8 h-8 md:w-10 md:h-10 animate-bounce" />
        </div>

        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">
          Secure Document Ingestion Vault
        </h2>
        <p className="text-xs md:text-sm text-slate-600 max-w-xl mb-5 font-medium leading-relaxed">
          Drag and drop your textbooks, lecture notes, or question papers here. Once uploaded, documents are <span className="font-bold text-sky-800">permanently locked (read-only)</span> and indexed locally for zero-hallucination verbatim search.
        </p>

        {/* Big Prominent Red Upload Button */}
        <label className="cursor-pointer bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-red-500/40 hover:shadow-red-500/60 transition-all duration-200 active:scale-95 border-2 border-red-400 uppercase tracking-wider text-sm flex items-center gap-3">
          <Upload className="w-5 h-5 stroke-[3]" />
          <span>{isUploading ? 'Securing & Indexing File...' : 'SELECT DOCUMENT TO UPLOAD'}</span>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.txt,.docx,.pptx" 
            onChange={handleFileInput} 
            disabled={isUploading} 
          />
        </label>

        {/* Supported Format Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] font-bold text-slate-600">
          <span className="px-2.5 py-1 rounded-lg bg-sky-100 border border-sky-300 text-sky-800">📄 PDF Textbooks</span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-100 border border-blue-300 text-blue-800">📝 Word DOC/DOCX</span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-800">📊 Slides PPT/PPTX</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800">📋 Plain TXT Notes</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FILTER TABS & SEARCH BAR                                */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-sky-600" />
          <input
            type="text"
            placeholder="Search notes, textbooks, units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-sky-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 font-bold focus:outline-none focus:border-sky-500 shadow-sm"
          />
        </div>

        {/* Clean Modern Pill Tabs (Distinct from Red Action Buttons) */}
        <div className="flex gap-1.5 bg-white/90 p-1.5 rounded-2xl border-2 border-sky-200 shadow-sm w-full sm:w-auto">
          {['all', 'pdf', 'docx', 'txt'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filterType === type 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
              }`}
            >
              {type === 'all' ? 'All Files' : type}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* VAULT DOCUMENTS GRID                                    */}
      {/* ======================================================== */}
      {filteredDocs.length === 0 ? (
        <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center border-2 border-dashed border-sky-300 rounded-3xl bg-white/50 p-8 text-center">
          <FolderOpen className="w-12 h-12 text-sky-500 mb-2 opacity-70" />
          <h3 className="text-base font-black text-slate-900 mb-1">No documents found matching query</h3>
          <p className="text-xs text-slate-600 max-w-sm font-medium">
            Drag a file above or clear your search to see locked vault files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const isPdf = doc.filename.endsWith('.pdf');
            const isDocx = doc.filename.endsWith('.docx');

            return (
              <div 
                key={doc.id} 
                className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border-2 border-sky-200 hover:border-sky-400 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl relative overflow-hidden group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${isPdf ? 'bg-rose-100 text-rose-600 border-rose-200' : isDocx ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-700">
                        {isPdf ? 'PDF Document' : isDocx ? 'Word Document' : 'Text File'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 line-clamp-2 mb-2 leading-snug group-hover:text-sky-700 transition-colors" title={doc.originalName}>
                    {doc.originalName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mb-4">
                    {(doc.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-sky-100 flex items-center justify-between">
                  <div>
                    {doc.status === 'ready' && (
                      <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    )}
                    {doc.status === 'processing' && (
                      <span className="text-xs font-black text-amber-700 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Indexing...
                      </span>
                    )}
                    {doc.status === 'error' && (
                      <span className="text-xs font-black text-rose-700 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Error
                      </span>
                    )}
                  </div>

                  {/* Open in Split-Screen Reader Button */}
                  {doc.status === 'ready' && (
                    <Link 
                      to={`/read/${doc.id}`} 
                      className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-red-500/30 transition-all flex items-center gap-1.5 border border-red-400 uppercase tracking-wider active:scale-95"
                    >
                      <span>Open in Split Reader</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
