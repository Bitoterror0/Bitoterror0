(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.getElementById('motion-toggle');
  let stored = null;
  try { stored = localStorage.getItem('bitverse-motion'); } catch (_) {}
  let paused = reduced.matches || new URLSearchParams(location.search).get('motion') === 'off' || stored === 'off';
  let introTimer;
  function motionState() {
    root.classList.toggle('motion-off', paused);
    button.setAttribute('aria-pressed', String(paused));
    button.disabled = reduced.matches;
    button.textContent = reduced.matches ? 'Movimento reduzido pelo sistema' : paused ? 'Ativar movimento' : 'Pausar movimento';
    if (paused) { clearTimeout(introTimer); root.classList.remove('intro-playing'); }
  }
  motionState();
  button.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('bitverse-motion', paused ? 'off' : 'on'); } catch (_) {}
    motionState();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) paused = true; motionState(); });
  function intro() {
    if (paused || reduced.matches) return;
    clearTimeout(introTimer);
    root.classList.remove('intro-playing');
    requestAnimationFrame(() => {
      if (paused) return;
      root.classList.add('intro-playing');
      introTimer = setTimeout(() => root.classList.remove('intro-playing'), 2600);
    });
  }
  document.getElementById('replay-intro').addEventListener('click', intro);
  try { if (!sessionStorage.getItem('bitverse-intro')) { intro(); sessionStorage.setItem('bitverse-intro', 'seen'); } } catch (_) { intro(); }
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const search = document.getElementById('project-search');
  const empty = document.getElementById('project-empty');
  const count = document.getElementById('project-count');
  const norm = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  let category = 'todos';
  function applyFilters() {
    const query = norm(search.value.trim());
    let visible = 0;
    cards.forEach(card => {
      const matches = (category === 'todos' || card.dataset.category === category) && norm(card.dataset.search).includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    });
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.filter === category)));
    count.textContent = `${visible} de ${cards.length} repositórios públicos`;
    empty.hidden = visible !== 0;
  }
  filters.forEach(filter => filter.addEventListener('click', () => { category = filter.dataset.filter; applyFilters(); }));
  search.addEventListener('input', applyFilters);
  document.getElementById('clear-search').addEventListener('click', () => { search.value = ''; category = 'todos'; applyFilters(); search.focus(); });
  applyFilters();
  const timeline = window.BITVERSE_DATA && window.BITVERSE_DATA.timeline;
  if (Array.isArray(timeline) && timeline.length) {
    const player = document.getElementById('chapter-player');
    const content = document.getElementById('chapter-content');
    const prev = document.getElementById('chapter-prev');
    const next = document.getElementById('chapter-next');
    let chapter = 0;
    function renderChapter() {
      const item = timeline[chapter];
      const nodes = [['p', item.org, 'eyebrow'], ['h3', item.title, ''], ['p', item.date, 'muted'], ['p', item.body, '']].map(([tag, text, css]) => {
        const element = document.createElement(tag); element.textContent = text; element.className = css; return element;
      });
      content.replaceChildren(...nodes);
      document.getElementById('chapter-number').textContent = `CAPÍTULO ${String(chapter + 1).padStart(2, '0')} / ${timeline.length}`;
      prev.disabled = chapter === 0; next.disabled = chapter === timeline.length - 1;
      player.querySelector('.chapter-progress i').style.width = `${(chapter + 1) / timeline.length * 100}%`;
    }
    prev.addEventListener('click', () => { if (chapter > 0) { chapter--; renderChapter(); } });
    next.addEventListener('click', () => { if (chapter < timeline.length - 1) { chapter++; renderChapter(); } });
    renderChapter(); player.hidden = false;
  }
})();
