/**
 * Pure JavaScript embedding service using TF-IDF style bag-of-words vectors.
 * No native compilation needed. Works on any machine with Node.js.
 * 
 * For better quality embeddings later, you can swap this for:
 * - Groq/Gemini embedding APIs (once you have an API key)
 * - @xenova/transformers (if you have a good CPU/GPU)
 */

const VECTOR_DIM = 384; // Simulated dimension (matches common embedding models)

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function normalize(vec: number[]): number[] {
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return vec;
  return vec.map(v => v / magnitude);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const tokens = tokenize(text);
  const vector = new Array(VECTOR_DIM).fill(0);

  // Create a sparse vector using hashing trick (like HashingVectorizer)
  for (const token of tokens) {
    const idx = hashCode(token) % VECTOR_DIM;
    vector[idx] += 1;
  }

  // TF normalization
  if (tokens.length > 0) {
    for (let i = 0; i < vector.length; i++) {
      if (vector[i] > 0) {
        vector[i] = 1 + Math.log(vector[i]);
      }
    }
  }

  return normalize(vector);
}
