/* Password-gate logic for drafts.html — DOM-free decision core.
 *
 * Extracted from drafts.html (H7506, 30-10-2026) so the four gate scenarios
 * (wrong password → deny · unconfigured hash → default-deny · correct
 * password → grant · brute-force cap) run under node in
 * tests/drafts_gate.test.js, wrapped by tests/test_drafts_gate.py.
 *
 * This file holds no configuration and no password material: the SHA-256
 * hash lives in PASSWORD_HASH in drafts.html. How to set/rotate it —
 * «Пароль закрытого раздела drafts.html» in SECURITY.md.
 */
(function (root, factory) {
  'use strict';
  const api = factory(root);
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.RrGate = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';

  const FREE_ATTEMPTS = 4;      // отказов до первой блок-паузы
  const LOCK_BASE_SECONDS = 30; // 5-й отказ → 30 с, далее удвоение
  const LOCK_CAP_SECONDS = 900; // потолок: 15 минут
  const STORE_KEY = 'drafts-gate-attempts';

  let memoryStore = null;

  function isConfigured(passwordHash) {
    if (typeof passwordHash !== 'string') return false;
    const value = passwordHash.trim().toLowerCase();
    return value !== '' && value !== 'placeholder_hash';
  }

  async function sha256Hex(message) {
    const bytes = new TextEncoder().encode(String(message));
    const digest = await root.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /* localStorage может быть запрещён (файл://, приватные настройки) —
     тогда счётчик живёт в памяти до перезагрузки страницы. */
  function getStore() {
    if (memoryStore) return memoryStore;
    try {
      const probe = STORE_KEY + '-probe';
      root.localStorage.setItem(probe, '1');
      root.localStorage.removeItem(probe);
      memoryStore = root.localStorage;
    } catch (e) {
      const mem = new Map();
      memoryStore = {
        getItem: (key) => (mem.has(key) ? mem.get(key) : null),
        setItem: (key, value) => { mem.set(key, String(value)); },
      };
    }
    return memoryStore;
  }

  function readState(store) {
    try {
      const raw = store.getItem(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        count: typeof parsed.count === 'number' ? parsed.count : 0,
        lockUntil: typeof parsed.lockUntil === 'number' ? parsed.lockUntil : 0,
      };
    } catch (e) {
      return { count: 0, lockUntil: 0 };
    }
  }

  function writeState(store, state) {
    try {
      store.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* счётчик не критичен: без хранилища замок остаётся замком */
    }
  }

  function lockSecondsFor(count) {
    const step = count - FREE_ATTEMPTS - 1;
    if (step < 0) return 0;
    return Math.min(LOCK_CAP_SECONDS, LOCK_BASE_SECONDS * Math.pow(2, step));
  }

  /**
   * Одна попытка входа. Статусы:
   *   config-missing — PASSWORD_HASH пуст/плейсхолдер → default-deny
   *   locked-out     — блок-пауза ещё активна (waitSeconds осталось)
   *   deny           — неверный пароль (waitSeconds > 0, когда включился кап)
   *   grant          — верный пароль
   */
  async function attemptPassword(input, passwordHash, nowMs, store) {
    const now = typeof nowMs === 'number' ? nowMs : Date.now();
    const storage = store || getStore();
    const state = readState(storage);

    if (state.lockUntil > now) {
      return { status: 'locked-out', waitSeconds: Math.ceil((state.lockUntil - now) / 1000) };
    }
    if (!isConfigured(passwordHash)) {
      return { status: 'config-missing' };
    }

    const hash = await sha256Hex(input);
    if (hash === passwordHash.trim().toLowerCase()) {
      writeState(storage, { count: 0, lockUntil: 0 });
      return { status: 'grant' };
    }

    state.count += 1;
    const waitSeconds = lockSecondsFor(state.count);
    if (waitSeconds > 0) {
      state.lockUntil = now + waitSeconds * 1000;
    }
    writeState(storage, state);
    return { status: 'deny', waitSeconds: waitSeconds, attempts: state.count };
  }

  return {
    attemptPassword: attemptPassword,
    sha256Hex: sha256Hex,
    isConfigured: isConfigured,
    lockSecondsFor: lockSecondsFor,
    FREE_ATTEMPTS: FREE_ATTEMPTS,
    LOCK_BASE_SECONDS: LOCK_BASE_SECONDS,
    LOCK_CAP_SECONDS: LOCK_CAP_SECONDS,
    STORE_KEY: STORE_KEY,
  };
});
