import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  ArrowRight,
  Clock,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { getApiUrl } from '../lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function CollegeAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sourcelock_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to initial
      }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Hello! I am SourceLock, your personal College AI companion.**\n\nI have complete access to your saved **Timetable**, **Syllabus**, and **College Schedule**. You can ask me anything about your college life:\n\n* 📅 *"What class do I have tomorrow morning?"*\n* 🎯 *"Plan my study routine for tonight based on my free hours."*\n* 📚 *"Explain Module 2 from my syllabus in simple words."*\n* ⚡ *"Give me 5 likely university exam questions for DBMS."*\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [memoryStats, setMemoryStats] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user's academic memory for status indicators
  useEffect(() => {
    fetch(getApiUrl('/api/memory'))
      .then(res => res.json())
      .then(data => {
        const memObj: Record<string, string> = {};
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            memObj[item.key] = item.value;
          });
        }
        setMemoryStats(memObj);
      })
      .catch(err => console.error('Error loading memory:', err));
  }, []);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem('sourcelock_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "I received your question but couldn't generate a response. Please check your academic memory.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Connection Notice:** Could not reach the AI service (${error.message || 'Server timeout'}). If the cloud backend is waking up, please retry in a few seconds.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[#*`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      const resetMsg: ChatMessage = {
        id: 'reset',
        role: 'assistant',
        content: `🔄 **Conversation cleared.** Ask me anything about your college timetable, syllabus, or study schedule!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([resetMsg]);
      localStorage.removeItem('sourcelock_chat_history');
    }
  };

  const hasCourse = Boolean(memoryStats['course_details']);
  const hasTimetable = Boolean(memoryStats['timetable']);
  const hasSyllabus = Boolean(memoryStats['syllabus']);

  const quickPrompts = [
    { label: "📅 What's my schedule tomorrow?", text: "Based on my saved college timetable, what classes and labs do I have tomorrow?" },
    { label: "🎯 Plan tonight's study routine", text: "Create an effective 2-hour evening study plan based on today's classes and my syllabus." },
    { label: "📚 Next syllabus topic to study", text: "Check my syllabus and recommend the next core module/topic I should focus on." },
    { label: "⚡ 5 Most likely exam questions", text: "Generate 5 high-priority university exam questions with answers from my syllabus." },
    { label: "💡 Internals preparation strategy", text: "Give me a step-by-step strategy to prepare for my upcoming college internals/midterms." }
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-2 sm:p-4 overflow-hidden">
      
      {/* ======================================================== */}
      {/* ACADEMIC PROFILE STATUS BAR                              */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 border-2 border-sky-300 rounded-2xl p-3 sm:p-4 mb-3 shadow-sm shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-400/30 border border-white">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-none">SourceLock College AI</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-full border border-sky-300">
                Memory Active
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              Always answers using your locked Course, Timetable, and Syllabus.
            </p>
          </div>
        </div>

        {/* Status Indicators & Link to Memory */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${hasCourse ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
              <GraduationCap className="w-3 h-3" /> Course: {hasCourse ? 'Locked' : 'Empty'}
            </span>
            <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${hasTimetable ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
              <Calendar className="w-3 h-3" /> Timetable: {hasTimetable ? 'Locked' : 'Empty'}
            </span>
            <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${hasSyllabus ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
              <BookOpen className="w-3 h-3" /> Syllabus: {hasSyllabus ? 'Locked' : 'Empty'}
            </span>
          </div>

          <Link
            to="/memory"
            className="text-[11px] font-black text-sky-800 hover:text-sky-950 bg-white/90 border border-sky-300 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs hover:bg-white transition-all ml-1"
          >
            <span>Edit Profile</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CHAT MESSAGES STREAM                                     */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-xs ${
                isUser 
                  ? 'bg-slate-900 text-white border-slate-800' 
                  : 'bg-gradient-to-tr from-sky-600 to-blue-500 text-white border-sky-300'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-yellow-300" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm shadow-sm relative group ${
                isUser
                  ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                  : 'bg-white/95 text-slate-900 border-2 border-sky-200 rounded-tl-none font-medium backdrop-blur-md'
              }`}>
                {/* Message Header (for AI) */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-100 text-[10px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1 text-sky-800 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-yellow-500" /> SourceLock Advisor
                    </span>

                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Audio Readout */}
                      <button
                        onClick={() => toggleSpeak(msg.id, msg.content)}
                        className={`p-1 rounded hover:bg-sky-100 transition-colors ${
                          speakingId === msg.id ? 'text-rose-600 animate-pulse' : 'text-slate-600'
                        }`}
                        title={speakingId === msg.id ? 'Stop audio' : 'Listen aloud'}
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-sky-100 text-slate-600 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap leading-relaxed space-y-1.5 font-sans">
                  {msg.content}
                </div>

                {/* Timestamp */}
                <div className={`text-[9px] mt-1.5 font-mono ${isUser ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl shrink-0 bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center border border-sky-300 shadow-xs">
              <Bot className="w-4 h-4 text-yellow-300 animate-spin" />
            </div>
            <div className="bg-white/90 border-2 border-sky-200 rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              <span>Analyzing your timetable & syllabus...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ======================================================== */}
      {/* QUICK PROMPT SHORTCUT CHIPS                              */}
      {/* ======================================================== */}
      <div className="pt-2 pb-1.5 overflow-x-auto no-scrollbar shrink-0 flex items-center gap-1.5">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(qp.text)}
            disabled={loading}
            className="px-2.5 py-1 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold border border-sky-300 hover:border-sky-500 whitespace-nowrap shadow-xs active:scale-95 transition-all shrink-0 disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* INPUT BAR                                                */}
      {/* ======================================================== */}
      <div className="pt-1.5 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="bg-white/95 rounded-2xl border-2 border-sky-300 shadow-md p-1.5 sm:p-2 flex items-center gap-2 backdrop-blur-md focus-within:border-sky-500 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tomorrow's schedule, syllabus concepts, study tips..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
            disabled={loading}
          />

          {messages.length > 2 && (
            <button
              type="button"
              onClick={clearChat}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Clear chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all active:scale-95 uppercase tracking-wider"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>

    </div>
  );
}
