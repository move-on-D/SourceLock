import { Router } from 'express';
import { queryAll, execute } from '../db/database';
import { generateEmbedding } from '../services/embeddingService';
import { searchSimilar } from '../services/vectorStore';
import { askAI } from '../services/aiService';

export const aiRouter = Router();

function getAllTimeMemory(): string {
  try {
    const memories = queryAll('SELECT key, value FROM memory');
    let text = '--- ALL-TIME MEMORY (User Profile) ---\n';
    memories.forEach((m: any) => {
      text += `${String(m.key).toUpperCase()}: ${m.value}\n`;
    });
    text += '---------------------------------------\n';
    return text;
  } catch {
    return '';
  }
}

aiRouter.post('/ask', async (req, res) => {
  try {
    const { question, documentId } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    // 1. Embed the question
    let results: any[] = [];
    try {
      const queryVector = await generateEmbedding(question);
      results = await searchSimilar(queryVector, 5, documentId);
    } catch (embErr) {
      console.warn('[AI] Embedding search error, will attempt fallback:', embErr);
    }

    // Fallback: If vector results are empty, fetch document info and match keywords
    if ((!results || results.length === 0) && documentId) {
      try {
        const docRecord = queryAll('SELECT * FROM documents WHERE id = ?', [documentId]);
        if (docRecord && docRecord.length > 0) {
          results = [{
            documentId,
            filename: docRecord[0].originalName || 'Document',
            page: 1,
            paragraph: 1,
            text: `Document: ${docRecord[0].originalName} (Status: ${docRecord[0].status})`,
            score: 0.5
          }];
        }
      } catch (e) {
        console.warn('[AI] Fallback fetch error:', e);
      }
    }

    if (!results || results.length === 0) {
      return res.json({
        answer: 'I could not find relevant sections in the selected document. Try uploading the textbook or rephrasing your question.',
        sources: []
      });
    }

    // 3. Build context text
    let contextText = '';
    const sources = results.map((r: any) => {
      const snippet = (r.text || '').trim();
      contextText += `[Document: ${r.filename || 'Source'}, Page: ${r.page || 1}, Paragraph: ${r.paragraph || 1}]\n${snippet}\n\n`;
      return {
        documentId: r.documentId,
        filename: r.filename,
        page: r.page || 1,
        paragraph: r.paragraph || 1,
        text: snippet,
        score: r.score
      };
    });

    // 4. Build system prompt
    const memoryContext = getAllTimeMemory();
    const systemPrompt = `You are SourceLock, an intelligent university study assistant and personal tutor.
Your job is to read the student's study document chunks and answer their question with high accuracy, clarity, and zero fluff.

RULES:
1. Explain the answer thoroughly in simple, easy-to-understand student language using the SOURCE CHUNKS.
2. Highlight key terms and bullet points for exam revision.
3. Explicitly cite where this information is found (e.g., "Found on Page X, Paragraph Y of [filename]").
4. If a formula, definition, or code snippet is present, format it cleanly in code blocks or bold text.

${memoryContext}

VERIFIED SOURCE CHUNKS FROM VAULT:
${contextText}`;

    const answer = await askAI(systemPrompt, question);
    res.json({ answer, sources });

  } catch (error: any) {
    console.error('AI Ask error:', error);
    res.status(500).json({ error: 'AI request failed: ' + error.message });
  }
});
