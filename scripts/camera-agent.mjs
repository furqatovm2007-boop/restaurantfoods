#!/usr/bin/env node
/*
 * RestaurantFoods camera agent: grabs a frame from an IP camera and posts it for table
 * occupancy analysis. Run it on a computer in the restaurant network (Node 22+, ffmpeg).
 *
 *   RF_CAMERA_KEY=rfcam_… RF_RESTAURANT_ID=… RF_CAMERA_URL=rtsp://user:pass@192.168.1.20/stream \
 *   RF_TABLES=1,2,3,4 RF_INTERVAL=30 node scripts/camera-agent.mjs
 *
 * RF_CAMERA_URL may also be an HTTP snapshot URL (http://camera/snapshot.jpg).
 * Frames are scaled to 1280px and never written to disk.
 */
import { spawn } from 'node:child_process';

const site = process.env.RF_SITE || 'https://restaurantfoods.online';
const key = process.env.RF_CAMERA_KEY;
const restaurantId = process.env.RF_RESTAURANT_ID;
const camera = process.env.RF_CAMERA_URL;
const interval = Math.max(15, Number(process.env.RF_INTERVAL) || 30) * 1000;
const tables = process.env.RF_TABLES ? process.env.RF_TABLES.split(',').map(Number).filter(Number.isInteger) : undefined;
const floor = process.env.RF_FLOOR ? Number(process.env.RF_FLOOR) : undefined;
if (!key || !restaurantId || !camera) {
  console.error('RF_CAMERA_KEY, RF_RESTAURANT_ID and RF_CAMERA_URL are required.');
  process.exit(1);
}

function grabRtsp(url) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-rtsp_transport', 'tcp', '-i', url, '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '5', '-f', 'image2', '-c:v', 'mjpeg', 'pipe:1']);
    const chunks = [];
    ff.stdout.on('data', (c) => chunks.push(c));
    ff.on('error', reject);
    ff.on('close', (code) => (code === 0 && chunks.length ? resolve(Buffer.concat(chunks)) : reject(new Error('ffmpeg exited ' + code))));
    setTimeout(() => ff.kill('SIGKILL'), 15000);
  });
}

async function grab() {
  if (/^https?:/i.test(camera)) {
    const res = await fetch(camera, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error('snapshot HTTP ' + res.status);
    return Buffer.from(await res.arrayBuffer());
  }
  return grabRtsp(camera);
}

async function tick() {
  try {
    const frame = await grab();
    const res = await fetch(site + '/api/manage/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ restaurantId, image: frame.toString('base64'), mimeType: 'image/jpeg', tables, floor }),
      signal: AbortSignal.timeout(40000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) console.error(new Date().toISOString(), res.status, data.error);
    else console.log(new Date().toISOString(), data.tables.map((t) => `#${t.number}:${t.status}`).join(' ') || 'no confident readings');
  } catch (e) {
    console.error(new Date().toISOString(), e.message);
  }
}

await tick();
setInterval(tick, interval);
