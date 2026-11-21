/**
 * DREAM CART BD — ORBITAL PARTICLE VORTEX & BRANDED LOGO LOADER (src/components/LoadingSkeleton.js)
 * Implements:
 * - Custom HTML5 Canvas Orbital Particle Vortex (inspired by accelerating angular particle physics with constellation web trails & multi-hue glow)
 * - Official Dream Cart BD Logo (/public/icon/logo.png) suspended in the center of the vortex
 * - Single-instance seamless transition (eliminates double-loader flash)
 * - Automatic requestAnimationFrame lifecycle cleanup (0% CPU once unmounted)
 */

export function startOrbitalParticleCanvas(canvas) {
  if (!canvas || canvas.__dcbdParticleRunning) return;
  canvas.__dcbdParticleRunning = true;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = 220;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const orbitRadius = 64;
  const particles = [];
  let emitterAngle = -Math.PI / 2;
  let hueBase = 155; // Starts at Dream Cart BD Emerald

  class OrbitalParticle {
    constructor(x, y, angle, hue) {
      this.x = x;
      this.y = y;
      this.angle = angle + (Math.random() - 0.5) * 0.28;
      this.speed = 0.35 + Math.random() * 0.55;
      this.accel = 1.018 + Math.random() * 0.008;
      this.life = 1.0;
      this.decay = 0.014 + Math.random() * 0.012;
      this.radius = 1.6 + Math.random() * 2.1;
      this.hue = hue;
    }

    step() {
      this.speed *= this.accel;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.angle += Math.PI / 52;
      this.life -= this.decay;
    }
  }

  function renderFrame() {
    if (!document.body.contains(canvas)) {
      canvas.__dcbdParticleRunning = false;
      return;
    }

    ctx.clearRect(0, 0, size, size);

    // Subtle ambient orbital track ring
    ctx.beginPath();
    ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Advance emitter head along the orbital circle
    emitterAngle += 0.075;
    hueBase = (hueBase + 1.4) % 360;

    const headX = cx + Math.cos(emitterAngle) * orbitRadius;
    const headY = cy + Math.sin(emitterAngle) * orbitRadius;

    // Spawn 3 orbital vortex particles per frame
    for (let k = 0; k < 3; k++) {
      const spread = (Math.random() - 0.5) * 6;
      const tangentAngle = emitterAngle + Math.PI / 2 + (Math.random() - 0.5) * 0.35;
      particles.push(
        new OrbitalParticle(
          headX + spread,
          headY + spread,
          tangentAngle,
          (hueBase + k * 18) % 360
        )
      );
    }

    // Update particles & draw constellation web links in the comet tail
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.step();
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Connect nearby particles to form the geometric mesh vortex
      for (let j = i - 1; j >= Math.max(0, i - 8); j--) {
        const p2 = particles[j];
        if (!p2) continue;
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 480) {
          const alpha = Math.min(p.life, p2.life) * (1 - distSq / 480) * 0.48;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${p.hue}, 92%, 60%, ${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      // Draw glowing particle node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 95%, 62%, ${p.life * 0.92})`;
      ctx.fill();
    }

    // Draw luminous leading comet head
    const grad = ctx.createRadialGradient(headX, headY, 0, headX, headY, 14);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    grad.addColorStop(0.35, `hsla(${hueBase}, 95%, 65%, 0.85)`);
    grad.addColorStop(1, `hsla(${hueBase}, 95%, 55%, 0)`);
    ctx.beginPath();
    ctx.arc(headX, headY, 14, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    requestAnimationFrame(renderFrame);
  }

  requestAnimationFrame(renderFrame);
}

// Auto-mount any .dcbd-orbital-canvas elements inserted into DOM
if (typeof window !== 'undefined' && typeof document !== 'undefined' && !window.__dcbdOrbitalLoaderObserver) {
  window.__dcbdOrbitalLoaderObserver = true;
  window.startOrbitalParticleCanvas = startOrbitalParticleCanvas;

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
            src="/icon/logo.png"
            alt="Dream Cart BD Logo"
            style="width: 100%; height: 100%; object-fit: contain; border-radius: 16px;"
            onerror="this.onerror=null; this.src='/favicon.ico';"
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
