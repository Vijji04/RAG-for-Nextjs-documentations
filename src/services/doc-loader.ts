import { readFileSync } from "fs";
import { join } from "path";
import fg from "fast-glob";

export type LoadedDoc = {
  filePath: string;
  rawContent: string;
};

export const loadDocs = (docsPath: string): LoadedDoc[] => {
  const pattern = join(docsPath, "**/*.{md,mdx}");
  const files = fg.sync(pattern, { onlyFiles: true });
  return files.map((filePath) => ({
    filePath,
    rawContent: readFileSync(filePath, "utf-8"),
  }));
};
