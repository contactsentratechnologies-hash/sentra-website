/* ============================================
   SENTRA TECHNOLOGIES — Main Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initBrainAnimation();
    initScrollReveal();
    initStatCounters();
    initDemoTabs();
    initDemoMetrics();
    initDemoChart();
    initDemoFeed();
    initAutomationCanvas();
    initInsightsAnimations();
    initContactForm();
});

/* ============================================
   NAVBAR
   ============================================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const links = menu.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('open');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('open');
        });
    });
}

/* ============================================
   NEURAL BRAIN ANIMATION — Fluid & Dynamic
   ============================================ */
function initBrainAnimation() {
    const canvas = document.getElementById('brainCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], edges = [], mouse = { x: -999, y: -999 };
    let particles = [], cascades = [], ambientPulse = 0;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = rect.width; H = rect.height;
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // --- Brain shape (side profile, parametric) ---
    function brainR(angle) {
        const a = angle;
        let r = 1.0;
        // Frontal lobe (larger, front-top)
        r += 0.18 * Math.exp(-((a - 1.8) * (a - 1.8)) * 1.5);
        // Parietal dome
        r += 0.10 * Math.exp(-((a - 2.5) * (a - 2.5)) * 2.5);
        // Occipital bulge (back)
        r += 0.12 * Math.exp(-((a - 3.8) * (a - 3.8)) * 2.0);
        // Temporal (side-bottom)
        r += 0.06 * Math.exp(-((a - 5.3) * (a - 5.3)) * 2.5);
        // Flatten bottom
        r -= 0.15 * Math.exp(-((a - 4.7) * (a - 4.7)) * 1.2);
        // Indent at brain stem junction
        r -= 0.20 * Math.exp(-((a - 4.4) * (a - 4.4)) * 5.0);
        return r;
    }

    function brainPoint(angle, cx, cy, sx, sy) {
        const r = brainR(angle);
        return { x: cx + Math.cos(angle) * r * sx, y: cy + Math.sin(angle) * r * sy };
    }

    function isInBrain(px, py, cx, cy, sx, sy) {
        const dx = (px - cx), dy = (py - cy);
        const angle = (Math.atan2(dy / sy, dx / sx) + Math.PI * 2) % (Math.PI * 2);
        const r = brainR(angle);
        return (dx * dx) / (sx * sx * r * r) + (dy * dy) / (sy * sy * r * r) < 1;
    }

    // --- Build neural network ---
    function buildNetwork() {
        nodes = []; edges = []; particles = []; cascades = [];
        const cx = W / 2, cy = H / 2 - H * 0.03;
        const sx = Math.min(W, 520) * 0.36;
        const sy = Math.min(H, 520) * 0.32;
        const isMob = W < 600;
        const N = isMob ? 120 : 220;

        // Outline nodes (for visible brain shape)
        const outlineN = Math.floor(N * 0.2);
        for (let i = 0; i < outlineN; i++) {
            const a = (i / outlineN) * Math.PI * 2;
            const p = brainPoint(a, cx, cy, sx, sy);
            addNode(p.x, p.y, 1.0 + Math.random() * 1.2, 'edge');
        }

        // Interior nodes — Poisson-disc-ish fill
        let tries = 0;
        while (nodes.length < N && tries < N * 15) {
            tries++;
            const a = Math.random() * Math.PI * 2;
            const rFrac = Math.pow(Math.random(), 0.6) * 0.88; // bias towards centre
            const r = brainR(a) * rFrac;
            const x = cx + Math.cos(a) * r * sx + (Math.random() - 0.5) * 6;
            const y = cy + Math.sin(a) * r * sy + (Math.random() - 0.5) * 6;
            if (!isInBrain(x, y, cx, cy, sx, sy)) continue;
            // Min distance check
            let tooClose = false;
            for (const n of nodes) {
                if (Math.hypot(n.baseX - x, n.baseY - y) < (isMob ? 14 : 18)) { tooClose = true; break; }
            }
            if (tooClose) continue;
            addNode(x, y, 1.2 + Math.random() * 2.0, 'inner');
        }

        // Brain stem
        for (let i = 0; i < 10; i++) {
            const t = i / 10;
            const x = cx + (Math.random() - 0.5) * sx * 0.08;
            const y = cy + sy * 0.85 + t * sy * 0.45;
            addNode(x, y, 1.0 + Math.random(), 'stem');
        }

        // Cerebellum
        for (let i = 0; i < (isMob ? 12 : 18); i++) {
            const a = Math.PI * 0.55 + Math.random() * Math.PI * 0.55;
            const r = 0.1 + Math.random() * 0.16;
            const x = cx - sx * 0.35 + Math.cos(a) * r * sx;
            const y = cy + sy * 0.55 + Math.sin(a) * r * sy * 0.5;
            addNode(x, y, 0.8 + Math.random() * 1.2, 'cere');
        }

        // Build edge list (connect nearby nodes)
        const maxEdgeDist = isMob ? 60 : 75;
        for (let i = 0; i < nodes.length; i++) {
            const dists = [];
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                dists.push({ j, d: Math.hypot(nodes[i].baseX - nodes[j].baseX, nodes[i].baseY - nodes[j].baseY) });
            }
            dists.sort((a, b) => a.d - b.d);
            const maxConn = 3 + Math.floor(Math.random() * 3);
            let count = 0;
            for (const { j, d } of dists) {
                if (d > maxEdgeDist || count >= maxConn) break;
                if (!edges.some(e => (e.a === i && e.b === j) || (e.a === j && e.b === i))) {
                    edges.push({ a: i, b: j, strength: 1 - d / maxEdgeDist });
                    count++;
                }
            }
        }
    }

    function addNode(x, y, radius, region) {
        nodes.push({
            x, y, baseX: x, baseY: y, radius,
            phase: Math.random() * Math.PI * 2,
            speed: 0.004 + Math.random() * 0.008,
            drift: 2 + Math.random() * 4,
            energy: 0,        // 0 = resting, 1 = firing
            energyDecay: 0.015 + Math.random() * 0.01,
            region,
        });
    }

    // --- Cascade: chain-reaction firing through the network ---
    function triggerCascade(startIdx) {
        if (startIdx < 0 || startIdx >= nodes.length) return;
        cascades.push({ frontier: [{ idx: startIdx, delay: 0 }], visited: new Set(), age: 0 });
    }

    function updateCascades() {
        cascades = cascades.filter(c => c.age < 180); // ~3 seconds max
        cascades.forEach(c => {
            c.age++;
            const next = [];
            c.frontier.forEach(f => {
                f.delay--;
                if (f.delay > 0) { next.push(f); return; }
                if (c.visited.has(f.idx)) return;
                c.visited.add(f.idx);
                const node = nodes[f.idx];
                node.energy = 1.0;
                // Spawn signal particles along connected edges
                edges.forEach(e => {
                    let neighbor = -1;
                    if (e.a === f.idx) neighbor = e.b;
                    else if (e.b === f.idx) neighbor = e.a;
                    if (neighbor >= 0 && !c.visited.has(neighbor)) {
                        next.push({ idx: neighbor, delay: 4 + Math.floor(Math.random() * 6) });
                        particles.push({
                            from: f.idx, to: neighbor, t: 0,
                            speed: 0.02 + Math.random() * 0.025,
                            size: 1.5 + Math.random() * 2,
                            bright: true,
                        });
                    }
                });
            });
            c.frontier = next;
        });
    }

    // --- Ambient signal particles (always flowing) ---
    function spawnAmbient() {
        if (edges.length === 0) return;
        const e = edges[Math.floor(Math.random() * edges.length)];
        const dir = Math.random() < 0.5;
        particles.push({
            from: dir ? e.a : e.b, to: dir ? e.b : e.a, t: 0,
            speed: 0.008 + Math.random() * 0.012,
            size: 1 + Math.random() * 1.5,
            bright: false,
        });
    }

    // --- Mouse ---
    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
    canvas.addEventListener('click', e => {
        const r = canvas.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        let closest = -1, cd = 60;
        nodes.forEach((n, i) => { const d = Math.hypot(n.x - mx, n.y - my); if (d < cd) { cd = d; closest = i; } });
        if (closest >= 0) triggerCascade(closest);
    });

    // --- Render ---
    let time = 0, lastCascade = 0;
    function animate() {
        ctx.clearRect(0, 0, W, H);
        time += 0.016;
        ambientPulse = Math.sin(time * 0.3) * 0.5 + 0.5;

        const cx = W / 2, cy = H / 2 - H * 0.03;
        const sx = Math.min(W, 520) * 0.36;
        const sy = Math.min(H, 520) * 0.32;

        // --- Brain outline (smooth glowing path) ---
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
            const a = (i / 200) * Math.PI * 2;
            const p = brainPoint(a, cx, cy, sx, sy);
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();

        // Glow behind outline
        ctx.shadowColor = 'rgba(79,209,197,0.25)';
        ctx.shadowBlur = 18 + ambientPulse * 8;
        ctx.strokeStyle = `rgba(79,209,197,${0.18 + ambientPulse * 0.07})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Very subtle interior fill
        ctx.fillStyle = `rgba(79,209,197,${0.012 + ambientPulse * 0.006})`;
        ctx.fill();
        ctx.restore();

        // --- Central fissure (dividing line) ---
        ctx.save();
        ctx.beginPath();
        const fTop = brainPoint(1.95, cx, cy, sx, sy);
        const fBot = brainPoint(4.5, cx, cy, sx, sy);
        ctx.moveTo(fTop.x, fTop.y);
        ctx.bezierCurveTo(
            cx + sx * 0.02, cy - sy * 0.1,
            cx - sx * 0.03, cy + sy * 0.2,
            fBot.x, fBot.y
        );
        ctx.strokeStyle = `rgba(79,209,197,${0.1 + ambientPulse * 0.03})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // --- Brain stem ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - sx * 0.03, cy + sy * 0.82);
        ctx.bezierCurveTo(cx, cy + sy * 1.0, cx + sx * 0.02, cy + sy * 1.2, cx - sx * 0.01, cy + sy * 1.35);
        ctx.strokeStyle = `rgba(79,209,197,${0.12 + ambientPulse * 0.04})`;
        ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(79,209,197,0.15)'; ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();

        // --- Cerebellum outline ---
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= 50; i++) {
            const t = i / 50;
            const a = Math.PI * 0.55 + t * Math.PI * 0.55;
            const r = 0.2;
            const x = cx - sx * 0.35 + Math.cos(a) * r * sx;
            const y = cy + sy * 0.55 + Math.sin(a) * r * sy * 0.5;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(79,209,197,${0.09 + ambientPulse * 0.03})`;
        ctx.lineWidth = 1; ctx.stroke();
        // Horizontal ridges inside cerebellum
        for (let j = 0; j < 4; j++) {
            ctx.beginPath();
            const yOff = cy + sy * 0.52 + j * sy * 0.05;
            ctx.moveTo(cx - sx * 0.48, yOff);
            ctx.bezierCurveTo(cx - sx * 0.4, yOff - 3, cx - sx * 0.3, yOff + 3, cx - sx * 0.2, yOff);
            ctx.strokeStyle = `rgba(79,209,197,0.06)`;
            ctx.lineWidth = 0.8; ctx.stroke();
        }
        ctx.restore();

        // --- Update nodes ---
        nodes.forEach(n => {
            n.phase += n.speed;
            // Organic breathing motion
            const breathX = Math.sin(n.phase) * n.drift + Math.sin(n.phase * 0.37 + 1.3) * n.drift * 0.4;
            const breathY = Math.cos(n.phase * 0.8) * n.drift * 0.7 + Math.cos(n.phase * 0.23 + 2.1) * n.drift * 0.3;
            n.x = n.baseX + breathX;
            n.y = n.baseY + breathY;
            // Energy decay
            n.energy = Math.max(0, n.energy - n.energyDecay);
            // Mouse repulsion
            const dx = mouse.x - n.x, dy = mouse.y - n.y;
            const md = Math.hypot(dx, dy);
            if (md < 90 && md > 0) {
                const f = (90 - md) / 90 * 10;
                n.x -= (dx / md) * f; n.y -= (dy / md) * f;
                n.energy = Math.min(1, n.energy + 0.03); // glow on hover
            }
        });

        // --- Draw edges (curved, glowing when active) ---
        edges.forEach(e => {
            const a = nodes[e.a], b = nodes[e.b];
            const energy = Math.max(a.energy, b.energy);
            const baseAlpha = e.strength * 0.08;
            const alpha = baseAlpha + energy * 0.3;
            if (alpha < 0.015) return;

            // Curved connection (slight arc)
            const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.08;
            const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.08;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo(mx, my, b.x, b.y);

            if (energy > 0.3) {
                ctx.shadowColor = 'rgba(79,209,197,0.3)';
                ctx.shadowBlur = 6;
            }
            ctx.strokeStyle = `rgba(79,209,197,${Math.min(alpha, 0.5)})`;
            ctx.lineWidth = 0.4 + energy * 1.2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // --- Draw nodes (neurons) ---
        nodes.forEach(n => {
            const restGlow = (Math.sin(n.phase * 1.5) + 1) / 2 * 0.2 + 0.15;
            const alpha = restGlow + n.energy * 0.65;
            const r = n.radius + n.energy * 2.5;

            // Outer halo when firing
            if (n.energy > 0.2) {
                const haloR = r + 6 + n.energy * 8;
                const grad = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, haloR);
                grad.addColorStop(0, `rgba(79,209,197,${n.energy * 0.2})`);
                grad.addColorStop(1, 'rgba(79,209,197,0)');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2); ctx.fill();
            }

            // Core neuron
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            const coreGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
            coreGrad.addColorStop(0, `rgba(150,240,230,${alpha})`);
            coreGrad.addColorStop(1, `rgba(79,209,197,${alpha * 0.6})`);
            ctx.fillStyle = coreGrad;
            ctx.fill();
        });

        // --- Cascade logic ---
        updateCascades();
        // Auto-trigger cascades periodically
        if (time - lastCascade > 3.5) {
            lastCascade = time;
            const start = Math.floor(Math.random() * nodes.length);
            triggerCascade(start);
        }

        // --- Ambient particles ---
        if (Math.random() < 0.25) spawnAmbient();

        // --- Draw particles ---
        particles = particles.filter(p => p.t <= 1);
        particles.forEach(p => {
            p.t += p.speed;
            const from = nodes[p.from], to = nodes[p.to];
            // Curved path matching edge
            const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.08;
            const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.08;
            const t = p.t;
            const it = 1 - t;
            // Quadratic bezier interpolation
            const px = it * it * from.x + 2 * it * t * mx + t * t * to.x;
            const py = it * it * from.y + 2 * it * t * my + t * t * to.y;
            const lifeAlpha = Math.sin(t * Math.PI);

            if (p.bright) {
                // Bright cascade particle with trail
                const trailGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size + 6);
                trailGrad.addColorStop(0, `rgba(180,255,245,${lifeAlpha * 0.7})`);
                trailGrad.addColorStop(0.4, `rgba(79,209,197,${lifeAlpha * 0.3})`);
                trailGrad.addColorStop(1, 'rgba(79,209,197,0)');
                ctx.fillStyle = trailGrad;
                ctx.beginPath(); ctx.arc(px, py, p.size + 6, 0, Math.PI * 2); ctx.fill();
            }

            // Core dot
            ctx.beginPath();
            ctx.arc(px, py, p.size * (p.bright ? 1.3 : 0.9), 0, Math.PI * 2);
            ctx.fillStyle = p.bright
                ? `rgba(200,255,250,${lifeAlpha * 0.9})`
                : `rgba(79,209,197,${lifeAlpha * 0.45})`;
            ctx.fill();
        });

        // --- Global atmospheric glow ---
        const gx = cx - sx * 0.05, gy = cy;
        const gr = sx * 0.9 + Math.sin(time * 0.25) * 15;
        const atmo = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        atmo.addColorStop(0, `rgba(79,209,197,${0.03 + ambientPulse * 0.015})`);
        atmo.addColorStop(0.5, 'rgba(79,209,197,0.008)');
        atmo.addColorStop(1, 'rgba(79,209,197,0)');
        ctx.fillStyle = atmo;
        ctx.fillRect(0, 0, W, H);

        requestAnimationFrame(animate);
    }

    resize();
    buildNetwork();
    animate();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); buildNetwork(); }, 150);
    });
}

/* ============================================
   SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.section-header, .about-content, .about-stats, .solution-card, .case-card, .team-card, .contact-info, .contact-form-wrap, .demo-window'
    );
    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => observer.observe(el));
}

/* ============================================
   STAT COUNTERS
   ============================================ */
function initStatCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                animateCounter(el, 0, target, 1500);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

function animateCounter(el, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (end - start) * eased);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ============================================
   DEMO TABS
   ============================================ */
function initDemoTabs() {
    const buttons = document.querySelectorAll('.demo-nav-btn');
    const tabs = document.querySelectorAll('.demo-tab');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            buttons.forEach(b => b.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');

            // Trigger animations for the tab
            if (tabId === 'analytics') {
                setTimeout(animateInsights, 200);
            }
            if (tabId === 'automation') {
                initAutomationCanvas();
            }
        });
    });
}

/* ============================================
   DEMO METRICS (animated counters)
   ============================================ */
function initDemoMetrics() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateMetrics();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const metricsRow = document.querySelector('.demo-metrics-row');
    if (metricsRow) observer.observe(metricsRow);
}

function animateMetrics() {
    // Conversations
    animateValue('metric-conversations', 0, 1247, 2000, v => v.toLocaleString());
    // Response time
    animateValue('response-time', 0, 1.2, 2000, v => v.toFixed(1));
    // Satisfaction
    animateValue('satisfaction-rate', 0, 96, 2000, v => Math.round(v));
    // Resolved
    animateValue('resolved-count', 0, 384, 2000, v => Math.round(v));
}

function animateValue(id, start, end, duration, format) {
    const el = document.getElementById(id);
    if (!el) return;
    const startTime = performance.now();
    function update(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = start + (end - start) * eased;
        el.textContent = format(val);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ============================================
   DEMO CHART (Canvas area chart)
   ============================================ */
function initDemoChart() {
    const canvas = document.getElementById('demoChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function drawChart() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const w = rect.width - 40;
        const h = 180;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const data = [30, 45, 42, 60, 55, 75, 70, 85, 80, 95, 88, 105, 100, 115];
        const data2 = [20, 30, 28, 40, 38, 50, 48, 55, 52, 62, 58, 68, 64, 72];
        const maxVal = 120;
        const padding = { top: 10, bottom: 30, left: 10, right: 10 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        // Grid lines
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw area + line for data2 (secondary)
        drawAreaLine(ctx, data2, maxVal, chartW, chartH, padding, 'rgba(79, 209, 197, 0.08)', 'rgba(79, 209, 197, 0.3)');
        // Draw area + line for data (primary)
        drawAreaLine(ctx, data, maxVal, chartW, chartH, padding, 'rgba(79, 209, 197, 0.15)', 'rgba(79, 209, 197, 0.8)');

        // X-axis labels
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        labels.forEach((label, i) => {
            const x = padding.left + (chartW / (labels.length - 1)) * i;
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.font = '10px Montserrat, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, h - 8);
        });
    }

    function drawAreaLine(ctx, data, maxVal, chartW, chartH, padding, fillColor, strokeColor) {
        const step = chartW / (data.length - 1);
        const points = data.map((v, i) => ({
            x: padding.left + step * i,
            y: padding.top + chartH - (v / maxVal) * chartH
        }));

        // Smooth curve
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
        }
        // Complete area
        const areaPath = new Path2D();
        areaPath.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            areaPath.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
        }
        areaPath.lineTo(points[points.length - 1].x, padding.top + chartH);
        areaPath.lineTo(points[0].x, padding.top + chartH);
        areaPath.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill(areaPath);

        // Stroke
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                drawChart();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    observer.observe(canvas);
    window.addEventListener('resize', drawChart);
}

/* ============================================
   DEMO LIVE FEED
   ============================================ */
function initDemoFeed() {
    const feedList = document.getElementById('feedList');
    if (!feedList) return;

    const feedItems = [
        { color: 'green', text: 'New lead qualified — MedTech Solutions', time: '2s ago' },
        { color: 'teal', text: 'Appointment confirmed — Dr. Park, 3:30 PM', time: '14s ago' },
        { color: 'blue', text: 'Workflow "Onboarding-v3" completed successfully', time: '28s ago' },
        { color: 'orange', text: 'Escalation routed to Sarah M. — Priority High', time: '45s ago' },
        { color: 'green', text: 'Client survey response received — Score: 9/10', time: '1m ago' },
        { color: 'teal', text: 'Invoice #2847 auto-generated and sent', time: '2m ago' },
        { color: 'blue', text: 'AI resolved support ticket #4821 autonomously', time: '3m ago' },
        { color: 'green', text: 'New enterprise enquiry — Meridian Group', time: '4m ago' },
        { color: 'orange', text: 'System health check passed — all nodes operational', time: '5m ago' },
        { color: 'teal', text: 'Lead scoring model updated — accuracy 94.2%', time: '6m ago' },
    ];

    // Initial items
    feedItems.slice(0, 5).forEach(item => addFeedItem(feedList, item));

    // Add new items periodically
    let idx = 5;
    setInterval(() => {
        const item = feedItems[idx % feedItems.length];
        item.time = 'just now';
        addFeedItem(feedList, item, true);
        idx++;
        // Remove old items if too many
        while (feedList.children.length > 6) {
            feedList.removeChild(feedList.lastChild);
        }
    }, 4000);
}

function addFeedItem(container, item, prepend = false) {
    const div = document.createElement('div');
    div.className = 'feed-item';
    div.innerHTML = `
        <span class="feed-dot ${item.color}"></span>
        <span class="feed-text">${item.text}</span>
        <span class="feed-time">${item.time}</span>
    `;
    if (prepend) {
        container.insertBefore(div, container.firstChild);
    } else {
        container.appendChild(div);
    }
}

/* ============================================
   AUTOMATION CANVAS
   ============================================ */
function initAutomationCanvas() {
    const canvas = document.getElementById('automationCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = 280;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const nodeW = 130, nodeH = 44;
    const isMobile = window.innerWidth < 768;

    // Define workflow nodes
    const workflowNodes = isMobile ? [
        { id: 0, x: w * 0.5, y: 30, label: 'Customer Enquiry', type: 'input' },
        { id: 1, x: w * 0.25, y: 90, label: 'AI Classification', type: 'process' },
        { id: 2, x: w * 0.75, y: 90, label: 'Priority Scoring', type: 'process' },
        { id: 3, x: w * 0.5, y: 150, label: 'Auto-Route', type: 'decision' },
        { id: 4, x: w * 0.25, y: 210, label: 'CRM Update', type: 'process' },
        { id: 5, x: w * 0.75, y: 210, label: 'Team Alert', type: 'output' },
        { id: 6, x: w * 0.5, y: 255, label: 'Resolution', type: 'output' },
    ] : [
        { id: 0, x: w * 0.08, y: h * 0.5, label: 'Customer Enquiry', type: 'input' },
        { id: 1, x: w * 0.24, y: h * 0.25, label: 'AI Classification', type: 'process' },
        { id: 2, x: w * 0.24, y: h * 0.75, label: 'Sentiment Check', type: 'process' },
        { id: 3, x: w * 0.42, y: h * 0.5, label: 'Priority Scoring', type: 'decision' },
        { id: 4, x: w * 0.6, y: h * 0.25, label: 'Auto-Route', type: 'process' },
        { id: 5, x: w * 0.6, y: h * 0.75, label: 'CRM Update', type: 'process' },
        { id: 6, x: w * 0.78, y: h * 0.5, label: 'Team Alert', type: 'output' },
        { id: 7, x: w * 0.93, y: h * 0.5, label: 'Resolution', type: 'output' },
    ];

    const connections = isMobile
        ? [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[4,6],[5,6]]
        : [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[4,6],[5,6],[6,7]];

    let activeNodes = new Set();
    let flowParticles = [];
    let animFrame;

    function drawWorkflow() {
        ctx.clearRect(0, 0, w, h);

        // Draw connections
        connections.forEach(([from, to]) => {
            const a = workflowNodes[from], b = workflowNodes[to];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            // Curved connection
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            ctx.quadraticCurveTo(midX + (b.y - a.y) * 0.1, midY, b.x, b.y);
            const isActive = activeNodes.has(from) && activeNodes.has(to);
            ctx.strokeStyle = isActive ? 'rgba(79, 209, 197, 0.6)' : 'rgba(79, 209, 197, 0.15)';
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.stroke();
        });

        // Draw flow particles
        flowParticles.forEach(p => {
            const a = workflowNodes[p.from], b = workflowNodes[p.to];
            const x = a.x + (b.x - a.x) * p.t;
            const y = a.y + (b.y - a.y) * p.t;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 209, 197, ${Math.sin(p.t * Math.PI)})`;
            ctx.fill();
        });

        // Draw nodes
        workflowNodes.forEach(node => {
            const isActive = activeNodes.has(node.id);
            const nw = nodeW, nh = nodeH;
            const x = node.x - nw / 2, y = node.y - nh / 2;

            // Node background
            ctx.fillStyle = isActive ? 'rgba(79, 209, 197, 0.15)' : 'rgba(255, 255, 255, 0.04)';
            ctx.strokeStyle = isActive ? 'rgba(79, 209, 197, 0.6)' : 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = isActive ? 2 : 1;
            roundRect(ctx, x, y, nw, nh, 8);

            // Glow effect for active nodes
            if (isActive) {
                ctx.shadowColor = 'rgba(79, 209, 197, 0.3)';
                ctx.shadowBlur = 15;
                roundRect(ctx, x, y, nw, nh, 8);
                ctx.shadowBlur = 0;
            }

            // Label
            ctx.fillStyle = isActive ? '#4FD1C5' : 'rgba(255, 255, 255, 0.5)';
            ctx.font = `${isActive ? '600' : '400'} 11px Montserrat, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label, node.x, node.y);

            // Type indicator
            const dotColor = node.type === 'input' ? '#4FD1C5' :
                            node.type === 'decision' ? '#f5a623' :
                            node.type === 'output' ? '#27c93f' : '#4f9fd1';
            ctx.beginPath();
            ctx.arc(x + 10, y + 10, 3, 0, Math.PI * 2);
            ctx.fillStyle = isActive ? dotColor : `${dotColor}66`;
            ctx.fill();
        });

        // Update particles
        flowParticles = flowParticles.filter(p => {
            p.t += 0.012;
            return p.t <= 1;
        });

        animFrame = requestAnimationFrame(drawWorkflow);
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    function activateWorkflow(startId) {
        activeNodes.clear();
        flowParticles = [];

        // Cascade activation
        function activateNode(id, delay) {
            setTimeout(() => {
                activeNodes.add(id);
                // Find outgoing connections
                connections.forEach(([from, to]) => {
                    if (from === id) {
                        flowParticles.push({ from, to, t: 0 });
                        activateNode(to, 600);
                    }
                });
            }, delay);
        }
        activateNode(startId, 0);

        // Clear after full animation
        setTimeout(() => { activeNodes.clear(); }, 5000);
    }

    // Auto-activate periodically
    let autoTimer = setInterval(() => activateWorkflow(0), 7000);
    setTimeout(() => activateWorkflow(0), 500);

    // Click handler
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        workflowNodes.forEach(node => {
            if (Math.abs(mx - node.x) < nodeW / 2 && Math.abs(my - node.y) < nodeH / 2) {
                clearInterval(autoTimer);
                activateWorkflow(node.id);
                autoTimer = setInterval(() => activateWorkflow(0), 7000);
            }
        });
    });

    drawWorkflow();
}

/* ============================================
   INSIGHTS ANIMATIONS
   ============================================ */
function initInsightsAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateInsights();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const insightsTab = document.getElementById('tab-analytics');
    if (insightsTab) observer.observe(insightsTab);
}

function animateInsights() {
    // Animate insight bars
    document.querySelectorAll('.insight-bar').forEach(bar => {
        setTimeout(() => bar.classList.add('animated'), 300);
    });

    // Animate channel bars
    document.querySelectorAll('.channel-bar-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animated'), 400 + i * 150);
    });

    // Animate gauge
    drawGauge(92);

    // Animate sentiment ring
    drawSentimentRing(87);

    // Animate AI recommendations
    animateRecommendations();

    // Animate counter
    document.querySelectorAll('.counter-up').forEach(el => {
        const target = parseInt(el.dataset.val);
        animateCounter(el, 0, target, 1500);
    });
}

function drawGauge(value) {
    const canvas = document.getElementById('gaugeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 90, cy = 90;
    const radius = 70;

    function draw(current) {
        ctx.clearRect(0, 0, 180, 110);
        // Background arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI, 0, false);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Value arc
        const angle = Math.PI + (current / 100) * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI, angle, false);
        const grad = ctx.createLinearGradient(20, 0, 160, 0);
        grad.addColorStop(0, '#4FD1C5');
        grad.addColorStop(1, '#38b2ac');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    // Animate
    let current = 0;
    const gaugeLabel = document.querySelector('.gauge-value');
    function step() {
        current += (value - current) * 0.05;
        if (Math.abs(current - value) < 0.5) current = value;
        draw(current);
        if (gaugeLabel) gaugeLabel.textContent = Math.round(current) + '%';
        if (current < value) requestAnimationFrame(step);
    }
    step();
}

function drawSentimentRing(value) {
    const canvas = document.getElementById('sentimentCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 70, cy = 70, radius = 58;

    function draw(current) {
        ctx.clearRect(0, 0, 140, 140);
        // Background
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Value
        const angle = (current / 100) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, -Math.PI / 2, angle);
        ctx.strokeStyle = '#4FD1C5';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    let current = 0;
    function step() {
        current += (value - current) * 0.04;
        if (Math.abs(current - value) < 0.5) current = value;
        draw(current);
        if (current < value) requestAnimationFrame(step);
    }
    step();
}

function animateRecommendations() {
    const container = document.getElementById('aiRecommendations');
    if (!container) return;
    container.innerHTML = '';

    const recs = [
        { icon: '⚡', text: 'Peak enquiry volume detected between 9-11 AM. Consider adding automated triage during these hours to reduce response latency by an estimated 28%.' },
        { icon: '📊', text: 'WhatsApp channel conversion rate exceeds web chat by 34%. Recommend reallocating 15% of web budget to WhatsApp campaigns for Q3.' },
        { icon: '🔄', text: 'Three workflow bottlenecks identified in onboarding pipeline. Automating document verification step could save 3.2 hours per client.' },
    ];

    recs.forEach((rec, i) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'ai-rec';
            div.innerHTML = `<span class="ai-rec-icon">${rec.icon}</span><span class="ai-rec-text">${rec.text}</span>`;
            container.appendChild(div);
        }, i * 600);
    });
}

/* ============================================
   CONTACT FORM
   ============================================ */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect form data
        const data = new FormData(form);
        const name = data.get('name');
        const email = data.get('email');
        const company = data.get('company') || 'Not specified';
        const interest = data.get('interest') || 'General';
        const message = data.get('message') || 'No message provided';

        // Build mailto link as fallback
        const subject = encodeURIComponent(`New Enquiry from ${name} — ${company}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nInterest: ${interest}\n\nMessage:\n${message}`
        );
        const mailtoLink = `mailto:contact.sentra.technologies@gmail.com?subject=${subject}&body=${body}`;

        // Open mail client
        window.location.href = mailtoLink;

        // Show success message
        form.style.display = 'none';
        success.style.display = 'block';

        // Reset after 5 seconds
        setTimeout(() => {
            form.style.display = 'block';
            success.style.display = 'none';
            form.reset();
        }, 8000);
    });
}
