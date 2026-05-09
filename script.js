/* ==========================================================
   SENTRA TECHNOLOGIES — Main script
   Minimal: navbar scroll state, mobile menu, fade-ins, form.
   ========================================================== */

(() => {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    /* ---------- navbar scroll state ---------- */
    const onScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 24) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- mobile menu ---------- */
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navbar.classList.toggle('menu-open');
        });
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navbar.classList.remove('menu-open');
            });
        });
    }

    /* ---------- fade-in on scroll ---------- */
    const fadeTargets = document.querySelectorAll(
        '.section-head, .problem-item, .suite-product, .suite-services, .step, .approach-promise, .trust-card, .compliance-row, .contact-info, .contact-form, .hero-eyebrow, .hero-title, .hero-subtitle, .hero-cta-group, .hero-meta'
    );
    fadeTargets.forEach(el => el.classList.add('fade-in'));

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        fadeTargets.forEach(el => io.observe(el));
    } else {
        fadeTargets.forEach(el => el.classList.add('visible'));
    }

    /* ---------- contact form (front-end only, replace with backend later) ---------- */
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (form && success) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Validate required
            const required = form.querySelectorAll('[required]');
            let ok = true;
            required.forEach(r => { if (!r.value.trim()) ok = false; });
            if (!ok) return;

            // Simulate submit. Replace with fetch() to your backend / Formspree / etc.
            form.style.display = 'none';
            success.style.display = 'block';
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
})();
