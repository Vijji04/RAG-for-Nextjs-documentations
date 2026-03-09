import { getEmbeddings } from "../services/embeddings.js";
import { getVectorStore } from "../services/chroma.js";
import { generateAnswer } from "../services/llm.js";
import { config } from "../config/index.js";

export const runRetrieve = async (query: string): Promise<void> => {
  const embeddings = getEmbeddings(config.openaiApiKey);
  const vectorStore = getVectorStore(
    embeddings,
    config.chromaCollection,
    config.chromaUrl
  );

  const results = await vectorStore.similaritySearch(query, config.topK);

  if (results.length === 0) {
    console.log(`\nQuery: "${query}"\n`);
    console.log("No relevant documents found.");
    return;
  }

  const answer = await generateAnswer(
    results,
    query,
    config.openaiApiKey,
    config.openaiModel
  );

  console.log(`\nQuery: "${query}"\n`);
  console.log("Answer:\n");
  console.log(answer);
  console.log("\n--- Sources ---");
  results.forEach((doc, i) => {
    const source = doc.metadata?.source ?? "unknown";
    const title = doc.metadata?.title ?? "";
    const heading = doc.metadata?.heading ?? "";
    console.log(`[${i + 1}] ${title}${heading ? ` > ${heading}` : ""} (${source})`);
  });
}
