import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Save, 
  Globe, 
  BookOpen, 
  Calendar, 
  Award, 
  Zap, 
  Info 
} from 'lucide-react';

export default function MemoryPage() {
  const [memory, setMemory] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/memory')
      .then(res => res.json())
      .then(data => {
        const memObj: Record<string, string> = {};
        data.forEach((item: any) => {
          memObj[item.key] = item.value;
        });
        setMemory(memObj);
      });
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      setMemory(prev => ({ ...prev, [key]: value }));
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSaving(null), 1200);
    }
  };

  const loadVTUTemplate = () => {
    const vtuSyllabus = `VTU B.E Computer Science & Engineering - Semester 4 / 5:
Module 1: Database Management Systems (DBMS) - Relational Model, SQL queries, Normalization (1NF, 2NF, 3NF, BCNF), ER Diagrams.
Module 2: Operating Systems (OS) - Process Synchronization, Deadlocks, CPU Scheduling, Virtual Memory, Page Replacement.
Module 3: Computer Networks (CN) - OSI Model, TCP/IP, Routing Algorithms, IP Addressing, Congestion Control.
Module 4: Design & Analysis of Algorithms (DAA) - Asymptotic Notations, Divide & Conquer, Dynamic Programming, Greedy Approach.
Module 5: Software Engineering (SE) - Agile Methodology, Software Testing, Requirements Engineering.`;

    const vtuTimetable = `Monday: 09:00 AM - 10:00 AM: DBMS | 10:15 AM - 11:15 AM: OS | 02:00 PM - 04:00 PM: DBMS Lab
Tuesday: 09:00 AM - 10:00 AM: CN | 10:15 AM - 11:15 AM: DAA | 02:00 PM - 04:00 PM: DAA Lab
Wednesday: 09:00 AM - 10:00 AM: OS | 10:15 AM - 11:15 AM: DBMS | 02:00 PM - 04:00 PM: Self Study
Thursday: 09:00 AM - 10:00 AM: DAA | 10:15 AM - 11:15 AM: CN | 02:00 PM - 04:00 PM: SE
Friday: 09:00 AM - 10:00 AM: SE | 10:15 AM - 11:15 AM: DAA | 02:00 PM - 04:00 PM: Revision`;

    handleSave('university_url', 'https://vtu.ac.in');
    handleSave('course_details', 'VTU B.E Computer Science & Eng, 5th Sem. Exam Pattern: 5 Modules, 100 Marks Total (20 Marks/Module).');
    handleSave('syllabus', vtuSyllabus);
    handleSave('timetable', vtuTimetable);
  };

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header Banner - Sky Blue Theme */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border-2 border-sky-300 shadow-lg relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 border border-sky-300 text-sky-700">
              <BrainCircuit className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">All-Time Memory</h1>
          </div>
          <p className="text-slate-600 text-sm max-w-xl font-medium">
            SourceLock never forgets your background. Store your syllabus, college timetable, and university rules here — they are pre-loaded into every AI prompt.
          </p>
        </div>

        {/* RED Quick Template Load Button */}
        <div className="z-10 shrink-0">
          <button
            onClick={loadVTUTemplate}
            className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-lg shadow-red-500/30 transition-all flex items-center gap-2 border-2 border-red-400 active:scale-95 uppercase tracking-wider"
          >
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span>Load VTU Sample Template</span>
          </button>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* University URL */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border-2 border-sky-200 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-600 border border-blue-200">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="font-black text-sm text-slate-900">Official University Website</h3>
            </div>
            {/* RED Save Button */}
            <button
              onClick={() => handleSave('university_url', memory['university_url'] || '')}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-red-500/30 transition-all flex items-center gap-1.5 border border-red-400 uppercase tracking-wider"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'university_url' ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
          <input
            type="text"
            className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500 font-mono"
            placeholder="e.g. https://vtu.ac.in"
            value={memory['university_url'] || ''}
            onChange={e => setMemory({ ...memory, ['university_url']: e.target.value })}
          />
          <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <Info className="w-3 h-3 text-sky-600" /> SourceLock live scraper checks this site for circulars & exam dates.
          </p>
        </div>

        {/* Course Details */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border-2 border-sky-200 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-600 border border-purple-200">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-black text-sm text-slate-900">Course, Semester & Exam Pattern</h3>
            </div>
            {/* RED Save Button */}
            <button
              onClick={() => handleSave('course_details', memory['course_details'] || '')}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-red-500/30 transition-all flex items-center gap-1.5 border border-red-400 uppercase tracking-wider"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'course_details' ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
          <textarea
            className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
            rows={3}
            placeholder="e.g. B.Tech Computer Science, Semester 5, VTU Scheme..."
            value={memory['course_details'] || ''}
            onChange={e => setMemory({ ...memory, ['course_details']: e.target.value })}
          />
        </div>

        {/* Syllabus */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl p-6 border-2 border-sky-200 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Full Course Syllabus</h3>
                <p className="text-[11px] text-slate-500 font-medium">Units, modules, and key topics for all your subjects</p>
              </div>
            </div>
            {/* RED Save Button */}
            <button
              onClick={() => handleSave('syllabus', memory['syllabus'] || '')}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-red-500/30 transition-all flex items-center gap-1.5 border border-red-400 uppercase tracking-wider"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'syllabus' ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
          <textarea
            className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-3.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
            rows={8}
            placeholder="Paste your syllabus here..."
            value={memory['syllabus'] || ''}
            onChange={e => setMemory({ ...memory, ['syllabus']: e.target.value })}
          />
        </div>

        {/* Timetable */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl p-6 border-2 border-sky-200 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">College Timetable</h3>
                <p className="text-[11px] text-slate-500 font-medium">Weekly schedule used by the Study Planner</p>
              </div>
            </div>
            {/* RED Save Button */}
            <button
              onClick={() => handleSave('timetable', memory['timetable'] || '')}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-red-500/30 transition-all flex items-center gap-1.5 border border-red-400 uppercase tracking-wider"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'timetable' ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
          <textarea
            className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-3.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
            rows={6}
            placeholder="Monday: 9AM - DBMS, 10AM - OS..."
            value={memory['timetable'] || ''}
            onChange={e => setMemory({ ...memory, ['timetable']: e.target.value })}
          />
        </div>

      </div>
    </div>
  );
}
