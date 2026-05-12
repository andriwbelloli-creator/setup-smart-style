// Converte todas as .jpg de src/assets pra .webp (qualidade 82, smart).
// Roda uma vez antes de cada release se mudar imagem.

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const ASSETS = new URL("../src/assets/", import.meta.url).pathname;

const files = (await readdir(ASSETS)).filter((f) => f.endsWith(".jpg"));
let totalIn = 0, totalOut = 0;

for (const f of files) {
  const inPath = join(ASSETS, f);
  const outPath = inPath.replace(/\.jpg$/, ".webp");
  const inSize = (await stat(inPath)).size;
  await sharp(inPath).webp({ quality: 82, effort: 5 }).toFile(outPath);
  const outSize = (await stat(outPath)).size;
  totalIn += inSize;
  totalOut += outSize;
  const reduction = ((inSize - outSize) / inSize * 100).toFixed(0);
  console.log(`✓ ${f.padEnd(25)} ${(inSize/1024).toFixed(0).padStart(4)} kb → ${(outSize/1024).toFixed(0).padStart(4)} kb (-${reduction}%)`);
}
console.log(`\nTotal: ${(totalIn/1024).toFixed(0)} kb → ${(totalOut/1024).toFixed(0)} kb (-${((totalIn-totalOut)/totalIn*100).toFixed(0)}%)`);
