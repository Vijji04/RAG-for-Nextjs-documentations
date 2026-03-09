export type DocFrontMatter = {
  title?: string;
  description?: string;
  related?: {
    title?: string;
    description?: string;
    links?: string[];
  };
};

export type ChunkMetadata = {
  title: string;
  description: string;
  relatedLinks: string[];
  heading: string;
  source: string;
};

export type DocChunk = {
  title: string;
  description: string;
  relatedLinks: string[];
  heading: string;
  content: string;
  source: string;
};
