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

  // CONTENT / CMS HELPERS
  async function fetchContent() {
    try {
      var res = await fetch('http://localhost:3002/api/content');
      if (!res.ok) return null;
      var json = await res.json().catch(function () { return null; });
      return json && json.content ? json.content : null;
    } catch (err) {
      console.warn('Could not fetch content from backend', err);
      return null;
    }
  }

  function applyContent(content) {
    if (!content || typeof content !== 'object') return;
    var els = document.querySelectorAll('[data-content-key]');
    els.forEach(function (el) {
      var key = el.getAttribute('data-content-key');
      if (!key) return;
      if (Object.prototype.hasOwnProperty.call(content, key)) {
        var val = content[key];
        // Backwards-compatible: content value may be a string (old format) or an object { html, style }
        if (val && typeof val === 'object' && (val.html || val.style)) {
          try { el.innerHTML = val.html || ''; } catch (e) { el.textContent = val.html || ''; }
          if (val.style && val.style.color) el.style.color = val.style.color;
        } else {
          try { el.innerHTML = val; } catch (e) { el.textContent = val; }
        }
      }
    });
  }

  // Editor mode utilities
  var _adminToken = null;
  function isEditorMode() {
    try { return new URLSearchParams(window.location.search).get('edit') === '1'; } catch (e) { return false; }
  }

  function enableInlineEditing() {
    // find all text-bearing elements in the main content area and make them editable
    var els = Array.from(document.querySelectorAll('main [data-content-key], main h1, main h2, main h3, main p, main strong, main span, main div'))
      .filter(function (e) {
        // skip controls and empty elements
        if (e.matches('input, textarea, button, a')) return false;
        if (!e.textContent || e.textContent.trim().length === 0) return false;
        return true;
      });

    // ensure each has a data-content-key so it can be saved/loaded
    els.forEach(function (el, idx) {
      if (!el.getAttribute('data-content-key')) {
        el.setAttribute('data-content-key', 'auto_' + idx);
      }
      el.setAttribute('contenteditable', 'true');
      el.classList.add('editor-highlight');
    });

    // create a sticky editor bar with save + color controls
    var bar = document.createElement('div');
    bar.id = 'editorBar';
    bar.style.position = 'fixed';
    bar.style.left = '12px';
    bar.style.right = '12px';
    bar.style.bottom = '18px';
    bar.style.zIndex = '99999';
    bar.style.padding = '0.6rem 0.9rem';
    bar.style.borderRadius = '10px';
    bar.style.display = 'flex';
    bar.style.alignItems = 'center';
    bar.style.justifyContent = 'space-between';
    bar.style.gap = '12px';
    bar.style.background = 'linear-gradient(90deg, rgba(2,6,23,0.9), rgba(2,6,23,0.7))';
    bar.style.boxShadow = '0 6px 32px rgba(0,0,0,0.45)';
    bar.style.border = '1px solid rgba(255,255,255,0.04)';

    var left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '8px';

    var status = document.createElement('div');
    status.textContent = 'Editor mode — click text to edit. Select element to change color.';
    status.style.color = '#cfe6f7';
    status.style.fontSize = '0.95rem';
    left.appendChild(status);

    var controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.alignItems = 'center';
    controls.style.gap = '8px';

    var colorLabel = document.createElement('label');
    colorLabel.textContent = 'Color:';
    colorLabel.style.color = '#cde';
    colorLabel.style.fontSize = '0.9rem';

    var colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#ffffff';
    colorInput.title = 'Select color for selected element';

    var allWhite = document.createElement('button');
    allWhite.textContent = 'Make all text white';
    allWhite.style.padding = '0.4rem 0.6rem';
    allWhite.style.borderRadius = '6px';
    allWhite.style.border = '1px solid rgba(255,255,255,0.06)';
    allWhite.style.background = 'transparent';
    allWhite.style.color = '#fff';

    controls.appendChild(colorLabel);
    controls.appendChild(colorInput);
    controls.appendChild(allWhite);

    left.appendChild(controls);

    var right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '8px';

    var saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save changes';
    saveBtn.style.padding = '0.6rem 0.9rem';
    saveBtn.style.borderRadius = '8px';
    saveBtn.style.border = 'none';
    saveBtn.style.background = '#06b6d4';
    saveBtn.style.color = '#021025';

    right.appendChild(saveBtn);

    bar.appendChild(left);
    bar.appendChild(right);
    document.body.appendChild(bar);

    // selection handling
    var selectedEl = null;
    function setSelected(el) {
      if (selectedEl) selectedEl.classList.remove('editor-selected');
      selectedEl = el;
      if (selectedEl) selectedEl.classList.add('editor-selected');
      if (selectedEl) {
        // try to initialize color input with element color if set
        var c = window.getComputedStyle(selectedEl).color;
        try {
          // convert 'rgb(r,g,b)' to #rrggbb
          var m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
          if (m) {
            var hex = '#' + ((1 << 24) + (parseInt(m[1]) << 16) + (parseInt(m[2]) << 8) + parseInt(m[3])).toString(16).slice(1);
            colorInput.value = hex;
          }
        } catch (e) {}
      }
    }

    // Click to select
    els.forEach(function (el) {
      el.addEventListener('click', function (ev) {
        ev.stopPropagation();
        setSelected(el);
      });
      // ensure keyboard focus selects as well
      el.addEventListener('focus', function () { setSelected(el); });
    });

    // Color changes apply to selected element
    colorInput.addEventListener('input', function () {
      if (!selectedEl) return;
      selectedEl.style.color = colorInput.value;
    });

    allWhite.addEventListener('click', function () {
      els.forEach(function (e) { e.style.color = '#ffffff'; });
      colorInput.value = '#ffffff';
    });

    saveBtn.addEventListener('click', async function () {
      if (!_adminToken) {
        _adminToken = window.prompt('Enter admin token (dev only)');
        if (!_adminToken) return alert('Admin token required to save');
      }

      // gather content: send html + color if present
      var payload = {};
      els.forEach(function (e) {
        var k = e.getAttribute('data-content-key');
        if (!k) return;
        var style = {};
        if (e.style && e.style.color) style.color = e.style.color;
        var val = { html: e.innerHTML };
        if (Object.keys(style).length) val.style = style;
        payload[k] = val;
      });

      try {
        var res = await fetch('http://localhost:3002/api/content', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': _adminToken
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert('Content saved!');
          // update UI: mark as saved
          status.textContent = 'Saved at ' + new Date().toLocaleTimeString();
        } else if (res.status === 401) {
          alert('Unauthorized — admin token invalid');
          _adminToken = null;
        } else {
          var text = await res.text().catch(function () { return res.statusText; });
          alert('Save failed: ' + (text || res.statusText));
          console.error('Save content error', res.status, text);
        }
      } catch (err) {
        console.error('Failed saving content', err);
        alert('Network error when saving content');
      }
    });

    // clicking outside deselects
    document.addEventListener('click', function () { setSelected(null); });
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
    // There may be multiple forms with id 'contactForm' (older HTML variants) — attach handler to all.
    var forms = document.querySelectorAll('#contactForm');
    if (!forms || forms.length === 0) return;

    forms.forEach(function (form) {
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
        // client-side cooldown to prevent accidental double submissions
        var last = Number(form.dataset.lastSubmit || 0);
        var cooldown = Number(form.dataset.cooldownMs || 15000);
        if (Date.now() - last < cooldown) {
          showMessage(form, 'Please wait a moment before sending again.', 'error');
          if (submit) submit.disabled = false;
          if (submit) submit.textContent = prev;
          return;
        }
        form.dataset.lastSubmit = String(Date.now());
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
    });
  }

  // initialize on DOMContentLoaded
  async function init() {
    setYear();
    setupHamburger();
    setupSmoothScrolling();
    setupContactFormHandler();

    // Fetch content from backend and apply if available
    var content = await fetchContent();
    if (content) applyContent(content);

    // Editor mode: enable inline editing and save UI
    if (isEditorMode()) {
      // add a tiny highlight style for editor
      var css = document.createElement('style');
      css.textContent = '\n.editor-highlight{outline:2px dashed rgba(6,182,212,0.35);background:rgba(6,182,212,0.03);padding:0.05rem 0.05rem;border-radius:4px}\n.editor-selected{box-shadow:0 6px 30px rgba(0,0,0,0.4), 0 0 0 3px rgba(6,182,212,0.09);outline:2px solid rgba(6,182,212,0.18)}\n#editorBar input[type=color]{border-radius:6px;border:none;padding:0;height:28px;width:40px}';
      document.head.appendChild(css);
      enableInlineEditing();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
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
