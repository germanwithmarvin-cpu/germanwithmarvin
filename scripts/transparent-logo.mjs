// Entfernt den einfarbigen Hintergrund des Logos und macht ihn transparent.
// Verfahren: Flood-Fill von allen Bildrändern aus – nur zusammenhängende
// Hintergrund-Pixel werden transparent, Details im Inneren bleiben erhalten.
import sharp from "sharp";

const SRC = "public/logo.png";
const OUT = "public/logo.png";
const TOLERANCE = 30; // wie stark eine Farbe abweichen darf, um noch als Hintergrund zu gelten

const img = sharp(SRC).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const idx = (x, y) => (y * width + x) * channels;

// Referenzfarbe = Mittel der vier Ecken
const corners = [idx(0, 0), idx(width - 1, 0), idx(0, height - 1), idx(width - 1, height - 1)];
let r = 0, g = 0, b = 0;
for (const c of corners) { r += data[c]; g += data[c + 1]; b += data[c + 2]; }
r = Math.round(r / 4); g = Math.round(g / 4); b = Math.round(b / 4);

const close = (i) => {
  const dr = data[i] - r, dg = data[i + 1] - g, db = data[i + 2] - b;
  return Math.sqrt(dr * dr + dg * dg + db * db) <= TOLERANCE;
};

const visited = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) { stack.push([x, 0], [x, height - 1]); }
for (let y = 0; y < height; y++) { stack.push([0, y], [width - 1, y]); }

while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const p = y * width + x;
  if (visited[p]) continue;
  visited[p] = 1;
  const i = idx(x, y);
  if (!close(i)) continue;
  data[i + 3] = 0; // transparent
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(OUT + ".tmp");
await sharp(OUT + ".tmp").toFile(OUT);
console.log(`Done. Background color was rgb(${r},${g},${b}).`);
