import { mkdir, copyFile, cp, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await mkdir('public/vendor', { recursive: true });
await mkdir('public/models', { recursive: true });
await copyFile('node_modules/@mediapipe/tasks-vision/vision_bundle.mjs', 'public/vendor/vision_bundle.mjs');
await cp('node_modules/@mediapipe/tasks-vision/wasm', 'public/vendor/wasm', { recursive: true });
const response = await fetch('https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task', { signal: AbortSignal.timeout(60000) });
if (!response.ok) throw new Error(`Model download failed: ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
// Pin the initially verified version so subsequent downloads cannot silently change it.
if (createHash('sha256').update(bytes).digest('hex') !== 'fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1') throw new Error('Hand model checksum changed; review the upstream version before updating.');
await writeFile('public/models/hand_landmarker.task', bytes);
console.log('Hand tracking assets installed locally. Camera frames stay in the browser.');
