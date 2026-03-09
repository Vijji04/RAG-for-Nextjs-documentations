import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import type { DocChunk } from "../types/index.js";

const formatPageContent = (chunk: DocChunk): string => {
  const parts: string[] = [];
  if (chunk.title) parts.push(chunk.title);
  if (chunk.description) parts.push(chunk.description);
  if (chunk.heading) parts.push(chunk.heading);
  parts.push(chunk.content);
  return parts.join("\n\n");
};

export const chunksToDocuments = (chunks: DocChunk[]): Document[] =>
  chunks.map((chunk) =>
    new Document({
      pageContent: formatPageContent(chunk),
      metadata: {
        title: chunk.title,
        description: chunk.description,
        relatedLinks: JSON.stringify(chunk.relatedLinks),
        heading: chunk.heading,
        source: chunk.source,
      },
    })
  );

export const getVectorStore = (
  embeddings: EmbeddingsInterface,
  collectionName: string,
  url?: string
): Chroma =>
  new Chroma(embeddings, {
    collectionName,
    url: url ?? "http://localhost:8000",
  });
