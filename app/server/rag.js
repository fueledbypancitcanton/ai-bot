import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, "docs");

// Human-friendly titles for each source file, shown to the model and the user.
const TITLES = {
  "multi-functional-printers.txt": "Xerox Multifunction Printers — User Guide",
  "xerox-smart-start.txt": "Xerox Smart Start — Customer Tip (v4.1)",
  "xerox-b305-b315-user-guide.txt": "Xerox B305/B315 Multifunction Printer — User Guide",
};

const CHUNK_SIZE = 1200; // characters per chunk
const CHUNK_OVERLAP = 200; // characters shared between neighbouring chunks

// Words too common to be useful for scoring.
const STOP_WORDS = new Set(
  ("a an the and or but of to in on at for with from by is are was were be been being this that these " +
    "those it its as how do does can could should would will my your you i we they he she them what " +
    "which who when where why your yours me our").split(" ")
);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/** Load every .txt file in docs/ and split into overlapping chunks. */
function buildChunks() {
  const chunks = [];
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".txt"))
    .sort();

  for (const file of files) {
    const title = TITLES[file] || file;
    const raw = fs
      .readFileSync(path.join(DOCS_DIR, file), "utf8")
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n");

    for (let start = 0; start < raw.length; start += CHUNK_SIZE - CHUNK_OVERLAP) {
      const text = raw.slice(start, start + CHUNK_SIZE).trim();
      if (text.length < 40) continue;
      chunks.push({ source: title, text, tokens: tokenize(text) });
    }
  }
  return chunks;
}

const CHUNKS = buildChunks();
console.log(`[rag] indexed ${CHUNKS.length} chunks from ${Object.keys(TITLES).length} documents`);

/**
 * Score every chunk against the query by term overlap and return the best ones.
 * Returns [] when nothing in the docs is even loosely relevant.
 */
export function retrieve(query, topK = 6) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const queryCount = new Map();
  for (const t of queryTokens) queryCount.set(t, (queryCount.get(t) || 0) + 1);

  const scored = CHUNKS.map((chunk) => {
    const chunkCount = new Map();
    for (const t of chunk.tokens) chunkCount.set(t, (chunkCount.get(t) || 0) + 1);

    let score = 0;
    let matchedTerms = 0;
    for (const [term] of queryCount) {
      const inChunk = chunkCount.get(term) || 0;
      if (inChunk > 0) {
        matchedTerms += 1;
        // Reward term frequency but dampen long chunks.
        score += inChunk / Math.sqrt(chunk.tokens.length);
      }
    }
    // Bonus for covering more distinct query terms.
    score *= 1 + matchedTerms / queryCount.size;
    return { ...chunk, score, matchedTerms };
  });

  const distinctQueryTerms = queryCount.size;
  // Relevance gate: a passage must match 2+ distinct query terms, unless the
  // question itself is only 1-2 words (then a single strong match is enough).
  // This makes long off-topic questions ("who won the world cup in 2018?")
  // refuse instantly instead of latching onto one incidental word.
  const isRelevant = (c) =>
    c.matchedTerms >= 2 || (distinctQueryTerms <= 2 && c.matchedTerms >= 1);

  return scored
    .filter(isRelevant)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function documentTitles() {
  return Object.values(TITLES);
}
