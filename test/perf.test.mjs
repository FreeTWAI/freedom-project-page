import test from 'node:test';
import assert from 'node:assert/strict';
import { renderProjectPage } from '../src/index.mjs';

const manifest = { schema_version: 'freedom.project/v1', kind: 'Project', project_id: 'project:example', name: 'Example project', summary: 'A source-only example.', repository: { visibility: 'public', full_name: 'example/project', html_url: 'https://github.com/example/project', repository_id: '42', source_lineage: [] }, data_boundary: { classification: 'public', customer_data_mode: 'none' }, description: { problem: 'Make a useful example.', audiences: ['Makers'], capabilities: ['Build a source page'], limitations: ['No official status verification'] }, page: { publication: 'github_pages', canonical_platform_url: 'https://staging.freetwai.com/' }, ownership: { accountable_team: null, external_owner: { login: 'example' }, security_contact: 'https://github.com/example/project/security' }, licensing: { spdx_expression: 'NOASSERTION', source_distribution: 'source_available' }, release: { policy: 'freedom.no-release/v1' }, links: { documentation: 'https://github.com/example/project', demo: null, support: null, issues: null } };

test('renderProjectPage performance benchmark', () => {
  const start = performance.now();
  const iterations = 10000;
  for (let i = 0; i < iterations; i++) {
    renderProjectPage(manifest);
  }
  const end = performance.now();
  const duration = end - start;
  const avg = duration / iterations;
  console.log(`Rendered ${iterations} times in ${duration.toFixed(2)}ms (avg: ${avg.toFixed(4)}ms/render)`);
  assert.ok(avg < 5, 'Rendering a single page should take less than 5ms');
});
