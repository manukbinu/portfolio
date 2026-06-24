import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Reduced motion: skip all animations ────────────────────────────────────
const REDUCED = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initEffects(): () => void {
  if (REDUCED) return () => {};

  const cleanups = [
    initHeroCanvas(),
    initCursorSpotlight(),
    initHeroEntrance(),
    initScrollReveal(),
    initCardTilt(),
    initParallax(),
    initMagneticButtons(),
    initCounters(),
    initFloatingGeometrics(),
  ];

  return () => {
    cleanups.forEach(fn => fn?.());
    ScrollTrigger.getAll().forEach(t => t.kill());
    gsap.killTweensOf('*');
  };
}

// ─── 1. HERO CANVAS: animated particle network + reactive orbs ─────────────
function initHeroCanvas(): () => void {
  const hero = document.getElementById('hero');
  const heroBg = hero?.querySelector('.hero-bg');
  if (!hero || !heroBg) return () => {};

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.85';
  heroBg.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  let W = 0, H = 0, raf = 0, t = 0;
  let tmx = 0, tmy = 0, mx = 0, my = 0;

  interface Particle { x: number; y: number; vx: number; vy: number; r: number; a: number; }
  let particles: Particle[] = [];

  const ORBS = [
    { nx: 0.12, ny: 0.25, r: 280, c: '26,86,219',  phase: 0,   spd: 0.6 },
    { nx: 0.88, ny: 0.72, r: 200, c: '6,182,212',   phase: 2.1, spd: 0.8 },
    { nx: 0.55, ny: 0.92, r: 220, c: '26,86,219',   phase: 4.2, spd: 0.5 },
    { nx: 0.78, ny: 0.08, r: 160, c: '99,102,241',  phase: 1.5, spd: 0.7 },
  ];

  function resize() {
    W = canvas.width  = hero!.offsetWidth;
    H = canvas.height = hero!.offsetHeight;
    mx = W / 2; my = H / 2; tmx = mx; tmy = my;
    initParticles();
  }

  function initParticles() {
    particles = [];
    const count = Math.min(70, Math.floor(W * H / 14000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.4,
        a: Math.random() * 0.35 + 0.08,
      });
    }
  }

  function draw() {
    raf = requestAnimationFrame(draw);
    t += 0.006;
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    ctx.clearRect(0, 0, W, H);

    // Animated gradient orbs
    ORBS.forEach(o => {
      const ox = o.nx * W + Math.sin(t * o.spd + o.phase) * 70 + (mx - W / 2) * 0.025;
      const oy = o.ny * H + Math.cos(t * o.spd * 0.7 + o.phase) * 45 + (my - H / 2) * 0.018;
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
      g.addColorStop(0,   `rgba(${o.c},0.13)`);
      g.addColorStop(0.6, `rgba(${o.c},0.04)`);
      g.addColorStop(1,   `rgba(${o.c},0)`);
      ctx.beginPath();
      ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    // Particles
    for (const p of particles) {
      p.vx += (mx - p.x) * 0.000035;
      p.vy += (my - p.y) * 0.000025;
      p.vx *= 0.992;
      p.vy *= 0.992;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148,163,184,${p.a})`;
      ctx.fill();
    }

    // Connections (O(n²) but limited to 70 particles — fine)
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.strokeStyle = `rgba(26,86,219,${(1 - d / 110) * 0.18})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(hero);
  resize();
  draw();

  const onMouse = (e: MouseEvent) => {
    const r = hero!.getBoundingClientRect();
    tmx = e.clientX - r.left;
    tmy = e.clientY - r.top;
  };
  hero.addEventListener('mousemove', onMouse);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    hero!.removeEventListener('mousemove', onMouse);
    canvas.remove();
  };
}

// ─── 2. CURSOR SPOTLIGHT ────────────────────────────────────────────────────
function initCursorSpotlight(): () => void {
  const overlay = document.createElement('div');
  overlay.id = 'cursor-spotlight';
  overlay.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9998;transition:opacity 0.3s';
  document.body.appendChild(overlay);

  let ox = -2000, oy = -2000, tx = -2000, ty = -2000, raf = 0;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    ox += (tx - ox) * 0.09;
    oy += (ty - oy) * 0.09;
    overlay.style.background =
      `radial-gradient(700px circle at ${ox}px ${oy}px,` +
      `rgba(26,86,219,0.065) 0%,rgba(6,182,212,0.025) 35%,transparent 65%)`;
  };

  const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
  window.addEventListener('mousemove', onMove);
  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('mousemove', onMove);
    overlay.remove();
  };
}

// ─── 3. HERO ENTRANCE ───────────────────────────────────────────────────────
function initHeroEntrance(): () => void {
  const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power3.out' } });

  const q = (s: string) => document.querySelector(s);
  const qAll = (s: string) => document.querySelectorAll(s);

  tl.from(q('.hero-greeting'),    { y: 28, opacity: 0, duration: 0.6 })
    .from(q('.hero-name'),        { y: 44, opacity: 0, duration: 0.85 }, '-=0.35')
    .from(q('.hero-title'),       { y: 24, opacity: 0, duration: 0.65 }, '-=0.45')
    .from(q('.hero-sub'),         { y: 20, opacity: 0, duration: 0.6  }, '-=0.35')
    .from(q('.hero-badges'),      { y: 16, opacity: 0, duration: 0.5  }, '-=0.3')
    .from(q('.hero-actions'),     { y: 16, opacity: 0, duration: 0.5  }, '-=0.25')
    .from(q('.hero-photo-ring'),  { scale: 0.68, opacity: 0, duration: 1.1,
                                    ease: 'back.out(1.3)'              }, '-=1.15')
    .from(qAll('.hero-chip'),     { scale: 0.5, opacity: 0, duration: 0.55,
                                    stagger: 0.18, ease: 'back.out(2)' }, '-=0.35')
    .from(q('.hero-scroll-indicator'), { opacity: 0, duration: 0.5    }, '-=0.1');

  return () => tl.kill();
}

// ─── 4. SCROLL REVEAL ───────────────────────────────────────────────────────
function initScrollReveal(): () => void {
  const ST = (el: Element | null | NodeListOf<Element>, vars: gsap.TweenVars,
              triggerEl?: Element | null) => {
    if (!el) return;
    const targets = el instanceof NodeList ? Array.from(el) : [el];
    targets.forEach((target, i) => {
      gsap.from(target, {
        ...vars,
        delay: (vars.delay as number ?? 0) + i * (vars.stagger as number ?? 0),
        stagger: 0,
        scrollTrigger: {
          trigger: triggerEl ?? target,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });
  };

  // Section headers
  document.querySelectorAll('.section-header').forEach(el =>
    gsap.from(el, {
      y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    })
  );

  // About
  gsap.from('.about-avatar', {
    x: -70, opacity: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-grid', start: 'top 85%', toggleActions: 'play none none none' },
  });
  document.querySelectorAll('.about-text p').forEach((p, i) =>
    gsap.from(p, {
      y: 22, opacity: 0, duration: 0.65, delay: i * 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: p, start: 'top 90%', toggleActions: 'play none none none' },
    })
  );
  gsap.from('.about-stats', {
    y: 30, opacity: 0, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { trigger: '.about-stats', start: 'top 88%', toggleActions: 'play none none none' },
  });

  // Skill tags — pop in with stagger
  document.querySelectorAll('.tag-cloud .tag').forEach((tag, i) =>
    gsap.from(tag, {
      scale: 0.4, opacity: 0, duration: 0.38, delay: (i % 8) * 0.04, ease: 'back.out(2)',
      scrollTrigger: { trigger: tag, start: 'top 95%', toggleActions: 'play none none none' },
    })
  );
  document.querySelectorAll('.tech-card').forEach((card, i) =>
    gsap.from(card, {
      y: 40, opacity: 0, duration: 0.6, delay: i * 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none none' },
    })
  );

  // Experience timeline — slide from left
  document.querySelectorAll('.timeline-item').forEach((item, i) =>
    gsap.from(item, {
      x: -65, opacity: 0, duration: 0.75, delay: i * 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' },
    })
  );

  // Projects — 3D perspective entrance
  document.querySelectorAll('.project-card').forEach((card, i) =>
    gsap.from(card, {
      y: 60, opacity: 0, rotateX: 12, scale: 0.96, transformOrigin: 'top center',
      duration: 0.85, delay: i * 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
    })
  );

  // Recognition
  gsap.from('.linkedin-post-card', {
    x: -65, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.recognition-grid', start: 'top 85%', toggleActions: 'play none none none' },
  });
  document.querySelectorAll('.award-card').forEach((card, i) =>
    gsap.from(card, {
      x: 65, opacity: 0, duration: 0.65, delay: i * 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
    })
  );

  // Education
  gsap.from('.edu-card', {
    y: 45, opacity: 0, scale: 0.96, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.edu-card', start: 'top 88%', toggleActions: 'play none none none' },
  });

  // Contact cards
  document.querySelectorAll('.contact-card').forEach((card, i) =>
    gsap.from(card, {
      y: 35, opacity: 0, duration: 0.55, delay: i * 0.07, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none none' },
    })
  );

  // Timeline line draw-in
  gsap.from('.timeline::before', {
    scaleY: 0, transformOrigin: 'top center', duration: 1.5, ease: 'power2.inOut',
    scrollTrigger: { trigger: '.timeline', start: 'top 80%', toggleActions: 'play none none none' },
  });

  return () => {};
}

// ─── 5. 3D CARD TILT ────────────────────────────────────────────────────────
function initCardTilt(): () => void {
  const SELECTORS = [
    '.tech-card', '.project-card', '.contact-card:not(.no-link)',
    '.award-card', '.linkedin-post-card', '.edu-card',
  ];
  const els = document.querySelectorAll<HTMLElement>(SELECTORS.join(','));
  const rafs = new Map<HTMLElement, number>();

  els.forEach(el => {
    // Inner shine overlay
    const shine = document.createElement('div');
    shine.className = 'tilt-shine';
    el.appendChild(shine);

    let tx = 0, ty = 0, cx = 0, cy = 0;
    let hovered = false;

    const loop = () => {
      if (!hovered && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) {
        rafs.delete(el);
        return;
      }
      rafs.set(el, requestAnimationFrame(loop));
      cx += (tx - cx) * 0.11;
      cy += (ty - cy) * 0.11;
      el.style.transform =
        `perspective(900px) rotateX(${cy}deg) rotateY(${cx}deg) scale3d(1.025,1.025,1.025)`;
    };

    el.addEventListener('mousemove', (e: MouseEvent) => {
      const r   = el.getBoundingClientRect();
      const dx  = (e.clientX - r.left) / r.width  - 0.5;
      const dy  = (e.clientY - r.top)  / r.height - 0.5;
      tx = dx * 14;
      ty = dy * -10;
      const px = ((e.clientX - r.left) / r.width)  * 100;
      const py = ((e.clientY - r.top)  / r.height) * 100;
      shine.style.background =
        `radial-gradient(circle at ${px}% ${py}%,rgba(255,255,255,0.09),transparent 55%)`;
    });

    el.addEventListener('mouseenter', () => {
      hovered = true;
      if (!rafs.has(el)) { rafs.set(el, requestAnimationFrame(loop)); }
    });

    el.addEventListener('mouseleave', () => {
      hovered = false;
      tx = 0; ty = 0;
      shine.style.background = 'transparent';
      if (!rafs.has(el)) { rafs.set(el, requestAnimationFrame(loop)); }
    });
  });

  return () => {
    rafs.forEach(id => cancelAnimationFrame(id));
    els.forEach(el => {
      el.querySelector('.tilt-shine')?.remove();
      el.style.transform = '';
    });
  };
}

// ─── 6. MOUSE PARALLAX on hero elements ─────────────────────────────────────
function initParallax(): () => void {
  let tx1 = 0, ty1 = 0, tx2 = 0, ty2 = 0;
  let cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0;
  let raf = 0;

  const glow1 = document.querySelector<HTMLElement>('.glow-1');
  const glow2 = document.querySelector<HTMLElement>('.glow-2');
  const chips = document.querySelectorAll<HTMLElement>('.hero-chip');

  const tick = () => {
    raf = requestAnimationFrame(tick);
    cx1 += (tx1 - cx1) * 0.055;
    cy1 += (ty1 - cy1) * 0.055;
    cx2 += (tx2 - cx2) * 0.035;
    cy2 += (ty2 - cy2) * 0.035;
    if (glow1) glow1.style.transform = `translate(${cx1}px,${cy1}px)`;
    if (glow2) glow2.style.transform = `translate(${cx2}px,${cy2}px)`;
    chips.forEach((c, i) => {
      const f = i === 0 ? 0.028 : -0.022;
      c.style.transform = `translate(${tx1 * f}px,${ty1 * f * 0.5}px)`;
    });
  };

  const onMove = (e: MouseEvent) => {
    const { innerWidth: W, innerHeight: H } = window;
    const dx = e.clientX - W / 2;
    const dy = e.clientY - H / 2;
    tx1 = dx * 0.038;  ty1 = dy * 0.028;
    tx2 = dx * -0.025; ty2 = dy * -0.018;
  };

  window.addEventListener('mousemove', onMove);
  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('mousemove', onMove);
  };
}

// ─── 7. MAGNETIC BUTTONS ────────────────────────────────────────────────────
function initMagneticButtons(): () => void {
  const moveMap = new WeakMap<HTMLElement, (e: MouseEvent) => void>();
  const offs: Array<() => void> = [];
  const btns = document.querySelectorAll<HTMLElement>('.btn-primary, .nav-cta');

  btns.forEach(btn => {
    const onEnter = () => {
      const fn = (e: MouseEvent) => {
        const r  = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top  + r.height / 2);
        gsap.to(btn, { x: dx * 0.28, y: dy * 0.28, duration: 0.35, ease: 'power2.out',
                        overwrite: true });
      };
      moveMap.set(btn, fn);
      window.addEventListener('mousemove', fn);
    };
    const onLeave = () => {
      const fn = moveMap.get(btn);
      if (fn) window.removeEventListener('mousemove', fn);
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)', overwrite: true });
    };
    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    offs.push(() => {
      btn.removeEventListener('mouseenter', onEnter);
      btn.removeEventListener('mouseleave', onLeave);
    });
  });

  return () => offs.forEach(f => f());
}

// ─── 8. STAT COUNTER ANIMATION ──────────────────────────────────────────────
function initCounters(): () => void {
  document.querySelectorAll<HTMLElement>('.stat-num').forEach(el => {
    const raw   = el.textContent ?? '';
    const match = raw.match(/([\d.]+)/);
    if (!match) return;
    const target  = parseFloat(match[1]);
    const isInt   = Number.isInteger(target);
    const pre     = raw.slice(0, match.index);
    const suf     = raw.slice((match.index ?? 0) + match[1].length);
    const proxy   = { v: 0 };

    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () =>
        gsap.to(proxy, {
          v: target, duration: 2.2, ease: 'power2.out',
          onUpdate: () => {
            el.textContent = pre + (isInt ? Math.round(proxy.v) : proxy.v.toFixed(1)) + suf;
          },
        }),
    });
  });
  return () => {};
}

// ─── 9. FLOATING GEOMETRIC SHAPES in section backgrounds ────────────────────
function initFloatingGeometrics(): () => void {
  const added: HTMLElement[] = [];
  const defs = [
    // [size, borderRadius, opacity, animDuration, delay]
    [50, '50%',  0.07, 12, 0   ],
    [35, '4px',  0.06, 16, -5  ],
    [65, '50%',  0.05, 10, -3  ],
    [28, '0',    0.08, 14, -8  ],
    [45, '12px', 0.06, 18, -2  ],
    [55, '50%',  0.05, 11, -6  ],
  ] as const;

  document.querySelectorAll<HTMLElement>('.section').forEach((sec, si) => {
    // Only pick 3 shapes per section, cycling through defs
    for (let i = 0; i < 3; i++) {
      const d   = defs[(si * 3 + i) % defs.length];
      const el  = document.createElement('div');
      el.className = 'geo-shape';
      el.style.cssText = [
        `width:${d[0]}px`, `height:${d[0]}px`,
        `border-radius:${d[1]}`,
        `border:1.5px solid rgba(26,86,219,${d[2]})`,
        `left:${8 + Math.random() * 84}%`,
        `top:${5  + Math.random() * 85}%`,
        `transform:rotate(${Math.random() * 360}deg)`,
        `animation:geoFloat ${d[3]}s ease-in-out infinite`,
        `animation-delay:${d[4]}s`,
      ].join(';');
      sec.appendChild(el);
      added.push(el);
    }
  });

  return () => added.forEach(el => el.remove());
}
