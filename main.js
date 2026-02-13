document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Scroll Reveal — use IntersectionObserver for better performance
    const revealElements = document.querySelectorAll('.reveal');
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
        // If user prefers reduced motion, reveal everything instantly
        revealElements.forEach(el => el.classList.add('active'));
    } else if (revealElements.length) {
        const ro = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealElements.forEach(el => ro.observe(el));
    }

    // Animated Counters
    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    };

    // Observer for counters
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
            }
        });
    }, { threshold: 0.5 });

    // Observe all stat counters
    document.querySelectorAll('.stat strong, .stat-item strong').forEach(counter => {
        const text = counter.textContent.replace('+', '');
        const number = parseInt(text);
        if (!isNaN(number)) {
            counter.setAttribute('data-target', number);
            counter.textContent = '0+';
            counterObserver.observe(counter);
        }
    });

    // Parallax effect for hero background (rAF + respects reduced-motion)
    const heroBackground = document.querySelector('.hero-background');
    const reducedMotion = prefersReduced;
    if (heroBackground && !reducedMotion) {
        let latestScroll = 0;
        let ticking = false;
        window.addEventListener('scroll', () => {
            latestScroll = window.pageYOffset;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    heroBackground.style.transform = `translateY(${latestScroll * 0.5}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    } else if (heroBackground && reducedMotion) {
        heroBackground.style.transform = 'none';
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add floating animation to cards on hover
    const cards = document.querySelectorAll('.service-card, .diferencial-card, .gallery-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Fade in elements as they appear
    const fadeElements = document.querySelectorAll('.section-title, .cta-box, .testimonial-box');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        fadeObserver.observe(el);
    });

    // Ripple effect for primary buttons (more marked interaction)
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function (e) {
            if (prefersReduced) return;
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height) * 1.5;
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 800);
        });
    });

    // Confetti / particles system (toggleable)
    (function () {
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        let canvas, ctx, particles = [], animId = null, fxEnabled = false;

        function createCanvas() {
            canvas = document.createElement('canvas');
            canvas.id = 'fx-canvas';
            canvas.style.position = 'fixed';
            canvas.style.left = 0;
            canvas.style.top = 0;
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = 999;
            document.body.appendChild(canvas);
            ctx = canvas.getContext('2d');
            resize();
            window.addEventListener('resize', resize);
        }

        function resize() {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function spawnBurst(x, y, count = 30) {
            for (let i = 0; i < count; i++) {
                particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 1.5) * 8,
                    size: 6 + Math.random() * 8,
                    color: ['#ff6b35','#00c2c7','#ffd166','#ffffff'][Math.floor(Math.random()*4)],
                    life: 60 + Math.random() * 60,
                    rot: Math.random()*360,
                });
            }
        }

        function updateParticles() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for (let i = particles.length -1; i >=0; i--) {
                const p = particles[i];
                p.vy += 0.25; // gravity
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                p.rot += p.vx;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.life / 120);
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();
                if (p.life <= 0 || p.y > canvas.height + 50) particles.splice(i,1);
            }
        }

        function loop() {
            updateParticles();
            animId = requestAnimationFrame(loop);
        }

        function enableFX() {
            if (fxEnabled) return;
            fxEnabled = true;
            if (!canvas) createCanvas();
            spawnBurst(window.innerWidth/2, 120, 40);
            loop();
        }

        function disableFX() {
            fxEnabled = false;
            if (animId) cancelAnimationFrame(animId);
            animId = null;
            particles = [];
            if (canvas) {
                canvas.remove();
                canvas = null;
                ctx = null;
            }
        }

        const toggle = document.getElementById('fx-toggle');
        if (toggle) {
            // init from localStorage
            const stored = localStorage.getItem('artshow_fx');
            if (stored === 'on') {
                toggle.setAttribute('aria-pressed','true');
                enableFX();
            }
            toggle.addEventListener('click', () => {
                const pressed = toggle.getAttribute('aria-pressed') === 'true';
                if (pressed) {
                    toggle.setAttribute('aria-pressed','false');
                    localStorage.setItem('artshow_fx','off');
                    disableFX();
                } else {
                    toggle.setAttribute('aria-pressed','true');
                    localStorage.setItem('artshow_fx','on');
                    enableFX();
                }
            });
        }
    })();
});
