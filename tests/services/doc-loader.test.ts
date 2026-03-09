import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { loadDocs } from "../../src/services/doc-loader.js";

describe("loadDocs", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `rag-docs-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true });
    }
  });

  it("finds .md and .mdx files recursively", () => {
    mkdirSync(join(tempDir, "sub"), { recursive: true });
    writeFileSync(join(tempDir, "a.mdx"), "# Doc A");
    writeFileSync(join(tempDir, "sub", "b.md"), "# Doc B");
    const docs = loadDocs(tempDir);
    expect(docs).toHaveLength(2);
    const paths = docs.map((d) => d.filePath).sort();
    expect(paths).toContain(join(tempDir, "a.mdx"));
    expect(paths).toContain(join(tempDir, "sub", "b.md"));
  });

  it("ignores non-markdown files", () => {
    writeFileSync(join(tempDir, "a.mdx"), "# Doc");
    writeFileSync(join(tempDir, "b.txt"), "text");
    writeFileSync(join(tempDir, "c.js"), "code");
    const docs = loadDocs(tempDir);
    expect(docs).toHaveLength(1);
    expect(docs[0].filePath).toContain("a.mdx");
  });

  it("reads file content correctly", () => {
    const content = "---\ntitle: Test\n---\n\nBody";
    writeFileSync(join(tempDir, "test.md"), content);
    const docs = loadDocs(tempDir);
    expect(docs[0].rawContent).toBe(content);
  });

  it("returns empty array for empty directory", () => {
    const docs = loadDocs(tempDir);
    expect(docs).toEqual([]);
  });

  it("handles nested folder structure", () => {
    mkdirSync(join(tempDir, "01-app", "01-getting-started"), {
      recursive: true,
    });
    writeFileSync(join(tempDir, "01-app", "index.mdx"), "# App");
    writeFileSync(
      join(tempDir, "01-app", "01-getting-started", "install.mdx"),
      "# Install"
    );
    const docs = loadDocs(tempDir);
    expect(docs).toHaveLength(2);
  });
});
