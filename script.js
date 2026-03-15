(function () {
  'use strict';

  /* CURSOR */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function cursorRAF() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    if (dot)  dot.style.cssText  = `left:${mx}px;top:${my}px`;
    if (ring) ring.style.cssText = `left:${rx}px;top:${ry}px`;
    requestAnimationFrame(cursorRAF);
  })();

  document.querySelectorAll('a,button,.pillar-card,.aud-card,.sec-pill,.stat-cell').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  /* SCROLL PROGRESS  */
  const bar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    if (bar) bar.style.width = pct + '%';
  }, { passive: true });


  const hdr = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });


  const hamBtn = document.getElementById('ham-btn');
  const mNav   = document.getElementById('mobile-nav');
  let menuOpen = false;

  function toggleMenu(f) {
    menuOpen = typeof f === 'boolean' ? f : !menuOpen;
    if (hamBtn) hamBtn.classList.toggle('open', menuOpen);
    if (mNav)   mNav.classList.toggle('open', menuOpen);
    if (hamBtn) hamBtn.setAttribute('aria-expanded', menuOpen);
    if (mNav)   mNav.setAttribute('aria-hidden', !menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }
  if (hamBtn) hamBtn.addEventListener('click', () => toggleMenu());
  document.querySelectorAll('.m-link').forEach(l => l.addEventListener('click', () => toggleMenu(false)));

  /* SMOOTH SCROLL */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const off = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || 68);
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
      toggleMenu(false);
    });
  });

  /* INTERSECTION OBSERVER REVEALS*/
  const revEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revEls.forEach(el => obs.observe(el));
  } else {
    revEls.forEach(el => el.classList.add('visible'));
  }

  /* ANIMATED STAT COUNTERS */
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const dur    = 1400;
      const start  = performance.now();
      function frame(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));

  /*MARQUEE TICKER */
  (function buildTicker() {
    const items = [
      'Digital Risk', 'Cyber Resilience', 'AI Governance', 'NIST Framework',
      'ISO 27001', 'NIS2', 'DORA Compliance', 'Threat Modelling',
      'Financial Services', 'Critical Infrastructure', 'Operational Risk',
      'Practitioner Deployment', 'IDR Academy'
    ];
    const ticker = document.getElementById('ticker');
    if (!ticker) return;
    const doubled = [...items, ...items];
    ticker.innerHTML = doubled.map(t =>
      `<span class="ticker-item">${t}<span class="ticker-sep">◆</span></span>`
    ).join('');
  })();

  /* HERO */
  (function heroCanvas() {
    const cv = document.getElementById('hero-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W, H, pts = [], animId;

    function resize() {
      W = cv.width  = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
      buildPts();
    }

    function buildPts() {
      pts = [];
      const n = Math.min(70, Math.floor(W * H / 12000));
      for (let i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.4 + 0.4,
          ph: Math.random() * Math.PI * 2
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      const g = 52;
      for (let x = 0; x <= W; x += g) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += g) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }

      // Sparse crosshairs
      ctx.strokeStyle = 'rgba(245,82,12,0.12)';
      ctx.lineWidth = 0.7;
      for (let x = 0; x <= W; x += g * 4) {
        for (let y = 0; y <= H; y += g * 4) {
          ctx.beginPath();
          ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y);
          ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5);
          ctx.stroke();
        }
      }

      // Lines between close points
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 170) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(245,82,12,${(1 - d / 170) * 0.2})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Animated dots
      pts.forEach(p => {
        p.ph += 0.013;
        const a = 0.15 + 0.25 * Math.sin(p.ph);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,82,12,${a})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      });

      animId = requestAnimationFrame(draw);
    }

    resize(); draw();
    let rT;
    window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(resize, 150); });
    document.addEventListener('visibilitychange', () => {
      document.hidden ? cancelAnimationFrame(animId) : (animId = requestAnimationFrame(draw));
    });
  })();

  /* ── PIPELINE ANIMATION ── */
  (function pipelineAnim() {
    const steps  = document.querySelectorAll('#pipeline-steps .ps');
    const fill   = document.getElementById('pipe-fill');
    if (!steps.length) return;
    let idx = 0;

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setTimeout(() => { if (fill) fill.classList.add('active'); }, 400);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    const pipeEl = document.querySelector('.pipeline-box');
    if (pipeEl) obs.observe(pipeEl);

    setInterval(() => {
      steps.forEach((s, i) => s.classList.toggle('live', i === idx));
      idx = (idx + 1) % steps.length;
    }, 1900);
  })();

  /* ── CONTACT FORM ── */
  const form    = document.getElementById('cform');
  const fmsgEl  = document.getElementById('fmsg-box');

  function show(type, msg) {
    if (!fmsgEl) return;
    fmsgEl.className   = `fmsg ${type}`;
    fmsgEl.textContent = msg;
    fmsgEl.style.display = 'block';
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name  = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      if (fmsgEl) { fmsgEl.className = 'fmsg'; fmsgEl.style.display = 'none'; }
      if (!name)  return show('err', 'Please enter your full name.');
      if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return show('err', 'Please enter a valid email address.');
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending\u2026';
      setTimeout(() => {
        show('ok', '\u2713 Message received. We\'ll be in touch shortly.');
        form.reset();
        btn.disabled = false;
        btn.innerHTML = 'Send Message <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>';
      }, 1300);
    });
  }

  /* ── FOOTER YEAR ── */
  const yr = document.getElementById('footer-yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();