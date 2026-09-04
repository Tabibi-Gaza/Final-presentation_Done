(() => {
  'use strict';

  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  const total = slides.length;
  let current = 0;
  let isAnimating = false;

  const dotsWrap = document.getElementById('dots');
  const progressFill = document.getElementById('progressFill');
  const slideCounter = document.getElementById('slideCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // Build dot navigation
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);


  function updateChrome() {
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    progressFill.style.width = `${((current + 1) / total) * 100}%`;
    slideCounter.innerHTML = `<b>${String(current + 1).padStart(2, '0')}</b> / ${String(total)}`;
  }

  function runCounters(slide) {
    slide.querySelectorAll('.count').forEach(el => {
      if (el.dataset.done) return;
      const target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      el.dataset.done = '1';
      const duration = 1400;
      const start = performance.now();
      const startVal = 0;

      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(startVal + (target - startVal) * eased);
        el.textContent = val;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    });
  }

  function runFunnelBars(slide) {
    slide.querySelectorAll('.funnel-bar').forEach(bar => {
      if (bar.dataset.done) return;
      bar.dataset.done = '1';
      const w = bar.dataset.width || '0';
      requestAnimationFrame(() => {
        bar.style.width = w + '%';
      });
    });
  }

  function activateSlide(slide) {
    // stagger delays are already encoded via --d inline style
    runCounters(slide);
    runFunnelBars(slide);
  }

  function goTo(index, dir = null) {
    if (isAnimating || index === current || index < 0 || index >= total) return;
    isAnimating = true;

    const from = slides[current];
    const to = slides[index];
    const direction = dir || (index > current ? 'forward' : 'back');

    from.classList.remove('active');
    from.classList.add('prev');

    // Force reflow so the browser registers the state before adding active
    // eslint-disable-next-line no-unused-expressions
    to.offsetHeight;

    to.classList.add('active');

    current = index;
    updateChrome();
    activateSlide(to);

    window.setTimeout(() => {
      from.classList.remove('prev');
      isAnimating = false;
    }, 900);
  }

  function next() { goTo(current + 1, 'forward'); }
  function prev() { goTo(current - 1, 'back'); }

  // Init
  slides[0].classList.add('active');
  updateChrome();
  activateSlide(slides[0]);

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Keyboard navigation (RTL-aware: ArrowLeft = next, ArrowRight = prev)
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') goTo(0);
    else if (e.key === 'End') goTo(total - 1);
    else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
  });

  // Touch / swipe navigation
  let touchStartX = 0;
  let touchStartY = 0;
  const deck = document.getElementById('deck');

  deck.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  deck.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next(); // swipe left -> next (RTL forward)
      else prev();
    }
  }, { passive: true });

  // Click zones: right third = prev (RTL start), left third = next
  deck.addEventListener('click', e => {
    if (e.target.closest('.chrome') || e.target.closest('button')) return;
    const w = window.innerWidth;
    const x = e.clientX;
    if (x < w * 0.28) next();
    else if (x > w * 0.72) prev();
  });

  // Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
  fullscreenBtn.addEventListener('click', toggleFullscreen);

})();