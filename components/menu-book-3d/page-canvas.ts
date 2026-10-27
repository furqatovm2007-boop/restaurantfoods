import { bookFont, palette, uiFont } from './theme';
import type { BookLabels, BookPage, Hotspot, MenuDish } from './types';

/** Physical page proportions (height / width), close to A5. */
export const PAGE_ASPECT = 1.414;

export interface PageDrawState {
  restaurantName: string;
  labels: BookLabels;
  quantities: Record<string, number>;
  /** Dishes whose add button currently shows the "added" confirmation. */
  flashed: ReadonlySet<string>;
  images: ImageCache;
  /** Left pages put the gutter shadow on the right edge. */
  side: 'left' | 'right';
  /** − / + change the cart itself (quantities are the cart's); no separate add button. */
  cartMode?: boolean;
}

type Ctx = CanvasRenderingContext2D;

/* ------------------------------------------------------------------ images */

/** Loads dish photos once and notifies when one becomes drawable. */
export class ImageCache {
  private entries = new Map<string, HTMLImageElement | 'error' | 'loading'>();
  private listeners = new Set<(url: string) => void>();

  get(url?: string | null): HTMLImageElement | null {
    if (!url) return null;
    const entry = this.entries.get(url);
    if (entry instanceof HTMLImageElement) return entry;
    if (entry) return null;
    this.entries.set(url, 'loading');
    const img = new Image();
    // Cross-origin photos must allow CORS, otherwise WebGL refuses the tainted canvas.
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      this.entries.set(url, img);
      this.listeners.forEach((fn) => fn(url));
    };
    img.onerror = () => this.entries.set(url, 'error');
    img.src = url;
    return null;
  }

  subscribe(fn: (url: string) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

/* ----------------------------------------------------------------- helpers */

let grain: HTMLCanvasElement | null = null;
/** Small tiling paper-fibre texture, generated once. */
function paperGrain(): HTMLCanvasElement {
  if (grain) return grain;
  grain = document.createElement('canvas');
  grain.width = grain.height = 128;
  const g = grain.getContext('2d')!;
  const data = g.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 60;
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = 14;
  }
  g.putImageData(data, 0, 0);
  return grain;
}

function wrap(ctx: Ctx, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const next = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
      continue;
    }
    lines.push(line);
    line = words[i];
    if (lines.length === maxLines) {
      line = '';
      break;
    }
  }
  if (line) lines.push(line);
  const truncated = lines.length === maxLines && words.join(' ').length > lines.join(' ').length;
  if (truncated) {
    let last = lines[maxLines - 1];
    while (last.length && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = last.trimEnd() + '…';
  }
  return lines.slice(0, maxLines);
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ornament(ctx: Ctx, cx: number, cy: number, width: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, cy);
  ctx.lineTo(cx - 18, cy);
  ctx.moveTo(cx + 18, cy);
  ctx.lineTo(cx + width / 2, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 9);
  ctx.lineTo(cx + 9, cy);
  ctx.lineTo(cx, cy + 9);
  ctx.lineTo(cx - 9, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function paper(ctx: Ctx, w: number, h: number, side: 'left' | 'right') {
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = ctx.createPattern(paperGrain(), 'repeat')!;
  ctx.fillRect(0, 0, w, h);
  // Gutter shadow where the paper dives into the binding.
  const gutter = w * 0.11;
  const g = side === 'right' ? ctx.createLinearGradient(0, 0, gutter, 0) : ctx.createLinearGradient(w, 0, w - gutter, 0);
  g.addColorStop(0, 'rgba(70,55,30,0.28)');
  g.addColorStop(0.35, 'rgba(70,55,30,0.08)');
  g.addColorStop(1, 'rgba(70,55,30,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Slightly aged outer edge.
  const edge = side === 'right' ? ctx.createLinearGradient(w, 0, w - 40, 0) : ctx.createLinearGradient(0, 0, 40, 0);
  edge.addColorStop(0, 'rgba(150,125,85,0.18)');
  edge.addColorStop(1, 'rgba(150,125,85,0)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);
}

function linen(ctx: Ctx, w: number, h: number) {
  const g = ctx.createRadialGradient(w * 0.65, h * 0.2, 0, w * 0.5, h * 0.5, h * 0.85);
  g.addColorStop(0, '#1d6e5c');
  g.addColorStop(0.45, palette.coverLight);
  g.addColorStop(1, palette.coverDark);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  for (let i = -h; i < w; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }
  ctx.strokeStyle = '#fff';
  for (let i = 0; i < w + h; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - h, h);
    ctx.stroke();
  }
  ctx.restore();
}

function goldFrame(ctx: Ctx, w: number, h: number, inset: number) {
  ctx.save();
  ctx.strokeStyle = palette.goldLine;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 2;
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1;
  ctx.strokeRect(inset + 10, inset + 10, w - inset * 2 - 20, h - inset * 2 - 20);
  ctx.restore();
}

function centered(ctx: Ctx, text: string, y: number, w: number, font: string, color: string, spacing = 0) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = spacing + 'px';
  ctx.fillText(text, w / 2, y);
  if ('letterSpacing' in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = '0px';
}

function runningHead(ctx: Ctx, w: number, folio: number | null, h: number) {
  centered(ctx, 'RESTAURANTFOODS', 66, w, `600 15px ${uiFont}`, palette.inkMuted, 4);
  if (folio !== null) {
    centered(ctx, String(folio), h - 48, w, `italic 26px ${bookFont}`, palette.inkMuted);
    ornament(ctx, w / 2, h - 86, 120, 'rgba(32,55,53,0.35)');
  }
  ctx.fillStyle = 'rgba(32,55,53,0.18)';
  ctx.fillRect(70, 86, w - 140, 1);
}

/* ------------------------------------------------------------------- pages */

function drawCover(ctx: Ctx, w: number, h: number, state: PageDrawState, hot: Hotspot[], back: boolean) {
  linen(ctx, w, h);
  goldFrame(ctx, w, h, 46);
  if (back) {
    centered(ctx, '✦', h / 2 - 20, w, `48px ${bookFont}`, palette.gold);
    centered(ctx, 'RESTAURANTFOODS', h / 2 + 40, w, `600 18px ${uiFont}`, palette.gold, 6);
    centered(ctx, state.restaurantName, h - 120, w, `italic 28px ${bookFont}`, palette.goldSoft);
    return;
  }
  centered(ctx, 'EST. RESTAURANTFOODS', 170, w, `500 15px ${uiFont}`, palette.gold, 5);
  ornament(ctx, w / 2, 215, 260, palette.goldLine);
  ctx.font = `500 46px ${bookFont}`;
  const nameLines = wrap(ctx, state.restaurantName.toUpperCase(), w - 220, 2);
  nameLines.forEach((line, i) => centered(ctx, line, 380 + i * 58, w, `500 46px ${bookFont}`, palette.goldSoft, 3));
  centered(ctx, state.labels.menu, h * 0.58, w, `italic 150px ${bookFont}`, palette.goldSoft);
  ornament(ctx, w / 2, h * 0.58 + 70, 200, palette.goldLine);
  centered(ctx, '✦', h - 230, w, `40px ${bookFont}`, palette.gold);
  centered(ctx, state.labels.open + '  ↗', h - 150, w, `500 24px ${uiFont}`, palette.goldSoft, 1);
  hot.push({ x: 0, y: 0, w: 1, h: 1, action: { type: 'open' } });
}

function drawEndpaper(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = palette.coverDark;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.strokeStyle = palette.goldLine;
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 1.2;
  const step = 54;
  for (let y = -step; y < h + step; y += step) {
    for (let x = (y / step) % 2 ? step / 2 : 0; x < w + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x + 16, y);
      ctx.lineTo(x, y + 16);
      ctx.lineTo(x - 16, y);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawToc(
  ctx: Ctx,
  w: number,
  h: number,
  page: BookPage & { content: { kind: 'toc' } },
  state: PageDrawState,
  hot: Hotspot[],
  folioOf: (page: number) => number | null,
) {
  runningHead(ctx, w, page.folio, h);
  centered(ctx, state.labels.contents, 200, w, `italic 72px ${bookFont}`, palette.ink);
  ornament(ctx, w / 2, 240, 220, 'rgba(32,55,53,0.45)');
  const left = 92;
  const right = w - 92;
  const top = 320;
  const row = Math.min(84, (h - top - 160) / Math.max(1, page.content.entries.length));
  page.content.entries.forEach((entry, i) => {
    const y = top + i * row;
    ctx.textAlign = 'left';
    ctx.font = `500 34px ${bookFont}`;
    ctx.fillStyle = palette.ink;
    const title = wrap(ctx, entry.title, right - left - 150, 1)[0] ?? '';
    ctx.fillText(title, left, y + 34);
    const titleWidth = ctx.measureText(title).width;
    ctx.font = `19px ${uiFont}`;
    ctx.fillStyle = palette.inkMuted;
    ctx.fillText(`${entry.count} ${state.labels.dishes}`, left, y + 62);
    const folio = String(folioOf(entry.page) ?? '');
    ctx.font = `italic 34px ${bookFont}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = palette.accentInk;
    ctx.fillText(folio, right, y + 34);
    // Dotted leader between title and page number.
    ctx.fillStyle = 'rgba(32,55,53,0.35)';
    for (let x = left + titleWidth + 14; x < right - ctx.measureText(folio).width - 14; x += 12) ctx.fillRect(x, y + 30, 3, 3);
    hot.push({ x: left / w, y: (y - 6) / h, w: (right - left) / w, h: row / h, action: { type: 'goto', page: entry.page } });
  });
  if (!page.content.entries.length) centered(ctx, state.labels.empty, top + 60, w, `italic 34px ${bookFont}`, palette.inkMuted);
}

function drawPhoto(ctx: Ctx, img: HTMLImageElement | null, x: number, y: number, size: number) {
  ctx.save();
  roundRect(ctx, x, y, size, size, 18);
  ctx.clip();
  if (img) {
    const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, x + (size - dw) / 2, y + (size - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = palette.paperShade;
    ctx.fillRect(x, y, size, size);
    // Plate placeholder, mirrors the site's SVG.
    ctx.strokeStyle = palette.inkMuted;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.17, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  roundRect(ctx, x, y, size, size, 18);
  ctx.strokeStyle = 'rgba(32,55,53,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawDish(ctx: Ctx, dish: MenuDish, x: number, y: number, width: number, height: number, w: number, h: number, state: PageDrawState, hot: Hotspot[]) {
  const photo = Math.min(260, height - 120);
  drawPhoto(ctx, state.images.get(dish.image), x, y, photo);
  const tx = x + photo + 32;
  const tw = width - photo - 32;
  ctx.textAlign = 'left';
  ctx.fillStyle = palette.ink;
  ctx.font = `600 38px ${bookFont}`;
  const nameLines = wrap(ctx, dish.name, tw, 2);
  nameLines.forEach((line, i) => ctx.fillText(line, tx, y + 34 + i * 42));
  let cy = y + 34 + nameLines.length * 42 + 6;
  ctx.font = `italic 600 32px ${bookFont}`;
  ctx.fillStyle = palette.accentInk;
  ctx.fillText(dish.price, tx, cy);
  cy += 38;
  ctx.font = `28px ${bookFont}`;
  ctx.fillStyle = palette.inkMuted;
  const remaining = Math.max(1, Math.floor((y + photo - cy) / 32));
  for (const line of wrap(ctx, dish.description || '', tw, Math.min(4, remaining))) {
    ctx.fillText(line, tx, cy);
    cy += 32;
  }
  if (dish.ingredients && cy < y + photo) {
    ctx.font = `italic 23px ${bookFont}`;
    const line = wrap(ctx, `${state.labels.ingredients}: ${dish.ingredients}`, tw, 1)[0];
    if (line) ctx.fillText(line, tx, cy);
  }

  // Controls row: − qty + | add button.
  const ry = y + photo + 26;
  const rh = 64;
  if (!dish.available) {
    ctx.font = `italic 28px ${bookFont}`;
    ctx.fillStyle = palette.inkMuted;
    ctx.fillText(state.labels.unavailable, x, ry + 42);
    return;
  }
  const qty = state.quantities[dish.id] ?? (state.cartMode ? 0 : 1);
  const btn = rh;
  const stepper = (bx: number, glyph: string, delta: 1 | -1) => {
    roundRect(ctx, bx, ry, btn, rh, 14);
    ctx.fillStyle = 'rgba(32,55,53,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(32,55,53,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = palette.ink;
    ctx.font = `600 34px ${uiFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(glyph, bx + btn / 2, ry + rh / 2 + 12);
    hot.push({ x: bx / w, y: ry / h, w: btn / w, h: rh / h, action: { type: 'qty', dishId: dish.id, delta } });
  };
  if (state.cartMode) {
    // Cart steppers across the whole row: − on the left, + on the right, the count in the cart between.
    const wide = Math.min(150, (width - 120) / 2);
    const big = (bx: number, glyph: string, delta: 1 | -1, strong: boolean) => {
      roundRect(ctx, bx, ry, wide, rh, 16);
      if (strong) {
        const fill = ctx.createLinearGradient(bx, ry, bx + wide, ry + rh);
        fill.addColorStop(0, palette.coverLight);
        fill.addColorStop(1, palette.coverDark);
        ctx.fillStyle = fill;
      } else ctx.fillStyle = 'rgba(32,55,53,0.06)';
      ctx.fill();
      ctx.strokeStyle = strong ? 'rgba(32,55,53,0.5)' : 'rgba(32,55,53,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = strong ? palette.goldSoft : delta < 0 && !qty ? palette.inkMuted : palette.ink;
      ctx.font = `600 40px ${uiFont}`;
      ctx.textAlign = 'center';
      ctx.fillText(glyph, bx + wide / 2, ry + rh / 2 + 14);
      hot.push({ x: bx / w, y: ry / h, w: wide / w, h: rh / h, action: { type: 'qty', dishId: dish.id, delta } });
    };
    big(x, '−', -1, false);
    big(x + width - wide, '+', 1, true);
    ctx.fillStyle = qty ? palette.ink : palette.inkMuted;
    ctx.font = `700 36px ${uiFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(String(qty), x + width / 2, ry + rh / 2 + 13);
    ctx.textAlign = 'left';
    return;
  }
  stepper(x, '−', -1);
  ctx.font = `600 32px ${uiFont}`;
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'center';
  ctx.fillText(String(qty), x + btn + 40, ry + rh / 2 + 11);
  stepper(x + btn + 80, '+', 1);

  const ax = x + btn * 2 + 110;
  const aw = x + width - ax;
  const flashed = state.flashed.has(dish.id);
  roundRect(ctx, ax, ry, aw, rh, 16);
  const fill = ctx.createLinearGradient(ax, ry, ax + aw, ry + rh);
  fill.addColorStop(0, flashed ? palette.teal : palette.coverLight);
  fill.addColorStop(1, flashed ? '#00a88c' : palette.coverDark);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.fillStyle = flashed ? palette.night : palette.goldSoft;
  ctx.font = `600 25px ${uiFont}`;
  ctx.fillText(flashed ? '✓ ' + state.labels.added : '＋ ' + state.labels.add, ax + aw / 2, ry + rh / 2 + 9);
  ctx.textAlign = 'left';
  hot.push({ x: ax / w, y: ry / h, w: aw / w, h: rh / h, action: { type: 'add', dishId: dish.id } });
}

function drawDishes(ctx: Ctx, w: number, h: number, page: BookPage & { content: { kind: 'dishes' } }, state: PageDrawState, hot: Hotspot[]) {
  runningHead(ctx, w, page.folio, h);
  const { chapter, dishes, first } = page.content;
  let top: number;
  if (first) {
    centered(ctx, chapter.title, 190, w, `italic 64px ${bookFont}`, palette.ink);
    ornament(ctx, w / 2, 228, 200, 'rgba(32,55,53,0.45)');
    top = 280;
  } else {
    centered(ctx, chapter.title, 150, w, `italic 36px ${bookFont}`, palette.inkMuted);
    top = 200;
  }
  const bottom = h - 130;
  const slot = (bottom - top) / 2;
  dishes.forEach((dish, i) => {
    const y = top + i * slot + 20;
    drawDish(ctx, dish, 80, y, w - 160, slot - 40, w, h, state, hot);
    if (i === 0 && dishes.length > 1) {
      ctx.fillStyle = 'rgba(32,55,53,0.14)';
      ctx.fillRect(120, top + slot - 4, w - 240, 1);
    }
  });
}

function drawClosing(ctx: Ctx, w: number, h: number, page: BookPage, state: PageDrawState) {
  runningHead(ctx, w, page.folio, h);
  ornament(ctx, w / 2, h * 0.42, 260, 'rgba(32,55,53,0.45)');
  centered(ctx, state.labels.closing, h * 0.5, w, `italic 66px ${bookFont}`, palette.ink);
  centered(ctx, state.restaurantName, h * 0.5 + 70, w, `500 28px ${bookFont}`, palette.inkMuted, 2);
}

/**
 * Paints one book page and returns the clickable regions on it.
 * `folioOf` maps a physical page index to its printed page number (for the contents).
 */
export function drawPage(canvas: HTMLCanvasElement, page: BookPage, state: PageDrawState, folioOf: (page: number) => number | null): Hotspot[] {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  // Layout is authored for a 900px wide page; scale for other resolutions.
  const scale = w / 900;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const lw = 900;
  const lh = h / scale;
  const hot: Hotspot[] = [];
  ctx.clearRect(0, 0, lw, lh);
  switch (page.content.kind) {
    case 'cover':
      drawCover(ctx, lw, lh, state, hot, false);
      break;
    case 'back-cover':
      drawCover(ctx, lw, lh, state, hot, true);
      break;
    case 'endpaper':
      drawEndpaper(ctx, lw, lh);
      break;
    case 'toc':
      paper(ctx, lw, lh, state.side);
      drawToc(ctx, lw, lh, page as BookPage & { content: { kind: 'toc' } }, state, hot, folioOf);
      break;
    case 'dishes':
      paper(ctx, lw, lh, state.side);
      drawDishes(ctx, lw, lh, page as BookPage & { content: { kind: 'dishes' } }, state, hot);
      break;
    case 'closing':
      paper(ctx, lw, lh, state.side);
      drawClosing(ctx, lw, lh, page, state);
      break;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return hot;
}

export function hitTest(hotspots: Hotspot[] | undefined, x: number, y: number): Hotspot | null {
  if (!hotspots) return null;
  for (let i = hotspots.length - 1; i >= 0; i--) {
    const s = hotspots[i];
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s;
  }
  return null;
}
