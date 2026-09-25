import React, { useState } from 'react';
import { ShieldCheck, User, Upload, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (name: string, avatarUrl: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatarUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin(name.trim(), avatarUrl);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-sky-200 via-sky-300 to-blue-400">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl border-2 border-sky-300 rounded-3xl p-8 shadow-[0_20px_60px_rgba(14,165,233,0.35)] text-slate-800 flex flex-col items-center">
        
        {/* Sky Blue Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-400/50 border-2 border-white mb-4">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">SourceLock</h1>
        <p className="text-xs text-sky-700 font-bold mb-6 uppercase tracking-wider">Personal Study SPACE</p>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          
          {/* Picture Upload Area */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 rounded-full border-4 border-sky-400 bg-sky-100 flex items-center justify-center overflow-hidden shadow-md group cursor-pointer">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-sky-500" />
              )}
              <label className="absolute inset-0 bg-sky-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold">
                <Upload className="w-5 h-5 mb-1 text-white" />
                <span>Change Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="text-[11px] text-slate-600 font-medium text-center">
              Click photo above to add your picture (or place in <code className="text-sky-700 font-bold font-mono">public/avatar.png</code>)
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Your Student Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-white border-2 border-sky-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/30 shadow-inner"
            />
          </div>

          {/* RED Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-red-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-red-500/40 hover:shadow-red-500/60 transition-all flex items-center justify-center gap-2 text-sm border-2 border-red-400 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <span>Enter Workspace</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

      </div>
    </div>
  );
}
