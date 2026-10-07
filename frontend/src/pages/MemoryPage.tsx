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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { getApiUrl, getFileUrl } from '../lib/api';

interface SectionConfig {
  key: string;
  title: string;
  description: string;
  placeholder: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  rows?: number;
}

export default function MemoryPage() {
  const [memory, setMemory] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      const res = await fetch(getApiUrl('/api/memory'));
      const data = await res.json();
      const memObj: Record<string, string> = {};
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          memObj[item.key] = item.value;
        });
      }
      setMemory(memObj);
    } catch (e) {
      console.error('Error fetching memory:', e);
    }
  };

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      await fetch(getApiUrl('/api/memory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      setMemory(prev => ({ ...prev, [key]: value }));
      setStatusMessage({ 
        type: 'success', 
        text: `Saved "${key.replace('_', ' ').toUpperCase()}" successfully!` 
      });
    } catch (e: any) {
      console.error(e);
      setStatusMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setTimeout(() => setSavingKey(null), 1200);
    }
  };

  const handleFileUpload = async (file: File, section: string) => {
    setUploadingSection(section);
    setStatusMessage({
      type: 'info',
      text: `Uploading & extracting from "${file.name}" for ${section.replace('_', ' ')}...`
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', section);

    try {
      const res = await fetch(getApiUrl('/api/memory/upload'), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      await fetchMemory();

      setStatusMessage({
        type: 'success',
        text: `Successfully imported "${file.name}" into ${section.replace('_', ' ')}!`
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Upload failed: ${err.message || 'File processing error'}`
      });
    } finally {
      setUploadingSection(null);
    }
  };

  const handleRemoveImage = async (imageKey: string) => {
    if (!window.confirm('Remove this attached photo?')) return;
    try {
      await fetch(getApiUrl(`/api/memory/${imageKey}`), { method: 'DELETE' });
      setMemory(prev => {
        const updated = { ...prev };
        delete updated[imageKey];
        return updated;
      });
      setStatusMessage({ type: 'success', text: 'Attached photo removed.' });
    } catch (e) {
      console.error(e);
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

    const vtuExam = `VTU Exam Pattern:
- 5 Modules in Total (100 Marks)
- Each module has 2 full questions with internal choice (20 marks each)
- Passing Marks: 35 in Semester End Exam (SEE), 40 Total (CIE + SEE).`;

    handleSave('university_url', 'https://vtu.ac.in');
    handleSave('course_details', 'VTU B.E Computer Science & Eng, 5th Sem (Scheme 2022).');
    handleSave('syllabus', vtuSyllabus);
    handleSave('timetable', vtuTimetable);
    handleSave('exam_scheme', vtuExam);
  };

  const sections: SectionConfig[] = [
    {
      key: 'course_details',
      title: 'Course, Semester & Scheme',
      description: 'Your branch, semester, regulation scheme, and college details.',
      placeholder: 'e.g. B.Tech Computer Science, 5th Sem, Scheme 2022 (VTU)...',
      icon: Award,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      rows: 2
    },
    {
      key: 'timetable',
      title: 'College Weekly Timetable',
      description: 'Your weekly periods, labs, and free hours (type in or upload a photo of the chart).',
      placeholder: 'Monday: 09:00 AM - 10:00 AM: DBMS | 10:15 AM - 11:15 AM: OS...',
      icon: Calendar,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      rows: 4
    },
    {
      key: 'syllabus',
      title: 'Course Syllabus & Modules',
      description: 'Complete breakdown of units and subjects (upload syllabus PDF or page photo).',
      placeholder: 'Module 1: Relational Model & SQL...\nModule 2: Normalization...',
      icon: BookOpen,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      rows: 6
    },
    {
      key: 'exam_scheme',
      title: 'Exam Pattern & Marks Scheme',
      description: 'Internal tests pattern, semester blueprints, and marks weightage.',
      placeholder: '3 Internals (average of top 2) + 100 Marks Final Exam (5 Modules Choice)...',
      icon: ClipboardList,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      rows: 3
    }
  ];

  return (
    <div className="p-3 sm:p-5 h-full overflow-y-auto max-w-7xl mx-auto w-full space-y-4">
      
      {/* STATUS NOTIFICATION BANNER */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-bold shadow-sm transition-all ${
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

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 p-4 sm:p-5 rounded-2xl border-2 border-sky-300 shadow-md relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-200 border border-sky-300 text-sky-800">
              <BrainCircuit className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Academic Lock</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-full border border-sky-300">
              PDF & Photo Supported
            </span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-medium">
            Lock your complete academic profile. Every section accepts <b>PDFs, Word documents, or photos</b> from your phone camera. SourceLock College AI references this locked memory for every answer.
          </p>
        </div>

        {/* Quick Template Button */}
        <div className="z-10 shrink-0 w-full sm:w-auto">
          <button
            onClick={loadVTUTemplate}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-500/30 transition-all flex items-center justify-center gap-1.5 border border-red-400 active:scale-95 uppercase tracking-wider"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>Load VTU Sample Profile</span>
          </button>
        </div>
      </div>

      {/* University Website Card */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border-2 border-sky-200 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 border border-blue-200">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Official University Website</h3>
              <p className="text-[11px] text-slate-500 font-medium">Used for official scraper proofs and university updates</p>
            </div>
          </div>
          <button
            onClick={() => handleSave('university_url', memory['university_url'] || '')}
            className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 border border-red-400 uppercase tracking-wider active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingKey === 'university_url' ? 'Saved!' : 'Save'}</span>
          </button>
        </div>
        <input
          type="text"
          className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500 font-mono"
          placeholder="e.g. https://vtu.ac.in"
          value={memory['university_url'] || ''}
          onChange={e => setMemory({ ...memory, ['university_url']: e.target.value })}
        />
      </div>

      {/* ======================================================== */}
      {/* MULTI-SECTION ACADEMIC LOCK CARDS (EACH WITH PDF & PHOTO) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const imageKey = `${sec.key}_image`;
          const attachedImage = memory[imageKey];
          const isUploading = uploadingSection === sec.key;
          const isSaving = savingKey === sec.key;

          return (
            <div 
              key={sec.key}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border-2 border-sky-200 space-y-3 shadow-xs hover:border-sky-300 transition-colors"
            >
              {/* Card Header & Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-xl ${sec.iconBg} ${sec.iconColor} border border-sky-200 shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">{sec.title}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{sec.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* UPLOAD PDF / PHOTO BUTTON */}
                  <label className={`cursor-pointer bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-sky-500 shadow-xs active:scale-95 ${
                    isUploading ? 'opacity-70 pointer-events-none' : ''
                  }`}>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
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
                          handleFileUpload(e.target.files[0], sec.key);
                          e.target.value = '';
                        }
                      }} 
                      disabled={isUploading} 
                    />
                  </label>

                  {/* SAVE BUTTON */}
                  <button
                    onClick={() => handleSave(sec.key, memory[sec.key] || '')}
                    className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 border border-red-400 uppercase tracking-wider active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saved!' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* ATTACHED PHOTO THUMBNAIL PREVIEW (If photo exists) */}
              {attachedImage && (
                <div className="p-2.5 bg-sky-50/90 border border-sky-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getFileUrl(`/vault/${attachedImage}`)} 
                      alt={`${sec.title} Preview`} 
                      className="w-14 h-14 object-cover rounded-lg border border-sky-300 shadow-xs bg-white"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-600" /> Attached Photo: {attachedImage}
                      </span>
                      <a 
                        href={getFileUrl(`/vault/${attachedImage}`)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-sky-700 font-bold underline text-[11px] inline-flex items-center gap-1 mt-0.5 hover:text-sky-900"
                      >
                        <span>View Full Screen</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveImage(imageKey)}
                    className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove attached photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* TEXT EDIT AREA */}
              <textarea
                className="w-full bg-sky-50 border-2 border-sky-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500 font-mono leading-relaxed shadow-inner"
                rows={sec.rows || 4}
                placeholder={sec.placeholder}
                value={memory[sec.key] || ''}
                onChange={e => setMemory({ ...memory, [sec.key]: e.target.value })}
              />
            </div>
          );
        })}
      </div>

    </div>
  );
}
