/* ------------------------------------------------------------------
   Multi-property digital guidebook.

   Content model:
   - shared.json  → categories/content that's the same for every unit.
                    Bodies can contain {{TOKEN}} placeholders.
   - units.json   → one entry per rental, keyed by the ?unit= value.
                    Each entry supplies:
                      property  — hero image/title/subtitle/welcome
                      tokens    — fills the {{TOKEN}} placeholders
                      overrides — optional, replaces a whole category's
                                  sections for this unit only

   URL pattern:  index.html?unit=2603
------------------------------------------------------------------ */

const ICONS = {
  door: '<path d="M6 21V4a1 1 0 0 1 1-1h8l3 3v15"/><path d="M6 21h12"/><circle cx="14" cy="12" r="0.8" fill="currentColor" stroke="none"/>',
  wifi: '<path d="M5 9.5a12 12 0 0 1 14 0"/><path d="M8 13a7.5 7.5 0 0 1 8 0"/><path d="M11 16.5a3 3 0 0 1 2 0"/><circle cx="12" cy="19.3" r="0.9" fill="currentColor" stroke="none"/>',
  car: '<path d="M4 16V12l2-5h9l3 5v4"/><path d="M4 16h14"/><circle cx="7.5" cy="16.5" r="1.6"/><circle cx="16" cy="16.5" r="1.6"/>',
  utensils: '<path d="M8 3v7a1.5 1.5 0 0 0 3 0V3"/><path d="M9.5 10v11"/><path d="M16 3c-1.4 0-2.5 1.8-2.5 5s1.1 3.6 2.5 3.6V21"/>',
  spa: '<path d="M6 12c1.5-1.5 1.5-3.5 0-5 1.5 1.5 3.5 1.5 5 0-1.5 1.5-1.5 3.5 0 5"/><path d="M5 17c2-1 3-2.6 3-4.5"/><path d="M12 17c2-1 3-2.6 3-4.5"/><path d="M19 17c-2-1-3-2.6-3-4.5"/><path d="M3 20.5h18"/>',
  scroll: '<path d="M7 4h10v13a2.5 2.5 0 0 1-5 0"/><path d="M7 4a2.5 2.5 0 0 0 0 5h10"/><path d="M7 17a2.5 2.5 0 0 0 0 5h5"/>',
  recycle: '<path d="M10 4.5 7.5 8.7"/><path d="M14 4.5h-4l1.5 2.6"/><path d="M18.5 12.5 20.7 16"/><path d="M16.3 19.5h4.2l-1.6-2.7"/><path d="M6.5 19.5 4.3 16"/><path d="M8.7 12.5H4.5l1.6 2.7"/>',
  phone: '<path d="M6.5 4h3l1.2 4-1.9 1.4a11 11 0 0 0 5.8 5.8l1.4-1.9 4 1.2v3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 5 5.6 1.5 1.5 0 0 1 6.5 4z"/>',
  shuttle: '<path d="M3 16V9a1 1 0 0 1 1-1h11l4 4v4"/><path d="M3 16h16"/><circle cx="7" cy="16.5" r="1.6"/><circle cx="16.5" cy="16.5" r="1.6"/><path d="M13 8v4h6"/>',
  bus: '<path d="M4 15V6a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v9"/><path d="M4 15h15"/><path d="M6 9h12"/><circle cx="7.5" cy="16.8" r="1.5"/><circle cx="16" cy="16.8" r="1.5"/>',
  road: '<path d="M9 21 11 3h2l2 18"/><path d="M12 4v2"/><path d="M12 9.5v2"/><path d="M12 15v2"/>',
  food: '<circle cx="12" cy="12" r="8"/><path d="M8 8v3a1.6 1.6 0 0 0 3.2 0V8"/><path d="M9.6 11v6.5"/><path d="M15.2 8c-1.1 0-2 1.4-2 3.1s.9 3 2 3v3.4"/>',
  cart: '<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="9.5" cy="19" r="1.2"/><circle cx="16" cy="19" r="1.2"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2 13.2 13.2 9.2 14.8 10.8 10.8Z"/>',
  ski: '<path d="M4 20 6.5 6a1 1 0 0 1 1-.8h1a1 1 0 0 1 1 1.2L7.7 20"/><path d="M12 20 14.5 6a1 1 0 0 1 1-.8h1a1 1 0 0 1 1 1.2L15.7 20"/><path d="M4 20h5.5"/><path d="M12 20h5.5"/>',
  snowflake: '<path d="M12 2.5v19"/><path d="M4 7l16 10"/><path d="M20 7 4 17"/><path d="M8.3 4 12 6.2 15.7 4"/><path d="M8.3 20 12 17.8 15.7 20"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4"/><path d="M12 19.1v2.4"/><path d="M4.9 4.9l1.7 1.7"/><path d="M17.4 17.4l1.7 1.7"/><path d="M2.5 12h2.4"/><path d="M19.1 12h2.4"/><path d="M4.9 19.1l1.7-1.7"/><path d="M17.4 6.6l1.7-1.7"/>',
  mountain: '<path d="M2.5 19 9 7l3.2 5.6L14.5 9 21.5 19Z"/><circle cx="17.5" cy="6.5" r="1.6"/>',
  boot: '<path d="M9 3v7.2c0 1-.4 2-1.2 2.7L5 15.5a2.3 2.3 0 0 0-.8 1.8V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-2.4-1.7-4.4-4-4.9L13 13.4V3"/><path d="M9 6.5h4"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="15" rx="1.6"/><path d="M8 3.5v4"/><path d="M16 3.5v4"/><path d="M4 10.5h16"/>',
  key: '<circle cx="8" cy="9" r="4"/><path d="M11 12l9 9"/><path d="M17 18l2.2-2.2"/><path d="M14.5 15.5l2.2-2.2"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.6 2.5-6.2 5.5-6.2s5.5 2.6 5.5 6.2"/><circle cx="16.5" cy="7" r="2.3"/><path d="M14.7 12.3c2.4 0.5 4.1 2.7 4.3 5.4"/>'
};

const grid = document.getElementById('grid');
const detail = document.getElementById('detail');
const detailTitle = document.getElementById('detail-title');
const detailSubtitle = document.getElementById('detail-subtitle');
const detailBody = document.getElementById('detail-body');
const backBtn = document.getElementById('back-btn');

let CATEGORIES = [];

function iconSvg(key) {
  const path = ICONS[key] || ICONS.compass;
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>';
}

/* Replace every {{TOKEN}} or {{LINK:TOKEN}} in a string using the
   unit's token map. A missing/blank token renders a soft, honest
   fallback instead of leaking "{{WIFI_PASSWORD}}" to a guest.

   {{LINK:TOKEN}} is for URLs: it builds the whole <a href="..."> tag
   itself (instead of dropping the raw value into an href="{{TOKEN}}"
   in the JSON), so a missing URL falls back to plain text rather than
   breaking out of the href attribute. */
function fillTokens(str, tokens) {
  if (typeof str !== 'string') return str;

  str = str.replace(/\{\{LINK:(\w+)\}\}/g, (match, key) => {
    const val = tokens ? tokens[key] : undefined;
    if (!val) return '<span class="tbd">ask your host</span>';
    const safe = String(val).replace(/"/g, '&quot;');
    return '<a href="' + safe + '" target="_blank" rel="noopener">' + val + '</a>';
  });

  str = str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = tokens ? tokens[key] : undefined;
    if (val === undefined || val === null || val === '') {
      return '<span class="tbd">ask your host</span>';
    }
    return val;
  });

  return str;
}

function buildCategories(shared, unit) {
  const tokens = (unit && unit.tokens) || {};
  const overrides = (unit && unit.overrides) || {};

  return shared.categories.map(cat => {
    const ov = overrides[cat.id];

    let sections = cat.sections || [];
    if (ov && ov.sections) {
      /* Full replacement: this unit's sections completely replace the
         shared category's sections. Use this when a unit's version of a
         category has little or nothing in common with the shared one. */
      sections = ov.sections;
    } else if (ov && ov.extraSections) {
      /* Additive: start from the shared sections (so Times, Digital Key
         App, etc. stay in sync for every unit) and splice in extra,
         unit-only sections. Each extra section can set "after" to a
         shared section's "id" to control where it lands; omitted means
         it's appended at the end. */
      sections = sections.slice();
      ov.extraSections.forEach(extra => {
        const afterIdx = extra.after
          ? sections.findIndex(s => s.id === extra.after)
          : -1;
        const insertAt = afterIdx === -1 ? sections.length : afterIdx + 1;
        sections.splice(insertAt, 0, { heading: extra.heading, body: extra.body });
      });
    }

    const merged = {
      id: cat.id,
      icon: cat.icon,
      title: (ov && ov.title) || cat.title,
      subtitle: (ov && ov.subtitle) || cat.subtitle,
      sections: sections
    };
    merged.title = fillTokens(merged.title, tokens);
    merged.subtitle = fillTokens(merged.subtitle, tokens);
    merged.sections = (merged.sections || [])
      .filter(sec => {
        /* A section whose entire body is nothing but a single {{TOKEN}}
           placeholder is "optional": if that token is blank or missing
           for this unit, the section is left out entirely instead of
           falling back to the usual "ask your host" placeholder. This
           lets a section (like a smart-speaker blurb) apply to some
           units and not others, driven purely by units.json. */
        const bare = typeof sec.body === 'string' && sec.body.trim().match(/^\{\{(\w+)\}\}$/);
        if (bare) {
          const val = tokens[bare[1]];
          if (val === undefined || val === null || val === '') return false;
        }
        return true;
      })
      .map(sec => ({
        heading: fillTokens(sec.heading, tokens),
        body: fillTokens(sec.body, tokens)
      }));
    return merged;
  });
}

function renderGrid() {
  grid.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.type = 'button';
    btn.dataset.id = cat.id;
    btn.innerHTML =
      '<span class="cat-icon">' + iconSvg(cat.icon) + '</span>' +
      '<span class="cat-title">' + cat.title + '</span>' +
      '<span class="cat-subtitle">' + (cat.subtitle || '') + '</span>';
    btn.addEventListener('click', () => openCategory(cat.id, true));
    grid.appendChild(btn);
  });
}

function openCategory(id, pushHash) {
  const cat = CATEGORIES.find(c => c.id === id);
  if (!cat) return;

  detailTitle.innerHTML = cat.title;
  detailSubtitle.innerHTML = cat.subtitle || '';

  detailBody.innerHTML = (cat.sections || []).map(sec =>
    '<div class="section-block">' +
      (sec.heading ? '<h3>' + sec.heading + '</h3>' : '') +
      (sec.body || '') +
    '</div>'
  ).join('');

  detail.classList.add('open');
  detail.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  detail.scrollTop = 0;

  if (pushHash) {
    const params = new URLSearchParams(location.search);
    history.pushState({ cat: id }, '', location.pathname + '?' + params.toString() + '#' + id);
  }
}

function closeDetail(replaceHash) {
  detail.classList.remove('open');
  detail.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (replaceHash) {
    const params = new URLSearchParams(location.search);
    history.pushState({}, '', location.pathname + '?' + params.toString());
  }
}

backBtn.addEventListener('click', () => closeDetail(true));

window.addEventListener('popstate', () => {
  const id = location.hash.replace('#', '');
  if (id) {
    openCategory(id, false);
  } else {
    closeDetail(false);
  }
});

/* Renders a "which property?" chooser when ?unit= is missing/unknown —
   keeps a mistyped or generic QR scan from just showing a broken page,
   and doubles as a quick way to preview every unit while you're
   filling in units.json. */
function renderUnitPicker(units, message) {
  document.getElementById('welcome-heading').textContent = 'Which property?';
  document.getElementById('welcome-text').textContent = message;
  document.getElementById('footer-note').textContent = '';
  document.getElementById('hero-title').textContent = 'Guidebook';
  document.getElementById('hero-subtitle').textContent = '';
  document.getElementById('hero-img').src = 'images/default-hero.jpg';
  document.getElementById('hero-img').alt = 'Guidebook';

  grid.innerHTML = '';
  Object.keys(units)
    .filter(key => !key.startsWith('_') && key !== 'template-copy-me')
    .forEach(key => {
      const u = units[key];
      const a = document.createElement('a');
      a.className = 'cat-btn';
      a.href = '?unit=' + encodeURIComponent(key);
      a.innerHTML =
        '<span class="cat-icon">' + iconSvg('door') + '</span>' +
        '<span class="cat-title">' + (u.property ? u.property.name : key) + '</span>' +
        '<span class="cat-subtitle">' + (u.property ? (u.property.subtitle || '') : '') + '</span>';
      grid.appendChild(a);
    });
}

async function init() {
  try {
    const [sharedRes, unitsRes] = await Promise.all([
      fetch('shared.json', { cache: 'no-store' }),
      fetch('units.json', { cache: 'no-store' })
    ]);
    const shared = await sharedRes.json();
    const units = await unitsRes.json();

    const params = new URLSearchParams(location.search);
    const unitKey = params.get('unit');
    const unit = unitKey ? units[unitKey] : null;

    if (!unit) {
      const msg = unitKey
        ? 'We couldn’t find a property for "' + unitKey + '". Pick yours below:'
        : 'Scan the code on your unit’s door, or pick your property below:';
      renderUnitPicker(units, msg);
      return;
    }

    if (unit.property) {
      document.getElementById('hero-title').textContent = unit.property.name || '';
      document.getElementById('hero-subtitle').textContent = unit.property.subtitle || '';
      document.getElementById('welcome-text').textContent = unit.property.welcome || '';
      document.title = (unit.property.name || 'Guidebook') + ' — Guidebook';
      if (unit.property.heroImage) {
        document.getElementById('hero-img').src = unit.property.heroImage;
        document.getElementById('hero-img').alt = unit.property.name || '';
      }
    }

    CATEGORIES = buildCategories(shared, unit);
    renderGrid();

    const id = location.hash.replace('#', '');
    if (id) openCategory(id, false);

  } catch (err) {
    document.getElementById('welcome-text').textContent =
      'Could not load guidebook content. Please make sure shared.json and units.json are in the same folder as this page.';
    console.error(err);
  }
}

init();
