import { describe, it, expect } from "vitest";
import { chunkByHeadings } from "../../src/services/chunker.js";

describe("chunkByHeadings", () => {
  const baseMetadata = {
    title: "Font Optimization",
    description: "Learn how to optimize fonts",
    relatedLinks: ["/docs/font"],
    source: "docs/01-app/13-fonts.mdx",
  };

  it("splits content by ## headings", () => {
    const content = `Intro paragraph.

## Google fonts

Google fonts section content.

## Local fonts

Local fonts section content.`;
    const chunks = chunkByHeadings(content, baseMetadata, 500);
    expect(chunks).toHaveLength(3);
    expect(chunks[0].heading).toBe("");
    expect(chunks[0].content).toContain("Intro paragraph");
    expect(chunks[1].heading).toBe("Google fonts");
    expect(chunks[1].content).toContain("Google fonts section content");
    expect(chunks[2].heading).toBe("Local fonts");
    expect(chunks[2].content).toContain("Local fonts section content");
  });

  it("splits content by ### headings", () => {
    const content = `## Main section

Main content.

### Subsection A

Sub A content.

### Subsection B

Sub B content.`;
    const chunks = chunkByHeadings(content, baseMetadata, 500);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    const headings = chunks.map((c) => c.heading);
    expect(headings).toContain("Main section");
    expect(headings).toContain("Subsection A");
    expect(headings).toContain("Subsection B");
  });

  it("enriches each chunk with metadata", () => {
    const content = `## Section

Section content.`;
    const chunks = chunkByHeadings(content, baseMetadata, 500);
    expect(chunks[0].title).toBe(baseMetadata.title);
    expect(chunks[0].description).toBe(baseMetadata.description);
    expect(chunks[0].relatedLinks).toEqual(baseMetadata.relatedLinks);
    expect(chunks[0].source).toBe(baseMetadata.source);
  });

  it("splits oversized sections at 500 tokens", () => {
    const longContent = "word ".repeat(600);
    const content = `## Big section

${longContent}`;
    const chunks = chunkByHeadings(content, baseMetadata, 500);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("handles content with no headings", () => {
    const content = `Just a single paragraph of content.`;
    const chunks = chunkByHeadings(content, baseMetadata, 500);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].heading).toBe("");
    expect(chunks[0].content).toBe(content);
  });

  it("handles empty content", () => {
    const chunks = chunkByHeadings("", baseMetadata, 500);
    expect(chunks).toHaveLength(0);
  });
});
