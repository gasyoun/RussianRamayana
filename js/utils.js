/* Shared utilities for RussianRamayana — loaded by all data-driven pages */

const esc = s => {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

const safeUrl = u => {
  try { return new URL(u).protocol === 'https:' ? u : ''; } catch { return ''; }
};

/**
 * Single switch for audiobook host migration (DH_ROADMAP Phase 0 / Phase 1).
 * Prefer ia_url when Phase 1 fills it (archive.org); else fall back to url
 * (today: raw.githubusercontent.com). Non-https / empty → ''.
 * Pages must call this instead of reading track.url directly.
 */
function resolveAudioUrl(track) {
  if (!track || typeof track !== 'object') return '';
  const candidates = [track.ia_url, track.url];
  for (let i = 0; i < candidates.length; i++) {
    const ok = safeUrl(candidates[i]);
    if (ok) return ok;
  }
  return '';
}

async function loadJSON(path, fallbackTarget) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.error('Error loading ' + path + ':', e);
    if (fallbackTarget) {
      if (typeof fallbackTarget === 'string') {
        document.getElementById(fallbackTarget).innerHTML = '<p style="color:var(--ink-muted);font-style:italic;text-align:center;padding:24px;">Не удалось загрузить данные. Попробуйте обновить страницу.</p>';
      }
    }
    return null;
  }
}
