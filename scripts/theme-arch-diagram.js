#!/usr/bin/env node
/*
 * Restyles the draw.io architecture exports to the landing page's palette and
 * stroke weights (ink outlines, rounded corners). Most nodes stay flat (the
 * page frames the whole diagram in a card); the five services get a small,
 * soft offset shadow so the core of the system stands out.
 *
 * The .drawio.svg stays the editable source; re-run this after every export
 * (phones get an inline vertical redraw instead, MobileArchitectureDiagram in
 * src/components/ArchFlowDiagrams.jsx):
 *
 *   node scripts/theme-arch-diagram.js
 *
 * Sizes are in diagram units. The 2638-unit-wide diagram renders ~1100px wide
 * on desktop (~0.42px per unit), so 5 units ≈ the cards' 2px border and 24 ≈
 * the 10px corner radius.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '../public/categories');
const DIAGRAMS = ['new-arch-diagram'];

// Mirrors src/styles/tokens.css
const INK = '#0d0f14'; // --ink
const PURPLE_600 = '#4c1d95'; // shadows, container outlines
// The page's one functional (non-brand) colour: it only ever means "asynchronous
// event", so it stays readable against all the brand purple around it.
const ASYNC = '#0e7490';
const PURPLE_300 = '#a374ff'; // service shadows (softer than the page cards' purple)
const PURPLE_200 = '#c7aaff'; // dividers
const PURPLE_100 = '#e6d9ff'; // ingress and database fill
const WHITE = '#ffffff';

const BORDER = 5;
const LINE = 4;
const RADIUS = 24;
const SERVICE_SHADOW = 9;

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};

const setAttr = (tag, name, value) => {
  if (value === null) return tag.replace(new RegExp(`\\s${name}="[^"]*"`), '');
  if (attr(tag, name) !== null) return tag.replace(new RegExp(`(\\s${name}=")[^"]*(")`), `$1${value}$2`);
  return tag.replace(/^<(\w+)/, `<$1 ${name}="${value}"`);
};

// draw.io repeats fill/stroke in an inline style (with light-dark()), which beats
// the attributes, so both are rewritten together.
const paint = (tag, { fill, stroke, width, dash, rx }) => {
  let t = tag;
  if (fill !== undefined) t = setAttr(t, 'fill', fill);
  if (stroke !== undefined) t = setAttr(t, 'stroke', stroke);
  if (width !== undefined) t = setAttr(t, 'stroke-width', String(width));
  if (dash !== undefined) t = setAttr(t, 'stroke-dasharray', dash);
  if (rx !== undefined) t = setAttr(setAttr(t, 'rx', String(rx)), 'ry', String(rx));
  return setAttr(t, 'style', `fill: ${attr(t, 'fill') || 'none'}; stroke: ${attr(t, 'stroke') || 'none'};`);
};

const serviceShadow = (tag, rx) => {
  const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((n) => Number(attr(tag, n)));
  const o = SERVICE_SHADOW;
  return `<rect x="${x + o}" y="${y + o}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${PURPLE_300}" stroke="none" pointer-events="none"/>`;
};

// The five service boxes (Frontend, Catalog, Inventory, Identity, Trading) are
// the #ede9fe rects of roughly 330×140–160; the client box and the AKS label
// bar share the fill but not the size.
const isServiceBox = (tag) => {
  const w = Number(attr(tag, 'width'));
  const h = Number(attr(tag, 'height'));
  return w >= 300 && w <= 360 && h >= 120 && h <= 180;
};

// Some exports draw async arrows as dashed black lines instead of purple; an
// arrowhead follows its line in the file, so a head takes the style of the
// line just before it.
let lastLineAsync = false;

const themeShape = (tag) => {
  const el = tag.match(/^<(\w+)/)[1];
  const fill = attr(tag, 'fill');
  const stroke = attr(tag, 'stroke');
  const width = Number(attr(tag, 'stroke-width') || 1);
  const transform = attr(tag, 'transform') || '';

  if (el === 'rect') {
    // Service boxes (raised), AKS label bar and client box (flat): white cards
    if (fill === '#ede9fe') {
      const rx = Number(attr(tag, 'height')) < 80 ? RADIUS / 2 : RADIUS;
      const card = paint(tag, { fill: WHITE, stroke: INK, width: BORDER, rx });
      return isServiceBox(tag) ? serviceShadow(tag, rx) + card : card;
    }
    // Emissary ingress column: the single entry point, light purple tint
    if (fill === '#ddd6fe') {
      return paint(tag, { fill: PURPLE_100, stroke: INK, width: BORDER, rx: RADIUS });
    }
    // Platform & delivery panel, observability strip
    if (fill === '#f5f3ff') {
      return paint(tag, { fill: WHITE, stroke: INK, width: BORDER, rx: RADIUS });
    }
    // Arrow legend: outer frame stays, inner frame (double border) goes away
    if (fill === '#ffffff' && stroke === '#000000') {
      if (Number(attr(tag, 'width')) >= 386) {
        return paint(tag, { fill: WHITE, stroke: INK, width: BORDER, rx: RADIUS });
      }
      return paint(tag, { fill: 'none', stroke: 'none' });
    }
    // Dashed boundaries: AKS cluster and the outer system boundary
    if (fill === 'none' && attr(tag, 'stroke-dasharray')) {
      const outer = attr(tag, 'stroke-dasharray').split(' ').length > 2;
      return paint(tag, {
        stroke: PURPLE_600,
        width: outer ? 3 : 4,
        dash: outer ? '20 12 4 12' : '16 12',
        rx: RADIUS,
      });
    }
    return tag;
  }

  // Async messaging (dashed purple) lines and their heads
  if (stroke === '#3700cc') {
    const head = fill === '#3700cc';
    return paint(tag, {
      fill: head ? ASYNC : 'none',
      stroke: ASYNC,
      width: LINE,
      dash: head ? undefined : '16 12',
    });
  }

  if (stroke === '#000000') {
    // Observability strip dividers
    if (transform.startsWith('rotate(90')) return paint(tag, { stroke: PURPLE_200, width: 3 });
    // Request lines (solid = sync; dashed = async in architecture-only) and their heads
    if (fill === 'none' && attr(tag, 'pointer-events') === 'stroke') {
      lastLineAsync = Boolean(attr(tag, 'stroke-dasharray'));
      return lastLineAsync
        ? paint(tag, { stroke: ASYNC, width: LINE, dash: '16 12' })
        : paint(tag, { stroke: INK, width: LINE });
    }
    if (fill === '#000000') {
      const color = lastLineAsync ? ASYNC : INK;
      return paint(tag, { fill: color, stroke: color, width: LINE });
    }
    // Database / message broker cylinders (body and top rim)
    if ((fill === '#ffffff' || fill === 'none') && (width === 1 || transform.startsWith('rotate(360'))) {
      return paint(tag, { fill: fill === 'none' ? 'none' : PURPLE_100, stroke: INK, width: LINE });
    }
    // Anything else drawn in black (client device icons): recolour only
    return paint(tag, { fill: fill === '#ffffff' ? WHITE : fill, stroke: INK });
  }

  return tag;
};

DIAGRAMS.forEach((name) => {
  const src = fs.readFileSync(path.join(DIR, `${name}.drawio.svg`), 'utf8');
  const start = src.indexOf('>', src.indexOf('<svg')) + 1;
  const head = src.slice(0, start);
  lastLineAsync = false;

  // Skip embedded data: URIs (icons) so only real shapes are touched
  let body = src.slice(start).replace(/<(rect|path)\b[^>]*?\/>/g, (tag) => (tag.includes('data:') ? tag : themeShape(tag)));

  // Label text: black -> ink
  body = body
    .replace(/light-dark\(#000000, #ffffff\)/g, INK)
    .replace(/color: #000000/g, `color: ${INK}`);

  // Drop the embedded draw.io model: the themed copy is output only, edit the .drawio.svg
  const outHead = head.replace(/\scontent="[^"]*"/, '');

  // The comment goes inside <svg>: nothing may precede the <?xml?> declaration
  const out = path.join(DIR, `${name}.themed.svg`);
  fs.writeFileSync(
    out,
    `${outHead}<!-- Generated by scripts/theme-arch-diagram.js from ${name}.drawio.svg. Do not edit. -->${body}`
  );
  console.log(`Wrote ${path.relative(process.cwd(), out)}`);
});
