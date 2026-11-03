const manifest = { schema_version: 'freedom.project/v1', kind: 'Project', project_id: 'project:example', name: 'Example project', summary: 'A source-only example.', repository: { visibility: 'public', full_name: 'example/project', html_url: 'https://github.com/example/project', repository_id: '42', source_lineage: [] }, data_boundary: { classification: 'public', customer_data_mode: 'none' }, description: { problem: 'Make a useful example.', audiences: ['Makers'], capabilities: ['Build a source page'], limitations: ['No official status verification'] }, page: { publication: 'github_pages', canonical_platform_url: 'https://staging.freetwai.com/' }, ownership: { accountable_team: null, external_owner: { login: 'example' }, security_contact: 'https://github.com/example/project/security' }, licensing: { spdx_expression: 'NOASSERTION', source_distribution: 'source_available' }, release: { policy: 'freedom.no-release/v1' }, links: { documentation: 'https://github.com/example/project', demo: null, support: null, issues: null } };

console.time('inline');
for (let i = 0; i < 10000; i++) {
  /^project:[a-z0-9][a-z0-9-]{1,62}$/.test(manifest.project_id ?? '');
  /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(manifest.repository.full_name);
  /^[1-9][0-9]{0,19}$/.test(manifest.repository.repository_id ?? '');
}
console.timeEnd('inline');

const r1 = /^project:[a-z0-9][a-z0-9-]{1,62}$/;
const r2 = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;
const r3 = /^[1-9][0-9]{0,19}$/;
console.time('hoisted');
for (let i = 0; i < 10000; i++) {
  r1.test(manifest.project_id ?? '');
  r2.test(manifest.repository.full_name);
  r3.test(manifest.repository.repository_id ?? '');
}
console.timeEnd('hoisted');
