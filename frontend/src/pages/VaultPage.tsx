import React, { useState, useEffect, useRef } from 'react';
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
  FolderOpen,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { getApiUrl } from '../lib/api';

export default function VaultPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  
  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    fetchDocuments();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const fetchDocuments = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(getApiUrl('/api/documents'));
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
        
        // If any document is still processing, start polling until ready
        const hasProcessing = data.some((d: any) => d.status === 'processing');
        if (hasProcessing && !pollIntervalRef.current) {
          pollIntervalRef.current = setInterval(async () => {
            try {
              const pollRes = await fetch(getApiUrl('/api/documents'));
              if (pollRes.ok) {
                const pollData = await pollRes.json();
                if (Array.isArray(pollData)) {
                  setDocuments(pollData);
                  const stillProcessing = pollData.some((d: any) => d.status === 'processing');
                  if (!stillProcessing && pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                  }
                }
              }
            } catch (err) {
              // Ignore polling errors
            }
          }, 2500);
        } else if (!hasProcessing && pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (e: any) {
      console.error('Fetch documents error:', e);
      setStatusMessage({
        type: 'info',
        text: 'Cloud server is waking up... Please wait 15-30 seconds or tap Refresh.'
      });
    } finally {
      setIsFetching(false);
    }
  };

  const uploadFile = async (file: File) => {
    // 50 MB check
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setStatusMessage({
        type: 'error',
        text: `File "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 50 MB.`
      });
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    
    setIsUploading(true);
    setStatusMessage({
      type: 'info',
      text: `Uploading "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB)... Please wait.`
    });

    try {
      const uploadUrl = getApiUrl('/api/documents/upload');
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed with status ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      setStatusMessage({
        type: 'success',
        text: `"${file.name}" uploaded successfully! Indexing text & preparing for verbatim reader...`
      });

      // Refresh documents and trigger polling
      await fetchDocuments();
    } catch (error: any) {
      console.error("Upload failed", error);
      setStatusMessage({
        type: 'error',
        text: `Upload failed: ${error.message || 'Server error'}. If the server was sleeping, please retry in a few seconds.`
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
      e.target.value = ''; // Reset input so same file can be re-uploaded
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
    const matchesSearch = doc.originalName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'pdf') return matchesSearch && doc.filename?.endsWith('.pdf');
    if (filterType === 'docx') return matchesSearch && doc.filename?.endsWith('.docx');
    if (filterType === 'txt') return matchesSearch && doc.filename?.endsWith('.txt');
    return matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 h-full flex flex-col overflow-y-auto max-w-7xl mx-auto w-full space-y-4">
      
      {/* STATUS NOTIFICATION BANNER */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs md:text-sm font-bold shadow-sm transition-all ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : statusMessage.type === 'error'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-sky-50 border-sky-300 text-sky-900 animate-pulse'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {statusMessage.type === 'info' && <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-slate-500 hover:text-slate-800 ml-2 px-2 py-0.5 rounded text-xs underline font-normal"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPACT & NEAT SKY BLUE HERO BANNER                      */}
      {/* ======================================================== */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 backdrop-blur-2xl p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative overflow-hidden ${
          isDragging 
            ? 'border-red-500 bg-red-50/70 scale-[1.01]' 
            : 'border-sky-300 hover:border-sky-400'
        }`}
      >
        {/* Left Side: Scaled-down neat title & description */}
        <div className="space-y-1.5 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-200 border border-sky-300 text-sky-800 shadow-xs">
              <Lock className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900 leading-tight">
              Document Vault
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-full border border-sky-300">
              Read-Only
            </span>
          </div>
          <p className="text-slate-600 text-xs md:text-sm font-medium leading-snug">
            Upload textbooks, lecture notes, or slides (up to 50MB). Documents are locked against editing and indexed for verbatim answer retrieval.
          </p>
          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-600 pt-0.5">
            <span className="px-2 py-0.5 rounded bg-white/90 border border-sky-200 text-sky-800">📄 PDF</span>
            <span className="px-2 py-0.5 rounded bg-white/90 border border-sky-200 text-sky-800">📝 DOCX</span>
            <span className="px-2 py-0.5 rounded bg-white/90 border border-sky-200 text-sky-800">📊 PPTX</span>
            <span className="px-2 py-0.5 rounded bg-white/90 border border-sky-200 text-sky-800">📋 TXT</span>
          </div>
        </div>

        {/* Right Side: Scaled-down, neat Red Upload Button */}
        <div className="z-10 shrink-0 w-full sm:w-auto flex flex-col items-center lg:items-end">
          <label className={`cursor-pointer w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black px-5 py-2.5 md:px-6 md:py-3 rounded-xl shadow-md shadow-red-500/30 transition-all duration-200 active:scale-95 border border-red-400 uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-2 ${
            isUploading ? 'opacity-70 pointer-events-none' : ''
          }`}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 stroke-[3]" />
                <span>Upload Document</span>
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.txt,.docx,.pptx" 
              onChange={handleFileInput} 
              disabled={isUploading} 
            />
          </label>
          <span className="text-[10px] text-slate-500 font-semibold mt-1">
            or drag & drop files here (up to 50MB)
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FILTER TABS & SEARCH BAR & REFRESH                       */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-sky-600" />
            <input
              type="text"
              placeholder="Search notes, textbooks, units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border-2 border-sky-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 font-bold focus:outline-none focus:border-sky-500 shadow-xs"
            />
          </div>
          <button
            onClick={fetchDocuments}
            disabled={isFetching}
            className="px-3 py-2 bg-white border-2 border-sky-200 rounded-xl hover:bg-sky-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
            title="Refresh Vault Documents"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-sky-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 bg-white/90 p-1 rounded-xl border border-sky-200 shadow-xs w-full sm:w-auto">
          {['all', 'pdf', 'docx', 'txt'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                filterType === type 
                  ? 'bg-sky-600 text-white shadow-xs' 
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
        <div className="flex-1 min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-sky-300 rounded-2xl bg-white/50 p-6 text-center">
          <FolderOpen className="w-10 h-10 text-sky-500 mb-1.5 opacity-70" />
          <h3 className="text-sm font-black text-slate-900 mb-0.5">
            {isFetching ? 'Loading documents...' : 'No documents in vault'}
          </h3>
          <p className="text-xs text-slate-600 max-w-sm font-medium">
            {isFetching 
              ? 'Connecting to your secure cloud vault...' 
              : 'Upload textbooks or notes above to read and query verbatim.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isPdf = doc.filename?.endsWith('.pdf');
            const isDocx = doc.filename?.endsWith('.docx');

            return (
              <div 
                key={doc.id} 
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 border-2 border-sky-200 hover:border-sky-400 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${isPdf ? 'bg-rose-100 text-rose-600 border-rose-200' : isDocx ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-700">
                        {isPdf ? 'PDF' : isDocx ? 'Word' : 'Text'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-slate-900 line-clamp-2 mb-1.5 leading-snug group-hover:text-sky-700 transition-colors" title={doc.originalName}>
                    {doc.originalName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mb-3">
                    {doc.size ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB • ` : ''}
                    {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Recent'}
                  </p>
                </div>

                <div className="pt-3 border-t border-sky-100 flex items-center justify-between">
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
                      className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 border border-red-400 uppercase tracking-wider active:scale-95"
                    >
                      <span>Open Reader</span>
                      <ArrowRight className="w-3 h-3 stroke-[3]" />
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
