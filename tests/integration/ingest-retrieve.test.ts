import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { loadDocs } from "../../src/services/doc-loader.js";
import { extractFrontMatter } from "../../src/services/front-matter.js";
import { stripMdxComponents } from "../../src/services/mdx-cleanup.js";
import { chunkByHeadings } from "../../src/services/chunker.js";
import { chunksToDocuments } from "../../src/services/chroma.js";

describe("ingest pipeline (unit)", () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = join(tmpdir(), `rag-ingest-test-${Date.now()}`);
    mkdirSync(join(tempDir, "01-app"), { recursive: true });
    writeFileSync(
      join(tempDir, "01-app", "fonts.mdx"),
      `---
title: Font Optimization
description: Learn how to optimize fonts in Next.js
related:
  links:
    - /docs/font
---

Intro text.

<AppOnly>App-only content</AppOnly>

## Google fonts

Google fonts section.

## Local fonts

Local fonts section.`
    );
  });

  afterAll(() => {
    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true });
  });

  it("loads, extracts, cleans, chunks, and converts to documents", () => {
    const docs = loadDocs(tempDir);
    expect(docs).toHaveLength(1);

    const { content, metadata } = extractFrontMatter(docs[0].rawContent);
    expect(metadata.title).toBe("Font Optimization");
    expect(metadata.relatedLinks).toContain("/docs/font");

    const cleaned = stripMdxComponents(content);
    expect(cleaned).not.toContain("App-only content");

    const chunks = chunkByHeadings(cleaned, {
      title: metadata.title,
      description: metadata.description,
      relatedLinks: metadata.relatedLinks,
      source: docs[0].filePath,
    }, 500);

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    const headings = chunks.map((c) => c.heading);
    expect(headings).toContain("Google fonts");
    expect(headings).toContain("Local fonts");

    const documents = chunksToDocuments(chunks);
    expect(documents).toHaveLength(chunks.length);
    expect(documents[0].pageContent).toContain("Font Optimization");
    expect(documents[0].metadata.title).toBe("Font Optimization");
  });
});
