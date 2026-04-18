import { copyFileSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const mode = process.argv[2];
const root = process.cwd();
const readmePath = resolve(root, "README.md");
const npmReadmePath = resolve(root, "docs/npm-readme.md");
const backupReadmePath = resolve(root, ".README.repo.backup.md");

if (!mode || !["use", "restore"].includes(mode)) {
  console.error('Usage: node scripts/swap-readme.mjs <use|restore>');
  process.exit(1);
}

if (mode === "use") {
  if (!existsSync(npmReadmePath)) {
    console.error("docs/npm-readme.md not found.");
    process.exit(1);
  }

  copyFileSync(readmePath, backupReadmePath);
  copyFileSync(npmReadmePath, readmePath);
}

if (mode === "restore" && existsSync(backupReadmePath)) {
  copyFileSync(backupReadmePath, readmePath);
  rmSync(backupReadmePath);
}
