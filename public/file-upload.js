/*
 * Custom file picker for every <input type="file"> on the site (dishes, flowers, restaurant and
 * table photos, profile): the native "Choose File / No file chosen" control is hidden and a
 * dark-emerald drop zone shows an icon, the label in the current language and a preview of the
 * chosen photo. The real input stays in the form (same name, id, accept, required and change
 * events), so the existing upload code keeps working; dropping a file fills that input.
 * Inputs rendered later by the app are picked up automatically. Opt out with data-native.
 */
(() => {
  'use strict';
  const COPY = {
    uz: { photo: 'Rasm tanlash yoki shu yerga tashlang', file: 'Fayl tanlash yoki shu yerga tashlang', change: 'Boshqa rasm tanlash', chosen: (n) => n + ' ta fayl tanlandi' },
    ru: { photo: 'Выберите фото или перетащите сюда', file: 'Выберите файл или перетащите сюда', change: 'Выбрать другое фото', chosen: (n) => 'Выбрано файлов: ' + n },
    en: { photo: 'Choose a photo or drop it here', file: 'Choose a file or drop it here', change: 'Choose another photo', chosen: (n) => n + ' files chosen' },
  };
  const words = () => COPY[document.documentElement.lang] || COPY.uz;
  const ICON = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7l1.4-2h6.8l1.4 2h1.7A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.6"/></svg>';
  const images = (input) => !input.accept || /image/.test(input.accept);
  const urls = new WeakMap();

  function render(input) {
    const zone = input.closest('.rf-upload');
    if (!zone) return;
    const w = words(),
      files = [...(input.files || [])];
    (urls.get(input) || []).forEach((u) => URL.revokeObjectURL(u));
    const made = [];
    const preview = zone.querySelector('.rf-upload-preview');
    preview.innerHTML = '';
    for (const f of files.slice(0, 6)) {
      if (/^image\//.test(f.type)) {
        const url = URL.createObjectURL(f);
        made.push(url);
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        preview.append(img);
      } else {
        const name = document.createElement('span');
        name.className = 'rf-upload-name';
        name.textContent = f.name;
        preview.append(name);
      }
    }
    urls.set(input, made);
    zone.classList.toggle('has-file', files.length > 0);
    zone.querySelector('.rf-upload-text').textContent = files.length ? (files.length === 1 ? files[0].name : w.chosen(files.length)) : images(input) ? w.photo : w.file;
    zone.querySelector('.rf-upload-hint').textContent = files.length ? w.change : '';
  }

  function enhance(input) {
    if (input.dataset.rfUpload || input.dataset.native !== undefined || input.hidden) return;
    input.dataset.rfUpload = '1';
    const zone = document.createElement('span');
    zone.className = 'rf-upload';
    zone.innerHTML = `<span class="rf-upload-icon">${ICON}</span><span class="rf-upload-copy"><span class="rf-upload-text"></span><small class="rf-upload-hint"></small></span><span class="rf-upload-preview"></span>`;
    input.before(zone);
    zone.append(input);
    // Inside a <label> a click already opens the picker; elsewhere the zone opens it itself.
    if (!input.closest('label')) {
      zone.tabIndex = 0;
      zone.setAttribute('role', 'button');
      zone.addEventListener('click', (e) => e.target !== input && input.click());
      zone.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.click()));
    }
    const over = (on) => (e) => {
      e.preventDefault();
      zone.classList.toggle('dragging', on);
    };
    zone.addEventListener('dragenter', over(true));
    zone.addEventListener('dragover', over(true));
    zone.addEventListener('dragleave', over(false));
    zone.addEventListener('drop', (e) => {
      over(false)(e);
      const dropped = [...(e.dataTransfer?.files || [])].filter((f) => !input.accept || input.accept.split(',').some((a) => (a = a.trim()) && (a.endsWith('/*') ? f.type.startsWith(a.slice(0, -1)) : a.startsWith('.') ? f.name.toLowerCase().endsWith(a) : f.type === a)));
      if (!dropped.length) return;
      const dt = new DataTransfer();
      (input.multiple ? dropped : dropped.slice(0, 1)).forEach((f) => dt.items.add(f));
      input.files = dt.files;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    input.addEventListener('change', () => render(input));
    input.form?.addEventListener('reset', () => setTimeout(() => render(input)));
    render(input);
  }

  const scan = (root) => root.querySelectorAll?.('input[type=file]').forEach(enhance);
  const start = () => {
    scan(document);
    new MutationObserver((list) => {
      for (const m of list) for (const n of m.addedNodes) if (n.nodeType === 1) n.matches?.('input[type=file]') ? enhance(n) : scan(n);
    }).observe(document.body, { childList: true, subtree: true });
    // Language switch: relabel the zones that are already on the page.
    new MutationObserver(() => document.querySelectorAll('.rf-upload input[type=file]').forEach(render)).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.RFUpload = { enhance, refresh: render };
})();
