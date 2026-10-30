/* Четыре сценария замка drafts.html (H7506) — запускается под node,
 * обёрнут pytest-тестом tests/test_drafts_gate.py:
 *   1. неверный пароль → deny (задержка включается после FREE_ATTEMPTS)
 *   2. пустой / плейсхолдерный хеш → default-deny (любой ввод, даже «верный»)
 *   3. верный пароль → grant (счётчик отказов сбрасывается)
 *   4. кап: задержка удваивается и упирается в LOCK_CAP_SECONDS,
 *      во время паузы не открывает даже верный пароль
 * Exit 0 = все сценарии зелёные.
 */
'use strict';

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = require('crypto').webcrypto;
}

const RrGate = require('../js/drafts-gate.js');

function fakeStore() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
  };
}

const failures = [];

function check(name, cond, detail) {
  if (cond) {
    console.log('PASS ' + name);
  } else {
    failures.push(name + (detail ? ' — ' + detail : ''));
    console.log('FAIL ' + name + (detail ? ' — ' + detail : ''));
  }
}

(async () => {
  const NOW = 1700000000000;
  const PASSWORD = 'правильный-пароль';
  const hash = await RrGate.sha256Hex(PASSWORD);
  check('sha256Hex matches node crypto', /^[0-9a-f]{64}$/.test(hash), hash);

  // 1. неверный пароль → deny
  const store1 = fakeStore();
  let v = await RrGate.attemptPassword('не-пароль', hash, NOW, store1);
  check('wrong password → deny, no delay yet', v.status === 'deny' && v.waitSeconds === 0, JSON.stringify(v));
  for (let i = 0; i < RrGate.FREE_ATTEMPTS; i++) {
    v = await RrGate.attemptPassword('не-пароль', hash, NOW + (i + 1) * 1000, store1);
  }
  check('lockout engages on the (FREE_ATTEMPTS+1)-th failure', v.status === 'deny' && v.waitSeconds === RrGate.LOCK_BASE_SECONDS, JSON.stringify(v));

  // 2. пустой / плейсхолдерный хеш → default-deny
  const store2 = fakeStore();
  const emptyV = await RrGate.attemptPassword(PASSWORD, '', NOW, store2);
  const placeholderV = await RrGate.attemptPassword(PASSWORD, 'PLACEHOLDER_' + 'HASH', NOW, store2);
  const whitespaceV = await RrGate.attemptPassword(PASSWORD, '   ', NOW, store2);
  check('empty hash → default-deny', emptyV.status === 'config-missing', JSON.stringify(emptyV));
  check('placeholder hash → default-deny', placeholderV.status === 'config-missing', JSON.stringify(placeholderV));
  check('whitespace hash → default-deny', whitespaceV.status === 'config-missing', JSON.stringify(whitespaceV));

  // 3. верный пароль → grant, счётчик сбрасывается
  const store3 = fakeStore();
  for (let i = 0; i < 3; i++) {
    await RrGate.attemptPassword('не-пароль', hash, NOW + i * 1000, store3);
  }
  const grantV = await RrGate.attemptPassword(PASSWORD, hash, NOW, store3);
  check('correct password → grant', grantV.status === 'grant', JSON.stringify(grantV));
  const afterGrantV = await RrGate.attemptPassword('не-пароль', hash, NOW, store3);
  check('failure counter resets after grant', afterGrantV.status === 'deny' && afterGrantV.attempts === 1, JSON.stringify(afterGrantV));

  // 4. кап + блок-пауза
  const store4 = fakeStore();
  let v4 = null;
  const step = (RrGate.LOCK_CAP_SECONDS + 1) * 1000; // шаг больше капа — мимо locked-out
  for (let i = 0; i < 12; i++) {
    v4 = await RrGate.attemptPassword('не-пароль', hash, NOW + i * step, store4);
  }
  check('delay doubles and caps at LOCK_CAP_SECONDS', v4.status === 'deny' && v4.waitSeconds === RrGate.LOCK_CAP_SECONDS, JSON.stringify(v4));
  const duringPauseV = await RrGate.attemptPassword(PASSWORD, hash, NOW + 11 * step + 12000, store4);
  check('locked-out during pause even with correct password', duringPauseV.status === 'locked-out' && duringPauseV.waitSeconds > 0, JSON.stringify(duringPauseV));

  if (failures.length) {
    console.error(failures.length + ' scenario(s) FAILED');
    process.exit(1);
  }
  console.log('all 4 gate scenarios green');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
