/* Chateau Capital — site behaviour
   No dependencies. Progressive enhancement only. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Mobile navigation ------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      document.body.classList.toggle('nav-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.classList.remove('nav-open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) toggle.click();
    });
  }


  /* --- Resources dropdown ------------------------------------------------
     Hover alone is not reachable by keyboard or touch, so the toggle is a
     real button with aria-expanded. Escape closes and returns focus, and a
     click outside dismisses it. */
  document.querySelectorAll('.nav-sub-toggle').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
    });

    // Close when a destination is chosen
    if (panel) {
      panel.addEventListener('click', function (e) {
        if (e.target.closest('a')) btn.setAttribute('aria-expanded', 'false');
      });
    }

    document.addEventListener('click', function (e) {
      if (!btn.closest('.nav-has-sub').contains(e.target)) {
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });

  /* --- Sticky header state + sticky mobile CTA -------------------------- */
  var header = document.querySelector('.site-header');
  var stickyCta = document.querySelector('.sticky-cta');
  var lastY = 0;

  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 80);
    if (stickyCta) {
      // Reveal after the hero, hide again near the footer CTA to avoid duplication
      var footerCta = document.querySelector('.footer-cta');
      var nearFooter = footerCta &&
        footerCta.getBoundingClientRect().top < window.innerHeight * 0.9;
      stickyCta.classList.toggle('is-visible', y > 600 && !nearFooter);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Scroll reveal ---------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealables.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
        io.observe(el);
      });
    }
  }

  /* --- Accordion -------------------------------------------------------- */
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (!panel) return;
      panel.style.maxHeight = open ? '0px' : panel.scrollHeight + 'px';
    });
  });
  // Keep open panels correctly sized on resize
  window.addEventListener('resize', function () {
    document.querySelectorAll('.acc-trigger[aria-expanded="true"]').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });

  /* --- Modal ------------------------------------------------------------ */
  var lastFocused = null;
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    lastFocused = document.activeElement;
    m.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var f = m.querySelector('input, button');
    if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closeModal(m) {
    m.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
  document.querySelectorAll('[data-modal-open]').forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(t.getAttribute('data-modal-open'));
    });
  });
  document.querySelectorAll('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) {
      if (e.target === m || e.target.closest('.modal-close')) closeModal(m);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('.modal.is-open');
    if (open) closeModal(open);
  });

  /* --- Forms -------------------------------------------------------------
     Demo handler. Replace `submitLead` with a POST to the CRM / ESP
     endpoint (HubSpot, ActiveCampaign, Salesforce, etc.) before launch.
     ---------------------------------------------------------------------- */
  function submitLead(form, data) {
    // TODO(launch): POST `data` to the CRM endpoint and handle failures.
    if (window.console) console.log('[lead captured]', form.dataset.formName, data);
    return Promise.resolve();
  }

  document.querySelectorAll('form[data-form-name]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) {
        data[k] = data[k] ? [].concat(data[k], v) : v;
      });

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }

      submitLead(form, data).then(function () {
        form.classList.add('is-submitted');
        var ok = form.querySelector('.form-success');
        if (ok) {
          ok.classList.add('is-visible');
          ok.setAttribute('tabindex', '-1');
          ok.focus();
        }
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
      });
    });
  });

  /* --- Accreditation self-check ----------------------------------------
     Client-side triage only. It routes the visitor to the right next step;
     it is NOT verification. Reg D 506(c) requires independent third-party
     verification before any subscription is accepted.
     ---------------------------------------------------------------------- */
  var gate = document.getElementById('accreditation-gate');
  if (gate) {
    var result = document.getElementById('gate-result');
    gate.addEventListener('change', function () {
      var choice = gate.querySelector('input[name="accredited"]:checked');
      if (!choice || !result) return;
      var qualified = choice.value === 'yes';
      result.hidden = false;
      result.innerHTML = qualified
        ? '<div class="callout"><h3>You may qualify as an accredited investor.</h3>' +
          '<p>The next step is a 20-minute introduction. If there is a mutual fit, we begin ' +
          'third-party accreditation verification and open Deal Room access.</p>' +
          '<div class="cta-row"><a class="btn btn-primary btn-arrow" href="contact.html">Schedule an Introduction</a>' +
          '<a class="btn btn-ghost" href="#investor-list">Join the Investor List</a></div></div>'
        : '<div class="callout"><h3>Our current offerings are limited to accredited investors.</h3>' +
          '<p>That is a regulatory requirement, not a judgement. You are welcome to stay on the ' +
          'educational list — we will let you know if a non-accredited vehicle such as a Reg A+ ' +
          'offering becomes available.</p>' +
          '<div class="cta-row"><a class="btn btn-ghost" href="#investor-list">Join the Educational List</a>' +
          '<a class="btn btn-ghost" href="why-multifamily.html">Read the Investment Thesis</a></div></div>';
      result.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    });
  }


  /* --- Video facades -----------------------------------------------------
     Each video is a thumbnail plus a play button until the visitor clicks.
     Only then does the provider iframe load. Embedding five players on page
     load would cost roughly a megabyte of third-party script and damage LCP,
     so nothing third-party is requested until it is actually wanted. */
  function videoEmbedUrl(provider, id) {
    if (provider === 'vimeo') {
      return 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0';
    }
    // default: YouTube, privacy-enhanced domain (no cookie until playback)
    return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
  }

  document.querySelectorAll('.video-facade').forEach(function (facade) {
    var id = facade.getAttribute('data-video-id');
    if (!id) {
      // No link supplied yet. Mark it, and keep it out of the tab order.
      facade.classList.add('is-pending');
      facade.setAttribute('aria-disabled', 'true');
      facade.setAttribute('tabindex', '-1');
      return;
    }
    facade.addEventListener('click', function () {
      if (facade.dataset.loaded) return;
      facade.dataset.loaded = '1';
      var frame = document.createElement('iframe');
      frame.src = videoEmbedUrl(facade.getAttribute('data-video-provider'), id);
      frame.title = facade.getAttribute('data-video-title') || 'Video';
      frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      frame.allowFullscreen = true;
      facade.innerHTML = '';
      facade.appendChild(frame);
    });
  });


  /* --- Hero video --------------------------------------------------------
     Deliberately lazy. The file is not requested until after window load,
     and only when the viewport is large enough for it to be worth the bytes
     and the visitor has not asked for reduced motion. The poster image
     carries the Largest Contentful Paint either way. */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    var wantsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var bigScreen = window.matchMedia('(min-width: 768px)').matches;
    if (wantsMotion && bigScreen) {
      var startHeroVideo = function () {
        heroVideo.src = heroVideo.getAttribute('data-src');
        heroVideo.addEventListener('playing', function () {
          heroVideo.classList.add('is-playing');
        }, { once: true });
        var p = heroVideo.play();
        if (p && p.catch) p.catch(function () { /* autoplay blocked: poster stands */ });
      };
      if (document.readyState === 'complete') startHeroVideo();
      else window.addEventListener('load', startHeroVideo);
    }
  }


  /* --- Floating offer widget --------------------------------------------
     Waits for engagement before appearing, remembers dismissal, and loads
     no video bytes until it is about to be shown. */
  (function () {
    var card = document.getElementById('offer-card');
    var bubble = document.getElementById('offer-bubble');
    if (!card || !bubble) return;

    var KEY = 'cc-offer-dismissed';
    var HIDE_DAYS = 7;
    var pill = document.getElementById('offer-pill');
    var loop = document.getElementById('offer-loop');
    var bubbleLoop = document.getElementById('offer-bubble-loop');
    var shown = false;
    var isPhone = function () { return window.matchMedia('(max-width: 767px)').matches; };

    function dismissedRecently() {
      try {
        var v = window.localStorage.getItem(KEY);
        if (!v) return false;
        return (Date.now() - parseInt(v, 10)) < HIDE_DAYS * 864e5;
      } catch (e) { return false; }
    }

    function startLoop(v) {
      if (!v || v.dataset.started) return;
      if (reduceMotion) return;              // poster stands in
      v.dataset.started = '1';
      var go = function () {
        v.src = v.getAttribute('data-src');
        var p = v.play();
        if (p && p.catch) p.catch(function () { /* poster stands in */ });
      };
      if (document.readyState === 'complete') go();
      else window.addEventListener('load', go, { once: true });
    }

    function show(el) {
      el.hidden = false;
      void el.offsetHeight;            // force reflow so the transition runs
      el.classList.add('is-open');
    }

    function hideCollapsed() {
      bubble.classList.remove('is-open');
      bubble.hidden = true;
      if (pill) { pill.classList.remove('is-open'); pill.hidden = true; }
    }

    function showCollapsed() {
      // Phones get the labelled pill, desktop gets the video bubble.
      var el = (isPhone() && pill) ? pill : bubble;
      card.classList.remove('is-open');
      card.hidden = true;
      show(el);
      if (el === bubble) startLoop(bubbleLoop);
      shown = true;
    }

    function openCard() {
      hideCollapsed();
      show(card);
      startLoop(loop);
      shown = true;
    }

    function collapse() {
      card.classList.remove('is-open');
      setTimeout(showCollapsed, 380);
      try { window.localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
    }

    // Appears straight away. The short delay is only so the entrance
    // transition is visible rather than the card simply being there on
    // first paint, and so it does not land on top of the hero animation.
    function reveal() {
      if (shown) return;
      // On a phone the full card covers most of the screen, so it opens as
      // the bubble and expands only when tapped.
      if (isPhone() || dismissedRecently()) {
        showCollapsed();
        return;
      }
      openCard();
    }
    setTimeout(reveal, 400);

    card.querySelector('.offer-close').addEventListener('click', collapse);
    function expand() {
      try { window.localStorage.removeItem(KEY); } catch (e) {}
      openCard();
    }
    bubble.addEventListener('click', expand);
    if (pill) pill.addEventListener('click', expand);

    // Swap the collapsed control if the device is rotated across the
    // breakpoint while the widget is collapsed.
    window.addEventListener('resize', function () {
      if (shown && card.hidden) showCollapsed();
    });

  })();

  /* --- Current year in footer ------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
