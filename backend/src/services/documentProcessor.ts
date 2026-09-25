import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { generateEmbedding } from './embeddingService';
import { addDocumentChunk } from './vectorStore';

export async function processDocument(
  filePath: string,
  documentId: string,
  originalName: string,
  mimeType: string
) {
  let rawText = '';

  try {
    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      rawText = data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filePath.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value;
    } else if (mimeType === 'text/plain' || filePath.endsWith('.txt')) {
      rawText = fs.readFileSync(filePath, 'utf-8');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('No text extracted from document');
    }

    // Split into paragraphs
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 30);

    let chunksCount = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const text = paragraphs[i].slice(0, 1500);
      const vector = await generateEmbedding(text);

      await addDocumentChunk({
        id: uuidv4(),
        documentId,
        filename: originalName,
        text,
        page: Math.floor(i / 5) + 1, // Estimate: ~5 paragraphs per page
        paragraph: i + 1,
        vector
      });

      chunksCount++;
    }

    console.log(`[Processor] ${originalName}: ${chunksCount} chunks indexed`);
    return { success: true, chunksCount };

  } catch (error) {
    console.error(`[Processor] Error processing ${originalName}:`, error);
    throw error;
  }
}
