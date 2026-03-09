import matter from "gray-matter";
import type { DocFrontMatter } from "../types/index.js";

export type ExtractedFrontMatter = {
  content: string;
  metadata: {
    title: string;
    description: string;
    relatedLinks: string[];
  };
};

export const extractFrontMatter = (rawContent: string): ExtractedFrontMatter => {
  const { data, content } = matter(rawContent);
  const frontMatter = data as DocFrontMatter;

  const title = typeof frontMatter?.title === "string" ? frontMatter.title : "";
  const description =
    typeof frontMatter?.description === "string" ? frontMatter.description : "";
  const relatedLinks = Array.isArray(frontMatter?.related?.links)
    ? frontMatter.related.links
    : [];

  return {
    content: content.trim(),
    metadata: { title, description, relatedLinks },
  };
};
