#!/usr/bin/env node
/*
 * Restyles the draw.io architecture export to the landing page's palette and
 * stroke weights (ink outlines, purple offset shadows, rounded corners).
 *
 * The .drawio.svg stays the editable source; re-run this after every draw.io
 * export:
 *
 *   node scripts/theme-arch-diagram.js
 *
 * Sizes are in diagram units. The 2638-unit-wide diagram renders ~1100px wide
 * on desktop (~0.42px per unit), so 5 units ≈ the cards' 2px border, 10 ≈ the
 * 4px shadow offset and 24 ≈ the 10px corner radius.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../public/categories/new-arch-diagram.drawio.svg');
const OUT = path.join(__dirname, '../public/categories/new-arch-diagram.themed.svg');

// Mirrors src/styles/tokens.css
const INK = '#0d0f14'; // --ink
const PURPLE_600 = '#4c1d95'; // shadows, container outlines
const PURPLE_400 = '#7c3aed'; // async messaging
const PURPLE_200 = '#c7aaff'; // dividers
const PURPLE_100 = '#e6d9ff'; // ingress fill
const PURPLE_50 = '#f4eeff'; // database fill
const WHITE = '#ffffff';

const BORDER = 5;
const LINE = 4;
const RADIUS = 24;
const SHADOW = 10;

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

const shadowFor = (tag, rx) => {
  const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((n) => Number(attr(tag, n)));
  return `<rect x="${x + SHADOW}" y="${y + SHADOW}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${PURPLE_600}" stroke="none" pointer-events="none"/>`;
};

const themeShape = (tag) => {
  const el = tag.match(/^<(\w+)/)[1];
  const fill = attr(tag, 'fill');
  const stroke = attr(tag, 'stroke');
  const width = Number(attr(tag, 'stroke-width') || 1);
  const transform = attr(tag, 'transform') || '';

  if (el === 'rect') {
    // Service boxes, AKS label bar, client box: white cards with offset shadow
    if (fill === '#ede9fe') {
      const rx = Number(attr(tag, 'height')) < 80 ? RADIUS / 2 : RADIUS;
      return shadowFor(tag, rx) + paint(tag, { fill: WHITE, stroke: INK, width: BORDER, rx });
    }
    // Emissary ingress column
    if (fill === '#ddd6fe') {
      return shadowFor(tag, RADIUS) + paint(tag, { fill: PURPLE_100, stroke: INK, width: BORDER, rx: RADIUS });
    }
    // Platform & delivery panel, observability strip
    if (fill === '#f5f3ff') {
      return shadowFor(tag, RADIUS) + paint(tag, { fill: WHITE, stroke: INK, width: BORDER, rx: RADIUS });
    }
    // Arrow legend: outer frame becomes a card, inner frame (double border) goes away
    if (fill === '#ffffff' && stroke === '#000000') {
      if (Number(attr(tag, 'width')) >= 386) {
        return shadowFor(tag, RADIUS) + paint(tag, { fill: WHITE, stroke: INK, width: BORDER, rx: RADIUS });
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
      fill: head ? PURPLE_400 : 'none',
      stroke: PURPLE_400,
      width: LINE,
      dash: head ? undefined : '16 12',
    });
  }

  if (stroke === '#000000') {
    // Observability strip dividers
    if (transform.startsWith('rotate(90')) return paint(tag, { stroke: PURPLE_200, width: 3 });
    // Sync request lines and their heads
    if (fill === 'none' && attr(tag, 'pointer-events') === 'stroke') return paint(tag, { stroke: INK, width: LINE });
    if (fill === '#000000') return paint(tag, { fill: INK, stroke: INK, width: LINE });
    // Database / message broker cylinders (body and top rim)
    if ((fill === '#ffffff' || fill === 'none') && (width === 1 || transform.startsWith('rotate(360'))) {
      return paint(tag, { fill: fill === 'none' ? 'none' : PURPLE_50, stroke: INK, width: LINE });
    }
    // Anything else drawn in black (client device icons): recolour only
    return paint(tag, { fill: fill === '#ffffff' ? WHITE : fill, stroke: INK });
  }

  return tag;
};

const src = fs.readFileSync(SRC, 'utf8');
const start = src.indexOf('>', src.indexOf('<svg')) + 1;
const head = src.slice(0, start);
let body = src.slice(start);

// Skip embedded data: URIs (icons) so only real shapes are touched
body = body.replace(/<(rect|path)\b[^>]*?\/>/g, (tag) => (tag.includes('data:') ? tag : themeShape(tag)));

// Label text: black -> ink
body = body
  .replace(/light-dark\(#000000, #ffffff\)/g, INK)
  .replace(/color: #000000/g, `color: ${INK}`);

// Drop the embedded draw.io model: the themed copy is output only, edit the .drawio.svg
const outHead = head.replace(/\scontent="[^"]*"/, '');

// The comment goes inside <svg>: nothing may precede the <?xml?> declaration
fs.writeFileSync(
  OUT,
  `${outHead}<!-- Generated by scripts/theme-arch-diagram.js from new-arch-diagram.drawio.svg. Do not edit. -->${body}`
);
console.log(`Wrote ${path.relative(process.cwd(), OUT)}`);
