import { OpenAIEmbeddings } from "@langchain/openai";

let embeddingsInstance: OpenAIEmbeddings | null = null;

export const getEmbeddings = (apiKey?: string): OpenAIEmbeddings => {
  if (!embeddingsInstance) {
    const key = apiKey ?? process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is required");
    embeddingsInstance = new OpenAIEmbeddings({
      openAIApiKey: key,
      modelName: "text-embedding-3-small",
    });
  }
  return embeddingsInstance;
};
