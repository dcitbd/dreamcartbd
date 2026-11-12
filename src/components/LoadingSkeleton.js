/**
 * DREAM CART BD — ORBITAL PARTICLE VORTEX & BRANDED LOGO LOADER (src/components/LoadingSkeleton.js)
 * Reuses the shared Orbital Particle Vortex engine from /src/boot.js (window.startOrbitalParticleCanvas)
 * so the canvas animation logic is written once and reused everywhere.
 */

export function startOrbitalParticleCanvas(canvas) {
  if (!canvas || canvas.__dcbdParticleRunning) return;
  if (typeof window !== 'undefined' && typeof window.startOrbitalParticleCanvas === 'function' && window.startOrbitalParticleCanvas !== startOrbitalParticleCanvas) {
    return window.startOrbitalParticleCanvas(canvas);
  }
  canvas.__dcbdParticleRunning = true;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = 220;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);
  const cx = size / 2, cy = size / 2, r = 64;
  const pts = [];
  let ang = -Math.PI / 2, hue = 155;
  function step() {
    if (!document.body.contains(canvas)) { canvas.__dcbdParticleRunning = false; return; }
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ang += 0.075;
    hue = (hue + 1.4) % 360;
    const hx = cx + Math.cos(ang) * r, hy = cy + Math.sin(ang) * r;
    for (let k = 0; k < 3; k++) {
      pts.push({
        x: hx + (Math.random() - 0.5) * 6,
        y: hy + (Math.random() - 0.5) * 6,
        a: ang + Math.PI / 2 + (Math.random() - 0.5) * 0.35,
        s: 0.35 + Math.random() * 0.55,
        ac: 1.018 + Math.random() * 0.008,
        l: 1.0,
        d: 0.014 + Math.random() * 0.012,
        rad: 1.6 + Math.random() * 2.1,
        h: (hue + k * 18) % 360
      });
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      p.s *= p.ac;
      p.x += Math.cos(p.a) * p.s;
      p.y += Math.sin(p.a) * p.s;
      p.a += Math.PI / 52;
      p.l -= p.d;
      if (p.l <= 0) { pts.splice(i, 1); continue; }
      for (let j = i - 1; j >= Math.max(0, i - 8); j--) {
        const p2 = pts[j];
        const dx = p.x - p2.x, dy = p.y - p2.y, d2 = dx * dx + dy * dy;
        if (d2 < 480) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${p.h},92%,60%,${Math.min(p.l, p2.l) * (1 - d2 / 480) * 0.48})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.rad * p.l, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.h},95%,62%,${p.l * 0.92})`;
      ctx.fill();
    }
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14);
    g.addColorStop(0, 'rgba(255,255,255,0.98)');
    g.addColorStop(0.35, `hsla(${hue},95%,65%,0.85)`);
    g.addColorStop(1, `hsla(${hue},95%,55%,0)`);
    ctx.beginPath();
    ctx.arc(hx, hy, 14, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined' && !window.__dcbdOrbitalLoaderObserver) {
  window.__dcbdOrbitalLoaderObserver = true;
  if (!window.startOrbitalParticleCanvas) {
    window.startOrbitalParticleCanvas = startOrbitalParticleCanvas;
  }
  const initCanvases = () => {
    document.querySelectorAll('canvas.dcbd-orbital-canvas').forEach(c => startOrbitalParticleCanvas(c));
  };
  if (document.readyState !== 'loading') initCanvases();
  else document.addEventListener('DOMContentLoaded', initCanvases);
  try {
    const obs = new MutationObserver(() => initCanvases());
    if (document.documentElement) {
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }
  } catch (e) {}
}

export function renderLoadingSkeleton(props = {}) {
  const subtitle = props.subtitle || 'প্ল্যাটফর্ম ও লাইভ ক্যাটালগ প্রস্তুত করা হচ্ছে...';
  return `
    <div id="dcbd-unified-loader" class="py-16 sm:py-24 flex flex-col items-center justify-center max-w-xl mx-auto space-y-4 px-4 select-none">
      <style>
        @keyframes dcbdCenterLogoFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 28px rgba(16, 185, 129, 0.32), inset 0 0 12px rgba(16, 185, 129, 0.15); }
          50% { transform: translate(-50%, -50%) scale(1.05); box-shadow: 0 0 38px rgba(6, 182, 212, 0.45), inset 0 0 16px rgba(16, 185, 129, 0.25); }
        }
        @keyframes dcbdBarShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      </style>

      <!-- Orbital Particle Vortex Canvas + Official Center Logo -->
      <div style="position: relative; width: 220px; height: 220px; display: flex; align-items: center; justify-content: center;">
        <canvas class="dcbd-orbital-canvas" width="220" height="220" style="width: 220px; height: 220px; display: block; pointer-events: none;"></canvas>

        <!-- Official Dream Cart BD Logo inside the Particle Ring -->
        <div style="position: absolute; top: 50%; left: 50%; width: 76px; height: 76px; border-radius: 22px; background: #ffffff; padding: 6px; border: 2px solid rgba(16, 185, 129, 0.65); display: flex; align-items: center; justify-content: center; overflow: hidden; animation: dcbdCenterLogoFloat 2.4s ease-in-out infinite; z-index: 5;">
          <img
            src="${(typeof window !== 'undefined' && window.getDcbdLogoUrl) ? window.getDcbdLogoUrl() : '/public/icon/logo.png'}"
            alt="Dream Cart BD Logo"
            style="width: 100%; height: 100%; object-fit: contain; border-radius: 16px;"
            onerror="window.handleDcbdLogoError ? window.handleDcbdLogoError(this) : (this.src='/icon/logo.png');"
          />
        </div>
      </div>

      <!-- Brand Title & Animated Status Bar -->
      <div class="text-center space-y-2 max-w-xs" style="margin-top: -8px;">
        <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight" style="margin: 0;">
          Dream Cart <span style="color: #10b981;">BD</span>
        </h2>
        <div class="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>${subtitle}</span>
        </div>
        <div style="width: 170px; height: 5px; background: rgba(148, 163, 184, 0.22); border-radius: 9999px; overflow: hidden; margin: 6px auto 0;">
          <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #10b981, #06b6d4, #fbbf24, #10b981); background-size: 200% 100%; animation: dcbdBarShimmer 1.6s linear infinite; border-radius: 9999px;"></div>
        </div>
      </div>
    </div>
  `;
}

export default renderLoadingSkeleton;
