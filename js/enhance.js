/* ===== Basic UI: menu toggle, back to top, year ===== */
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('mainNav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.style.display === 'block';
    nav.style.display = open ? 'none' : 'block';
    menuToggle.setAttribute('aria-expanded', String(!open));
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) nav.style.display = '';
  });
}

const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
  backToTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
}

const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ===== GSAP Animations (register ScrollTrigger) ===== */
if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  // hero entrance (supports plain hero-title too)
  gsap.from(".hero-title, .hero-title .line", {
    opacity: 0,
    y: 40,
    duration: 1,
    stagger: 0.12,
    ease: "power3.out"
  });
  gsap.from(".hero-lead", {
    opacity: 0,
    y: 24,
    duration: 0.8,
    delay: 0.3,
    ease: "power3.out"
  });
  gsap.from(".hero-buttons .btn", {
    opacity: 0,
    scale: 0.9,
    duration: 0.6,
    delay: 0.5,
    stagger: 0.1,
    ease: "back.out(1.6)"
  });
  gsap.from(".hero-subtitle--shine", {
    opacity: 0,
    y: 20,
    duration: 0.9,
    delay: 0.35,
    ease: "power3.out"
  });

  // generic reveal on scroll
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
      duration: 0.8,
      autoAlpha: 1,
      y: 0,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  });

  // cards/product animations
  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      delay: i * 0.05,
      scrollTrigger: { trigger: card, start: "top 92%" }
    });
  });
  gsap.utils.toArray('.product-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      scale: 0.95,
      duration: 0.7,
      delay: i * 0.05,
      scrollTrigger: { trigger: card, start: "top 92%" }
    });
  });

  // === About page animations ===
  gsap.utils.toArray(".timeline-item").forEach((item, i) => {
    gsap.from(item, {
      opacity: 0,
      x: -40,
      duration: 1,
      delay: i * 0.2,
      scrollTrigger: { trigger: item, start: "top 85%" }
    });
  });

  gsap.utils.toArray(".value-card").forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 50,
      scale: 0.9,
      duration: 0.9,
      delay: i * 0.2,
      ease: "back.out(1.7)",
      scrollTrigger: { trigger: card, start: "top 85%" }
    });
  });

  gsap.from(".quality-banner", {
    opacity: 0,
    y: 60,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: { trigger: ".quality-banner", start: "top 85%" }
  });
}

/* ===== Counters (IntersectionObserver) ===== */
const counters = document.querySelectorAll('.counter');
if (counters.length) {
  const animateCounter = el => {
    const target = +el.getAttribute('data-target');
    let current = 0;
    const step = Math.max(1, Math.round(target / 60));
    const tick = () => {
      current += step;
      if (current >= target) { el.textContent = target; return; }
      el.textContent = current;
      requestAnimationFrame(tick);
    };
    tick();
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
}

/* ===== 3D Carousel (auto-rotate + hover pause/pop) ===== */
(function init3DCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const items = Array.from(track.children);
  const N = items.length;
  const getRadius = () => {
    const w = window.innerWidth;
    if (w <= 480) return Math.min(160, Math.max(120, N * 14));
    if (w <= 768) return Math.min(220, Math.max(160, N * 20));
    return Math.min(320, Math.max(220, N * 28));
  };
  let radius = getRadius();
  const theta = 360 / N;

  const layoutCarousel = (r) => {
    items.forEach((item, i) => {
      const angle = theta * i;
      item.style.transform = `rotateY(${angle}deg) translateZ(${r}px) translate(-50%, -50%)`;
      item.style.left = "50%";
      item.style.top = "50%";
      item.style.willChange = "transform, filter";
    });
  };

  layoutCarousel(radius);

  let rotationSpeed = 8 + Math.max(0, (15 - N) * 0.2);
  let tl = gsap.timeline({ repeat: -1, ease: "none" });
  tl.to(track, { rotationY: -360, duration: rotationSpeed * (N / 6), transformOrigin: `50% 50% -${radius}px`, ease: "none" });

  items.forEach((item) => {
    const pause = () => {
      tl.pause();
      gsap.to(item, { scale: 1.08, zIndex: 1000, duration: 0.25, ease: "power2.out" });
      items.forEach(sib => { if (sib !== item) gsap.to(sib, { scale: 0.92, filter: "brightness(.85) saturate(.9)", duration: 0.25 }); });
    };
    const resume = () => {
      items.forEach(sib => gsap.to(sib, { scale: 1, filter: "none", duration: 0.3 }));
      gsap.to(item, { zIndex: 0, duration: 0.2 });
      tl.play();
    };
    item.addEventListener('mouseenter', pause);
    item.addEventListener('mouseleave', resume);
    item.addEventListener('touchstart', pause, { passive: true });
    item.addEventListener('touchend', resume, { passive: true });
  });

  window.addEventListener('resize', () => {
    radius = getRadius();
    layoutCarousel(radius);
    tl.kill();
    tl = gsap.timeline({ repeat: -1, ease: "none" });
    tl.to(track, { rotationY: -360, duration: rotationSpeed * (items.length / 6), transformOrigin: `50% 50% -${radius}px`, ease: "none" });
  });
})();

/* ===== Contact Form Handling ===== */
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (contactForm.querySelector('input[name="name"]')?.value || "").trim();
    const email = (contactForm.querySelector('input[name="email"]')?.value || "").trim();
    const message = (contactForm.querySelector('textarea[name="message"]')?.value || "").trim();

    // Local file fallback: FormSubmit blocks file:// pages.
    if (window.location.protocol === "file:") {
      const subject = encodeURIComponent(`Website contact message from ${name || "Visitor"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      );
      window.location.href = `mailto:a.mukesh2006@gmail.com?subject=${subject}&body=${body}`;
      formStatus.textContent = "Mail app opened. Please click send in your email app.";
      formStatus.className = "form-status success center";
      return;
    }

    formStatus.textContent = "Sending...";
    formStatus.className = "form-status muted center";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      });

      if (response.ok) {
        formStatus.textContent = "Message sent successfully!";
        formStatus.className = "form-status success center";
        contactForm.reset();
      } else {
        formStatus.textContent = "Unable to send now. Please try again.";
        formStatus.className = "form-status error center";
      }
    } catch (error) {
      formStatus.textContent = "Network error. Please try again later.";
      formStatus.className = "form-status error center";
    }
  });
}












