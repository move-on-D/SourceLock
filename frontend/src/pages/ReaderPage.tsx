import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  FileText, 
  ExternalLink, 
  BookOpen, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Crosshair, 
  Bookmark,
  Smartphone
} from 'lucide-react';

export default function ReaderPage() {
  const { id } = useParams();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(id || '');
  const [doc, setDoc] = useState<any>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  
  // AI & Locator State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
  
  // Mobile Tab State: 'source' or 'ai'
  const [mobileTab, setMobileTab] = useState<'source' | 'ai'>('source');

  // Highlight & Sync State
  const [highlightedPara, setHighlightedPara] = useState<number | null>(null);
  const [highlightedPage, setHighlightedPage] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  
  const paraRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        if (!selectedDocId && data.length > 0) {
          setSelectedDocId(data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedDocId && id) {
      setSelectedDocId(id);
    }
  }, [id]);

  useEffect(() => {
    if (!selectedDocId) return;

    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        const found = data.find((d: any) => d.id === selectedDocId);
        if (found) {
          setDoc(found);
          fetch(`/vault/${found.filename}`)
            .then(res => res.text())
            .then(text => {
              const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 10);
              setParagraphs(paras);
            })
            .catch(() => {
              setParagraphs([]);
            });
        }
      });
  }, [selectedDocId]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer('');
    setSources([]);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, documentId: selectedDocId })
      });
      const data = await res.json();
      setAnswer(data.answer);
      setSources(data.sources || []);

      if (data.sources && data.sources.length > 0) {
        jumpToSource(data.sources[0].page, data.sources[0].paragraph);
      }
    } catch (err) {
      console.error(err);
      setAnswer('Failed to retrieve answer from source.');
    } finally {
      setIsLoading(false);
    }
  };

  const jumpToSource = (page: number, para: number) => {
    setHighlightedPage(page);
    setHighlightedPara(para);

    // On mobile, auto-switch to source tab so the user sees the highlighted text
    setMobileTab('source');

    const iframe = document.getElementById('source-pdf-frame') as HTMLIFrameElement;
    if (iframe && doc?.filename.endsWith('.pdf')) {
      iframe.src = `/vault/${doc.filename}#page=${page}`;
    }

    setTimeout(() => {
      const targetElement = paraRefs.current[para];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const copyAnswer = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-sky-50 overflow-hidden">
      
      {/* Top Split-Screen Control Bar */}
      <header className="py-2.5 px-3 md:py-3 md:px-6 bg-white/90 border-b-2 border-sky-200 flex flex-wrap items-center justify-between gap-2 shrink-0 z-20 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <Link to="/" className="p-1.5 md:p-2 rounded-xl bg-sky-100 text-sky-800 hover:bg-sky-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Document Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-600 hidden sm:block" />
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="bg-sky-100 border-2 border-sky-300 text-slate-900 font-black text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer max-w-[170px] sm:max-w-xs truncate"
            >
              {documents.length === 0 && <option value="">No documents in vault</option>}
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.originalName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Indicator & Toggle */}
        <div className="flex items-center gap-2">
          {highlightedPara && (
            <span className="text-[10px] md:text-xs font-mono font-black text-slate-950 bg-yellow-400 px-2.5 py-1 rounded-xl shadow-md border-2 border-yellow-500 flex items-center gap-1 animate-bounce">
              <Crosshair className="w-3 h-3" />
              Found: P{highlightedPage || 1} • Para {highlightedPara}
            </span>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="hidden md:flex px-3.5 py-1.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/30 transition-all items-center gap-1.5 border border-red-400 active:scale-95 uppercase tracking-wider"
          >
            {showAIPanel ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAIPanel ? 'Hide AI' : 'Show AI'}</span>
          </button>
        </div>

        {/* MOBILE TAB SWITCHER (Visible on phones) */}
        <div className="flex md:hidden w-full gap-1 pt-1 border-t border-sky-200 justify-center">
          <button
            onClick={() => setMobileTab('source')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'source'
                ? 'bg-yellow-400 text-slate-950 border-2 border-yellow-500 shadow-sm'
                : 'bg-white text-slate-600 border border-sky-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Original Source</span>
          </button>
          <button
            onClick={() => setMobileTab('ai')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'ai'
                ? 'bg-yellow-400 text-slate-950 border-2 border-yellow-500 shadow-sm'
                : 'bg-white text-slate-600 border border-sky-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
            <span>AI Explanation</span>
          </button>
        </div>
      </header>

      {/* 2 HALF SCREENS (Side-by-side on desktop, Tab-switched on mobile) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* LEFT HALF SCREEN: Original Word from the Source */}
        <div className={`h-full flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-sky-200 transition-all duration-300 ${
          mobileTab === 'source' ? 'flex-1' : 'hidden md:flex md:flex-1'
        } ${showAIPanel ? 'md:w-1/2' : 'md:w-full'} bg-sky-50`}>
          
          <div className="bg-sky-200/80 px-3 py-2 md:px-4 md:py-2.5 border-b border-sky-300 flex items-center justify-between text-xs font-mono text-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-600 text-white font-black text-[10px] uppercase tracking-wider">
                Left Screen
              </span>
              <span className="font-black text-slate-900 flex items-center gap-1 text-[11px] md:text-xs">
                <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                Original Word from Source (Verbatim)
              </span>
            </div>
            <span className="text-[10px] text-slate-600 font-bold hidden sm:inline">No Editing Allowed • Locked</span>
          </div>

          <div className="flex-1 w-full h-full bg-white overflow-y-auto p-3 md:p-6 space-y-4">
            {doc?.filename?.endsWith('.pdf') ? (
              <iframe
                id="source-pdf-frame"
                src={`/vault/${doc.filename}`}
                className="w-full h-full border-none rounded-xl"
                title="Source PDF Viewer"
              />
            ) : paragraphs.length > 0 ? (
              <div className="space-y-4 max-w-3xl mx-auto">
                {paragraphs.map((p, idx) => {
                  const paraNum = idx + 1;
                  const isHighlighted = highlightedPara === paraNum;

                  return (
                    <div
                      key={paraNum}
                      ref={el => paraRefs.current[paraNum] = el}
                      className={`p-3.5 md:p-4 rounded-2xl transition-all duration-500 border-2 ${
                        isHighlighted
                          ? 'bg-yellow-300 text-slate-950 font-black border-yellow-500 shadow-[0_0_30px_rgba(250,204,21,0.9)] scale-[1.01]'
                          : 'bg-sky-50/60 text-slate-800 border-sky-200 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-sky-200">
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${isHighlighted ? 'text-slate-950 font-black' : 'text-sky-800 font-extrabold'}`}>
                          Paragraph {paraNum}
                        </span>
                        {isHighlighted && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black text-yellow-300 animate-pulse">
                            Exact Located Chunk
                          </span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed font-mono ${isHighlighted ? 'text-slate-950 font-bold' : 'text-slate-700 font-medium'}`}>
                        {p}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-sky-800">
                <FileText className="w-10 h-10 text-sky-400 mb-2" />
                <h4 className="text-sm font-black text-slate-900 mb-1">Select or Upload a Document</h4>
                <p className="text-xs text-slate-600 max-w-xs mb-3 font-medium">
                  Upload lecture notes or syllabus in the Document Vault to view verbatim text here.
                </p>
                <Link to="/" className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider">
                  Go to Vault
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT HALF SCREEN: AI Explanation & Smart Locator */}
        {(showAIPanel || mobileTab === 'ai') && (
          <div className={`h-full bg-sky-50 flex flex-col shrink-0 shadow-2xl ${
            mobileTab === 'ai' ? 'flex-1 w-full' : 'hidden md:flex md:w-1/2'
          }`}>
            
            <div className="bg-sky-200/80 px-3 py-2 md:px-4 md:py-2.5 border-b border-sky-300 flex items-center justify-between text-xs font-mono text-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-black text-[10px] uppercase tracking-wider border border-yellow-500">
                  Right Screen
                </span>
                <span className="font-black text-slate-900 flex items-center gap-1 text-[11px] md:text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                  AI Explanation in Simple Words
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black">
                Zero Hallucination
              </span>
            </div>

            {/* Smart Answer Locator Query Bar */}
            <div className="p-3 md:p-4 border-b-2 border-sky-200 bg-white shrink-0">
              <form onSubmit={handleAsk} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Ask: 'Where is ACID properties?' or explain..."
                  className="flex-1 bg-sky-50 border-2 border-sky-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-bold focus:outline-none focus:border-sky-500"
                  disabled={isLoading}
                />
                {/* RED Locate Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-500 text-white font-black px-3.5 py-2 md:px-5 md:py-2.5 rounded-xl text-xs shadow-md shadow-red-500/30 disabled:opacity-50 flex items-center gap-1 shrink-0 border border-red-400 active:scale-95 uppercase tracking-wider"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{isLoading ? '...' : 'Locate'}</span>
                </button>
              </form>
            </div>

            {/* Answers & Exact Coordinates Stream */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
              
              {answer && (
                <div className="bg-white border-2 border-sky-300 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-sky-200">
                    <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Simple Language Explanation
                    </span>
                    <button 
                      onClick={copyAnswer}
                      className="text-slate-600 hover:text-slate-900 text-[11px] font-black flex items-center gap-1 px-2 py-1 rounded bg-sky-100 border border-sky-300"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="text-xs leading-relaxed text-slate-800 font-sans whitespace-pre-wrap font-medium">
                    {answer}
                  </div>
                </div>
              )}

              {sources.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-700 px-1">
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5 text-yellow-600" /> Exact Found Locations
                    </span>
                    <span className="text-yellow-700 font-mono font-bold">{sources.length} Matches</span>
                  </div>

                  {sources.map((src, i) => (
                    <div 
                      key={i} 
                      className="bg-white border-2 border-sky-200 hover:border-sky-400 rounded-2xl p-3.5 transition-all shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-black text-slate-950 bg-yellow-400 px-2 py-0.5 rounded-lg border border-yellow-500 shadow-sm">
                          P{src.page} • Para {src.paragraph}
                        </span>

                        {/* RED Go to Source Button */}
                        <button 
                          onClick={() => jumpToSource(src.page, src.paragraph)} 
                          className="bg-red-600 hover:bg-red-500 text-white font-black text-[11px] px-3 py-1.5 rounded-xl shadow-md shadow-red-500/30 transition-all flex items-center gap-1 border border-red-400 active:scale-95 uppercase tracking-wider"
                        >
                          <ExternalLink className="w-3 h-3 stroke-[3]" />
                          <span>Highlight in Source</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 bg-sky-50/80 p-2.5 rounded-xl border border-sky-200 font-mono leading-relaxed italic line-clamp-3">
                        "{src.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {!answer && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-sky-800">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-sky-600 mb-2 shadow-inner">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs md:text-sm font-black text-slate-900 mb-1">Smart Locator Ready</h4>
                  <p className="text-[11px] text-slate-600 max-w-xs mb-3 font-medium">
                    Type a question above to locate the exact paragraph on the Left Screen and explain it simply here!
                  </p>
                  <button
                    onClick={() => {
                      setQuestion('What are the ACID properties in transaction management?');
                    }}
                    className="bg-sky-200 hover:bg-sky-300 text-sky-900 text-[10px] md:text-xs font-black px-3 py-1.5 rounded-xl border border-sky-400 transition-all uppercase tracking-wider"
                  >
                    Try: "What are ACID properties?"
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
