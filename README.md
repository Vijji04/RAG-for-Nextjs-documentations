# RAG Pipeline for Next.js Docs

Ingests Next.js documentation (MDX/MD) with heading-aware chunking, stores embeddings in ChromaDB, and retrieves via semantic search.

## Prerequisites

- Node.js 18+
- [Chroma](https://docs.trychroma.com/) server running locally
- OpenAI API key

## Setup

```bash
npm install --ignore-scripts
```

> Use `--ignore-scripts` if the `sharp` native dependency fails to build. The pipeline works without it.

Copy `.env.example` to `.env` and set your `OPENAI_API_KEY`.

## Run Chroma

Start and setup Chroma before ingest/retrieve:

```bash
npx chroma run
```

<!-- ```bash
docker run -p 8000:8000 chromadb/chroma
``` -->

**Connection issues?** If you get `ChromaConnectionError` or `EPIPE`, add to `.env`:

```
CHROMA_URL=http://localhost:8000
```

Using `127.0.0.1` instead of `localhost` can fix DNS-related connection drops.

## Usage

**Ingest docs** (load, chunk, embed, store):

```bash
npm run ingest
```

**Retrieve** (example query, top 5 results to console):

```bash
npm run retrieve
```

## Test

```bash
npm test
```

## Architecture

- `src/config` – env and constants
- `src/services` – doc-loader, front-matter, mdx-cleanup, chunker, embeddings, chroma
- `src/controllers` – ingest, retrieve orchestration
- `scripts/` – CLI entry points
