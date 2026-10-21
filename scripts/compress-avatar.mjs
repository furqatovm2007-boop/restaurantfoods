// Builds the compressed avatar models from public/models/assistant-robot.glb:
//   assistant-robot.draco.glb  Draco geometry, 1024px WebP textures, animation resampled at 1e-4
//   assistant-robot.lite.glb   512px textures, animation resampled at 2e-3 (slow / save-data connections)
// Node names are kept: the avatar finds its mouth joints by name. Tooling is not a project
// dependency; install it in a scratch folder and run from there:
//   npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 draco3dgltf sharp
//   node compress-avatar.mjs in.glb assistant-robot.draco.glb 1024
//   node compress-avatar.mjs in.glb assistant-robot.lite.glb 512 2e-3
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, resample, draco, textureCompress } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
const [input, output, size, tolerance = '1e-4'] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.encoder': await draco3d.createEncoderModule(), 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.read(input);
const names = doc.getRoot().listNodes().map((n) => n.getName()).sort().join();
await doc.transform(dedup(), resample({ tolerance: Number(tolerance) }), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [Number(size), Number(size)], quality: 82 }), draco({ method: 'edgebreaker', encodeSpeed: 5, decodeSpeed: 5 }));
const after = doc.getRoot().listNodes().map((n) => n.getName()).sort().join();
if (names !== after) throw new Error('node names changed');
await io.write(output, doc);
