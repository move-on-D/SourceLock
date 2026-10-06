import { LocalIndex } from 'vectra';
import path from 'path';

const indexPath = path.join(__dirname, '..', '..', 'vectra_index');

let index: LocalIndex;

export async function getVectorIndex(): Promise<LocalIndex> {
  if (!index) {
    index = new LocalIndex(indexPath);
    if (!(await index.isIndexCreated())) {
      await index.createIndex();
    }
  }
  return index;
}

export async function addDocumentChunk(chunk: {
  id: string;
  documentId: string;
  filename: string;
  text: string;
  page: number;
  paragraph: number;
  vector: number[];
}) {
  const idx = await getVectorIndex();
  await idx.upsertItem({
    id: chunk.id,
    vector: chunk.vector,
    metadata: {
      documentId: chunk.documentId,
      filename: chunk.filename,
      text: chunk.text,
      page: chunk.page,
      paragraph: chunk.paragraph
    }
  });
}

export async function searchSimilar(
  queryVector: number[],
  topK: number = 5,
  documentId?: string
): Promise<any[]> {
  const idx = await getVectorIndex();
  
  // Query a larger candidate pool if filtering by a specific document
  const fetchCount = documentId ? Math.max(topK * 5, 25) : topK;
  const results = await idx.queryItems(queryVector, fetchCount);

  let filtered = results;
  if (documentId) {
    const docMatches = results.filter(r => r.item.metadata && r.item.metadata.documentId === documentId);
    // If we found matches in the target document, use them; otherwise fallback to top global results
    if (docMatches.length > 0) {
      filtered = docMatches.slice(0, topK);
    } else {
      filtered = results.slice(0, topK);
    }
  } else {
    filtered = results.slice(0, topK);
  }

  return filtered.map(r => ({
    ...r.item.metadata,
    score: r.score
  }));
}
