import { describe, it, expect } from "vitest";
import { extractFrontMatter } from "../../src/services/front-matter.js";

describe("extractFrontMatter", () => {
  it("extracts title and description", () => {
    const input = `---
title: Font Optimization
description: Learn how to optimize fonts in Next.js
---

Body content here.`;
    const result = extractFrontMatter(input);
    expect(result.metadata.title).toBe("Font Optimization");
    expect(result.metadata.description).toBe("Learn how to optimize fonts in Next.js");
    expect(result.content).toContain("Body content here");
  });

  it("extracts related links from related.links", () => {
    const input = `---
title: Layouts and Pages
description: Learn how to create layouts.
related:
  title: API Reference
  description: Learn more
  links:
    - app/getting-started/linking-and-navigating
    - app/api-reference/file-conventions/layout
---

Content`;
    const result = extractFrontMatter(input);
    expect(result.metadata.relatedLinks).toEqual([
      "app/getting-started/linking-and-navigating",
      "app/api-reference/file-conventions/layout",
    ]);
  });

  it("returns empty relatedLinks when related is absent", () => {
    const input = `---
title: Getting Started
description: Welcome
---

Welcome text.`;
    const result = extractFrontMatter(input);
    expect(result.metadata.relatedLinks).toEqual([]);
  });

  it("returns empty relatedLinks when related has no links array", () => {
    const input = `---
title: Test
related:
  title: Other
---
Content`;
    const result = extractFrontMatter(input);
    expect(result.metadata.relatedLinks).toEqual([]);
  });

  it("handles missing title and description with empty strings", () => {
    const input = `---
nav_title: Sidebar Label
---

Content only.`;
    const result = extractFrontMatter(input);
    expect(result.metadata.title).toBe("");
    expect(result.metadata.description).toBe("");
    expect(result.content).toBe("Content only.");
  });

  it("returns full content without front-matter when no ---", () => {
    const input = `# No front matter
Just markdown.`;
    const result = extractFrontMatter(input);
    expect(result.metadata.title).toBe("");
    expect(result.metadata.description).toBe("");
    expect(result.metadata.relatedLinks).toEqual([]);
    expect(result.content).toBe(input);
  });
});
