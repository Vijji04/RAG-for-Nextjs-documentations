import { describe, it, expect } from "vitest";
import { stripMdxComponents } from "../../src/services/mdx-cleanup.js";

describe("stripMdxComponents", () => {
  it("strips self-closing Image component", () => {
    const input = `Text before <Image alt="test" srcLight="/a.png" srcDark="/b.png" width="100" height="50" /> text after`;
    expect(stripMdxComponents(input)).toBe("Text before  text after");
  });

  it("strips self-closing Check component with props", () => {
    const input = `Feature <Check size={18} /> supported`;
    expect(stripMdxComponents(input)).toBe("Feature  supported");
  });

  it("strips self-closing Cross component", () => {
    const input = `Not supported <Cross size={18} /> here`;
    expect(stripMdxComponents(input)).toBe("Not supported  here");
  });

  it("strips block AppOnly component and its content", () => {
    const input = `Before
<AppOnly>
Content only for App Router
</AppOnly>
After`;
    expect(stripMdxComponents(input)).toContain("Before");
    expect(stripMdxComponents(input)).not.toContain("Content only for App Router");
    expect(stripMdxComponents(input)).toContain("After");
  });

  it("strips block PagesOnly component and its content", () => {
    const input = `Before
<PagesOnly>
Content for Pages Router
</PagesOnly>
After`;
    expect(stripMdxComponents(input)).not.toContain("Content for Pages Router");
    expect(stripMdxComponents(input)).toContain("Before");
    expect(stripMdxComponents(input)).toContain("After");
  });

  it("strips block Tabs component and its content", () => {
    const input = `Before
<Tabs>
  <Tab>Tab content</Tab>
</Tabs>
After`;
    expect(stripMdxComponents(input)).not.toContain("Tab content");
    expect(stripMdxComponents(input)).toContain("Before");
    expect(stripMdxComponents(input)).toContain("After");
  });

  it("preserves markdown outside components", () => {
    const input = `## Heading

Some **bold** and [link](/path) text.

<Image src="/x.png" />
More content.`;
    const result = stripMdxComponents(input);
    expect(result).toContain("## Heading");
    expect(result).toContain("**bold**");
    expect(result).toContain("[link](/path)");
    expect(result).toContain("More content");
    expect(result).not.toContain("<Image");
  });

  it("handles nested components in block elements", () => {
    const input = `<AppOnly>
  <Image alt="nested" src="/nested.png" />
  Inner text
</AppOnly>`;
    const result = stripMdxComponents(input);
    expect(result).not.toContain("Inner text");
    expect(result).not.toContain("<Image");
    expect(result).not.toContain("<AppOnly");
  });

  it("handles content with no components", () => {
    const input = `# Title\n\nPlain markdown content.`;
    expect(stripMdxComponents(input)).toBe(input);
  });
});
