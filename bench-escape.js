const value = 'Hello <world> & "everyone" \'here\'!';
const iterations = 100000;

const escapeHtml1 = (value) => {
  const str = String(value);
  let res = '';
  let lastIndex = 0;
  for (let i = 0; i < str.length; i++) {
    switch (str.charCodeAt(i)) {
      case 38: res += str.substring(lastIndex, i) + '&amp;'; lastIndex = i + 1; break;
      case 60: res += str.substring(lastIndex, i) + '&lt;'; lastIndex = i + 1; break;
      case 62: res += str.substring(lastIndex, i) + '&gt;'; lastIndex = i + 1; break;
      case 34: res += str.substring(lastIndex, i) + '&quot;'; lastIndex = i + 1; break;
      case 39: res += str.substring(lastIndex, i) + '&#39;'; lastIndex = i + 1; break;
    }
  }
  return lastIndex === 0 ? str : res + str.substring(lastIndex);
};

const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const regex = /[&<>"']/g;
const escapeHtml2 = (value) => String(value).replace(regex, (c) => map[c]);

console.time('loop');
for(let i=0; i<iterations; i++) escapeHtml1(value);
console.timeEnd('loop');

console.time('regex');
for(let i=0; i<iterations; i++) escapeHtml2(value);
console.timeEnd('regex');
