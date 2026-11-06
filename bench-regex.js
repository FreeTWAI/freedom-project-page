const value = 'https://example.com/foo?bar=1';

console.time('inline');
for (let i = 0; i < 100000; i++) {
  let url = new URL(value);
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const r1 = /[\\\s]/.test(value);
  const r2 = /%(?:40|2f|5c)/i.test(value.split(/[?#]/, 1)[0].split('://')[1]?.split('/')[0] ?? '');
  const r3 = /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host);
  for (const key of url.searchParams.keys()) /token|secret|password|credential|signature|(?:^|_)key$|auth/i.test(key);
}
console.timeEnd('inline');

const R_BRACKETS = /^\[|\]$/g;
const R_CHARS = /[\\\s]/;
const R_ENC = /%(?:40|2f|5c)/i;
const R_HOST = /(?:^|\.)(?:localhost|local|internal|test|invalid)$/;
const R_CRED = /token|secret|password|credential|signature|(?:^|_)key$|auth/i;

console.time('hoisted');
for (let i = 0; i < 100000; i++) {
  let url = new URL(value);
  const host = url.hostname.toLowerCase().replace(R_BRACKETS, '');
  const r1 = R_CHARS.test(value);
  const r2 = R_ENC.test(value.split(/[?#]/, 1)[0].split('://')[1]?.split('/')[0] ?? '');
  const r3 = R_HOST.test(host);
  for (const key of url.searchParams.keys()) R_CRED.test(key);
}
console.timeEnd('hoisted');
