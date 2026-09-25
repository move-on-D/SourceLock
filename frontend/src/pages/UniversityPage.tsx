import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  RefreshCw, 
  ExternalLink, 
  Camera, 
  Globe, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export default function UniversityPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUpdates = async () => {
    try {
      const res = await fetch('/api/university/updates');
      const data = await res.json();
      setUpdates(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleCheckNow = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/university/scrape', { method: 'POST' });
      const data = await res.json();
      if (data.error) setError(data.error);
      else fetchUpdates();
    } catch (e: any) {
      setError('Failed to reach scraper server');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/university/updates/${id}/read`, { method: 'POST' });
    fetchUpdates();
  };

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header Banner - Sky Blue Theme */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border-2 border-sky-300 shadow-lg relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 border border-sky-300 text-sky-700">
              <GraduationCap className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Live University Watch</h1>
          </div>
          <p className="text-slate-600 text-sm max-w-xl font-medium">
            Monitors official university websites (e.g. VTU) for circulars, exam date changes, and syllabus updates. Includes full-page screenshot proof.
          </p>
        </div>

        {/* RED Scrape Check Button */}
        <div className="z-10 shrink-0">
          <button
            onClick={handleCheckNow}
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-red-500/30 flex items-center gap-2.5 transition-all text-xs border-2 border-red-400 disabled:opacity-50 active:scale-95 uppercase tracking-wider"
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Scraping Official Site...' : 'Check For Updates Now'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-100 border-2 border-rose-300 text-rose-800 p-4 rounded-2xl text-xs flex items-center gap-2 mb-6 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error} — Please verify your University URL in All-Time Memory settings.</span>
        </div>
      )}

      {/* List of Scraped Updates */}
      <div className="space-y-6">
        {updates.length === 0 ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-sky-300 rounded-3xl bg-white/50 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-sky-600 mb-3 shadow-inner">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">No updates scanned yet</h3>
            <p className="text-xs text-slate-600 max-w-sm mb-4 font-medium">
              Add your university URL in All-Time Memory and click "Check For Updates Now" to run Playwright scraper.
            </p>
          </div>
        ) : (
          updates.map((update) => (
            <div 
              key={update.id} 
              className={`bg-white/90 backdrop-blur-xl rounded-3xl p-6 border-2 transition-all shadow-md ${
                update.isRead 
                  ? 'border-sky-200 opacity-70' 
                  : 'border-sky-300 shadow-sky-400/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-sky-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 font-black">
                      <ShieldCheck className="w-3 h-3" /> Proof Verified
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-bold">
                      {new Date(update.dateFound).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-slate-900">{update.title}</h3>
                </div>

                {/* RED Mark as Read Button */}
                {!update.isRead && (
                  <button
                    onClick={() => handleMarkRead(update.id)}
                    className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl border border-red-400 shadow-md shadow-red-500/30 transition-colors uppercase tracking-wider"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-sky-50 p-4 rounded-2xl border-2 border-sky-200 text-xs text-slate-800 font-mono leading-relaxed max-h-64 overflow-y-auto">
                  {update.content}
                </div>

                {update.screenshotPath && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                      <Camera className="w-3.5 h-3.5 text-sky-600" /> Screenshot Proof
                    </div>
                    <a 
                      href={`/screenshots/${update.screenshotPath}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block group relative overflow-hidden rounded-2xl border-2 border-sky-300 hover:border-sky-500 transition-all shadow-md"
                    >
                      <img 
                        src={`/screenshots/${update.screenshotPath}`} 
                        alt="Playwright Proof" 
                        className="w-full h-44 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-sky-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                        <span className="text-xs font-black text-white flex items-center gap-1 uppercase tracking-wider">
                          View Full Proof Screenshot <ExternalLink className="w-3 h-3 stroke-[3]" />
                        </span>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
