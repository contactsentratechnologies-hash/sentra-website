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
   NEURAL BRAIN ANIMATION — Anatomical Side-Profile
   ============================================ */
function initBrainAnimation() {
    const canvas = document.getElementById('brainCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, nodes = [], mouse = { x: -999, y: -999 };

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Brain side-profile outline (normalized 0-1 coords, side view of brain)
    function brainOutlinePoint(t) {
        // Parametric brain silhouette — side profile
        // t goes 0..1 around the brain shape
        const a = t * Math.PI * 2;

        // Base ellipse
        let x = Math.cos(a) * 0.48;
        let y = Math.sin(a) * 0.42;

        // Frontal lobe bulge (front-top)
        x += 0.08 * Math.exp(-Math.pow((a - 1.2), 2) * 3);
        y -= 0.12 * Math.exp(-Math.pow((a - 1.5), 2) * 2);

        // Parietal bulge (top)
        y -= 0.06 * Math.exp(-Math.pow((a - 2.0), 2) * 4);

        // Occipital lobe (back bulge)
        x -= 0.1 * Math.exp(-Math.pow((a - 3.5), 2) * 2);
        y -= 0.04 * Math.exp(-Math.pow((a - 3.2), 2) * 3);

        // Temporal lobe (bottom-front)
        x += 0.06 * Math.exp(-Math.pow((a - 5.2), 2) * 3);
        y += 0.08 * Math.exp(-Math.pow((a - 5.5), 2) * 2);

        // Flatten bottom slightly
        if (y > 0.28) y = 0.28 + (y - 0.28) * 0.3;

        return { x, y };
    }

    // Sulci/fissure curves across the brain surface
    function generateSulci(cx, cy, scaleX, scaleY) {
        const sulci = [];
        // Central sulcus (divides frontal/parietal)
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, 0.05, -0.38, 0.05, 0.15, 6, 0.04));
        // Lateral sulcus (Sylvian fissure)
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, -0.3, 0.05, 0.15, 0.12, 8, 0.03));
        // Precentral sulcus
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, 0.15, -0.35, 0.18, 0.1, 5, 0.03));
        // Superior frontal sulcus
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, 0.2, -0.18, 0.4, -0.12, 7, 0.025));
        // Inferior frontal sulcus
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, 0.15, -0.02, 0.35, 0.0, 6, 0.02));
        // Intraparietal sulcus
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, -0.05, -0.3, -0.25, -0.15, 6, 0.03));
        // Occipital sulci
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, -0.35, -0.15, -0.35, 0.1, 5, 0.025));
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, -0.28, -0.25, -0.4, -0.05, 4, 0.02));
        // Temporal sulci
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, -0.15, 0.18, 0.2, 0.2, 7, 0.02));
        sulci.push(generateCurve(cx, cy, scaleX, scaleY, -0.1, 0.26, 0.15, 0.25, 5, 0.015));
        return sulci;
    }

    function generateCurve(cx, cy, sx, sy, x1, y1, x2, y2, segments, wobble) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = x1 + (x2 - x1) * t + (Math.sin(t * Math.PI * 3) * wobble);
            const y = y1 + (y2 - y1) * t + (Math.cos(t * Math.PI * 2.5) * wobble * 0.8);
            points.push({ x: cx + x * sx, y: cy + y * sy });
        }
        return points;
    }

    // Check if point is inside the brain outline
    function isInsideBrain(px, py, cx, cy, scaleX, scaleY) {
        const dx = (px - cx) / scaleX;
        const dy = (py - cy) / scaleY;
        // Approximate brain shape test using polar distance
        const angle = Math.atan2(dy, dx);
        const ref = brainOutlinePoint((angle + Math.PI * 2) / (Math.PI * 2) % 1);
        const refDist = Math.hypot(ref.x, ref.y);
        const ptDist = Math.hypot(dx, dy);
        return ptDist < refDist * 0.92;
    }

    function generateBrainNodes() {
        nodes = [];
        const cx = width / 2, cy = height / 2 - 10;
        const scaleX = Math.min(width, 500) * 0.42;
        const scaleY = Math.min(height, 500) * 0.38;
        const nodeCount = window.innerWidth < 768 ? 100 : 200;

        // Place nodes along the brain outline
        for (let i = 0; i < Math.floor(nodeCount * 0.3); i++) {
            const t = i / Math.floor(nodeCount * 0.3);
            const bp = brainOutlinePoint(t);
            const jitter = 0.03;
            const x = cx + (bp.x + (Math.random() - 0.5) * jitter) * scaleX;
            const y = cy + (bp.y + (Math.random() - 0.5) * jitter) * scaleY;
            nodes.push(createNode(x, y, 1.2 + Math.random() * 1.5, 'outline'));
        }

        // Fill interior with nodes
        let attempts = 0;
        while (nodes.length < nodeCount && attempts < nodeCount * 10) {
            attempts++;
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 0.85;
            const bp = brainOutlinePoint(angle / (Math.PI * 2));
            const x = cx + bp.x * r * scaleX + (Math.random() - 0.5) * 10;
            const y = cy + bp.y * r * scaleY + (Math.random() - 0.5) * 10;
            if (isInsideBrain(x, y, cx, cy, scaleX, scaleY)) {
                nodes.push(createNode(x, y, 1 + Math.random() * 2.5, 'interior'));
            }
        }

        // Brain stem nodes
        for (let i = 0; i < 15; i++) {
            const t = i / 15;
            const x = cx - 0.02 * scaleX + (Math.random() - 0.5) * scaleX * 0.12;
            const y = cy + 0.32 * scaleY + t * scaleY * 0.35;
            nodes.push(createNode(x, y, 1 + Math.random() * 1.5, 'stem'));
        }

        // Cerebellum nodes (back-bottom)
        for (let i = 0; i < 20; i++) {
            const angle = Math.PI * 0.6 + Math.random() * Math.PI * 0.5;
            const r = 0.12 + Math.random() * 0.14;
            const x = cx - 0.28 * scaleX + Math.cos(angle) * r * scaleX;
            const y = cy + 0.22 * scaleY + Math.sin(angle) * r * scaleY * 0.6;
            nodes.push(createNode(x, y, 0.8 + Math.random() * 1.5, 'cerebellum'));
        }
    }

    function createNode(x, y, radius, region) {
        return {
            x, y, baseX: x, baseY: y, radius,
            phase: Math.random() * Math.PI * 2,
            speed: 0.003 + Math.random() * 0.01,
            drift: 3 + Math.random() * 6,
            pulse: 0, region,
        };
    }

    let particles = [];
    let sulciPaths = [];

    function spawnParticle() {
        if (nodes.length < 2) return;
        const a = Math.floor(Math.random() * nodes.length);
        let closest = -1, closestDist = 130;
        for (let i = 0; i < nodes.length; i++) {
            if (i === a) continue;
            const d = dist(nodes[a], nodes[i]);
            if (d < closestDist && Math.random() < 0.25) {
                closestDist = d;
                closest = i;
            }
        }
        if (closest === -1) return;
        particles.push({
            from: a, to: closest, t: 0,
            speed: 0.006 + Math.random() * 0.012,
            size: 1.5 + Math.random() * 2,
        });
    }

    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    let time = 0;
    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += 0.016;
        const cx = width / 2, cy = height / 2 - 10;
        const scaleX = Math.min(width, 500) * 0.42;
        const scaleY = Math.min(height, 500) * 0.38;

        // Draw brain outline (subtle glow)
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const bp = brainOutlinePoint(t);
            const x = cx + bp.x * scaleX;
            const y = cy + bp.y * scaleY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(79, 209, 197, ${0.12 + Math.sin(time * 0.3) * 0.04})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Subtle fill
        ctx.fillStyle = 'rgba(79, 209, 197, 0.015)';
        ctx.fill();

        // Draw cerebellum outline
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
            const t = i / 40;
            const angle = Math.PI * 0.6 + t * Math.PI * 0.5;
            const r = 0.18;
            const x = cx - 0.28 * scaleX + Math.cos(angle) * r * scaleX;
            const y = cy + 0.22 * scaleY + Math.sin(angle) * r * scaleY * 0.6;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(79, 209, 197, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw sulci (brain folds/grooves)
        const sulci = generateSulci(cx, cy, scaleX, scaleY);
        sulci.forEach(curve => {
            ctx.beginPath();
            ctx.moveTo(curve[0].x, curve[0].y);
            for (let i = 1; i < curve.length; i++) {
                const prev = curve[i - 1];
                const curr = curve[i];
                const cpx = (prev.x + curr.x) / 2;
                ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
            }
            ctx.strokeStyle = `rgba(79, 209, 197, ${0.08 + Math.sin(time * 0.5) * 0.02})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Brain stem
        ctx.beginPath();
        ctx.moveTo(cx - 0.04 * scaleX, cy + 0.32 * scaleY);
        ctx.quadraticCurveTo(cx - 0.02 * scaleX, cy + 0.5 * scaleY, cx, cy + 0.65 * scaleY);
        ctx.strokeStyle = 'rgba(79, 209, 197, 0.12)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(79, 209, 197, 0.06)';
        ctx.beginPath();
        ctx.moveTo(cx + 0.02 * scaleX, cy + 0.32 * scaleY);
        ctx.quadraticCurveTo(cx + 0.01 * scaleX, cy + 0.5 * scaleY, cx - 0.01 * scaleX, cy + 0.65 * scaleY);
        ctx.stroke();
        ctx.lineCap = 'butt';

        // Update nodes
        nodes.forEach(n => {
            n.phase += n.speed;
            n.x = n.baseX + Math.sin(n.phase) * n.drift * 0.4;
            n.y = n.baseY + Math.cos(n.phase * 0.7) * n.drift * 0.3;
            n.pulse = (Math.sin(n.phase * 2) + 1) / 2;

            const mx = mouse.x - n.x;
            const my = mouse.y - n.y;
            const md = Math.hypot(mx, my);
            if (md < 100) {
                const force = (100 - md) / 100 * 12;
                n.x -= (mx / md) * force * 0.25;
                n.y -= (my / md) * force * 0.25;
            }
        });

        // Draw connections (neural network style)
        const maxDist = window.innerWidth < 768 ? 55 : 70;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const d = dist(nodes[i], nodes[j]);
                if (d < maxDist) {
                    const alpha = (1 - d / maxDist) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(79, 209, 197, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Draw nodes (neurons)
        nodes.forEach(n => {
            const glow = n.pulse * 0.35 + 0.25;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 209, 197, ${glow})`;
            ctx.fill();

            // Firing glow
            if (n.pulse > 0.7) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius + 5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(79, 209, 197, ${(n.pulse - 0.7) * 0.12})`;
                ctx.fill();
            }
        });

        // Spawn & draw signal particles
        if (Math.random() < 0.2) spawnParticle();
        particles = particles.filter(p => p.t <= 1);
        particles.forEach(p => {
            p.t += p.speed;
            const from = nodes[p.from];
            const to = nodes[p.to];
            const x = from.x + (to.x - from.x) * p.t;
            const y = from.y + (to.y - from.y) * p.t;
            const alpha = Math.sin(p.t * Math.PI) * 0.9;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 209, 197, ${alpha})`;
            ctx.fill();
            // Particle trail glow
            ctx.beginPath();
            ctx.arc(x, y, p.size + 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 209, 197, ${alpha * 0.15})`;
            ctx.fill();
        });

        // Pulsing core glow at brain center
        const glowR = 80 + Math.sin(time * 0.4) * 25;
        const grad = ctx.createRadialGradient(cx - scaleX * 0.05, cy - scaleY * 0.05, 0, cx, cy, glowR);
        grad.addColorStop(0, 'rgba(79, 209, 197, 0.05)');
        grad.addColorStop(0.5, 'rgba(79, 209, 197, 0.02)');
        grad.addColorStop(1, 'rgba(79, 209, 197, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        requestAnimationFrame(animate);
    }

    resize();
    generateBrainNodes();
    animate();
    window.addEventListener('resize', () => { resize(); generateBrainNodes(); });
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
