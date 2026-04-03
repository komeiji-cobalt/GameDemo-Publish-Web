import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const outDir = join(rootDir, 'dist');

const buildEntries = [
  'assets',
  'game',
  'icons',
  'lib',
  'index.html',
  'manifest.json',
  'webgal-serviceworker.js',
];

const run = async () => {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const entries = await readdir(rootDir, { withFileTypes: true });
  const entryMap = new Map(entries.map((entry) => [entry.name, entry]));

  await Promise.all(
    buildEntries.map(async (name) => {
      const entry = entryMap.get(name);
      if (!entry) {
        throw new Error(`Required build entry not found: ${name}`);
      }
      const from = join(rootDir, entry.name);
      const to = join(outDir, entry.name);
      await cp(from, to, { recursive: true });
    }),
  );

  console.log('Build complete: dist directory is ready.');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});