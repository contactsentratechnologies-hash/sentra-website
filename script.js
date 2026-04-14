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
    initAgentChat();
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
   HERO ANIMATION — 3D Intelligence Constellation
   ============================================ */
function initBrainAnimation() {
    const canvas = document.getElementById('brainCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], edges = [];
    let mouse = { x: 0.5, y: 0.5 }; // normalised
    let signals = [];

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = rect.width; H = rect.height;
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // --- 3D point cloud forming a sphere/toroid structure ---
    function buildConstellation() {
        nodes = []; edges = []; signals = [];
        const isMob = W < 600;
        const count = isMob ? 60 : 110;
        const spread = Math.min(W, H) * 0.38;

        // Core cluster — sphere distribution
        for (let i = 0; i < count * 0.6; i++) {
            // Fibonacci sphere
            const phi = Math.acos(1 - 2 * (i + 0.5) / (count * 0.6));
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const r = spread * (0.4 + Math.random() * 0.3);
            nodes.push({
                x3d: Math.sin(phi) * Math.cos(theta) * r,
                y3d: Math.sin(phi) * Math.sin(theta) * r * 0.7,
                z3d: Math.cos(phi) * r,
                size: 1.5 + Math.random() * 2,
                layer: 'core',
                phase: Math.random() * Math.PI * 2,
                orbitSpeed: (0.0003 + Math.random() * 0.0004) * (Math.random() < 0.5 ? 1 : -1),
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }

        // Outer ring — orbital nodes
        for (let i = 0; i < count * 0.25; i++) {
            const angle = (i / (count * 0.25)) * Math.PI * 2 + Math.random() * 0.3;
            const r = spread * (0.7 + Math.random() * 0.25);
            const yOff = (Math.random() - 0.5) * spread * 0.3;
            nodes.push({
                x3d: Math.cos(angle) * r,
                y3d: yOff,
                z3d: Math.sin(angle) * r,
                size: 1 + Math.random() * 1.5,
                layer: 'orbit',
                phase: Math.random() * Math.PI * 2,
                orbitSpeed: 0.0006 + Math.random() * 0.0003,
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }

        // Satellites — distant accent nodes
        for (let i = 0; i < count * 0.15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = spread * (0.9 + Math.random() * 0.35);
            const yOff = (Math.random() - 0.5) * spread * 0.6;
            nodes.push({
                x3d: Math.cos(angle) * r,
                y3d: yOff,
                z3d: Math.sin(angle) * r,
                size: 0.8 + Math.random() * 1,
                layer: 'sat',
                phase: Math.random() * Math.PI * 2,
                orbitSpeed: (0.0002 + Math.random() * 0.0003) * (Math.random() < 0.5 ? 1 : -1),
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }

        // Build edges based on 3D proximity
        const maxDist = spread * (isMob ? 0.55 : 0.45);
        for (let i = 0; i < nodes.length; i++) {
            const dists = [];
            for (let j = i + 1; j < nodes.length; j++) {
                const d = Math.hypot(
                    nodes[i].x3d - nodes[j].x3d,
                    nodes[i].y3d - nodes[j].y3d,
                    nodes[i].z3d - nodes[j].z3d
                );
                if (d < maxDist) dists.push({ j, d });
            }
            dists.sort((a, b) => a.d - b.d);
            const maxEdges = nodes[i].layer === 'core' ? 4 : 2;
            dists.slice(0, maxEdges).forEach(({ j, d }) => {
                edges.push({ a: i, b: j, dist: d, maxDist });
            });
        }
    }

    // --- 3D to 2D projection with perspective ---
    function project(x3d, y3d, z3d, rotY, rotX) {
        // Rotate around Y axis (horizontal orbit)
        let x = x3d * Math.cos(rotY) - z3d * Math.sin(rotY);
        let z = x3d * Math.sin(rotY) + z3d * Math.cos(rotY);
        let y = y3d;
        // Slight X rotation (tilt based on mouse)
        const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
        const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
        y = y2; z = z2;

        // Perspective
        const fov = 600;
        const scale = fov / (fov + z + 300);
        return {
            x: W / 2 + x * scale,
            y: H / 2 + y * scale,
            scale,
            z,
        };
    }

    // --- Signal pulses along edges ---
    function spawnSignal() {
        if (edges.length === 0) return;
        const e = edges[Math.floor(Math.random() * edges.length)];
        const dir = Math.random() < 0.5;
        signals.push({
            a: dir ? e.a : e.b,
            b: dir ? e.b : e.a,
            t: 0,
            speed: 0.008 + Math.random() * 0.012,
            size: 1.5 + Math.random() * 1.5,
        });
    }

    // --- Mouse tracking ---
    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = (e.clientX - r.left) / W;
        mouse.y = (e.clientY - r.top) / H;
    });

    // --- Render loop ---
    let time = 0;
    const baseRotSpeed = 0.0004;

    function animate() {
        ctx.clearRect(0, 0, W, H);
        time++;

        // Rotation influenced by mouse (parallax)
        const rotY = time * baseRotSpeed + (mouse.x - 0.5) * 0.6;
        const rotX = (mouse.y - 0.5) * 0.3;

        // Update 3D positions (slow orbit)
        nodes.forEach(n => {
            n.phase += n.orbitSpeed;
            const cos = Math.cos(n.orbitSpeed);
            const sin = Math.sin(n.orbitSpeed);
            const x = n.x3d * cos - n.z3d * sin;
            const z = n.x3d * sin + n.z3d * cos;
            n.x3d = x; n.z3d = z;
        });

        // Project all nodes
        const projected = nodes.map((n, i) => {
            const p = project(n.x3d, n.y3d, n.z3d, rotY, rotX);
            return { ...p, idx: i, node: n };
        });

        // Sort by depth (far to near)
        projected.sort((a, b) => a.z - b.z);

        // --- Draw edges ---
        edges.forEach(e => {
            const pa = project(nodes[e.a].x3d, nodes[e.a].y3d, nodes[e.a].z3d, rotY, rotX);
            const pb = project(nodes[e.b].x3d, nodes[e.b].y3d, nodes[e.b].z3d, rotY, rotX);
            const avgScale = (pa.scale + pb.scale) / 2;
            const depthAlpha = Math.pow(avgScale, 2);
            const distFade = 1 - (e.dist / e.maxDist);
            const alpha = distFade * depthAlpha * 0.15;
            if (alpha < 0.008) return;

            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = `rgba(79,209,197,${alpha})`;
            ctx.lineWidth = avgScale * 0.8;
            ctx.stroke();
        });

        // --- Draw nodes (sorted far-to-near for depth) ---
        projected.forEach(p => {
            const n = p.node;
            const depthAlpha = Math.pow(p.scale, 1.5);
            const pulse = (Math.sin(time * 0.02 + n.pulsePhase) + 1) / 2;
            const r = n.size * p.scale * (1 + pulse * 0.3);
            const alpha = depthAlpha * (0.3 + pulse * 0.4);

            // Outer glow
            if (r > 1 && alpha > 0.15) {
                const glowR = r + 4 * p.scale;
                const grad = ctx.createRadialGradient(p.x, p.y, r * 0.3, p.x, p.y, glowR);
                grad.addColorStop(0, `rgba(79,209,197,${alpha * 0.2})`);
                grad.addColorStop(1, 'rgba(79,209,197,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
                ctx.fill();
            }

            // Core
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(r, 0.5), 0, Math.PI * 2);
            ctx.fillStyle = n.layer === 'core'
                ? `rgba(140,240,230,${alpha})`
                : n.layer === 'orbit'
                    ? `rgba(79,209,197,${alpha * 0.85})`
                    : `rgba(60,180,175,${alpha * 0.6})`;
            ctx.fill();
        });

        // --- Signal particles ---
        if (Math.random() < 0.12) spawnSignal();
        signals = signals.filter(s => s.t <= 1);
        signals.forEach(s => {
            s.t += s.speed;
            const na = nodes[s.a], nb = nodes[s.b];
            const x3d = na.x3d + (nb.x3d - na.x3d) * s.t;
            const y3d = na.y3d + (nb.y3d - na.y3d) * s.t;
            const z3d = na.z3d + (nb.z3d - na.z3d) * s.t;
            const p = project(x3d, y3d, z3d, rotY, rotX);
            const life = Math.sin(s.t * Math.PI);
            const r = s.size * p.scale;

            // Glow trail
            const tGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r + 5 * p.scale);
            tGrad.addColorStop(0, `rgba(180,255,248,${life * 0.6 * p.scale})`);
            tGrad.addColorStop(0.5, `rgba(79,209,197,${life * 0.2 * p.scale})`);
            tGrad.addColorStop(1, 'rgba(79,209,197,0)');
            ctx.fillStyle = tGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r + 5 * p.scale, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220,255,250,${life * 0.8 * p.scale})`;
            ctx.fill();
        });

        // --- Subtle central atmosphere ---
        const gr = Math.min(W, H) * 0.35;
        const atmo = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, gr);
        atmo.addColorStop(0, 'rgba(79,209,197,0.025)');
        atmo.addColorStop(1, 'rgba(79,209,197,0)');
        ctx.fillStyle = atmo;
        ctx.fillRect(0, 0, W, H);

        requestAnimationFrame(animate);
    }

    resize();
    buildConstellation();
    animate();

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); buildConstellation(); }, 150); });
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
function initAgentChat() {
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatPrompts = document.getElementById('chatPrompts');
    if (!chatMessages || !chatInput) return;

    let isProcessing = false;

    const agentResponses = {
        'security': {
            steps: [
                '> Initiating infrastructure security scan...',
                '> Scanning 14 endpoints across 3 regions...',
                '> Running vulnerability assessment (CVE database 2026.04)...',
                '> Checking TLS configurations...',
                '> Analyzing IAM policies and access controls...',
            ],
            result: 'Scan complete. 14/14 endpoints secured. TLS 1.3 enforced across all services. 2 minor IAM policy recommendations flagged — non-critical. No CVEs detected. Full report generated.'
        },
        'automation': {
            steps: [
                '> Pulling automation metrics for today...',
                '> Querying workflow execution logs...',
                '> Calculating time savings across 14 active workflows...',
            ],
            result: 'Today\'s automation performance: 2,847 tasks automated, 14.2 hours saved, 99.7% success rate, 0 errors. Top workflow: "Client Onboarding v3" — processed 312 tasks with 100% accuracy. Recommendation: Scale "Invoice Processing" workflow to handle 40% more volume.'
        },
        'report': {
            steps: [
                '> Aggregating data from all platform modules...',
                '> Calculating KPIs across engagement, automation, and insights...',
                '> Generating executive summary...',
                '> Formatting report with visual data...',
            ],
            result: 'Weekly report generated. Highlights: Active conversations up 12.4%, response time improved by 34.2%, customer satisfaction at 96.8%. Revenue impact: $284K recovered through automation this quarter (78% of target). 3 AI-generated recommendations attached. Report ready for download.'
        },
        'compliance': {
            steps: [
                '> Checking compliance status across all modules...',
                '> Validating GDPR data handling procedures...',
                '> Verifying SOC 2 control effectiveness...',
                '> Auditing encryption standards...',
            ],
            result: 'Compliance status: All green. GDPR: Fully compliant. SOC 2 Type II: All controls operational. ISO 27001: Aligned. Data encryption: AES-256 at rest, TLS 1.3 in transit across all services. Next audit scheduled in 23 days.'
        },
        'threat': {
            steps: [
                '> Scanning threat intelligence feeds...',
                '> Analyzing network traffic patterns...',
                '> Checking endpoint detection logs...',
                '> Cross-referencing with known threat actors...',
            ],
            result: 'Threat landscape clear. No active threats detected. 847 blocked intrusion attempts this week (automated). Firewall rules up to date. Next scheduled penetration test: April 28. Recommendation: Enable enhanced logging on API gateway for deeper visibility.'
        },
        'default': {
            steps: [
                '> Processing your request...',
                '> Analyzing available data...',
                '> Generating response...',
            ],
            result: 'I can help with security scans, automation metrics, performance reports, compliance checks, and threat analysis. Try asking about any of these areas, or use the quick-action buttons above.'
        }
    };

    function getResponseKey(input) {
        const lower = input.toLowerCase();
        if (lower.includes('security') || lower.includes('scan') || lower.includes('vulnerab')) return 'security';
        if (lower.includes('automation') || lower.includes('workflow') || lower.includes('performance') || lower.includes('stats')) return 'automation';
        if (lower.includes('report') || lower.includes('weekly') || lower.includes('summary') || lower.includes('overview')) return 'report';
        if (lower.includes('compliance') || lower.includes('gdpr') || lower.includes('soc') || lower.includes('audit')) return 'compliance';
        if (lower.includes('threat') || lower.includes('attack') || lower.includes('intrusion') || lower.includes('firewall')) return 'threat';
        return 'default';
    }

    function addMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${type}`;
        msg.innerHTML = `<div class="chat-bubble">${text}</div>`;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msg;
    }

    async function typeText(element, text, speed = 12) {
        const bubble = element.querySelector('.chat-bubble');
        bubble.textContent = '';
        for (let i = 0; i < text.length; i++) {
            bubble.textContent += text[i];
            chatMessages.scrollTop = chatMessages.scrollHeight;
            await new Promise(r => setTimeout(r, speed));
        }
    }

    async function processInput(input) {
        if (isProcessing || !input.trim()) return;
        isProcessing = true;

        // Add user message
        addMessage(input, 'user');
        chatInput.value = '';

        // Get response data
        const key = getResponseKey(input);
        const data = agentResponses[key];

        // Show processing steps with delays
        for (const step of data.steps) {
            await new Promise(r => setTimeout(r, 600));
            const stepMsg = addMessage('', 'agent');
            await typeText(stepMsg, step, 8);
        }

        // Show final result
        await new Promise(r => setTimeout(r, 400));
        const resultMsg = addMessage('', 'agent');
        await typeText(resultMsg, data.result, 10);

        // Update prompts for follow-up
        updatePrompts(key);

        isProcessing = false;
    }

    function updatePrompts(lastKey) {
        const followUps = {
            'security': [
                { label: 'Compliance check', prompt: 'Run a compliance audit on our systems' },
                { label: 'Threat analysis', prompt: 'Show me the latest threat intelligence report' },
                { label: 'Weekly report', prompt: 'Generate a weekly performance report' },
            ],
            'automation': [
                { label: 'Security scan', prompt: 'Run a security scan on our infrastructure' },
                { label: 'Weekly report', prompt: 'Generate a weekly performance report' },
                { label: 'Threat analysis', prompt: 'Show me the latest threat intelligence report' },
            ],
            'report': [
                { label: 'Security scan', prompt: 'Run a security scan on our infrastructure' },
                { label: 'Automation stats', prompt: 'Show me today\'s automation performance' },
                { label: 'Compliance check', prompt: 'Run a compliance audit on our systems' },
            ],
            'compliance': [
                { label: 'Security scan', prompt: 'Run a security scan on our infrastructure' },
                { label: 'Threat analysis', prompt: 'Show me the latest threat intelligence report' },
                { label: 'Automation stats', prompt: 'Show me today\'s automation performance' },
            ],
            'threat': [
                { label: 'Security scan', prompt: 'Run a security scan on our infrastructure' },
                { label: 'Compliance check', prompt: 'Run a compliance audit on our systems' },
                { label: 'Weekly report', prompt: 'Generate a weekly performance report' },
            ],
            'default': [
                { label: 'Security scan', prompt: 'Run a security scan on our infrastructure' },
                { label: 'Automation stats', prompt: 'Show me today\'s automation performance' },
                { label: 'Compliance check', prompt: 'Run a compliance audit on our systems' },
            ]
        };

        const prompts = followUps[lastKey] || followUps['default'];
        chatPrompts.innerHTML = prompts.map(p =>
            `<button class="chat-prompt-btn" data-prompt="${p.prompt}">${p.label}</button>`
        ).join('');
        bindPromptButtons();
    }

    function bindPromptButtons() {
        chatPrompts.querySelectorAll('.chat-prompt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                processInput(btn.dataset.prompt);
            });
        });
    }

    // Event listeners
    chatSend.addEventListener('click', () => processInput(chatInput.value));
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') processInput(chatInput.value);
    });
    bindPromptButtons();
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
