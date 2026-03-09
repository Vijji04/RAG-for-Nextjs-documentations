import { resolve } from "path";
import { loadDocs } from "../services/doc-loader.js";
import { extractFrontMatter } from "../services/front-matter.js";
import { stripMdxComponents } from "../services/mdx-cleanup.js";
import { chunkByHeadings } from "../services/chunker.js";
import { getEmbeddings } from "../services/embeddings.js";
import {
  getVectorStore,
  chunksToDocuments,
} from "../services/chroma.js";
import { config } from "../config/index.js";

export const runIngest = async (): Promise<void> => {
  const docsPath = resolve(process.cwd(), config.docsPath);
  const docs = loadDocs(docsPath);

  const allChunks: import("../types/index.js").DocChunk[] = [];

  for (const doc of docs) {
    const { content, metadata } = extractFrontMatter(doc.rawContent);
    const cleaned = stripMdxComponents(content);
    const chunks = chunkByHeadings(cleaned, {
      title: metadata.title,
      description: metadata.description,
      relatedLinks: metadata.relatedLinks,
      source: doc.filePath,
    }, config.chunkTokenLimit);
    allChunks.push(...chunks);
  }

  const documents = chunksToDocuments(allChunks);
  const embeddings = getEmbeddings(config.openaiApiKey);
  const vectorStore = getVectorStore(
    embeddings,
    config.chromaCollection,
    config.chromaUrl
  );

  const BATCH_SIZE = 100;
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    await vectorStore.addDocuments(batch);
    console.log(`Ingested ${Math.min(i + BATCH_SIZE, documents.length)}/${documents.length} chunks...`);
  }
  console.log(`Done. Ingested ${documents.length} chunks from ${docs.length} documents.`);
};
