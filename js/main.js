/* =========================================================
   Fuerza Auto Care — main.js
   GSAP + ScrollTrigger + Lenis (vendored from npm into /vendor)
   ========================================================= */

/* ---------------------------------------------------------
   CAL.COM CONFIG
   =========================================================
   >>> PASTE YOUR CAL.COM DETAILS HERE <<<

   1. username — your Cal.com handle, i.e. the part after
      cal.com/ in your public link (https://cal.com/<username>).
      Team/org links work too, e.g. "team/fuerza-auto-care".
   2. services[*].slug — the URL slug of each Event Type you
      create in Cal.com (Event Types → New → "URL" field).
      Each service is its own event type with its own duration.
   3. minutes — informational only (shown in the placeholder);
      the real slot length is whatever you set on the event
      type in Cal.com. Keep the two in sync.

   While username still starts with "YOUR-", the site shows a
   placeholder panel instead of loading Cal.com.
   --------------------------------------------------------- */
const CAL_CONFIG = {
  username: "YOUR-CAL-USERNAME",          // ← PASTE YOUR CAL.COM USERNAME
  origin: "https://cal.com",               // change only if self-hosting Cal.com
  embedScript: "https://app.cal.com/embed/embed.js",
  brandColor: "#ff4a1c",
  services: {
    "detailing":   { label: "Detailing",            slug: "detailing",          minutes: 240 },
    "window-tint": { label: "Window Tint",          slug: "window-tint",        minutes: 180 },
    "vinyl-wrap":  { label: "Vinyl Wrap",           slug: "vinyl-wrap-dropoff", minutes: 480 },
    "ppf":         { label: "Paint Protection Film", slug: "ppf-dropoff",       minutes: 480 },
  },
};

(() => {
  "use strict";

  const root = document.documentElement;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (!hasGSAP) {
    // Libraries failed to load — show everything statically.
    root.classList.remove("js");
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmall = window.matchMedia("(max-width: 767px)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* =======================================================
     CAR SVG — one drawing reused for hero + process reveal
     ======================================================= */
  const BODY_D =
    "M40 215 L40 182 C40 166 50 156 72 151 L150 140 C220 120 270 86 330 73 " +
    "C390 62 470 62 520 75 C560 88 600 114 640 130 L730 148 C760 155 775 170 778 190 " +
    "L778 215 L672 215 A62 62 0 0 0 548 215 L252 215 A62 62 0 0 0 128 215 Z";

  let carCount = 0;
  function buildCar(variant) {
    const id = `car${++carCount}`;
    const dirty = variant === "dirty";
    const paintStops = dirty
      ? `<stop offset="0" stop-color="#6b6258"/><stop offset=".45" stop-color="#3e3832"/><stop offset="1" stop-color="#1e1a17"/>`
      : `<stop offset="0" stop-color="#4a4a55"/><stop offset=".35" stop-color="#1c1c22"/><stop offset=".7" stop-color="#0c0c0f"/><stop offset="1" stop-color="#050506"/>`;
    const glassStops = dirty
      ? `<stop offset="0" stop-color="#6a6660"/><stop offset="1" stop-color="#3a3632"/>`
      : `<stop offset="0" stop-color="#2a3442"/><stop offset=".5" stop-color="#0b0f15"/><stop offset="1" stop-color="#05070a"/>`;
    const rim = dirty ? "#4a4038" : "#2a2a30";
    const rimStroke = dirty ? "#5c5045" : "#6a6a72";
    const accent = dirty ? "#7a4a38" : "#ff4a1c";

    const wheel = (cx) => `
      <g class="wheel">
        <circle cx="${cx}" cy="215" r="50" fill="#070708"/>
        <circle cx="${cx}" cy="215" r="36" fill="${rim}" stroke="${rimStroke}" stroke-width="2"/>
        ${[0, 72, 144, 216, 288].map((a) => {
          const r = (a * Math.PI) / 180;
          return `<line x1="${cx}" y1="215" x2="${(cx + Math.cos(r) * 33).toFixed(1)}" y2="${(215 + Math.sin(r) * 33).toFixed(1)}" stroke="${rimStroke}" stroke-width="5" stroke-linecap="round"/>`;
        }).join("")}
        <path d="M${cx - 22} ${215 - 20} A30 30 0 0 1 ${cx + 8} ${215 - 29}" stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="${cx}" cy="215" r="7" fill="#111" stroke="${rimStroke}" stroke-width="2"/>
      </g>`;

    return `
<svg class="car car--${variant}" viewBox="0 0 800 300" role="presentation" focusable="false">
  <defs>
    <linearGradient id="${id}-paint" x1="0" y1="0" x2="0" y2="1">${paintStops}</linearGradient>
    <linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="1">${glassStops}</linearGradient>
    <linearGradient id="${id}-sweep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".55"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${id}-drop" cx=".35" cy=".3" r=".7">
      <stop offset="0" stop-color="#fff" stop-opacity=".95"/>
      <stop offset=".35" stop-color="#fff" stop-opacity=".18"/>
      <stop offset=".8" stop-color="#fff" stop-opacity=".06"/>
      <stop offset="1" stop-color="#fff" stop-opacity=".45"/>
    </radialGradient>
    <clipPath id="${id}-clip"><path d="${BODY_D}"/></clipPath>
  </defs>

  <ellipse cx="410" cy="268" rx="390" ry="14" fill="#000" opacity=".55"/>
  <g class="car__body">
    <path class="car__shape" d="${BODY_D}" fill="url(#${id}-paint)"/>
    <!-- shoulder highlight + rocker accent -->
    <path d="M74 158 C260 146 520 138 770 168" stroke="#fff" stroke-opacity="${dirty ? 0.06 : 0.22}" stroke-width="2" fill="none"/>
    <path d="M262 206 L540 206" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
    <!-- greenhouse -->
    <path d="M196 138 C255 114 296 92 340 84 L432 80 L432 134 Z" fill="url(#${id}-glass)"/>
    <path d="M446 80 C492 80 522 86 546 98 C566 108 584 119 598 130 L446 134 Z" fill="url(#${id}-glass)"/>
    <path d="M300 106 L330 90" stroke="#fff" stroke-opacity="${dirty ? 0.05 : 0.18}" stroke-width="6" stroke-linecap="round"/>
    <!-- door seams -->
    <path d="M438 80 L438 205 M330 140 L330 205 M548 136 L552 205" stroke="#000" stroke-opacity=".55" stroke-width="1.5" fill="none"/>
    <path d="M500 150 L522 150" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>
    <!-- lights -->
    <path d="M736 156 L772 166 L770 176 L734 168 Z" fill="${dirty ? "#8a8070" : "#f5f1e6"}"/>
    <path d="M42 166 L72 159 L72 170 L42 174 Z" fill="${accent}"/>
    ${wheel(190)}${wheel(610)}
    <g clip-path="url(#${id}-clip)">
      ${dirty ? `<image class="car__mud" x="0" y="0" width="800" height="300" preserveAspectRatio="none"/>` : ""}
      <g class="car__sweep"><rect x="-260" y="-20" width="180" height="340" fill="url(#${id}-sweep)" transform="skewX(-22)"/></g>
      <g class="car__drops" data-grad="${id}-drop"></g>
    </g>
  </g>
</svg>`;
  }

  document.querySelectorAll("[data-car]").forEach((el) => {
    el.innerHTML = buildCar(el.dataset.car);
  });

  /* ---- mud texture for the dirty car: drawn once on a canvas ---- */
  function mudTexture() {
    const c = document.createElement("canvas");
    c.width = 600; c.height = 225;
    const g = c.getContext("2d");
    const rnd = (a, b) => a + Math.random() * (b - a);
    // dust haze, heavier low on the body (road spray)
    const haze = g.createLinearGradient(0, 0, 0, 225);
    haze.addColorStop(0, "rgba(150,130,105,.18)");
    haze.addColorStop(1, "rgba(95,70,45,.75)");
    g.fillStyle = haze; g.fillRect(0, 0, 600, 225);
    // mud blotches
    for (let i = 0; i < 140; i++) {
      const x = rnd(0, 600), y = Math.pow(Math.random(), 0.55) * 225, r = rnd(4, 26);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(${rnd(60, 95) | 0},${rnd(42, 62) | 0},${rnd(25, 40) | 0},${rnd(0.35, 0.7)})`);
      grd.addColorStop(1, "rgba(60,42,25,0)");
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    // speckle
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(${rnd(40, 90) | 0},${rnd(30, 60) | 0},20,${rnd(0.3, 0.8)})`;
      g.fillRect(rnd(0, 600), 225 * Math.pow(Math.random(), 0.6), rnd(0.6, 2), rnd(0.6, 2));
    }
    // dried drip streaks
    g.strokeStyle = "rgba(120,100,75,.35)"; g.lineCap = "round";
    for (let i = 0; i < 26; i++) {
      const x = rnd(60, 560), y = rnd(50, 110);
      g.lineWidth = rnd(1, 3);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-3, 3), y + rnd(20, 70)); g.stroke();
    }
    return c.toDataURL("image/png");
  }
  const mud = document.querySelector(".car__mud");
  if (mud) mud.setAttribute("href", mudTexture());

  /* ---- water beads: scattered inside the body shape ---- */
  const SVGNS = "http://www.w3.org/2000/svg";
  function addDrops(svg, count) {
    const group = svg.querySelector(".car__drops");
    const shape = svg.querySelector(".car__shape");
    const grad = group.dataset.grad;
    const drops = [];
    let guard = 0;
    while (drops.length < count && guard++ < count * 40) {
      const x = 80 + Math.random() * 680;
      const y = 70 + Math.pow(Math.random(), 1.4) * 130; // bias toward upper panels
      if (shape.isPointInFill && !shape.isPointInFill(new DOMPoint(x, y))) continue;
      const r = 2.2 + Math.random() * 4;
      const g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", "drop");
      g.innerHTML =
        `<ellipse cx="${x}" cy="${y + r * 0.35}" rx="${r}" ry="${r * 0.8}" fill="#000" opacity=".35"/>` +
        `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.9}" fill="url(#${grad})"/>`;
      group.appendChild(g);
      drops.push(g);
    }
    return drops;
  }

  /* =======================================================
     HERO HEADLINE — split into chars for the stagger
     ======================================================= */
  document.querySelectorAll(".hero__title .split").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      // words stay unbroken; the spaces between them let narrow screens wrap
      const word = document.createElement("span");
      word.className = "word";
      for (const ch of w) {
        const s = document.createElement("span");
        s.className = "char";
        s.textContent = ch;
        word.appendChild(s);
      }
      el.appendChild(word);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });

  /* =======================================================
     NAV
     ======================================================= */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  const onScrollNav = (y) => nav.classList.toggle("is-scrolled", y > 20);

  /* =======================================================
     BEFORE / AFTER
     ======================================================= */
  document.querySelectorAll("[data-ba]").forEach((ba) => {
    const range = ba.querySelector(".ba__range");
    const set = (v) => ba.style.setProperty("--pos", v + "%");
    range.addEventListener("input", () => set(range.value));
    ba._set = set;
  });

  /* =======================================================
     CARD POINTER GLOW (desktop only)
     ======================================================= */
  if (finePointer) {
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* =======================================================
     CAL.COM
     ======================================================= */
  const cal = initCal();

  // service card buttons → select tab + scroll to booking
  document.querySelectorAll("[data-book]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cal.select(btn.dataset.book);
      scrollToTarget(document.getElementById("booking"));
    });
  });

  function initCal() {
    const tabs = document.querySelectorAll("[data-tab]");
    const embed = document.getElementById("cal-embed");
    const placeholder = document.getElementById("cal-placeholder");
    const link = document.getElementById("cal-link");
    const selName = document.getElementById("cal-selected");
    const selDur = document.getElementById("cal-duration");
    const configured = CAL_CONFIG.username && !CAL_CONFIG.username.startsWith("YOUR-");
    let current = null;

    if (configured) {
      /* ---------- Cal.com embed snippet (from Cal.com → Embed → Inline) ---------- */
      (function (C, A, L) {
        const p = (a, ar) => a.q.push(ar);
        const d = C.document;
        C.Cal = C.Cal || function () {
          const cal = C.Cal; const ar = arguments;
          if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; }
          if (ar[0] === L) {
            const api = function () { p(api, arguments); };
            const namespace = ar[1]; api.q = api.q || [];
            if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); }
            else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
      })(window, CAL_CONFIG.embedScript, "init");
      /* ---------- end snippet ---------- */

      window.Cal("init", { origin: CAL_CONFIG.origin });
      window.Cal("ui", {
        theme: "dark",
        styles: { branding: { brandColor: CAL_CONFIG.brandColor } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
      placeholder.hidden = true;
    }

    function select(key) {
      const svc = CAL_CONFIG.services[key];
      if (!svc || key === current) return;
      current = key;
      tabs.forEach((t) => {
        const on = t.dataset.tab === key;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      selName.textContent = svc.label;
      selDur.textContent = `${svc.minutes} min`;

      if (configured) {
        const calLink = `${CAL_CONFIG.username}/${svc.slug}`;
        link.href = `${CAL_CONFIG.origin}/${calLink}`;
        embed.innerHTML = "";
        window.Cal("inline", {
          elementOrSelector: "#cal-embed",
          calLink,
          layout: "month_view",
          config: { theme: "dark" },
        });
      }
    }

    tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.tab)));
    select("detailing");

    // The Cal iframe resizes itself — keep ScrollTrigger positions accurate.
    if (window.ResizeObserver && hasGSAP) {
      let t;
      new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 200); })
        .observe(document.querySelector(".booking__frame"));
    }
    return { select };
  }

  /* =======================================================
     SMOOTH SCROLL (Lenis) — wired into GSAP's ticker
     ======================================================= */
  let lenis = null;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  if (hasGSAP && window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", (e) => { ScrollTrigger.update(); onScrollNav(e.scroll); });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener("scroll", () => onScrollNav(window.scrollY), { passive: true });
  }
  onScrollNav(window.scrollY);

  function scrollToTarget(el) {
    if (!el) return;
    const offset = -(nav.offsetHeight - 1);
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduceMotion ? "auto" : "smooth" });
  }

  document.querySelectorAll("[data-scroll]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || !id.startsWith("#")) return;
      e.preventDefault();
      setOpen(false);
      scrollToTarget(id === "#top" ? document.body : document.querySelector(id));
    });
  });

  if (!hasGSAP) return;

  /* =======================================================
     ANIMATIONS
     ======================================================= */
  ScrollTrigger.config({ ignoreMobileResize: true });
  const mm = gsap.matchMedia();
  const heroSvg = document.querySelector('[data-car="hero"] svg');
  const cleanSvg = document.querySelector('[data-car="clean"] svg');

  // light sweep across a car — the "shine" signature
  function sweepLoop(svg, delay = 0) {
    return gsap.fromTo(svg.querySelector(".car__sweep"),
      { x: -120 },
      { x: 1150, duration: 1.5, ease: "power2.inOut", repeat: -1, repeatDelay: 3, delay });
  }

  // water beads: pop in, then a few periodically run down and re-form
  function beadDrops(svg, count, delay) {
    const drops = addDrops(svg, count);
    gsap.set(drops, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    gsap.to(drops, {
      scale: 1, opacity: 1, duration: 0.6, ease: "back.out(3)",
      stagger: { each: 0.05, from: "random" }, delay,
    });
    const run = () => {
      const d = drops[(Math.random() * drops.length) | 0];
      if (d) {
        gsap.timeline()
          .to(d, { y: 10 + Math.random() * 14, scaleY: 1.5, scaleX: 0.75, opacity: 0, duration: 1.1, ease: "power2.in", transformOrigin: "50% 0%" })
          .set(d, { y: 0, scaleX: 0, scaleY: 0 })
          .to(d, { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.5, ease: "back.out(3)", transformOrigin: "50% 50%" }, "+=.8");
      }
      gsap.delayedCall(0.5 + Math.random() * 1.2, run);
    };
    gsap.delayedCall(delay + 2, run);
    return drops;
  }

  mm.add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduce: "(prefers-reduced-motion: reduce)",
      small: "(max-width: 767px)",
    },
    (ctx) => {
      const { motion, small } = ctx.conditions;

      /* ---------- reduced motion: show final states, no movement ---------- */
      if (!motion) {
        gsap.set(".reveal", { opacity: 1 });
        gsap.set(".process__dirty", { autoAlpha: 0 });
        document.querySelectorAll(".process__steps li").forEach((li) => li.classList.add("is-active"));
        document.querySelectorAll("[data-count]").forEach((el) => {
          el.textContent = el.dataset.count + (el.dataset.suffix || "");
        });
        return;
      }

      /* ---------- HERO intro ---------- */
      const chars = gsap.utils.toArray(".hero__title .char");
      const wheels = heroSvg.querySelectorAll(".wheel");
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .from(".hero__eyebrow", { y: 20, opacity: 0, duration: 0.8 })
        .from(chars, { yPercent: 115, rotate: 6, duration: 1.1, stagger: 0.022 }, 0.1)
        .from(".hero__sub", { y: 24, opacity: 0, duration: 0.9 }, 0.6)
        .from(".hero__ctas > *", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.7)
        // car rolls in from the left and settles; wheels spin with it
        .from(heroSvg, { xPercent: -70, opacity: 0, duration: 1.8, ease: "power3.out" }, 0.35)
        .from(wheels, { rotation: -720, duration: 1.8, ease: "power3.out" }, 0.35)
        .from(".hero__floor", { opacity: 0, duration: 1.2 }, 0.9);

      // shine: light sweep across the car + gradient shimmer in the accent line
      intro.add(() => sweepLoop(heroSvg), 1.9);
      gsap.fromTo(".hero__accent .char",
        { "--shine": "100%" },
        { "--shine": "0%", duration: 1.5, ease: "power2.inOut", repeat: -1, repeatDelay: 3, delay: 1.9 });

      // water beading on the freshly-detailed hero car
      const heroDrops = beadDrops(heroSvg, small ? 12 : 30, 2.2);

      // scroll away: car eases forward, drops streak back (wind), text lifts
      gsap.timeline({
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
      })
        .to(".hero__car", { x: small ? 40 : 120, ease: "none" }, 0)
        .to(heroSvg.querySelector(".car__drops"), { x: -24, y: 10, opacity: 0.2, ease: "none" }, 0)
        .to(".hero__inner", { y: -60, opacity: 0.2, ease: "none" }, 0);

      /* ---------- MARQUEE (speeds up with scroll velocity) ---------- */
      const marquee = gsap.to(".marquee__track", { xPercent: -50, duration: small ? 22 : 32, ease: "none", repeat: -1 });
      if (lenis) {
        lenis.on("scroll", ({ velocity }) => {
          gsap.to(marquee, { timeScale: 1 + Math.min(Math.abs(velocity) / 6, 4), duration: 0.2, overwrite: true });
          gsap.to(marquee, { timeScale: 1, duration: 1, delay: 0.2 });
        });
      }

      /* ---------- staggered section fade-ins ---------- */
      gsap.set(".reveal", { y: small ? 24 : 40 });
      ScrollTrigger.batch(".reveal", {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, overwrite: true,
        }),
      });

      /* ---------- PROCESS: dirty → clean squeegee reveal (pinned, scrubbed) ---------- */
      const stage = document.querySelector(".process__stage");
      const steps = gsap.utils.toArray(".process__steps li");
      const cleanDrops = addDrops(cleanSvg, small ? 8 : 18);
      gsap.set(cleanDrops, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
      let cleanSweep = null;

      const proc = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".process",
          start: "top top",
          end: () => "+=" + window.innerHeight * (small ? 1.4 : 1.8),
          pin: ".process__pin",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 1.02));
            steps.forEach((li, n) => li.classList.toggle("is-active", n <= i && self.progress > 0.02));
          },
          onLeave: () => { if (!cleanSweep) cleanSweep = sweepLoop(cleanSvg); },
        },
      });
      proc
        .from(".process__head", { y: 30, opacity: 0, duration: 0.12 }, 0)
        .to(".squeegee", { opacity: 1, duration: 0.04 }, 0.1)
        .fromTo(".process__dirty", { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.7 }, 0.12)
        .fromTo(".squeegee", { x: 0 }, { x: () => stage.offsetWidth, duration: 0.7 }, 0.12)
        .to(".squeegee", { opacity: 0, duration: 0.05 }, 0.82)
        // finished: beads form on the fresh coating
        .to(cleanDrops, { scale: 1, opacity: 1, duration: 0.12, ease: "back.out(3)", stagger: { each: 0.004, from: "random" } }, 0.84);

      /* ---------- BEFORE/AFTER hint wiggle ---------- */
      document.querySelectorAll("[data-ba]").forEach((ba) => {
        const range = ba.querySelector(".ba__range");
        const o = { v: 50 };
        gsap.timeline({ scrollTrigger: { trigger: ba, start: "top 70%", once: true }, delay: 0.3 })
          .to(o, { v: 25, duration: 0.7, ease: "power2.inOut" })
          .to(o, { v: 70, duration: 0.9, ease: "power2.inOut" })
          .to(o, { v: 50, duration: 0.6, ease: "power2.out" })
          .eventCallback("onUpdate", function () {
            range.value = o.v; ba._set(o.v);
          });
        // stop the hint as soon as the user grabs the slider
        range.addEventListener("pointerdown", () => gsap.killTweensOf(o), { once: true });
      });

      /* ---------- STATS count-up ---------- */
      document.querySelectorAll("[data-count]").forEach((el) => {
        const end = +el.dataset.count;
        const suffix = el.dataset.suffix || "";
        const o = { n: 0 };
        gsap.to(o, {
          n: end, duration: 1.6, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => (el.textContent = Math.round(o.n).toLocaleString() + suffix),
        });
      });

      /* ---------- footer wordmark ---------- */
      gsap.from(".footer__big", {
        yPercent: 40, opacity: 0, ease: "power3.out", duration: 1.2,
        scrollTrigger: { trigger: ".footer", start: "top 90%", once: true },
      });
    }
  );

  // fonts change layout metrics — recalc trigger positions once they're in
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
