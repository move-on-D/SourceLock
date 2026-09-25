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
    const queryVector = await generateEmbedding(question);

    // 2. Search for similar chunks
    const results = await searchSimilar(queryVector, 4, documentId);

    if (!results || results.length === 0) {
      return res.json({
        answer: 'I could not find anything related to this in your uploaded documents.',
        sources: []
      });
    }

    // 3. Build context text
    let contextText = '';
    const sources = results.map((r: any) => {
      contextText += `[Source: ${r.filename}, Page: ${r.page}, Para: ${r.paragraph}]\n${r.text}\n\n`;
      return {
        documentId: r.documentId,
        filename: r.filename,
        page: r.page,
        paragraph: r.paragraph,
        text: r.text,
        score: r.score
      };
    });

    // 4. Build system prompt
    const memoryContext = getAllTimeMemory();
    const systemPrompt = `You are SourceLock, a strict study assistant with ZERO HALLUCINATION policy.
RULES:
- Answer ONLY using the SOURCE CHUNKS provided below.
- Never add information from outside the provided chunks.
- If the answer is not in the chunks, say: "I cannot find the complete answer in your uploaded documents."
- Quote exactly where possible.

${memoryContext}

SOURCE CHUNKS:
${contextText}`;

    const answer = await askAI(systemPrompt, question);
    res.json({ answer, sources });

  } catch (error: any) {
    console.error('AI Ask error:', error);
    res.status(500).json({ error: 'AI request failed: ' + error.message });
  }
});
