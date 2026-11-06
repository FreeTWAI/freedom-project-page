import { createHash } from 'node:crypto';

const manifest = { schema_version: 'freedom.project/v1', kind: 'Project', project_id: 'project:example', name: 'Example project', summary: 'A source-only example.', repository: { visibility: 'public', full_name: 'example/project', html_url: 'https://github.com/example/project', repository_id: '42', source_lineage: [] }, data_boundary: { classification: 'public', customer_data_mode: 'none' }, description: { problem: 'Make a useful example.', audiences: ['Makers'], capabilities: ['Build a source page'], limitations: ['No official status verification'] }, page: { publication: 'github_pages', canonical_platform_url: 'https://staging.freetwai.com/' }, ownership: { accountable_team: null, external_owner: { login: 'example' }, security_contact: 'https://github.com/example/project/security' }, licensing: { spdx_expression: 'NOASSERTION', source_distribution: 'source_available' }, release: { policy: 'freedom.no-release/v1' }, links: { documentation: 'https://github.com/example/project', demo: null, support: null, issues: null } };

console.time('hash1');
for (let i = 0; i < 10000; i++) {
  createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
}
console.timeEnd('hash1');

const memo = new WeakMap();
const getHash = (obj) => {
  if (memo.has(obj)) return memo.get(obj);
  const hash = createHash('sha256').update(JSON.stringify(obj)).digest('hex');
  memo.set(obj, hash);
  return hash;
};

console.time('hash2');
for (let i = 0; i < 10000; i++) {
  getHash(manifest);
}
console.timeEnd('hash2');
