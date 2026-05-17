/* ==========================================================
   SENTRA TECHNOLOGIES — Main script
   Navbar, mobile menu, accordion, scroll fade-ins, AJAX form.
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

    /* ---------- Suite accordion ---------- */
    const suiteRows = document.querySelectorAll('.suite-row');
    suiteRows.forEach(row => {
        const trigger = row.querySelector('.sr-trigger');
        if (!trigger) return;
        trigger.addEventListener('click', () => {
            const isOpen = row.getAttribute('data-expanded') === 'true';
            // Close all
            suiteRows.forEach(r => {
                r.setAttribute('data-expanded', 'false');
                const t = r.querySelector('.sr-trigger');
                if (t) t.setAttribute('aria-expanded', 'false');
            });
            // Toggle this one
            if (!isOpen) {
                row.setAttribute('data-expanded', 'true');
                trigger.setAttribute('aria-expanded', 'true');
                // Smooth-scroll the row into view if it's mostly below viewport
                requestAnimationFrame(() => {
                    const rect = row.getBoundingClientRect();
                    if (rect.top < 80 || rect.top > window.innerHeight - 200) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }
        });
    });

    /* ---------- Fade-in on scroll ---------- */
    const fadeTargets = document.querySelectorAll(
        '.section-head, .problem-item, .suite-row, .services-block, .industry-card, .step, .approach-promise, .stack-cat, .trust-card, .compliance-row, .contact-info, .contact-form, .hero-eyebrow, .hero-title, .hero-subtitle, .hero-cta-group, .hero-meta'
    );
    fadeTargets.forEach((el, i) => {
        el.classList.add('fade-in');
        // Tiny stagger for grid items
        if (el.classList.contains('problem-item') ||
            el.classList.contains('industry-card') ||
            el.classList.contains('trust-card') ||
            el.classList.contains('step')) {
            el.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;
        }
    });

    const revealNow = (el) => el.classList.add('visible');

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    revealNow(e.target);
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

        fadeTargets.forEach(el => {
            // Already in viewport on first paint? reveal immediately.
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                revealNow(el);
            } else {
                io.observe(el);
            }
        });

        // Safety net: ensure nothing stays hidden forever
        setTimeout(() => fadeTargets.forEach(revealNow), 3000);
    } else {
        fadeTargets.forEach(revealNow);
    }

    /* ---------- Contact form → mailto delivery ----------
       Builds a pre-filled mailto: link from the form fields and opens
       the user's email client. Reliable, no third-party dependency.
       Swap to Formspree / Web3Forms later for in-page submission. */
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');
    if (form && success) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Honeypot
            const honey = form.querySelector('[name="_honey"]');
            if (honey && honey.value) return;

            // Validate required fields
            const required = form.querySelectorAll('[required]');
            let ok = true;
            required.forEach(r => {
                if (!r.value.trim()) {
                    ok = false;
                    r.style.borderBottomColor = '#ef4444';
                    setTimeout(() => { r.style.borderBottomColor = ''; }, 2500);
                }
            });
            if (!ok) return;

            const get = (id) => (document.getElementById(id) || {}).value || '';
            const name = get('name').trim();
            const email = get('email').trim();
            const company = get('company').trim();
            const interest = get('interest').trim();
            const message = get('message').trim();

            const to = form.dataset.email || 'contact.sentra.technologies@gmail.com';
            const subject = `New enquiry — ${name || 'sentra-technologies.com'}`;
            const bodyLines = [
                `Full Name:     ${name}`,
                `Email:         ${email}`,
                `Organisation:  ${company || '—'}`,
                `Interest:      ${interest || '—'}`,
                '',
                'Message:',
                message || '(none provided)',
                '',
                '— Sent via sentratechnologies.com contact form'
            ];
            const mailto = `mailto:${to}` +
                `?subject=${encodeURIComponent(subject)}` +
                `&body=${encodeURIComponent(bodyLines.join('\n'))}`;

            if (submitBtn) submitBtn.setAttribute('data-loading', 'true');

            // Open the mail client
            window.location.href = mailto;

            // Show the success state after a short delay
            setTimeout(() => {
                if (submitBtn) submitBtn.removeAttribute('data-loading');
                form.style.display = 'none';
                success.style.display = 'block';
                success.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 600);
        });
    }

    /* ---------- Click-to-copy on email / WhatsApp values ---------- */
    document.querySelectorAll('.cc-value').forEach(node => {
        node.style.cursor = 'pointer';
        node.title = 'Click to copy';
        node.addEventListener('click', (e) => {
            e.preventDefault();
            const text = node.textContent.trim();
            if (!navigator.clipboard) return;
            navigator.clipboard.writeText(text).then(() => {
                const original = node.textContent;
                node.textContent = 'Copied to clipboard';
                setTimeout(() => { node.textContent = original; }, 1400);
            });
        });
    });
})();
