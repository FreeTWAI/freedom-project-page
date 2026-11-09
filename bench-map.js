const items = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

const listMap = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

const listLoop = (items) => {
  let res = '<ul>';
  for (let i = 0; i < items.length; i++) res += `<li>${items[i]}</li>`;
  return res + '</ul>';
};

console.time('map');
for(let i=0; i<100000; i++) listMap(items);
console.timeEnd('map');

console.time('loop');
for(let i=0; i<100000; i++) listLoop(items);
console.timeEnd('loop');
