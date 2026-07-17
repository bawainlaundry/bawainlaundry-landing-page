/**
 * Bawain Laundry — script.js
 * Handles: hamburger nav, smooth scroll, accordion FAQ,
 *          waitlist form validation + mock submission,
 *          scroll-reveal animations.
 */

/* ============================================================
   1. HAMBURGER MENU
   ============================================================ */
(function initHamburger() {
  const btn  = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    menu.setAttribute('aria-hidden', String(isOpen));
    menu.classList.toggle('open', !isOpen);
  });

  // Close on nav link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.remove('open');
    }
  });
})();

/* ============================================================
   2. SMOOTH SCROLL — override for all anchor hrefs
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    if (!targetId) return;

    // #waitlist points to the form card inside #waitlist-section
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    e.preventDefault();
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Focus the section for accessibility (skip if it's the form trigger)
    if (targetEl.getAttribute('tabindex') === '-1') {
      targetEl.focus({ preventScroll: true });
    }
  });
});

/* ============================================================
   3. FAQ ACCORDION
   ============================================================ */
(function initAccordion() {
  const accordion = document.getElementById('faqAccordion');
  if (!accordion) return;

  const triggers = accordion.querySelectorAll('.accordion-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const contentId  = trigger.getAttribute('aria-controls');
      const content    = document.getElementById(contentId);
      if (!content) return;

      // Close all others
      triggers.forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          const c = document.getElementById(t.getAttribute('aria-controls'));
          if (c) c.hidden = true;
        }
      });

      // Toggle current
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      content.hidden = isExpanded;
    });

    // Keyboard support
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
})();

/* ============================================================
   4. WAITLIST FORM — validation + mock submission
   ============================================================ */
/* ============================================================
   4. WAITLIST FORM — validation + submission
   ============================================================ */
(function initWaitlistForm() {
  const form        = document.getElementById('waitlistForm');
  const submitBtn   = document.getElementById('submitBtn');
  const namaInput   = document.getElementById('namaLengkap');
  const igInput     = document.getElementById('usernameIG');
  const checkbox    = document.getElementById('privacyConsent');

  if (!form) return;

  // Enable/disable submit based on field state
  function updateSubmitState() {
    const allFilled = namaInput.value.trim() !== '' && igInput.value.trim() !== '';
    const agreed    = checkbox.checked;
    submitBtn.disabled = !(allFilled && agreed);
  }

  namaInput.addEventListener('input', updateSubmitState);
  igInput.addEventListener('input', updateSubmitState);
  checkbox.addEventListener('change', updateSubmitState);

  // Handle submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nama = namaInput.value.trim();
    const ig   = igInput.value.trim().replace(/^@/, ''); // normalise @

    if (!nama || !ig || !checkbox.checked) {
      updateSubmitState();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    // URL sudah diubah akhirannya menjadi /exec
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRvUB1sHwiBj8SJ1qxmlAk6EWdJGr3EnpYP7zVYN8/exec';

    // Membungkus data menjadi format standar formulir agar tidak diblokir browser
    const formData = new URLSearchParams();
    formData.append('nama', nama);
    formData.append('instagram', ig);

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    })
    .then(() => {
      // Munculkan pop-up / modal Terima Kasih
      const modal = document.getElementById('thankyouModal');
      if (modal) {
        modal.hidden = false;
        document.getElementById('modalCloseBtn').focus();
      }
      form.reset();
      submitBtn.textContent = 'Klaim Sekarang';
      updateSubmitState();
    })
    .catch(() => {
      // Walau error di browser karena no-cors, data biasanya tetap terkirim
      const modal = document.getElementById('thankyouModal');
      if (modal) {
        modal.hidden = false;
        document.getElementById('modalCloseBtn').focus();
      }
      form.reset();
      submitBtn.textContent = 'Klaim Sekarang';
      updateSubmitState();
    });
  });
})();

/* ============================================================
   5. SCROLL REVEAL
   ============================================================ */
(function initScrollReveal() {
  // Add reveal class to section direct children
  const targets = document.querySelectorAll(
    '.stat-card, .problem-card, .usp-card, .tier-card, .pricing-card, ' +
    '.howto-step, .about-card, .accordion-item, .waitlist-card'
  );

  targets.forEach(el => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    // Fallback: show all immediately
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* ============================================================
   6. THANK-YOU MODAL
   ============================================================ */
(function initModal() {
  const modal    = document.getElementById('thankyouModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (!modal || !closeBtn) return;

  function closeModal() {
    modal.hidden = true;
    // Return focus to submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.focus({ preventScroll: true });
  }

  // Close on button click
  closeBtn.addEventListener('click', closeModal);

  // Close on overlay click (outside modal-box)
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();

/* ============================================================
   7. PRIVACY POLICY MODAL
   ============================================================ */
(function initPrivacyModal() {
  const trigger  = document.getElementById('privacyModalTrigger');
  const modal    = document.getElementById('privacyModal');
  const closeBtn = document.getElementById('privacyModalClose');
  if (!trigger || !modal || !closeBtn) return;

  function openPrivacyModal() {
    modal.hidden = false;
    closeBtn.focus();
  }

  function closePrivacyModal() {
    modal.hidden = true;
    trigger.focus();
  }

  trigger.addEventListener('click', openPrivacyModal);
  closeBtn.addEventListener('click', closePrivacyModal);

  // Close on overlay click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closePrivacyModal();
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modal.hidden) closePrivacyModal();
  });
})();
