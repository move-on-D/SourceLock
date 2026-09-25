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
  HardDrive
} from 'lucide-react';

export default function VaultPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
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

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'pdf') return matchesSearch && doc.filename.endsWith('.pdf');
    if (filterType === 'docx') return matchesSearch && doc.filename.endsWith('.docx');
    if (filterType === 'txt') return matchesSearch && doc.filename.endsWith('.txt');
    return matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 h-full flex flex-col overflow-y-auto max-w-7xl mx-auto w-full">
      
      {/* Header Banner - Sky Blue Glass */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border-2 border-sky-300 shadow-lg relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 border border-sky-300 text-sky-700">
              <Lock className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Document Vault</h1>
          </div>
          <p className="text-slate-600 text-sm max-w-xl font-medium">
            Upload your lecture notes, textbook PDFs, and question papers. SourceLock secures your sources and extracts verbatim answers with zero hallucination.
          </p>
        </div>

        {/* RED Upload Button */}
        <div className="z-10 shrink-0">
          <label className="cursor-pointer bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-red-500/30 flex items-center gap-2.5 transition-all duration-200 active:scale-95 border-2 border-red-400 uppercase tracking-wider text-xs">
            <Upload className="w-4 h-4 stroke-[3]" />
            <span>{isUploading ? 'Indexing File...' : 'Upload Source Document'}</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.txt,.docx" 
              onChange={handleUpload} 
              disabled={isUploading} 
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
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

        <div className="flex gap-2 w-full sm:w-auto">
          {['all', 'pdf', 'docx', 'txt'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filterType === type 
                  ? 'bg-red-600 text-white border-2 border-red-500 shadow-md shadow-red-500/40' 
                  : 'bg-white/90 text-slate-700 hover:bg-sky-50 border-2 border-sky-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Documents */}
      {filteredDocs.length === 0 ? (
        <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center border-2 border-dashed border-sky-300 rounded-3xl bg-white/50 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-sky-600 mb-4 shadow-inner">
            <HardDrive className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Your vault is empty</h3>
          <p className="text-sm text-slate-600 max-w-md mb-6 font-medium">
            Upload your syllabus, textbooks, or scanned PDFs. They will be locked read-only and indexed for instant verbatim retrieval.
          </p>
          {/* RED Browse Files Button */}
          <label className="cursor-pointer bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/30 border-2 border-red-400">
            Browse Files (.pdf, .docx, .txt)
            <input type="file" className="hidden" accept=".pdf,.txt,.docx" onChange={handleUpload} />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const isPdf = doc.filename.endsWith('.pdf');
            const isDocx = doc.filename.endsWith('.docx');

            return (
              <div 
                key={doc.id} 
                className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border-2 border-sky-200 hover:border-sky-400 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${isPdf ? 'bg-rose-100 text-rose-600 border-rose-200' : isDocx ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-700">
                        {isPdf ? 'PDF Document' : isDocx ? 'Word File' : 'Plain Text'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Read-Only
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 line-clamp-2 mb-2 leading-snug" title={doc.originalName}>
                    {doc.originalName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mb-4">
                    {(doc.size / (1024 * 1024)).toFixed(2)} MB • {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-sky-100 flex items-center justify-between">
                  <div>
                    {doc.status === 'ready' && (
                      <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Indexed
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

                  {/* RED Study & Read Button */}
                  {doc.status === 'ready' && (
                    <Link 
                      to={`/read/${doc.id}`} 
                      className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-red-500/30 transition-all flex items-center gap-1.5 border border-red-400 uppercase tracking-wider"
                    >
                      <span>Study & Read</span>
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
