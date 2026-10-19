document.addEventListener('click', event => {
  const action = event.target.closest('[data-action-url]');
  if (!action) return;
  const url = action.dataset.actionUrl;
  if (url.startsWith('#')) {
    document.querySelector(url)?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    history.pushState(null, '', url);
  } else {
    const destination = new URL(url, location.href);
    if (destination.origin !== location.origin) window.open(destination.href, '_blank', 'noopener,noreferrer');
    else location.assign(destination.href);
  }
});

const updateDock = () => { document.documentElement.dataset.scrolled = String(scrollY > 24); };
updateDock();
addEventListener('scroll', updateDock, { passive: true });

document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || link.hasAttribute('target') || link.dataset.actionUrl || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const destination = new URL(link.getAttribute('href') || '', location.href);
  if (destination.origin !== location.origin || destination.pathname !== location.pathname || destination.hash || destination.search !== location.search) return;
  event.preventDefault();
  history.pushState(null, '', destination);
  scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});

document.documentElement.classList.add('js');

for (const menu of document.querySelectorAll('.studio-mobile-menu')) {
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a,[data-action-url]')) menu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
}

const search = document.querySelector('#game-search');
const entries = [...document.querySelectorAll('[data-game]')];
const filters = [...document.querySelectorAll('[data-filter]')];
let activeFilter = 'all';
const updateGames = () => {
  const query = (search?.value || '').trim().toLocaleLowerCase('en');
  let visible = 0;
  for (const entry of entries) {
    const match = entry.dataset.search.includes(query) && (activeFilter === 'all' || entry.dataset.status === activeFilter);
    entry.hidden = !match;
    if (match) visible++;
  }
  const count = document.querySelector('#results-count');
  if (count) count.textContent = `${visible} ${visible === 1 ? 'game' : 'games'} shown`;
  const empty = document.querySelector('#empty-games');
  if (empty) empty.hidden = visible !== 0;
};
search?.addEventListener('input', updateGames);
for (const filter of filters) {
  filter.addEventListener('click', () => {
    activeFilter = filter.dataset.filter;
    for (const item of filters) item.setAttribute('aria-pressed', String(item === filter));
    updateGames();
  });
}
document.querySelector('#reset-search')?.addEventListener('click', () => {
  search.value = '';
  activeFilter = 'all';
  for (const item of filters) item.setAttribute('aria-pressed', String(item.dataset.filter === 'all'));
  updateGames();
  search.focus();
});
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const code = document.getElementById(button.dataset.copy);
    const feedback = document.getElementById(button.getAttribute('aria-describedby'));
    button.disabled = true;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(code.textContent);
      feedback.textContent = 'Loader copied to clipboard.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      code.scrollIntoView({ block: 'center' });
      feedback.textContent = 'Clipboard access unavailable. The loader is selected. Copy it using your device controls.';
    } finally {
      button.disabled = false;
    }
  });
}
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((observations) => {
    for (const item of observations) {
      if (!item.isIntersecting) continue;
      item.target.classList.add('enter');
      observer.unobserve(item.target);
    }
  }, { threshold: .1 });
  document.querySelectorAll('.game-entry, .section-heading, .loader-grid > *, .faq-layout > *, .community-top, .community h2').forEach((item) => observer.observe(item));
}

const rotatingWord = document.querySelector('[data-rotating-word]');
if (rotatingWord) {
  const words = ['Open Source', 'High Quality', 'Secure'];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, interval, change;
  const update = () => {
    clearInterval(interval); clearTimeout(change); rotatingWord.classList.remove('is-changing');
    if (preference.matches || document.hidden) return;
    interval = setInterval(() => {
      rotatingWord.classList.add('is-changing');
      change = setTimeout(() => { index = (index + 1) % words.length; rotatingWord.textContent = words[index]; rotatingWord.classList.remove('is-changing'); }, 180);
    }, 2600);
  };
  preference.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  update();
}

setTimeout(() => {
  if (document.documentElement.dataset.background) return;
  const status = document.querySelector('#background-status');
  status.hidden = false;
  status.textContent = 'Background could not start.';
}, 6000);
