/**
 * Traduit messages/campaigns-fr.json vers messages/campaigns-en.json
 * via l’API MyMemory (gratuite, sans clé API).
 *
 * Prérequis : campaigns-fr.json doit exister et contenir le contenu en français.
 *
 * Usage:
 *   node scripts/translate-campaigns-to-en.mjs
 *
 * Variables d’environnement (optionnel):
 *   MYMEMORY_EMAIL - email valide pour relever la limite (5000 → 50000 car/jour)
 *
 * Limites MyMemory : 5000 caractères/jour sans email, 50000 avec MYMEMORY_EMAIL.
 * Max 500 octets par requête : les longs textes sont découpés automatiquement.
 *
 * Alternative sans script : éditer à la main campaigns-en.json.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const messagesDir = join(rootDir, 'messages');
const frPath = join(messagesDir, 'campaigns-fr.json');
const enPath = join(messagesDir, 'campaigns-en.json');

const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL || '';
const MAX_BYTES_PER_REQUEST = 450;
const DELAY_MS = 300;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function chunkText(text, maxBytes = MAX_BYTES_PER_REQUEST) {
  const buf = Buffer.from(text, 'utf8');
  if (buf.length <= maxBytes) return [text];
  const chunks = [];
  let start = 0;
  while (start < buf.length) {
    let end = Math.min(start + maxBytes, buf.length);
    while (end > start && (buf[end - 1] & 0xc0) === 0x80) end--;
    chunks.push(buf.subarray(start, end).toString('utf8'));
    start = end;
  }
  return chunks;
}

async function translateChunk(chunk) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', chunk);
  url.searchParams.set('langpair', 'fr|en');
  if (MYMEMORY_EMAIL) url.searchParams.set('de', MYMEMORY_EMAIL);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`MyMemory ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const t = data?.responseData?.translatedText;
  if (t == null) throw new Error('Réponse MyMemory sans translatedText');
  return t;
}

async function translate(text) {
  if (!text || typeof text !== 'string' || !text.trim()) return text;
  const chunks = chunkText(text);
  const parts = [];
  for (let i = 0; i < chunks.length; i++) {
    parts.push(await translateChunk(chunks[i]));
    if (i < chunks.length - 1) await sleep(DELAY_MS);
  }
  return parts.join('');
}

async function translateEntry(entry, path = '') {
  const out = {};
  for (const [key, value] of Object.entries(entry)) {
    const keyPath = path ? `${path}.${key}` : key;
    if (typeof value === 'string') {
      try {
        out[key] = await translate(value);
        process.stdout.write('.');
      } catch (e) {
        console.warn(`\n[${keyPath}] non traduit: ${e.message}`);
        out[key] = value;
      }
      await sleep(DELAY_MS);
    } else if (Array.isArray(value)) {
      out[key] = [];
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === 'string') {
          try {
            out[key].push(await translate(value[i]));
            process.stdout.write('.');
          } catch (e) {
            console.warn(`\n[${keyPath}[${i}]] non traduit: ${e.message}`);
            out[key].push(value[i]);
          }
          await sleep(DELAY_MS);
        } else {
          out[key].push(value[i]);
        }
      }
    } else if (value !== null && typeof value === 'object') {
      out[key] = await translateEntry(value, keyPath);
    } else {
      out[key] = value;
    }
  }
  return out;
}

async function main() {
  let fr;
  try {
    fr = JSON.parse(readFileSync(frPath, 'utf8'));
  } catch (e) {
    console.error('Impossible de lire campaigns-fr.json:', e.message);
    process.exit(1);
  }
  if (!fr.campaigns || typeof fr.campaigns !== 'object') {
    console.error('campaigns-fr.json doit contenir { "campaigns": { ... } }');
    process.exit(1);
  }

  console.log('Traduction FR → EN (MyMemory, gratuit). Limite ~500 octets/requête, délai entre requêtes.');
  if (MYMEMORY_EMAIL) console.log('Limite relevée avec MYMEMORY_EMAIL.');
  const campaignsEn = { campaigns: {} };
  const ids = Object.keys(fr.campaigns);
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    console.log(`\n[${i + 1}/${ids.length}] ${id}`);
    try {
      campaignsEn.campaigns[id] = await translateEntry(fr.campaigns[id], id);
    } catch (e) {
      console.error(`Erreur campagne ${id}:`, e.message);
      campaignsEn.campaigns[id] = fr.campaigns[id];
    }
  }

  writeFileSync(enPath, JSON.stringify(campaignsEn, null, 2), 'utf8');
  console.log('\nÉcrit:', enPath);
  console.log('Relancez l’app et passez la langue en anglais pour vérifier.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
