import "dotenv/config";
import { runRetrieve } from "../src/controllers/retrieve.js";

const EXAMPLE_QUERY = "How do I optimize fonts in Next.js?";

runRetrieve(EXAMPLE_QUERY).catch((err) => {
  console.error("Retrieve failed:", err);
  process.exit(1);
});
