import { publicHttpsUrl } from './src/index.mjs';

const url = 'https://github.com/example/project';

console.time('url');
for (let i = 0; i < 10000; i++) {
  publicHttpsUrl(url);
}
console.timeEnd('url');
