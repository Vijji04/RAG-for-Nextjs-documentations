// Import tokenizer used by OpenAI models.
// This ensures token counting matches how embeddings / LLMs see text.
import { getEncoding } from "js-tiktoken";

// Type describing the final chunk structure stored in the vector DB
import type { DocChunk } from "../types/index.js";

// Metadata shared by every chunk coming from the same document
type ChunkMetadata = {
  title: string; // Document title from front-matter
  description: string; // Document description
  relatedLinks: string[]; // Links referenced in the document
  source: string; // File path of the document
};

// Regex to detect markdown headings at level ## or ###
// Example matches:
// ## Quick start
// ### Installation
// We intentionally ignore deeper headings (# or ####) to keep chunk structure simple.
const HEADING_REGEX = /^(#{2,3})\s+(.+)$/gm;

// Token counter using the OpenAI tokenizer.
// Implemented as a closure so the encoder is initialized only once.
const getTokenCount = (() => {
  let encoder: ReturnType<typeof getEncoding> | null = null;

  return (text: string): number => {
    // Lazy initialization — create tokenizer only the first time it's used
    if (!encoder) encoder = getEncoding("cl100k_base");

    // Return number of tokens in the text
    return encoder.encode(text).length;
  };
})();

// Splits text into chunks that respect a maximum token limit.
// Strategy:
// 1. Try to split by paragraph
// 2. If paragraph is too large → split by sentence
// 3. If sentence is too large → split by words
// This ensures no chunk ever exceeds the embedding token limit.
const splitByTokenLimit = (text: string, limit: number): string[] => {
  // If text already fits within limit, return it as a single chunk
  if (getTokenCount(text) <= limit) return [text];

  const chunks: string[] = [];

  // Split text into paragraphs (keeping separators)
  const paragraphs = text.split(/(\n\n+)/);

  let current = "";
  let currentTokens = 0;

  // Handles extremely large paragraphs that exceed the limit
  const flushOverflow = (overflow: string) => {
    // If overflow now fits, push it as a chunk
    if (getTokenCount(overflow) <= limit) {
      chunks.push(overflow.trim());
      return;
    }

    // Otherwise split into sentences
    const sentences = overflow.split(/(?<=[.!?])\s+/);

    let sub = "";
    let subTokens = 0;

    for (const s of sentences) {
      const sTokens = getTokenCount(s);

      // If sentence fits into current sub-chunk
      if (subTokens + sTokens <= limit) {
        sub += (sub ? " " : "") + s;
        subTokens += sTokens;
      } else {
        // Flush previous chunk
        if (sub) chunks.push(sub.trim());

        // If sentence itself is too large, split by words
        if (sTokens > limit) {
          const words = s.split(/\s+/);

          let wordChunk = "";
          let wordTokens = 0;

          for (const w of words) {
            const wTokens = getTokenCount(w + " ");

            if (wordTokens + wTokens <= limit) {
              wordChunk += (wordChunk ? " " : "") + w;
              wordTokens += wTokens;
            } else {
              if (wordChunk) chunks.push(wordChunk.trim());
              wordChunk = w;
              wordTokens = wTokens;
            }
          }

          if (wordChunk) chunks.push(wordChunk.trim());

          // Reset sentence buffer
          sub = "";
          subTokens = 0;
        } else {
          // Start new sentence chunk
          sub = s;
          subTokens = sTokens;
        }
      }
    }

    // Push final sentence chunk
    if (sub.trim()) chunks.push(sub.trim());
  };

  // Process each paragraph sequentially
  for (const p of paragraphs) {
    const pTokens = getTokenCount(p);

    // If paragraph fits in current chunk, append it
    if (currentTokens + pTokens <= limit) {
      current += p;
      currentTokens += pTokens;
    } else {
      // Flush current chunk
      if (current) chunks.push(current.trim());

      // If paragraph alone exceeds limit, split it further
      if (pTokens > limit) {
        flushOverflow(p);
        current = "";
        currentTokens = 0;
      } else {
        // Start a new chunk with this paragraph
        current = p;
        currentTokens = pTokens;
      }
    }
  }

  // Flush remaining text
  if (current.trim()) chunks.push(current.trim());

  return chunks;
};

// Main chunking function used during ingestion.
// Splits markdown document into semantic chunks based on headings,
// then enforces token limits inside each section.
export const chunkByHeadings = (
  content: string,
  metadata: ChunkMetadata,
  tokenLimit: number,
): DocChunk[] => {
  const trimmed = content.trim();

  if (!trimmed) return [];

  // Intermediate structure storing sections extracted from headings
  const sections: { heading: string; content: string }[] = [];

  // Find all ## and ### headings in the document
  const headingMatches = [...trimmed.matchAll(HEADING_REGEX)];

  // If document has no headings, treat the whole text as one section
  if (headingMatches.length === 0) {
    const subChunks = splitByTokenLimit(trimmed, tokenLimit);

    return subChunks.map((c) => ({
      ...metadata,
      heading: "",
      content: c,
    }));
  }

  let prevEnd = 0;

  // Iterate through headings and extract text between them
  for (let i = 0; i < headingMatches.length; i++) {
    const match = headingMatches[i];

    const start = match.index!; // position where heading begins
    const heading = match[2].trim();

    // Capture text before the first heading (intro section)
    if (start > prevEnd) {
      const introContent = trimmed.slice(prevEnd, start).trim();

      if (introContent) {
        sections.push({ heading: "", content: introContent });
      }
    }

    // Determine where this section ends
    const nextMatch = headingMatches[i + 1];
    const end = nextMatch ? nextMatch.index! : trimmed.length;

    // Extract content under this heading
    const sectionContent = trimmed.slice(start + match[0].length, end).trim();

    sections.push({ heading, content: sectionContent });

    prevEnd = end;
  }

  const chunks: DocChunk[] = [];

  // For each section, enforce token limits
  for (const { heading, content } of sections) {
    const subChunks = splitByTokenLimit(content, tokenLimit);

    for (const c of subChunks) {
      chunks.push({
        ...metadata, // inherit document metadata
        heading, // section heading
        content: c, // chunk content
      });
    }
  }

  return chunks;
};
