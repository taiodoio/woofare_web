/* ─── Woofare State Switcher ──────────────────────────────────────────────── */

(function () {
  'use strict';

  const shell  = document.querySelector('.page-shell');
  const tabs   = document.querySelectorAll('.state-selector__tab');
  const states = document.querySelectorAll('.content-state');
  const mobileSelector = document.querySelector('[data-mobile-selector]');
  const mobileTrigger = document.getElementById('state-selector-mobile-button');
  const mobileMenu = document.getElementById('state-selector-mobile-list');
  const mobileLabel = mobileSelector ? mobileSelector.querySelector('.state-selector__mobile-label') : null;
  const mobileOptions = mobileSelector ? mobileSelector.querySelectorAll('.state-selector__mobile-option') : [];
  const scrollTopButton = document.getElementById('scroll-top');
  const logoLink = document.querySelector('.nav__logo-link');
  const navCta = document.querySelector('.nav__cta');

  const validStateIds = new Set(['aziende', 'dipendenti', 'pet-services']);
  const waitingListByState = {
    'aziende': '#waiting-list-a',
    'dipendenti': '#waiting-list-b',
    'pet-services': '#waiting-list-c'
  };

  function getStateFromHash() {
    const hash = window.location.hash ? window.location.hash.slice(1) : '';
    return validStateIds.has(hash) ? hash : null;
  }

  function setMobileOpen(isOpen) {
    if (!mobileSelector || !mobileTrigger || !mobileMenu) return;
    mobileSelector.dataset.open = isOpen ? 'true' : 'false';
    mobileTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileMenu.hidden = !isOpen;
  }

  function updateMobileState(targetId) {
    if (!mobileOptions.length) return;
    let activeLabel = 'Per Aziende';
    mobileOptions.forEach(option => {
      const isActive = option.dataset.target === targetId;
      option.classList.toggle('state-selector__mobile-option--active', isActive);
      option.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) activeLabel = option.textContent.trim();
    });
    if (mobileLabel) mobileLabel.textContent = activeLabel;
  }

  function activateState(targetId) {
    if (!validStateIds.has(targetId)) return;

    // Update tab buttons
    tabs.forEach(tab => {
      const isActive = tab.dataset.target === targetId;
      tab.classList.toggle('state-selector__tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Show/hide content states
    states.forEach(state => {
      const isActive = state.id === targetId;
      if (isActive) {
        state.removeAttribute('hidden');
        state.setAttribute('aria-current', 'true');
      } else {
        state.setAttribute('hidden', '');
        state.removeAttribute('aria-current');
      }
    });

    // Drive nav link variant via data attribute on shell
    shell.dataset.state = targetId;

    // Keep mobile custom dropdown in sync
    updateMobileState(targetId);
    setMobileOpen(false);

    // Keep nav CTA anchored to the active audience section
    if (navCta && waitingListByState[targetId]) {
      navCta.setAttribute('href', waitingListByState[targetId]);
    }

    // Keep URL hash in sync without forcing a jump
    if (window.location.hash !== `#${targetId}`) {
      history.replaceState(null, '', `#${targetId}`);
    }

    // Persist to sessionStorage so the last tab survives a page reload
    try { sessionStorage.setItem('woofare-state', targetId); } catch (_) {}
  }

  // Bind tab clicks
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateState(tab.dataset.target));
  });

  // Bind mobile custom dropdown
  if (mobileSelector && mobileTrigger && mobileMenu) {
    mobileTrigger.addEventListener('click', () => {
      const isOpen = mobileSelector.dataset.open === 'true';
      setMobileOpen(!isOpen);
    });

    mobileOptions.forEach(option => {
      option.addEventListener('click', () => {
        activateState(option.dataset.target);
        setMobileOpen(false);
      });
    });

    document.addEventListener('click', e => {
      if (!mobileSelector.contains(e.target)) setMobileOpen(false);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setMobileOpen(false);
    });
  }

  // Keyboard: left/right arrow navigates tabs
  const selector = document.querySelector('.state-selector');
  if (selector) {
    selector.addEventListener('keydown', e => {
      const active = [...tabs].findIndex(t => t.classList.contains('state-selector__tab--active'));
      let next = -1;
      if (e.key === 'ArrowRight') next = (active + 1) % tabs.length;
      if (e.key === 'ArrowLeft')  next = (active - 1 + tabs.length) % tabs.length;
      if (next !== -1) {
        tabs[next].focus();
        activateState(tabs[next].dataset.target);
      }
    });
  }

  // Restore last-used state or default to aziende
  const stored = (() => {
    try { return sessionStorage.getItem('woofare-state'); } catch (_) { return null; }
  })();

  const fromHash = getStateFromHash();
  const initial = fromHash || stored || 'aziende';
  activateState(initial);

  // Always start from top on load/refresh so the state selector is visible.
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  // Back/forward or external hash changes should switch state
  window.addEventListener('hashchange', () => {
    const next = getStateFromHash();
    if (next) activateState(next);
  });

  // Smooth-scroll CTA "Scopri come funziona" → first section below hero
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.scrollTo);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Floating button: back to top
  if (scrollTopButton) {
    const toggleScrollTopButton = () => {
      const isVisible = window.scrollY > 320;
      scrollTopButton.classList.toggle('scroll-top--visible', isVisible);
    };

    window.addEventListener('scroll', toggleScrollTopButton, { passive: true });
    toggleScrollTopButton();

    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (logoLink) {
    logoLink.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
