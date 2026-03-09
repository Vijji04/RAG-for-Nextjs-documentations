import "dotenv/config";

export const config = {
  docsPath: process.env.DOCS_PATH ?? "./docs",
  chunkTokenLimit: Number(process.env.CHUNK_TOKEN_LIMIT) || 500,
  chromaCollection: process.env.CHROMA_COLLECTION ?? "nextjs-docs",
  chromaUrl: process.env.CHROMA_URL ?? "http://localhost:8000",
  topK: Number(process.env.TOP_K) || 5,
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
} as const;
