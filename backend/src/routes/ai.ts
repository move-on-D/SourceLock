import { Router } from 'express';
import { queryAll } from '../db/database';
import { askAI } from '../services/aiService';

export const aiRouter = Router();

function getAllTimeMemory(): string {
  try {
    const memories = queryAll('SELECT key, value FROM memory');
    if (!memories || memories.length === 0) return 'No academic memory saved yet.';
    
    let text = '=== LOCKED ACADEMIC MEMORY (Student Profile) ===\n';
    memories.forEach((m: any) => {
      text += `\n[${String(m.key).toUpperCase()}]:\n${m.value}\n`;
    });
    text += '\n================================================\n';
    return text;
  } catch {
    return 'No academic memory saved yet.';
  }
}

// POST conversational chat with full College Academic Memory
aiRouter.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const memoryContext = getAllTimeMemory();
    const systemPrompt = `You are SourceLock, the student's personal, all-knowing College Academic Advisor & Study AI.

YOU HAVE FULL, PERMANENT ACCESS TO THEIR LOCKED ACADEMIC PROFILE:
${memoryContext}

YOUR MISSION & GUIDELINES:
1. COLLEGE TIMETABLE EXPERT: Answer any question about their classes, daily periods, free hours, and lab timings accurately based on their saved timetable.
2. SYLLABUS & EXAM GUIDE: When they ask about a subject, module, or topic, refer to their locked syllabus. Break down complex engineering/college concepts into clear, student-friendly explanations with bullet points and exam tips.
3. SCHEDULE & STUDY STRATEGIST: If they ask when to study or how to prepare for tests, plan realistic daily routines mapping their timetable to their syllabus.
4. If a particular detail (e.g. specific time slot or subject) is not in their saved memory, point it out kindly and recommend they add it to the Academic Memory tab, while still answering helpfully.
5. Tone: Encouraging, sharp, organized, zero fluff. Always format responses cleanly with markdown headings, bold terms, and bullet points.`;

    let fullUserPrompt = message;
    if (Array.isArray(history) && history.length > 0) {
      const pastMessages = history
        .slice(-6)
        .map((h: any) => `${h.role === 'user' ? 'Student' : 'SourceLock'}: ${h.content}`)
        .join('\n');
      fullUserPrompt = `[Recent Conversation Context]\n${pastMessages}\n\nStudent: ${message}`;
    }

    const answer = await askAI(systemPrompt, fullUserPrompt);
    res.json({ answer });

  } catch (error: any) {
    console.error('College AI chat error:', error);
    res.status(500).json({ error: 'AI request failed: ' + error.message });
  }
});

// Legacy ask route fallback
aiRouter.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const memoryContext = getAllTimeMemory();
    const systemPrompt = `You are SourceLock, the student's academic study assistant.
${memoryContext}
Answer the student's question clearly based on their locked academic syllabus and schedule.`;

    const answer = await askAI(systemPrompt, question);
    res.json({ answer, sources: [] });
  } catch (error: any) {
    res.status(500).json({ error: 'AI request failed: ' + error.message });
  }
});
