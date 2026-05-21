/**
 * Genera favicons con LANTITAS grande, sin cuadro de fondo (PNG transparente).
 * Ejecutar: node scripts/generate-favicon.mjs
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const source = path.join(root, 'public', 'Imagen', 'LANTITAS.png')

async function buildIcon(size, outPath, zoom = 1.3) {
  const trimmed = await sharp(source).trim().toBuffer()
  const meta = await sharp(trimmed).metadata()
  const w = meta.width ?? size
  const h = meta.height ?? size
  const base = Math.min(size / w, size / h) * zoom
  const rw = Math.min(Math.round(w * base), size)
  const rh = Math.min(Math.round(h * base), size)

  const resized = await sharp(trimmed).resize(rw, rh, { fit: 'inside' }).png().toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, gravity: 'south' }])
    .png()
    .toFile(outPath)

  console.log(`OK ${outPath} (${size}px, fondo transparente)`)
}

await buildIcon(32, path.join(root, 'src', 'app', 'icon.png'), 1.35)
await buildIcon(48, path.join(root, 'public', 'favicon-48.png'), 1.35)
await buildIcon(180, path.join(root, 'src', 'app', 'apple-icon.png'), 1.25)
