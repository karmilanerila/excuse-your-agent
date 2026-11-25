import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The excuse is built from its beats so the turn stays sharp:
// apology first, deflection second, shared blame last.
const APOLOGY = "Sorry about the bug";
const DEFLECTION =
  "the compiler watched me write it, said nothing, and let me deploy anyway";
const TURN = "Technically, we shipped it together.";

const EXCUSE = `${APOLOGY} — ${DEFLECTION}. ${TURN}`;

const MAX_CHARS = 200;

function buildEntry(): string {
  // One line only: collapse any stray whitespace and forbid newlines,
  // so the judge always reads a single clean line.
  const text = EXCUSE.replace(/\s+/g, " ").trim();
  if (text.length === 0) {
    throw new Error("entry must not be empty");
  }
  if (text.length > MAX_CHARS) {
    throw new Error(`entry must be 1-200 characters, got ${text.length}`);
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("entry must be a single line");
  }
  return text;
}

function outputDir(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  return dir && dir.length > 0 ? dir : "/output";
}

function main(): void {
  const text = buildEntry();
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "entry.txt");
  // Write directly to the final path (no tempfile: the grader's collector
  // runs as another user and must be able to read the file) and make it
  // world-readable. Never delete or recreate the output directory itself.
  writeFileSync(file, text, "utf8");
  chmodSync(file, 0o644);
  // Read back what landed on disk: the gate checks the file, not memory.
  const written = readFileSync(file, "utf8");
  if (written !== text) {
    throw new Error("entry.txt on disk does not match the entry");
  }
}

main();
