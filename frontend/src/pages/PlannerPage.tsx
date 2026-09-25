import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, 
  Clock, 
  BookOpen, 
  Flame, 
  Check 
} from 'lucide-react';

export default function PlannerPage() {
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch('/api/planner')
      .then(res => res.json())
      .then(data => {
        setPlan(data);
        setLoading(false);
      });
  }, []);

  const toggleComplete = (idx: number) => {
    setCompleted(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header Banner - Sky Blue Theme */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border-2 border-sky-300 shadow-lg relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 border border-sky-300 text-sky-700">
              <CalendarRange className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Dynamic Study Planner</h1>
          </div>
          <p className="text-slate-600 text-sm max-w-xl font-medium">
            AI-driven daily study routine calculated from your college timetable, syllabus in All-Time Memory, and vault documents.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white border-2 border-sky-300 text-xs font-mono font-black text-slate-900 flex items-center gap-2 shadow-sm">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>Target: 2 Hours Daily</span>
          </div>
        </div>
      </div>

      {/* Planner Schedule List */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-sky-700 gap-2 font-bold">
          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span>Generating study schedule...</span>
        </div>
      ) : (
        <div className="grid gap-4 max-w-4xl">
          {plan.map((item, i) => {
            const isDone = completed[i];
            return (
              <div 
                key={i} 
                className={`bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md ${
                  isDone 
                    ? 'border-emerald-300 opacity-60 bg-emerald-50/50' 
                    : 'border-sky-200 hover:border-sky-400'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-32 shrink-0 border-r-2 border-sky-200 pr-4">
                    <div className="font-black text-sm text-sky-800 font-mono uppercase">{item.day}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3 text-sky-600" /> {item.time}
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-black text-base text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {item.task}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-mono font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                      Suggested Pages: <span className="text-sky-900 font-black">{item.pages}</span>
                    </p>
                  </div>
                </div>

                {/* RED Mark Done Button */}
                <div className="shrink-0 self-end md:self-center">
                  <button
                    onClick={() => toggleComplete(i)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border-2 uppercase tracking-wider ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                        : 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <span>Mark Done</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
