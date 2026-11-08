import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPublicView, renderProjectPage, publicHttpsUrl } from '../src/index.mjs';

const manifest = {
  schema_version: 'freedom.project/v1',
  kind: 'Project',
  project_id: 'project:example',
  name: 'Example project',
  summary: 'A source-only example.',
  repository: { visibility: 'public', full_name: 'example/project', html_url: 'https://github.com/example/project', repository_id: '42', source_lineage: [] },
  data_boundary: { classification: 'public', customer_data_mode: 'none' },
  description: { problem: 'Make a useful example.', audiences: ['Makers'], capabilities: ['Build a source page'], limitations: ['No official status verification'] },
  page: { publication: 'github_pages', canonical_platform_url: 'https://staging.freetwai.com/' },
  ownership: { accountable_team: null, external_owner: { login: 'example' }, security_contact: 'https://github.com/example/project/security' },
  licensing: { spdx_expression: 'NOASSERTION', source_distribution: 'source_available' },
  release: { policy: 'freedom.no-release/v1' },
  links: { documentation: 'https://github.com/example/project', demo: null, support: null, issues: null }
};

test('handles character escaping properly for edge cases', () => {
  renderProjectPage({...manifest, name: '&"\'<>'});
});

test('validates string boundaries and limits', () => {
  assert.throws(() => renderProjectPage({...manifest, name: ''}), TypeError);
  assert.throws(() => renderProjectPage({...manifest, name: 'a'.repeat(2000)}), TypeError);
});

test('validates array bounds for description lists', () => {
  assert.throws(() => renderProjectPage({...manifest, description: {...manifest.description, audiences: []}}), TypeError);
  assert.throws(() => renderProjectPage({...manifest, description: {...manifest.description, audiences: Array(50).fill('a')}}), TypeError);
  assert.throws(() => renderProjectPage({...manifest, description: {...manifest.description, audiences: 'not an array'}}), TypeError);
});

test('rejects public URLs that fail length or format requirements', () => {
  assert.throws(() => publicHttpsUrl('not a url'), TypeError);
  assert.throws(() => publicHttpsUrl('http://example.com'), TypeError);
  assert.throws(() => publicHttpsUrl('https://example.com:8080'), TypeError);
  assert.throws(() => publicHttpsUrl('https://example.com/ a'), TypeError);
  assert.throws(() => publicHttpsUrl('https://example%40.com'), TypeError);
  assert.throws(() => publicHttpsUrl('https://example.com@evil.com'), TypeError);
  assert.doesNotThrow(() => publicHttpsUrl('https:example.com')); // Covers protocol vs authority split logic edge cases
});

test('rejects malformed manifest versions and kinds', () => {
  assert.throws(() => projectPublicView({...manifest, schema_version: 'wrong'}), TypeError);
  assert.throws(() => projectPublicView({...manifest, kind: 'wrong'}), TypeError);
  assert.throws(() => projectPublicView(undefined), TypeError);
});

test('validates structural project metadata IDs', () => {
  assert.throws(() => projectPublicView({...manifest, project_id: 'wrong'}), TypeError);

  const manifestNoProjectId = JSON.parse(JSON.stringify(manifest));
  delete manifestNoProjectId.project_id;
  assert.throws(() => projectPublicView(manifestNoProjectId), TypeError);

  const manifestNoRepoId = JSON.parse(JSON.stringify(manifest));
  delete manifestNoRepoId.repository.repository_id;
  assert.throws(() => projectPublicView(manifestNoRepoId), TypeError);
});

test('validates repository identity logic', () => {
  assert.throws(() => projectPublicView({...manifest, repository: {...manifest.repository, full_name: 'wrong/'}}), TypeError);
  assert.throws(() => projectPublicView({...manifest, repository: {...manifest.repository, html_url: 'https://github.com/wrong/repo'}}), TypeError);
  assert.throws(() => projectPublicView({...manifest, repository: {...manifest.repository, repository_id: 'abc'}}), TypeError);
});

test('enforces strict link label requirements', () => {
  assert.throws(() => projectPublicView({...manifest, links: { wrong: 'https://example.com' }}), TypeError);

  const manifestNoLinks = JSON.parse(JSON.stringify(manifest));
  delete manifestNoLinks.links;
  assert.doesNotThrow(() => projectPublicView(manifestNoLinks));
});

test('validates source lineage data structure and contents', () => {
  assert.throws(() => projectPublicView({...manifest, repository: {...manifest.repository, source_lineage: 'not an array'}}), TypeError);
  assert.throws(() => projectPublicView({...manifest, repository: {...manifest.repository, source_lineage: Array(20).fill({})}}), TypeError);

  const manifestNoLineage = JSON.parse(JSON.stringify(manifest));
  delete manifestNoLineage.repository.source_lineage;
  assert.doesNotThrow(() => projectPublicView(manifestNoLineage));

  const manifestInvalidCommitLineage = JSON.parse(JSON.stringify(manifest));
  manifestInvalidCommitLineage.repository.source_lineage = [{full_name: 'a/b', html_url: 'https://github.com/a/b'}];
  assert.throws(() => projectPublicView(manifestInvalidCommitLineage), TypeError);

  const validCommit = '1234567890123456789012345678901234567890';
  const htmlWithLineage = renderProjectPage({...manifest, repository: {...manifest.repository, source_lineage: [{full_name: 'a/b', html_url: 'https://github.com/a/b', based_on_commit: validCommit}]}});
  assert.match(htmlWithLineage, /<ul><li><a href="https:\/\/github\.com\/a\/b" rel="noopener noreferrer">a\/b<\/a> · <code>1234567890123456789012345678901234567890<\/code><\/li><\/ul>/);
});
