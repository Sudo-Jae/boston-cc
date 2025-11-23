// app.js — plain JS for index.html interactions
// Loads after DOM, attaches handlers for year, hamburger, smooth scroll, and contact form.

(function () {
  function setYear() {
    var y = new Date().getFullYear();
    var el = document.getElementById('year');
    if (el) el.textContent = y;
  }

  function setupHamburger() {
    var btn = document.getElementById('hamburger');
    var menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    menu.style.display = 'none';
    btn.addEventListener('click', function () {
      var isActive = btn.classList.toggle('active');
      menu.style.display = isActive ? 'flex' : 'none';
    });
  }

  function setupSmoothScrolling() {
    var els = document.querySelectorAll('[data-scroll]');
    els.forEach(function (el) {
      el.addEventListener('click', function (e) {
        var target = el.getAttribute('data-scroll');
        if (!target) return;
        var dest = document.querySelector(target);
        if (!dest) return;
        dest.scrollIntoView({ behavior: 'smooth' });
        var btn = document.getElementById('hamburger');
        var menu = document.getElementById('mobileMenu');
        if (btn && menu && btn.classList.contains('active')) {
          btn.classList.remove('active');
          menu.style.display = 'none';
        }
      });
    });

    var anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var href = a.getAttribute('href');
        if (!href || href.length === 0 || href === '#') return;
        var dest = document.querySelector(href);
        if (!dest) return;
        ev.preventDefault();
        dest.scrollIntoView({ behavior: 'smooth' });
        var btn = document.getElementById('hamburger');
        var menu = document.getElementById('mobileMenu');
        if (btn && menu && btn.classList.contains('active')) {
          btn.classList.remove('active');
          menu.style.display = 'none';
        }
      });
    });
  }

  function serializeForm(form) {
    var obj = {};
    var elements = form.elements;
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (!el.name) continue;
      if (el.type === 'checkbox') {
        obj[el.name] = el.checked;
      } else if (el.type === 'radio') {
        if (el.checked) obj[el.name] = el.value;
      } else {
        obj[el.name] = el.value;
      }
    }
    return obj;
  }

  function showMessage(form, message, type) {
    // type: 'success' | 'error' | ''
    var existing = form.querySelector('.form-message');
    if (!existing) {
      existing = document.createElement('div');
      existing.className = 'form-message';
      existing.style.marginTop = '0.6rem';
      existing.style.fontSize = '0.9rem';
      form.appendChild(existing);
    }
    existing.textContent = message || '';
    if (!message) {
      existing.style.display = 'none';
      return;
    }
    existing.style.display = 'block';
    existing.style.color = type === 'error' ? '#f87171' : '#34d399';
  }

  function setupContactFormHandler() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var submit = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var endpoint = form.dataset.endpoint || 'http://localhost:3001/api/contact';
      var data = serializeForm(form);

      if (submit) {
        submit.disabled = true;
        var prev = submit.textContent;
        submit.textContent = 'Sending…';
      }
      showMessage(form, '', '');

      try {
        var res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          var json = await res.json().catch(function () { return null; });
          showMessage(form, (json && json.message) ? json.message : 'Thanks — we received your message.', 'success');
          form.reset();
        } else {
          var text = await res.text().catch(function () { return res.statusText || 'Server error'; });
          showMessage(form, 'Error: ' + (text || res.statusText), 'error');
          console.error('Contact form error', res.status, text);
        }
      } catch (err) {
        console.error('Contact submission failed', err);
        showMessage(form, 'Network error. Try again or email your.email@example.com', 'error');
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = prev;
        }
      }
    });
  }

  // initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setYear();
      setupHamburger();
      setupSmoothScrolling();
      setupContactFormHandler();
    });
  } else {
    setYear();
    setupHamburger();
    setupSmoothScrolling();
    setupContactFormHandler();
  }

})();
/*
  app.js

  Paste your plain JS script below (replace or merge with the helper code).
  This file already implements small, non-invasive helpers that many site scripts expect:
    - Sets the current year into element with id `year` and `yearFooterInner`.
    - Toggles `#mobileMenu` when `#hamburger` is clicked.
    - Adds a basic `submit` handler to `#contactForm` (prevent default and logs the data).

  If you want me to inject your provided script into this file instead of replacing it, paste the script here and tell me to "merge".
*/

/*
  app.js

  Consolidated JS for the static landing page.
  - Sets footer year(s)
  - Hamburger / mobile menu toggle
  - Exposes `handleFormSubmit` for the inline `onsubmit` handler in the HTML
*/

(function () {
  'use strict';

  function setYear() {
    var y = new Date().getFullYear();
    var el = document.getElementById('year');
    if (el) el.textContent = String(y);
    var footer = document.getElementById('yearFooterInner');
    if (footer) footer.textContent = String(y);
  }

  function setupHamburger() {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    // Ensure mobileMenu is hidden initially on JS-enabled browsers
    mobileMenu.style.display = 'none';

    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      var isOpen = hamburger.classList.contains('active');
      mobileMenu.style.display = isOpen ? 'flex' : 'none';
    });
  }

  // Expose a global handler for forms that use inline `onsubmit="handleFormSubmit(event)"`.
  // This mirrors the simple behaviour in the original script: prevent default and alert.
  window.handleFormSubmit = function (e) {
    if (!e) return;
    e.preventDefault();
    try {
      // gather basic values for logging
      var form = e.target || e.srcElement;
      var fd = new FormData(form);
      var out = {};
      fd.forEach(function (v, k) { out[k] = v; });
      console.log('Form submit', out);
    } catch (err) {
      console.warn('handleFormSubmit: could not serialize form', err);
    }
    alert('Form submitted! Wire this up to your backend / email service.');
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setYear();
      setupHamburger();
    });
  } else {
    setYear();
    setupHamburger();
  }

})();
