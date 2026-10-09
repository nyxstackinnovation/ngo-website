/* ============================================
   DONATE PAGE — Interactive Logic
   ============================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Toggle: Campaign vs General ── */
  const toggleBtns = document.querySelectorAll('.donate-toggle__btn');
  const panels = document.querySelectorAll('.donate-panel');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      toggleBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      panels.forEach(panel => {
        panel.classList.toggle('is-hidden', !panel.id.toLowerCase().includes(tab));
      });
    });
  });

  /* ── Amount Selection ── */
  const amountGroups = document.querySelectorAll('.donate-amounts');

  amountGroups.forEach(group => {
    const campaign = group.dataset.campaign;
    const buttons = group.querySelectorAll('.donate-amount-btn');
    const customInput = document.querySelector(`.donate-custom__input[data-campaign="${campaign}"]`);
    const proceedBtn = document.querySelector(`.donate-proceed-btn[data-campaign="${campaign}"]`);

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        if (customInput) customInput.value = '';
        updateProceedButton(proceedBtn, btn.dataset.amount);
      });
    });

    if (customInput) {
      customInput.addEventListener('input', () => {
        const val = customInput.value;
        if (val && parseInt(val) >= 100) {
          buttons.forEach(b => b.classList.remove('is-active'));
          updateProceedButton(proceedBtn, val);
        }
      });
    }
  });

  function updateProceedButton(btn, amount) {
    if (!btn) return;
    const formatted = parseInt(amount).toLocaleString('en-IN');
    btn.textContent = `Proceed to Donate ₹${formatted} →`;
  }

  /* ── Copy UPI ID ── */
  const copyBtn = document.getElementById('copyUpiBtn');
  const upiId = document.getElementById('upiId');

  if (copyBtn && upiId) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(upiId.textContent);
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
          copyBtn.textContent = '📋 Copy';
        }, 2000);
      } catch {
        // Fallback
        const range = document.createRange();
        range.selectNodeContents(upiId);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
          copyBtn.textContent = '📋 Copy';
        }, 2000);
      }
    });
  }

  /* ── Handle URL hash to auto-scroll to campaign ── */
  const hash = window.location.hash.slice(1);
  if (hash) {
    const target = document.getElementById(hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the card briefly
        target.style.boxShadow = '0 0 0 3px var(--primary), var(--shadow-lg)';
        setTimeout(() => {
          target.style.boxShadow = '';
        }, 3000);
      }, 500);
    }
  }
});
