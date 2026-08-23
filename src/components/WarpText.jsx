import React, { useCallback, useEffect, useRef } from 'react';

/**
 * WarpText
 * ---------------------------------------------------------------------
 * Renders `text` on a <canvas> and animates it as a "liquid" warp: the
 * text is drawn once onto an offscreen canvas, then redrawn on screen in
 * thin horizontal slices, each nudged sideways by a sine wave. There's no
 * WebGL/3D library involved — this is plain Canvas 2D, matching the
 * hand-rolled style TextType.jsx already uses elsewhere in this project,
 * so no new dependency is needed for one hero headline.
 *
 * How each prop maps to the effect:
 *  - warpStrength      how far (as a fraction of the canvas width) a
 *                       slice can drift sideways at the peak of a wave.
 *  - warpScale         how many wave cycles fit across the canvas height
 *                       — higher = tighter, wigglier waves.
 *  - speed             how fast the wave animates over time.
 *  - pointerInfluence  radius (as a fraction of canvas height) around the
 *                       pointer where it pushes the wave harder.
 *  - pointerStrength   how hard the pointer pushes within that radius.
 *  - refraction        width (as a fraction of canvas width) of a soft
 *                       double-image fringe drawn either side of each
 *                       slice — a cheap approximation of the color
 *                       fringing you'd get from real light refraction.
 *  - ripple            adds a continuous, gentle radial wave centered on
 *                       the text (on top of the constant side-to-side
 *                       warp), strongest near the middle and fading out.
 *
 * Accessibility: canvas pixels aren't real text, so the actual string is
 * also rendered as a visually-hidden node inside the same container —
 * screen readers and search engines see normal text.
 */
const WarpText = ({
  text,
  color = '#0d0f14',
  fontFamily = "'Space Grotesk', sans-serif",
  fontWeight = 700,
  fontSize = 'clamp(2rem, 6vw, 5rem)',
  warpStrength = 0.08,
  warpScale = 1.7,
  speed = 0.55,
  pointerInfluence = 0.4,
  pointerStrength = 0.35,
  refraction = 0.015,
  ripple = false,
  className,
  style,
}) => {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const canvasRef = useRef(null);
  // Lazily create the offscreen canvas once, on first render, instead of
  // passing `document.createElement(...)` straight to useRef — that
  // expression would otherwise be re-evaluated (and its result thrown
  // away) on every single render.
  const textCanvasRef = useRef(null);
  if (textCanvasRef.current === null) {
    textCanvasRef.current = document.createElement('canvas');
  }
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const pointerRef = useRef({ y: -9999, active: false });
  const rafRef = useRef(null);
  const startRef = useRef(null);

  // <canvas> fillStyle can't read CSS custom properties directly, so if
  // `color` is passed as e.g. "var(--ink)", resolve it to a real color
  // via the DOM. This lets callers stay consistent with tokens.css
  // instead of duplicating a hex value here.
  const resolveColor = useCallback((value) => {
    if (typeof value === 'string' && value.trim().startsWith('var(')) {
      const varName = value.trim().slice(4, -1).trim();
      const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName);
      return resolved.trim() || '#000000';
    }
    return value;
  }, []);

  // Re-draw the plain (unwarped) text onto the offscreen canvas, and size
  // both canvases to match the container. Runs on mount, whenever the
  // text/font/color props change, and whenever the container resizes.
  const renderTextLayer = useCallback(() => {
    const container = containerRef.current;
    const measurer = measureRef.current;
    const canvas = canvasRef.current;
    if (!container || !measurer || !canvas) return;

    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    sizeRef.current = { width, height, dpr };

    // The hidden measurer element resolves a clamp()/vw fontSize into a
    // concrete pixel number, since the canvas API can't use CSS functions.
    let resolvedFontSize = parseFloat(getComputedStyle(measurer).fontSize);

    const textCanvas = textCanvasRef.current;
    textCanvas.width = width * dpr;
    textCanvas.height = height * dpr;
    const tctx = textCanvas.getContext('2d');
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tctx.clearRect(0, 0, width, height);
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';
    tctx.fillStyle = resolveColor(color);

    // Shrink the font until the text actually fits the canvas width — the
    // CSS clamp() on fontSize is sized for the container, not for how wide
    // this specific string renders, so long strings can overflow and get
    // clipped at the canvas edges otherwise.
    tctx.font = `${fontWeight} ${resolvedFontSize}px ${fontFamily}`;
    const maxTextWidth = width * 0.94;
    const measuredWidth = tctx.measureText(text).width;
    if (measuredWidth > maxTextWidth) {
      resolvedFontSize *= maxTextWidth / measuredWidth;
      tctx.font = `${fontWeight} ${resolvedFontSize}px ${fontFamily}`;
    }

    tctx.fillText(text, width / 2, height / 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }, [text, color, fontFamily, fontWeight, resolveColor]);

  // Track the pointer's position relative to the container, in CSS pixels.
  // Stored in a ref (not state) so pointer movement never triggers a
  // re-render — the animation loop below reads it directly each frame.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handleMove = (event) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current = { y: event.clientY - rect.top, active: true };
    };
    const handleLeave = () => {
      pointerRef.current = { y: -9999, active: false };
    };

    container.addEventListener('pointermove', handleMove);
    container.addEventListener('pointerleave', handleLeave);
    return () => {
      container.removeEventListener('pointermove', handleMove);
      container.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  // Keep the canvases sized to the container as it resizes (font-size
  // uses clamp()/vw, so this can change on any viewport width change).
  useEffect(() => {
    renderTextLayer();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(renderTextLayer);
    observer.observe(container);
    return () => observer.disconnect();
  }, [renderTextLayer]);

  // The animation loop itself: redraw the cached text image in warped
  // horizontal slices, once per frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    const draw = (now) => {
      if (startRef.current === null) startRef.current = now;
      const t = ((now - startRef.current) / 1000) * speed;

      const { width, height, dpr } = sizeRef.current;
      if (width === 0 || height === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // A fixed number of slices regardless of pixel height keeps the
      // per-frame cost predictable on both small and large screens.
      const sliceCount = 90;
      const sliceHeight = height / sliceCount;
      const amplitude = warpStrength * width * 0.5;
      const refractionPx = refraction * width;
      const pointer = pointerRef.current;
      const pointerRadius = pointerInfluence * height;

      for (let i = 0; i < sliceCount; i += 1) {
        const y = i * sliceHeight;

        // Base warp: a sine wave traveling down the text over time.
        let offsetX = Math.sin((y / height) * Math.PI * 2 * warpScale + t) * amplitude;

        // Pointer push: extra displacement for slices near the pointer,
        // fading out smoothly at the edge of pointerInfluence's radius.
        if (pointer.active) {
          const distance = Math.abs(y - pointer.y);
          if (distance < pointerRadius) {
            const falloff = 1 - distance / pointerRadius;
            offsetX += Math.sin(t * 2 + y * 0.05) * pointerStrength * amplitude * falloff;
          }
        }

        // Ripple: a gentle radial wave centered on the text, strongest in
        // the middle and fading toward the top/bottom edges.
        if (ripple) {
          const centerDistance = Math.abs(y - height / 2) / height;
          const rippleFalloff = Math.max(0, 1 - centerDistance * 1.4);
          offsetX += Math.sin(centerDistance * 10 - t * 2) * amplitude * 0.3 * rippleFalloff;
        }

        const sy = y * dpr;
        const sh = sliceHeight * dpr;
        const sw = width * dpr;

        // Refraction fringe: faint offset copies drawn additively behind
        // the main slice, approximating color fringing without the cost
        // of true per-channel rendering.
        if (refractionPx > 0.05) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.5;
          ctx.drawImage(textCanvasRef.current, 0, sy, sw, sh, offsetX - refractionPx, y, width, sliceHeight);
          ctx.drawImage(textCanvasRef.current, 0, sy, sw, sh, offsetX + refractionPx, y, width, sliceHeight);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1;
        }

        ctx.drawImage(textCanvasRef.current, 0, sy, sw, sh, offsetX, y, width, sliceHeight);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [warpStrength, warpScale, speed, pointerInfluence, pointerStrength, refraction, ripple]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Invisible — used only to resolve fontSize (which may be a
          clamp()/vw value) into a real pixel number for the canvas API. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', fontFamily, fontWeight, fontSize }}
      >
        {text}
      </span>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {/* Real text for screen readers/SEO — the canvas above is decorative. */}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {text}
      </span>
    </div>
  );
};

export default WarpText;
