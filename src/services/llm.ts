import { ChatOpenAI } from "@langchain/openai";
import type { Document } from "@langchain/core/documents";

const SYSTEM_PROMPT = "You are a helpful documentation assistant.";

const formatContext = (results: Document[]): string =>
  results
    .map((doc, i) => {
      const source = doc.metadata?.source ?? "unknown";
      const title = doc.metadata?.title ?? "";
      const heading = doc.metadata?.heading ?? "";
      const citation = `[${i + 1}] ${title}${heading ? ` > ${heading}` : ""} (${source})`;
      return `${citation}\n${doc.pageContent}`;
    })
    .join("\n\n---\n\n");

const buildUserPrompt = (context: string, query: string): string =>
  `Answer the question using only the context below. and cite the location of the fetched document.

Context:
${context}

Question:
${query}

Answer:
`;

export const generateAnswer = async (
  results: Document[],
  query: string,
  apiKey: string,
  model: string = "gpt-4o-mini",
): Promise<string> => {
  const context = formatContext(results);
  const userPrompt = buildUserPrompt(context, query);

  const llm = new ChatOpenAI({
    model,
    openAIApiKey: apiKey,
    temperature: 0, // avoids hallucinations and gives concise results
  });

  const response = await llm.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ]);

  return typeof response.content === "string"
    ? response.content
    : String(response.content);
};
