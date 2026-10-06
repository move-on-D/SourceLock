import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Save, 
  Globe, 
  BookOpen, 
  Calendar, 
  Award, 
  Zap, 
  Info,
  Upload,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getApiUrl, getFileUrl } from '../lib/api';

export default function MemoryPage() {
  const [memory, setMemory] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false);
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch(getApiUrl('/api/memory'))
      .then(res => res.json())
      .then(data => {
        const memObj: Record<string, string> = {};
        data.forEach((item: any) => {
          memObj[item.key] = item.value;
        });
        setMemory(memObj);
      })
      .catch(e => console.error(e));
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      await fetch(getApiUrl('/api/memory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      setMemory(prev => ({ ...prev, [key]: value }));
      setStatusMessage({ type: 'success', text: `Saved ${key.replace('_', ' ')} successfully!` });
    } catch (e: any) {
      console.error(e);
      setStatusMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setTimeout(() => setSaving(null), 1200);
    }
  };

  const handleFileUpload = async (file: File, targetKey: 'syllabus' | 'timetable') => {
    const isSyllabus = targetKey === 'syllabus';
    if (isSyllabus) setUploadingSyllabus(true);
    else setUploadingTimetable(true);

    setStatusMessage({
      type: 'info',
      text: `Uploading & extracting text from "${file.name}"...`
    });

    const formData = new FormData();
    formData.append('syllabus', file);

    try {
      const res = await fetch(getApiUrl('/api/memory/upload'), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();
      
      // Refresh memory
      const memRes = await fetch(getApiUrl('/api/memory'));
      const memData = await memRes.json();
      const memObj: Record<string, string> = {};
      memData.forEach((item: any) => {
        memObj[item.key] = item.value;
      });
      setMemory(memObj);

      setStatusMessage({
        type: 'success',
        text: `Successfully imported "${file.name}" into your All-Time Memory!`
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Failed to upload: ${err.message || 'File error'}`
      });
    } finally {
      if (isSyllabus) setUploadingSyllabus(false);
      else setUploadingTimetable(false);
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
    <div className="p-4 md:p-6 h-full overflow-y-auto max-w-7xl mx-auto w-full space-y-4">
      
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

      {/* Header Banner - Sky Blue Theme */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 p-5 rounded-2xl border-2 border-sky-300 shadow-md relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-200 border border-sky-300 text-sky-800">
              <BrainCircuit className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900">All-Time Memory</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-full border border-sky-300">
              Permanent Context
            </span>
          </div>
          <p className="text-slate-600 text-xs md:text-sm max-w-xl font-medium">
            Upload your syllabus PDF or photo, college timetable, and rules. SourceLock embeds this background into every AI answer.
          </p>
        </div>

        {/* RED Quick Template Load Button */}
        <div className="z-10 shrink-0 w-full sm:w-auto">
          <button
            onClick={loadVTUTemplate}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-500/30 transition-all flex items-center justify-center gap-1.5 border border-red-400 active:scale-95 uppercase tracking-wider"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>Load VTU Sample Template</span>
          </button>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* University URL */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 border-sky-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 border border-blue-200">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="font-black text-sm text-slate-900">Official University Website</h3>
            </div>
            {/* RED Save Button */}
            <button
              onClick={() => handleSave('university_url', memory['university_url'] || '')}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 border border-red-400 uppercase tracking-wider active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'university_url' ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
          <input
            type="text"
            className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500 font-mono"
            placeholder="e.g. https://vtu.ac.in"
            value={memory['university_url'] || ''}
            onChange={e => setMemory({ ...memory, ['university_url']: e.target.value })}
          />
          <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <Info className="w-3 h-3 text-sky-600 shrink-0" /> Checked by University Watch scraper for official circulars.
          </p>
        </div>

        {/* Course Details */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 border-sky-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600 border border-purple-200">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-black text-sm text-slate-900">Course, Semester & Scheme</h3>
            </div>
            {/* RED Save Button */}
            <button
              onClick={() => handleSave('course_details', memory['course_details'] || '')}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 border border-red-400 uppercase tracking-wider active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'course_details' ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
          <textarea
            className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
            rows={2}
            placeholder="e.g. B.Tech Computer Science, Semester 5, VTU Scheme (5 Modules, 100 Marks)..."
            value={memory['course_details'] || ''}
            onChange={e => setMemory({ ...memory, ['course_details']: e.target.value })}
          />
        </div>

        {/* ======================================================== */}
        {/* SYLLABUS CARD WITH PDF / PHOTO / DOC UPLOAD             */}
        {/* ======================================================== */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 border-sky-200 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Course Syllabus (Text, PDF, or Photo)</h3>
                <p className="text-[11px] text-slate-500 font-medium">Add text directly or upload your syllabus document/image</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* UPLOAD PDF / PHOTO BUTTON */}
              <label className={`cursor-pointer bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-sky-500 shadow-xs active:scale-95 ${
                uploadingSyllabus ? 'opacity-70 pointer-events-none' : ''
              }`}>
                {uploadingSyllabus ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload PDF / Photo</span>
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], 'syllabus');
                      e.target.value = '';
                    }
                  }} 
                  disabled={uploadingSyllabus} 
                />
              </label>

              {/* SAVE BUTTON */}
              <button
                onClick={() => handleSave('syllabus', memory['syllabus'] || '')}
                className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 border border-red-400 uppercase tracking-wider active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving === 'syllabus' ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Syllabus Image Thumbnail Preview if attached */}
          {memory['syllabus_image'] && (
            <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-3">
              <img 
                src={getFileUrl(`/vault/${memory['syllabus_image']}`)} 
                alt="Syllabus Preview" 
                className="w-16 h-16 object-cover rounded-lg border border-sky-300 shadow-xs"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-600" /> Syllabus Photo Attached
                </span>
                <a 
                  href={getFileUrl(`/vault/${memory['syllabus_image']}`)} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sky-700 font-semibold underline text-[11px] block mt-0.5"
                >
                  View Full Image
                </a>
              </div>
            </div>
          )}

          <textarea
            className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
            rows={7}
            placeholder="Module 1: Topics... Module 2: Topics... (or click Upload PDF / Photo above to auto-fill)"
            value={memory['syllabus'] || ''}
            onChange={e => setMemory({ ...memory, ['syllabus']: e.target.value })}
          />
        </div>

        {/* ======================================================== */}
        {/* TIMETABLE CARD                                           */}
        {/* ======================================================== */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 border-sky-200 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 border border-amber-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">College Weekly Timetable</h3>
                <p className="text-[11px] text-slate-500 font-medium">Mapped daily to your uploaded textbooks by the Dynamic Study Planner</p>
              </div>
            </div>

            <button
              onClick={() => handleSave('timetable', memory['timetable'] || '')}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 border border-red-400 uppercase tracking-wider active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'timetable' ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
          <textarea
            className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
            rows={5}
            placeholder="Monday: 09:00 AM - 10:00 AM: Subject 1 | 10:15 AM - 11:15 AM: Subject 2..."
            value={memory['timetable'] || ''}
            onChange={e => setMemory({ ...memory, ['timetable']: e.target.value })}
          />
        </div>

      </div>
    </div>
  );
}
