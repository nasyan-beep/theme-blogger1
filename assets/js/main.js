(function () {
  const root = document.documentElement;
  const body = document.body;

  const safeGet = (key) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  };
  const safeSet = (key, value) => {
    try { localStorage.setItem(key, value); } catch (e) { return; }
  };

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = safeGet('nuzanthra-theme');
  const applyTheme = (theme) => root.setAttribute('data-theme', theme);
  applyTheme(storedTheme || (prefersDark ? 'dark' : 'light'));

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      safeSet('nuzanthra-theme', nextTheme);
    });
  }

  const searchToggle = document.getElementById('searchToggle');
  const searchPanel = document.getElementById('searchPanel');
  if (searchToggle && searchPanel) {
    searchToggle.setAttribute('aria-expanded', 'false');
    searchPanel.setAttribute('aria-hidden', 'true');
    searchToggle.addEventListener('click', () => {
      const open = !searchPanel.classList.contains('active');
      searchPanel.classList.toggle('active', open);
      searchToggle.setAttribute('aria-expanded', String(open));
      searchPanel.setAttribute('aria-hidden', String(!open));
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!target || searchPanel.contains(target) || searchToggle.contains(target)) return;
      searchPanel.classList.remove('active');
      searchToggle.setAttribute('aria-expanded', 'false');
      searchPanel.setAttribute('aria-hidden', 'true');
    });
  }

  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileOverlay');

  const closeDrawer = () => {
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (body) body.classList.remove('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    if (drawer) drawer.setAttribute('aria-hidden', 'true');
  };

  if (menuToggle && drawer && overlay) {
    menuToggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    menuToggle.addEventListener('click', () => {
      drawer.classList.add('active');
      overlay.classList.add('active');
      if (body) body.classList.add('menu-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
    });
    overlay.addEventListener('click', closeDrawer);
  }
  if (menuClose) menuClose.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.addEventListener('click', (event) => {
      const target = event.target;
      if (target && target.tagName === 'A') closeDrawer();
    });
  }

  const sliderTrack = document.getElementById('featuredTrack');
  let sliderTimer = null;
  let sliderIndex = 0;
  const slides = sliderTrack ? sliderTrack.children.length : 0;

  const goToSlide = (index) => {
    if (!sliderTrack || !slides) return;
    const width = sliderTrack.clientWidth || 1;
    const next = (index + slides) % slides;
    const nextLeft = next * width;
    if (typeof sliderTrack.scrollTo === 'function') {
      sliderTrack.scrollTo({ left: nextLeft, behavior: 'smooth' });
    } else {
      sliderTrack.scrollLeft = nextLeft;
    }
    sliderIndex = next;
  };

  const stopSlider = () => {
    if (sliderTimer) {
      clearInterval(sliderTimer);
      sliderTimer = null;
    }
  };

  const startSlider = () => {
    if (!sliderTrack || slides < 2) return;
    stopSlider();
    sliderTimer = setInterval(() => goToSlide(sliderIndex + 1), 5000);
  };

  const debounce = (fn, delay) => {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, delay);
    };
  };

  if (sliderTrack && slides > 1) {
    startSlider();

    sliderTrack.addEventListener('scroll', debounce(() => {
      const w = sliderTrack.clientWidth || 1;
      sliderIndex = Math.round(sliderTrack.scrollLeft / w);
    }, 90), { passive: true });

    sliderTrack.addEventListener('mouseenter', stopSlider);
    sliderTrack.addEventListener('mouseleave', startSlider);
    sliderTrack.addEventListener('touchstart', stopSlider, { passive: true });
    sliderTrack.addEventListener('touchend', startSlider, { passive: true });
    sliderTrack.addEventListener('pointerdown', stopSlider);
    sliderTrack.addEventListener('pointerup', startSlider);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopSlider();
      else startSlider();
    });
  }

  const tickerTrack = document.getElementById('breakingTrack');
  let tickerTimer = null;
  if (tickerTrack && tickerTrack.scrollWidth > tickerTrack.clientWidth) {
    const resetTicker = () => {
      if (tickerTrack.scrollLeft >= tickerTrack.scrollWidth - tickerTrack.clientWidth - 2) {
        tickerTrack.scrollLeft = 0;
      } else {
        tickerTrack.scrollLeft += 1;
      }
    };
    tickerTimer = setInterval(resetTicker, 26);

    tickerTrack.addEventListener('mouseenter', () => clearInterval(tickerTimer));
    tickerTrack.addEventListener('mouseleave', () => {
      clearInterval(tickerTimer);
      tickerTimer = setInterval(resetTicker, 26);
    });
    tickerTrack.addEventListener('touchstart', () => clearInterval(tickerTimer), { passive: true });
    tickerTrack.addEventListener('touchend', () => {
      clearInterval(tickerTimer);
      tickerTimer = setInterval(resetTicker, 26);
    }, { passive: true });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
      if (searchPanel && searchPanel.classList.contains('active')) {
        searchPanel.classList.remove('active');
        searchPanel.setAttribute('aria-hidden', 'true');
        if (searchToggle) searchToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  const yearLabel = document.getElementById('yearLabel');
  if (yearLabel) yearLabel.textContent = String(new Date().getFullYear());

  const dateLabel = document.getElementById('topbarDate');
  if (dateLabel) {
    dateLabel.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  window.addEventListener('resize', debounce(() => {
    goToSlide(sliderIndex);
    if (window.innerWidth > 1023) closeDrawer();
  }, 160));
})();
