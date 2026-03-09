import "dotenv/config";
import { runIngest } from "../src/controllers/ingest.js";

runIngest().catch((err) => {
  console.error("Ingest failed:", err);
  process.exit(1);
});
