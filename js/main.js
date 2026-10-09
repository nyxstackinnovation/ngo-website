/* ============================================
   SAHAYATA FOUNDATION — Main JavaScript
   Shared utilities, navigation, form validation
   ============================================ */

'use strict';

/* ──────────────────────────────────────────
   NAVIGATION
   ────────────────────────────────────────── */
const NavController = (() => {
  const header   = document.querySelector('.header');
  const nav      = document.querySelector('.nav');
  const toggle   = document.querySelector('.nav-toggle');
  const overlay  = document.querySelector('.nav-overlay');
  const links    = document.querySelectorAll('.nav__link');

  function openNav() {
    nav?.classList.add('is-open');
    toggle?.classList.add('is-active');
    overlay?.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav?.classList.remove('is-open');
    toggle?.classList.remove('is-active');
    overlay?.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  function init() {
    toggle?.addEventListener('click', () => {
      nav?.classList.contains('is-open') ? closeNav() : openNav();
    });
    overlay?.addEventListener('click', closeNav);
    links.forEach(link => link.addEventListener('click', closeNav));

    // Header scroll shadow
    window.addEventListener('scroll', () => {
      header?.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });

    // Active link highlight
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(link => {
      const href = link.getAttribute('href')?.split('/').pop();
      if (href === currentPage) {
        link.classList.add('is-active');
      }
    });
  }

  return { init };
})();


/* ──────────────────────────────────────────
   SCROLL ANIMATIONS (Intersection Observer)
   ────────────────────────────────────────── */
const ScrollAnimations = (() => {
  function init() {
    const targets = document.querySelectorAll('.fade-in');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }
  return { init };
})();


/* ──────────────────────────────────────────
   BACK TO TOP BUTTON
   ────────────────────────────────────────── */
const BackToTop = (() => {
  function init() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  return { init };
})();


/* ──────────────────────────────────────────
   FORM VALIDATION ENGINE
   ────────────────────────────────────────── */
const FormValidator = (() => {
  const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex  = /^[6-9]\d{9}$/;
  const pinRegex    = /^\d{6}$/;

  const validators = {
    required: (value) => value.trim() !== '',
    email:    (value) => emailRegex.test(value),
    phone:    (value) => phoneRegex.test(value),
    pin:      (value) => pinRegex.test(value),
    minLength: (value, len) => value.trim().length >= len,
    checked:  (_, __, el) => el.checked,
  };

  const messages = {
    required:  'This field is required.',
    email:     'Please enter a valid email address.',
    phone:     'Please enter a valid 10-digit mobile number.',
    pin:       'Please enter a valid 6-digit PIN code.',
    minLength: (len) => `Must be at least ${len} characters.`,
    checked:   'You must accept the terms and conditions.',
  };

  function showError(field, message) {
    field.classList.add('is-error');
    const errorEl = field.closest('.form-group')?.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
  }

  function clearError(field) {
    field.classList.remove('is-error');
    const errorEl = field.closest('.form-group')?.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }
  }

  function validateField(field) {
    const rules = field.dataset.validate?.split('|') || [];
    clearError(field);

    for (const ruleStr of rules) {
      const [rule, param] = ruleStr.split(':');
      const value = field.value || '';
      const valid = validators[rule]?.(value, param, field);

      if (!valid) {
        const msg = typeof messages[rule] === 'function'
          ? messages[rule](param)
          : messages[rule];
        showError(field, msg || 'Invalid value.');
        return false;
      }
    }
    return true;
  }

  function validateForm(form) {
    const fields = form.querySelectorAll('[data-validate]');
    let isValid = true;
    let firstError = null;

    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
        if (!firstError) firstError = field;
      }
    });

    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }

    return isValid;
  }

  function init(formSelector, onSuccess) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // Real-time validation on blur
    const fields = form.querySelectorAll('[data-validate]');
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-error')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(form)) {
        if (onSuccess) {
          onSuccess(form);
        }
      }
    });
  }

  return { init, validateForm };
})();


/* ──────────────────────────────────────────
   FORM SUBMISSION HANDLER
   ────────────────────────────────────────── */
const FormSubmitter = (() => {
  /**
   * Submit form data to a form endpoint.
   * Replace the placeholder URLs with your actual form service endpoints.
   */
  async function submit(form, endpoint) {
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn?.textContent;
    const alertContainer = form.querySelector('.form-alert') || form.parentElement.querySelector('.form-alert');

    try {
      // Disable button, show loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
      }

      const formData = new FormData(form);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        showAlert(alertContainer, 'success',
          '✅ Thank you! Your submission has been received. We will get back to you shortly.');
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      showAlert(alertContainer, 'error',
        '❌ Something went wrong. Please try again or email us directly at contact@sahayatafoundation.org');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  function showAlert(container, type, message) {
    if (!container) return;
    container.className = `alert alert--${type} form-alert`;
    container.textContent = message;
    container.style.display = 'flex';
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      container.style.display = 'none';
    }, 8000);
  }

  return { submit, showAlert };
})();


/* ──────────────────────────────────────────
   COUNTER ANIMATION (for stats)
   ────────────────────────────────────────── */
const CounterAnimation = (() => {
  function animate(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function init() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ──────────────────────────────────────────
   SMOOTH SCROLL for anchor links
   ────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}


/* ──────────────────────────────────────────
   INITIALIZE ALL
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  NavController.init();
  ScrollAnimations.init();
  BackToTop.init();
  CounterAnimation.init();
  initSmoothScroll();
});
