const toTop = document.getElementById('toTop');
if (toTop) {
  window.addEventListener('scroll', () => toTop.classList.toggle('visible', window.scrollY > 400));
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
let closeNav = () => {};
if (burger && nav) {
  // шапка уезжает через transform — выносим панель в body, чтобы position:fixed работал от окна
  document.body.appendChild(nav);
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function openNav() {
    nav.classList.add('open');
    backdrop.classList.add('open');
    document.documentElement.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
    const first = nav.querySelector('.nav-close');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 50);
  }
  closeNav = function () {
    if (!nav.classList.contains('open')) return;
    nav.classList.remove('open');
    backdrop.classList.remove('open');
    document.documentElement.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.contains('open') ? closeNav() : openNav();
  });
  backdrop.addEventListener('click', closeNav);
  const closeBtn = document.getElementById('navClose');
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  // если текущий раздел — анимации, сразу раскрываем его подпункты
  const animTrigger = nav.querySelector('.nav-btn.active[data-flyout-trigger]');
  if (animTrigger) {
    const panel = nav.querySelector('[data-flyout="' + animTrigger.getAttribute('data-flyout-trigger') + '"]');
    if (panel) {
      panel.dataset.keepOpen = '1';
      // после общей инициализации выпадашек (она выставляет aria-expanded=false)
      setTimeout(() => { panel.classList.add('open'); animTrigger.setAttribute('aria-expanded', 'true'); }, 0);
      // по нажатию пользователь снова управляет сам — можно свернуть
      animTrigger.addEventListener('pointerdown', () => { delete panel.dataset.keepOpen; }, { once: true });
    }
  }
}

const flyoutTriggers = document.querySelectorAll('[data-flyout-trigger]');
const allFlyouts = document.querySelectorAll('[data-flyout]');

function closeAllFlyouts(except) {
  allFlyouts.forEach(f => {
    if (f !== except && !f.dataset.keepOpen) f.classList.remove('open');
  });
  flyoutTriggers.forEach(t => {
    if (t !== except) t.setAttribute('aria-expanded', 'false');
  });
}

flyoutTriggers.forEach(trigger => {
  const id = trigger.getAttribute('data-flyout-trigger');
  const panel = document.querySelector(`[data-flyout="${id}"]`);
  if (!panel) return;

  trigger.setAttribute('aria-expanded', 'false');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.contains('open');
    closeAllFlyouts();
    if (!isOpen) {
      panel.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    } else {
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  panel.addEventListener('click', (e) => e.stopPropagation());
});

document.addEventListener('click', () => closeAllFlyouts());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllFlyouts();
});

(function () {
  const header = document.querySelector('.main-bar');
  if (!header) return;
  const subnav = document.querySelector('.subnav');

  function setHeaderHeight() {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-h', h + 'px');
    document.documentElement.style.setProperty('--subnav-top', (header.classList.contains('header--hidden') ? 0 : h) + 'px');
  }

  function setHidden(hidden) {
    header.classList.toggle('header--hidden', hidden);
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--subnav-top', (hidden ? 0 : h) + 'px');
  }

  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);

  const TOP_THRESHOLD = 60;
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (y <= TOP_THRESHOLD) {
      setHidden(false);
    } else if (y > lastY + 4) {
      setHidden(true);
      closeNav();
    } else if (y < lastY - 4) {
      setHidden(false);
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})();
