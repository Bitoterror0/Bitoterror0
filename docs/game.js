(() => {
  'use strict';
  const consolePanel = document.getElementById('mission-console');
  if (!consolePanel) return;
  const cores = new Set();
  let destination = null;
  let selected = null;
  const panels = [1, 2, 3].map(n => document.getElementById(`mission-stage-${n}`));
  const reward = document.getElementById('mission-reward');
  const status = document.getElementById('mission-status');
  function stage(n, moveFocus = true) {
    panels.forEach((p, i) => { p.hidden = i !== n - 1; });
    reward.hidden = n !== 4;
    [1, 2, 3].forEach(i => {
      const node = document.getElementById(`mission-node-${i}`);
      node.classList.toggle('completed', i < n);
      if (i === n) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current');
    });
    status.textContent = `${Math.min(n - 1, 3)} de 3 fases concluídas`;
    if (moveFocus) {
      const heading = (n === 4 ? reward : panels[n - 1]).querySelector('h3');
      heading.setAttribute('tabindex', '-1'); heading.focus();
    }
  }
  document.querySelectorAll('[data-core]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.core;
    if (cores.has(key)) cores.delete(key); else cores.add(key);
    button.setAttribute('aria-pressed', String(cores.has(key)));
    document.getElementById('core-feedback').textContent = cores.size === 3 ? 'Núcleo reativado. Próxima órbita disponível.' : `${cores.size} de 3 conexões ativadas.`;
    document.getElementById('mission-next-1').disabled = cores.size !== 3;
  }));
  document.getElementById('mission-next-1').addEventListener('click', () => { if (cores.size === 3) stage(2); });
  document.querySelectorAll('[data-destination]').forEach(button => button.addEventListener('click', () => {
    destination = button.dataset.destination;
    document.querySelectorAll('[data-destination]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.getElementById('mission-next-2').disabled = false;
    document.getElementById('mission-announcement').textContent = `Destino selecionado: ${button.querySelector('strong').textContent}. Continue quando estiver pronto.`;
  }));
  document.getElementById('mission-next-2').addEventListener('click', () => { if (destination) stage(3); });
  document.getElementById('mission-back-2').addEventListener('click', () => stage(1));
  document.getElementById('mission-back-3').addEventListener('click', () => stage(2));
  document.querySelectorAll('[data-transmission]').forEach(button => button.addEventListener('click', () => {
    const projects = window.BITVERSE_DATA && window.BITVERSE_DATA.projects;
    selected = Array.isArray(projects) ? projects.find(p => p.name === button.dataset.transmission) : null;
    if (!selected) { document.getElementById('mission-announcement').textContent = 'Catálogo indisponível nesta missão. Use os links diretos de projetos e currículo.'; return; }
    document.querySelectorAll('[data-transmission]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    const preview = document.getElementById('transmission-preview');
    const title = document.createElement('h4'); title.textContent = selected.title;
    const statusText = document.createElement('p'); statusText.className = 'eyebrow'; statusText.textContent = selected.status;
    const description = document.createElement('p'); description.textContent = selected.description;
    const context = document.createElement('p'); context.className = 'muted'; context.textContent = selected.limits.join(' ');
    const link = document.createElement('a'); link.href = selected.url; link.textContent = 'Abrir repositório ↗';
    preview.replaceChildren(title, statusText, description, context, link); preview.hidden = false;
    document.getElementById('mission-announcement').textContent = `Transmissão recebida: ${selected.title}. Estado: ${selected.status}. Portal final disponível.`;
    document.getElementById('mission-complete').disabled = false;
  }));
  document.getElementById('mission-complete').addEventListener('click', () => {
    if (!selected) return;
    const names = {hospitais:'Sistemas hospitalares', bancos:'Sistemas e setor financeiro', internacional:'Systems analysis and application support'};
    const files = {hospitais:'curriculo-hospitais', bancos:'curriculo-bancos', internacional:'resume-international'};
    document.getElementById('mission-reward-copy').textContent = `${names[destination] || 'Currículo completo'}. Currículo selecionado e catálogo de projetos disponíveis abaixo.`;
    document.getElementById('mission-resume').href = `downloads/${files[destination] || 'curriculo-victor'}.pdf`;
    stage(4);
  });
  document.getElementById('mission-restart').addEventListener('click', () => {
    cores.clear(); selected = null; destination = null;
    document.querySelectorAll('[data-core],[data-transmission],[data-destination]').forEach(b => b.setAttribute('aria-pressed','false'));
    document.getElementById('mission-next-1').disabled = true;
    document.getElementById('mission-next-2').disabled = true;
    document.getElementById('mission-complete').disabled = true;
    document.getElementById('transmission-preview').hidden = true;
    document.getElementById('core-feedback').textContent = 'Ative as três conexões para liberar a próxima fase.';
    document.getElementById('mission-announcement').textContent = '';
    stage(1);
  });
  consolePanel.hidden = false; stage(1, false);
})();
