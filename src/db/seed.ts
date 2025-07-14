import "dotenv/config";
import { database } from "./index";

async function main() {}

async function seed() {
  console.log("Database seeded!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
