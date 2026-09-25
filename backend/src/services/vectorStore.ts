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
  topK: number = 4,
  documentId?: string
): Promise<any[]> {
  const idx = await getVectorIndex();
  const results = await idx.queryItems(queryVector, topK);

  // Filter by documentId if provided
  const filtered = documentId
    ? results.filter(r => r.item.metadata.documentId === documentId)
    : results;

  return filtered.map(r => ({
    ...r.item.metadata,
    score: r.score
  }));
}
