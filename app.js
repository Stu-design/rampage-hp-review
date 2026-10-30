(() => {
  document.documentElement.classList.add('js');
  const navigation = document.querySelector('[data-navigation]');
  const toggle = navigation.querySelector('.menu-toggle');
  const panel = document.getElementById('site-navigation');
  const label = toggle.querySelector('[data-menu-label]');
  const compact = matchMedia('(max-width: 1023px)');
  let open = false;
  const setOpen = (next, restore = false) => {
    open = compact.matches && next;
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? '閉じる' : 'メニュー';
    panel.hidden = compact.matches && !open;
    if (restore) toggle.focus();
  };
  const syncMenu = () => { toggle.hidden = !compact.matches; setOpen(false); };
  toggle.addEventListener('click', () => setOpen(!open));
  navigation.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false, true); }
  });
  navigation.addEventListener('focusout', event => {
    if (open && !navigation.contains(event.relatedTarget)) setOpen(false);
  });
  document.addEventListener('pointerdown', event => {
    if (open && !navigation.contains(event.target)) setOpen(false);
  });
  panel.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.getElementById(anchor.hash.slice(1));
    setOpen(false);
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  });
  compact.addEventListener('change', syncMenu);
  syncMenu();

  const sticky = document.querySelector('[data-sticky-phone]');
  const header = document.querySelector('.site-header');
  let scheduled = false;
  const measure = () => {
    scheduled = false;
    const viewport = window.visualViewport?.height ?? innerHeight;
    const headerHeight = header.getBoundingClientRect().height;
    const wanted = compact.matches && viewport >= 420;
    document.body.classList.toggle('has-sticky', wanted);
    let height = wanted ? sticky.getBoundingClientRect().height : 0;
    if (wanted && viewport - headerHeight - height < 240) {
      document.body.classList.remove('has-sticky'); height = 0;
    }
    document.documentElement.style.setProperty('--sticky-height', `${height}px`);
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  };
  const scheduleMeasure = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(measure); } };
  const observer = new ResizeObserver(scheduleMeasure);
  observer.observe(sticky); observer.observe(header);
  addEventListener('resize', scheduleMeasure);
  window.visualViewport?.addEventListener('resize', scheduleMeasure);
  compact.addEventListener('change', scheduleMeasure);
  document.fonts?.ready.then(scheduleMeasure);
  measure();

  // Fixed bars must not cover a link or control reached with the keyboard.
  document.addEventListener('focusin', event => {
    if (header.contains(event.target) || sticky.contains(event.target)) return;
    requestAnimationFrame(() => {
      const bounds = event.target.getBoundingClientRect();
      const bottom = innerHeight - (document.body.classList.contains('has-sticky') ? sticky.getBoundingClientRect().height : 0);
      if (bounds.bottom > bottom || bounds.top < header.getBoundingClientRect().bottom) event.target.scrollIntoView({ block: 'center' });
    });
  });
})();
