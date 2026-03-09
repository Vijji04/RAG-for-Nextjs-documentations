const COMPONENTS_TO_STRIP = [
  "Image",
  "AppOnly",
  "PagesOnly",
  "Tabs",
  "Check",
  "Cross",
] as const;

/**
 * Strip JSX/MDX components from markdown content.
 * Handles both self-closing (<Component />) and block (<Component>...</Component>) forms.
 */
export const stripMdxComponents = (content: string): string => {
  let result = content;

  for (const name of COMPONENTS_TO_STRIP) {
    // Self-closing: <Name ... />
    const selfClosing = new RegExp(
      `<${name}[^>]*\\/>`,
      "gs"
    );
    result = result.replace(selfClosing, "");

    // Block: <Name ...>...</Name> - use non-greedy match for content
    const blockPattern = new RegExp(
      `<${name}(?:\\s[^>]*)?>[\\s\\S]*?</${name}>`,
      "g"
    );
    result = result.replace(blockPattern, "");
  }

  // Collapse multiple blank lines into at most two
  result = result.replace(/\n{3,}/g, "\n\n");
  return result.trim();
};
